import katex from "katex";
import {
  ArrowLeft,
  ArrowRight,
  Binary,
  BookOpen,
  BrainCircuit,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  KeyRound,
  Layers3,
  Library,
  LockKeyhole,
  Pause,
  Play,
  Presentation,
  Route,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router";

import {
  familyLabels,
  getReferencesForSection,
  type LessonModule,
  type LessonSection,
  type Reference,
  slideScaffold,
  type VisualizerConfig,
} from "~/content/crypto";

type IconComponent = typeof ShieldCheck;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function statusLabel(status: LessonModule["status"]) {
  if (status === "interactive-ready") {
    return "Interactive";
  }

  if (status === "planned") {
    return "Planned";
  }

  return "Foundation";
}

export function SiteShell({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-neutral-950">
      <header className="sticky top-0 z-30 border-b border-neutral-900/10 bg-[#f7f4ee]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-8">
          <Link
            to="/"
            className="flex min-h-10 items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
          >
            <span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-emerald-300">
              <ShieldCheck aria-hidden="true" size={20} />
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-neutral-600">
                {eyebrow ?? "Cryptography"}
              </span>
              <span className="block text-base font-bold">Learning Lab</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1" aria-label="Primary navigation">
            {[
              { to: "/", label: "Course", icon: BookOpen },
              { to: "/references", label: "References", icon: Library },
              { to: "/present", label: "Present", icon: Presentation },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                aria-label={item.label}
                title={item.label}
                className={({ isActive }) =>
                  cx(
                    "inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700",
                    isActive
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-700 hover:bg-white hover:text-neutral-950",
                  )
                }
              >
                <item.icon aria-hidden="true" size={17} />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}

export function SectionHeading({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      {kicker ? (
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">
          {kicker}
        </p>
      ) : null}
      <h1 className="mt-3 text-4xl font-black leading-tight text-neutral-950 md:text-5xl lg:text-6xl">
        {title}
      </h1>
      {children ? <div className="mt-5 text-lg leading-8 text-neutral-700">{children}</div> : null}
    </div>
  );
}

export function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-emerald-900/20 bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-900">
      <CheckCircle2 aria-hidden="true" size={14} />
      {children}
    </span>
  );
}

export function AlgorithmCard({ module }: { module: LessonModule }) {
  const Icon = module.family === "symmetric" ? LockKeyhole : KeyRound;

  return (
    <Link
      to={`/learn/${module.id}`}
      className="group flex h-full min-h-[300px] flex-col justify-between rounded-lg border border-neutral-900/10 bg-white p-5 text-left shadow-sm transition-colors duration-100 hover:border-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-neutral-950 text-amber-300">
            <Icon aria-hidden="true" size={21} />
          </span>
          <StatusBadge>{statusLabel(module.status)}</StatusBadge>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
          {familyLabels[module.family]}
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-normal text-neutral-950">
          {module.shortTitle}
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-700">{module.tagline}</p>
      </div>
      <div className="mt-7 flex items-center justify-between border-t border-neutral-900/10 pt-4 text-sm font-semibold text-neutral-900">
        <span>{module.difficulty}</span>
        <ArrowRight
          aria-hidden="true"
          className="transition-transform duration-150 motion-safe:group-hover:translate-x-1"
          size={18}
        />
      </div>
    </Link>
  );
}

export function FamilyPill({ family }: { family: LessonModule["family"] }) {
  const Icon = family === "symmetric" ? LockKeyhole : KeyRound;

  return (
    <span
      className={cx(
        "inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold",
        family === "symmetric"
          ? "bg-amber-100 text-amber-950"
          : "bg-cyan-100 text-cyan-950",
      )}
    >
      <Icon aria-hidden="true" size={16} />
      {familyLabels[family]}
    </span>
  );
}

export function StepTimeline({ sections }: { sections: LessonSection[] }) {
  const icons: Record<LessonSection["type"], IconComponent> = {
    concept: BrainCircuit,
    math: Calculator,
    "key-generation": KeyRound,
    "encryption-flow": LockKeyhole,
    "decryption-flow": ShieldCheck,
    demo: Binary,
    checkpoint: CheckCircle2,
  };

  return (
    <ol className="grid gap-3">
      {sections.map((section, index) => {
        const Icon = icons[section.type];

        return (
          <li
            key={section.id}
            className="grid grid-cols-[auto_1fr] gap-4 rounded-lg border border-neutral-900/10 bg-white p-4"
          >
            <span className="grid h-11 w-11 place-items-center rounded-md bg-neutral-950 text-emerald-300">
              <Icon aria-hidden="true" size={19} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Step {index + 1} · {section.type.replace("-", " ")}
              </p>
              <h3 className="mt-1 text-lg font-bold text-neutral-950">{section.title}</h3>
              <p className="mt-1 text-sm leading-6 text-neutral-700">{section.summary}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function MathPanel({ section }: { section: LessonSection }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-neutral-900/10 bg-neutral-950 p-5 text-white">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-amber-300 text-neutral-950">
          <Calculator aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
            Mathematical model
          </p>
          <h2 className="text-xl font-bold">{section.title}</h2>
        </div>
      </div>
      <p className="mt-4 leading-7 text-neutral-200">{section.body}</p>
      {section.formula ? (
        <MathExpression
          formula={section.formula}
          display
          className="mt-5 max-w-full overflow-x-auto rounded-md border border-white/10 bg-white p-4 text-neutral-950"
        />
      ) : null}
    </section>
  );
}

export function MathExpression({
  formula,
  display = false,
  className,
}: {
  formula: string;
  display?: boolean;
  className?: string;
}) {
  const renderedFormula = useMemo(
    () =>
      katex.renderToString(formula, {
        displayMode: display,
        throwOnError: false,
        strict: false,
      }),
    [display, formula],
  );
  const mathClassName = cx(
    "crypto-math",
    display ? "block" : "inline-block max-w-full align-middle",
    className,
  );

  if (display) {
    return (
      <div
        className={mathClassName}
        dangerouslySetInnerHTML={{ __html: renderedFormula }}
      />
    );
  }

  return (
    <span
      className={mathClassName}
      dangerouslySetInnerHTML={{ __html: renderedFormula }}
    />
  );
}

export function MathOrText({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  if (/[=^\\]/.test(value)) {
    return <MathExpression formula={value} className={className} />;
  }

  return <p className={className}>{value}</p>;
}

export function KeyLifecyclePanel({ module }: { module: LessonModule }) {
  const symmetricSteps = [
    ["Generate", "Create high-entropy secret key material."],
    ["Distribute", "Move the shared key through a protected channel."],
    ["Use", "Encrypt and decrypt with the same secret key."],
    ["Rotate", "Replace old keys before exposure or overuse becomes dangerous."],
  ];
  const asymmetricSteps = [
    ["Parameterize", "Choose public domain parameters appropriate to the scheme."],
    ["Keep private", "Generate and protect the private secret value."],
    ["Publish public", "Derive and share only the public key."],
    ["Validate", "Check key structure and reject invalid public values."],
  ];
  const steps = module.family === "symmetric" ? symmetricSteps : asymmetricSteps;

  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-100 text-cyan-950">
          <KeyRound aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Key lifecycle
          </p>
          <h2 className="text-xl font-bold text-neutral-950">
            {module.family === "symmetric" ? "Shared secret path" : "Public/private key path"}
          </h2>
        </div>
      </div>
      <ol className="mt-5 grid gap-3 md:grid-cols-4">
        {steps.map(([title, body], index) => (
          <li key={title} className="rounded-md bg-[#f7f4ee] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 font-bold text-neutral-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function BitBlockGrid({
  bitPattern,
  activeBitIndexes,
}: {
  bitPattern: string;
  activeBitIndexes: number[];
}) {
  const bits = bitPattern.replace(/\s/g, "").split("");

  return (
    <div
      className="grid grid-cols-4 gap-2 sm:grid-cols-8"
      aria-label={`Bit pattern ${bits.join("")}`}
    >
      {bits.map((bit, index) => {
        const active = activeBitIndexes.includes(index);

        return (
          <span
            key={`${index}-${bit}`}
            className={cx(
              "grid aspect-square min-h-10 place-items-center rounded-md border font-mono text-sm font-bold motion-safe:transition-transform motion-safe:duration-150",
              active
                ? "border-emerald-300 bg-emerald-300 text-neutral-950 motion-safe:scale-105"
                : "border-white/10 bg-white/10 text-neutral-100",
            )}
          >
            {bit}
          </span>
        );
      })}
    </div>
  );
}

export function ToyVisualizer({ config }: { config: VisualizerConfig }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const activeStep = config.steps[activeIndex];

  useEffect(() => {
    if (!isPlaying || reducedMotion) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => {
        const next = current + 1;
        return next >= config.steps.length ? 0 : next;
      });
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [activeIndex, config.steps.length, isPlaying, reducedMotion]);

  return (
    <section className="rounded-lg border border-neutral-900/10 bg-neutral-950 p-5 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Interactive foundation demo
          </p>
          <h2 className="mt-2 text-2xl font-black">{config.title}</h2>
          <p className="mt-3 leading-7 text-neutral-300">{config.caption}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
            className="grid min-h-10 min-w-10 place-items-center rounded-md border border-white/10 bg-white/10 text-white transition-colors duration-100 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
            aria-label="Previous visualizer step"
            title="Previous step"
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((current) => !current)}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-300 px-3 text-sm font-bold text-neutral-950 transition-colors duration-100 hover:bg-emerald-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          >
            {isPlaying ? <Pause aria-hidden="true" size={17} /> : <Play aria-hidden="true" size={17} />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveIndex((current) => Math.min(config.steps.length - 1, current + 1))
            }
            className="grid min-h-10 min-w-10 place-items-center rounded-md border border-white/10 bg-white/10 text-white transition-colors duration-100 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
            aria-label="Next visualizer step"
            title="Next step"
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-mono text-sm text-neutral-300">{activeStep.inputLabel}</p>
            <ArrowRight aria-hidden="true" className="text-amber-300" size={18} />
            <p className="font-mono text-sm text-neutral-300">{activeStep.outputLabel}</p>
          </div>
          <BitBlockGrid
            bitPattern={activeStep.bitPattern}
            activeBitIndexes={activeStep.activeBitIndexes}
          />
        </div>
        <div className="rounded-lg bg-white p-4 text-neutral-950">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Step {activeIndex + 1} of {config.steps.length}
          </p>
          <h3 className="mt-2 text-xl font-black">{activeStep.label}</h3>
          <p className="mt-3 leading-7 text-neutral-700">{activeStep.description}</p>
          <div className="mt-5 grid grid-cols-4 gap-2" aria-label="Visualizer step selector">
            {config.steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cx(
                  "min-h-10 rounded-md text-sm font-bold transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700",
                  index === activeIndex
                    ? "bg-neutral-950 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                )}
                aria-label={`Go to ${step.label}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          {reducedMotion ? (
            <p className="mt-4 text-sm font-medium text-neutral-600">
              Reduced motion is enabled; autoplay stays manual.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function GlossaryDrawer({ module }: { module: LessonModule }) {
  return (
    <aside className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-amber-100 text-amber-950">
          <BookOpen aria-hidden="true" size={18} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Glossary
          </p>
          <h2 className="text-xl font-bold text-neutral-950">{module.shortTitle} terms</h2>
        </div>
      </div>
      <div className="mt-5 grid gap-2">
        {module.glossary.map((entry) => (
          <details
            key={entry.term}
            className="rounded-md border border-neutral-900/10 bg-[#f7f4ee] p-3"
          >
            <summary className="cursor-pointer text-sm font-bold text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
              {entry.term}
            </summary>
            <p className="mt-2 text-sm leading-6 text-neutral-700">{entry.definition}</p>
          </details>
        ))}
      </div>
    </aside>
  );
}

export function ReferenceCallouts({ references }: { references: Reference[] }) {
  if (!references.length) {
    return null;
  }

  return (
    <div className="min-w-0 rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-cyan-300">
          <Library aria-hidden="true" size={18} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Sources
          </p>
          <h2 className="text-xl font-bold text-neutral-950">Reference backbone</h2>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {references.map((reference) => (
          <a
            key={reference.id}
            href={reference.url}
            target="_blank"
            rel="noreferrer"
              className="group min-w-0 rounded-md border border-neutral-900/10 bg-[#f7f4ee] p-4 transition-colors duration-100 hover:border-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
          >
            <div className="flex min-w-0 items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-950">{reference.title}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  {reference.publisher} / {reference.year}
                </p>
              </div>
              <ExternalLink
                aria-hidden="true"
                className="shrink-0 text-neutral-500 transition-colors duration-100 group-hover:text-neutral-950"
                size={17}
              />
            </div>
            <p className="mt-3 break-words text-sm leading-6 text-neutral-700">{reference.note}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

export function SectionDetail({ section }: { section: LessonSection }) {
  const references = getReferencesForSection(section);

  if (section.type === "math") {
    return (
      <div className="grid min-w-0 gap-4">
        <MathPanel section={section} />
        <ReferenceCallouts references={references} />
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
        {section.type.replace("-", " ")}
      </p>
      <h2 className="mt-2 text-2xl font-black text-neutral-950">{section.title}</h2>
      <p className="mt-3 text-base leading-7 text-neutral-700">{section.body}</p>
      <ReferenceCallouts references={references} />
    </section>
  );
}

export function CheckpointCard({ module }: { module: LessonModule }) {
  const [revealed, setRevealed] = useState(false);
  const prompt =
    module.family === "symmetric"
      ? "What must be true for decryption to recover the original plaintext?"
      : "What value must remain private, and what hard problem protects it?";
  const answer =
    module.family === "symmetric"
      ? "The decryption process must use the correct shared key and the inverse path defined by the cipher construction."
      : "The private secret must remain protected; the public values are designed so recovering that secret requires solving the relevant hard problem.";

  return (
    <section className="rounded-lg border border-neutral-900/10 bg-emerald-100 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-emerald-300">
          <GraduationCap aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900">
            Checkpoint
          </p>
          <h2 className="text-xl font-bold text-neutral-950">Before moving on</h2>
        </div>
      </div>
      <p className="mt-5 text-lg font-bold text-neutral-950">{prompt}</p>
      {revealed ? <p className="mt-3 leading-7 text-neutral-800">{answer}</p> : null}
      <button
        type="button"
        onClick={() => setRevealed((current) => !current)}
        className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-bold text-white transition-colors duration-100 hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
      >
        <Sparkles aria-hidden="true" size={17} />
        {revealed ? "Hide answer" : "Reveal answer"}
      </button>
    </section>
  );
}

export function PresenterControls({
  current,
  total,
  onPrevious,
  onNext,
}: {
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-neutral-900/10 bg-white p-2 shadow-lg">
      <button
        type="button"
        onClick={onPrevious}
        className="grid min-h-10 min-w-10 place-items-center rounded-md bg-neutral-100 text-neutral-950 transition-colors duration-100 hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        aria-label="Previous slide"
        title="Previous slide"
      >
        <ArrowLeft aria-hidden="true" size={18} />
      </button>
      <span className="min-w-20 text-center text-sm font-bold text-neutral-700">
        {current + 1} / {total}
      </span>
      <button
        type="button"
        onClick={onNext}
        className="grid min-h-10 min-w-10 place-items-center rounded-md bg-neutral-950 text-white transition-colors duration-100 hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        aria-label="Next slide"
        title="Next slide"
      >
        <ArrowRight aria-hidden="true" size={18} />
      </button>
    </div>
  );
}

export function SlideFrame({
  activeSlide,
  current,
}: {
  activeSlide: (typeof slideScaffold)[number];
  current: number;
}) {
  const Icon = [ShieldCheck, Route, Layers3, Waypoints, Binary, Library][current] ?? Presentation;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-5 text-white md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl flex-col rounded-lg border border-white/10 bg-[#14110f] p-6 md:p-10">
        <div className="flex items-start justify-between gap-6">
          <Link
            to="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-sm font-bold text-neutral-300 transition-colors duration-100 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Exit deck
          </Link>
          <span className="rounded-md bg-emerald-300 px-3 py-1 text-sm font-black text-neutral-950">
            Phase 1
          </span>
        </div>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_360px]">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {activeSlide.kicker}
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-black leading-tight md:text-7xl">
              {activeSlide.title}
            </h1>
            <ul className="mt-10 grid max-w-4xl gap-4">
              {activeSlide.points.map((point) => (
                <li key={point} className="flex gap-4 text-xl leading-9 text-neutral-200">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-2 shrink-0 text-amber-300"
                    size={22}
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <aside className="hidden rounded-lg border border-white/10 bg-white p-6 text-neutral-950 lg:block">
            <span className="grid h-24 w-24 place-items-center rounded-md bg-neutral-950 text-emerald-300">
              <Icon aria-hidden="true" size={44} />
            </span>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Slide scaffold
            </p>
            <p className="mt-3 text-5xl font-black">{String(current + 1).padStart(2, "0")}</p>
            <p className="mt-4 leading-7 text-neutral-700">
              This deck route mirrors the editable slide scaffold and is optimized for classroom
              delivery.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
