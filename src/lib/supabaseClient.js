import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function normalizeSupabaseUrl(url) {
  if (!url) {
    return "";
  }

  const trimmedUrl = url.trim();

  if (/^[a-z0-9-]+$/i.test(trimmedUrl)) {
    return `https://${trimmedUrl}.supabase.co`;
  }

  return trimmedUrl;
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

export const isSupabaseConfigured = Boolean(
  normalizedSupabaseUrl && supabaseAnonKey && isValidUrl(normalizedSupabaseUrl)
);

export const supabase = isSupabaseConfigured
  ? createClient(normalizedSupabaseUrl, supabaseAnonKey)
  : null;
