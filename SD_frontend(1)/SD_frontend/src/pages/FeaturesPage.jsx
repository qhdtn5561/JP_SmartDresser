import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const FeaturesPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <section className="max-w-4xl mx-auto py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">What is Smart Dresser?</h2>
        <p className="text-gray-600 text-base md:text-lg leading-relaxed">
          Smart Dresser는 사용자의 옷장을 디지털화하고, AI가 날씨와 일정에 따라 최적의 코디를 추천해주는 지능형 옷장 관리 시스템입니다.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h3 className="text-2xl font-bold text-center mb-10">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "AI 의류 분류", desc: "사진만 등록하면 옷 종류, 계절, 색상을 자동으로 분류해요.", icon: "🧥" },
            { title: "날씨 기반 추천", desc: "실시간 날씨 데이터를 기반으로 상황에 맞는 옷차림을 추천해요.", icon: "🌤️" },
            { title: "일정 기반 코디", desc: "캘린더와 연동하여 상황에 맞춰 추천해요.", icon: "📅" },
          ].map((item, i) => (
            <div key={i} className="border rounded-xl p-6 text-center shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default FeaturesPage;
