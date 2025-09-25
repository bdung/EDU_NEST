import React, {useState, useEffect } from "react";
import Question from "../components/Question";

function ExamView() {
  const username = sessionStorage.getItem("username") || "unknown_user";

  const questions = JSON.parse(localStorage.getItem("questions") || "[]");
  const [examTitle, setExamTitle] = useState(
  localStorage.getItem("examTitle") || "Đề thi");
  const [timeLeft, setTimeLeft] = useState(
    parseInt(localStorage.getItem("examDuration") || 0) * 60 // đổi sang giây
  );
const handleLogout = () => {
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  window.location.href = "/";
};

    useEffect(() => {
  const handleCopy = () => logAction("copy");
  document.addEventListener("copy", handleCopy);

  const handleContextMenu = (e) => {
    e.preventDefault();
    logAction("right-click");
    
  };
  document.addEventListener("contextmenu", handleContextMenu);

  const handleBlur = () => {logAction("blur (rời tab)");alert("Cảnh báo: bạn đã rời khỏi tab!");}
  window.addEventListener("blur", handleBlur);

  const handleVisibility = () => {
    if (document.hidden) logAction("tab hidden");
  };
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    document.removeEventListener("copy", handleCopy);
    document.removeEventListener("contextmenu", handleContextMenu);
    window.removeEventListener("blur", handleBlur);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, []);

const logAction = (action) => {
  const logs = JSON.parse(localStorage.getItem("screenLogs") || "[]");

  // Tránh log trùng trong vòng 1 giây (optional)
  const lastLog = logs[logs.length - 1];
  const now = new Date().toISOString();
  if (
    lastLog &&
    lastLog.user === username &&
    lastLog.action === action &&
    lastLog.url === window.location.href &&
    new Date(now) - new Date(lastLog.time) < 1000
  ) {
    return; // bỏ qua log trùng
  }

  logs.push({
    time: now,
    user: username,          // thêm username
    url: window.location.href, // lưu link tab hiện tại
    action
  });

  localStorage.setItem("screenLogs", JSON.stringify(logs));
};
  useEffect(() => {
  if (timeLeft <= 0) return;

  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, []);

  // Hàm format phút:giây
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };
  return (
    <div style={{ padding: "20px", userSelect: "none" }}>
      <h1>{examTitle}</h1>
      <h3 style={{ color: "red" }}>
        Thời gian còn lại: {formatTime(timeLeft)}
      </h3>

      {timeLeft <= 0 && (
        <div style={{ color: "red", fontWeight: "bold" }}>
          Hết giờ! Bài thi đã kết thúc.
        </div>
      )}
      {timeLeft <= 0 ? (
      <div style={{ color: "red", fontWeight: "bold", fontSize: "18px" }}>
        Hết giờ! Bài thi đã kết thúc.
      </div>
      ) : (
      // Chỉ render câu hỏi khi còn thời gian
      
      questions.map((q, index) => (
        <div key={q.id} style={{ marginBottom: "20px" }}>
          <strong>Câu {index + 1}:</strong> <Question content={q.content} />
        </div>
      ))
      )}
      
    </div>
  );
}

export default ExamView;
