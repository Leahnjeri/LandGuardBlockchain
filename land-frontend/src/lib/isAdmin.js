export const ADMIN_EMAILS = new Set([
"admin@landguard.co.ke",   // replace with your real admin email(s)     // example — put your admin email here
]);

export function isAdminEmail(email) {
  return ADMIN_EMAILS.has((email || "").toLowerCase().trim());
}
