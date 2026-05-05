"use client";

import {
  ArrowLeft,
  ChevronDown,
  Droplets,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { bloodGroups, cities } from "@/lib/donorOptions";
import { normalizePhoneForWhatsApp } from "@/lib/phone";

const selectClass =
  "h-12 w-full appearance-none rounded-lg border border-zinc-200 bg-zinc-50/80 pl-12 pr-12 text-base font-bold text-zinc-950 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 sm:h-14 sm:rounded-xl";

export default function DonorSearchDashboard() {
  const router = useRouter();
  const [canViewDashboard, setCanViewDashboard] = useState(false);
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

  useEffect(() => {
    const hasAccess =
      window.sessionStorage.getItem("lifelink-dashboard-access") === "granted";

    if (!hasAccess) {
      router.replace("/");
      return;
    }

    const accessTimer = window.setTimeout(() => {
      setCanViewDashboard(true);
    }, 0);

    return () => window.clearTimeout(accessTimer);
  }, [router]);

  const searchDonors = async (event) => {
    event.preventDefault();
    setError("");
    setHasSearched(true);

    if (!bloodGroup || !city) {
      setError("Select required blood group and city.");
      return;
    }

    setIsSearching(true);

    try {
      const params = new URLSearchParams({
        blood_group: bloodGroup,
        city,
      });

      const response = await fetch(`/api/blood-donors?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        setDonors([]);
        setError(result.error || "Unable to search donors.");
        return;
      }

      setDonors(result.donors || []);
    } catch {
      setDonors([]);
      setError("Network error. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  if (!canViewDashboard) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-4 text-center text-zinc-950">
        <div>
          <p className="text-lg font-black">Redirecting...</p>
          <p className="mt-2 text-sm font-semibold text-zinc-500">
            Please register before opening the dashboard.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff_0%,#fff7f7_46%,#fafafa_100%)] px-4 py-4 text-zinc-950 sm:px-6 sm:py-5 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <DashboardHeader />

        <form
          className="-mt-8 relative z-10 grid gap-4 rounded-2xl border border-white/60 bg-white/88 p-4 shadow-2xl shadow-red-950/10 backdrop-blur-2xl sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
          onSubmit={searchDonors}
        >
          <SearchSelect
            icon={Droplets}
            label="Required Blood Group"
            onChange={setBloodGroup}
            options={bloodGroups}
            placeholder="Select blood group"
            value={bloodGroup}
          />

          <SearchSelect
            icon={MapPin}
            label="City"
            onChange={setCity}
            options={cities}
            placeholder="Select city"
            value={city}
          />

          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-center text-base font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-14 sm:rounded-xl"
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

        <ResultsSection donors={donors} error={error} hasSearched={hasSearched} />
      </section>
    </main>
  );
}

function DashboardHeader() {
  return (
    <div className="relative isolate mb-12 overflow-hidden rounded-2xl p-4 text-white shadow-2xl shadow-red-950/18 sm:p-6">
      <div
        aria-hidden="true"
        className="dashboard-hero-bg absolute inset-0 -z-20 bg-cover"
        style={{ backgroundImage: "url('/images/blood-donor-hero.png')" }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(9,9,11,0.86)_0%,rgba(127,29,29,0.68)_48%,rgba(220,38,38,0.48)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-red-600/15" />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <BrandMark light />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <HeaderMetric label="Search by" value="City" />
          <HeaderMetric label="Filter" value="Blood" />
          <HeaderMetric label="Action" value="Contact" />
        </div>
      </div>

      <div className="mt-12 max-w-3xl pb-14 sm:mt-14 sm:pb-16">
        <p className="text-sm font-bold text-red-100">After registration</p>
        <h1 className="mt-1 text-3xl font-black leading-tight drop-shadow-sm sm:text-5xl">
          Donor Search Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-red-50 drop-shadow-sm sm:text-base">
          Select which blood group you need and which city you are in. Matching
          donors appear below with WhatsApp and email contact actions.
        </p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/18 px-4 py-2 text-sm font-black text-white shadow-sm shadow-zinc-950/10 backdrop-blur transition hover:bg-white/25"
          href="/"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to registration
        </Link>
      </div>
    </div>
  );
}

function HeaderMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/18 bg-white/14 px-3 py-3 shadow-sm shadow-zinc-950/10 backdrop-blur-xl sm:px-4">
      <p className="text-xs font-bold uppercase text-red-100">{label}</p>
      <p className="mt-1 text-lg font-black leading-none text-white">{value}</p>
    </div>
  );
}

function SearchSelect({ icon: Icon, label, onChange, options, placeholder, value }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-zinc-700">{label}</span>
      <span className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
        />
        <select
          className={selectClass}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
        />
      </span>
    </label>
  );
}

function ResultsSection({ donors, error, hasSearched }) {
  const isEmpty = hasSearched && donors.length === 0 && !error;

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-zinc-950">Matching Donors</h2>
        {hasSearched && !error && (
          <p className="text-sm font-bold text-zinc-500">
            {donors.length} result{donors.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {donors.map((donor) => (
            <DonorCard donor={donor} key={donor.id || `${donor.email}-${donor.phone}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/88 p-8 text-center shadow-sm shadow-zinc-950/5 backdrop-blur">
      <UserRound aria-hidden="true" className="mx-auto h-10 w-10 text-zinc-400" />
      <p className="mt-3 text-lg font-black text-zinc-950">
        No matching donors found.
      </p>
      <p className="mt-1 text-sm font-semibold text-zinc-500">
        Try another city or blood group.
      </p>
    </div>
  );
}

function DonorCard({ donor }) {
  const phoneNumber = normalizePhoneForWhatsApp(donor.phone);

  return (
    <article className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm shadow-zinc-950/5 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-950/10 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-red-700">Donor Name</p>
          <h3 className="mt-1 truncate text-xl font-black text-zinc-950 sm:text-2xl">
            {donor.name}
          </h3>
        </div>
        <span className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-lg font-black leading-none text-white">
          {donor.blood_group}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm font-bold text-zinc-600">
        <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="min-w-0 truncate">{donor.city}</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-center text-sm font-black text-white transition hover:bg-green-700 sm:rounded-xl"
          href={`https://wa.me/${phoneNumber}`}
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircle aria-hidden="true" className="h-4 w-4" />
          WhatsApp
        </a>
        <a
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-center text-sm font-black text-zinc-700 transition hover:bg-zinc-50 sm:rounded-xl"
          href={`mailto:${donor.email}`}
        >
          <Mail aria-hidden="true" className="h-4 w-4" />
          Send Email
        </a>
      </div>
    </article>
  );
}
