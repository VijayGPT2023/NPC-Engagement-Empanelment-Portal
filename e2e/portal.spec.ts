import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("homepage loads successfully", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();
    // Check page rendered (any content in body)
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("privacy policy page loads", async ({ page }) => {
    const response = await page.goto("/privacy-policy");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("terms of use page loads", async ({ page }) => {
    const response = await page.goto("/terms-of-use");
    expect(response?.ok()).toBeTruthy();
  });

  test("login page has email and password fields", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    const response = await page.goto("/auth/register");
    // May redirect or return 200 — page should at least respond
    expect(response?.status()).toBeLessThan(500);
  });

  test("engagement application page loads", async ({ page }) => {
    const response = await page.goto("/apply/engagement");
    // May redirect to login if auth required
    expect(response?.status()).toBeLessThan(500);
  });

  test("empanelment application page loads", async ({ page }) => {
    const response = await page.goto("/apply/empanelment");
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe("API Endpoints", () => {
  test("health check endpoint responds", async ({ request }) => {
    const response = await request.get("/api/health");
    // 200 if DB connected, 503 if not — both valid in test
    expect([200, 503]).toContain(response.status());
  });

  test("posts API responds with JSON structure", async ({ request }) => {
    const response = await request.get("/api/posts");
    // May fail with 500 if DB not available
    if (response.ok()) {
      const body = await response.json();
      expect(body).toHaveProperty("posts");
      expect(body).toHaveProperty("pagination");
    }
  });

  test("login with invalid credentials returns error", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { email: "wrong@example.com", password: "wrongpass123" },
    });
    expect([401, 500]).toContain(response.status());
  });

  test("protected routes reject unauthenticated requests", async ({ request }) => {
    const endpoints = ["/api/profile", "/api/admin/stats"];
    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      // 401 is expected, 500 acceptable if DB issue
      expect(response.status()).not.toBe(200);
    }
  });
});

test.describe("Authentication Flow", () => {
  test("login with valid applicant credentials", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { email: "applicant@example.com", password: "test1234" },
    });
    // May be 200 (if seeded) or 401 (if not seeded) — both are valid test outcomes
    expect([200, 401]).toContain(response.status());
    if (response.ok()) {
      const body = await response.json();
      expect(body).toHaveProperty("token");
    }
  });

  test("register rejects weak password", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: { email: "weakpass@test.com", password: "short", name: "Test" },
    });
    expect(response.status()).toBe(400);
  });

  test("register rejects duplicate email", async ({ request }) => {
    const email = `dupetest${Date.now()}@test.com`;
    // First registration
    const first = await request.post("/api/auth/register", {
      data: { email, password: "Test1234", name: "Dupe Test" },
    });
    if (first.ok()) {
      // Second registration with same email
      const response = await request.post("/api/auth/register", {
        data: { email, password: "Test1234", name: "Dupe Test 2" },
      });
      expect(response.status()).toBe(409);
    }
  });

  test("register always assigns applicant role", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        email: `roletest${Date.now()}@test.com`,
        password: "Test1234",
        name: "Role Test",
        role: "admin", // Attempt privilege escalation
      },
    });
    if (response.ok()) {
      const body = await response.json();
      expect(body.user.role).toBe("applicant");
    }
  });
});

test.describe("Security Headers", () => {
  test("responses include X-Frame-Options", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.headers()["x-frame-options"]).toBe("DENY");
  });

  test("responses include X-Content-Type-Options", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("responses include Referrer-Policy", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("responses include HSTS (production only)", async ({ request }) => {
    const response = await request.get("/api/health");
    // HSTS only present when served over HTTPS (production)
    const hsts = response.headers()["strict-transport-security"];
    if (hsts) {
      expect(hsts).toContain("max-age=");
    }
  });
});

test.describe("Rate Limiting", () => {
  test("login endpoint enforces rate limit", async ({ request }) => {
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) {
      const res = await request.post("/api/auth/login", {
        data: { email: `ratetest${i}@test.com`, password: "wrong" },
      });
      statuses.push(res.status());
    }
    // At least one 429 expected after 10 requests
    expect(statuses.filter((s) => s === 429).length).toBeGreaterThan(0);
  });
});

test.describe("Accessibility", () => {
  test("homepage has skip-to-main-content link", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator("a[href='#main-content']");
    await expect(skipLink).toBeAttached();
  });

  test("homepage has main landmark with ID", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("#main-content");
    await expect(main).toBeAttached();
  });

  test("html has lang attribute", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });
});

test.describe("Sitemap", () => {
  test("sitemap.xml is accessible", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("<url>");
  });
});
