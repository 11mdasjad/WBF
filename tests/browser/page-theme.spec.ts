import { test, expect } from "@playwright/test";
import fs from "node:fs";

const inventory = JSON.parse(
  fs.readFileSync("docs/reference-routes.json", "utf8"),
);
const routes: string[] = [
  ...new Set<string>([
    ...inventory.map((entry: { path: string }) => entry.path),
    "/forgot-password/",
    "/reset-password/",
    "/verify-email/",
    "/search/?q=education",
    "/internships/",
    "/internships/apply/",
    "/gallery/",
    "/accessibility/",
    "/donation-policy/",
    "/privacy-policy/",
    "/terms-and-conditions/",
    "/refund-policy/",
    "/blog/empowering-rural-communities-through-literacy/",
    "/events/health-hygiene-awareness-camp/",
    "/careers/digital-communications-associate/",
    "/product/?slug=crystal-beaded-bag",
  ]),
].filter((route) => !["/", "/about/", "/admin/"].includes(route));

for (const width of [390, 1440]) {
  test(`public banners stay readable and fit at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("html")).toHaveAttribute(
        "data-hydrated",
        "true",
      );
      await expect(page.getByRole("heading", { level: 1 }), route).toHaveCount(
        1,
      );
      await expect(page.locator(".page-hero h1"), route).toBeVisible();
      await expect
        .poll(
          () =>
            page
              .locator(".page-hero-photo")
              .evaluate(
                (image: HTMLImageElement) =>
                  image.complete && image.naturalWidth > 0,
              ),
          { message: route },
        )
        .toBeTruthy();
      await expect
        .poll(
          async () => {
            const photo = await page.locator(".page-hero-photo").boundingBox();
            const header = await page.getByRole("banner").boundingBox();
            const heading = await page.locator(".page-hero h1").boundingBox();
            return (
              !!photo &&
              !!header &&
              !!heading &&
              Math.abs(photo.y - header.y) < 2 &&
              heading.y >= header.y + header.height
            );
          },
          { message: `${route} shared photo and unobscured heading` },
        )
        .toBeTruthy();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route,
      ).toBeTruthy();
      if (["/our-work/", "/login/", "/store/", "/privacy/"].includes(route)) {
        await page.screenshot({
          path: `outputs/page-theme/${route.split("/")[1]}-${width}.png`,
        });
      }
    }
    expect(errors).toEqual([]);
  });
}

test("E-Store navigation opens the shop on desktop and mobile", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    if (width === 390)
      await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "E-Store", exact: true })
      .click();
    await expect(page).toHaveURL(/\/store\/?$/);
    await expect(page).toHaveTitle(/E-Store/);
    await expect(
      page.getByRole("textbox", { name: "Search products" }),
    ).toBeVisible();
  }
});

test("missing pages keep a readable recovery panel and working home link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/this-page-does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".error-panel")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBeTruthy();
  await page.screenshot({ path: "outputs/page-theme/not-found-390.png" });
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL("/");
});
