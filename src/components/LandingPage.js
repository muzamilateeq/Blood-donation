"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  Ambulance,
  CheckCircle2,
  ChevronDown,
  Clock3,
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const registrationSteps = [
  {
    description: "Basic information for coordination.",
    fields: ["fullName", "email", "phone"],
    title: "Contact details",
  },
  {
    description: "Help us route the request to the right city.",
    fields: ["city", "address"],
    title: "Location",
  },
  {
    description: "Confirm the required blood type.",
    fields: ["bloodGroup"],
    title: "Blood group",
  },
];

const fieldBaseClass =
  "h-14 w-full rounded-xl border border-zinc-200 bg-zinc-50 text-base font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [quickLead, setQuickLead] = useState({ city: "", phone: "" });
  const [step, setStep] = useState(0);
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
    setValue,
    trigger,
  } = form;

  const selectedBloodGroup = useWatch({
    control,
    name: "bloodGroup",
  });

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isSaved) return;

    const redirectTimer = window.setTimeout(() => {
      router.push("/dashboard");
    }, 900);

    return () => window.clearTimeout(redirectTimer);
  }, [isSaved, router]);

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
    if (!isSubmitting) {
      setIsModalOpen(false);
    }
  };

  const handleQuickSubmit = (event) => {
    event.preventDefault();
    openRegistration();
  };

  const handleNextStep = async () => {
    setSubmitError("");

    const isStepValid = await trigger(registrationSteps[step].fields, {
      shouldFocus: true,
    });

    if (isStepValid) {
      setStep((currentStep) =>
        Math.min(currentStep + 1, registrationSteps.length - 1)
      );
    }
  };

  const handleRegistrationSubmit = async (data) => {
    setSubmitError("");

    try {
      await saveDonorDetails(data);
      setIsSaved(true);
      setStep(0);
      reset();
      setQuickLead({ city: "", phone: "" });
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <HeroSection
        onQuickSubmit={handleQuickSubmit}
        quickLead={quickLead}
        setQuickLead={setQuickLead}
      />

      {isModalOpen && (
        <RegistrationModal
          closeRegistration={closeRegistration}
          errors={errors}
          handleNextStep={handleNextStep}
          handleSubmit={handleSubmit}
          isSaved={isSaved}
          isSubmitting={isSubmitting}
          onSubmit={handleRegistrationSubmit}
          register={register}
          router={router}
          selectedBloodGroup={selectedBloodGroup}
          step={step}
          submitError={submitError}
          setStep={setStep}
        />
      )}
    </main>
  );
}

function HeroSection({ onQuickSubmit, quickLead, setQuickLead }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-2 bg-red-600" />
      <div className="absolute right-0 top-0 -z-10 hidden h-full w-[38%] bg-red-600 lg:block" />
      <div className="absolute bottom-0 right-0 -z-10 h-40 w-40 rounded-tl-full bg-red-50 sm:h-64 sm:w-64 lg:hidden" />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-3">
          <BrandMark />
          <a
            className="hidden h-11 items-center justify-center rounded-xl border border-red-100 px-4 text-sm font-black text-red-700 transition hover:bg-red-50 sm:inline-flex"
            href="/dashboard"
          >
            Search Dashboard
          </a>
        </header>

        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1fr_440px] lg:py-10">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
              <Activity aria-hidden="true" className="h-4 w-4" />
              Live donor requests across Pakistan
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[0.98] text-zinc-950 sm:text-6xl lg:text-7xl">
              Find Blood Donors Anywhere in Pakistan.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-xl sm:leading-8">
              LifeLink Pakistan helps families and hospitals collect urgent
              donor details, match by city, and contact available donors fast.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
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
            onSubmit={onQuickSubmit}
            quickLead={quickLead}
            setQuickLead={setQuickLead}
          />
        </div>
      </div>
    </section>
  );
}

