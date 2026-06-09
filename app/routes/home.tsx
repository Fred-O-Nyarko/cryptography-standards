import type { Route } from "./+types/home";
import {
  AlgorithmCard,
  FamilyPill,
  SectionHeading,
  SiteShell,
  StatusBadge,
  ToyVisualizer,
} from "~/components/learning";
import { lessonModules } from "~/content/crypto";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cryptography Learning Lab" },
    {
      name: "description",
      content:
        "Interactive cybersecurity class project foundation for DES, 3DES, AES, RSA, ElGamal, and ECC.",
    },
  ];
}

export default function Home() {
  const symmetricModules = lessonModules.filter((module) => module.family === "symmetric");
  const asymmetricModules = lessonModules.filter((module) => module.family === "asymmetric");
  const demoConfig = lessonModules[0].visualizer;

  return (
    <SiteShell eyebrow="Phase 1">
      <main>
        <section className="border-b border-neutral-900/10">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1fr_420px] lg:px-8">
            <div>
              <StatusBadge>Foundation implemented first</StatusBadge>
              <SectionHeading
                kicker="Cybersecurity class project"
                title="A rigorous interactive journey through classical and modern cryptography."
              >
                <p>
                  Phase 1 creates the learning shell, lesson model, visual language,
                  references, presentation mode, and a toy visualizer. Algorithm-specific
                  internals come next, one module at a time.
                </p>
              </SectionHeading>
              <div className="mt-8 flex flex-wrap gap-3">
                <FamilyPill family="symmetric" />
                <FamilyPill family="asymmetric" />
              </div>
            </div>

            <aside className="rounded-lg border border-neutral-900/10 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Phase 1 scope
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4">
                {[
                  ["6", "algorithm shells"],
                  ["7", "section types"],
                  ["8", "seed references"],
                  ["1", "stub visualizer"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-md bg-[#f7f4ee] p-4">
                    <dt className="text-3xl font-black text-neutral-950">{value}</dt>
                    <dd className="mt-1 text-sm font-medium text-neutral-600">{label}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 leading-7 text-neutral-700">
                This app is structured so DES, 3DES, AES, RSA, ElGamal, and ECC can
                each receive a full step-by-step visual module without changing the
                surrounding learning system.
              </p>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">
                Course map
              </p>
              <h2 className="mt-2 text-3xl font-black text-neutral-950">
                Choose a module shell
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-neutral-700">
              Every card opens a reusable lesson structure with concept, math, key
              lifecycle, demo, checkpoint, glossary, and references.
            </p>
          </div>

          <div className="mt-8 grid gap-8">
            <CourseFamily title="Symmetric cryptography techniques" modules={symmetricModules} />
            <CourseFamily title="Asymmetric cryptography techniques" modules={asymmetricModules} />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 md:px-6 lg:px-8">
          <ToyVisualizer config={demoConfig} />
        </section>
      </main>
    </SiteShell>
  );
}

function CourseFamily({
  title,
  modules,
}: {
  title: string;
  modules: typeof lessonModules;
}) {
  return (
    <section>
      <h3 className="text-xl font-black text-neutral-950">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {modules.map((module) => (
          <AlgorithmCard key={module.id} module={module} />
        ))}
      </div>
    </section>
  );
}
