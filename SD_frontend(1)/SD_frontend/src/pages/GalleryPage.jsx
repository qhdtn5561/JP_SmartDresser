import Layout from "../components/Layout";

const sections = [
  { title: "01. 대시보드 화면", desc: "오늘의 추천 코디와 내 옷장 정보를 한눈에 확인할 수 있어요.", img: "/assets/gallery/메인화면1.png" },
  { title: "02. 옷장 전체 보기", desc: "AI가 분류한 옷들을 한눈에 볼 수 있어요.", img: "/assets/gallery/옷장.png" },
  { title: "03. 추천 전/후 비교", desc: "코디 추천 전과 후를 비교해보세요.", img: "/assets/gallery/추천.png" },
];

const GalleryPage = () => {
  return (
    <Layout>
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        {sections.map((section, idx) => (
          <div key={idx} className={`flex flex-col md:flex-row items-center gap-10 ${idx % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
            <img src={section.img} alt={section.title} className="w-full md:w-1/2 rounded-xl shadow" />
            <div className="text-left md:w-1/2">
              <h2 className="text-xl font-bold mb-3">{section.title}</h2>
              <p className="text-gray-600">{section.desc}</p>
            </div>
          </div>
        ))}
      </main>
    </Layout>
  );
};

export default GalleryPage;
