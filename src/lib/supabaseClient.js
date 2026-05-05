const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function normalizeSupabaseUrl(url) {
  if (!url) {
    return "";
  }

  const trimmedUrl = url
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/g, "");

  if (/^[a-z0-9-]+$/i.test(trimmedUrl)) {
    return `https://${trimmedUrl}.supabase.co`;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    return `${parsedUrl.protocol}//${parsedUrl.host}`;
  } catch {
    return trimmedUrl;
  }
}

function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

export const normalizedSupabaseUrl = normalizeSupabaseUrl(supabaseUrl);
export const normalizedSupabaseAnonKey = supabaseAnonKey?.trim() || "";

export const isSupabaseConfigured = Boolean(
  normalizedSupabaseUrl &&
    normalizedSupabaseAnonKey &&
    isValidUrl(normalizedSupabaseUrl)
);

export function getSupabaseRestUrl(path = "") {
  const cleanPath = path.replace(/^\/+/g, "");
  return `${normalizedSupabaseUrl}/rest/v1/${cleanPath}`;
}

export async function supabaseRestFetch(path, options = {}) {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const headers = {
    apikey: normalizedSupabaseAnonKey,
    Authorization: `Bearer ${normalizedSupabaseAnonKey}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  return fetch(getSupabaseRestUrl(path), {
    ...options,
    headers,
  });
}
