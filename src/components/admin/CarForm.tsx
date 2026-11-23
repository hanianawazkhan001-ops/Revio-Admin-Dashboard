"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import {
  MAKE_MODELS,
  BODY_TYPES,
  FUEL_TYPES,
  MIN_CAR_PHOTOS,
  RECOMMENDED_CAR_PHOTOS,
  MAX_CAR_PHOTOS,
  type BodyType,
  type FuelType,
  type CarDetails,
} from "@/lib/cars";

type DealerOption = { id: string; slug: string; name: string };

type CarFormProps = {
  mode: "create" | "edit";
  dealers: DealerOption[];
  initialSlug?: string;
  initial?: {
    make: string;
    model: string;
    bodyType: BodyType;
    year: number;
    mileage: number;
    gearbox: "Automatic" | "Manual";
    fuel: FuelType;
    cashPrice: number;
    monthlyPrice: number;
    dealerSlug: string;
    badgeLabel: string;
    badgeKind: "yellow" | "grey";
    images: string[];
    details?: CarDetails;
  };
};

const MAKES = Object.keys(MAKE_MODELS).sort();
const MIN_PHOTOS = MIN_CAR_PHOTOS;
const RECOMMENDED_PHOTOS = RECOMMENDED_CAR_PHOTOS;
const MAX_PHOTOS = MAX_CAR_PHOTOS;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR + 1 - 1980 + 1 }, (_, i) => CURRENT_YEAR + 1 - i);
const GEARBOXES = ["Automatic", "Manual"] as const;
const OTHER = "__other__";
const BADGE_KINDS = [
  { value: "yellow", label: "Featured (yellow)" },
  { value: "grey", label: "Standard (grey)" },
] as const;

const inputClass =
  "w-full rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3.5 py-3.5 text-sm text-[var(--a-text)] outline-none transition-colors duration-150 placeholder:text-[var(--a-text-fainter)] focus:border-revio-yellow";
const labelClass = "mb-1.5 block text-[8px] font-black uppercase tracking-wider text-[var(--a-text-faint)]";

