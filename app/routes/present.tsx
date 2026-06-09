import type { Route } from "./+types/present";
import { useEffect, useState } from "react";

import { PresenterControls, SlideFrame } from "~/components/learning";
import { slideScaffold } from "~/content/crypto";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Presentation Mode | Cryptography Learning Lab" },
    {
      name: "description",
      content: "Classroom presentation scaffold for the cryptography learning project.",
    },
  ];
}

export default function Present() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slideScaffold[activeIndex];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        setActiveIndex((current) => Math.min(slideScaffold.length - 1, current + 1));
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        setActiveIndex((current) => Math.max(0, current - 1));
      }

      if (event.key === "Home") {
        setActiveIndex(0);
      }

      if (event.key === "End") {
        setActiveIndex(slideScaffold.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <SlideFrame activeSlide={activeSlide} current={activeIndex} />
      <PresenterControls
        current={activeIndex}
        total={slideScaffold.length}
        onPrevious={() => setActiveIndex((current) => Math.max(0, current - 1))}
        onNext={() => setActiveIndex((current) => Math.min(slideScaffold.length - 1, current + 1))}
      />
    </>
  );
}
