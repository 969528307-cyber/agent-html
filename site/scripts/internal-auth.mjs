export const INTERNAL_AUTH_COOKIE = "agentkit_internal_session";
export const INTERNAL_CSRF_COOKIE = "agentkit_internal_csrf";

export const getInternalPassword = (env = process.env) =>
  env.INTERNAL_AUTH_PASSWORD || "";

export const isInternalRequestPath = (pathname = "") =>
  pathname === "/internal" ||
  pathname.startsWith("/internal/") ||
  pathname.startsWith("/internal-api/");

export const isAuthFreePath = (pathname = "") =>
  pathname === "/internal/login" ||
  pathname === "/internal-auth/login" ||
  pathname === "/internal-auth/logout";

export const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf("=");
        if (index === -1) return [cookie, ""];
        return [cookie.slice(0, index), decodeURIComponent(cookie.slice(index + 1))];
      })
  );

export const isAuthenticated = ({ cookieHeader = "", sessionToken }) => {
  if (!sessionToken) return false;
  return parseCookies(cookieHeader)[INTERNAL_AUTH_COOKIE] === sessionToken;
};

export const isCsrfValid = ({ cookieHeader = "", csrfHeader = "" }) => {
  const cookieToken = parseCookies(cookieHeader)[INTERNAL_CSRF_COOKIE];
  return Boolean(cookieToken && csrfHeader && cookieToken === csrfHeader);
};

export const safeNextPath = (next = "/internal") => {
  if (typeof next !== "string" || !next.startsWith("/")) return "/internal";
  if (next.startsWith("//")) return "/internal";
  if (next.startsWith("/internal-auth/")) return "/internal";
  return next;
};
