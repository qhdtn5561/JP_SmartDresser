// 1️⃣ ClosetContext.js
import React, { createContext, useState, useEffect } from 'react';

export const ClosetContext = createContext();

export const ClosetProvider = ({ children }) => {
  const [closetItems, setClosetItems] = useState([]);

  // 로그인한 유저의 userIdx를 localStorage 등에서 동적으로 가져옴
  const getUserIdx = () => localStorage.getItem("userIdx");

  const fetchClosetItems = async () => {
    const userIdx = getUserIdx();
    if (!userIdx) return;
    const res = await fetch(`http://localhost:8080/items/user/${userIdx}`, {
      credentials: "include"
    });
    if (res.ok) {
      const data = await res.json();
      setClosetItems(data);
    }
  };

  useEffect(() => {
    fetchClosetItems();
    // eslint-disable-next-line
  }, []);

  // 아이템 추가/삭제/수정 후 fetchClosetItems로 갱신
  const addItem = async () => { await fetchClosetItems(); };
  const removeItem = async () => { await fetchClosetItems(); };
  const updateItem = async () => { await fetchClosetItems(); };

  return (
    <ClosetContext.Provider value={{ closetItems, setClosetItems, addItem, removeItem, updateItem, fetchClosetItems }}>
      {children}
    </ClosetContext.Provider>
  );
};
