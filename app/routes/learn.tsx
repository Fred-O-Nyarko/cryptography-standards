import {
  Binary,
  BookOpen,
  BrainCircuit,
  Calculator,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Library,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import type { Route } from "./+types/learn";
import { AesWalkthrough } from "~/components/aes";
import { DesWalkthrough } from "~/components/des";
import { EccWalkthrough } from "~/components/ecc";
import { ElGamalWalkthrough } from "~/components/elgamal";
import { RsaWalkthrough } from "~/components/rsa";
import { TdesWalkthrough } from "~/components/tdes";
import {
  CheckpointCard,
  CollapsibleSection,
  FamilyPill,
  GlossaryDrawer,
  KeyLifecyclePanel,
  ReferenceCallouts,
  SectionDetail,
  SiteShell,
  ToyVisualizer,
} from "~/components/learning";
import {
  getLessonModule,
  getReferencesForModule,
  type LessonSection,
} from "~/content/crypto";

const sectionIcons: Record<LessonSection["type"], typeof ShieldCheck> = {
  concept: BrainCircuit,
  math: Calculator,
  "key-generation": KeyRound,
  "encryption-flow": LockKeyhole,
  "decryption-flow": ShieldCheck,
  demo: Binary,
  checkpoint: GraduationCap,
};

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
  const conceptSections = module.sections.filter(
    (section) => section.type !== "math" && section.type !== "checkpoint",
  );
  const hasCheckpoint = module.sections.some((section) => section.type === "checkpoint");

  return (
    <SiteShell eyebrow={module.shortTitle}>
      <main className="mx-auto max-w-7xl px-4 pb-32 pt-8 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black text-neutral-950">{module.shortTitle}</h1>
          <FamilyPill family={module.family} />
        </div>
        <p className="mt-2 max-w-3xl leading-7 text-neutral-700">{module.summary}</p>

        <div className="mt-8">
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
        </div>

        <div className="mt-10 grid gap-4">
          <CollapsibleSection
            title="Before you start"
            kicker="Objectives, key questions, prerequisites"
            icon={GraduationCap}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Learning objectives
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {module.objectives.map((objective) => (
                <div key={objective} className="rounded-md bg-emerald-100 p-4">
                  <p className="text-sm font-semibold leading-6 text-neutral-900">
                    {objective}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Key questions
            </p>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {module.keyQuestions.map((question) => (
                <li
                  key={question}
                  className="rounded-md border border-neutral-900/10 bg-[#f7f4ee] p-3 text-sm leading-6 text-neutral-800"
                >
                  {question}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Prerequisites
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {module.prerequisites.map((prerequisite) => (
                <li
                  key={prerequisite}
                  className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-800"
                >
                  {prerequisite}
                </li>
              ))}
            </ul>
          </CollapsibleSection>

          {mathSection ? (
            <CollapsibleSection
              title={mathSection.title}
              kicker="The math"
              icon={Calculator}
            >
              <SectionDetail section={mathSection} />
            </CollapsibleSection>
          ) : null}

          <CollapsibleSection title="Key lifecycle" kicker="How keys live" icon={KeyRound}>
            <KeyLifecyclePanel module={module} />
          </CollapsibleSection>

          {conceptSections.map((section) => (
            <CollapsibleSection
              key={section.id}
              title={section.title}
              kicker={section.type.replace("-", " ")}
              icon={sectionIcons[section.type]}
            >
              <SectionDetail section={section} />
            </CollapsibleSection>
          ))}

          {hasCheckpoint ? (
            <CollapsibleSection title="Checkpoint" kicker="Test yourself" icon={CheckCircle2}>
              <CheckpointCard module={module} />
            </CollapsibleSection>
          ) : null}

          <CollapsibleSection title="Glossary" kicker={`${module.shortTitle} terms`} icon={BookOpen}>
            <GlossaryDrawer module={module} />
          </CollapsibleSection>

          <CollapsibleSection title="References" kicker="Standards and papers" icon={Library}>
            <ReferenceCallouts references={references} />
          </CollapsibleSection>
        </div>
      </main>
    </SiteShell>
  );
}
