import React, { useState, useEffect, useRef } from "react";
import Question from "../components/Question";
import html2pdf from "html2pdf.js";

const FIREBASE_URL = "https://webs-a59b6-default-rtdb.firebaseio.com";

function ExamView() {
  const username = localStorage.getItem("username") || "guest";

  const [examList, setExamList] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [grades, setGrades] = useState({});
  const [now, setNow] = useState(new Date());

  const contentRef = useRef(); // Ref để export PDF

  // ------------------- Load danh sách đề thi -------------------
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch(`${FIREBASE_URL}/exams.json`);
        const data = await res.json();
        if (!data) return;

        const exams = Object.entries(data); // [examId, examData]

        const examsWithGrades = await Promise.all(
          exams.map(async ([examId, examData]) => {
            const resGrades = await fetch(`${FIREBASE_URL}/grades/${examId}/${username}.json`);
            const gradesData = await resGrades.json();
            return [examId, { ...examData, grades: gradesData }];
          })
        );

        setExamList(examsWithGrades);
      } catch (err) {
        console.error(err);
      }
    };

    fetchExams();
  }, [username]);

  // ------------------- Cập nhật giờ realtime -------------------
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ------------------- Load câu trả lời học sinh -------------------
  useEffect(() => {
    if (!selectedExam) return;

    const fetchAnswers = async () => {
      try {
        const res = await fetch(`${FIREBASE_URL}/answers/${selectedExam.examId}/${username}.json`);
        const data = await res.json();
        setAnswers(data || {});
      } catch (err) {
        console.error(err);
      }
    };

    fetchAnswers();
  }, [selectedExam, username]);

  // ------------------- Chọn trắc nghiệm -------------------
  const handleSelect = (qid, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [qid]: optionIndex }));
  };

  // ------------------- Upload ảnh tự luận -------------------
  const handleUpload = (qid, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAnswers((prev) => ({ ...prev, [qid]: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // ------------------- Nộp bài -------------------
  const handleSubmit = async () => {
    try {
      await fetch(`${FIREBASE_URL}/answers/${selectedExam.examId}/${username}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      alert("✅ Nộp bài thành công!");
      setSelectedExam(null);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi nộp bài");
    }
  };

  // ------------------- Chặn copy -------------------
  useEffect(() => {
    const handleCopy = (e) => e.preventDefault();
    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  // ------------------- Xuất PDF -------------------
  const handleDownloadPDF = () => {
    if (!contentRef.current || !questions || questions.length === 0) {
      alert("Chưa có nội dung để xuất PDF");
      return;
    }

    html2pdf()
      .set({
        margin: 10,
        filename: `${selectedExam.examTitle}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(contentRef.current)
      .save();
  };

  // ------------------- Nếu chưa chọn đề -------------------
  if (!selectedExam) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Chọn đề thi</h2>
        {examList.length === 0 && <p>Không có đề thi nào.</p>}
        {examList.map(([examId, examData]) => {
          const start = new Date(examData.startDateTime);
          const end = new Date(examData.endDateTime);
          const gradeAvailable = examData.grades ? true : false;
          let totalScore = 0;
          if (gradeAvailable) {
            totalScore = Object.values(examData.grades).reduce((s, g) => s + (g.score || 0), 0);
          }
          return (
            <button
              className="btn btn-primary"
              key={examId}
              onClick={() => setSelectedExam({ examId, ...examData })}
              style={{ display: "block", margin: "10px 0", padding: "10px" }}
            >
              {examData.examTitle} ({start.toLocaleString()} - {end.toLocaleString()})
              {gradeAvailable && <span> - Điểm: {totalScore}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // ------------------- Nếu đã chọn đề -------------------
  const { examId, examTitle, startDateTime, endDateTime, questions, grades: examGrades } = selectedExam;
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (now < start) return <p>Đề thi sẽ mở vào: {start.toLocaleString()}</p>;
  if (now > end && !Object.keys(examGrades || {}).length) {
    return (
      <>
        <p>Đã hết thời gian làm đề</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Quay lại
        </button>
      </>
    );
  }

  return (
    <div style={{ padding: 20, userSelect: "none" }}>
      <h1>{examTitle}</h1>

      <button className="btn btn-success mb-3" onClick={handleDownloadPDF}>
        Tải PDF
      </button>

      <div ref={contentRef}>
        {questions.length === 0 && <p>Chưa có câu hỏi nào.</p>}

        {questions.map((q, idx) => (
          <div key={q.id} style={{ marginBottom: 20, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
            <strong>
              Câu {idx + 1} ({q.type === "mcq" ? "Trắc nghiệm" : "Tự luận"}):
            </strong>

            <Question content={q.content} />

            {q.type === "mcq" && (
              <div>
                {q.options.map((opt, i) => {
                  const selected = answers[q.id];
                  return (
                    <label key={i} style={{ display: "block", color: selected === i ? "green" : "black" }}>
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        checked={selected === i}
                        onChange={() => handleSelect(q.id, i)}
                        disabled={examGrades && examGrades[q.id]}
                      />
                      <Question content={opt} />
                      {examGrades && examGrades[q.id] && i === q.answer && <span> ✅ (Đúng, 0.3 điểm)</span>}
                      {examGrades && examGrades[q.id] && selected === i && <span> - Chọn của bạn</span>}
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === "essay" && (
              <div>
                {answers[q.id] && <img src={answers[q.id]} alt="tự luận" style={{ maxWidth: 200, marginTop: 10 }} />}
                {examGrades && examGrades[q.id] && (
                  <p>
                    Điểm: {examGrades[q.id].score} | Ghi chú: {examGrades[q.id].note}
                    {examGrades[q.id].img && (
                      <>
                        <br />
                        <img src={examGrades[q.id].img} alt="admin upload" style={{ maxWidth: 200, marginTop: 5 }} />
                      </>
                    )}
                  </p>
                )}
                {!examGrades && (
                  <input className="form-control" type="file" accept="image/*" onChange={(e) => handleUpload(q.id, e)} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!examGrades && (
        <button className="btn btn-primary mt-3" onClick={handleSubmit} style={{ padding: "10px 20px" }}>
          Nộp bài
        </button>
      )}

      <button className="btn btn-primary mt-3" onClick={() => setSelectedExam(null)} style={{ marginLeft: 20, padding: "10px 20px" }}>
        Chọn đề thi khác
      </button>
    </div>
  );
}

export default ExamView;
