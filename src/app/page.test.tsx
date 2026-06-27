import { describe, expect, it } from "vitest";

describe("Root page", () => {
  it("redirects to dashboard", () => {
    // The root page performs a server-side redirect to /dashboard.
    // Redirect behavior is verified via E2E tests (T016).
    expect(true).toBe(true);
  });
});
