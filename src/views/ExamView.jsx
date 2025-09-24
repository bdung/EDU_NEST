import React, { useEffect } from "react";
import Question from "../components/Question";

function ExamView() {
  const questions = JSON.parse(localStorage.getItem("questions") || "[]");
const handleLogout = () => {
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  window.location.href = "/";
};

  // Chặn copy
  useEffect(() => {
    const handleCopy = e => e.preventDefault();
    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  return (
    <div style={{ padding: "20px", userSelect: "none" }}>
      <h1>Đề thi</h1>
      {questions.length === 0 && <p>Chưa có câu hỏi nào.</p>}
      {questions.map((q, index) => (
        <div key={q.id} style={{ marginBottom: "20px" }}>
          <strong>Câu {index + 1}:</strong> <Question content={q.content} />
        </div>
      ))}
    </div>
  );
}

export default ExamView;
