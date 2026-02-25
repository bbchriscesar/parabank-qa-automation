import { type Page, type Locator, expect } from '@playwright/test';

export class BasePage {
    readonly page: Page;

    // --- Global Navigation (Top Header) ---
    readonly headerHomeLink: Locator;
    readonly headerAboutUsLink: Locator;
    readonly headerContactLink: Locator;

    // --- Left Sidebar Navigation ---
    readonly sidebarAboutUsLink: Locator;
    readonly sidebarServicesLink: Locator;
    readonly sidebarProductsLink: Locator;
    readonly sidebarLocationsLink: Locator;
    readonly sidebarAdminPageLink: Locator;

    // --- Footer Navigation ---
    readonly footerHomeLink: Locator;
    readonly footerAboutUsLink: Locator;
    readonly footerServicesLink: Locator;
    readonly footerContactUsLink: Locator;
    readonly footerSiteMapLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Top header navigation
        this.headerHomeLink = page.locator('li.home a');
        this.headerAboutUsLink = page.locator('li.aboutus a');
        this.headerContactLink = page.locator('li.contact a');

        // Left sidebar navigation
        this.sidebarAboutUsLink = page.locator('#headerPanel a[href*="about.htm"]');
        this.sidebarServicesLink = page.locator('#headerPanel a[href*="services.htm"]');
        this.sidebarProductsLink = page.locator('#headerPanel a[href*="parasoft.com/jsp/products.jsp"]');
        this.sidebarLocationsLink = page.locator('#headerPanel a[href*="parasoft.com/jsp/pr/contacts.jsp"]');
        this.sidebarAdminPageLink = page.locator('#headerPanel a[href*="admin.htm"]');

        // Footer navigation
        this.footerHomeLink = page.locator('#footerPanel a[href*="index.htm"]');
        this.footerAboutUsLink = page.locator('#footerPanel a[href*="about.htm"]');
        this.footerServicesLink = page.locator('#footerPanel a[href*="services.htm"]');
        this.footerContactUsLink = page.locator('#footerPanel a[href*="contact.htm"]');
        this.footerSiteMapLink = page.locator('#footerPanel a[href*="sitemap.htm"]');
    }

    /**
     * Navigate to a specific path relative to baseURL.
     */
    async navigate(path: string): Promise<void> {
        await this.page.goto(path);
    }

    /**
     * Get the page title.
     */
    async getTitle(): Promise<string> {
        return await this.page.title();
    }

    /**
     * Assert the page title contains the expected text.
     */
    async expectTitleContains(text: string): Promise<void> {
        await expect(this.page).toHaveTitle(new RegExp(text));
    }

    /**
     * Wait for the page to finish loading network activity.
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }
}
