import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { SalesWidget } from "./SalesWidget";

/**
 * Wraps every marketing-site page (Home, and future ones) with the shared
 * header and footer sales widget. /limbo intentionally does NOT use this
 * layout — it renders on its own route outside MarketingLayout, so neither
 * the Coderhouse nav nor the widget ever appear there (per this session's
 * brief: both are marketing-only).
 */
export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <SalesWidget />
    </>
  );
}
