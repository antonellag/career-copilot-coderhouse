import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import Limbo from "@/pages/Limbo";
import Plataforma from "@/pages/Plataforma";
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
        {/* The student platform (Panel inicio / Plan carrera / Catálogo /
            Perfil / Novedades), reached after /limbo generates a roadmap.
            Its own shell — src/components/plataforma/PlataformaLayout.tsx —
            deliberately shares nothing with /limbo's UI. */}
        <Route path="/plataforma" element={<Plataforma />} />
      </Routes>
    </BrowserRouter>
  );
}