export default function CarForm({ mode, dealers, initialSlug, initial }: CarFormProps) {
  const router = useRouter();

  const [make, setMake] = useState(initial?.make ?? "");
  const [makeOther, setMakeOther] = useState(Boolean(initial?.make && !MAKE_MODELS[initial.make]));
  const [model, setModel] = useState(initial?.model ?? "");
  const [modelOther, setModelOther] = useState(
    Boolean(initial?.model && initial?.make && !MAKE_MODELS[initial.make]?.includes(initial.model))
  );
  const [bodyType, setBodyType] = useState<BodyType | "">(initial?.bodyType ?? "");
  const [year, setYear] = useState(initial ? String(initial.year) : "");
  const [mileage, setMileage] = useState(initial ? String(initial.mileage) : "");
  const [gearbox, setGearbox] = useState(initial?.gearbox ?? "");
  const [fuel, setFuel] = useState(initial?.fuel ?? "");
  const [cashPrice, setCashPrice] = useState(initial ? String(initial.cashPrice) : "");
  const [monthlyPrice, setMonthlyPrice] = useState(initial ? String(initial.monthlyPrice) : "");
  const [dealerSlug, setDealerSlug] = useState(initial?.dealerSlug ?? dealers[0]?.slug ?? "");
  const [badgeLabel, setBadgeLabel] = useState(initial?.badgeLabel ?? "Available Now");
  const [badgeKind, setBadgeKind] = useState<"yellow" | "grey">(initial?.badgeKind ?? "grey");

  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [showDetails, setShowDetails] = useState(Boolean(initial?.details));
  const [derivative, setDerivative] = useState(initial?.details?.derivative ?? "");
  const [registration, setRegistration] = useState(initial?.details?.registration ?? "");
  const [engineSize, setEngineSize] = useState(initial?.details?.engineSize ?? "");
  const [colour, setColour] = useState(initial?.details?.colour ?? "");
  const [doors, setDoors] = useState(initial?.details ? String(initial.details.doors) : "");
  const [power, setPower] = useState(initial?.details?.power ?? "");
  const [co2, setCo2] = useState(initial?.details?.co2 ?? "");
  const [driveType, setDriveType] = useState(initial?.details?.driveType ?? "");
  const [seats, setSeats] = useState(initial?.details ? String(initial.details.seats) : "");
  const [description, setDescription] = useState(initial?.details?.description ?? "");
  const [features, setFeatures] = useState(initial?.details?.features.join("\n") ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError(null);

    const remainingSlots = MAX_PHOTOS - images.length;
    const selected = Array.from(files);
    const toUpload = selected.slice(0, remainingSlots);
    if (selected.length > toUpload.length) {
      setUploadError(
        `You can have up to ${MAX_PHOTOS} photos. Only the first ${toUpload.length} of the ${selected.length} you picked were uploaded.`
      );
    }
    if (toUpload.length === 0) {
      e.target.value = "";
      return;
    }

    setUploading(true);

    const newUrls: string[] = [];
    for (const file of toUpload) {
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("car-photos").upload(path, file);
      if (uploadErr) {
        setUploadError(`Failed to upload ${file.name}: ${uploadErr.message}`);
        continue;
      }
      const { data } = supabase.storage.from("car-photos").getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }

    setImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (images.length < MIN_PHOTOS) {
      setError(
        `Please add at least ${MIN_PHOTOS} photos before saving (${images.length} so far). We recommend around ${RECOMMENDED_PHOTOS} for the best listing.`
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    const details =
      showDetails && derivative
        ? {
            derivative,
            registration,
            bodyType,
            engineSize,
            colour,
            doors: Number(doors) || 0,
            power,
            co2,
            driveType,
            seats: Number(seats) || 0,
            description,
            features: features
              .split("\n")
              .map((f) => f.trim())
              .filter(Boolean),
          }
        : null;

    const dealer = dealers.find((d) => d.slug === dealerSlug);

    const payload = {
      make,
      model,
      bodyType,
      year: Number(year),
      mileage: Number(mileage),
      gearbox,
      fuel,
      cashPrice: Number(cashPrice),
      monthlyPrice: Number(monthlyPrice),
      dealerId: dealer?.id,
      badgeLabel,
      badgeKind,
      images,
      details,
    };

    const url = mode === "create" ? "/api/admin/cars" : `/api/admin/cars/${initialSlug}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-7">
      <section>
        <h2 className="mb-3 text-lg font-bold text-[var(--a-text)]">Vehicle</h2>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Make</label>
            {makeOther ? (
              <div className="flex gap-2">
                <input
                  required
                  autoFocus
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="Type the make"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => {
                    setMakeOther(false);
                    setMake("");
                    setModel("");
                    setModelOther(false);
                  }}
                  className="btn-tactile whitespace-nowrap rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
                >
                  Choose from list
                </button>
              </div>
            ) : (
              <select
                required
                value={make}
                onChange={(e) => {
                  if (e.target.value === OTHER) {
                    setMakeOther(true);
                    setMake("");
                  } else {
                    setMake(e.target.value);
                  }
                  setModel("");
                  setModelOther(false);
                }}
                className={inputClass}
              >
                <option value="" disabled>Select</option>
                {MAKES.map((m) => <option key={m}>{m}</option>)}
                <option value={OTHER}>Other (type manually)</option>
              </select>
            )}
          </div>
          <div>
            <label className={labelClass}>Model</label>
            {modelOther || !make || !MAKE_MODELS[make] ? (
              <div className="flex gap-2">
                <input
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={make ? "Type the model" : "Select a make first"}
                  className={inputClass}
                />
                {make && MAKE_MODELS[make] && (
                  <button
                    type="button"
                    onClick={() => {
                      setModelOther(false);
                      setModel("");
                    }}
                    className="btn-tactile whitespace-nowrap rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
                  >
                    Choose from list
                  </button>
                )}
              </div>
            ) : (
              <select
                required
                value={model}
                onChange={(e) => {
                  if (e.target.value === OTHER) {
                    setModelOther(true);
                    setModel("");
                  } else {
                    setModel(e.target.value);
                  }
                }}
                className={inputClass}
              >
                <option value="" disabled>Select</option>
                {MAKE_MODELS[make].map((m) => <option key={m}>{m}</option>)}
                <option value={OTHER}>Other (type manually)</option>
              </select>
            )}
          </div>
          <div>
            <label className={labelClass}>Body type</label>
            <select required value={bodyType} onChange={(e) => setBodyType(e.target.value as BodyType)} className={inputClass}>
              <option value="" disabled>Select</option>
              {BODY_TYPES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Year</label>
            <select required value={year} onChange={(e) => setYear(e.target.value)} className={inputClass}>
              <option value="" disabled>Select</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Mileage</label>
            <input required type="number" min={0} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="e.g. 18450" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Gearbox</label>
            <select required value={gearbox} onChange={(e) => setGearbox(e.target.value as typeof gearbox)} className={inputClass}>
              <option value="" disabled>Select</option>
              {GEARBOXES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Fuel type</label>
            <select required value={fuel} onChange={(e) => setFuel(e.target.value as typeof fuel)} className={inputClass}>
              <option value="" disabled>Select</option>
              {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--a-border)] pt-6">
        <h2 className="mb-3 text-lg font-bold text-[var(--a-text)]">Pricing &amp; dealer</h2>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Cash price (£)</label>
            <input required type="number" min={0} value={cashPrice} onChange={(e) => setCashPrice(e.target.value)} placeholder="e.g. 22995" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Estimated monthly price (£)</label>
            <input required type="number" min={0} value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} placeholder="e.g. 349" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Dealer</label>
            {dealers.length === 0 ? (
              <p className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3.5 py-3.5 text-sm text-[var(--a-text-muted)]">
                No dealers yet — add a dealer first.
              </p>
            ) : (
              <select required value={dealerSlug} onChange={(e) => setDealerSlug(e.target.value)} className={inputClass}>
                {dealers.map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className={labelClass}>Badge text</label>
            <input required value={badgeLabel} onChange={(e) => setBadgeLabel(e.target.value)} placeholder="e.g. Just Added" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Badge style</label>
            <select value={badgeKind} onChange={(e) => setBadgeKind(e.target.value as "yellow" | "grey")} className={inputClass}>
              {BADGE_KINDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--a-border)] pt-6">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-[var(--a-text)]">Photos</h2>
          <span
            className={`text-xs font-bold ${
              images.length < MIN_PHOTOS ? "text-[var(--a-warn-text)]" : "text-[var(--a-text-muted)]"
            }`}
          >
            {images.length} / {MAX_PHOTOS} photos
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {images.map((url) => (
            <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-[var(--a-border)]">
              <Image src={url} alt="Car photo" fill sizes="200px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="btn-tactile absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-xs text-white hover:bg-black"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
          {images.length < MAX_PHOTOS && (
            <label className="btn-tactile flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--a-border)] text-center text-[10px] text-[var(--a-text-faint)] transition-colors duration-150 hover:border-revio-yellow/40">
              {uploading ? "Uploading…" : "+ Add Photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>
        {uploadError && <p className="mt-2 text-xs text-[var(--a-warn-text)]">{uploadError}</p>}
        <p className="mt-2 text-[10px] text-[var(--a-text-fainter)]">
          A minimum of {MIN_PHOTOS} photos is required to save a car — we recommend around{" "}
          {RECOMMENDED_PHOTOS} for the best listing, up to a maximum of {MAX_PHOTOS}. The first
          photo is used as the cover image.
        </p>
      </section>

      <section className="border-t border-[var(--a-border)] pt-6">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="btn-tactile text-left text-sm font-bold text-revio-yellow"
        >
          {showDetails ? "− Hide extended details" : "+ Add extended details (optional)"}
        </button>
        <p className="mt-1 text-[10px] text-[var(--a-text-fainter)]">
          Powers the full vehicle-details section and description on the car page. Safe to skip for now — basic info above is enough to list the car.
        </p>

        {showDetails && (
          <div className="fade-in-up mt-4 grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Derivative</label>
              <input value={derivative} onChange={(e) => setDerivative(e.target.value)} placeholder="e.g. 320d M Sport" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Registration</label>
              <input value={registration} onChange={(e) => setRegistration(e.target.value)} placeholder="e.g. YN21 BMT" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Engine size</label>
              <input value={engineSize} onChange={(e) => setEngineSize(e.target.value)} placeholder="e.g. 2.0L" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Colour</label>
              <input value={colour} onChange={(e) => setColour(e.target.value)} placeholder="e.g. Alpine White" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Doors</label>
              <input type="number" min={0} value={doors} onChange={(e) => setDoors(e.target.value)} placeholder="e.g. 4" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Seats</label>
              <input type="number" min={0} value={seats} onChange={(e) => setSeats(e.target.value)} placeholder="e.g. 5" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Power</label>
              <input value={power} onChange={(e) => setPower(e.target.value)} placeholder="e.g. 190bhp" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>CO₂</label>
              <input value={co2} onChange={(e) => setCo2(e.target.value)} placeholder="e.g. 128g/km" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Drive type</label>
              <input value={driveType} onChange={(e) => setDriveType(e.target.value)} placeholder="e.g. Rear-wheel drive" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Written description shown on the car page." className={`${inputClass} min-h-[100px]`} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Features (one per line)</label>
              <textarea
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder={"Apple CarPlay\nCruise Control\n18\" Alloy Wheels"}
                className={`${inputClass} min-h-[120px]`}
              />
            </div>
          </div>
        )}
      </section>

      {error && <p className="rounded-lg bg-[var(--a-warn-bg)] px-3.5 py-2.5 text-xs text-[var(--a-warn-text)]">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading || dealers.length === 0}
        className="btn-tactile rounded-xl bg-revio-yellow px-5 py-3.5 text-sm font-black text-revio-black hover:shadow-lg disabled:opacity-60"
      >
        {submitting ? "Saving…" : mode === "create" ? "Add Car" : "Save Changes"}
      </button>
    </form>
  );
}
