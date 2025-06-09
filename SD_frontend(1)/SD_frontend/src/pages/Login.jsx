import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ClosetContext } from "../context/ClosetContext";
import { EventContext } from "../context/EventContext"; // 일정 Context import
import Layout from "../components/Layout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { fetchClosetItems, setClosetItems } = useContext(ClosetContext);
  const { setEvents } = useContext(EventContext); // 일정 Context 사용

  const handleLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: email,
          password: password
        }),
        credentials: "include",
      });

      if (response.ok) {
        // 로그인 성공: 사용자 정보 추가 조회
        const userInfoRes = await fetch("http://localhost:8080/users/me", {
          credentials: "include",
        });
        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json();
          localStorage.setItem("userId", userInfo.email);
          localStorage.setItem("userIdx", userInfo.userIdx);

          // 👇 Context 상태 초기화 (이전 사용자 데이터 제거)
          setClosetItems([]); // 이전 사용자 옷장 상태 초기화
          setEvents({});      // 이전 사용자 일정 상태 초기화

          await fetchClosetItems(); // 옷장 목록 즉시 갱신
          // 일정 목록도 필요하다면 fetchEventsForMonth() 등 호출
        }
        localStorage.setItem("isLoggedIn", "true");
        navigate("/dashboard");
      } else {
        let errorMsg = "로그인 실패: 이메일 또는 비밀번호가 틀렸습니다.";
        try {
          const data = await response.json();
          if (data.message) errorMsg = data.message;
        } catch (e) {}
        alert(errorMsg);
      }
    } catch (error) {
      console.error("로그인 요청 오류:", error);
      alert("서버에 연결할 수 없습니다.");
    }
  };

  return (
    <Layout>
      <div className="overflow-hidden">
        <div className="grid place-items-center min-h-[calc(100vh-80px)] px-4 py-10">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-semibold mb-8 text-center">로그인</h1>

            <label className="block text-sm mb-1">이메일</label>
            <input
              type="email"
              placeholder="smartdresser@email.com"
              className="w-full mb-4 px-4 py-2 rounded-md bg-zinc-100 text-black border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="block text-sm mb-1">비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="w-full mb-6 px-4 py-2 rounded-md bg-zinc-100 text-black border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleLogin}
              className="w-full py-2 rounded-md bg-black hover:bg-gray-800 transition-colors font-semibold text-white"
            >
              로그인
            </button>

            <p className="text-sm text-center mt-4 text-zinc-600">
              계정이 없으신가요?{" "}
              <span
                className="text-blue-700 underline cursor-pointer"
                onClick={() => navigate("/register")}
              >
                회원가입하기
              </span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
