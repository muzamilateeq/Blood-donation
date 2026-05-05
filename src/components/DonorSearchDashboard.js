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
import BrandMark from "@/components/BrandMark";
import { bloodGroups, cities } from "@/lib/donorOptions";
import { normalizePhoneForWhatsApp } from "@/lib/phone";

const selectClass =
  "h-14 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 text-base font-bold text-zinc-950 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100";

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

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <DashboardHeader />

        <form
          className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
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

        <ResultsSection donors={donors} error={error} hasSearched={hasSearched} />
      </section>
    </main>
  );
}

function DashboardHeader() {
  return (
    <div className="mb-6 rounded-2xl bg-red-600 p-5 text-white shadow-xl shadow-red-950/15 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <BrandMark light />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <HeaderMetric label="Search by" value="City" />
          <HeaderMetric label="Filter" value="Blood" />
          <HeaderMetric label="Action" value="Contact" />
        </div>
      </div>

      <div className="mt-6 max-w-3xl">
        <p className="text-sm font-bold text-red-100">After registration</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
          Donor Search Dashboard
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-red-50 sm:text-base">
          Select which blood group you need and which city you are in. Matching
          donors appear below with WhatsApp and email contact actions.
        </p>
      </div>
    </div>
  );
}

function HeaderMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-3">
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
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
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-950/10">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-red-700">Donor Name</p>
          <h3 className="mt-1 truncate text-2xl font-black text-zinc-950">
            {donor.name}
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
          <MessageCircle aria-hidden="true" className="h-4 w-4" />
          WhatsApp
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
}
