"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  Ambulance,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Droplets,
  HeartPulse,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

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

const steps = [
  {
    title: "Contact details",
    description: "Basic information for coordination.",
    fields: ["fullName", "email", "phone"],
  },
  {
    title: "Location",
    description: "Help us route the request to the right city.",
    fields: ["city", "address"],
  },
  {
    title: "Blood group",
    description: "Confirm the required blood type.",
    fields: ["bloodGroup"],
  },
];

const iconInputClass =
  "h-14 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-base font-semibold text-zinc-950 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100";

async function submitToDatabase(data) {
  const response = await fetch("/api/blood-donors", {
    body: JSON.stringify({
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      address: data.address,
      blood_group: data.bloodGroup,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [quickLead, setQuickLead] = useState({ phone: "", city: "" });
  const [submitError, setSubmitError] = useState("");

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    trigger,
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      address: "",
      bloodGroup: "",
    },
    mode: "onTouched",
    resolver: zodResolver(donorSchema),
  });

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const selectedBloodGroup = useWatch({
    control,
    name: "bloodGroup",
  });

  const openRegistration = () => {
    setIsSaved(false);
    setSubmitError("");
    setStep(0);
    if (quickLead.phone) {
      setValue("phone", quickLead.phone, { shouldValidate: false });
    }
    if (quickLead.city) {
      setValue("city", quickLead.city, { shouldValidate: false });
    }
    setIsModalOpen(true);
  };

  const closeRegistration = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  const handleQuickSubmit = (event) => {
    event.preventDefault();
    openRegistration();
  };

  const handleNext = async () => {
    setSubmitError("");
    const isStepValid = await trigger(steps[step].fields, {
      shouldFocus: true,
    });
    if (isStepValid) {
      setStep((currentStep) => Math.min(currentStep + 1, steps.length - 1));
    }
  };

  const onSubmit = async (data) => {
    setSubmitError("");

    try {
      await submitToDatabase(data);
      setIsSaved(true);
      setStep(0);
      reset();
      setQuickLead({ phone: "", city: "" });
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-white text-zinc-950">
      <section className="relative isolate flex min-h-screen items-center px-4 py-5 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-2 bg-red-600" />
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[42%] bg-red-600 lg:block" />
        <div className="absolute bottom-0 right-0 -z-10 h-44 w-44 rounded-tl-full bg-red-50 sm:h-64 sm:w-64 lg:hidden" />

        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1fr_440px]">
          <div className="max-w-3xl pt-8 sm:pt-10 lg:pt-0">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20">
                <Droplets aria-hidden="true" className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-black leading-none text-zinc-950">
                  LifeLink Pakistan
                </p>
                <p className="mt-1 text-sm font-semibold text-red-700">
                  Emergency donor network
                </p>
              </div>
            </div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
              <Activity aria-hidden="true" className="h-4 w-4" />
              Live requests routed by city
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.96] text-zinc-950 sm:text-6xl lg:text-7xl">
              Find Blood Donors Anywhere in Pakistan.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl">
              Connect urgent blood requests with nearby donors through a fast,
              mobile-first lead flow built for hospitals, families, and response
              teams.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["24/7", "Emergency intake", Clock3],
                ["City", "Local matching", MapPin],
                ["Verified", "Donor response", ShieldCheck],
              ].map(([title, label, Icon]) => (
                <div
                  className="flex min-h-20 items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                  key={title}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black leading-none">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-500">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative pb-8 lg:pb-0">
            <div className="absolute -right-6 -top-6 hidden h-24 w-24 rounded-full border-[18px] border-white/25 lg:block" />
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl shadow-red-950/20 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-red-700">
                    Quick action
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-zinc-950">
                    Arrange a donor
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white">
                  <Ambulance aria-hidden="true" className="h-6 w-6" />
                </div>
              </div>

              <form className="grid gap-4" onSubmit={handleQuickSubmit}>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-700">
                    Mobile Number
                  </span>
                  <span className="relative">
                    <Phone
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      className={iconInputClass}
                      inputMode="tel"
                      name="mobile"
                      onChange={(event) =>
                        setQuickLead((lead) => ({
                          ...lead,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="03XX XXXXXXX"
                      type="tel"
                      value={quickLead.phone}
                    />
                  </span>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-700">
                    Select City
                  </span>
                  <span className="relative">
                    <MapPin
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
                    />
                    <select
                      className="h-14 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 text-base font-semibold text-zinc-950 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                      name="city"
                      onChange={(event) =>
                        setQuickLead((lead) => ({
                          ...lead,
                          city: event.target.value,
                        }))
                      }
                      value={quickLead.city}
                    >
                      <option disabled value="">
                        Select City
                      </option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
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
                  className="mt-2 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-base font-black text-white shadow-lg shadow-red-600/25 transition duration-200 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 active:scale-[0.99]"
                  type="submit"
                >
                  <HeartPulse aria-hidden="true" className="h-5 w-5" />
                  Arrange Blood Donor
                </button>
              </form>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-zinc-50 p-4">
                  <UsersRound
                    aria-hidden="true"
                    className="mb-3 h-5 w-5 text-red-600"
                  />
                  <p className="text-2xl font-black leading-none">18k+</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-500">
                    donor leads
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-4">
                  <Clock3
                    aria-hidden="true"
                    className="mb-3 h-5 w-5 text-red-600"
                  />
                  <p className="text-2xl font-black leading-none">&lt;10m</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-500">
                    response target
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div
          aria-labelledby="registration-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-end bg-zinc-950/65 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
          role="dialog"
        >
          <button
            aria-label="Close registration modal"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={closeRegistration}
            type="button"
          />
          <div className="relative max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl shadow-zinc-950/30 sm:max-w-2xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-red-700">
                    Donor request registration
                  </p>
                  <h2
                    className="mt-1 text-2xl font-black text-zinc-950"
                    id="registration-modal-title"
                  >
                    {isSaved ? "Request saved" : steps[step].title}
                  </h2>
                  {!isSaved && (
                    <p className="mt-1 text-sm font-semibold text-zinc-500">
                      {steps[step].description}
                    </p>
                  )}
                </div>
                <button
                  aria-label="Close modal"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50"
                  onClick={closeRegistration}
                  type="button"
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>

              {!isSaved && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {steps.map((item, index) => (
                    <div
                      className={`h-2 rounded-full ${
                        index <= step ? "bg-red-600" : "bg-zinc-200"
                      }`}
                      key={item.title}
                    />
                  ))}
                </div>
              )}
            </div>

            {isSaved ? (
              <div className="grid place-items-center px-4 py-12 text-center sm:px-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <CheckCircle2 aria-hidden="true" className="h-9 w-9" />
                </div>
                <h3 className="mt-5 text-2xl font-black text-zinc-950">
                  Saved successfully.
                </h3>
                <p className="mt-2 max-w-md text-base leading-7 text-zinc-600">
                  Your donor details have been saved to the blood donors
                  database and are ready for dashboard search.
                </p>
                <button
                  className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-red-600 px-6 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"
                  onClick={closeRegistration}
                  type="button"
                >
                  Done
                </button>
              </div>
            ) : (
              <form className="px-4 py-5 sm:px-6" onSubmit={handleSubmit(onSubmit)}>
                {step === 0 && (
                  <div className="grid gap-4">
                    <FormField
                      error={errors.fullName?.message}
                      icon={UserRound}
                      label="Full Name"
                    >
                      <input
                        className={iconInputClass}
                        placeholder="Enter full name"
                        type="text"
                        {...register("fullName")}
                      />
                    </FormField>

                    <FormField
                      error={errors.email?.message}
                      icon={Mail}
                      label="Email Address"
                    >
                      <input
                        className={iconInputClass}
                        placeholder="name@example.com"
                        type="email"
                        {...register("email")}
                      />
                    </FormField>

                    <FormField
                      error={errors.phone?.message}
                      icon={Phone}
                      label="Phone Number (WhatsApp preferred)"
                    >
                      <input
                        className={iconInputClass}
                        inputMode="tel"
                        placeholder="03XX XXXXXXX"
                        type="tel"
                        {...register("phone")}
                      />
                    </FormField>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid gap-4">
                    <FormField
                      error={errors.city?.message}
                      icon={MapPin}
                      label="City"
                    >
                      <select
                        className="h-14 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 text-base font-semibold text-zinc-950 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                        {...register("city")}
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden="true"
                        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
                      />
                    </FormField>

                    <label className="grid gap-2">
                      <span className="text-sm font-bold text-zinc-700">
                        Exact Address/Hospital
                      </span>
                      <textarea
                        className="min-h-32 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-base font-semibold text-zinc-950 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
                        placeholder="Hospital, ward, area, or complete address"
                        {...register("address")}
                      />
                      {errors.address?.message && (
                        <p className="text-sm font-semibold text-red-600">
                          {errors.address.message}
                        </p>
                      )}
                    </label>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-4">
                    <div>
                      <p className="text-sm font-bold text-zinc-700">
                        Blood Group
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {bloodGroups.map((group) => (
                          <label
                            className={`flex h-14 cursor-pointer items-center justify-center rounded-xl border text-base font-black transition ${
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
                  </div>
                )}

                {submitError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                    {submitError}
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:justify-between">
                  <button
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-black text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={step === 0 || isSubmitting}
                    onClick={() => setStep((currentStep) => currentStep - 1)}
                    type="button"
                  >
                    Back
                  </button>

                  {step < steps.length - 1 ? (
                    <button
                      className="inline-flex h-12 items-center justify-center rounded-xl bg-red-600 px-6 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"
                      onClick={handleNext}
                      type="button"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting && (
                        <Loader2
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin"
                        />
                      )}
                      Submit to Database
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
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
