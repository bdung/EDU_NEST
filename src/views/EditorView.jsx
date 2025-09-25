import React, { useState, useEffect } from "react";
import Question from "../components/Question";
function EditorView() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  // Load từ localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("questions") || "[]");
    setQuestions(saved);
  }, []);

 
const handleLogout = () => {
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  window.location.href = "/";
};

  const handleAddQuestion = e => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const newQuestions = [...questions, { id: Date.now(), content: newQuestion }];
    setQuestions(newQuestions);
    localStorage.setItem("questions", JSON.stringify(newQuestions));
    setNewQuestion("");
  };

  const handleDeleteQuestion = id => {
    const newQuestions = questions.filter(q => q.id !== id);
    setQuestions(newQuestions);
    localStorage.setItem("questions", JSON.stringify(newQuestions));
  };

  // Paste hình từ clipboard
  const handlePaste = e => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setNewQuestion(prev => prev + `\n![](${event.target.result})\n`);
        };
        reader.readAsDataURL(file);
        e.preventDefault();
      }
    }
  };

  return (
    <div style={{ display: "flex", padding: "20px", userSelect: "none" }}>
      
      {/* Cột trái: Form + Preview */}
      <div style={{ flex: 1, marginRight: "20px" }}>
        <h1>Nhập đề toán (Text + LaTeX + Hình)</h1>
        <form onSubmit={handleAddQuestion} style={{ marginBottom: "20px" }}>
          <textarea
            placeholder="Text + LaTeX ($...$ inline, $$...$$ block). Paste hình từ clipboard."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onPaste={handlePaste}
            rows={8}
            style={{ width: "100%", fontSize: "16px", marginBottom: "10px" }}
          />
          <button type="submit">Thêm câu hỏi</button>
        </form>

        {newQuestion && (
          <div>
            <h3>Preview:</h3>
            <Question content={newQuestion} />
          </div>
        )}
      </div>

      {/* Cột phải: Danh sách câu hỏi */}
      <div style={{ flex: 1, borderLeft: "1px solid #ccc", paddingLeft: "20px" }}>
        <h2>Danh sách câu hỏi</h2>
        {questions.length === 0 && <p>Chưa có câu hỏi nào.</p>}
        {questions.map((q, index) => (
          <div key={q.id} style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <strong>Câu {index + 1}:</strong> <Question content={q.content} />
            </div>
            <button onClick={() => handleDeleteQuestion(q.id)}>Xóa</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EditorView;
