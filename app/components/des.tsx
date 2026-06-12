import {
  Binary,
  Calculator,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { MathExpression, VisualizerDock } from "~/components/learning";
import { bitsToHex, desTrace, groupBits, type DesRoundTrace } from "~/content/des";

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

function BitGrid({
  bits,
  label,
  groupSize = 4,
  activeIndexes = [],
}: {
  bits: string;
  label: string;
  groupSize?: number;
  activeIndexes?: number[];
}) {
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
      <div
        className="grid grid-cols-8 gap-1 sm:grid-cols-16"
        aria-label={`${label}: ${groupBits(bits, groupSize)}`}
      >
        {bits.split("").map((bit, index) => {
          const active = activeIndexes.includes(index);

          return (
            <span
              key={`${label}-${index}`}
              className={cx(
                "grid aspect-square min-h-6 place-items-center rounded-sm font-mono text-[11px] font-bold motion-safe:transition-transform motion-safe:duration-150",
                active
                  ? "bg-emerald-300 text-neutral-950 motion-safe:scale-105"
                  : "bg-neutral-100 text-neutral-700",
              )}
            >
              {bit}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ValueCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-900/10 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </p>
      <code className="mt-3 block break-all font-mono text-xl font-black text-neutral-950">
        {value}
      </code>
      <p className="mt-3 text-sm leading-6 text-neutral-700">{detail}</p>
    </div>
  );
}

function FormulaStrip() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {[
        ["Key schedule", "K_i=\\operatorname{PC2}(\\operatorname{shift}_i(\\operatorname{PC1}(K)))"],
        ["Round function", "f(R,K_i)=P(S(E(R)\\oplus K_i))"],
        ["Feistel update", "L_i=R_{i-1},\\quad R_i=L_{i-1}\\oplus f(R_{i-1},K_i)"],
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

function RoundSelector({
  rounds,
  activeRoundIndex,
  onSelect,
}: {
  rounds: DesRoundTrace[];
  activeRoundIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" aria-label="DES round selector">
      {rounds.map((round, index) => (
        <button
          key={round.round}
          type="button"
          onClick={() => onSelect(index)}
          className={cx(
            "min-h-10 rounded-md text-sm font-black transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700",
            index === activeRoundIndex
              ? "bg-neutral-950 text-white"
              : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
          )}
          aria-label={`Show DES round ${round.round}`}
        >
          {round.round}
        </button>
      ))}
    </div>
  );
}

function RoundPipeline({ round }: { round: DesRoundTrace }) {
  const xorHighlights = useMemo(
    () =>
      round.mixedWithSubkey
        .split("")
        .map((bit, index) => (bit === "1" ? index : -1))
        .filter((index) => index >= 0),
    [round.mixedWithSubkey],
  );

  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
            Active DES round
          </p>
          <h3 className="mt-2 text-2xl font-black text-neutral-950">
            Round {round.round}: expand, mix, substitute, permute, XOR
          </h3>
        </div>
        <div className="rounded-md bg-amber-100 px-3 py-2 text-sm font-bold text-amber-950">
          Shift by {round.shift}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ValueCard
          label={`L${round.round - 1}`}
          value={bitsToHex(round.leftBefore)}
          detail="The left half before this Feistel round."
        />
        <ValueCard
          label={`R${round.round - 1}`}
          value={bitsToHex(round.rightBefore)}
          detail="The right half before expansion and key mixing."
        />
      </div>

      <div className="mt-5 grid gap-5">
        <BitGrid
          label="E expansion of R"
          bits={round.expandedRight}
          groupSize={6}
          activeIndexes={[0, 5, 6, 11, 12, 17, 18, 23, 24, 29, 30, 35, 36, 41, 42, 47]}
        />
        <BitGrid label={`Round ${round.round} subkey`} bits={round.subkey} groupSize={6} />
        <BitGrid
          label="E(R) xor subkey"
          bits={round.mixedWithSubkey}
          groupSize={6}
          activeIndexes={xorHighlights.slice(0, 24)}
        />
        <BitGrid label="S-box output" bits={round.sBoxOutput} />
        <BitGrid label="P permutation output" bits={round.permutationOutput} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ValueCard
          label={`L${round.round}`}
          value={bitsToHex(round.leftAfter)}
          detail="The old right half becomes the next left half."
        />
        <ValueCard
          label={`R${round.round}`}
          value={bitsToHex(round.rightAfter)}
          detail="The old left half is XORed with the round-function output."
        />
      </div>
    </section>
  );
}

function KeyScheduleTable({
  rounds,
  activeRoundIndex,
  onSelect,
}: {
  rounds: DesRoundTrace[];
  activeRoundIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-100 text-cyan-950">
          <KeyRound aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            DES key schedule
          </p>
          <h3 className="text-xl font-bold text-neutral-950">56 effective bits become 16 subkeys</h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <BitGrid label="64-bit input key with parity bits" bits={desTrace.keyBits} />
        <BitGrid label="PC-1 output without parity bits" bits={desTrace.keyWithoutParity} />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-900/10 text-xs uppercase tracking-[0.14em] text-neutral-500">
              <th className="py-3 pr-4">Round</th>
              <th className="py-3 pr-4">Shift</th>
              <th className="py-3 pr-4">C half</th>
              <th className="py-3 pr-4">D half</th>
              <th className="py-3 pr-4">48-bit subkey</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round, index) => (
              <tr
                key={round.round}
                className={cx(
                  "border-b border-neutral-900/10",
                  index === activeRoundIndex ? "bg-emerald-100" : "",
                )}
              >
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    onClick={() => onSelect(index)}
                    className="min-h-10 rounded-md px-3 font-black text-neutral-950 transition-colors duration-100 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                  >
                    {round.round}
                  </button>
                </td>
                <td className="py-3 pr-4 font-mono">{round.shift}</td>
                <td className="py-3 pr-4 font-mono">{bitsToHex(round.c)}</td>
                <td className="py-3 pr-4 font-mono">{bitsToHex(round.d)}</td>
                <td className="py-3 pr-4 font-mono font-bold">{bitsToHex(round.subkey)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RoundSummaryTable({ rounds }: { rounds: DesRoundTrace[] }) {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-amber-100 text-amber-950">
          <Binary aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Round trace table
          </p>
          <h3 className="text-xl font-bold text-neutral-950">All 16 Feistel states</h3>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-900/10 text-xs uppercase tracking-[0.14em] text-neutral-500">
              <th className="py-3 pr-4">Round</th>
              <th className="py-3 pr-4">L after</th>
              <th className="py-3 pr-4">R after</th>
              <th className="py-3 pr-4">Subkey</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round) => (
              <tr key={round.round} className="border-b border-neutral-900/10">
                <td className="py-3 pr-4 font-black">{round.round}</td>
                <td className="py-3 pr-4 font-mono">{bitsToHex(round.leftAfter)}</td>
                <td className="py-3 pr-4 font-mono">{bitsToHex(round.rightAfter)}</td>
                <td className="py-3 pr-4 font-mono">{bitsToHex(round.subkey)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DesWalkthrough() {
  const [activeRoundIndex, setActiveRoundIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const activeRound = desTrace.rounds[activeRoundIndex];
  const matchesExpected = desTrace.ciphertextHex === desTrace.expectedCiphertextHex;
  const dockSteps = useMemo(
    () =>
      desTrace.rounds.map((round) => ({
        id: String(round.round),
        label: `Round ${round.round}`,
      })),
    [],
  );

  useEffect(() => {
    if (!isPlaying || reducedMotion) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveRoundIndex((current) => (current + 1) % desTrace.rounds.length);
    }, 1700);

    return () => window.clearTimeout(timer);
  }, [activeRoundIndex, isPlaying, reducedMotion]);

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
                  Real DES walkthrough
                </p>
                <h2 className="break-words text-2xl font-black">
                  One complete 64-bit block encryption
                </h2>
              </div>
            </div>
            <p className="mt-5 leading-7 text-neutral-300">
              This phase replaces the toy demo for DES with the real DES data path:
              initial permutation, PC-1/PC-2 key schedule, 16 Feistel rounds, final
              swap, and final permutation. The sample uses the classic standard test
              vector.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-md bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Plaintext
            </p>
            <code className="mt-2 block font-mono text-xl font-black text-white">
              {desTrace.plaintextHex}
            </code>
          </div>
          <div className="rounded-md bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              64-bit key
            </p>
            <code className="mt-2 block font-mono text-xl font-black text-white">
              {desTrace.keyHex}
            </code>
          </div>
          <div className="rounded-md bg-emerald-300 p-4 text-neutral-950">
            <p className="text-xs font-semibold uppercase tracking-[0.14em]">
              Computed ciphertext
            </p>
            <code className="mt-2 block font-mono text-xl font-black">
              {desTrace.ciphertextHex}
            </code>
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-emerald-300">
            <Calculator aria-hidden="true" size={19} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              DES equations
            </p>
            <h3 className="text-xl font-bold text-neutral-950">The formulas behind the animation</h3>
          </div>
        </div>
        <p className="mt-4 leading-7 text-neutral-700">
          DES uses a Feistel network. Each round keeps the transformation reversible
          even though the round function itself does not need to be inverted during
          decryption.
        </p>
        <div className="mt-5">
          <FormulaStrip />
        </div>
      </section>

      <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Initial block split
            </p>
            <h3 className="mt-2 text-xl font-bold text-neutral-950">
              IP reorders the 64 plaintext bits into L0 and R0
            </h3>
          </div>
          <div
            className={cx(
              "inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold",
              matchesExpected
                ? "bg-emerald-100 text-emerald-950"
                : "bg-red-100 text-red-950",
            )}
          >
            <CheckCircle2 aria-hidden="true" size={17} />
            {matchesExpected ? "Matches known vector" : "Vector mismatch"}
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <BitGrid label="Plaintext bits" bits={desTrace.plaintextBits} />
          <BitGrid label="Initial permutation output" bits={desTrace.initialPermutation} />
          <ValueCard
            label="L0"
            value={bitsToHex(desTrace.l0)}
            detail="Left half after the initial permutation."
          />
          <ValueCard
            label="R0"
            value={bitsToHex(desTrace.r0)}
            detail="Right half after the initial permutation."
          />
        </div>
      </section>

      <KeyScheduleTable
        rounds={desTrace.rounds}
        activeRoundIndex={activeRoundIndex}
        onSelect={setActiveRoundIndex}
      />

      <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Round controls
            </p>
            <h3 className="mt-2 text-xl font-bold text-neutral-950">
              Scrub through all 16 DES rounds
            </h3>
          </div>
          {reducedMotion ? (
            <p className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-700">
              Reduced motion is enabled; autoplay stays manual.
            </p>
          ) : null}
        </div>
        <div className="mt-5">
          <RoundSelector
            rounds={desTrace.rounds}
            activeRoundIndex={activeRoundIndex}
            onSelect={setActiveRoundIndex}
          />
        </div>
      </section>

      <RoundPipeline round={activeRound} />

      <RoundSummaryTable rounds={desTrace.rounds} />

      <section className="rounded-lg border border-neutral-900/10 bg-neutral-950 p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
          Final step
        </p>
        <h3 className="mt-2 text-2xl font-black">Swap after round 16, then apply FP</h3>
        <p className="mt-3 leading-7 text-neutral-300">
          DES concatenates R16 followed by L16 before the final permutation. The
          result below is the ciphertext for this one 64-bit block.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md bg-white p-4 text-neutral-950">
            <BitGrid label="Pre-output R16 || L16" bits={desTrace.preOutput} />
          </div>
          <div className="rounded-md bg-emerald-300 p-4 text-neutral-950">
            <p className="text-xs font-semibold uppercase tracking-[0.14em]">
              Ciphertext after final permutation
            </p>
            <code className="mt-3 block break-all font-mono text-3xl font-black">
              {desTrace.ciphertextHex}
            </code>
            <p className="mt-3 text-sm font-semibold">
              Expected standard vector: {desTrace.expectedCiphertextHex}
            </p>
          </div>
        </div>
      </section>

      <VisualizerDock
        steps={dockSteps}
        activeIndex={activeRoundIndex}
        onSelect={setActiveRoundIndex}
        playing={isPlaying}
        onTogglePlay={() => setIsPlaying((current) => !current)}
        onReset={() => {
          setActiveRoundIndex(0);
          setIsPlaying(false);
        }}
        stepNoun="Round"
        title="DES"
      />
    </section>
  );
}
