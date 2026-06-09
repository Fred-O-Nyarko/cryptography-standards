import type { Route } from "./+types/learn";
import { AesWalkthrough } from "~/components/aes";
import { DesWalkthrough } from "~/components/des";
import { EccWalkthrough } from "~/components/ecc";
import { ElGamalWalkthrough } from "~/components/elgamal";
import { RsaWalkthrough } from "~/components/rsa";
import { TdesWalkthrough } from "~/components/tdes";
import {
  CheckpointCard,
  FamilyPill,
  GlossaryDrawer,
  KeyLifecyclePanel,
  ReferenceCallouts,
  SectionDetail,
  SectionHeading,
  SiteShell,
  StatusBadge,
  StepTimeline,
  ToyVisualizer,
} from "~/components/learning";
import { getLessonModule, getReferencesForModule } from "~/content/crypto";

export function loader({ params }: Route.LoaderArgs) {
  const module = getLessonModule(params.algorithmId);

  if (!module) {
    throw new Response("Lesson not found", { status: 404 });
  }

  return {
    module,
    references: getReferencesForModule(module),
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title: data
        ? `${data.module.shortTitle} | Cryptography Learning Lab`
        : "Lesson | Cryptography Learning Lab",
    },
    {
      name: "description",
      content: data?.module.summary ?? "Cryptography lesson shell.",
    },
  ];
}

export default function Learn({ loaderData }: Route.ComponentProps) {
  const { module, references } = loaderData;
  const mathSection = module.sections.find((section) => section.type === "math");
  const conceptSections = module.sections.filter((section) => section.type !== "math");
  const statusLabel =
    module.status === "interactive-ready" ? "Interactive module" : "Lesson shell";

  return (
    <SiteShell eyebrow={module.shortTitle}>
      <main>
        <section className="border-b border-neutral-900/10">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-[1fr_360px] lg:px-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge>{statusLabel}</StatusBadge>
                <FamilyPill family={module.family} />
              </div>
              <SectionHeading kicker={module.title} title={module.shortTitle}>
                <p>{module.summary}</p>
              </SectionHeading>
            </div>

            <aside className="rounded-lg border border-neutral-900/10 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Key questions
              </p>
              <ul className="mt-5 grid gap-3">
                {module.keyQuestions.map((question) => (
                  <li
                    key={question}
                    className="rounded-md border border-neutral-900/10 bg-[#f7f4ee] p-3 text-sm leading-6 text-neutral-800"
                  >
                    {question}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="grid min-w-0 gap-6 [&>*]:min-w-0 [&>*]:w-full [&>*]:max-w-full">
            <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Learning objectives
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {module.objectives.map((objective) => (
                  <div key={objective} className="rounded-md bg-emerald-100 p-4">
                    <p className="text-sm font-semibold leading-6 text-neutral-900">
                      {objective}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <StepTimeline sections={module.sections} />

            {mathSection ? <SectionDetail section={mathSection} /> : null}

            <KeyLifecyclePanel module={module} />

            {module.id === "des" ? (
              <DesWalkthrough />
            ) : module.id === "3des" ? (
              <TdesWalkthrough />
            ) : module.id === "aes" ? (
              <AesWalkthrough />
            ) : module.id === "rsa" ? (
              <RsaWalkthrough />
            ) : module.id === "elgamal" ? (
              <ElGamalWalkthrough />
            ) : module.id === "ecc" ? (
              <EccWalkthrough />
            ) : (
              <ToyVisualizer config={module.visualizer} />
            )}

            {conceptSections.map((section) =>
              section.type === "checkpoint" ? (
                <CheckpointCard key={section.id} module={module} />
              ) : (
                <SectionDetail key={section.id} section={section} />
              ),
            )}
          </div>

          <div className="grid min-w-0 content-start gap-6">
            <aside className="rounded-lg border border-neutral-900/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Prerequisites
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {module.prerequisites.map((prerequisite) => (
                  <li
                    key={prerequisite}
                    className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-800"
                  >
                    {prerequisite}
                  </li>
                ))}
              </ul>
            </aside>
            <GlossaryDrawer module={module} />
            <ReferenceCallouts references={references} />
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
