"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BODY_TYPES, FUEL_TYPES, MAKE_MODELS, type Car } from "@/lib/cars";
import { getCarIssues } from "@/lib/carIssues";
import CarTable from "@/components/admin/CarTable";

type DealerOption = { slug: string; name: string };

const SORTS = ["Newest first", "Price: low to high", "Price: high to low", "Lowest mileage"] as const;
const PAGE_SIZE = 20;

// Bracket steps for the price/mileage range dropdowns — closer together at
// the lower end where most stock sits, wider apart higher up.
const PRICE_STEPS = [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 50000, 60000, 75000, 100000, 150000, 200000];
const MILEAGE_STEPS = [5000, 10000, 15000, 20000, 30000, 40000, 50000, 60000, 80000, 100000, 150000];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR + 1 - 1980 + 1 }, (_, i) => CURRENT_YEAR + 1 - i);

function formatPrice(v: number) {
  return `£${v.toLocaleString()}`;
}
function formatMileage(v: number) {
  return `${v.toLocaleString()} miles`;
}

const selectClass =
  "rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-2.5 text-xs font-bold text-[var(--a-text)] outline-none transition-colors duration-150 focus:border-revio-yellow";
const popupSelectClass =
  "w-full rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3.5 py-3 text-sm text-[var(--a-text)] outline-none transition-colors duration-150 focus:border-revio-yellow";
const popupLabelClass = "mb-1.5 block text-[8px] font-black uppercase tracking-wider text-[var(--a-text-faint)]";

