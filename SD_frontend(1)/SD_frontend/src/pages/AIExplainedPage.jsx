import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const steps = [
  {
    title: "1. AI 기반 옷 등록",
    desc: "사진 업로드 → 전처리 → 분석 가능한 형태로 저장",
    emoji: "📸",
  },
  {
    title: "2. 딥러닝 의류 분류",
    desc: "CNN 기반 분석 → 옷의 종류, 색상, 계절 분류",
    emoji: "🧠",
  },
  {
    title: "3. 날씨 및 일정 분석",
    desc: "날씨 API + 캘린더 분석 → 상황 정보 생성",
    emoji: "🌦️",
  },
  {
    title: "4. AI 코디 추천",
    desc: "개인화 추천으로 상황별 최적 코디 제안",
    emoji: "👗",
  },
];

const AIExplainedPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-10">
          🤖 Smart Dresser의 AI는 이렇게 작동합니다
        </h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">
          Smart Dresser는 AI 기반으로 옷을 분석하고 추천합니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="border p-6 rounded-xl shadow-sm hover:shadow-md flex items-start gap-4 whitespace-pre-line">
              <div className="text-4xl">{step.emoji}</div>
              <div>
                <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
};

export default AIExplainedPage;
