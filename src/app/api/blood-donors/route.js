import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const donorPayloadSchema = z.object({
  name: z.string().trim().min(3),
  email: z.string().trim().email(),
  phone: z.string().trim().min(10),
  city: z.string().trim().min(2),
  address: z.string().trim().min(8),
  blood_group: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
});

export async function POST(request) {
  const body = await request.json();
  const parsed = donorPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid donor payload.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const donor = await prisma.bloodDonor.create({
      data: {
        address: parsed.data.address,
        bloodGroup: parsed.data.blood_group,
        city: parsed.data.city,
        email: parsed.data.email,
        name: parsed.data.name,
        phone: parsed.data.phone,
      },
    });

    return NextResponse.json(
      {
        donor: {
          address: donor.address,
          blood_group: donor.bloodGroup,
          city: donor.city,
          created_at: donor.createdAt,
          email: donor.email,
          id: donor.id,
          name: donor.name,
          phone: donor.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to save donor details." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const bloodGroup = searchParams.get("blood_group");

  if (!city || !bloodGroup) {
    return NextResponse.json(
      { error: "city and blood_group query params are required." },
      { status: 400 }
    );
  }

  try {
    const donors = await prisma.bloodDonor.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        bloodGroup,
        city,
      },
    });

    return NextResponse.json(
      {
        donors: donors.map((donor) => ({
          address: donor.address,
          blood_group: donor.bloodGroup,
          city: donor.city,
          created_at: donor.createdAt,
          email: donor.email,
          id: donor.id,
          name: donor.name,
          phone: donor.phone,
        })),
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to search donors." },
      { status: 500 }
    );
  }
}
