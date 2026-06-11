import {
  ArrowLeft,
  ArrowRight,
  Binary,
  Calculator,
  CheckCircle2,
  KeyRound,
  Pause,
  Play,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { MathExpression } from "~/components/learning";
import { aesTrace, stateHexToRows, type AesRoundTrace } from "~/content/aes";

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

function formatByte(byte: number) {
  return byte.toString(16).padStart(2, "0").toUpperCase();
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
          tone === "dark" ? "text-neutral-300" : "text-neutral-500",
        )}
      >
        {label}
      </p>
      <code className="mt-3 block break-all font-mono text-lg font-black sm:text-xl">
        {value}
      </code>
      <p className={cx("mt-3 text-sm leading-6", tone === "dark" ? "text-neutral-300" : "text-neutral-700")}>
        {detail}
      </p>
    </div>
  );
}

function FormulaStrip() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {[
        ["Initial", "S_0=P\\oplus K_0"],
        ["Rounds 1-9", "S_i=\\operatorname{ARK}_{K_i}(\\operatorname{MC}(\\operatorname{SR}(\\operatorname{SB}(S_{i-1}))))"],
        ["Round 10", "C=\\operatorname{ARK}_{K_{10}}(\\operatorname{SR}(\\operatorname{SB}(S_9)))"],
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

function StateMatrix({
  hex,
  label,
  detail,
  active = false,
}: {
  hex: string;
  label: string;
  detail: string;
  active?: boolean;
}) {
  const rows = stateHexToRows(hex);

  return (
    <div
      className={cx(
        "rounded-lg border p-4",
        active ? "border-emerald-700 bg-emerald-50" : "border-neutral-900/10 bg-white",
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {label}
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-700">{detail}</p>
        </div>
        <span className="inline-flex min-h-8 items-center self-start rounded-md bg-neutral-100 px-2 text-xs font-bold text-neutral-700">
          4x4 bytes
        </span>
      </div>

      <div
        className="mt-4 grid grid-cols-4 gap-1"
        aria-label={`${label} state matrix with hex bytes ${hex}`}
      >
        {rows.flatMap((row, rowIndex) =>
          row.map((byte, columnIndex) => (
            <code
              key={`${label}-${rowIndex}-${columnIndex}`}
              className={cx(
                "grid min-h-11 place-items-center rounded-sm border font-mono text-sm font-black",
                active
                  ? "border-emerald-800/20 bg-white text-emerald-950"
                  : "border-neutral-900/10 bg-neutral-100 text-neutral-800",
              )}
            >
              {formatByte(byte)}
            </code>
          )),
        )}
      </div>

      <code className="mt-3 block break-all rounded-md bg-neutral-950 px-3 py-2 font-mono text-xs font-bold text-neutral-100">
        {hex}
      </code>
    </div>
  );
}

function RoundSelector({
  activeStep,
  onSelect,
}: {
  activeStep: number;
  onSelect: (step: number) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11" aria-label="AES round selector">
      {Array.from({ length: 11 }, (_, step) => (
        <button
          key={step}
          type="button"
          onClick={() => onSelect(step)}
          aria-pressed={activeStep === step}
          className={cx(
            "min-h-10 rounded-md px-2 text-sm font-black transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700",
            activeStep === step
              ? "bg-neutral-950 text-white"
              : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
          )}
        >
          {step === 0 ? "Init" : step}
        </button>
      ))}
    </div>
  );
}

function PlaybackControls({
  activeStep,
  playing,
  reducedMotion,
  onPrevious,
  onNext,
  onToggle,
}: {
  activeStep: number;
  playing: boolean;
  reducedMotion: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-900/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Round playback
        </p>
        <p className="mt-1 text-sm leading-6 text-neutral-700" aria-live="polite">
          {activeStep === 0 ? "Initial AddRoundKey" : `Round ${activeStep} of 10`}
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

function InitialRound() {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
            Initial AES step
          </p>
          <h3 className="mt-2 text-2xl font-black text-neutral-950">
            XOR plaintext with round key 0
          </h3>
          <p className="mt-3 max-w-3xl leading-7 text-neutral-700">
            AES starts by arranging the 128-bit plaintext as a state matrix and mixing it
            with the first round key. The next ten rounds transform this working state.
          </p>
        </div>
        <span className="inline-flex min-h-10 items-center rounded-md bg-emerald-100 px-3 text-sm font-bold text-emerald-950">
          AddRoundKey
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <StateMatrix
          label="Plaintext state"
          hex={aesTrace.initialStateHex}
          detail="Bytes are shown in AES state layout, filled column by column."
        />
        <StateMatrix
          label="Round key 0"
          hex={aesTrace.initialRoundKeyHex}
          detail="The original 128-bit key is the first AddRoundKey input."
        />
        <StateMatrix
          label="State after XOR"
          hex={aesTrace.afterInitialAddRoundKeyHex}
          detail="This state enters round 1 as S0."
          active
        />
      </div>
    </section>
  );
}

function RoundDetail({ round }: { round: AesRoundTrace }) {
  const finalRound = round.round === 10;

  const stages = [
    {
      label: `Round ${round.round} start`,
      hex: round.startStateHex,
      detail: "The state entering this AES round.",
    },
    {
      label: "After SubBytes",
      hex: round.afterSubBytesHex,
      detail: "Each byte is replaced through the AES S-box to add non-linearity.",
    },
    {
      label: "After ShiftRows",
      hex: round.afterShiftRowsHex,
      detail: "Rows 1, 2, and 3 rotate left by 1, 2, and 3 byte positions.",
    },
    round.afterMixColumnsHex
      ? {
          label: "After MixColumns",
          hex: round.afterMixColumnsHex,
          detail: "Each column is mixed using finite-field byte arithmetic.",
        }
      : null,
    {
      label: "After AddRoundKey",
      hex: round.afterAddRoundKeyHex,
      detail: `Round key ${round.round} is XORed into the state.`,
    },
  ].filter(Boolean) as Array<{ label: string; hex: string; detail: string }>;

  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
            Active AES round
          </p>
          <h3 className="mt-2 text-2xl font-black text-neutral-950">
            Round {round.round}: substitute, shift, mix, then add key
          </h3>
          <p className="mt-3 max-w-3xl leading-7 text-neutral-700">
            {finalRound
              ? "The last AES round keeps SubBytes, ShiftRows, and AddRoundKey, but omits MixColumns."
              : "The standard AES-128 round applies all four transformations before the next round begins."}
          </p>
        </div>
        <span
          className={cx(
            "inline-flex min-h-10 items-center rounded-md px-3 text-sm font-bold",
            finalRound ? "bg-amber-100 text-amber-950" : "bg-emerald-100 text-emerald-950",
          )}
        >
          {finalRound ? "Final round" : "Full round"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ValueCard
          label={`Round ${round.round} key`}
          value={round.roundKeyHex}
          detail="This 128-bit round key comes from AES-128 key expansion."
        />
        <ValueCard
          label="Round output"
          value={round.afterAddRoundKeyHex}
          detail={finalRound ? "This is the final ciphertext." : "This output becomes the next round input."}
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {stages.map((stage, index) => (
          <StateMatrix
            key={stage.label}
            label={stage.label}
            hex={stage.hex}
            detail={stage.detail}
            active={index === stages.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function TransformationMap({ activeStep }: { activeStep: number }) {
  const items = [
    ["Plaintext", aesTrace.plaintextHex],
    ["Key XOR", aesTrace.afterInitialAddRoundKeyHex],
    ["Rounds 1-9", activeStep > 0 ? aesTrace.rounds[Math.min(activeStep, 9) - 1].afterAddRoundKeyHex : aesTrace.afterInitialAddRoundKeyHex],
    ["Ciphertext", aesTrace.ciphertextHex],
  ];

  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-100 text-cyan-950">
          <Binary aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Block journey
          </p>
          <h3 className="text-xl font-bold text-neutral-950">One 128-bit block through AES-128</h3>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        {items.map(([label, value], index) => (
          <div
            key={label}
            className={cx(
              "rounded-md border p-4",
              (activeStep === 0 && index === 1) || (activeStep > 0 && index === 2) || activeStep === 10 && index === 3
                ? "border-emerald-700 bg-emerald-50"
                : "border-neutral-900/10 bg-neutral-50",
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {label}
            </p>
            <code className="mt-2 block break-all font-mono text-sm font-black text-neutral-950">
              {value}
            </code>
          </div>
        ))}
      </div>
    </section>
  );
}

function KeySchedulePanel({ activeStep, onSelect }: { activeStep: number; onSelect: (step: number) => void }) {
  const rows = useMemo(
    () =>
      aesTrace.roundKeysHex.map((roundKey, round) => ({
        round,
        roundKey,
        words: aesTrace.expandedWordsHex.slice(round * 4, round * 4 + 4),
        use: round === 0 ? "Initial AddRoundKey" : round === 10 ? "Final AddRoundKey" : `Round ${round} AddRoundKey`,
      })),
    [],
  );

  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-100 text-cyan-950">
          <KeyRound aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            AES-128 key expansion
          </p>
          <h3 className="text-xl font-bold text-neutral-950">4 input words expand into 44 words</h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ValueCard
          label="Input key"
          value={aesTrace.keyHex}
          detail="AES-128 starts with 16 key bytes, grouped as words w0 through w3."
        />
        <ValueCard
          label="Expanded material"
          value="w0 ... w43"
          detail="Every fourth word applies RotWord, SubWord, Rcon, then XOR with the word four positions back."
        />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-900/10 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              <th className="py-3 pr-4">Round</th>
              <th className="py-3 pr-4">Expanded words</th>
              <th className="py-3 pr-4">Round key</th>
              <th className="py-3 pr-4">Use</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.round}
                className={cx(
                  "border-b border-neutral-900/10 align-top",
                  row.round === activeStep ? "bg-emerald-50" : "bg-white",
                )}
              >
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    onClick={() => onSelect(row.round)}
                    className={cx(
                      "inline-flex min-h-10 min-w-16 items-center justify-center rounded-md px-3 font-black transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700",
                      row.round === activeStep
                        ? "bg-neutral-950 text-white"
                        : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
                    )}
                  >
                    {row.round === 0 ? "Init" : row.round}
                  </button>
                </td>
                <td className="py-3 pr-4">
                  <div className="grid grid-cols-4 gap-1">
                    {row.words.map((word, index) => (
                      <code
                        key={`${row.round}-${word}-${index}`}
                        className="rounded-sm bg-neutral-100 px-2 py-1 font-mono text-xs font-bold text-neutral-800"
                      >
                        {word}
                      </code>
                    ))}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <code className="block max-w-[280px] break-all font-mono text-xs font-black text-neutral-950">
                    {row.roundKey}
                  </code>
                </td>
                <td className="py-3 pr-4 text-neutral-700">{row.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DecryptionNote() {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-amber-100 text-amber-950">
          <Calculator aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Decryption preview
          </p>
          <h3 className="text-xl font-bold text-neutral-950">AES is inverted with reverse round keys</h3>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Inverse byte layer", "InvShiftRows and InvSubBytes undo the row rotations and S-box substitution."],
          ["Inverse column layer", "InvMixColumns reverses the column mixing for rounds 9 through 1."],
          ["Key order", "Round keys are applied from K10 back to K0 during decryption."],
        ].map(([title, detail]) => (
          <div key={title} className="rounded-md bg-[#f7f4ee] p-4">
            <p className="text-sm font-black text-neutral-950">{title}</p>
            <p className="mt-2 text-sm leading-6 text-neutral-700">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCheck() {
  const passed = aesTrace.ciphertextHex === aesTrace.expectedCiphertextHex;

  return (
    <section className="rounded-lg bg-neutral-950 p-5 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Known-answer check
          </p>
          <h3 className="mt-2 text-2xl font-black">
            AES-128 trace produces the expected ciphertext
          </h3>
          <p className="mt-3 max-w-3xl leading-7 text-neutral-300">
            The module uses a standard AES-128 educational test vector so students can
            connect every matrix step to a verifiable final result.
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
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ValueCard
          label="Computed ciphertext"
          value={aesTrace.ciphertextHex}
          detail="Output from the local AES-128 trace implementation."
          tone="dark"
        />
        <ValueCard
          label="Expected ciphertext"
          value={aesTrace.expectedCiphertextHex}
          detail="Known ciphertext for this plaintext and key."
          tone="accent"
        />
      </div>
    </section>
  );
}

export function AesWalkthrough() {
  const reducedMotion = usePrefersReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const activeRound = activeStep === 0 ? null : aesTrace.rounds[activeStep - 1];

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
      setActiveStep((step) => (step >= 10 ? 0 : step + 1));
    }, 1800);

    return () => window.clearInterval(intervalId);
  }, [playing, reducedMotion]);

  const goPrevious = () => setActiveStep((step) => (step <= 0 ? 10 : step - 1));
  const goNext = () => setActiveStep((step) => (step >= 10 ? 0 : step + 1));

  return (
    <section className="grid min-w-0 gap-6 [&>*]:min-w-0 [&>*]:w-full [&>*]:max-w-full">
      <section className="overflow-hidden rounded-lg bg-neutral-950 text-white">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex min-h-8 items-center gap-2 rounded-md bg-emerald-300 px-3 text-xs font-black uppercase tracking-[0.14em] text-neutral-950">
                <ShieldCheck aria-hidden="true" size={16} />
                Real AES-128
              </span>
              <span className="inline-flex min-h-8 items-center rounded-md bg-white/10 px-3 text-xs font-bold uppercase tracking-[0.14em] text-neutral-200">
                128-bit block / 10 rounds / 11 round keys
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-normal text-white md:text-4xl">
              Watch one AES block become ciphertext
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-neutral-300">
              This walkthrough uses actual AES-128 transformations: SubBytes, ShiftRows,
              MixColumns, AddRoundKey, and the AES-128 key schedule. The final round
              intentionally omits MixColumns.
            </p>
          </div>
          <div className="grid gap-3">
            <ValueCard
              label="Plaintext"
              value={aesTrace.plaintextHex}
              detail="The 128-bit block before encryption."
              tone="dark"
            />
            <ValueCard
              label="Key"
              value={aesTrace.keyHex}
              detail="The AES-128 secret key used for all round keys."
              tone="dark"
            />
          </div>
        </div>
      </section>

      <FormulaStrip />

      <PlaybackControls
        activeStep={activeStep}
        playing={playing}
        reducedMotion={reducedMotion}
        onPrevious={goPrevious}
        onNext={goNext}
        onToggle={() => setPlaying((current) => !current)}
      />

      <RoundSelector activeStep={activeStep} onSelect={setActiveStep} />

      <TransformationMap activeStep={activeStep} />

      {activeRound ? <RoundDetail round={activeRound} /> : <InitialRound />}

      <KeySchedulePanel activeStep={activeStep} onSelect={setActiveStep} />

      <DecryptionNote />

      <FinalCheck />
    </section>
  );
}
