import {
  ArrowLeft,
  ArrowRight,
  Binary,
  Calculator,
  CheckCircle2,
  KeyRound,
  Pause,
  Play,
  ShieldAlert,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import {
  eccTrace,
  formatPoint,
  type EcPoint,
  type EccScalarStep,
} from "~/content/ecc";
import { MathExpression, MathOrText } from "~/components/learning";

type StageId = "curve" | "point-math" | "keygen" | "ecdh" | "toy-mask";

const stages: Array<{
  id: StageId;
  label: string;
  title: string;
  description: string;
}> = [
  {
    id: "curve",
    label: "Curve",
    title: "Inspect the finite-field curve",
    description: "The public curve and base point define the arithmetic setting.",
  },
  {
    id: "point-math",
    label: "Point math",
    title: "Add and double points modulo p",
    description: "ECC replaces ordinary multiplication with point addition rules.",
  },
  {
    id: "keygen",
    label: "Keygen",
    title: "Generate a public point from a private scalar",
    description: "The private key d becomes public point Q = dG.",
  },
  {
    id: "ecdh",
    label: "ECDH",
    title: "Compute a shared point two ways",
    description: "Alice and Bob reach the same point without revealing private scalars.",
  },
  {
    id: "toy-mask",
    label: "Toy mask",
    title: "Use the shared point as a classroom mask",
    description: "A toy ECIES-style mask shows how ECC normally supports encryption.",
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      mediaQuery.addEventListener("change", onStoreChange);
      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function ValueCard({
  label,
  value,
  detail,
  tone = "light",
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: "light" | "dark" | "accent" | "warning";
}) {
  const displayValue = String(value);

  return (
    <div
      className={cx(
        "rounded-lg border p-4",
        tone === "dark"
          ? "border-white/10 bg-white/10 text-white"
          : tone === "accent"
            ? "border-emerald-900/10 bg-emerald-300 text-neutral-950"
            : tone === "warning"
              ? "border-amber-900/10 bg-amber-100 text-amber-950"
              : "border-neutral-900/10 bg-white text-neutral-950",
      )}
    >
      <p
        className={cx(
          "text-xs font-semibold uppercase tracking-[0.16em]",
          tone === "dark" ? "text-neutral-300" : "text-neutral-500",
        )}
      >
        {label}
      </p>
      <MathOrText
        value={displayValue}
        className="mt-3 block break-all font-mono text-xl font-black"
      />
      <p className={cx("mt-3 text-sm leading-6", tone === "dark" ? "text-neutral-300" : "text-neutral-700")}>
        {detail}
      </p>
    </div>
  );
}

function FormulaStrip() {
  return (
    <div className="grid gap-3 lg:grid-cols-4">
      {[
        ["Curve", "y^2=x^3+ax+b\\pmod p"],
        ["Public key", "Q = dG"],
        ["ECDH", "S=d_A\\,Q_B=d_B\\,Q_A"],
        ["Toy mask", "c=m+x(S)\\bmod p"],
      ].map(([title, formula]) => (
        <div key={title} className="rounded-md bg-neutral-950 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">
            {title}
          </p>
          <MathExpression formula={formula} className="mt-2 text-sm text-neutral-100" />
        </div>
      ))}
    </div>
  );
}

function StageSelector({
  activeStage,
  onSelect,
}: {
  activeStage: StageId;
  onSelect: (stage: StageId) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5" aria-label="ECC stage selector">
      {stages.map((stage) => (
        <button
          key={stage.id}
          type="button"
          onClick={() => onSelect(stage.id)}
          aria-pressed={activeStage === stage.id}
          className={cx(
            "min-h-10 rounded-md px-3 text-sm font-black transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700",
            activeStage === stage.id
              ? "bg-neutral-950 text-white"
              : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
          )}
        >
          {stage.label}
        </button>
      ))}
    </div>
  );
}

function PlaybackControls({
  activeStage,
  playing,
  reducedMotion,
  onPrevious,
  onNext,
  onToggle,
}: {
  activeStage: StageId;
  playing: boolean;
  reducedMotion: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggle: () => void;
}) {
  const stage = stages.find((entry) => entry.id === activeStage) ?? stages[0];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-900/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          ECC walkthrough
        </p>
        <p className="mt-1 text-sm leading-6 text-neutral-700" aria-live="polite">
          {stage.title}
        </p>
        {reducedMotion ? (
          <p className="mt-1 text-sm font-semibold text-amber-800">
            Autoplay is disabled because reduced motion is enabled.
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPrevious}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-900/10 bg-white px-3 text-sm font-bold text-neutral-900 transition-colors duration-100 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Previous
        </button>
        <button
          type="button"
          onClick={onToggle}
          disabled={reducedMotion}
          aria-pressed={playing}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-neutral-950 px-3 text-sm font-bold text-white transition-colors duration-100 hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
        >
          {playing ? <Pause aria-hidden="true" size={16} /> : <Play aria-hidden="true" size={16} />}
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-900/10 bg-white px-3 text-sm font-bold text-neutral-900 transition-colors duration-100 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Next
          <ArrowRight aria-hidden="true" size={16} />
        </button>
      </div>
    </div>
  );
}

function pointKey(point: EcPoint) {
  return formatPoint(point);
}

function SvgPointLabel({ label, x, y }: { label: string; x: number; y: number }) {
  const subscript = label.startsWith("Q_") ? label.slice(2) : null;

  if (subscript) {
    return (
      <text x={x} y={y} className="fill-neutral-950 font-mono text-[12px] font-black">
        <tspan>Q</tspan>
        <tspan dy="3" fontSize="8">
          {subscript}
        </tspan>
      </text>
    );
  }

  return (
    <text x={x} y={y} className="fill-neutral-950 font-mono text-[12px] font-black">
      {label}
    </text>
  );
}

function CurvePlot({ activePoints }: { activePoints: EcPoint[] }) {
  const size = 320;
  const padding = 24;
  const span = size - padding * 2;
  const curveFormula = `y^2=x^3+${eccTrace.a}x+${eccTrace.b}\\pmod{${eccTrace.p}}`;
  const activeSet = new Set(activePoints.map(pointKey));
  const activeLabelEntries: Array<[string, string]> = (
    [
      [formatPoint(eccTrace.basePoint), "G"],
      [formatPoint(eccTrace.alicePublic), "Q_A"],
      [formatPoint(eccTrace.bobPublic), "Q_B"],
      [formatPoint(eccTrace.sharedFromAlice), "S"],
    ] satisfies Array<[string, string]>
  ).filter(([point]) => activeSet.has(point));
  const activeLabels = new Map(activeLabelEntries);
  const toX = (x: number) => padding + (x / (eccTrace.p - 1)) * span;
  const toY = (y: number) => size - padding - (y / (eccTrace.p - 1)) * span;

  return (
    <div className="rounded-lg border border-neutral-900/10 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            2D finite-field curve
          </p>
          <h3 className="mt-1 text-xl font-bold text-neutral-950">
            <MathExpression formula={curveFormula} />
          </h3>
        </div>
        <span className="inline-flex min-h-8 items-center self-start rounded-md bg-neutral-100 px-2 text-xs font-bold text-neutral-700">
          {eccTrace.curvePoints.length} affine points
        </span>
      </div>

      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Finite-field curve points for ${eccTrace.equation}`}
        className="mt-4 h-auto w-full rounded-md border border-neutral-900/10 bg-neutral-50"
      >
        {Array.from({ length: eccTrace.p }, (_, index) => (
          <g key={`grid-${index}`}>
            <line
              x1={toX(index)}
              x2={toX(index)}
              y1={padding}
              y2={size - padding}
              className="stroke-neutral-200"
              strokeWidth="1"
            />
            <line
              x1={padding}
              x2={size - padding}
              y1={toY(index)}
              y2={toY(index)}
              className="stroke-neutral-200"
              strokeWidth="1"
            />
          </g>
        ))}
        {eccTrace.curvePoints.map((point) => {
          const key = formatPoint(point);
          const active = activeSet.has(key);
          const label = activeLabels.get(key);

          return (
            <g key={key}>
              <circle
                cx={toX(point.x)}
                cy={toY(point.y)}
                r={active ? 6 : 4}
                className={active ? "fill-emerald-500" : "fill-neutral-800"}
              />
              {label ? (
                <SvgPointLabel label={label} x={toX(point.x) + 8} y={toY(point.y) - 8} />
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {[
          ["G", formatPoint(eccTrace.basePoint)],
          ["Q_A", formatPoint(eccTrace.alicePublic)],
          ["Q_B", formatPoint(eccTrace.bobPublic)],
          ["S", formatPoint(eccTrace.sharedFromAlice)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md bg-neutral-100 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {label.startsWith("Q_") ? <MathExpression formula={label} /> : label}
            </p>
            <code className="mt-1 block font-mono text-sm font-black text-neutral-950">
              {value}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepListPanel({
  title,
  kicker,
  body,
  steps,
  icon,
}: {
  title: string;
  kicker: string;
  body: string;
  steps: Array<{ id: string; label: string; formula: string; value: string; explanation: string }>;
  icon: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
            {kicker}
          </p>
          <h3 className="mt-2 text-2xl font-black text-neutral-950">{title}</h3>
          <p className="mt-3 max-w-3xl leading-7 text-neutral-700">{body}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-emerald-300">
          {icon}
        </span>
      </div>

      <ol className="mt-5 grid gap-3">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="grid grid-cols-[auto_1fr] gap-4 rounded-lg border border-neutral-900/10 bg-neutral-50 p-4"
          >
            <span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 font-mono text-sm font-black text-emerald-300">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {step.label}
              </p>
              <MathExpression
                formula={step.formula}
                className="mt-2 text-sm font-black text-neutral-950"
              />
              <MathOrText
                value={step.value}
                className="mt-2 text-base font-bold text-neutral-950"
              />
              <p className="mt-2 text-sm leading-6 text-neutral-700">{step.explanation}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ScalarTable({ steps }: { steps: EccScalarStep[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-900/10 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            <th className="py-3 pr-4">Step</th>
            <th className="py-3 pr-4">Scalar bit</th>
            <th className="py-3 pr-4">Before double</th>
            <th className="py-3 pr-4">After double</th>
            <th className="py-3 pr-4">After optional add</th>
            <th className="py-3 pr-4">Result</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step) => (
            <tr key={step.step} className="border-b border-neutral-900/10 align-top">
              <td className="py-3 pr-4 font-black text-neutral-950">{step.step}</td>
              <td className="py-3 pr-4">
                <span
                  className={cx(
                    "inline-flex min-h-8 min-w-8 items-center justify-center rounded-md font-mono text-sm font-black",
                    step.bit === "1" ? "bg-emerald-100 text-emerald-950" : "bg-neutral-100 text-neutral-800",
                  )}
                >
                  {step.bit}
                </span>
              </td>
              <td className="py-3 pr-4 font-mono text-xs font-bold text-neutral-800">
                {formatPoint(step.beforeDouble)}
              </td>
              <td className="py-3 pr-4 font-mono text-xs font-bold text-neutral-800">
                {formatPoint(step.afterDouble)}
              </td>
              <td className="py-3 pr-4 font-mono text-xs font-bold text-neutral-800">
                {step.afterAdd ? formatPoint(step.afterAdd) : "skip"}
              </td>
              <td className="py-3 pr-4 font-mono text-xs font-black text-neutral-950">
                {formatPoint(step.result)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MultiplesPanel() {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-100 text-cyan-950">
          <Waypoints aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Scalar multiples
          </p>
          <h3 className="text-xl font-bold text-neutral-950">Repeated point addition cycles back to O</h3>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {eccTrace.multiples.map((entry) => (
          <div
            key={entry.scalar}
            className={cx(
              "rounded-md border p-3",
              entry.scalar === eccTrace.alicePrivate || entry.scalar === eccTrace.bobPrivate
                ? "border-emerald-700 bg-emerald-50"
                : "border-neutral-900/10 bg-neutral-50",
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {entry.scalar}G
            </p>
            <code className="mt-1 block font-mono text-sm font-black text-neutral-950">
              {formatPoint(entry.point)}
            </code>
          </div>
        ))}
      </div>
    </section>
  );
}

function CurvePanel() {
  return (
    <section className="grid gap-6">
      <CurvePlot
        activePoints={[
          eccTrace.basePoint,
          eccTrace.alicePublic,
          eccTrace.bobPublic,
          eccTrace.sharedFromAlice,
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-4">
        <ValueCard label="Field" value={`mod ${eccTrace.p}`} detail="Coordinates wrap around a prime field." />
        <ValueCard label="Curve" value={`a=${eccTrace.a}, b=${eccTrace.b}`} detail="These parameters define the classroom curve." />
        <ValueCard label="Base point" value={formatPoint(eccTrace.basePoint)} detail="The public generator for scalar multiplication." tone="accent" />
        <ValueCard label="Order" value={eccTrace.basePointOrder} detail="19G is the point at infinity O." />
      </div>
      <MultiplesPanel />
    </section>
  );
}

const pointMathOperations = [eccTrace.doubleExample, eccTrace.addExample];

function PointMathPanel() {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-100 text-cyan-950">
          <Calculator aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Point arithmetic
          </p>
          <h3 className="text-xl font-bold text-neutral-950">Addition and doubling use modular slopes</h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {pointMathOperations.map((operation) => (
          <div key={operation.id} className="rounded-lg border border-neutral-900/10 bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
              {operation.label}
            </p>
            <h4 className="mt-2 text-lg font-black text-neutral-950">
              {formatPoint(operation.left)} + {formatPoint(operation.right)} = {formatPoint(operation.result)}
            </h4>
            <MathExpression
              formula={operation.formula}
              className="mt-3 block rounded-md bg-neutral-950 px-3 py-2 text-xs font-bold text-neutral-100"
            />
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <ValueCard label="Numerator" value={operation.numerator} detail="Reduced modulo p." />
              <ValueCard label="Denominator inverse" value={operation.denominatorInverse} detail="Division means multiply by inverse." />
              <ValueCard label="lambda" value={operation.slope} detail="The modular slope." tone="accent" />
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-700">{operation.explanation}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function KeyGenerationPanel() {
  return (
    <section className="grid gap-6">
      <StepListPanel
        kicker="ECC key generation"
        title="A private scalar becomes a public point"
        body="ECC public keys are curve points. The one-way step is scalar multiplication: easy to compute forward, hard to reverse on real curves."
        steps={eccTrace.keyGenerationSteps}
        icon={<KeyRound aria-hidden="true" size={19} />}
      />
      <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Alice scalar multiplication
        </p>
        <h3 className="mt-2 text-xl font-bold text-neutral-950">
          Compute{" "}
          <MathExpression
            formula={`Q_A=${eccTrace.alicePrivate}G=${formatPoint(eccTrace.alicePublic)}`}
          />
        </h3>
        <div className="mt-5">
          <ScalarTable steps={eccTrace.aliceScalarSteps} />
        </div>
      </section>
    </section>
  );
}

function EcdhPanel() {
  return (
    <section className="grid gap-6">
      <StepListPanel
        kicker="ECDH-style agreement"
        title="Both sides reach the same point"
        body="Alice combines her private scalar with Bob's public point. Bob combines his private scalar with Alice's public point. The shared point matches."
        steps={eccTrace.ecdhSteps}
        icon={<Waypoints aria-hidden="true" size={19} />}
      />
      <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-4">
          <ValueCard label="Alice private" value={eccTrace.alicePrivate} detail="Kept secret by Alice." tone="warning" />
          <ValueCard label="Alice public" value={formatPoint(eccTrace.alicePublic)} detail="Published public point." />
          <ValueCard label="Bob private" value={eccTrace.bobPrivate} detail="Kept secret by Bob." tone="warning" />
          <ValueCard label="Bob public" value={formatPoint(eccTrace.bobPublic)} detail="Published public point." />
        </div>
        <div className="mt-5 rounded-lg bg-neutral-950 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
            Shared point equality
          </p>
          <MathExpression
            formula={`${eccTrace.alicePrivate}\\cdot ${formatPoint(eccTrace.bobPublic)}=${eccTrace.bobPrivate}\\cdot ${formatPoint(eccTrace.alicePublic)}=${formatPoint(eccTrace.sharedFromAlice)}`}
            className="mt-2 text-sm text-neutral-100"
          />
        </div>
      </section>
    </section>
  );
}

function ToyMaskPanel() {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-amber-100 text-amber-950">
          <ShieldAlert aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Classroom ECIES-style mask
          </p>
          <h3 className="text-xl font-bold text-neutral-950">Use the shared x-coordinate as a toy mask</h3>
        </div>
      </div>
      <p className="mt-4 max-w-3xl leading-7 text-neutral-700">
        Real ECC encryption schemes derive symmetric keys with a KDF and then use
        authenticated encryption. This classroom panel only shows how a shared point
        can become key material.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <ValueCard label="Shared point" value={formatPoint(eccTrace.sharedFromAlice)} detail="Both sides computed this point." />
        <ValueCard label="Mask" value={eccTrace.sharedMask} detail="Toy mask uses x(S)." tone="warning" />
        <ValueCard label="Ciphertext" value={eccTrace.ciphertext} detail={`${eccTrace.message}+${eccTrace.sharedMask} mod ${eccTrace.p}.`} />
        <ValueCard label="Decrypted" value={eccTrace.decryptedMessage} detail={`${eccTrace.ciphertext}-${eccTrace.sharedMask} mod ${eccTrace.p}.`} tone="accent" />
      </div>
    </section>
  );
}

function ActiveStage({ activeStage }: { activeStage: StageId }) {
  if (activeStage === "curve") {
    return <CurvePanel />;
  }

  if (activeStage === "point-math") {
    return <PointMathPanel />;
  }

  if (activeStage === "keygen") {
    return <KeyGenerationPanel />;
  }

  if (activeStage === "ecdh") {
    return <EcdhPanel />;
  }

  return <ToyMaskPanel />;
}

function ResultCheck() {
  const passed =
    formatPoint(eccTrace.sharedFromAlice) === formatPoint(eccTrace.sharedFromBob) &&
    eccTrace.decryptedMessage === eccTrace.message;

  return (
    <section className="rounded-lg bg-neutral-950 p-5 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            ECC round trip
          </p>
          <h3 className="mt-2 text-2xl font-black">Scalar multiplication creates matching key material</h3>
          <p className="mt-3 max-w-3xl leading-7 text-neutral-300">
            Alice and Bob compute the same shared point through different scalar
            multiplication paths. The toy mask then decrypts back to the original
            classroom message.
          </p>
        </div>
        <span
          className={cx(
            "inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold",
            passed ? "bg-emerald-300 text-neutral-950" : "bg-amber-200 text-amber-950",
          )}
        >
          <CheckCircle2 aria-hidden="true" size={17} />
          {passed ? "Verified" : "Mismatch"}
        </span>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ValueCard
          label="Alice shared"
          value={formatPoint(eccTrace.sharedFromAlice)}
          detail="Alice's private path."
          tone="dark"
        />
        <ValueCard
          label="Bob shared"
          value={formatPoint(eccTrace.sharedFromBob)}
          detail="Bob's private path."
          tone="dark"
        />
        <ValueCard
          label="Recovered message"
          value={eccTrace.decryptedMessage}
          detail="The toy mask is reversible with the shared point."
          tone="accent"
        />
      </div>
    </section>
  );
}

export function EccWalkthrough() {
  const reducedMotion = usePrefersReducedMotion();
  const [activeStage, setActiveStage] = useState<StageId>("curve");
  const [playing, setPlaying] = useState(false);
  const curveFormula = `y^2=x^3+${eccTrace.a}x+${eccTrace.b}\\pmod{${eccTrace.p}}`;
  const activeIndex = useMemo(
    () => stages.findIndex((stage) => stage.id === activeStage),
    [activeStage],
  );

  useEffect(() => {
    if (reducedMotion && playing) {
      setPlaying(false);
    }
  }, [playing, reducedMotion]);

  useEffect(() => {
    if (!playing || reducedMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveStage((current) => {
        const currentIndex = stages.findIndex((stage) => stage.id === current);
        return stages[(currentIndex + 1) % stages.length].id;
      });
    }, 1800);

    return () => window.clearInterval(intervalId);
  }, [playing, reducedMotion]);

  const goPrevious = () => {
    setActiveStage(stages[(activeIndex - 1 + stages.length) % stages.length].id);
  };

  const goNext = () => {
    setActiveStage(stages[(activeIndex + 1) % stages.length].id);
  };

  return (
    <section className="grid min-w-0 gap-6 [&>*]:min-w-0 [&>*]:w-full [&>*]:max-w-full">
      <section className="overflow-hidden rounded-lg bg-neutral-950 text-white">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex min-h-8 items-center gap-2 rounded-md bg-emerald-300 px-3 text-xs font-black uppercase tracking-[0.14em] text-neutral-950">
                <ShieldCheck aria-hidden="true" size={16} />
                Real ECC arithmetic
              </span>
              <span className="inline-flex min-h-8 items-center rounded-md bg-white/10 px-3 text-xs font-bold uppercase tracking-[0.14em] text-neutral-200">
                2D curve plot / scalar multiplication / ECDH
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-normal text-white md:text-4xl">
              Watch curve points turn private scalars into public keys
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-neutral-300">
              This module uses a small finite-field curve so the class can inspect every
              point. Real ECC uses standardized domain parameters and much larger fields.
            </p>
          </div>
          <div className="grid gap-3">
            <ValueCard
              label="Curve"
              value={curveFormula}
              detail="Public classroom domain parameters."
              tone="dark"
            />
            <ValueCard
              label="Base point"
              value={formatPoint(eccTrace.basePoint)}
              detail={`Order ${eccTrace.basePointOrder}.`}
              tone="dark"
            />
          </div>
        </div>
      </section>

      <FormulaStrip />

      <PlaybackControls
        activeStage={activeStage}
        playing={playing}
        reducedMotion={reducedMotion}
        onPrevious={goPrevious}
        onNext={goNext}
        onToggle={() => setPlaying((current) => !current)}
      />

      <StageSelector activeStage={activeStage} onSelect={setActiveStage} />

      <ActiveStage activeStage={activeStage} />

      <ResultCheck />

      <div className="rounded-lg border border-neutral-900/10 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-100 text-cyan-950">
            <Binary aria-hidden="true" size={19} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Teaching sequence
            </p>
            <h3 className="text-xl font-bold text-neutral-950">How to explain the full journey</h3>
          </div>
        </div>
        <ol className="mt-5 grid gap-3 md:grid-cols-5">
          {stages.map((stage, index) => (
            <li
              key={stage.id}
              className={cx(
                "rounded-md border p-4",
                stage.id === activeStage
                  ? "border-emerald-700 bg-emerald-50"
                  : "border-neutral-900/10 bg-neutral-50",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 font-black text-neutral-950">{stage.label}</p>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{stage.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
