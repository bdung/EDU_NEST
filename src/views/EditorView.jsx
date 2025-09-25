import React, { useState, useEffect } from "react";
import Question from "../components/Question";

function EditorView() {
  const [questions, setQuestions] = useState([]);
  const [type, setType] = useState("mcq"); // "mcq" hoặc "essay"
  const [content, setContent] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState(0);
  const [examTitle, setExamTitle] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const FIREBASE_URL = "https://webs-a59b6-default-rtdb.firebaseio.com"; // thay bằng DB của bạn

  useEffect(() => {
    fetch(`${FIREBASE_URL}/questions.json`)
      .then(res => res.json())
      .then(data => setQuestions(data || []))
      .catch(err => console.error("Lỗi load:", err));
  }, []);
// Paste hình từ clipboard vào textarea
const handlePaste = (e) => {
  const items = e.clipboardData.items;
  for (const item of items) {
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(prev => prev + `\n![](${event.target.result})\n`);
      };
      reader.readAsDataURL(file);
      e.preventDefault();
    }
  }
};
const handlePasteOption = (e, index) => {
  const items = e.clipboardData.items;
  for (const item of items) {
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (event) => {
        setOptions(prev => {
          const newOpts = [...prev];
          newOpts[index] += `\n![](${event.target.result})\n`;
          return newOpts;
        });
      };
      reader.readAsDataURL(file);
      e.preventDefault();
    }
  }
};

  const resetForm = () => {
    setContent("");
    setOptions(["", "", "", ""]);
    setAnswer(0);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    let newQuestion;
    if (type === "mcq") {
      newQuestion = { id: Date.now(), type, content, options, answer };
    } else {
      newQuestion = { id: Date.now(), type, content };
    }

    setQuestions(prev => [...prev, newQuestion]);
    resetForm();
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  // --- Lưu đề thi lên Firebase ---
  const handleSaveExam = () => {
    if (!examTitle || !startDateTime || !endDateTime) {
      alert("Vui lòng nhập tiêu đề và thời gian đề thi");
      return;
    }

    const examId = `exam_${Date.now()}`;
    const newExam = {
      examTitle,
      startDateTime,
      endDateTime,
      questions
    };

    fetch(`${FIREBASE_URL}/exams/${examId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExam)
    })
      .then(() => {
        alert(`✅ Đã lưu đề thi: ${examTitle}`);
        // Reset form
        setExamTitle("");
        setStartDateTime("");
        setEndDateTime("");
        setQuestions([]);
      })
      .catch(err => console.error(err));
  };
  // Preview live cho câu hỏi mới
  const renderLivePreview = () => {
    if (!content.trim()) return null;

    return (
      <div style={{ border: "1px solid #aaa", padding: 10, marginTop: 10 }}>
        <strong>Preview Live ({type === "mcq" ? "Trắc nghiệm" : "Tự luận"}):</strong>
        <Question content={content} />

        {type === "mcq" && (
  <ul>
    {options.map((opt, i) => (
      <li key={i} style={{ color: answer === i ? "green" : "black" }}>
        <Question content={opt} /> {answer === i && "(Đáp án đúng)"}
      </li>
    ))}
  </ul>
)}

      </div>
    );
  };

  return (
    
    <div style={{ display: "flex", padding: 20 }}>
      {/* Cột form */}
      <div style={{ flex: 1, marginRight: 20 }}>
        <div style={{ marginBottom: 20 }}>
  <label>
    Tiêu đề đề thi: 
    <input
      type="text"
      value={examTitle}
      onChange={e => setExamTitle(e.target.value)}
      style={{ width: "100%", marginBottom: 10 }}
    />
  </label>

  <label>
    Ngày giờ mở đề: 
    <input
      type="datetime-local"
      value={startDateTime}
      onChange={e => setStartDateTime(e.target.value)}
      style={{ width: "100%", marginBottom: 10 }}
    />
  </label>

  <label>
    Ngày giờ đóng đề: 
    <input
      type="datetime-local"
      value={endDateTime}
      onChange={e => setEndDateTime(e.target.value)}
      style={{ width: "100%" }}
    />
  </label>
</div>
        <h1>Tạo câu hỏi</h1>

        <label>
          Loại câu hỏi:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="mcq">Trắc nghiệm</option>
            <option value="essay">Tự luận</option>
          </select>
        </label>

        <form onSubmit={handleAddQuestion} style={{ marginTop: 15 }}>
          <textarea
            placeholder="Nhập nội dung câu hỏi (Text + LaTeX)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            onPaste={handlePaste}
            style={{ width: "100%", marginBottom: 10 }}
          />

          {type === "mcq" &&
            options.map((opt, i) => (
  <div key={i} style={{ marginBottom: 5 }}>
    <textarea
      placeholder={`Đáp án ${i + 1}`}
      value={opt}
      rows={2}
      style={{ width: "70%", verticalAlign: "top" }}
      onChange={(e) => {
        const newOptions = [...options];
        newOptions[i] = e.target.value;
        setOptions(newOptions);
      }}
      onPaste={(e) => handlePasteOption(e, i)}
    />
    <label style={{ marginLeft: 10 }}>
      <input
        type="radio"
        name="correct"
        checked={answer === i}
        onChange={() => setAnswer(i)}
      />
      Đúng
    </label>
  </div>
))}

          

          <button type="submit" style={{ marginTop: 10 }}>
            ➕ Thêm câu hỏi
          </button>
        </form>

        {/* Preview live */}
        {renderLivePreview()}

        <button onClick={handleSaveExam} style={{ marginTop: 20 }}>
          💾 Lưu tất cả lên Firebase
        </button>
      </div>

      {/* Cột danh sách câu hỏi */}
      <div style={{ flex: 1, borderLeft: "1px solid #ccc", paddingLeft: 20 }}>
        <h2>Danh sách câu hỏi</h2>
        {questions.length === 0 && <p>Chưa có câu hỏi nào.</p>}

        {questions.map((q, index) => (
          <div key={q.id} style={{ marginBottom: 15 }}>
            <strong>
              Câu {index + 1} ({q.type === "mcq" ? "Trắc nghiệm" : "Tự luận"}):
            </strong>
            <Question content={q.content} />

            {q.type === "mcq" && (
              <ul>
                {q.options.map((opt, i) => (
                  <li key={i} style={{ color: q.answer === i ? "green" : "black" }}>
                    <Question content={opt}></Question> {q.answer === i && "(Đáp án đúng)"}
                  </li>
                ))}
              </ul>
            )}

            <button onClick={() => handleDeleteQuestion(q.id)}>❌ Xóa</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EditorView;
