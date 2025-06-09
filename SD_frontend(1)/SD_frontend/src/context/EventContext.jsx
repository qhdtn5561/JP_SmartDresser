// src/context/EventContext.jsx
import React, { createContext, useState } from 'react';

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState({
    '2025-04-01': [{ time: '10:00', event: '회사 회의' }],
    '2025-04-02': [{ time: '14:00', event: '친구 생일' }],
    '2025-04-03': [{ time: '09:00', event: '세미나 참석' }],
    '2025-04-04': [{ time: '10:00', event: '면접' }],
    '2025-04-05': [{ time: '14:00', event: '친구 약속' }],
    '2025-04-06': [],
    '2025-04-07': [{ time: '18:00', event: '헬스장' }],
    '2025-04-08': [],
    '2025-04-09': [{ time: '09:00', event: '회의' }],
  });

  const [weather, setWeather] = useState(null); // 현재 날씨 정보
  const [forecast, setForecast] = useState([]); // 주간 날씨 예보

  return (
    <EventContext.Provider value={{ events, setEvents, weather, setWeather, forecast, setForecast }}>
      {children}
    </EventContext.Provider>
  );
};
