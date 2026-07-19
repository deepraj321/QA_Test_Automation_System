import { AutomationTool, ProgrammingLanguage, InputMode, GenerationResult } from './types';

export interface LanguageInfo {
  id: ProgrammingLanguage;
  name: string;
  icon: string;
  frameworks: string[];
  defaultFramework: string;
}

export const TOOLS = [
  { id: 'playwright' as AutomationTool, name: 'Playwright', desc: 'Modern end-to-end testing with auto-waiting and zero-config setup.' },
  { id: 'selenium' as AutomationTool, name: 'Selenium', desc: 'Industry-standard automation running natively across all major browsers.' }
];

export const PLAYWRIGHT_LANGUAGES: LanguageInfo[] = [
  { id: 'typescript', name: 'TypeScript / JS', icon: 'TS', frameworks: ['Playwright Test', 'Jest', 'Mocha'], defaultFramework: 'Playwright Test' },
  { id: 'python', name: 'Python', icon: 'PY', frameworks: ['pytest', 'unittest'], defaultFramework: 'pytest' },
  { id: 'java', name: 'Java', icon: 'JV', frameworks: ['JUnit 5', 'TestNG'], defaultFramework: 'JUnit 5' },
  { id: 'csharp', name: 'C# (.NET)', icon: 'C#', frameworks: ['NUnit', 'MSTest'], defaultFramework: 'NUnit' }
];

export const SELENIUM_LANGUAGES: LanguageInfo[] = [
  { id: 'java', name: 'Java', icon: 'JV', frameworks: ['JUnit 5', 'TestNG'], defaultFramework: 'JUnit 5' },
  { id: 'python', name: 'Python', icon: 'PY', frameworks: ['pytest', 'unittest'], defaultFramework: 'pytest' },
  { id: 'csharp', name: 'C# (.NET)', icon: 'C#', frameworks: ['NUnit', 'MSTest'], defaultFramework: 'NUnit' },
  { id: 'javascript', name: 'JavaScript (Node)', icon: 'JS', frameworks: ['Jest', 'Mocha'], defaultFramework: 'Jest' },
  { id: 'ruby', name: 'Ruby', icon: 'RB', frameworks: ['RSpec'], defaultFramework: 'RSpec' }
];

export const INPUT_MODES = [
  { id: 'text' as InputMode, name: 'Natural Language', placeholder: 'Describe your test steps in plain English (e.g., "1. Go to target.com, 2. Search for airpods, 3. Add first item to cart, 4. Verify item is in cart")' },
  { id: 'gherk' as InputMode, name: 'Gherkin / BDD', placeholder: 'Feature: User Authentication\n  Scenario: Successful login\n    Given I am on the login page\n    When I enter valid credentials\n    And I click login\n    Then I should see the dashboard' },
  { id: 'recorded' as InputMode, name: 'Action List / JSON', placeholder: 'Paste custom action logs, commands or step arrays (e.g. [{"action": "navigate", "url": "https://example.com"}, {"action": "click", "selector": "#btn-login"}])' },
  { id: 'dom' as InputMode, name: 'HTML / Locators', placeholder: 'Paste raw DOM snippets or specific locators (e.g., "<button id=\'submit\' data-testid=\'login-btn\'>Login</button>" and describe what actions to take on them)' }
];

export const SAMPLES: Record<InputMode, string> = {
  text: `1. Open https://ecommerce-playground.lambdatest.io/index.php?route=account/login
2. Enter email "qa_test_user@example.com" and password "SecurePass123!"
3. Click on the Login button
4. Verify that the user is redirected to the My Account page and the page header displays "My Account"
5. Search for "iPhone" in the top search bar
6. Click on the first product search result
7. Click "Add to Cart" and verify the success toast alert appears
8. Navigate to the Cart page and verify the "iPhone" is in the item table`,

  gherk: `Feature: Shopping Cart E2E Verification
  As a registered customer
  I want to add items to my shopping cart
  So that I can purchase them later

  Scenario: Add product to cart successfully
    Given I navigate to "https://ecommerce-playground.lambdatest.io/index.php?route=account/login"
    And I log in with email "customer@example.com" and password "Pass123!"
    When I search for "iPhone" in the search catalog
    And I click on the first search result product
    And I click the "Add to Cart" button
    Then I should see a success notification "Success: You have added iPhone to your shopping cart!"
    And the cart item counter badge should display "1"`,

  recorded: `[
  {"type": "navigate", "url": "https://ecommerce-playground.lambdatest.io/"},
  {"type": "click", "selector": "span.title", "text": "My Account"},
  {"type": "fill", "selector": "input#input-email", "value": "qa_user@gmail.com"},
  {"type": "fill", "selector": "input#input-password", "value": "TestPass11"},
  {"type": "click", "selector": "input[type='submit']"},
  {"type": "assertVisible", "selector": "div#content h2", "text": "My Account"},
  {"type": "screenshot", "name": "login_success"}
]`,

  dom: `URL: https://example.com/checkout
DOM snippet:
<form id="checkout-form">
  <input type="text" id="billing-first-name" name="firstname" placeholder="First Name" required />
  <input type="text" id="billing-last-name" name="lastname" placeholder="Last Name" required />
  <select id="billing-country">
    <option value="US">United States</option>
  </select>
  <button type="submit" data-testid="place-order-btn">Place Order</button>
</form>

Steps:
1. Fill First Name: "John"
2. Fill Last Name: "Doe"
3. Select Country: "US"
4. Click "Place Order" button and verify that loading spinner is visible.`
};

