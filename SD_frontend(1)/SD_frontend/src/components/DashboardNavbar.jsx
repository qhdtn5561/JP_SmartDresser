import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ClosetContext } from "../context/ClosetContext";

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const { setClosetItems } = useContext(ClosetContext);

  const handleLogout = () => {
    // ✅ 모든 로그인 관련 정보 제거
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userIdx");
    localStorage.removeItem("isLoggedIn");
    setClosetItems([]); // 👈 Context 상태도 초기화!

    // ✅ 랜딩 페이지로 이동
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-20 py-3 flex items-center justify-between">
        <div
          className="text-xl font-extrabold text-gray-900 tracking-tight cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          Smart Dresser
        </div>

        <div className="hidden md:flex items-center gap-10">
          <button onClick={() => navigate("/dashboard")} className="text-sm font-medium text-gray-700 hover:text-black">
            Home
          </button>
          <button onClick={() => navigate("/closet")} className="text-sm font-medium text-gray-700 hover:text-black">
            Closet
          </button>
          <button onClick={() => navigate("/calendar")} className="text-sm font-medium text-gray-700 hover:text-black">
            Calendar
          </button>
          <button onClick={() => navigate("/myinfo")} className="text-sm font-medium text-gray-700 hover:text-black">
            My Info
          </button>

          {/* ✅ 로그아웃 */}
          <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-700">
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
