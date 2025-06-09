import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { EventContext } from '../context/EventContext';
import { ClosetContext } from '../context/ClosetContext';
import DashboardNavbar from '../components/DashboardNavbar';
import { cityMap } from '../utils/cityMap';

const getUserIdx = () => localStorage.getItem("userIdx");

const DashboardPage = () => {
  const navigate = useNavigate();
  const { events, setEvents } = useContext(EventContext);
  const { closetItems } = useContext(ClosetContext);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState('Seoul');
  const [inputCity, setInputCity] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [webProducts, setWebProducts] = useState(null);
  const [user, setUser] = useState(null);

  // 월별 일정 불러오기
  useEffect(() => {
    const userIdx = getUserIdx();
    if (!userIdx) {
      setEvents({});
      return;
    }
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}-${month}`;
    fetch(`http://localhost:8080/api/calendar/month/${yearMonth}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        const mapped = {};
        data.forEach(event => {
          const key = event.date;
          if (!mapped[key]) mapped[key] = [];
          mapped[key].push({
            id: event.id,
            time: event.time?.slice(0, 5) || event.startTime?.slice(11, 16) || '00:00',
            event: event.title,
            note: event.note || ''
          });
        });
        setEvents(mapped);
      })
      .catch(err => {
        setEvents({});
        console.error("월 전체 일정 불러오기 실패:", err);
      });
  }, [getUserIdx()]);

  // 사용자 정보 불러오기
  useEffect(() => {
    fetch("http://localhost:8080/users/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  // 추천 결과 DB 저장
  async function saveRecommendationToDB(type, content) {
    if (!user) return;
    await fetch("http://localhost:8080/api/aiservice/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userId: user.userIdx,
        type,
        content: JSON.stringify(content)
      })
    });
  }

  // 추천 결과 불러오기
  async function loadLatestRecommendation() {
    if (!user) return;
    // AI 코디 추천
    const res1 = await fetch(
      `http://localhost:8080/api/aiservice/latest?userId=${user.userIdx}&type=ai`,
      { credentials: "include" }
    );
    if (res1.ok) {
      const data = await res1.json();
      let rec = data;
      if (typeof data === "string") {
        try { rec = JSON.parse(data); } catch (e) { rec = null; }
      }
      setRecommendation(rec);
    }
    // 웹상품 추천
    const res2 = await fetch(
      `http://localhost:8080/api/aiservice/latest?userId=${user.userIdx}&type=webitem`,
      { credentials: "include" }
    );
    if (res2.ok) {
      const data = await res2.json();
      let web = data;
      if (typeof data === "string") {
        try { web = JSON.parse(data); } catch (e) { web = null; }
      }
      setWebProducts(web);
    }
  }

  useEffect(() => {
    if (user) loadLatestRecommendation();
  }, [user]);

  const reverseCityMap = Object.fromEntries(
    Object.entries(cityMap).map(([kor, eng]) => [eng.toLowerCase(), kor])
  );

  const localWeatherIcons = {
    "01d": "/assets/weather/01d.svg",
    "01n": "/assets/weather/01n.svg",
    "02d": "/assets/weather/02d.svg",
    "02n": "/assets/weather/02n.svg",
    "03d": "/assets/weather/03d.svg",
    "03n": "/assets/weather/03d.svg",
    "04d": "/assets/weather/03d.svg",
    "04n": "/assets/weather/03d.svg",
    "09d": "/assets/weather/10d.svg",
    "09n": "/assets/weather/10d.svg",
    "10d": "/assets/weather/10d.svg",
    "10n": "/assets/weather/10d.svg",
    "11d": "/assets/weather/11d.svg",
    "11n": "/assets/weather/11d.svg",
    "13d": "/assets/weather/13d.svg",
    "13n": "/assets/weather/13d.svg",
    "50d": "/assets/weather/50d.svg",
    "50n": "/assets/weather/50d.svg",
  };

  const fetchWeather = (cityName) => {
    const API_KEY = import.meta.env.VITE_REACT_APP_WEATHER_API;

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=kr`)
      .then(res => res.json())
      .then(data => {
        setWeather({
          temp: data.main.temp,
          humidity: data.main.humidity,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: reverseCityMap[data.name.toLowerCase()] || data.name,
        });
      });

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=kr`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.list.filter(f => f.dt_txt.includes("12:00:00"));
        setForecast(filtered);
      });
  };

  useEffect(() => { fetchWeather(city); }, [city]);

  const handleSearch = () => {
    const trimmed = inputCity.trim();
    const mappedCity = cityMap[trimmed] || trimmed;
    setCity(mappedCity);
  };

  // 이름/설명 분리 함수
  const parseItemInfo = (iteminfo) => {
    if (!iteminfo) return { name: "", description: "" };
    const parts = iteminfo.split("||");
    return { name: parts[0] || "", description: parts[1] || "" };
  };

  // 오늘 날짜 key
  const todayKey = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\./g, '-').replace(/\s/g, '');

  // 오늘의 일정 배열 추출
  const todayEvents = events[todayKey] || [];

  // AI 코디 추천 (id와 일정 기반)
  const handleRecommend = async () => {
    if (!weather) { alert("날씨 정보가 없습니다."); return; }
    if (!user) { alert("로그인 정보가 없습니다."); return; }
    if (closetItems.length < 10) {
      if (!window.confirm("옷장에 옷이 10벌 미만입니다.\n그래도 AI 코디 추천을 실행할까요?")) return;
    }
    const recommendRequest = {
      gender: user.gender,
      age: user.age,
      style: user.preferredStyle,
      weather: { temperature: weather.temp, condition: weather.description },
      availableItems: closetItems.map(item => item.id), // id 배열로!
      events: todayEvents.map(ev => ({
        time: ev.time,
        title: ev.event,
        note: ev.note
      }))
    };
    const res = await fetch("http://localhost:8080/api/recommend/gpt-outfit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(recommendRequest)
    });
    const data = await res.json();
    setRecommendation(data.recommendation);
    setWebProducts(null);
    await saveRecommendationToDB("ai", data.recommendation);
  };

  // 웹상품 추천
  const handleWebitemRecommend = async () => {
    if (!user || !weather) { alert("로그인/날씨 정보가 없습니다."); return; }
    const res = await fetch("http://localhost:8082/api/webitem-recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gender: user.gender,
        category: "상의",
        style: user.preferredStyle,
        age: user.age,
        weather: weather.description,
        count: 12
      })
    });
    const data = await res.json();
    setWebProducts(data.web_products);
    setRecommendation(null);
    await saveRecommendationToDB("webitem", data.web_products);
  };

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <DashboardNavbar />
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">

        {/* 👕 오늘의 추천 코디 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">👕 오늘의 추천 코디</h2>
          <div className="flex gap-2 mb-4">
            <button onClick={handleRecommend} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">AI 코디 추천받기</button>
            <button onClick={handleWebitemRecommend} className="bg-green-600 text-white px-4 py-2 rounded font-semibold">웹상품 추천받기</button>
          </div>
          {/* 웹상품 추천 결과 */}
          {webProducts && webProducts.length > 0 && (
            <div className="border p-4 rounded-lg shadow-sm text-center">
              <h3 className="font-semibold text-xl mb-2">오늘의 웹상품 추천</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {webProducts.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center border p-2 rounded-lg" style={{width: 180}}>
                    <img src={item.image_url} alt={item.name} style={{width: 150, height: 150, objectFit: "cover", borderRadius: 8}} />
                    <div className="font-semibold mt-2">{item.name}</div>
                    <div className="text-blue-700 font-bold">{item.price}</div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 underline mt-1">상품 보러가기</a>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* AI 코디 추천 결과 (id로 최신 정보 매칭) */}
          {recommendation && recommendation.outfits && recommendation.outfits[0] && (
            <div className="border p-4 rounded-lg shadow-sm text-center">
              <h3 className="font-semibold text-xl mb-2">{recommendation.outfits[0].name}</h3>
              <p className="mb-2">{recommendation.outfits[0].description}</p>
              <div className="flex flex-wrap justify-center gap-4">
                {recommendation.outfits[0].items.map((itemId, idx) => {
                  const match = closetItems.find(item => item.id === itemId);
                  if (match) {
                    const { name, description } = parseItemInfo(match.iteminfo);
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="font-semibold">{name}</div>
                        <div className="text-xs text-gray-600">{description}</div>
                        {match.ncpurl ? (
                          <img src={match.ncpurl} alt={name} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, marginTop: 4 }} />
                        ) : (
                          <div style={{
                            width: 100, height: 100, background: "#eee",
                            display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, marginTop: 4
                          }}>이미지 없음</div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="font-semibold">삭제됨</div>
                        <div className="text-xs text-gray-600"></div>
                        <div style={{
                          width: 100, height: 100, background: "#eee",
                          display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, marginTop: 4
                        }}>이미지 없음</div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </section>

        {/* 👤 사용자 정보 */}
        <section className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">👤 내 정보</h2>
          <button
            onClick={() => navigate('/myinfo')}
            className="h-10 px-6 w-fit rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition flex items-center"
          >
            <span className="mr-2">👤</span> 정보 수정
          </button>
        </section>

        {/* 📦 옷장 + 📅 일정 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 옷장 */}
          <div className="border rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-4">👚 내 옷장</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {closetItems.slice(-2).reverse().map((item, i) => {
                  const { name, description } = parseItemInfo(item.iteminfo);
                  return (
                    <div
                      key={i}
                      className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500 p-2"
                    >
                      {item.ncpurl ? (
                        <img
                          src={item.ncpurl}
                          alt={name}
                          className="object-cover w-full h-full rounded-lg mb-2"
                          style={{ maxHeight: 120, maxWidth: 120 }}
                        />
                      ) : (
                        <span>옷 사진</span>
                      )}
                      <div className="font-semibold text-black">{name}</div>
                      <div className="text-xs text-gray-600">{description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => navigate("/closet")}
              className="mt-4 h-10 px-6 w-fit rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              옷장 전체 보기
            </button>
          </div>
          {/* 일정 */}
          <div className="border rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-6">📅 이번 주 일정</h3>
              <div className="flex flex-col space-y-3">
                {Array.from({ length: 5 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const key = date.toLocaleDateString('ko-KR', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  }).replace(/\./g, '-').replace(/\s/g, '');
                  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                  const dayName = dayNames[date.getDay()];
                  const month = date.getMonth() + 1;
                  const day = date.getDate();
                  return (
                    <div key={i} className="border-l-4 border-gray-400 pl-4 py-2 bg-white shadow-sm">
                      <h2 className="text-base font-semibold text-black mb-1">{dayName} ({month}월{day}일)</h2>
                      <ul className="text-sm space-y-1">
                        {(events[key] || []).length > 0 ? (
                          events[key].map((event, index) => (
                            <li key={index} className="text-gray-800 truncate">
                              <strong>{event.time}</strong>: {event.event}
                              {event.note && <span className="text-gray-500"> ({event.note})</span>}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400">일정 없음</li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => navigate("/calendar")}
              className="mt-4 h-10 px-6 w-fit rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              일정 전체 보기
            </button>
          </div>
        </section>

        {/* 🌤️ 날씨 */}
        <section className="space-y-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">🌤️ 오늘 날씨</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="도시명 입력 (예: Seoul)"
                value={inputCity}
                onChange={(e) => setInputCity(e.target.value)}
                className="border border-gray-300 rounded-full px-4 py-2"
              />
              <button
                onClick={handleSearch}
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition"
              >
                날씨 보기
              </button>
            </div>
          </div>
          {weather ? (
            <div className="flex items-center gap-4 p-4 border rounded-xl shadow-sm">
              <img
                src={localWeatherIcons[weather.icon] || "/assets/weather/default.svg"}
                alt={weather.description}
                className="w-14 h-14"
              />
              <div>
                <p className="text-lg font-semibold">{weather.city}</p>
                <p>{weather.description} / {weather.temp}°C</p>
                <p className="text-sm text-gray-500">습도: {weather.humidity}%</p>
              </div>
            </div>
          ) : <p>날씨 정보를 불러오는 중...</p>}

          <div>
            <h2 className="text-2xl font-bold mb-4">📅 주간 날씨 예보</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {forecast.map((item, i) => (
                <div key={i} className="border rounded-xl p-4 text-center shadow-sm">
                  <p className="font-semibold mb-2">{item.dt_txt.split(' ')[0]}</p>
                  <img
                    src={localWeatherIcons[item.weather[0].icon] || "/assets/weather/default.svg"}
                    alt={item.weather[0].description}
                    className="mx-auto w-14 h-14"
                  />
                  <p>{item.weather[0].description}</p>
                  <p>{item.main.temp}°C</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
