import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import MainPage from "./pages/MainPage";
import StatusPage from "./pages/StatusPage"; // ✅ 동원 소방력 현황 페이지
import RegisterPage from "./pages/RegisterPage"; // ✅ 동원 소방력 등록 페이지
import DispatchPage from "./pages/DispatchPage"; // ✅ 출동 관리 페이지
import ActivityPage from "./pages/ActivityPage"; // ✅ 활동 현황 페이지
import ActivityMapPage from "./pages/ActivityMapPage"; // ✅ 활동 지도 페이지
import StatsPage from "./pages/StatsPage"; // ✅ 통계 페이지
import GpsReceivePage from "./pages/GpsReceivePage"; // ✅ 통계 페이지

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/activity/map" element={<ActivityMapPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/gps" element={<GpsReceivePage />} />
      </Routes>
    </Router>
  );
}

export default App;
