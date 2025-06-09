import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleNext = async () => {
    if (!email || password.length < 8) {
      alert("이메일과 비밀번호(최소 8자)를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email, // ✅ 필드명 반드시 email!
          userName: email.split("@")[0],
          userPassword: password
        })
      });

      if (response.ok) {
        alert("회원가입 성공! 로그인 페이지로 이동합니다.");
        navigate("/login");
      } else {
        let errorMsg = "알 수 없는 오류";
        try {
          const data = await response.json();
          errorMsg = data.message || errorMsg;
        } catch {
          errorMsg = await response.text();
        }
        alert(`회원가입 실패: ${errorMsg}`);
      }
    } catch (error) {
      console.error("에러 발생:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <Layout>
      <div className="overflow-hidden">
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4 py-10">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-semibold mb-8 text-center">회원가입</h1>
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
              placeholder="비밀번호를 입력하세요(최소 8자리)"
              className="w-full mb-6 px-4 py-2 rounded-md bg-zinc-100 text-black border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleNext}
              className="w-full py-2 rounded-md bg-black hover:bg-gray-800 transition-colors font-semibold text-white"
            >
              다음
            </button>
            <p className="text-sm text-center mt-4 text-zinc-600">
              이미 계정이 있나요?{" "}
              <span
                className="text-blue-700 underline cursor-pointer"
                onClick={() => navigate("/login")}
              >
                로그인하세요
              </span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
