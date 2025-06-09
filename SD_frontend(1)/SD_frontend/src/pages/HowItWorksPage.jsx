import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const HowItWorksPage = () => {
  const navigate = useNavigate();

  const steps = [
    { title: "1. 옷 사진 등록", desc: "사용자가 자신의 옷 사진을 등록합니다.", emoji: "📸" },
    { title: "2. AI 자동 분류", desc: "AI가 옷의 종류, 계절, 색상을 자동으로 분석합니다.", emoji: "🤖" },
    { title: "3. 코디 추천", desc: "날씨와 일정 데이터를 분석해 옷차림을 추천합니다.", emoji: "👗" },
    { title: "4. 피드백 학습", desc: "사용자 평가를 학습하여 개인화합니다.", emoji: "🔁" },
  ];

  return (
    <Layout>
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-center mb-12">How Smart Dresser Works</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-6 border rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="text-4xl">{step.emoji}</div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
};

export default HowItWorksPage;
