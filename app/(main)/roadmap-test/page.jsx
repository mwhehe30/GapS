"use client";

import { useMemo, useState } from "react";
import {
  Loader,
  BadgeCheck,
  Pause,
  Check,
  FileCode,
} from "lucide-react";

const phases = [
  {
    phase: 1,
    status: "selesai",
    isSelesai: true,
    isBerjalan: false,
    title: "HTML & CSS Mastery",
    description:
      "Penguatan dasar-dasar Bahasa HTML dan CSS",
    tags: [
      "HTML Semantic",
      "HTML Semantic",
      "HTML Semantic",
    ],
    level: "Fundamental",
    duration: "4 Hari",
    progress: 100,
  },
  {
    phase: 2,
    status: "berjalan",
    isSelesai: false,
    isBerjalan: true,
    title: "HTML & CSS Mastery",
    description:
      "Penguatan dasar-dasar Bahasa HTML dan CSS",
    tags: [
      "HTML Semantic",
      "HTML Semantic",
      "HTML Semantic",
    ],
    level: "Fundamental",
    duration: "4 Hari",
    progress: 55,
  },
  {
    phase: 3,
    status: "belum",
    isSelesai: false,
    isBerjalan: false,
    title: "JavaScript Fundamentals",
    description:
      "Penguatan dasar-dasar JavaScript",
    tags: ["JS Basic", "DOM", "ES6"],
    level: "Fundamental",
    duration: "7 Hari",
    progress: 0,
  },
];

const filterTabs = [
  { id: "semua", label: "Semua" },
  { id: "selesai", label: "Selesai" },
  { id: "berjalan", label: "Berjalan" },
  { id: "belum", label: "Belum Mulai" },
];

const freeResources = [
  {
    title: "Learn JavaScript",
    source: "YouTube",
  },
  {
    title: "Learn JavaScript",
    source: "YouTube",
  },
  {
    title: "Learn JavaScript",
    source: "YouTube",
  },
  {
    title: "Learn JavaScript",
    source: "YouTube",
  },
];

function phaseMatchesFilter(item, filterId) {
  if (filterId === "semua") return true;
  if (filterId === "selesai")
    return item.isSelesai;
  if (filterId === "berjalan")
    return item.isBerjalan;
  if (filterId === "belum")
    return !item.isSelesai && !item.isBerjalan;
  return true;
}

