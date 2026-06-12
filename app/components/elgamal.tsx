import {
  Binary,
  Calculator,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  UnlockKeyhole,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { MathExpression, MathOrText, VisualizerDock } from "~/components/learning";
import { elGamalTrace, type ElGamalModPowStep } from "~/content/elgamal";

type StageId = "group" | "keygen" | "encrypt" | "decrypt" | "randomness";

const stages: Array<{
  id: StageId;
  label: string;
  title: string;
  description: string;
}> = [
  {
    id: "group",
    label: "Group",
    title: "Choose public finite-field parameters",
    description: "The prime p and generator g define the public arithmetic setting.",
  },
  {
    id: "keygen",
    label: "Keygen",
    title: "Derive the public key from a private exponent",
    description: "The private exponent stays secret; the derived group element becomes public.",
  },
  {
    id: "encrypt",
    label: "Encrypt",
    title: "Use fresh randomness to create two ciphertext parts",
    description: "A new ephemeral secret creates a public component and a message mask.",
  },
  {
    id: "decrypt",
    label: "Decrypt",
    title: "Use the private key to remove the mask",
    description: "The receiver recomputes the shared secret from the first component and private exponent.",
  },
  {
    id: "randomness",
    label: "Randomness",
    title: "Show why reusing k is dangerous",
    description: "Reusing the same ephemeral key repeats the message mask.",
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
      <code className="mt-3 block break-all font-mono text-xl font-black">{value}</code>
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
        ["Public key", "y=g^x\\bmod p"],
        ["Ephemeral part", "c_1=g^k\\bmod p"],
        ["Shared secret", "s=y^k=c_1^x\\bmod p"],
        ["Message mask", "c_2=m\\cdot s\\bmod p"],
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
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5" aria-label="ElGamal stage selector">
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

function ParameterPanel() {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-100 text-cyan-950">
          <Calculator aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Public group
          </p>
          <h3 className="text-xl font-bold text-neutral-950">A tiny finite field for visible arithmetic</h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <ValueCard
          label="Prime modulus"
          value={elGamalTrace.p}
          detail="All nonzero values are multiplied modulo p."
        />
        <ValueCard
          label="Generator"
          value={elGamalTrace.g}
          detail="The powers of g walk through every nonzero group element."
          tone="accent"
        />
        <ValueCard
          label="Group order"
          value={elGamalTrace.order}
          detail="The multiplicative group modulo p has p-1 elements."
        />
        <ValueCard
          label="Security assumption"
          value="DLP"
          detail="Recovering the private exponent from the public value should be hard in real groups."
          tone="warning"
        />
      </div>

      <div className="mt-5 rounded-lg border border-neutral-900/10 bg-neutral-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Powers of g modulo p
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
          {elGamalTrace.powerCycle.map((entry) => (
            <div
              key={entry.exponent}
              className="rounded-md border border-neutral-900/10 bg-white p-2 text-center"
            >
              <MathExpression
                formula={`g^{${entry.exponent}}`}
                className="text-[12px] font-semibold text-neutral-500"
              />
              <p className="mt-1 font-mono text-sm font-black text-neutral-950">{entry.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
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

function ModPowTable({ steps, baseLabel }: { steps: ElGamalModPowStep[]; baseLabel: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-900/10 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            <th className="py-3 pr-4">Step</th>
            <th className="py-3 pr-4">Exponent bit</th>
            <th className="py-3 pr-4">Square</th>
            <th className="py-3 pr-4">Multiply when bit is 1</th>
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
              <td className="py-3 pr-4">
                <MathExpression
                  formula={`${step.beforeSquare}^{2}\\bmod ${elGamalTrace.p}=${step.afterSquare}`}
                  className="text-xs font-bold text-neutral-800"
                />
              </td>
              <td className="py-3 pr-4">
                {step.afterMultiply === undefined ? (
                  <span className="font-mono text-xs font-bold text-neutral-800">skip</span>
                ) : (
                  <MathExpression
                    formula={`${step.afterSquare}\\cdot ${baseLabel}\\bmod ${elGamalTrace.p}=${step.afterMultiply}`}
                    className="text-xs font-bold text-neutral-800"
                  />
                )}
              </td>
              <td className="py-3 pr-4 font-mono text-xs font-black text-neutral-950">
                {step.result}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeyGenerationPanel() {
  return (
    <section className="grid gap-6">
      <StepListPanel
        kicker="ElGamal key generation"
        title="Keep x private, publish y"
        body="ElGamal key generation is one modular exponentiation. The public key y is easy to compute from x, but recovering x from y is the discrete logarithm problem."
        steps={elGamalTrace.keyGenerationSteps}
        icon={<KeyRound aria-hidden="true" size={19} />}
      />
      <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Public key exponentiation
        </p>
        <h3 className="mt-2 text-xl font-bold text-neutral-950">
          Compute{" "}
          <MathExpression
            formula={`y=${elGamalTrace.g}^{${elGamalTrace.privateKey}}\\bmod ${elGamalTrace.p}`}
          />
        </h3>
        <div className="mt-5">
          <ModPowTable steps={elGamalTrace.privateKeyPowerSteps} baseLabel={String(elGamalTrace.g)} />
        </div>
      </section>
    </section>
  );
}

function EncryptionPanel() {
  return (
    <section className="grid gap-6">
      <StepListPanel
        kicker="ElGamal encryption"
        title="Fresh k creates a shared secret and a mask"
        body="A sender encrypts with public values plus a one-time secret. The ciphertext has two parts: an ephemeral public value and a masked message."
        steps={elGamalTrace.encryptionSteps}
        icon={<LockKeyhole aria-hidden="true" size={19} />}
      />
      <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-4">
          <ValueCard label="Message" value={elGamalTrace.message} detail="The classroom message representative." />
          <ValueCard label="Ephemeral k" value={elGamalTrace.ephemeralKey} detail="A fresh one-time secret for this encryption." tone="warning" />
          <ValueCard label="Shared secret" value={elGamalTrace.sharedSecret} detail="The sender computes this from the public key and fresh randomness." />
          <ValueCard label="Ciphertext" value={elGamalTrace.ciphertextLabel} detail="The pair sent to the receiver." tone="accent" />
        </div>
        <div className="mt-5 rounded-lg bg-neutral-950 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
            Encryption equation
          </p>
          <MathExpression
            formula={`c=(g^k\\bmod p,\\;m\\cdot y^k\\bmod p)=(${elGamalTrace.c1},${elGamalTrace.c2})`}
            className="mt-2 text-sm text-neutral-100"
          />
        </div>
      </section>
    </section>
  );
}

function DecryptionPanel() {
  return (
    <section className="grid gap-6">
      <StepListPanel
        kicker="ElGamal decryption"
        title="Private x recomputes and removes the mask"
        body="The receiver uses the first ciphertext component and the private exponent to recreate the same shared secret. Multiplying by the inverse of that secret removes the mask."
        steps={elGamalTrace.decryptionSteps}
        icon={<UnlockKeyhole aria-hidden="true" size={19} />}
      />
      <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Receiver exponentiation
        </p>
        <h3 className="mt-2 text-xl font-bold text-neutral-950">
          Compute{" "}
          <MathExpression
            formula={`s=${elGamalTrace.c1}^{${elGamalTrace.privateKey}}\\bmod ${elGamalTrace.p}`}
          />
        </h3>
        <div className="mt-5">
          <ModPowTable
            steps={elGamalTrace.decryptSharedSecretPowerSteps}
            baseLabel={String(elGamalTrace.c1)}
          />
        </div>
      </section>
    </section>
  );
}

function RandomnessPanel() {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-amber-100 text-amber-950">
          <ShieldAlert aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Ephemeral key reuse
          </p>
          <h3 className="text-xl font-bold text-neutral-950">Reusing k repeats the same mask</h3>
        </div>
      </div>
      <p className="mt-4 max-w-3xl leading-7 text-neutral-700">
        If two messages use the same k, they share the same secret s. That makes the
        c2 values comparable; if one plaintext becomes known, the repeated mask can
        expose the other message.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <ValueCard label="Known message" value={elGamalTrace.message} detail={`Known c2 is ${elGamalTrace.c2}.`} />
        <ValueCard label="Recovered mask" value={elGamalTrace.recoveredSharedSecretFromKnownMessage} detail="A known message exposes the repeated mask." tone="warning" />
        <ValueCard label="Second masked component" value={elGamalTrace.reusedC2} detail={`Produced from hidden message ${elGamalTrace.reusedMessage}.`} />
        <ValueCard label="Recovered second message" value={elGamalTrace.recoveredReusedMessage} detail="The repeated mask reveals the second value." tone="accent" />
      </div>
    </section>
  );
}

function ActiveStage({ activeStage }: { activeStage: StageId }) {
  if (activeStage === "group") {
    return <ParameterPanel />;
  }

  if (activeStage === "keygen") {
    return <KeyGenerationPanel />;
  }

  if (activeStage === "encrypt") {
    return <EncryptionPanel />;
  }

  if (activeStage === "decrypt") {
    return <DecryptionPanel />;
  }

  return <RandomnessPanel />;
}

function ResultCheck() {
  const passed = elGamalTrace.decryptedMessage === elGamalTrace.message;

  return (
    <section className="rounded-lg bg-neutral-950 p-5 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            ElGamal round trip
          </p>
          <h3 className="mt-2 text-2xl font-black">The private exponent recovers the message</h3>
          <p className="mt-3 max-w-3xl leading-7 text-neutral-300">
            This confirms the classroom ElGamal path: publish y, encrypt with fresh
            k, send two ciphertext components, and decrypt by recomputing the shared
            secret.
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
          label="Message"
          value={elGamalTrace.message}
          detail="Original classroom message representative."
          tone="dark"
        />
        <ValueCard
          label="Ciphertext"
          value={elGamalTrace.ciphertextLabel}
          detail="Two-part probabilistic ciphertext."
          tone="dark"
        />
        <ValueCard
          label="Decrypted"
          value={elGamalTrace.decryptedMessage}
          detail="Recovered with the private exponent."
          tone="accent"
        />
      </div>
    </section>
  );
}

export function ElGamalWalkthrough() {
  const reducedMotion = usePrefersReducedMotion();
  const [activeStage, setActiveStage] = useState<StageId>("group");
  const [playing, setPlaying] = useState(false);
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

  const dockSteps = useMemo(
    () => stages.map((stage) => ({ id: stage.id, label: stage.label })),
    [],
  );

  return (
    <section className="grid min-w-0 gap-6 [&>*]:min-w-0 [&>*]:w-full [&>*]:max-w-full">
      <section className="overflow-hidden rounded-lg bg-neutral-950 text-white">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex min-h-8 items-center gap-2 rounded-md bg-emerald-300 px-3 text-xs font-black uppercase tracking-[0.14em] text-neutral-950">
                <ShieldCheck aria-hidden="true" size={16} />
                Real ElGamal math
              </span>
              <span className="inline-flex min-h-8 items-center rounded-md bg-white/10 px-3 text-xs font-bold uppercase tracking-[0.14em] text-neutral-200">
                Discrete logs / fresh randomness / two-part ciphertext
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-normal text-white md:text-4xl">
              Watch ElGamal use randomness to hide a message
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-neutral-300">
              This walkthrough uses a tiny finite field so every modular exponentiation
              is visible. The same structure scales to real groups where discrete
              logarithms are hard.
            </p>
          </div>
          <div className="grid gap-3">
            <ValueCard
              label="Public parameters"
              value={elGamalTrace.publicParameters}
              detail="Shared by everyone using this classroom group."
              tone="dark"
            />
            <ValueCard
              label="Public / private key"
              value={`${elGamalTrace.publicKeyLabel} / ${elGamalTrace.privateKeyLabel}`}
              detail="Only x stays private."
              tone="dark"
            />
          </div>
        </div>
      </section>

      <FormulaStrip />

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

      <VisualizerDock
        steps={dockSteps}
        activeIndex={activeIndex}
        onSelect={(index) => setActiveStage(stages[index].id)}
        playing={playing}
        onTogglePlay={() => setPlaying((current) => !current)}
        onReset={() => {
          setActiveStage(stages[0].id);
          setPlaying(false);
        }}
        stepNoun="Stage"
        title="ElGamal"
      />
    </section>
  );
}
