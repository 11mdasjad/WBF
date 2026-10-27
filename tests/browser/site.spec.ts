import { test, expect } from "@playwright/test";
import fs from "node:fs";
const access = JSON.parse(fs.readFileSync("local-access.json", "utf8"));
const base = process.env.WBF_BASE_URL || "http://127.0.0.1:5173";
const origin = { Origin: base };
test.beforeEach(async ({ page }) => {
  const original = page.goto.bind(page);
  page.goto = async (...args: any[]) => {
    const response = await original(args[0], args[1]);
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    return response;
  };
});
async function login(page: any) {
  await page.goto("/login/");
  await page.getByLabel("Email address").fill(access.email);
  await page.getByLabel(/^Password/).fill(access.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/user\/?$/);
}
test("home renders eight programs, photos and real navigation without runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Empowering",
  );
  await expect(page.locator(".program-card")).toHaveCount(8);
  await expect(page.locator(".story-card")).toHaveCount(3);
  expect(
    await page
      .locator(".hero-photo")
      .evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0),
  ).toBeTruthy();
  await page
    .getByRole("link", { name: "Explore our work", exact: true })
    .click();
  await expect(page).toHaveURL(/our-work/);
  expect(errors).toEqual([]);
});
test("homepage image continues behind the header and sticky navigation remains usable", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator(".hero-photo")).toHaveAttribute(
      "src",
      "/images/community-landscape-banner.png",
    );
    await expect
      .poll(async () => {
        const header = await page.getByRole("banner").boundingBox();
        const photo = await page.locator(".hero-photo").boundingBox();
        return (
          !!header &&
          !!photo &&
          Math.abs(photo.y - header.y) < 1 &&
          photo.y + photo.height > header.y + header.height
        );
      })
      .toBeTruthy();
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(page.getByRole("banner")).toHaveAttribute(
      "data-scrolled",
      "true",
    );
    await page.getByRole("button", { name: "Dashboards", exact: true }).click();
    await expect(
      page.getByRole("link", { name: "Sign in", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.getByRole("banner")).toHaveAttribute(
      "data-scrolled",
      "false",
    );
  }
});
test("header Register stays visible and opens registration across screen sizes", async ({
  page,
}) => {
  for (const width of [320, 390, 601, 768, 901, 1024, 1199, 1360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const register = page
      .getByRole("banner")
      .getByRole("link", { name: "Register", exact: true });
    await expect(register).toBeVisible();
    const header = page.getByRole("banner");
    await expect(
      header.getByText("Non-Profit Organisation", { exact: true }),
    ).toBeVisible();
    const controls = [
      header.getByRole("link", { name: "Location", exact: true }),
      header.getByRole("button", { name: "Dashboards", exact: true }),
      register,
      header.getByRole("link", { name: "Login", exact: true }),
    ];
    let previousRight = 0;
    for (const control of controls) {
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(previousRight);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      previousRight = box!.x + box!.width;
    }
    await register.click();
    await expect(page).toHaveURL(/\/register\/?$/);
    await expect(
      page.getByRole("textbox", { name: /^Email address/ }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBeTruthy();
  }
});
test("header location and login open their destinations and dashboard menu supports Escape", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const header = page.getByRole("banner");
    await header.getByRole("link", { name: "Location", exact: true }).click();
    await expect(page).toHaveURL(/\/contact\/?#office-location$/);
    await expect(page.locator("#office-location")).toBeVisible();
    await header.getByRole("link", { name: "Login", exact: true }).click();
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(
      page.getByRole("textbox", { name: /^Email address/ }),
    ).toBeVisible();
    const dashboards = header.getByRole("button", {
      name: "Dashboards",
      exact: true,
    });
    await dashboards.click();
    await expect(
      header.getByRole("link", { name: "Sign in", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dashboards).toHaveAttribute("aria-expanded", "false");
    await expect(dashboards).toBeFocused();
  }
});
test("home highlights and interest guide lead to the selected WBF programme", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Next highlight", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Learning together.",
  );
  await expect(
    page.getByRole("button", { name: "Show highlight 2" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("link", { name: "Discover skills programmes", exact: true })
    .click();
  await expect(page).toHaveURL(/focus-areas\/women-empowerment/);
  await page.goto("/");
  await page
    .getByLabel("How would you like to take part?")
    .selectOption("partner");
  await page
    .getByRole("link", { name: "Explore this option", exact: true })
    .click();
  await expect(page).toHaveURL(/csr-partnerships/);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Next highlight", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Previous highlight", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Empowering",
  );
});
test("all audited routes return successfully and unexpected routes return 404", async ({
  request,
}) => {
  const inventory = JSON.parse(
    fs.readFileSync("docs/reference-routes.json", "utf8"),
  );
  const entries = Array.isArray(inventory)
    ? inventory
    : inventory.pages || inventory.routes || Object.values(inventory);
  const fromAudit = entries
    .map((x: any) => x.path || x.route || x.url)
    .filter((x: any) => typeof x === "string")
    .map((x: string) => (x.startsWith("http") ? new URL(x).pathname : x));
  const routes = fromAudit.length
    ? fromAudit
    : [
        "/",
        "/about/",
        "/our-work/",
        "/our-approach/",
        "/our-impact/",
        "/our-team/",
        "/donate/",
        "/get-involved/",
        "/become-a-volunteer/",
        "/register/",
        "/profile/",
        "/contact/",
        "/login/",
        "/careers/",
        "/blog/",
        "/events/",
        "/content/",
        "/faq/",
        "/admin/",
        "/volunteering-internships/",
        "/csr-partnerships/",
        "/resources/",
        "/photos/",
        "/videos/",
        "/policies/",
        "/license/",
        "/reports/",
        "/financials/",
        "/tax-exemptions/",
        "/store/",
        "/donate-now/",
        "/faq-2/",
        "/privacy/",
        "/terms/",
        "/refund/",
        "/cookies/",
        "/focus-areas/",
        "/focus-areas/education-skill/",
        "/focus-areas/health-hygiene/",
        "/focus-areas/women-empowerment/",
        "/focus-areas/legal-aid-human-rights/",
        "/focus-areas/sports/",
        "/focus-areas/environment/",
        "/focus-areas/art-culture-heritage/",
        "/focus-areas/sustainable-development-goals/",
        "/user/",
        "/product/",
        "/document/",
      ];
  for (const route of routes) {
    const r = await request.get(route);
    expect(r.status(), route).toBe(200);
  }
  expect((await request.get("/this-route-does-not-exist/")).status()).toBe(404);
});
test("responsive pages fit 390px, 768px and 1440px; mobile navigation opens", async ({
  page,
}) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/our-work/",
      "/contact/",
      "/donate/",
      "/store/",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px ${route}`,
      ).toBeTruthy();
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Our Work", exact: true })
    .click();
  await expect(page).toHaveURL(/our-work/);
});
test("contact form persists a message that the admin can review", async ({
  page,
}) => {
  const subject = "Browser contact " + Date.now();
  await page.goto("/contact/");
  await page.getByLabel("Your name").fill("Browser Test");
  await page.getByLabel("Email address").fill("browser@example.test");
  await page.getByLabel("Subject").fill(subject);
  await page
    .getByLabel("Your message")
    .fill("An integration test of the persistent contact form.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText("Your message is saved");
  await login(page);
  await page.goto("/admin/inbox/");
  await page.getByRole("textbox", { name: "Search records" }).fill(subject);
  await expect(page.locator("tbody")).toContainText(subject);
  await page.getByRole("button", { name: "View", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("An integration test");
  await page.getByRole("dialog").getByLabel("Status").selectOption("resolved");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator("tbody .status")).toHaveText("resolved");
});
test("four-step application submits and admin decision persists to account", async ({
  page,
}) => {
  await login(page);
  await page.goto("/become-a-volunteer/");
  await page.getByLabel("Full name").fill("Browser Application");
  await page.getByLabel("Phone number").fill("+91 9000000000");
  await page.getByLabel("City / location").fill("New Delhi");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Education & skills").check();
  await page
    .getByLabel("Skills you’d like to share")
    .fill("Teaching and community coordination");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Time you can offer").selectOption("1–5 hours/week");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.locator(".reference-number")).toContainText("WBF-VOL-");
  await page.goto("/admin/applications/");
  await page
    .getByRole("textbox", { name: "Search records" })
    .fill("Browser Application");
  await page.getByRole("button", { name: "View", exact: true }).first().click();
  await page.getByRole("dialog").getByLabel("Status").selectOption("approved");
  await page
    .getByLabel("Message visible to applicant")
    .fill("Welcome, browser test volunteer.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.goto("/user/");
  await page.getByRole("button", { name: "Applications", exact: true }).click();
  await expect(page.locator(".account-record .status")).toContainText(
    "approved",
  );
  await expect(page.locator(".application-history")).toContainText(
    "Welcome, browser test volunteer.",
  );
});
test("CMS draft preview and publication appear on the public article route", async ({
  page,
}) => {
  await login(page);
  const slug = "browser-story-" + Date.now();
  await page.goto("/admin/content/");
  await page.getByRole("button", { name: "Create content" }).click();
  await page.getByLabel("Title").fill("Browser-created community story");
  await page.getByLabel("URL slug").fill(slug);
  await page
    .getByLabel("Short introduction")
    .fill("A test of publication through the CMS.");
  await page
    .getByLabel("Main text")
    .fill("This article was created through the administration interface.");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.locator(".editor-preview")).toContainText(
    "Browser-created community story",
  );
  await page.getByRole("button", { name: "Back to editor" }).click();
  await page.getByLabel("Publication status").selectOption("published");
  await page.getByRole("button", { name: "Save published" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/blog/" + slug + "/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Browser-created community story",
  );
  await expect(page.locator(".prose")).toContainText(
    "This article was created",
  );
  const records = await (await page.request.get("/api/admin/content")).json();
  const record = records.items.find((x: any) => x.slug === slug);
  await page.request.delete("/api/admin/content/" + record.id, {
    headers: origin,
  });
});
test("news search, event filtering, product cart and checkout disabled state work", async ({
  page,
}) => {
  await page.goto("/blog/");
  await page.getByRole("textbox", { name: "Search listings" }).fill("Literacy");
  await expect(page.locator(".story-card")).toHaveCount(1);
  await page.goto("/events/");
  await expect(page.locator(".event-card")).toHaveCount(3);
  await page.getByRole("button", { name: "Past", exact: true }).click();
  await expect(page.locator(".event-card")).toHaveCount(6);
  await page.goto("/store/");
  await page
    .getByRole("textbox", { name: "Search products" })
    .fill("Crystal Beaded Bag");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Add Crystal Beaded Bag to bag" })
    .click();
  await page.getByRole("button", { name: "My bag (1)" }).click();
  await expect(page.getByRole("dialog")).toContainText("Crystal Beaded Bag");
  await page.getByRole("button", { name: "Close shopping bag" }).click();
  await page.goto("/donate/");
  await expect(
    page.getByRole("button", { name: "Test checkout not configured" }),
  ).toBeDisabled();
});
test("screenshots of completed desktop/mobile home and admin", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({ path: "outputs/home-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "outputs/home-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  await page.goto("/admin/");
  await expect(page.locator(".admin-stat")).toHaveCount(4);
  await page.screenshot({ path: "outputs/admin-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({ path: "outputs/admin-mobile.png", fullPage: true });
});

test("structured CMS sections preview and publish with visibility controls", async ({
  page,
}) => {
  await login(page);
  const slug = "browser-page-" + Date.now();
  await page.goto("/admin/content/");
  await page.getByRole("button", { name: "Create content" }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Content type")
    .selectOption("page");
  await page.getByLabel(/^Title/).fill("Structured community page");
  await page.getByLabel("URL slug").fill(slug);
  await page.getByRole("button", { name: "Add section" }).click();
  await page.getByLabel("Section heading").fill("A published section");
  await page
    .getByLabel("Section text")
    .fill("This section is rendered from the CMS.");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.locator(".editor-preview")).toContainText(
    "A published section",
  );
  await page.getByRole("button", { name: "Back to editor" }).click();
  await page.getByLabel("Publication status").selectOption("published");
  await page.getByRole("button", { name: "Save published" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/" + slug + "/");
  await expect(page.locator(".cms-section")).toContainText(
    "This section is rendered from the CMS.",
  );
  const records = await (await page.request.get("/api/admin/content")).json();
  const record = records.items.find((x: any) => x.slug === slug);
  await page.request.delete("/api/admin/content/" + record.id, {
    headers: origin,
  });
});
