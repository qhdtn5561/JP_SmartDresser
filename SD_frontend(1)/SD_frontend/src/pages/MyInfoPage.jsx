import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';

const MyInfoPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('남성');
  const [age, setAge] = useState('');           // ★ 나이 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // 설문 상태
  const [preferredStyle, setPreferredStyle] = useState('');
  const [preferredColor, setPreferredColor] = useState('');

  // 내 정보/설문 초기값 불러오기
  useEffect(() => {
    fetch("http://localhost:8080/users/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setName(data.userName || '');
        setEmail(data.email || '');
        setGender(data.gender || '남성');
        setAge(data.age !== undefined && data.age !== null ? String(data.age) : ''); // ★ 나이
        setPreferredStyle(data.preferredStyle || '');
        setPreferredColor(data.preferredColor || '');
      });
  }, []);

  // 비밀번호 검증 후 정보 수정 모달 열기
  const handleEdit = async () => {
    const inputPassword = window.prompt('확인을 위해 비밀번호를 입력하세요:');
    if (!inputPassword) {
      alert('비밀번호를 입력하세요.');
      return;
    }
    // 서버에 비밀번호 검증 요청
    const res = await fetch("http://localhost:8080/users/check-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password: inputPassword }),
    });
    if (res.ok) {
      setIsModalOpen(true);
    } else {
      alert('확인에 실패했습니다.');
    }
  };

  const handleSave = async () => {
    if (window.confirm('변경 사항을 저장하시겠습니까?')) {
      const res = await fetch("http://localhost:8080/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userName: name,
          gender,
          age: age === '' ? null : Number(age) // ★ 나이도 함께 전송
        }),
      });
      if (res.ok) {
        setSuccessMessage('정보가 성공적으로 저장되었습니다!');
        setIsModalOpen(false);
      } else {
        alert('정보 저장 실패');
      }
    }
  };

  const handleDeleteAccount = async () => {
    const inputPassword = window.prompt('확인을 위해 비밀번호를 입력하세요:');
    if (!inputPassword) {
      alert('비밀번호를 입력하세요.');
      return;
    }
    // 서버에 비밀번호 검증 요청
    const res = await fetch("http://localhost:8080/users/check-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password: inputPassword }),
    });
    if (!res.ok) {
      alert('확인에 실패했습니다.');
      return;
    }
    if (window.confirm('정말로 계정을 삭제하시겠습니까?')) {
      // 실제 계정 삭제 API 호출 필요
      alert('계정이 삭제되었습니다.');
    }
  };

  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8080/users/me/survey", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        preferredStyle,
        preferredColor
      }),
    });
    if (res.ok) {
      alert(`설문 제출 완료!\n선호 스타일: ${preferredStyle}\n선호 색상: ${preferredColor}`);
      setPreferredStyle('');
      setPreferredColor('');
    } else {
      alert("설문 저장 실패");
    }
  };

  return (
    <div className="font-sans bg-gray-100 text-gray-900 min-h-screen">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">👤 내 정보</h2>
          <div className="space-y-2">
            <p><strong>이름:</strong> {name}</p>
            <p><strong>이메일:</strong> {email}</p>
            <p><strong>성별:</strong> {gender}</p>
            <p><strong>나이:</strong> {age}</p> {/* ★ 나이 표시 */}
          </div>
          <button onClick={handleEdit} className="mt-4 h-10 px-6 w-fit rounded-full bg-black text-white text-sm font-semibold leading-none hover:bg-gray-800 transition">
            정보 수정
          </button>
        </section>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-bold mb-4">정보 수정</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">프로필 사진</label>
                  <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">이름</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">성별</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">나이</label>
                  <input
                    type="number"
                    value={age}
                    min={0}
                    max={150}
                    onChange={e => setAge(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 px-6 rounded-full bg-gray-300 text-black text-sm font-semibold hover:bg-gray-400 transition"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="h-10 px-6 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
                  >
                    변경 사항 저장
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">설문</h2>
          <form className="space-y-4" onSubmit={handleSurveySubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">선호하는 옷의 스타일</label>
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                placeholder="예: 캐주얼, 스트릿, 오피스룩 등"
                value={preferredStyle}
                onChange={e => setPreferredStyle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">선호 색상</label>
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                placeholder="예: 블랙, 화이트, 네이비 등"
                value={preferredColor}
                onChange={e => setPreferredColor(e.target.value)}
              />
            </div>
            <button type="submit" className="mt-4 h-10 px-6 w-fit rounded-full bg-black text-white text-sm font-semibold leading-none hover:bg-gray-800 transition">
              설문 제출
            </button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <button onClick={handleDeleteAccount} className="mt-4 h-10 px-6 w-fit rounded-full bg-red-600 text-white text-sm font-semibold leading-none hover:bg-red-800 transition">
            계정 삭제
          </button>
        </section>
      </main>
    </div>
  );
};

export default MyInfoPage;
