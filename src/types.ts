export type AutomationTool = 'selenium' | 'playwright';

export type SeleniumLanguage = 'java' | 'python' | 'csharp' | 'javascript' | 'ruby';
export type PlaywrightLanguage = 'typescript' | 'python' | 'java' | 'csharp';
export type ProgrammingLanguage = SeleniumLanguage | PlaywrightLanguage;

export type InputMode = 'text' | 'gherk' | 'recorded' | 'dom';

export interface GeneratorConfig {
  tool: AutomationTool;
  language: ProgrammingLanguage;
  framework: string; // e.g., 'JUnit5', 'pytest', 'NUnit', 'Mocha', 'Playwright Test'
  inputMode: InputMode;
  inputContent: string;
  usePom: boolean;
  browser: 'chrome' | 'firefox' | 'edge' | 'webkit';
  headless: boolean;
  timeout: number;
  assertionStyle: 'native' | 'bdd';
  includeScreenshots: boolean;
  ciCdProvider: 'none' | 'github' | 'gitlab' | 'jenkins';
  dataDriven: boolean;
  parallelExecution: boolean;
}

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: string; // For editor syntax highlighting hint
}

export interface SetupInstructions {
  installCmd: string;
  runCmd: string;
  preRequisites: string[];
}

export interface GenerationResult {
  summary: string;
  assumptions: string[];
  files: GeneratedFile[];
  setupInstructions: SetupInstructions;
  notes: string[];
}
