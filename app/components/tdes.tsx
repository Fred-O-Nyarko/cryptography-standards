import {
  CheckCircle2,
  KeyRound,
  Link2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { MathExpression, VisualizerDock } from "~/components/learning";
import { bitsToHex, groupBits, hexToBits } from "~/content/des";
import { tdesTrace, type TdesStage } from "~/content/tdes";

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
  value: string;
  detail: string;
  tone?: "light" | "dark" | "accent";
}) {
  return (
    <div
      className={cx(
        "rounded-lg border p-4",
        tone === "dark"
          ? "border-white/10 bg-white/10 text-white"
          : tone === "accent"
            ? "border-emerald-900/10 bg-emerald-300 text-neutral-950"
            : "border-neutral-900/10 bg-white text-neutral-950",
      )}
    >
      <p
        className={cx(
          "text-xs font-semibold uppercase tracking-[0.16em]",
          tone === "dark" ? "text-neutral-400" : "text-neutral-500",
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

function BitGrid({ bits, label }: { bits: string; label: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
          {label}
        </p>
        <code className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-800">
          {bits.length} bits
        </code>
      </div>
      <div className="grid grid-cols-8 gap-1 sm:grid-cols-16" aria-label={`${label}: ${groupBits(bits)}`}>
        {bits.split("").map((bit, index) => (
          <span
            key={`${label}-${index}`}
            className="grid aspect-square min-h-6 place-items-center rounded-sm bg-neutral-100 font-mono text-[11px] font-bold text-neutral-700"
          >
            {bit}
          </span>
        ))}
      </div>
    </div>
  );
}

function StageButton({
  stage,
  index,
  active,
  onSelect,
}: {
  stage: TdesStage;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "rounded-lg border p-4 text-left transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700",
        active
          ? "border-neutral-950 bg-neutral-950 text-white"
          : "border-neutral-900/10 bg-white text-neutral-950 hover:border-neutral-950",
      )}
    >
      <p className={cx("text-xs font-semibold uppercase tracking-[0.14em]", active ? "text-emerald-300" : "text-neutral-500")}>
        Stage {index + 1} · {stage.keyLabel}
      </p>
      <h3 className="mt-2 text-lg font-black">{stage.operation === "encrypt" ? "DES encrypt" : "DES decrypt"}</h3>
      <code className={cx("mt-3 block break-all font-mono text-sm", active ? "text-neutral-200" : "text-neutral-700")}>
        {stage.outputHex}
      </code>
    </button>
  );
}

function StageDetail({ stage }: { stage: TdesStage }) {
  const firstSubkey = bitsToHex(stage.trace.rounds[0].subkey);
  const lastSubkey = bitsToHex(stage.trace.rounds[15].subkey);
  const operationLabel = stage.operation === "encrypt" ? "encryption" : "decryption";

  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
            Active 3DES stage
          </p>
          <h3 className="mt-2 text-2xl font-black text-neutral-950">
            {stage.label} with {stage.keyLabel}
          </h3>
          <p className="mt-3 max-w-3xl leading-7 text-neutral-700">{stage.description}</p>
        </div>
        <span
          className={cx(
            "inline-flex min-h-10 items-center rounded-md px-3 text-sm font-bold",
            stage.operation === "encrypt"
              ? "bg-emerald-100 text-emerald-950"
              : "bg-amber-100 text-amber-950",
          )}
        >
          DES {operationLabel}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ValueCard label="Input block" value={stage.inputHex} detail="The 64-bit block entering this DES stage." />
        <ValueCard label={stage.keyLabel} value={stage.keyHex} detail="The 64-bit DES key representation for this stage." />
        <ValueCard label="Output block" value={stage.outputHex} detail="The 64-bit block produced by this DES stage." />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <BitGrid label="Stage input bits" bits={hexToBits(stage.inputHex)} />
        <BitGrid label="Stage output bits" bits={hexToBits(stage.outputHex)} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <ValueCard
          label="First active DES subkey"
          value={firstSubkey}
          detail={
            stage.operation === "encrypt"
              ? "Encryption starts with the stage key schedule in normal order."
              : "Decryption starts with the same DES subkeys in reverse order."
          }
        />
        <ValueCard
          label="Last active DES subkey"
          value={lastSubkey}
          detail="Each 3DES stage still performs a complete 16-round DES operation."
        />
      </div>
    </section>
  );
}

function Pipeline({
  stages,
  activeIndex,
  onSelect,
}: {
  stages: TdesStage[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
        EDE pipeline
      </p>
      <h3 className="mt-2 text-xl font-bold text-neutral-950">
        One block passes through three DES stages
      </h3>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {stages.map((stage, index) => (
          <StageButton
            key={stage.id}
            stage={stage}
            index={index}
            active={index === activeIndex}
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>
    </section>
  );
}

function KeyingOptions() {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-100 text-cyan-950">
          <KeyRound aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Keying options
          </p>
          <h3 className="text-xl font-bold text-neutral-950">How the key bundle changes security</h3>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Option 1", "K_1, K_2, K_3\\text{ independent}", "Three-key TDEA; strongest legacy form."],
          ["Option 2", "K_1=K_3", "Two-key TDEA; legacy compatibility tradeoff."],
          ["Option 3", "K_1=K_2=K_3", "Collapses to single DES; compatibility only."],
        ].map(([title, formula, detail]) => (
          <div key={title} className="rounded-md bg-[#f7f4ee] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
              {title}
            </p>
            <MathExpression formula={formula} className="mt-2 font-bold text-neutral-950" />
            <p className="mt-2 text-sm leading-6 text-neutral-700">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DecryptionPath() {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-amber-100 text-amber-950">
          <RotateCcw aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Reverse path
          </p>
          <h3 className="text-xl font-bold text-neutral-950">3DES decryption undoes EDE in reverse</h3>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {tdesTrace.decryptionStages.map((stage) => (
          <div key={stage.id} className="rounded-md bg-[#f7f4ee] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {stage.keyLabel} · DES {stage.operation}
            </p>
            <code className="mt-2 block break-all font-mono text-sm font-black text-neutral-950">
              {stage.inputHex} {"->"} {stage.outputHex}
            </code>
            <p className="mt-3 text-sm leading-6 text-neutral-700">{stage.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-md bg-emerald-100 p-4">
        <p className="text-sm font-bold text-emerald-950">
          Recovered plaintext: <code>{tdesTrace.decryptedPlaintextHex}</code>
        </p>
      </div>
    </section>
  );
}

function CompatibilityDemo() {
  const demo = tdesTrace.compatibilityDemo;
  const matches = demo.desCiphertextHex === demo.tdesWithEqualKeysHex;

  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-emerald-300">
          <Link2 aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Why EDE exists
          </p>
          <h3 className="text-xl font-bold text-neutral-950">All equal keys collapse to single DES</h3>
        </div>
      </div>
      <p className="mt-4 leading-7 text-neutral-700">
        If K1, K2, and K3 are the same key, the middle decryption cancels the first
        encryption and the final encryption leaves exactly one DES encryption. That
        made EDE compatible with old single-DES systems.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <ValueCard label="Plaintext" value={demo.plaintextHex} detail="The DES compatibility test block." />
        <ValueCard label="Single DES" value={demo.desCiphertextHex} detail="Encrypt once with the shared key." />
        <ValueCard
          label="EDE with equal keys"
          value={demo.tdesWithEqualKeysHex}
          detail={matches ? "Matches single DES exactly." : "Does not match; the compatibility check failed."}
        />
      </div>
    </section>
  );
}

export function TdesWalkthrough() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const activeStage = tdesTrace.stages[activeIndex];
  const dockSteps = useMemo(
    () =>
      tdesTrace.stages.map((stage) => ({
        id: stage.id,
        label: `${stage.operation === "encrypt" ? "Encrypt" : "Decrypt"} with ${stage.keyLabel}`,
      })),
    [],
  );

  useEffect(() => {
    if (!isPlaying || reducedMotion) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % tdesTrace.stages.length);
    }, 1700);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPlaying, reducedMotion]);

  return (
    <section className="grid min-w-0 gap-6 [&>*]:min-w-0 [&>*]:w-full [&>*]:max-w-full">
      <div className="rounded-lg border border-neutral-900/10 bg-neutral-950 p-5 text-white">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-emerald-300 text-neutral-950">
                <ShieldCheck aria-hidden="true" size={22} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Real 3DES walkthrough
                </p>
                <h2 className="break-words text-2xl font-black">
                  Encrypt, decrypt, encrypt with three DES keys
                </h2>
              </div>
            </div>
            <p className="mt-5 leading-7 text-neutral-300">
              This module demonstrates real 3-key TDEA in EDE mode. It treats DES as
              the already-learned primitive and focuses on the composition, key bundle,
              compatibility behavior, and retirement status.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <ValueCard
            label="Plaintext"
            value={tdesTrace.plaintextHex}
            detail={tdesTrace.plaintextLabel}
            tone="dark"
          />
          <ValueCard
            label="3DES ciphertext"
            value={tdesTrace.ciphertextHex}
            detail="The final output after encrypt, decrypt, and encrypt stages."
            tone="accent"
          />
          <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-4">
            <div className="flex items-center gap-2 text-amber-200">
              <ShieldAlert aria-hidden="true" size={18} />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                Legacy status
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-200">
              3DES is useful for learning and legacy context, but NIST withdrew the
              TDEA recommendation effective January 1, 2024.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          EDE formula
        </p>
        <h3 className="mt-2 text-xl font-bold text-neutral-950">The composition is the lesson</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-neutral-950 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
              Encryption
            </p>
            <MathExpression
              formula="C=E_{K_3}(D_{K_2}(E_{K_1}(P)))"
              className="mt-2 text-sm"
            />
          </div>
          <div className="rounded-md bg-neutral-950 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">
              Decryption
            </p>
            <MathExpression
              formula="P=D_{K_1}(E_{K_2}(D_{K_3}(C)))"
              className="mt-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Key bundle
        </p>
        <h3 className="mt-2 text-xl font-bold text-neutral-950">Three DES keys drive three stages</h3>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {tdesTrace.keys.map((key) => (
            <ValueCard key={key.label} label={key.label} value={key.hex} detail={key.role} />
          ))}
        </div>
      </section>

      <Pipeline stages={tdesTrace.stages} activeIndex={activeIndex} onSelect={setActiveIndex} />

      <StageDetail stage={activeStage} />

      <DecryptionPath />

      <KeyingOptions />

      <CompatibilityDemo />

      <section className="rounded-lg border border-neutral-900/10 bg-emerald-100 p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 aria-hidden="true" className="text-emerald-900" size={22} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900">
              Algorithm check
            </p>
            <h3 className="text-xl font-bold text-neutral-950">The reverse path recovers the original block</h3>
          </div>
        </div>
        <p className="mt-4 leading-7 text-neutral-800">
          The computed ciphertext is <code>{tdesTrace.ciphertextHex}</code>, and the reverse
          D-E-D path recovers <code>{tdesTrace.decryptedPlaintextHex}</code>.
        </p>
      </section>

      <VisualizerDock
        steps={dockSteps}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        playing={isPlaying}
        onTogglePlay={() => setIsPlaying((current) => !current)}
        onReset={() => {
          setActiveIndex(0);
          setIsPlaying(false);
        }}
        stepNoun="Stage"
        title="3DES"
      />
    </section>
  );
}
