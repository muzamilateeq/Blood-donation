"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  Ambulance,
  CheckCircle2,
  ChevronDown,
  Clock3,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import BrandMark from "@/components/BrandMark";
import { bloodGroups, cities } from "@/lib/donorOptions";

const donorSchema = z.object({
  fullName: z.string().trim().min(3, "Full name must be at least 3 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(
      /^(\+92|0)?3\d{2}[ -]?\d{7}$/,
      "Enter a valid Pakistani mobile number."
    ),
  city: z.enum(cities, { message: "Select your city." }),
  address: z
    .string()
    .trim()
    .min(8, "Add the exact address or hospital name."),
  bloodGroup: z.enum(bloodGroups, { message: "Select a blood group." }),
});

const fieldBaseClass =
  "h-12 w-full rounded-lg border border-zinc-200 bg-zinc-50/80 text-base font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 sm:h-14 sm:rounded-xl";

const iconFieldClass = `${fieldBaseClass} pl-12 pr-4`;
const selectFieldClass = `${fieldBaseClass} appearance-none pl-12 pr-12`;

async function saveDonorDetails(data) {
  const response = await fetch("/api/blood-donors", {
    body: JSON.stringify({
      address: data.address,
      blood_group: data.bloodGroup,
      city: data.city,
      email: data.email,
      name: data.fullName,
      phone: data.phone,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Unable to save donor details.");
  }

  return result.donor;
}

export default function LandingPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");

  const form = useForm({
    defaultValues: {
      address: "",
      bloodGroup: "",
      city: "",
      email: "",
      fullName: "",
      phone: "",
    },
    mode: "onTouched",
    resolver: zodResolver(donorSchema),
  });

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = form;

  const selectedBloodGroup = useWatch({
    control,
    name: "bloodGroup",
  });

  const handleRegistrationSubmit = async (data) => {
    setSubmitError("");

    try {
      await saveDonorDetails(data);
      window.sessionStorage.setItem("lifelink-dashboard-access", "granted");
      reset();
      router.push("/dashboard");
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <HeroSection
        errors={errors}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onSubmit={handleRegistrationSubmit}
        register={register}
        selectedBloodGroup={selectedBloodGroup}
        submitError={submitError}
      />
    </main>
  );
}

function HeroSection({
  errors,
  handleSubmit,
  isSubmitting,
  onSubmit,
  register,
  selectedBloodGroup,
  submitError,
}) {
  return (
    <section className="relative isolate overflow-hidden bg-zinc-950">
      <div
        aria-hidden="true"
        className="hero-bg-image absolute inset-0 -z-20 bg-cover"
        style={{ backgroundImage: "url('/images/blood-donor-hero.png')" }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,9,11,0.42)_0%,rgba(9,9,11,0.72)_48%,rgba(220,38,38,0.32)_100%)] sm:bg-[linear-gradient(90deg,rgba(9,9,11,0.82)_0%,rgba(9,9,11,0.58)_44%,rgba(220,38,38,0.38)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-1.5 bg-red-600" />

      <div className="mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <header className="flex items-center justify-between py-3">
          <BrandMark light />
        </header>

        <div className="grid flex-1 items-end gap-6 pb-7 pt-14 sm:items-center sm:gap-7 sm:py-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-10 lg:py-10">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-zinc-950/10 backdrop-blur sm:mb-6 sm:px-4 sm:text-sm">
              <Activity aria-hidden="true" className="h-4 w-4" />
              <span className="truncate">Live donor requests across Pakistan</span>
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] text-white drop-shadow-sm sm:text-6xl sm:leading-[0.98] lg:text-7xl">
              Find Blood Donors Anywhere in Pakistan.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-100 drop-shadow-sm sm:mt-5 sm:text-lg sm:leading-8 lg:text-xl">
              LifeLink Pakistan helps families and hospitals collect urgent
              donor details, match by city, and contact available donors fast.
            </p>

            <div className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-3">
              <InfoTile icon={Clock3} label="Emergency intake" title="24/7" />
              <InfoTile icon={MapPin} label="Local matching" title="City" />
              <InfoTile
                icon={ShieldCheck}
                label="Structured records"
                title="Verified"
              />
            </div>
          </div>

          <QuickActionCard
            errors={errors}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            register={register}
            selectedBloodGroup={selectedBloodGroup}
            submitError={submitError}
          />
        </div>
      </div>
    </section>
  );
}

function InfoTile({ icon: Icon, label, title }) {
  return (
    <div className="flex min-h-20 items-center gap-3 rounded-xl border border-white/20 bg-white/15 p-4 shadow-sm shadow-zinc-950/10 backdrop-blur-xl">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-red-600">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-black leading-none text-white">{title}</p>
        <p className="mt-1 text-sm font-semibold text-zinc-100">{label}</p>
      </div>
    </div>
  );
}

function QuickActionCard({
  errors,
  handleSubmit,
  isSubmitting,
  onSubmit,
  register,
  selectedBloodGroup,
  submitError,
}) {
  return (
    <aside className="relative pb-8 lg:pb-0">
      <div className="absolute -right-5 -top-5 hidden h-24 w-24 rounded-full border-[18px] border-white/20 lg:block" />
      <div className="rounded-2xl border border-white/50 bg-white/90 p-4 shadow-2xl shadow-zinc-950/25 backdrop-blur-2xl sm:border-white/30 sm:bg-white/78 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-red-700">Quick action</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-zinc-950 sm:text-3xl">
              Arrange a donor now
            </h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/25 sm:h-12 sm:w-12">
            <Ambulance aria-hidden="true" className="h-6 w-6" />
          </div>
        </div>

        <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
          <FormField error={errors.fullName?.message} icon={UserRound} label="Full Name">
            <input
              className={iconFieldClass}
              placeholder="Enter full name"
              type="text"
              {...register("fullName")}
            />
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField error={errors.phone?.message} icon={Phone} label="Mobile Number">
              <input
                className={iconFieldClass}
                inputMode="tel"
                placeholder="03XX XXXXXXX"
                type="tel"
                {...register("phone")}
              />
            </FormField>

            <FormField error={errors.city?.message} icon={MapPin} label="City">
              <select className={selectFieldClass} {...register("city")}>
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </FormField>
          </div>

          <FormField error={errors.email?.message} icon={Mail} label="Email Address">
            <input
              className={iconFieldClass}
              placeholder="name@example.com"
              type="email"
              {...register("email")}
            />
          </FormField>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-zinc-700">
              Address / Hospital
            </span>
            <textarea
              className="min-h-24 w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-base font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 sm:rounded-xl"
              placeholder="Hospital, ward, area, or complete address"
              {...register("address")}
            />
            {errors.address?.message && (
              <p className="text-sm font-semibold text-red-600">
                {errors.address.message}
              </p>
            )}
          </label>

          <div>
            <p className="text-sm font-bold text-zinc-700">Blood Group</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {bloodGroups.map((group) => (
                <label
                  className={`flex h-11 cursor-pointer items-center justify-center rounded-lg border text-sm font-black transition ${
                    selectedBloodGroup === group
                      ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : "border-zinc-200 bg-zinc-50 text-zinc-950 hover:border-red-200 hover:bg-red-50"
                  }`}
                  key={group}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    value={group}
                    {...register("bloodGroup")}
                  />
                  {group}
                </label>
              ))}
            </div>
            {errors.bloodGroup?.message && (
              <p className="mt-2 text-sm font-semibold text-red-600">
                {errors.bloodGroup.message}
              </p>
            )}
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {submitError}
            </div>
          )}

          <button
            className="mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-center text-base font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 sm:min-h-14 sm:rounded-xl"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <HeartPulse aria-hidden="true" className="h-5 w-5" />
                Save Details & Search Donors
              </>
            )}
          </button>
        </form>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MetricCard icon={UsersRound} label="donor records" value="Live" />
          <MetricCard icon={Clock3} label="routing target" value="<10m" />
        </div>
      </div>
    </aside>
  );
}
function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <Icon aria-hidden="true" className="mb-3 h-5 w-5 text-red-600" />
      <p className="text-2xl font-black leading-none">{value}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-500">{label}</p>
    </div>
  );
}

function FormField({ children, error, icon: Icon, label }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-zinc-700">{label}</span>
      <span className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
        />
        {children}
      </span>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
    </label>
  );
}

function SelectChevron() {
  return (
    <ChevronDown
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
    />
  );
}
