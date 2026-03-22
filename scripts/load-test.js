import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const loginDuration = new Trend("login_duration");
const dashboardDuration = new Trend("dashboard_duration");
const postsApiDuration = new Trend("posts_api_duration");

// Configuration
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "30s", target: 20 },   // Ramp up to 20 users
    { duration: "1m", target: 50 },    // Ramp to 50 users
    { duration: "2m", target: 100 },   // Ramp to 100 users
    { duration: "1m", target: 100 },   // Stay at 100
    { duration: "30s", target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],  // 95% of requests < 2s
    errors: ["rate<0.1"],               // Error rate < 10%
    login_duration: ["p(95)<3000"],     // Login < 3s
  },
};

// Test data
const TEST_USERS = [
  { email: "applicant@example.com", password: "test1234" },
  { email: "admin@npcindia.gov.in", password: "admin123" },
];

export default function () {
  const user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];

  group("Public Pages", () => {
    // Homepage
    const homeRes = http.get(`${BASE_URL}/`);
    check(homeRes, {
      "homepage status 200": (r) => r.status === 200,
    });
    errorRate.add(homeRes.status !== 200);

    // Public API - list posts
    const postsStart = Date.now();
    const postsRes = http.get(`${BASE_URL}/api/posts`);
    postsApiDuration.add(Date.now() - postsStart);
    check(postsRes, {
      "posts API status 200": (r) => r.status === 200,
      "posts API returns JSON": (r) => {
        try { JSON.parse(r.body); return true; } catch { return false; }
      },
    });
    errorRate.add(postsRes.status !== 200);
  });

  group("Authentication", () => {
    const loginStart = Date.now();
    const loginRes = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({ email: user.email, password: user.password }),
      { headers: { "Content-Type": "application/json" } }
    );
    loginDuration.add(Date.now() - loginStart);

    const loginSuccess = check(loginRes, {
      "login status 200": (r) => r.status === 200,
      "login returns token": (r) => {
        try { return !!JSON.parse(r.body).token; } catch { return false; }
      },
    });
    errorRate.add(!loginSuccess);

    if (loginRes.status === 200) {
      let token;
      try { token = JSON.parse(loginRes.body).token; } catch { return; }
      const authHeaders = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      // Profile
      const profileRes = http.get(`${BASE_URL}/api/profile`, authHeaders);
      check(profileRes, {
        "profile accessible": (r) => r.status === 200 || r.status === 404,
      });

      // Dashboard stats (admin)
      if (user.email.includes("admin")) {
        const dashStart = Date.now();
        const statsRes = http.get(`${BASE_URL}/api/admin/stats`, authHeaders);
        dashboardDuration.add(Date.now() - dashStart);
        check(statsRes, {
          "admin stats accessible": (r) => r.status === 200,
        });
      }
    }
  });

  group("Health Check", () => {
    const healthRes = http.get(`${BASE_URL}/api/health`);
    check(healthRes, {
      "health check status 200": (r) => r.status === 200,
      "health check healthy": (r) => {
        try { return JSON.parse(r.body).status === "healthy"; } catch { return false; }
      },
    });
  });

  sleep(Math.random() * 2 + 1); // Random 1-3s think time
}

export function handleSummary(data) {
  return {
    "scripts/load-test-results.json": JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: "  ", enableColors: true }),
  };
}

function textSummary(data, opts) {
  // k6 has a built-in text summary, this is a fallback
  return JSON.stringify(data.metrics, null, 2);
}
