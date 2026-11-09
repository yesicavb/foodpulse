/**
 * Password hash for the DEMO login saved on the device.
 * This is not a real authentication system: in production, login goes through a
 * dedicated service (e.g. Supabase Auth) and passwords are not kept in the browser.
 */
export async function hashPassword(email: string, password: string) {
  const input = `foodpulse:${email.toLowerCase()}:${password}`;
  try {
    const bytes = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    // environment without Web Crypto: simple hash, good enough for a local demo
    let h = 5381;
    for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
    return `djb2-${(h >>> 0).toString(16)}`;
  }
}
