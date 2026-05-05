"use client";

import {
  ChevronDown,
  Droplets,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

const cities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sialkot",
  "Gujranwala",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Abbottabad",
];

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function normalizePhoneForWhatsApp(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.startsWith("92")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `92${digits.slice(1)}`;
  }

  return digits;
}

export default function DonorSearchDashboard() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [donors, setDonors] = useState([]);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const canSearch = useMemo(
    () => Boolean(bloodGroup && city && !isSearching),
    [bloodGroup, city, isSearching]
  );

  const searchDonors = async (event) => {
    event.preventDefault();
    setError("");
    setHasSearched(true);

    if (!bloodGroup || !city) {
      setError("Select required blood group and city.");
      return;
    }

    if (!isSupabaseConfigured) {
      setDonors([]);
      setError(
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment."
      );
      return;
    }

    setIsSearching(true);

    const { data, error: queryError } = await supabase
      .from("donors")
      .select("id, full_name, email, phone_number, blood_group, city")
      .eq("blood_group", bloodGroup)
      .eq("city", city)
      .order("full_name", { ascending: true });

    if (queryError) {
      setDonors([]);
      setError(queryError.message);
    } else {
      setDonors(data || []);
    }

    setIsSearching(false);
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-red-600 p-5 text-white shadow-xl shadow-red-950/15 sm:p-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-red-600">
              <Droplets aria-hidden="true" className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-100">
                LifeLink Pakistan
              </p>
              <h1 className="mt-1 text-3xl font-black sm:text-4xl">
                Donor Search Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-red-50 sm:text-base">
                Search verified donors by required blood group and city, then
                contact them instantly through WhatsApp or email.
              </p>
            </div>
          </div>
        </div>

        <form
          className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
          onSubmit={searchDonors}
        >
          <label className="grid gap-2">
            <span className="text-sm font-black text-zinc-700">
              Required Blood Group
            </span>
            <span className="relative">
              <Droplets
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
              />
              <select
                className="h-14 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 text-base font-bold text-zinc-950 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                onChange={(event) => setBloodGroup(event.target.value)}
                value={bloodGroup}
              >
                <option value="">Select blood group</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
              />
            </span>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-zinc-700">City</span>
            <span className="relative">
              <MapPin
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
              />
              <select
                className="h-14 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 text-base font-bold text-zinc-950 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                onChange={(event) => setCity(event.target.value)}
                value={city}
              >
                <option value="">Select city</option>
                {cities.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
              />
            </span>
          </label>

          <button
            className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-base font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSearch}
            type="submit"
          >
            <Search aria-hidden="true" className="h-5 w-5" />
            {isSearching ? "Searching..." : "Search Donors"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-zinc-950">
              Matching Donors
            </h2>
            {hasSearched && !error && (
              <p className="text-sm font-bold text-zinc-500">
                {donors.length} result{donors.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          {hasSearched && donors.length === 0 && !error ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <UserRound
                aria-hidden="true"
                className="mx-auto h-10 w-10 text-zinc-400"
              />
              <p className="mt-3 text-lg font-black text-zinc-950">
                No matching donors found.
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-500">
                Try another city or blood group.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {donors.map((donor) => {
                const phoneNumber = normalizePhoneForWhatsApp(
                  donor.phone_number
                );

                return (
                  <article
                    className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-950/10"
                    key={donor.id || `${donor.email}-${donor.phone_number}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-red-700">
                          Donor Name
                        </p>
                        <h3 className="mt-1 text-2xl font-black text-zinc-950">
                          {donor.full_name}
                        </h3>
                      </div>
                      <span className="rounded-lg bg-red-600 px-3 py-2 text-lg font-black leading-none text-white">
                        {donor.blood_group}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-sm font-bold text-zinc-600">
                      <MapPin aria-hidden="true" className="h-4 w-4" />
                      {donor.city}
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <a
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-black text-white transition hover:bg-green-700"
                        href={`https://wa.me/${phoneNumber}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <MessageCircle
                          aria-hidden="true"
                          className="h-4 w-4"
                        />
                        Contact on WhatsApp
                      </a>
                      <a
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 text-sm font-black text-zinc-700 transition hover:bg-zinc-50"
                        href={`mailto:${donor.email}`}
                      >
                        <Mail aria-hidden="true" className="h-4 w-4" />
                        Send Email
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
