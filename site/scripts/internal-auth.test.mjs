import assert from "node:assert/strict";
import test from "node:test";

import {
  INTERNAL_CSRF_COOKIE,
  getInternalPassword,
  isCsrfValid,
  isAuthenticated,
  isAuthFreePath,
  isInternalRequestPath,
  safeNextPath,
} from "./internal-auth.mjs";

test("uses configured internal password and does not ship a hardcoded fallback", () => {
  assert.equal(getInternalPassword({ INTERNAL_AUTH_PASSWORD: "secret" }), "secret");
  assert.equal(getInternalPassword({}), "");
});

test("detects protected internal paths", () => {
  assert.equal(isInternalRequestPath("/internal"), true);
  assert.equal(isInternalRequestPath("/internal/candidates"), true);
  assert.equal(isInternalRequestPath("/internal-api/publish-candidate"), true);
  assert.equal(isInternalRequestPath("/item/internal"), false);
});

test("allows auth endpoints without a session", () => {
  assert.equal(isAuthFreePath("/internal/login"), true);
  assert.equal(isAuthFreePath("/internal-auth/login"), true);
  assert.equal(isAuthFreePath("/internal-auth/logout"), true);
  assert.equal(isAuthFreePath("/internal/candidates"), false);
});

test("validates the internal auth cookie", () => {
  assert.equal(isAuthenticated({ cookieHeader: "agentkit_internal_session=abc", sessionToken: "abc" }), true);
  assert.equal(isAuthenticated({ cookieHeader: "agentkit_internal_session=wrong", sessionToken: "abc" }), false);
});

test("validates csrf token from request header and cookie", () => {
  assert.equal(isCsrfValid({ cookieHeader: `${INTERNAL_CSRF_COOKIE}=csrf-1`, csrfHeader: "csrf-1" }), true);
  assert.equal(isCsrfValid({ cookieHeader: `${INTERNAL_CSRF_COOKIE}=csrf-1`, csrfHeader: "wrong" }), false);
  assert.equal(isCsrfValid({ cookieHeader: "", csrfHeader: "csrf-1" }), false);
});

test("keeps login next redirects local", () => {
  assert.equal(safeNextPath("/internal/candidates"), "/internal/candidates");
  assert.equal(safeNextPath("https://example.com"), "/internal");
  assert.equal(safeNextPath("//example.com"), "/internal");
  assert.equal(safeNextPath("/internal-auth/logout"), "/internal");
});