export default function InventoryBrowser({
  cars,
  dealers,
}: {
  cars: Car[];
  dealers: DealerOption[];
}) {
  const [searchMake, setSearchMake] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [dealerSlug, setDealerSlug] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [fuel, setFuel] = useState("");
  const [gearbox, setGearbox] = useState("");
  const [colour, setColour] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [mileageMin, setMileageMin] = useState("");
  const [mileageMax, setMileageMax] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Newest first");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersClosing, setFiltersClosing] = useState(false);

  const totalCars = cars.length;
  const totalDealers = dealers.length;
  const issuesCount = useMemo(() => getCarIssues(cars).length, [cars]);

  // The search dropdowns need to cover every make/model actually present
  // in the data, not just the curated MAKE_MODELS list — a car added with
  // a custom "Other" make/model still needs to be findable here.
  const searchMakes = useMemo(
    () => Array.from(new Set([...Object.keys(MAKE_MODELS), ...cars.map((c) => c.make)])).sort(),
    [cars]
  );
  const searchModels = useMemo(() => {
    if (!searchMake) return [];
    const curated = MAKE_MODELS[searchMake] ?? [];
    const fromData = cars.filter((c) => c.make === searchMake).map((c) => c.model);
    return Array.from(new Set([...curated, ...fromData])).sort();
  }, [searchMake, cars]);

  // Colour comes from each car's optional extended details, so only cars
  // where that was filled in contribute an option here.
  const colours = useMemo(
    () =>
      Array.from(new Set(cars.map((c) => c.details?.colour).filter((c): c is string => Boolean(c)))).sort(),
    [cars]
  );

  const popupFilterCount = [
    dealerSlug,
    bodyType,
    fuel,
    gearbox,
    colour,
    priceMin,
    priceMax,
    yearMin,
    yearMax,
    mileageMin,
    mileageMax,
  ].filter(Boolean).length;
  const hasActiveFilters = Boolean(searchMake || searchModel || popupFilterCount);

  const filtered = useMemo(() => {
    let result = cars.filter((car) => {
      if (searchMake && car.make !== searchMake) return false;
      if (searchModel && car.model !== searchModel) return false;
      if (dealerSlug && car.dealerSlug !== dealerSlug) return false;
      if (bodyType && car.bodyType !== bodyType) return false;
      if (fuel && car.fuel !== fuel) return false;
      if (gearbox && car.gearbox !== gearbox) return false;
      if (colour && car.details?.colour !== colour) return false;
      if (priceMin && car.cashPrice < Number(priceMin)) return false;
      if (priceMax && car.cashPrice > Number(priceMax)) return false;
      if (yearMin && car.year < Number(yearMin)) return false;
      if (yearMax && car.year > Number(yearMax)) return false;
      if (mileageMin && car.mileage < Number(mileageMin)) return false;
      if (mileageMax && car.mileage > Number(mileageMax)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "Price: low to high":
          return a.cashPrice - b.cashPrice;
        case "Price: high to low":
          return b.cashPrice - a.cashPrice;
        case "Lowest mileage":
          return a.mileage - b.mileage;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [
    cars,
    searchMake,
    searchModel,
    dealerSlug,
    bodyType,
    fuel,
    gearbox,
    colour,
    priceMin,
    priceMax,
    yearMin,
    yearMax,
    mileageMin,
    mileageMax,
    sort,
  ]);

  // A filter/sort change can easily land the current page past the end of
  // the new result set (e.g. you're on page 3, then a filter narrows things
  // down to one page) — jump back to page 1 whenever the criteria change.
  useEffect(() => {
    setPage(1);
  }, [
    searchMake,
    searchModel,
    dealerSlug,
    bodyType,
    fuel,
    gearbox,
    colour,
    priceMin,
    priceMax,
    yearMin,
    yearMax,
    mileageMin,
    mileageMax,
    sort,
  ]);

  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFilters();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersOpen]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function clearFilters() {
    setSearchMake("");
    setSearchModel("");
    clearPopupFilters();
  }

  function clearPopupFilters() {
    setDealerSlug("");
    setBodyType("");
    setFuel("");
    setGearbox("");
    setColour("");
    setPriceMin("");
    setPriceMax("");
    setYearMin("");
    setYearMax("");
    setMileageMin("");
    setMileageMax("");
  }

  function closeFilters() {
    setFiltersClosing(true);
    window.setTimeout(() => {
      setFiltersOpen(false);
      setFiltersClosing(false);
    }, 200);
  }

  function showAllCars() {
    clearFilters();
    document.getElementById("car-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={showAllCars}
          className="btn-tactile group rounded-xl border border-[var(--a-border)] bg-[var(--a-surface)] p-4 text-left transition-colors duration-150 hover:border-revio-yellow/40"
        >
          <span className="text-[9px] font-black uppercase tracking-wider text-[var(--a-text-faint)]">
            Cars live
          </span>
          <strong className="mt-1 flex items-center gap-1.5 text-2xl font-black text-[var(--a-text)]">
            {totalCars}
            <span className="text-xs font-bold text-[var(--a-text-fainter)] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              view all →
            </span>
          </strong>
        </button>
        <Link
          href="/admin/dealers"
          className="btn-tactile group rounded-xl border border-[var(--a-border)] bg-[var(--a-surface)] p-4 text-left transition-colors duration-150 hover:border-revio-yellow/40"
        >
          <span className="text-[9px] font-black uppercase tracking-wider text-[var(--a-text-faint)]">
            Dealers
          </span>
          <strong className="mt-1 flex items-center gap-1.5 text-2xl font-black text-[var(--a-text)]">
            {totalDealers}
            <span className="text-xs font-bold text-[var(--a-text-fainter)] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              manage →
            </span>
          </strong>
        </Link>
        <Link
          href="/admin/issues"
          className={`btn-tactile rounded-xl border p-4 text-left transition-colors duration-150 ${
            issuesCount > 0
              ? "border-[var(--a-warn-border)] bg-[var(--a-warn-bg-solid)] hover:border-[var(--a-warn-text)]/60"
              : "border-[var(--a-border)] bg-[var(--a-surface)] hover:border-revio-yellow/40"
          }`}
        >
          <span className="text-[9px] font-black uppercase tracking-wider text-[var(--a-text-faint)]">
            Issues
          </span>
          <strong className="mt-1 block text-2xl font-black text-[var(--a-text)]">
            {issuesCount}
            <span
              className={`ml-1.5 text-[10px] font-bold ${
                issuesCount > 0 ? "text-[var(--a-warn-text)]" : "text-[var(--a-text-muted)]"
              }`}
            >
              {issuesCount > 0 ? "review →" : "all clear"}
            </span>
          </strong>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={searchMake}
          onChange={(e) => {
            setSearchMake(e.target.value);
            setSearchModel("");
          }}
          className={selectClass}
        >
          <option value="">All makes</option>
          {searchMakes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={searchModel}
          onChange={(e) => setSearchModel(e.target.value)}
          disabled={!searchMake}
          className={`${selectClass} disabled:opacity-40`}
        >
          <option value="">{searchMake ? "All models" : "Choose a make first"}</option>
          {searchModels.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={selectClass}>
          {SORTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3.5 py-2.5 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
        >
          Filters{popupFilterCount > 0 ? ` (${popupFilterCount})` : ""}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-2.5 text-xs font-bold text-[var(--a-text-muted)] hover:bg-[var(--a-surface-2-hover)]"
          >
            Clear filters
          </button>
        )}
      </div>

      <p id="car-results" className="mb-3 scroll-mt-6 text-xs text-[var(--a-text-fainter)]">
        {totalPages > 1
          ? `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length}`
          : `Showing ${filtered.length} of ${totalCars}`}{" "}
        car{filtered.length === 1 ? "" : "s"}
      </p>

      {totalCars === 0 ? (
        <div className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface)] p-8 text-center">
          <p className="text-sm text-[var(--a-text-muted)]">
            No cars yet.{" "}
            <Link href="/admin/inventory/new" className="font-bold text-revio-yellow underline">
              Add your first one
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <CarTable cars={paginated} emptyMessage="No cars match these filters." />
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3.5 py-2 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)] disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-xs text-[var(--a-text-fainter)]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3.5 py-2 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)] disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {filtersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200 ${
            filtersClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeFilters();
          }}
        >
          <div
            className={`w-full max-w-[440px] rounded-[22px] border border-[var(--a-border)] bg-[var(--a-surface)] p-6 shadow-2xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] sm:p-7 ${
              filtersClosing ? "translate-y-2 scale-95 opacity-0" : "translate-y-0 scale-100 opacity-100"
            }`}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-revio-yellow-deep">
                  Refine results
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-[var(--a-text)]">Filters</h2>
              </div>
              <button
                type="button"
                onClick={closeFilters}
                aria-label="Close"
                className="btn-tactile grid size-9 flex-none place-items-center rounded-full border border-[var(--a-border)] text-lg text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid gap-3.5">
              <div>
                <label className={popupLabelClass}>Dealer</label>
                <select value={dealerSlug} onChange={(e) => setDealerSlug(e.target.value)} className={popupSelectClass}>
                  <option value="">All dealers</option>
                  {dealers.map((d) => (
                    <option key={d.slug} value={d.slug}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={popupLabelClass}>Body type</label>
                <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className={popupSelectClass}>
                  <option value="">All body types</option>
                  {BODY_TYPES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={popupLabelClass}>Fuel type</label>
                <select value={fuel} onChange={(e) => setFuel(e.target.value)} className={popupSelectClass}>
                  <option value="">All fuel types</option>
                  {FUEL_TYPES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={popupLabelClass}>Gearbox</label>
                <select value={gearbox} onChange={(e) => setGearbox(e.target.value)} className={popupSelectClass}>
                  <option value="">Any gearbox</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              {colours.length > 0 && (
                <div>
                  <label className={popupLabelClass}>Colour</label>
                  <select value={colour} onChange={(e) => setColour(e.target.value)} className={popupSelectClass}>
                    <option value="">Any colour</option>
                    {colours.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className={popupLabelClass}>Price range (£)</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <select
                    value={priceMin}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPriceMin(value);
                      if (priceMax && value && Number(value) > Number(priceMax)) setPriceMax("");
                    }}
                    className={popupSelectClass}
                  >
                    <option value="">No min</option>
                    {PRICE_STEPS.map((v) => (
                      <option key={v} value={v}>{formatPrice(v)}</option>
                    ))}
                  </select>
                  <select
                    value={priceMax}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPriceMax(value);
                      if (priceMin && value && Number(value) < Number(priceMin)) setPriceMin("");
                    }}
                    className={popupSelectClass}
                  >
                    <option value="">No max</option>
                    {PRICE_STEPS.map((v) => (
                      <option key={v} value={v}>{formatPrice(v)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={popupLabelClass}>Year</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <select
                    value={yearMin}
                    onChange={(e) => {
                      const value = e.target.value;
                      setYearMin(value);
                      if (yearMax && value && Number(value) > Number(yearMax)) setYearMax("");
                    }}
                    className={popupSelectClass}
                  >
                    <option value="">From</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <select
                    value={yearMax}
                    onChange={(e) => {
                      const value = e.target.value;
                      setYearMax(value);
                      if (yearMin && value && Number(value) < Number(yearMin)) setYearMin("");
                    }}
                    className={popupSelectClass}
                  >
                    <option value="">To</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={popupLabelClass}>Mileage</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <select
                    value={mileageMin}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMileageMin(value);
                      if (mileageMax && value && Number(value) > Number(mileageMax)) setMileageMax("");
                    }}
                    className={popupSelectClass}
                  >
                    <option value="">No min</option>
                    {MILEAGE_STEPS.map((v) => (
                      <option key={v} value={v}>{formatMileage(v)}</option>
                    ))}
                  </select>
                  <select
                    value={mileageMax}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMileageMax(value);
                      if (mileageMin && value && Number(value) < Number(mileageMin)) setMileageMin("");
                    }}
                    className={popupSelectClass}
                  >
                    <option value="">No max</option>
                    {MILEAGE_STEPS.map((v) => (
                      <option key={v} value={v}>{formatMileage(v)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2.5">
              {popupFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearPopupFilters}
                  className="btn-tactile flex-1 rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-5 py-3 text-sm font-black text-[var(--a-text-muted)] hover:bg-[var(--a-surface-2-hover)]"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={closeFilters}
                className="btn-tactile flex-1 rounded-xl bg-revio-yellow px-5 py-3 text-sm font-black text-revio-black hover:shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
