import type { Route } from "./+types/references";
import { ExternalLink, Library, ShieldCheck } from "lucide-react";

import { SectionHeading, SiteShell } from "~/components/learning";
import { lessonModules, referenceLibrary } from "~/content/crypto";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "References | Cryptography Learning Lab" },
    {
      name: "description",
      content: "Primary and credible references for the cryptography learning app.",
    },
  ];
}

export default function References() {
  return (
    <SiteShell eyebrow="References">
      <main>
        <section className="border-b border-neutral-900/10">
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-8">
            <SectionHeading kicker="Reference backbone" title="Sources are part of the learning system.">
              <p>
                Phase 1 stores standards, primary papers, and credibility notes in one
                place so future lesson sections can cite them directly.
              </p>
            </SectionHeading>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-10 md:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
          <aside className="rounded-lg border border-neutral-900/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-emerald-300">
                <ShieldCheck aria-hidden="true" size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Coverage
                </p>
                <h2 className="text-xl font-bold text-neutral-950">Algorithm links</h2>
              </div>
            </div>
            <ul className="mt-5 grid gap-2">
              {lessonModules.map((module) => (
                <li key={module.id} className="rounded-md bg-[#f7f4ee] p-3">
                  <p className="font-bold text-neutral-950">{module.shortTitle}</p>
                  <p className="mt-1 text-sm text-neutral-600">
                    {module.references.length} reference
                    {module.references.length === 1 ? "" : "s"}
                  </p>
                </li>
              ))}
            </ul>
          </aside>

          <div className="grid gap-4">
            {referenceLibrary.map((reference) => (
              <a
                key={reference.id}
                href={reference.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-lg border border-neutral-900/10 bg-white p-5 shadow-sm transition-colors duration-100 hover:border-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Library aria-hidden="true" size={17} />
                      <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                        {reference.publisher} · {reference.year}
                      </p>
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-neutral-950">
                      {reference.title}
                    </h2>
                    <p className="mt-3 max-w-3xl leading-7 text-neutral-700">
                      {reference.note}
                    </p>
                  </div>
                  <ExternalLink
                    aria-hidden="true"
                    className="shrink-0 text-neutral-500 transition-colors duration-100 group-hover:text-neutral-950"
                    size={20}
                  />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {reference.relatedAlgorithms.map((algorithmId) => {
                    const module = lessonModules.find((item) => item.id === algorithmId);
                    return (
                      <span
                        key={algorithmId}
                        className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-bold text-neutral-800"
                      >
                        {module?.shortTitle ?? algorithmId}
                      </span>
                    );
                  })}
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
