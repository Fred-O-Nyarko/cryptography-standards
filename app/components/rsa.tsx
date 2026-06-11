import {
  ArrowLeft,
  ArrowRight,
  Binary,
  Calculator,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Pause,
  Play,
  ShieldAlert,
  ShieldCheck,
  UnlockKeyhole,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { MathExpression, MathOrText } from "~/components/learning";
import { rsaTrace, type RsaModPowStep } from "~/content/rsa";

type StageId = "keygen" | "inverse" | "encrypt" | "decrypt" | "safety";

const stages: Array<{
  id: StageId;
  label: string;
  title: string;
  description: string;
}> = [
  {
    id: "keygen",
    label: "Keygen",
    title: "Generate the linked key pair",
    description: "Choose primes, compute the modulus and totient, choose e, then derive d.",
  },
  {
    id: "inverse",
    label: "Inverse",
    title: "Find the private exponent",
    description: "Use the extended Euclidean algorithm to solve the modular inverse relation.",
  },
  {
    id: "encrypt",
    label: "Encrypt",
    title: "Raise the message with the public exponent",
    description: "Use square-and-multiply with the public exponent.",
  },
  {
    id: "decrypt",
    label: "Decrypt",
    title: "Raise the ciphertext with the private exponent",
    description: "Use square-and-multiply with the private exponent and recover the original message.",
  },
  {
    id: "safety",
    label: "Safety",
    title: "Separate classroom RSA from real RSA",
    description: "Textbook RSA teaches the trapdoor math, but safe deployments need padding schemes.",
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
        ["Modulus", "n=pq"],
        ["Totient", "\\varphi(n)=(p-1)(q-1)"],
        ["Private exponent", "ed\\equiv1\\pmod{\\varphi(n)}"],
        ["Encryption", "c=m^e\\bmod n"],
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
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5" aria-label="RSA stage selector">
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
          RSA walkthrough
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

function KeyMaterialPanel() {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-100 text-cyan-950">
          <KeyRound aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Key material
          </p>
          <h3 className="text-xl font-bold text-neutral-950">What becomes public and what stays private</h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <ValueCard
          label="Secret primes"
          value={`p=${rsaTrace.p}, q=${rsaTrace.q}`}
          detail="The trapdoor starts here. In real RSA these primes must be large, random, and protected."
          tone="warning"
        />
        <ValueCard
          label="Public modulus"
          value={rsaTrace.n}
          detail="n is safe to publish only when factoring it is computationally infeasible."
        />
        <ValueCard
          label="Public key"
          value={rsaTrace.publicKey}
          detail="Anyone can use this pair to encrypt a small encoded value in the textbook model."
          tone="accent"
        />
        <ValueCard
          label="Private key"
          value={rsaTrace.privateKey}
          detail="Only the private exponent holder can efficiently reverse the RSA operation."
        />
      </div>
    </section>
  );
}

function KeyGenerationPanel() {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
            RSA key generation
          </p>
          <h3 className="mt-2 text-2xl font-black text-neutral-950">
            Build a trapdoor from two primes
          </h3>
          <p className="mt-3 max-w-3xl leading-7 text-neutral-700">
            The public key exposes n and e. The private key depends on the totient, which is
            easy to compute only when p and q are known.
          </p>
        </div>
        <span className="inline-flex min-h-10 items-center rounded-md bg-amber-100 px-3 text-sm font-bold text-amber-950">
          Classroom-sized numbers
        </span>
      </div>

      <ol className="mt-5 grid gap-3">
        {rsaTrace.keyGenerationSteps.map((step, index) => (
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

function InversePanel() {
  const inverseRow =
    rsaTrace.inverseSteps.find((step) => step.remainderAfter === 1) ??
    rsaTrace.inverseSteps[rsaTrace.inverseSteps.length - 1];

  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-100 text-cyan-950">
          <Calculator aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Extended Euclidean algorithm
          </p>
          <h3 className="text-xl font-bold text-neutral-950">Derive d as a modular inverse</h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ValueCard
          label="Equation"
          value="ed congruent to 1"
          detail="The private exponent must undo the public exponent inside the RSA group."
        />
        <ValueCard
          label="Computed inverse"
          value={rsaTrace.d}
          detail={`Because ${rsaTrace.exponentRelation}, d is the private exponent.`}
          tone="accent"
        />
        <ValueCard
          label="Bezout row"
          value={`${inverseRow.coefficientForE}*${rsaTrace.e} + ${inverseRow.coefficientForPhi}*${rsaTrace.phi} = 1`}
          detail="The negative coefficient becomes positive after reducing modulo the totient."
        />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-900/10 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              <th className="py-3 pr-4">Step</th>
              <th className="py-3 pr-4">Division</th>
              <th className="py-3 pr-4">Remainder</th>
              <th className="py-3 pr-4">Identity</th>
            </tr>
          </thead>
          <tbody>
            {rsaTrace.inverseSteps.map((step) => (
              <tr
                key={step.step}
                className={cx(
                  "border-b border-neutral-900/10 align-top",
                  step.remainderAfter === 1 ? "bg-emerald-50" : "bg-white",
                )}
              >
                <td className="py-3 pr-4 font-black text-neutral-950">{step.step}</td>
                <td className="py-3 pr-4">
                  <code className="font-mono text-xs font-bold text-neutral-800">
                    {step.remainderBefore} = {step.quotient}*{step.divisor} + {step.remainderAfter}
                  </code>
                </td>
                <td className="py-3 pr-4 font-mono text-xs font-black text-neutral-950">
                  {step.remainderAfter}
                </td>
                <td className="py-3 pr-4">
                  <code className="font-mono text-xs font-bold text-neutral-800">
                    {step.coefficientForE}*{rsaTrace.e} + {step.coefficientForPhi}*{rsaTrace.phi}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ModPowTable({ steps }: { steps: RsaModPowStep[] }) {
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
                  formula={`${step.beforeSquare}^{2}\\bmod ${rsaTrace.n}=${step.afterSquare}`}
                  className="text-xs font-bold text-neutral-800"
                />
              </td>
              <td className="py-3 pr-4">
                {step.afterMultiply === undefined ? (
                  <span className="font-mono text-xs font-bold text-neutral-800">skip</span>
                ) : (
                  <MathExpression
                    formula={`${step.afterSquare}\\cdot\\text{base}\\bmod ${rsaTrace.n}=${step.afterMultiply}`}
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

function ModPowPanel({ mode }: { mode: "encrypt" | "decrypt" }) {
  const encrypt = mode === "encrypt";
  const steps = encrypt ? rsaTrace.encryptionSteps : rsaTrace.decryptionSteps;
  const input = encrypt ? rsaTrace.message : rsaTrace.ciphertext;
  const exponent = encrypt ? rsaTrace.e : rsaTrace.d;
  const output = encrypt ? rsaTrace.ciphertext : rsaTrace.decrypted;
  const Icon = encrypt ? LockKeyhole : UnlockKeyhole;

  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
            {encrypt ? "RSA encryption" : "RSA decryption"}
          </p>
          <h3 className="mt-2 text-2xl font-black text-neutral-950">
            {encrypt ? "Public exponent transforms the message" : "Private exponent reverses the transform"}
          </h3>
          <p className="mt-3 max-w-3xl leading-7 text-neutral-700">
            {encrypt
              ? "The sender uses the public key. Modular exponentiation keeps every intermediate value inside the modulus."
              : "The receiver uses the private exponent. The exponent relation makes the operation land back on the encoded message."}
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-emerald-300">
          <Icon aria-hidden="true" size={19} />
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <ValueCard label="Input" value={input} detail={encrypt ? "The encoded message m." : "The ciphertext c."} />
        <ValueCard label="Exponent" value={exponent} detail={encrypt ? "Public exponent e." : "Private exponent d."} />
        <ValueCard label="Modulus" value={rsaTrace.n} detail="All operations are reduced modulo n." />
        <ValueCard
          label="Output"
          value={output}
          detail={encrypt ? "This is the ciphertext." : "This recovers the original message."}
          tone="accent"
        />
      </div>

      <div className="mt-5 rounded-lg bg-neutral-950 p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
          Square-and-multiply
        </p>
        <MathExpression
          formula={
            encrypt
              ? `c=${rsaTrace.message}^{${rsaTrace.e}}\\bmod ${rsaTrace.n}=${rsaTrace.ciphertext}`
              : `m=${rsaTrace.ciphertext}^{${rsaTrace.d}}\\bmod ${rsaTrace.n}=${rsaTrace.decrypted}`
          }
          className="mt-2 text-sm text-neutral-100"
        />
      </div>

      <div className="mt-5">
        <ModPowTable steps={steps} />
      </div>
    </section>
  );
}

function SafetyPanel() {
  return (
    <section className="rounded-lg border border-neutral-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-amber-100 text-amber-950">
          <ShieldAlert aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Safe usage context
          </p>
          <h3 className="text-xl font-bold text-neutral-950">Textbook RSA is not deployment-safe RSA</h3>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          [
            "Padding matters",
            "Real RSA encryption should use a standards-defined scheme such as RSAES-OAEP, not raw textbook exponentiation.",
          ],
          [
            "Message range matters",
            "The encoded message representative must satisfy 0 <= m < n before the RSA operation is applied.",
          ],
          [
            "Use case matters",
            "Modern protocols usually use RSA to wrap keys or sign hashes, not to encrypt long messages directly.",
          ],
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

function ActiveStage({ activeStage }: { activeStage: StageId }) {
  if (activeStage === "keygen") {
    return <KeyGenerationPanel />;
  }

  if (activeStage === "inverse") {
    return <InversePanel />;
  }

  if (activeStage === "encrypt") {
    return <ModPowPanel mode="encrypt" />;
  }

  if (activeStage === "decrypt") {
    return <ModPowPanel mode="decrypt" />;
  }

  return <SafetyPanel />;
}

function ResultCheck() {
  const passed = rsaTrace.decrypted === rsaTrace.message;

  return (
    <section className="rounded-lg bg-neutral-950 p-5 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            RSA round trip
          </p>
          <h3 className="mt-2 text-2xl font-black">The private exponent recovers the message</h3>
          <p className="mt-3 max-w-3xl leading-7 text-neutral-300">
            This confirms the educational RSA path: key generation creates linked
            exponents, encryption produces ciphertext, and decryption returns the
            original encoded message.
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
          value={rsaTrace.message}
          detail="Original classroom message representative."
          tone="dark"
        />
        <ValueCard
          label="Ciphertext"
          value={rsaTrace.ciphertext}
          detail="Computed with the public exponent."
          tone="dark"
        />
        <ValueCard
          label="Decrypted"
          value={rsaTrace.decrypted}
          detail="Recovered with the private exponent."
          tone="accent"
        />
      </div>
    </section>
  );
}

export function RsaWalkthrough() {
  const reducedMotion = usePrefersReducedMotion();
  const [activeStage, setActiveStage] = useState<StageId>("keygen");
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
                Real RSA math
              </span>
              <span className="inline-flex min-h-8 items-center rounded-md bg-white/10 px-3 text-xs font-bold uppercase tracking-[0.14em] text-neutral-200">
                Toy-sized primes / textbook operation / safety notes
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-normal text-white md:text-4xl">
              Watch RSA build and use a public/private key pair
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-neutral-300">
              This module uses small numbers so every step fits on screen. The math is
              real RSA arithmetic, while the parameters and raw operation are intentionally
              classroom-only.
            </p>
          </div>
          <div className="grid gap-3">
            <ValueCard
              label="Public key"
              value={rsaTrace.publicKey}
              detail="The value shared with senders."
              tone="dark"
            />
            <ValueCard
              label="Private key"
              value={rsaTrace.privateKey}
              detail="The exponent that must remain secret."
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

      <KeyMaterialPanel />

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
