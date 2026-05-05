import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const donorPayloadSchema = z.object({
  name: z.string().trim().min(3),
  email: z.string().trim().email(),
  phone: z.string().trim().min(10),
  city: z.string().trim().min(2),
  address: z.string().trim().min(8),
  blood_group: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
});

function missingSupabaseResponse() {
  return NextResponse.json(
    {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    },
    { status: 503 }
  );
}

export async function POST(request) {
  if (!isSupabaseConfigured) {
    return missingSupabaseResponse();
  }

  const body = await request.json();
  const parsed = donorPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid donor payload.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const donorRecord = {
    ...parsed.data,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("blood_donors")
    .insert([donorRecord])
    .select("id, name, email, phone, city, address, blood_group, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ donor: data }, { status: 201 });
}

export async function GET(request) {
  if (!isSupabaseConfigured) {
    return missingSupabaseResponse();
  }

  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const bloodGroup = searchParams.get("blood_group");

  if (!city || !bloodGroup) {
    return NextResponse.json(
      { error: "city and blood_group query params are required." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("blood_donors")
    .select("id, name, email, phone, city, address, blood_group, created_at")
    .eq("city", city)
    .eq("blood_group", bloodGroup)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ donors: data || [] });
}
