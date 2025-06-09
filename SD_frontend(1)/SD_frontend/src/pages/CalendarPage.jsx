import React, { useState, useContext, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { EventContext } from '../context/EventContext';
import DashboardNavbar from '../components/DashboardNavbar';

const formatDate = (date) => {
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = dayNames[date.getDay()];
  return `${dayName} (${month}월${day}일)`;
};

const CalendarPage = () => {
  const { events, setEvents } = useContext(EventContext);
  const [date, setDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({ time: '', event: '', note: '' });

  // 오늘·선택일 포맷
  const todayKey = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\./g, '-').replace(/\s/g, '');
  const selectedKey = date.toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\./g, '-').replace(/\s/g, '');

  /* =========================================================
     1) 월 전체 일정 불러오기
  ========================================================= */
  useEffect(() => {
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    fetch(`http://localhost:8080/api/calendar/month/${yearMonth}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        const parsed = {};
        data.forEach(d => {
          const key = d.date;                           // yyyy-MM-dd
          if (!parsed[key]) parsed[key] = [];
          parsed[key].push({
            id: d.id,
            time: d.time?.slice(0, 5) ||                // 🟢 변경: 서버 time 사용
                  d.startTime?.slice(11, 16) || '00:00',//    (백엔드 필드명 편의 처리)
            event: d.title,
            note: d.note || ''
          });
        });
        setEvents(parsed);
      })
      .catch(err => console.error('월 일정 로딩 실패:', err));
  }, [date, setEvents]);

  /* =========================================================
     2) 일정 추가
  ========================================================= */
  const handleAddEvent = () => {
    if (!newEvent.time || !newEvent.event) {
      alert('시간과 이벤트 내용을 입력하세요.');
      return;
    }

    fetch('http://localhost:8080/api/calendar/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: newEvent.event,
        date: selectedKey,
        time: newEvent.time,        // 🟢 변경: 시간도 전송
        note: newEvent.note
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('일정 추가 실패');
        return res.json();
      })
      .then(savedEvent => {
        setEvents(prev => ({
          ...prev,
          [selectedKey]: [
            ...(prev[selectedKey] || []),
            { ...newEvent, id: savedEvent.id }
          ]
        }));
        setNewEvent({ time: '', event: '', note: '' });
      })
      .catch(err => {
        alert('일정 추가 실패: 인증 필요 또는 서버 오류');
        console.error('추가 실패:', err);
      });
  };

  /* =========================================================
     3) 일정 삭제
  ========================================================= */
  const handleDeleteEvent = (key, index) => {
    const target = events[key][index];
    if (window.confirm('삭제하시겠습니까?')) {
      fetch(`http://localhost:8080/api/calendar/delete/${target.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(res => {
          if (!res.ok) throw new Error('삭제 실패');
          const updated = [...events[key]];
          updated.splice(index, 1);
          setEvents({ ...events, [key]: updated });
        })
        .catch(err => {
          alert('삭제 실패: 인증 필요 또는 서버 오류');
          console.error('삭제 실패:', err);
        });
    }
  };

  /* =========================================================
     4) 일정 수정
  ========================================================= */
  const handleUpdateEvent = (key, index) => {
    const target = events[key][index];
    const newTitle = prompt('일정을 수정하세요', target.event);
    if (newTitle && newTitle.trim() !== '') {
      fetch(`http://localhost:8080/api/calendar/update/${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle, date: key, time: target.time }) // 🟢 시간도 함께
      })
        .then(res => {
          if (!res.ok) throw new Error('수정 실패');
          return res.json();
        })
        .then(updated => {
          const updatedList = [...events[key]];
          updatedList[index].event = updated.title;
          setEvents({ ...events, [key]: updatedList });
        })
        .catch(err => {
          alert('수정 실패: 인증 필요 또는 서버 오류');
          console.error('수정 실패:', err);
        });
    }
  };

  /* =========================================================
     5) 캘린더 점 표시
  ========================================================= */
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const key = date.toLocaleDateString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      }).replace(/\./g, '-').replace(/\s/g, '');
      return (events[key] && events[key].length > 0)
        ? <div className="text-red-500 text-center text-x1">•</div>
        : null;
    }
  };

  /* =========================================================
     6) 화면
  ========================================================= */
  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <DashboardNavbar />
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <section className="flex flex-col lg:flex-row gap-10">
          {/* 캘린더 */}
          <div className="lg:w-1/2">
            <h2 className="text-2xl font-bold mb-4">📅 캘린더</h2>
            <div className="rounded-xl border shadow-md p-4">
              <Calendar
                onChange={setDate}
                value={date}
                calendarType="gregory"
                tileContent={tileContent}
              />
            </div>
          </div>

          {/* 일정 리스트 + 입력 */}
          <div className="lg:w-1/2">
            <h2 className="text-2xl font-bold mb-4">📝 {formatDate(date)} 일정</h2>
            <ul className="space-y-2">
              {(events[selectedKey] || []).map((event, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-gray-100 border px-4 py-2 rounded-md"
                >
                  <div>
                    <strong>{event.time}</strong>: {event.event}
                    {event.note && <span className="text-gray-500"> ({event.note})</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateEvent(selectedKey, i)}
                      className="text-blue-500 text-sm hover:underline"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(selectedKey, i)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
              {!(events[selectedKey] || []).length && (
                <li className="text-gray-400">일정이 없습니다.</li>
              )}
            </ul>

            {/* 입력 폼 */}
            <div className="flex flex-col gap-3 mt-4">
              <input
                type="time"
                value={newEvent.time}
                onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                className="border px-3 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="이벤트 내용"
                value={newEvent.event}
                onChange={e => setNewEvent({ ...newEvent, event: e.target.value })}
                className="border px-3 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="메모 (선택)"
                value={newEvent.note}
                onChange={e => setNewEvent({ ...newEvent, note: e.target.value })}
                className="border px-3 py-2 rounded-md"
              />
              <button
                onClick={handleAddEvent}
                className="bg-black text-white py-2 rounded-md hover:bg-gray-800"
              >
                일정 추가
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CalendarPage;
