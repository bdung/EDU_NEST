import React, { useState, useEffect, useRef  } from "react";
import Question from "../components/Question";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
function EditorView() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const questionsRef = useRef();
  const [examTitle, setExamTitle] = useState(
  localStorage.getItem("examTitle") || "Đề thi");
  const [examDuration, setExamDuration] = useState(
  localStorage.getItem("examDuration") || 60 );




  // Load từ localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("questions") || "[]");
    setQuestions(saved);
  }, []);

  // Chặn copy
  useEffect(() => {
    const handleCopy = e => e.preventDefault();
    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
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
 // Tải PDF
  const handleDownloadPDF = () => {
    const input = questionsRef.current;
    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("de-thi.pdf");
    });
  };
  return (
    <div style={{ display: "flex", padding: "20px", userSelect: "none" }}>
      
      {/* Cột trái: Form + Preview */}
      <div style={{ flex: 1, marginRight: "20px" }}>
        <h1>Nhập đề toán (Text + LaTeX + Hình)</h1>
        <input
        type="text"
        value={examTitle}
        onChange={(e) => {
          setExamTitle(e.target.value);
          localStorage.setItem("examTitle", e.target.value);
        }}
        placeholder="Nhập tiêu đề đề thi"
        style={{ fontSize: "20px", marginBottom: "20px", width: "100%" }}
      />
      <input
        type="number"
        value={examDuration}
        min={1}
        onChange={(e) => {
          setExamDuration(e.target.value);
          localStorage.setItem("examDuration", e.target.value);
        }}
        placeholder="Nhập thời gian thi (phút)"
        style={{ fontSize: "16px", marginBottom: "20px" }}
      />
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
      <div ref={questionsRef} style={{ flex: 1, borderLeft: "1px solid #ccc", paddingLeft: "20px" }}>
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
  <button onClick={handleDownloadPDF} style={{ marginTop: "20px" }}>Tải PDF đề thi</button>
  
</div>
      
          </div>
  );
}

export default EditorView;
