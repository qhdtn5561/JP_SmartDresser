// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ Context Providers import
import { EventProvider } from "./context/EventContext";
import { ClosetProvider } from "./context/ClosetContext";

// ✅ 페이지 컴포넌트 import
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import Login from "./pages/Login";
import FeaturesPage from "./pages/FeaturesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import DashboardPage from "./pages/DashboardPage";
import GalleryPage from "./pages/GalleryPage";
import AIExplainedPage from "./pages/AIExplainedPage";

// ✅ 라우터 추가할 새로운 페이지들
import ClosetPage from "./pages/ClosetPage";
import CalendarPage from "./pages/CalendarPage";
import MyInfoPage from "./pages/MyInfoPage";

function App() {
  return (
    <EventProvider>
      <ClosetProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/ai-explained" element={<AIExplainedPage />} />

            {/* ✅ 추가된 라우터 */}
            <Route path="/closet" element={<ClosetPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/myinfo" element={<MyInfoPage />} />
          </Routes>
        </Router>
      </ClosetProvider>
    </EventProvider>
  );
}

export default App;
