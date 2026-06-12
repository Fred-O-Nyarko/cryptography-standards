# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Interactive cryptography learning app for a Cybersecurity class, covering six algorithms across two families: DES, 3DES, AES (symmetric) and RSA, ElGamal, ECC (asymmetric). Built with React Router v7 (framework mode, SSR enabled) + React 19 + Tailwind v4 + TypeScript. Lessons render rigorous math (KaTeX) and step-through visualizers.

## Commands

```bash
npm run dev        # dev server with HMR at http://localhost:5173
npm run build      # production build to build/{client,server}
npm run start      # serve the production build
npm run typecheck  # react-router typegen && tsc — run after touching routes or loaders
```

There is no test runner or linter configured. `npm run typecheck` is the only check; run it before considering work done, especially after changing routes (it regenerates `.react-router/types/`). Note `package.json` scripts say `npm` but a `pnpm-lock.yaml` is also present.

## Architecture

The app is a **content-driven lesson engine**, not bespoke pages per algorithm. Understanding the split between content, the generic lesson shell, and per-algorithm walkthroughs is the key to working here.

- **Routes** (`app/routes.ts`, flat config): `/` (home algorithm picker), `/learn/:algorithmId`, `/references`. The path alias `~/*` maps to `app/*`.

- **Content model** (`app/content/crypto.ts`): the single source of truth for lesson structure. Defines all the types (`AlgorithmId`, `LessonModule`, `LessonSection`, `Reference`, `VisualizerConfig`) and the `lessonModules` array that every route reads. Each module declares its sections (concept/math/key-generation/encryption-flow/decryption-flow/demo/checkpoint), glossary, objectives, prerequisites, and reference IDs. The `referenceLibrary` and helper lookups (`getLessonModule`, `getReference*`) also live here.

- **Generic lesson shell** (`app/routes/learn.tsx` + `app/components/learning.tsx`): `learn.tsx` loads a module by `algorithmId` (404s if missing) and renders a visualizer-first layout — compact title, then the interactive walkthrough, then the explanatory material (objectives, math, key lifecycle, concept sections, checkpoint, glossary, references) in collapsed `CollapsibleSection`s. `learning.tsx` holds all reusable presentation components, including `MathExpression` (KaTeX wrapper), the `ToyVisualizer` fallback, and `VisualizerDock` — the fixed bottom-center playback bar (reset/prev/play/next + step indicator) that every walkthrough renders; walkthroughs keep their playback state and autoplay effects, the dock is purely controlled.

- **Per-algorithm walkthroughs** (`app/components/{des,tdes,aes,rsa,elgamal,ecc}.tsx`): the real interactive trace for each algorithm. `learn.tsx` selects one via an explicit `module.id` switch; any module without a dedicated component falls back to `ToyVisualizer`. Each walkthrough imports its computation from the matching `app/content/{des,aes,rsa,ecc,...}.ts` file. **User inputs**: each walkthrough renders a `TraceInputsPanel` (field components from `learning.tsx`) and recomputes its trace via `useMemo` on a `create*Trace(...)` call; invalid input keeps the last valid trace (`useRef`) and shows an inline error, so the page never crashes. The trace flows to nested helper panels through a per-file React context with a `useTrace()` hook — each helper shadows the old module-constant name locally (`const desTrace = useTrace()`), and the trace import is renamed to `default*Trace` so any missed reference is a compile error. Key generation (random keys/primes/scalars via `app/content/trace-inputs.ts`) only happens in click handlers, keeping SSR deterministic.

- **Per-algorithm computation** (`app/content/{des,tdes,aes,rsa,elgamal,ecc}.ts`): parameterized `create*Trace(...)` functions compute *real* cryptographic traces; default arguments are the known test vectors (e.g. AES uses the FIPS 197 vector → `69C4E0D86A7B0430D8CDB78070B4C55A`; RSA defaults to p=61,q=53). Each exports a `*Trace` constant (the default trace, used for SSR/first render) plus trace types. DES/AES `expectedCiphertextHex` is `string | null` — non-null only for the known-vector defaults. Domain parameters stay fixed for ElGamal (p=23, g=5) and ECC (p=17, a=2, b=2, G=(5,1), order 19); RSA primes come from the curated `RSA_PRIME_CHOICES` list in `app/content/trace-inputs.ts` (number arithmetic only — keep n² < 2^53). This is genuine educational arithmetic, not placeholders.

### Adding or changing a lesson

1. Edit/extend the module entry in `app/content/crypto.ts` (sections, glossary, references). Reference IDs must exist in `referenceLibrary`.
2. For a new interactive trace, add `app/content/<algo>.ts` (computation + trace types) and `app/components/<algo>.tsx` (renderer), then wire it into the `module.id` switch in `app/routes/learn.tsx`. Without that wiring it renders the `ToyVisualizer`.

## Conventions

- Each file defines its own local `cx(...)` classname helper and, where needed, a local `usePrefersReducedMotion` hook — these are intentionally duplicated across `learning.tsx` and the walkthrough components rather than shared. Match the surrounding file.
- Animations are gated on `prefers-reduced-motion`; keep autoplay/transitions reduced-motion-aware.
- Math strings are LaTeX rendered through `MathExpression`/`MathOrText` (KaTeX, `throwOnError: false`). `MathOrText` heuristically renders as math only if the string contains `=`, `^`, or `\`.
- Styling is Tailwind v4 (via `@tailwindcss/vite`, no config file) with a warm off-white `#f7f4ee` background, emerald/amber/cyan accents, and `lucide-react` icons.

## Deployment

`Dockerfile` builds and runs the production server (`npm run start`, port 3000). `build/` and `.react-router/` are gitignored generated output — do not edit them by hand.
