import { test, expect } from "@playwright/test";

test.describe("CourtGrid E2E Smoke Tests", () => {
  test("Homepage loads with branding and navigation", async ({ page }) => {
    await page.goto("/id");
    await expect(page).toHaveTitle(/CourtGrid/);
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: /CourtGrid/ })).toBeVisible();
  });

  test("Navigation to About page and responsive stat cards", async ({ page }) => {
    await page.goto("/id/about");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const qrTicket = page.getByText("QR E-Ticket");
    await expect(qrTicket).toBeVisible();
  });

  test("Clicking Beranda scrolls to top when scrolled down", async ({ page }) => {
    await page.goto("/id");
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(300);

    const berandaLink = page.locator("header nav").first().getByRole("link", { name: "Beranda" });
    await berandaLink.click();
    await page.waitForTimeout(800);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });
});