export const INITIAL_PRESET_RESULT: GenerationResult = {
  summary: "Playwright TypeScript automated script for user login and cart validation.",
  assumptions: [
    "Using @playwright/test runner as the default test harness.",
    "Browser viewport set to 1280x720 pixels.",
    "Default navigation wait conditions set to DOMContentLoaded."
  ],
  files: [
    {
      name: "playwright.config.ts",
      path: "playwright.config.ts",
      language: "typescript",
      content: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://ecommerce-playground.lambdatest.io',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    }
  ],
});`
    },
    {
      name: "LoginPage.ts",
      path: "pages/LoginPage.ts",
      language: "typescript",
      content: `import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  private page: Page;
  private emailInput: Locator;
  private passwordInput: Locator;
  private loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Locators adhering to strict priority guidelines (preferring standard ID attributes)
    this.emailInput = page.locator('input#input-email');
    this.passwordInput = page.locator('input#input-password');
    this.loginButton = page.locator('input[type="submit"]');
  }

  async navigate() {
    console.log('Navigating to login page...');
    await this.page.goto('index.php?route=account/login');
  }

  async login(email: string, pass: string) {
    console.log(\`Logging in user: \${email}\`);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }
}`
    },
    {
      name: "SearchPage.ts",
      path: "pages/SearchPage.ts",
      language: "typescript",
      content: `import { Page, Locator } from '@playwright/test';

export class SearchPage {
  private page: Page;
  private searchBar: Locator;
  private searchButton: Locator;
  private firstProductLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBar = page.locator('input[name="search"]').first();
    this.searchButton = page.locator('button.type-header').first();
    this.firstProductLink = page.locator('.product-layout .caption a').first();
  }

  async searchProduct(name: string) {
    console.log(\`Searching product catalogue for: \${name}\`);
    await this.searchBar.fill(name);
    await this.searchButton.click();
  }

  async selectFirstProduct() {
    console.log('Selecting first matching search result...');
    await this.firstProductLink.click();
  }
}`
    },
    {
      name: "cart.test.ts",
      path: "tests/cart.test.ts",
      language: "typescript",
      content: `import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SearchPage } from '../pages/SearchPage';

test.describe('E2E Cart Suite', () => {
  let loginPage: LoginPage;
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    searchPage = new SearchPage(page);
  });

  test('should login and add first product result to cart', async ({ page }) => {
    // 1. Login user
    await loginPage.navigate();
    await loginPage.login('qa_test_user@example.com', 'SecurePass123!');

    // Verify successful login navigation
    await expect(page).toHaveURL(/route=account\\/account/);
    console.log('User logged in successfully.');

    // 2. Search product
    await searchPage.searchProduct('iPhone');
    await searchPage.selectFirstProduct();

    // 3. Add to cart
    const addToCartBtn = page.locator('button#entry_216842');
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();
    console.log('Clicked Add to Cart.');

    // Verify success modal notification
    const notification = page.locator('div.alert-success');
    await expect(notification).toContainText('Success: You have added');
    console.log('Verification successful: Item added notification visible.');
  });
});`
    }
  ],
  setupInstructions: {
    installCmd: "npm install @playwright/test typescript ts-node @types/node",
    runCmd: "npx playwright test",
    preRequisites: ["Node.js 18+", "Playwright Browsers (npx playwright install)"]
  },
  notes: [
    "Parallel running is pre-configured inside `playwright.config.ts` via the `fullyParallel` parameter.",
    "Trace file recordings and failure screenshots will be saved into the standard `playwright-report/` directory.",
    "To integrate into GitHub actions, configure a workflow running `npx playwright test` after installing browsers."
  ]
};
