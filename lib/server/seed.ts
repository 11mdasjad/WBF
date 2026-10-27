import { focusAreas, navigation } from "../content";
import imported from "./reference-seed.json";
export const defaults = {
  name: "Well Being Foundation",
  email: "info@wbfngo.org",
  phone: "+91 9891129635",
  phone2: "+91 9555822425",
  address:
    "E-26 White House Business Tower, Khizrabad, New Friends Colony, New Delhi 110025",
  hours: "Monday–Saturday, 10:00 AM–6:00 PM IST",
  heroTitle: "Empowering Communities\nfor a Brighter Tomorrow.",
  heroText:
    "Together, we create opportunities for people to learn, thrive, and build a more inclusive and sustainable future.",
  heroImage: "/images/community-learning-hero.jpg",
  mission:
    "To support communities through education, health, skills and opportunities for lasting change.",
  vision:
    "A future where every person has the opportunity to live with dignity and reach their potential.",
  about:
    "Well Being Foundation works with communities across education, health, women’s empowerment and sustainable development. Its approach brings local participation and practical action together.",
  registration:
    "Registration no. 1018, dated 1 June 2015, as published by WBF.",
  socialInstagram: "https://www.instagram.com/wbfngo/",
  socialFacebook: "https://www.facebook.com/wbfngo/",
  socialLinkedin: "",
  maintenance: false,
  footerText:
    "Working alongside communities to make opportunity, dignity, and well-being part of everyday life.",
  navigation: navigation.map(([label, href]) => ({
    label,
    href,
    visible: true,
  })),
};
const now = "2026-10-24T00:00:00.000Z";
export async function seed(db: D1Database) {
  // Upgrade existing installations without reseeding their content or settings.
  if (
    !(await db
      .prepare("SELECT id FROM settings WHERE id='store-access-v1'")
      .first())
  ) {
    await db.batch([
      db.prepare(
        "INSERT OR IGNORE INTO permissions(id,name) VALUES('products','Product listings')",
      ),
      db.prepare(
        "INSERT OR IGNORE INTO roles(id,name) VALUES('store_employee','Store employee')",
      ),
      db.prepare(
        "INSERT OR IGNORE INTO roles(id,name) VALUES('admin','admin')",
      ),
      db.prepare(
        "INSERT OR IGNORE INTO role_permissions(id,role_id,permission_id) VALUES('store_employee-products','store_employee','products')",
      ),
      db.prepare(
        "INSERT OR IGNORE INTO role_permissions(id,role_id,permission_id) VALUES('admin-products','admin','products')",
      ),
      db
        .prepare(
          "INSERT OR IGNORE INTO settings(id,value,updated_at) VALUES('store-access-v1','true',?)",
        )
        .bind(new Date().toISOString()),
    ]);
  }

  if (await db.prepare("SELECT id FROM settings WHERE id='seed-v1'").first())
    return;
  const rows: any[] = [
    ...focusAreas.map((f, i) => ({
      id: "program-" + f[0],
      kind: "program",
      slug: f[0],
      title: f[1],
      summary: f[2],
      body:
        f[3] +
        "\n\nExplore this focus area with WBF and get in touch to learn about current participation opportunities.",
      image: "/images/" + f[5] + ".jpg",
      category: f[1],
      sort: i,
      data: { icon: f[4] },
      source: "https://wbfngo.org/focus-areas/" + f[0] + "/",
    })),
    ...imported,
  ];
  const statements = rows.map((r) =>
    db
      .prepare(
        "INSERT OR IGNORE INTO content (id,kind,slug,title,summary,body,image,category,status,sort,data,source,published_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .bind(
        r.id,
        r.kind,
        r.slug,
        r.title,
        r.summary || "",
        r.body || "",
        r.image || "",
        r.category || "",
        "published",
        r.sort || 0,
        JSON.stringify(r.data || {}),
        r.source || "",
        r.published_at || now,
        now,
        now,
      ),
  );
  statements.push(
    db
      .prepare(
        "INSERT OR IGNORE INTO settings(id,value,updated_at) VALUES (?,?,?)",
      )
      .bind("organization", JSON.stringify(defaults), now),
  );
  const roles: Record<string, string[]> = {
    member: [],
    volunteer: [],
    staff: ["applications", "inbox"],
    editor: ["content", "media"],
    donation_manager: ["donations"],
    volunteer_manager: ["applications"],
    store_employee: ["products"],
    admin: [
      "products",
      "content",
      "media",
      "applications",
      "donations",
      "inbox",
      "users",
      "settings",
      "audit",
      "notifications",
    ],
  };
  for (const perm of roles.admin)
    statements.push(
      db
        .prepare("INSERT OR IGNORE INTO permissions(id,name) VALUES(?,?)")
        .bind(perm, perm),
    );
  for (const [role, perms] of Object.entries(roles)) {
    statements.push(
      db
        .prepare("INSERT OR IGNORE INTO roles(id,name) VALUES(?,?)")
        .bind(role, role),
    );
    for (const perm of perms)
      statements.push(
        db
          .prepare(
            "INSERT OR IGNORE INTO role_permissions(id,role_id,permission_id) VALUES(?,?,?)",
          )
          .bind(role + "-" + perm, role, perm),
      );
  }
  for (let i = 0; i < statements.length; i += 50)
    await db.batch(statements.slice(i, i + 50));
  await db
    .prepare(
      "INSERT OR IGNORE INTO settings(id,value,updated_at) VALUES(?,?,?)",
    )
    .bind("seed-v1", "true", now)
    .run();
}
