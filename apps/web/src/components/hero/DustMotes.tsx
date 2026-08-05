"use client";

import dynamic from "next/dynamic";
import { useCanAffordEffects } from "@/lib/motion";

/**
 * Three.js appears in exactly one place on this site: dust suspended in the
 * projector beam behind the hero. Dynamically imported and gated on device
 * capability, so phones and reduced-motion users never pay for it.
 */
const MoteField = dynamic(() => import("./MoteField").then((m) => m.MoteField), {
  ssr: false,
  loading: () => null,
});

export function DustMotes() {
  const afford = useCanAffordEffects();
  if (!afford) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
      <MoteField />
    </div>
  );
}
