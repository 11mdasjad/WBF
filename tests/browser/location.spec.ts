import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
});

test("location popup supports aliases, published local links and a remembered city", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Choose location", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  const search = dialog.getByRole("textbox", { name: "Search for your city" });
  await expect(search).toBeFocused();
  await expect(dialog.locator(".location-city")).toHaveCount(5);
  await search.fill("New Delhi");
  await dialog.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    dialog.getByRole("region", { name: "WBF in Delhi" }),
  ).toBeVisible();
  await expect(dialog.locator(".location-office")).toContainText("Khizrabad");
  const activity = dialog.locator(".location-activities a").first();
  await expect(activity).toBeVisible();
  const href = await activity.getAttribute("href");
  expect(href).toMatch(/^\/(events|careers)\/[^/]+\/$/);
  await dialog.getByRole("button", { name: "Use Delhi", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  const trigger = page.getByRole("button", {
    name: "Change location: Delhi",
    exact: true,
  });
  await expect(trigger).toBeFocused();
  await page.reload();
  await expect(trigger).toBeVisible();
  await trigger.click();
  const selectedActivity = dialog.locator(
    `.location-activities a[href="${href}"]`,
  );
  await selectedActivity.click();
  await expect(page).toHaveURL(new RegExp(href!.replace(/\/$/, "") + "/?$"));
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .not.toBe("hidden");
});

test("city search handles all cities, aliases, empty results and locations without listings", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Choose location" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "View all cities" }).click();
  expect(await dialog.locator(".location-city").count()).toBeGreaterThan(40);
  const search = dialog.getByRole("textbox", { name: "Search for your city" });
  await search.fill("Bangalore");
  await expect(dialog.locator(".location-city")).toHaveCount(1);
  await expect(dialog.locator(".location-city")).toContainText("Bengaluru");
  await search.fill("Not a real city xyz");
  await expect(dialog.getByRole("status")).toHaveText("0 cities found");
  await expect(
    dialog.getByRole("heading", { name: "No city found" }),
  ).toBeVisible();
  await search.fill("Mumbai");
  await dialog.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    dialog.getByRole("region", { name: "WBF in Mumbai" }),
  ).toContainText("No local activities are listed here yet");
  await expect(dialog.locator(".location-office")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Clear city search" }).click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
});

test("location dialog traps focus and closes with Escape, close button and backdrop", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Choose location",
    exact: true,
  });
  const dialog = page.getByRole("dialog");
  await trigger.click();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("hidden");
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((e) => e.contains(document.activeElement)),
    ).toBeTruthy();
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .not.toBe("hidden");
  await trigger.click();
  await dialog.getByRole("button", { name: "Close location picker" }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.mouse.click(2, 2);
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("header and city selection fit narrow screens, and a long city name stays contained", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 901, 1024, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/");
    const trigger = page.locator(".masthead-location");
    const box = await trigger.boundingBox();
    const actions = await page.locator(".masthead-actions").boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(actions!.x + 1);
    await trigger.click();
    const dialog = page.getByRole("dialog");
    const search = dialog.getByRole("textbox", {
      name: "Search for your city",
    });
    expect(
      await search.evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
    ).toBeGreaterThanOrEqual(16);
    expect(
      await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
    ).toBeTruthy();
    await search.fill("Thiruvananthapuram");
    await dialog.getByRole("button", { name: "Search", exact: true }).click();
    await dialog
      .getByRole("button", { name: "Use Thiruvananthapuram", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Change location: Thiruvananthapuram" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy();
    const after = await trigger.boundingBox();
    const actionAfter = await page.locator(".masthead-actions").boundingBox();
    expect(after!.x + after!.width).toBeLessThanOrEqual(actionAfter!.x + 1);
    if (width < 901) {
      await page
        .getByRole("button", { name: "Open menu", exact: true })
        .click();
      await expect(
        page.getByRole("navigation", { name: "Main navigation" }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
    }
  }
});

test("location selection still works when browser storage is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalGet = Storage.prototype.getItem;
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === "wbf-preferred-city")
        throw new DOMException("Storage denied", "SecurityError");
      return originalGet.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "wbf-preferred-city")
        throw new DOMException("Storage denied", "SecurityError");
      return originalSet.call(this, key, value);
    };
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Choose location", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "Pune Maharashtra", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Use Pune", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole("button", { name: "Change location: Pune", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Mumbai Maharashtra", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Change location: Pune", exact: true }),
  ).toBeVisible();
});
