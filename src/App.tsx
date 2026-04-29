import { BrowserRouter, Routes, Route } from "react-router-dom";
import GI from "./pages/GI";
import HSR from "./pages/HSR";
import ZZZ from "./pages/ZZZ";
import { useEffect } from "react";
import { inject } from "@vercel/analytics";
import ReloadPrompt from "./ReloadPrompt";
import './App.css'

function App() {
  useEffect(() => {
    inject()
  }, [])

  return (
    <BrowserRouter>
      <ReloadPrompt />
      <Routes>
        <Route path="/" element={<GI />} />
        <Route path="/hsr" element={<HSR />} />
        <Route path="/zzz" element={<ZZZ />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
