import Component1920WLight from "@/imports/1920WLight-1/index";
import Component1440WLight from "@/imports/1440WLight/index";
import Component768WLight from "@/imports/768WLight/index";
import { Hero } from "@/components/Hero";

/**
 * Each breakpoint import below used to render its own hero + sticky navbar at
 * the top (see src/imports, folder per breakpoint, function "EndOfBodyStart").
 * Those were removed from the three files in this session — this page renders
 * ONE shared <Hero /> (with its own <PillNavbar />) instead, then the legacy
 * per-breakpoint sections (Format Finder, Categories, Features, ...) right
 * below it.
 *
 * The legacy sections are still absolutely positioned assuming the old hero's
 * height (a Figma Make export quirk — see the removal comment inside each
 * breakpoint's index.tsx). The negative margin below pulls that reserved gap
 * up so "Format Finder" sits right under the new Hero, without touching the
 * thousands of absolute offsets inside those generated files.
 */
export default function Home() {
  return (
    <>
      <Hero />

      {/* Each wrapper clips away the reserved hero-height gap (outer div, fixed to the
          legacy container's height minus that gap) while the inner div shifts the legacy
          content up by that same amount — the outer clip keeps the shift from overlapping
          the new <Hero /> above it. */}
      <div className="hidden overflow-hidden xl:block" style={{ height: "9041.83px" }}>
        <div style={{ marginTop: "-1512.39px" }}>
          <Component1920WLight />
        </div>
      </div>
      <div className="hidden overflow-hidden md:block xl:hidden" style={{ height: "8487.42px" }}>
        <div style={{ marginTop: "-1568.39px" }}>
          <Component1440WLight />
        </div>
      </div>
      <div className="block overflow-hidden md:hidden" style={{ height: "7163.44px" }}>
        <div style={{ marginTop: "-1431.95px" }}>
          <Component768WLight />
        </div>
      </div>
    </>
  );
}
