import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-20 py-3 flex items-center justify-between">
        {/* 좌측 로고 */}
        <div
          className="text-xl font-extrabold text-gray-900 tracking-tight cursor-pointer"
          onClick={() => navigate("/")}
        >
          Smart Dresser
        </div>

        {/* 중앙 메뉴 */}
        <nav className="hidden md:flex items-center gap-10">
          <button
            onClick={() => navigate("/features")}
            className="text-sm font-medium text-gray-700 hover:text-black transition"
          >
            Features
          </button>
          <button
            onClick={() => navigate("/how-it-works")}
            className="text-sm font-medium text-gray-700 hover:text-black transition"
          >
            How It Works
          </button>
          <button
            onClick={() => navigate("/gallery")}
            className="text-sm font-medium text-gray-700 hover:text-black transition"
          >
            Gallery
          </button>
          <button
            onClick={() => navigate("/ai-explained")}
            className="text-sm font-medium text-gray-700 hover:text-black transition"
          >
            AI Explained
          </button>
        </nav>

        {/* 우측 버튼 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 text-sm font-semibold rounded-full border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
