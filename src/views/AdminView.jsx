import React, { useState, useEffect } from "react";
import Question from "../components/Question";
import { useNavigate } from "react-router-dom";
const FIREBASE_URL = "https://webs-a59b6-default-rtdb.firebaseio.com";

function AdminView() {
  const [examList, setExamList] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [answersList, setAnswersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [grades, setGrades] = useState({}); // { questionId: { score, note, img } }

  // --- Load danh sách đề thi ---
  useEffect(() => {
    const fetchExams = async () => {
      const res = await fetch(`${FIREBASE_URL}/exams.json`);
      const data = await res.json();
      setExamList(Object.entries(data || {}));
    };
    fetchExams();
  }, []);

  // --- Load danh sách học sinh ---
  useEffect(() => {
    if (!selectedExam) return;
    const fetchAnswers = async () => {
      const res = await fetch(`${FIREBASE_URL}/answers/${selectedExam.examId}.json`);
      const data = await res.json();
      setAnswersList(data ? Object.entries(data) : []);
    };
    fetchAnswers();
  }, [selectedExam]);

  const handleSelectUser = (username, answers) => {
    setSelectedUser(username);
    setUserAnswers(answers);

    // Khởi tạo grades
    const initialGrades = {};
    selectedExam.questions.forEach(q => {
      if (q.type === "mcq") {
        initialGrades[q.id] = {
          score: (answers[q.id] === q.answer ? 0.3 : 0), // 0.3 điểm cho trắc nghiệm đúng
          note: "",
          img: ""
        };
      } else if (q.type === "essay") {
        initialGrades[q.id] = {
          score: 0,
          note: "",
          img: ""
        };
      }
    });
    setGrades(initialGrades);
  };

  const handleGradeChange = (questionId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const handleUpload = (questionId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setGrades(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          img: event.target.result
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveGrades = async () => {
    try {
      await fetch(`${FIREBASE_URL}/grades/${selectedExam.examId}/${selectedUser}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grades)
      });
      alert("✅ Lưu thành công!");
      // Reload danh sách học sinh để hiển thị điểm + ảnh bên cạnh
      const res = await fetch(`${FIREBASE_URL}/answers/${selectedExam.examId}.json`);
      const data = await res.json();
      setAnswersList(data ? Object.entries(data) : []);
      setSelectedUser(null);
      setGrades({});
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi lưu điểm");
    }
  };

  const handleBackExamList = () => {
    setSelectedExam(null);
    setSelectedUser(null);
    setUserAnswers({});
    setAnswersList([]);
    setGrades({});
  };
  const navigate = useNavigate();

  const handleAddNewExam = () => {
    // Chuyển qua EditorView
    navigate("/editor"); // đường dẫn tới EditorView
  };

  return (
    <div style={{ padding: 20 }}>
      {!selectedExam && (
        <div>
          <h2>Danh sách đề thi</h2>
          <button className="btn btn-primary" onClick={handleAddNewExam} style={{ marginBottom: 10 }}>Thêm mới</button>
          {examList.length === 0 && <p>Không có đề thi nào.</p>}
          {examList.map(([examId, examData]) => (
            <button className="btn btn-primary"
              key={examId}
              onClick={() => setSelectedExam({ examId, ...examData })}
              style={{ display: "block", margin: "10px 0", padding: "10px" }}
            >
              {examData.examTitle}
            </button>
          ))}
        </div>
      )}

      {selectedExam && !selectedUser && (
        <div>
          <h2>Đề thi: {selectedExam.examTitle}</h2>
          <button className="btn btn-primary" onClick={handleBackExamList} style={{ marginBottom: 10 }}>🔙 Quay lại danh sách đề thi</button>
          <h3>Danh sách học sinh đã nộp bài:</h3>
          {answersList.length === 0 && <p>Chưa có học sinh nào nộp bài.</p>}
          {answersList.map(([username, answers]) => {
            // Tính tổng điểm nếu đã chấm
            const gradeRes = Object.entries(answers).reduce((sum, [qid, val]) => {
              return sum + ((answersList[qid]?.score) || 0);
            }, 0);
            return (
              <button className="btn btn-primary"
                key={username}
                onClick={() => handleSelectUser(username, answers)}
                style={{ display: "block", margin: "5px 0" }}
              >
                {username}
                {/* Hiển thị tổng điểm nếu đã có grades */}
                {grades && Object.keys(grades).length > 0 && (
                  <span> - Tổng điểm: {Object.values(grades).reduce((s, g) => s + (g.score || 0), 0)}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedUser && (
        <div>
          <h2>Học sinh: {selectedUser}</h2>
          <button className="btn btn-primary" onClick={() => setSelectedUser(null)} style={{ marginBottom: 10 }}>🔙 Quay lại danh sách học sinh</button>

          {selectedExam.questions.map((q, idx) => (
            <div key={q.id} style={{ marginBottom: 20, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
              <strong>Câu {idx + 1} ({q.type === "mcq" ? "Trắc nghiệm" : "Tự luận"}):</strong>
              <Question content={q.content} />

              {q.type === "mcq" && (
                <div>
                  {q.options.map((opt, i) => {
                    const selected = userAnswers[q.id];
                    return (
                      <div key={i} style={{ color: selected === i ? "green" : "black" }}>
                        <Question content={opt} />
                        {i === q.answer && <span> ✅ (Đáp án đúng, 0.3 điểm)</span>}
                        {selected === i && <span> - Chọn của học sinh</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === "essay" && (
                <div>
                  {userAnswers[q.id] && <img src={userAnswers[q.id]} alt="tự luận" style={{ maxWidth: 200, marginTop: 10 }} />}
                  <div style={{ marginTop: 10 }}>
                    <label>
                      Điểm: 
                      <input
                      className="form-control"
                        type="number"
                        value={grades[q.id]?.score || 0}
                        onChange={e => handleGradeChange(q.id, "score", parseFloat(e.target.value))}
                        style={{ width: 60, marginLeft: 5 }}
                      />
                    </label>
                    <br />
                    <label>
                      Ghi chú: 
                      <input className="form-control"
                        type="text"
                        value={grades[q.id]?.note || ""}
                        onChange={e => handleGradeChange(q.id, "note", e.target.value)}
                        style={{ width: "80%", marginLeft: 5 }}
                      />
                    </label>
                    <br />
                    <label>
                      Upload ảnh:
                      <input className="form-control" type="file" accept="image/*" onChange={e => handleUpload(q.id, e)} />
                    </label>
                    {grades[q.id]?.img && <img src={grades[q.id].img} alt="admin upload" style={{ maxWidth: 200, marginTop: 5 }} />}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button className="btn btn-primary" onClick={handleSaveGrades} style={{ padding: "10px 20px" }}>
            💾 Lưu điểm, ghi chú & ảnh
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminView;
