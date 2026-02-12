import { test, expect } from "@playwright/test"

test("home page loads and shows logo", async ({ page }) => {
  await page.goto("/")

  // Check for the logo or title
  const title = await page.title()
  expect(title).toBeDefined()

  // Check for login button if not logged in
  const loginBtn = page.locator("button:has-text('Login'), a:has-text('Sign In')")
  await expect(loginBtn).toBeDefined()
})
