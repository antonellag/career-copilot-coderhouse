import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
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
      </Routes>
    </BrowserRouter>
  );
}
