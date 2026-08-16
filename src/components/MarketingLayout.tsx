import type { ReactNode } from "react";
import { SalesWidget } from "./SalesWidget";

/**
 * Wraps every marketing-site page (Home, and future ones) with the shared
 * footer sales widget. /limbo intentionally does NOT use this layout — it
 * renders on its own route outside MarketingLayout, so the widget never
 * appears there (per this session's brief: sales widget is marketing-only).
 */
export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SalesWidget />
    </>
  );
}
