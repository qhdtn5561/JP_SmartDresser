import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="overflow-hidden">
        <section
          className="bg-cover bg-center bg-no-repeat text-white text-center h-[calc(100vh-80px)] flex items-center justify-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url("https://cdn.usegalileo.ai/sdxl10/0b9b4213-1c25-488c-8009-52f322378af5.png")',
          }}
        >
          <div className="px-6 md:px-0">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Elevate Your Style
            </h1>
            <p className="text-sm md:text-base max-w-md mx-auto mb-6">
              더 스마트하고 스타일리시한 당신을 위한 지능형 옷장 관리를 경험해보세요.
            </p>
            <button
              className="min-w-[120px] h-12 px-5 rounded-full bg-white text-black text-sm font-bold transition hover:bg-gray-200"
              onClick={() => navigate("/register")}
            >
              Get Started
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default LandingPage;
