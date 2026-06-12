import type { Route } from "./+types/home";
import { AlgorithmCard, FamilyPill, SiteShell } from "~/components/learning";
import { lessonModules } from "~/content/crypto";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cryptography Learning Lab" },
    {
      name: "description",
      content:
        "Visualize how DES, 3DES, AES, RSA, ElGamal, and ECC work, step by step.",
    },
  ];
}

export default function Home() {
  const symmetricModules = lessonModules.filter((module) => module.family === "symmetric");
  const asymmetricModules = lessonModules.filter((module) => module.family === "asymmetric");

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-neutral-950 md:text-4xl">
          Pick an algorithm to visualize
        </h1>
        <p className="mt-2 max-w-3xl leading-7 text-neutral-700">
          Step through real encryption math, round by round.
        </p>

        <section className="mt-10">
          <FamilyPill family="symmetric" />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {symmetricModules.map((module) => (
              <AlgorithmCard key={module.id} module={module} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <FamilyPill family="asymmetric" />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {asymmetricModules.map((module) => (
              <AlgorithmCard key={module.id} module={module} />
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
