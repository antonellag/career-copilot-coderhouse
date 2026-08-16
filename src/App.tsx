import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import Limbo from "@/pages/Limbo";
import { MarketingLayout } from "@/components/MarketingLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MarketingLayout>
              <Home />
            </MarketingLayout>
          }
        />
        {/* Intentionally outside MarketingLayout: no site nav, no sales widget.
            Not linked from the navbar — only reachable via the hero CTA. */}
        <Route path="/limbo" element={<Limbo />} />
      </Routes>
    </BrowserRouter>
  );
}
