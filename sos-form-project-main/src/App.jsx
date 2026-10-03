import Home from "./pages/Home";
import ForkliftReport from "./pages/ForkliftReport";
import PalletReport from "./pages/PalletReport";
import History from "./pages/History";
import SignReport from "./pages/SignReport"; // se quiser implementar assinatura remota depois
import Topbar from "./components/Topbar";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

function Layout() {
  const location = useLocation();

  // se estiver na home ("/"), não renderiza a Topbar
  const hideTopbar = location.pathname === "/";

  return (
    <>
      {!hideTopbar && <Topbar />}
      <Routes>
        {/* Tela inicial */}
        <Route path="/" element={<Home />} />

        {/* Relatórios */}
        <Route path="/pallet" element={<PalletReport />} />
        <Route path="/forklift" element={<ForkliftReport />} />

        {/* Histórico */}
        <Route path="/history" element={<History />} />

        {/* Assinatura remota (opcional) */}
        <Route path="/sign/:id" element={<SignReport />} />
      </Routes>
    </>
  );
}

export default App;
