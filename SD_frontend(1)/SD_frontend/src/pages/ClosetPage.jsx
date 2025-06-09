import React, { useContext, useEffect, useState } from 'react';
import { ClosetContext } from '../context/ClosetContext';
import DashboardNavbar from '../components/DashboardNavbar';

const ClosetPage = () => {
  const { closetItems, setClosetItems, fetchClosetItems } = useContext(ClosetContext);
  const [newItem, setNewItem] = useState({ name: '', description: '', imageFile: null });

  // 분류(category) 수정 상태 관리
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryValue, setEditCategoryValue] = useState("");

  // 이름/설명 수정 상태 관리
  const [editInfoId, setEditInfoId] = useState(null);
  const [editInfoName, setEditInfoName] = useState("");
  const [editInfoDesc, setEditInfoDesc] = useState("");

  // 로그인한 유저의 userIdx를 localStorage 등에서 동적으로 가져옴
  const getUserIdx = () => localStorage.getItem("userIdx");

  useEffect(() => {
    fetchClosetItems();
    // eslint-disable-next-line
  }, []);

  // 옷 추가(이미지 업로드 및 등록)
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.imageFile) {
      alert("옷 이름, 설명, 이미지를 모두 입력하세요.");
      return;
    }

    const userIdx = getUserIdx();
    if (!userIdx) {
      alert("로그인이 필요합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", newItem.imageFile);
    formData.append("userIdx", userIdx);
    formData.append("iteminfo", `${newItem.name}||${newItem.description}`);

    try {
      const uploadResponse = await fetch("http://localhost:8080/items/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        alert(`이미지 업로드 실패: ${errorText}`);
        return;
      }

      await fetchClosetItems();

      setNewItem({ name: '', description: '', imageFile: null });
      alert("옷이 추가되었습니다!");
    } catch (err) {
      alert("이미지 업로드 중 오류 발생");
    }
  };

  // 옷 삭제
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`http://localhost:8080/items/${itemId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        await fetchClosetItems();
        alert("삭제되었습니다.");
      } else {
        alert("삭제 실패");
      }
    } catch (err) {
      alert("삭제 중 오류 발생");
    }
  };

  // 분류(category) 수정 저장
  const handleSaveCategory = async (itemId) => {
    await fetch(`http://localhost:8080/items/${itemId}/category`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ category: editCategoryValue })
    });
    setEditCategoryId(null);
    setEditCategoryValue("");
    await fetchClosetItems();
  };

  // 이름/설명(iteminfo) 수정 저장
  const handleSaveInfo = async (itemId) => {
    const iteminfo = `${editInfoName}||${editInfoDesc}`;
    await fetch(`http://localhost:8080/items/${itemId}/info`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ iteminfo })
    });
    setEditInfoId(null);
    setEditInfoName("");
    setEditInfoDesc("");
    await fetchClosetItems();
  };

  // 이름/설명 분리
  const parseItemInfo = (iteminfo) => {
    const [name, description] = iteminfo.split('||');
    return { name, description };
  };

  useEffect(() => {
    // closetItems 배열이 바뀔 때마다 콘솔에 출력
    console.log('closetItems:', closetItems);
  }, [closetItems]);

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">👚 옷장 전체 보기</h1>

        {/* 옷 추가 폼 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="옷 이름"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="border p-2 mr-3 text-lg font-medium"
          />
          <input
            type="text"
            placeholder="옷 설명"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="border p-2 mr-3 text-lg font-medium"
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setNewItem({ ...newItem, imageFile: e.target.files[0] })}
            className="border p-2 mr-3 text-lg font-medium"
          />
          <button onClick={handleAddItem} className="bg-black text-white px-3 py-2 text-lg font-semibold">
            추가
          </button>
        </div>

        {/* 옷장 이미지 리스트 */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {closetItems.map(item => {
            const { name, description } = parseItemInfo(item.iteminfo);

            return (
              <div key={item.id} style={{ textAlign: "center", width: 170, position: "relative" }}>
                <img
                  src={item.ncpurl}
                  alt={description}
                  style={{ width: 150, height: 150, objectFit: "cover", borderRadius: 8 }}
                />
                {/* 이름/설명 수정 UI */}
                {editInfoId === item.id ? (
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      value={editInfoName}
                      onChange={e => setEditInfoName(e.target.value)}
                      placeholder="이름"
                      style={{ width: 70, marginRight: 4 }}
                    />
                    <input
                      type="text"
                      value={editInfoDesc}
                      onChange={e => setEditInfoDesc(e.target.value)}
                      placeholder="설명"
                      style={{ width: 70, marginRight: 4 }}
                    />
                    <button onClick={() => handleSaveInfo(item.id)} style={{ fontSize: 12 }}>저장</button>
                    <button onClick={() => setEditInfoId(null)} style={{ fontSize: 12, marginLeft: 4 }}>취소</button>
                  </div>
                ) : (
                  <>
                    <div style={{ marginTop: 8, fontWeight: "bold" }}>{name}</div>
                    <div style={{ color: "#555", fontSize: 14 }}>{description}</div>
                    <button
                      onClick={() => {
                        setEditInfoId(item.id);
                        setEditInfoName(name);
                        setEditInfoDesc(description);
                      }}
                      style={{ fontSize: 12, marginTop: 2 }}
                    >이름/설명 수정</button>
                  </>
                )}

                {/* 분류 결과(소분류/대분류) 표시 및 수정 */}
                <div style={{ color: "#2b6cb0", fontSize: 13, marginTop: 2 }}>
                  {editCategoryId === item.id ? (
                    <>
                      <input
                        value={editCategoryValue}
                        onChange={e => setEditCategoryValue(e.target.value)}
                        style={{ width: 80 }}
                      />
                      <button
                        onClick={() => handleSaveCategory(item.id)}
                        style={{ marginLeft: 4 }}
                      >저장</button>
                      <button onClick={() => setEditCategoryId(null)} style={{ marginLeft: 4 }}>취소</button>
                    </>
                  ) : (
                    <>
                      {/* 분류: 소분류(대분류) */}
                      분류: {item.category || "없음"}
                      {item.mainCategory && (
                        <span style={{ color: "#888", fontSize: 12 }}> ({item.mainCategory})</span>
                      )}
                      <button
                        onClick={() => {
                          setEditCategoryId(item.id);
                          setEditCategoryValue(item.category || "");
                        }}
                        style={{ marginLeft: 8, fontSize: 12 }}
                      >수정</button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "#f87171",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                  title="삭제"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ClosetPage;