function InfoTile({ icon: Icon, label, title }) {
  return (
    <div className="flex min-h-20 items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-black leading-none">{title}</p>
        <p className="mt-1 text-sm font-semibold text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ onSubmit, quickLead, setQuickLead }) {
  return (
    <aside className="relative pb-8 lg:pb-0">
      <div className="absolute -right-5 -top-5 hidden h-24 w-24 rounded-full border-[18px] border-white/25 lg:block" />
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl shadow-red-950/20 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-red-700">Quick action</p>
            <h2 className="mt-1 text-2xl font-black text-zinc-950">
              Arrange a donor
            </h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white">
            <Ambulance aria-hidden="true" className="h-6 w-6" />
          </div>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <FormField icon={Phone} label="Mobile Number">
            <input
              className={iconFieldClass}
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
          </FormField>

          <FormField icon={MapPin} label="Select City">
            <select
              className={selectFieldClass}
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
            <SelectChevron />
          </FormField>

          <button
            className="mt-2 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-base font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 active:scale-[0.99]"
            type="submit"
          >
            <HeartPulse aria-hidden="true" className="h-5 w-5" />
            Arrange Blood Donor
          </button>
        </form>

        <div className="mt-5 grid grid-cols-2 gap-3">
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

function RegistrationModal({
  closeRegistration,
  errors,
  handleNextStep,
  handleSubmit,
  isSaved,
  isSubmitting,
  onSubmit,
  register,
  router,
  selectedBloodGroup,
  setStep,
  step,
  submitError,
}) {
  const activeStep = registrationSteps[step];

  return (
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
        <ModalHeader
          activeStep={activeStep}
          closeRegistration={closeRegistration}
          isSaved={isSaved}
          step={step}
        />

        {isSaved ? (
          <SuccessState router={router} />
        ) : (
          <form className="px-4 py-5 sm:px-6" onSubmit={handleSubmit(onSubmit)}>
            {step === 0 && <ContactStep errors={errors} register={register} />}
            {step === 1 && <LocationStep errors={errors} register={register} />}
            {step === 2 && (
              <BloodGroupStep
                errors={errors}
                register={register}
                selectedBloodGroup={selectedBloodGroup}
              />
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

              {step < registrationSteps.length - 1 ? (
                <button
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-red-600 px-6 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"
                  onClick={handleNextStep}
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
  );
}

function ModalHeader({ activeStep, closeRegistration, isSaved, step }) {
  return (
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
            {isSaved ? "Request saved" : activeStep.title}
          </h2>
          {!isSaved && (
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              {activeStep.description}
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
          {registrationSteps.map((item, index) => (
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
  );
}

function ContactStep({ errors, register }) {
  return (
    <div className="grid gap-4">
      <FormField error={errors.fullName?.message} icon={UserRound} label="Full Name">
        <input
          className={iconFieldClass}
          placeholder="Enter full name"
          type="text"
          {...register("fullName")}
        />
      </FormField>

      <FormField error={errors.email?.message} icon={Mail} label="Email Address">
        <input
          className={iconFieldClass}
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
          className={iconFieldClass}
          inputMode="tel"
          placeholder="03XX XXXXXXX"
          type="tel"
          {...register("phone")}
        />
      </FormField>
    </div>
  );
}

function LocationStep({ errors, register }) {
  return (
    <div className="grid gap-4">
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

      <label className="grid gap-2">
        <span className="text-sm font-bold text-zinc-700">
          Exact Address/Hospital
        </span>
        <textarea
          className="min-h-32 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-base font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
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
  );
}

function BloodGroupStep({ errors, register, selectedBloodGroup }) {
  return (
    <div>
      <p className="text-sm font-bold text-zinc-700">Blood Group</p>
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
  );
}

function SuccessState({ router }) {
  return (
    <div className="grid place-items-center px-4 py-12 text-center sm:px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <CheckCircle2 aria-hidden="true" className="h-9 w-9" />
      </div>
      <h3 className="mt-5 text-2xl font-black text-zinc-950">
        Saved successfully.
      </h3>
      <p className="mt-2 max-w-md text-base leading-7 text-zinc-600">
        Your donor details have been saved. Redirecting you to donor search now.
      </p>
      <button
        className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-red-600 px-6 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"
        onClick={() => router.push("/dashboard")}
        type="button"
      >
        Continue to Search
      </button>
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