export default function RoadmapPage() {
  const [activeFilter, setActiveFilter] =
    useState("semua");
  const progress = 99;

  const stats = useMemo(() => {
    const sedang = phases.filter(
      (p) => p.isBerjalan,
    ).length;
    const selesai = phases.filter(
      (p) => p.isSelesai,
    ).length;
    const tersisa = phases.filter(
      (p) => !p.isSelesai && !p.isBerjalan,
    ).length;
    return { sedang, selesai, tersisa };
  }, []);

  const visiblePhases = useMemo(
    () =>
      phases.filter((p) =>
        phaseMatchesFilter(p, activeFilter),
      ),
    [activeFilter],
  );

  return (
    <>
      <div className="max-w-7xl pb-4 mx-auto space-y-4 px-4">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-5xl">
            Skill Gap Roadmap
          </h1>
          <p className="text-2xl text-gray-900/70">
            Jalur pengembangan skill
          </p>
        </header>
      </div>

      <section className="pb-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 rounded-2xl px-6 py-5 space-y-3 mb-6">
            <p className="text-white text-sm font-medium">
              Junior Developer → Senior Developer
            </p>
            <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-end">
              <p className="text-gray-400 text-xs">
                Progress: {progress}% selesai
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-100 border border-gray-300 p-4 md:p-6">
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(200px,240px)_1fr_minmax(220px,280px)] gap-5 lg:gap-6">
              {/* Kolom kiri — ringkasan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3 xl:gap-4">
                <div className="bg-white rounded-2xl border border-gray-300 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-gray-800 rounded-xl w-10 h-10 grid place-items-center text-white shrink-0">
                      <Loader
                        className="w-5 h-5"
                        strokeWidth={2}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 leading-tight">
                      Sedang Dipelajari
                    </span>
                  </div>
                  <p className="text-3xl font-semibold text-gray-800 tabular-nums">
                    {stats.sedang}
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-300 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-gray-800 rounded-xl w-10 h-10 grid place-items-center text-white shrink-0">
                      <BadgeCheck
                        className="w-5 h-5"
                        strokeWidth={2}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 leading-tight">
                      Roadmap Selesai
                    </span>
                  </div>
                  <p className="text-3xl font-semibold text-gray-800 tabular-nums">
                    {stats.selesai}
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-300 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-gray-800 rounded-xl w-10 h-10 grid place-items-center text-white shrink-0">
                      <Pause
                        className="w-5 h-5"
                        strokeWidth={2}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 leading-tight">
                      Roadmap Tersisa
                    </span>
                  </div>
                  <p className="text-3xl font-semibold text-gray-800 tabular-nums">
                    {stats.tersisa}
                  </p>
                </div>
              </div>

              {/* Kolom tengah — timeline */}
              <div className="bg-white rounded-2xl border border-gray-300 p-4 md:p-5 flex flex-col min-h-[320px] shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-5">
                  <h2 className="text-base font-semibold text-gray-800 shrink-0">
                    Timeline Pembelajaran
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    {filterTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                          setActiveFilter(tab.id)
                        }
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                          (
                            activeFilter ===
                            tab.id
                          ) ?
                            "bg-gray-800 text-white"
                          : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                        }`}>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[520px] pr-1 space-y-0 flex-1">
                  {visiblePhases.length === 0 ?
                    <p className="text-sm text-gray-500 py-8 text-center">
                      Tidak ada fase untuk filter
                      ini.
                    </p>
                  : visiblePhases.map(
                      (item, index) => {
                        const isLast =
                          index ===
                          visiblePhases.length -
                            1;
                        const nodeFilled =
                          item.isSelesai;
                        const nodeActive =
                          item.isBerjalan;
                        return (
                          <div
                            key={item.phase}
                            className="flex gap-3 items-stretch">
                            <div
                              className={`flex-1 rounded-2xl border p-4 mb-4 space-y-2 ${
                                item.isSelesai ?
                                  "bg-gray-100 border-gray-300"
                                : (
                                  item.isBerjalan
                                ) ?
                                  "bg-white border-gray-800/25 shadow-sm"
                                : "bg-white border-gray-300"
                              }`}>
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs text-gray-700">
                                  Fase{" "}
                                  {item.phase} —{" "}
                                  {(
                                    item.isSelesai
                                  ) ?
                                    "Selesai"
                                  : (
                                    item.isBerjalan
                                  ) ?
                                    "Sedang Dipelajari"
                                  : "Belum Dimulai"
                                  }
                                </p>
                                {item.isSelesai && (
                                  <span
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-800 text-white"
                                    aria-hidden>
                                    <Check
                                      className="w-4 h-4"
                                      strokeWidth={
                                        2.5
                                      }
                                    />
                                  </span>
                                )}
                                {item.isBerjalan && (
                                  <Loader
                                    className="w-4 h-4 text-gray-500 shrink-0 animate-spin"
                                    aria-label="Sedang berjalan"
                                  />
                                )}
                              </div>

                              <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                                {item.title}
                              </h3>

                              <p className="text-xs text-gray-600 leading-relaxed">
                                {item.description}
                              </p>

                              <div className="flex gap-1.5 flex-wrap pt-1">
                                {item.tags.map(
                                  (tag, i) => (
                                    <span
                                      key={`${tag}-${i}`}
                                      className="text-[11px] bg-white border border-gray-300 text-gray-700 px-2.5 py-0.5 rounded-full">
                                      {tag}
                                    </span>
                                  ),
                                )}
                              </div>

                              <p className="text-xs text-gray-600 pt-1">
                                <span>
                                  {item.level}
                                </span>
                                <span className="text-gray-400">
                                  {" "}
                                  ·{" "}
                                </span>
                                Durasi:{" "}
                                <span className="font-medium text-gray-800">
                                  {item.duration}
                                </span>
                                {item.isSelesai && (
                                  <>
                                    <span className="text-gray-400">
                                      {" "}
                                      ·{" "}
                                    </span>
                                    Status:{" "}
                                    <span className="font-medium text-gray-800">
                                      Selesai
                                    </span>
                                  </>
                                )}
                                {item.isBerjalan && (
                                  <>
                                    <span className="text-gray-400">
                                      {" "}
                                      ·{" "}
                                    </span>
                                    Progress:{" "}
                                    <span className="font-medium text-gray-800">
                                      {
                                        item.progress
                                      }
                                      %
                                    </span>
                                  </>
                                )}
                              </p>

                              {item.isBerjalan && (
                                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                                  <div
                                    className="absolute inset-y-0 left-0 bg-gray-800 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${item.progress}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Rail timeline */}
                            <div className="flex w-5 shrink-0 flex-col items-center self-stretch pb-4">
                              {index > 0 && (
                                <div className="w-px flex-1 min-h-3 bg-gray-300" />
                              )}
                              <div
                                className={`z-[1] h-3 w-3 shrink-0 rounded-full border-2 ${
                                  nodeFilled ?
                                    "border-gray-800 bg-gray-800"
                                  : nodeActive ?
                                    "border-gray-800 bg-white"
                                  : "border-gray-400 bg-white"
                                }`}
                                aria-hidden
                              />
                              {!isLast && (
                                <div className="w-px flex-1 min-h-3 bg-gray-300" />
                              )}
                            </div>
                          </div>
                        );
                      },
                    )
                  }
                </div>
              </div>

              {/* Kolom kanan — resource */}
              <div className="bg-white rounded-2xl border border-gray-300 p-4 md:p-5 shadow-sm h-fit xl:sticky xl:top-24">
                <h2 className="text-base font-semibold text-gray-800 mb-4">
                  Rekomendasi Resource Gratis
                </h2>
                <ul className="space-y-3">
                  {freeResources.map((res, i) => (
                    <li key={i}>
                      <div className="flex items-center gap-3 rounded-2xl border border-gray-300 bg-gray-100 p-3 transition-colors hover:bg-gray-200">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-white">
                          <FileCode
                            className="w-5 h-5"
                            strokeWidth={2}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {res.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {res.source}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
