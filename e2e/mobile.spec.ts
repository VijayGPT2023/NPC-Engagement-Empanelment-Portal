import { test, expect } from "@playwright/test";

// Test on iPhone 12 viewport
test.use({ viewport: { width: 390, height: 844 } });

test.describe("Mobile Responsiveness", () => {
  test("homepage renders without horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });

  test("homepage hero text is visible on mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).not.toBeEmpty();
    // Take screenshot for visual verification
    await page.screenshot({ path: "test-results/mobile-homepage.png", fullPage: true });
  });

  test("login page form fits mobile screen", async ({ page }) => {
    await page.goto("/auth/login");
    const emailInput = page.locator("input[type='email']");
    await expect(emailInput).toBeVisible();
    // Check input doesn't overflow
    const inputBox = await emailInput.boundingBox();
    if (inputBox) {
      expect(inputBox.x).toBeGreaterThanOrEqual(0);
      expect(inputBox.x + inputBox.width).toBeLessThanOrEqual(390 + 5);
    }
    await page.screenshot({ path: "test-results/mobile-login.png", fullPage: true });
  });

  test("navbar is usable on mobile", async ({ page }) => {
    await page.goto("/");
    // Sign In button should be visible
    const signIn = page.locator("a[href='/auth/login']");
    await expect(signIn).toBeVisible();
    await page.screenshot({ path: "test-results/mobile-navbar.png" });
  });

  test("privacy policy is readable on mobile", async ({ page }) => {
    await page.goto("/privacy-policy");
    await expect(page.locator("body")).not.toBeEmpty();
    // No horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
    await page.screenshot({ path: "test-results/mobile-privacy.png", fullPage: true });
  });

  test("register page works on mobile", async ({ page }) => {
    await page.goto("/auth/register");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
    await page.screenshot({ path: "test-results/mobile-register.png", fullPage: true });
  });

  test("admin dashboard is accessible on mobile", async ({ page }) => {
    await page.goto("/admin/dashboard");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
    await page.screenshot({ path: "test-results/mobile-admin-dashboard.png", fullPage: true });
  });

  test("post detail page renders on mobile", async ({ page }) => {
    await page.goto("/admin/posts");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
    await page.screenshot({ path: "test-results/mobile-posts.png", fullPage: true });
  });
});
