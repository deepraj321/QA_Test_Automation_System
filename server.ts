import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Endpoint to generate automation tests
app.post('/api/generate', async (req, res) => {
  try {
    const config = req.body;
    
    if (!config || !config.tool || !config.language || !config.inputContent) {
      return res.status(400).json({ error: 'Missing required configuration parameters.' });
    }

    const {
      tool,
      language,
      framework,
      inputMode,
      inputContent,
      usePom,
      browser,
      headless,
      timeout,
      assertionStyle,
      includeScreenshots,
      ciCdProvider,
      dataDriven,
      parallelExecution
    } = config;

    // Build model prompt
    const systemInstruction = `You are a Senior Staff Software Development Engineer in Test (SDET) and a Lead Test Automation Architect.
Your task is to generate complete, ready-to-run, and production-ready test scripts or full test suites following industry-leading best practices.
You must strictly conform to the user's requirements and output a clean JSON matching the requested schema.

Depending on the scope:
1. SINGLE SCRIPT (usePom = false):
   - Output one self-contained, fully operational test file.
   - Include imports, complete browser setup, locator strategies, test actions, explicit wait logic, test assertions, and proper teardown (closing driver/browser).
   
2. PAGE OBJECT MODEL SUITE (usePom = true):
   - Output a full suite representing a professional Page Object Model (POM) folder/file structure.
   - Generate multiple files:
     - Pages (e.g., base page, login page, dashboard page, containing locators and action methods).
     - Tests (e.g., tests that utilize those page objects, following testing framework styles).
     - Base Class/Fixture (handling driver/browser setup, teardown, hooks).
     - Configuration File (e.g., playwright.config.ts, pytest.ini, or custom properties/json).
     - Dependency Manifest (e.g., requirements.txt, package.json, pom.xml, .csproj, Gemfile).
     - README.md detailing the layout and how to run it.

IDOMATIC COMBINATIONS & STANDARDS:
- Selenium Java: Use JUnit 5 (default) or TestNG. Standard is camelCase methods, WebDriver setups, explicit WebDriverWait.
- Selenium Python: Use pytest. Use snake_case, pytest fixtures, and proper explicit wait wrappers.
- Selenium C#: Use NUnit, PascalCase, explicit WebDriverWait, and driver factories.
- Selenium JS/TS (Node): Use Mocha or Jest, standard camelCase, async/await, and explicit wait wrappers.
- Selenium Ruby: Use RSpec, snake_case, Capybara/Selenium driver setup.
- Playwright TypeScript/JavaScript: Use native @playwright/test runner, Playwright's native config, auto-waiting, explicit 'expect()' assertions.
- Playwright Python: Use pytest-playwright, snake_case, pytest fixtures.
- Playwright Java: Use JUnit 5/TestNG, Playwright Java library, proper BrowserContext isolation.
- Playwright C# (.NET): Use NUnit, Microsoft.Playwright library, proper Task/async/await.

ADDITIONAL RULES:
- Locators Strategy Fallback: Prefer data-testid/id > CSS selectors > XPaths as last resort. Comment why a specific locator was selected.
- No Hardcoded sleeps: NEVER generate 'Thread.sleep()', 'time.sleep()', or similar hardcoded delays. Use proper explicit wait conditions (Selenium) or native auto-waiting / expectations (Playwright).
- Logging: Add console logging at critical steps (e.g., "Navigating to Login Page...", "Entering username...", "Verifying successful login...").
- Failure Handling & Screenshots: Include built-in screenshot-on-failure hooks by default (or as configured) to save screenshots to a 'screenshots/' directory.
- CI/CD Readiness: If requested, generate a valid YAML/XML pipeline file (e.g., '.github/workflows/automation.yml') in the list of files.
- Data-driven Support: If requested, parameterize the inputs using standard files (e.g., JSON/CSV configuration files) and generate a test that iterates through those datasets.
- Parallel Execution: If requested, configure the suite to support parallel run options (e.g., multi-worker playwright configuration or TestNG suite xml configuration).`;

    const userPrompt = `Generate a high-quality ${usePom ? 'Page Object Model (POM) Test Suite' : 'Single Test Script'} with the following specifications:
- Automation Tool: ${tool}
- Programming Language: ${language}
- Testing Framework: ${framework}
- Input Mode: ${inputMode} (User provided: "${inputContent}")
- POM Pattern Enabled: ${usePom ? 'YES (Generate full POM directory structure)' : 'NO (Generate single self-contained script)'}
- Target Browser: ${browser}
- Headless Mode: ${headless ? 'Enabled' : 'Disabled'}
- Sync/Timeout Strategy: Explicit waiting, default timeout of ${timeout} seconds.
- Assertion Style: ${assertionStyle === 'native' ? 'Native tool/runner assertions (e.g., expect for Playwright, Assert/JUnit assertions for Selenium)' : 'BDD/Fluent assertion libraries (e.g., Hamcrest, AssertJ, Chai, or pytest-bdd style)'}
- Capture Screenshots on Failure: ${includeScreenshots ? 'Yes (configured in test hooks/fixtures)' : 'No'}
- CI/CD Integration: ${ciCdProvider !== 'none' ? `Include pipeline configuration file for ${ciCdProvider}` : 'None'}
- Data-Driven Testing: ${dataDriven ? 'Yes, provide a data file (CSV/JSON) and a test utilizing it' : 'No'}
- Parallel Execution: ${parallelExecution ? 'Yes, configure parallel runs in settings/config files' : 'No'}

Please generate a professional, fully functional, executable set of files. Ensure all imports are accurate and deprecated library APIs are avoided. Include detailed comments in the code explaining the wait strategy, locator design, and assertion mechanics.`;

    // Prompt Gemini with strict JSON schema response matching GenerationResult
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A 1-2 line summary confirming the chosen tool, language, framework, and POM vs script scope."
            },
            assumptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Any gaps or details assumed during code generation (e.g., standard libraries used, viewport dimensions, etc.)."
            },
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Just the filename, e.g., LoginPage.py or playwright.config.ts" },
                  path: { type: Type.STRING, description: "Relative file path representing the project directory structure, e.g., pages/LoginPage.py or tests/test_login.py" },
                  content: { type: Type.STRING, description: "Complete, production-ready, well-commented source code for this file." },
                  language: { type: Type.STRING, description: "Editor language tag for syntax highlighting, e.g., python, java, typescript, javascript, csharp, ruby, yaml, json, markdown" }
                },
                required: ["name", "path", "content", "language"]
              }
            },
            setupInstructions: {
              type: Type.OBJECT,
              properties: {
                installCmd: { type: Type.STRING, description: "The terminal command to install all dependencies (e.g. pip install -r requirements.txt or npm install)" },
                runCmd: { type: Type.STRING, description: "The terminal command to execute the tests (e.g. pytest or npx playwright test)" },
                preRequisites: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of system requirements (e.g., Node.js 18+, Python 3.9+, JDK 17+)"
                }
              },
              required: ["installCmd", "runCmd", "preRequisites"]
            },
            notes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Tips on CI/CD integrations, report dashboards (e.g., Allure), custom locators, or future scaling."
            }
          },
          required: ["summary", "assumptions", "files", "setupInstructions", "notes"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini returned an empty response.');
    }

    const data = JSON.parse(responseText.trim());
    res.json(data);

  } catch (error: any) {
    console.error('Error generating automation script:', error);
    res.status(500).json({ error: error.message || 'An error occurred during test automation generation.' });
  }
});

// Start Vite dev server in development, serve static files in production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Test Automation Generator server running on http://localhost:${PORT}`);
  });
}

start();
