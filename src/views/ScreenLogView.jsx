import React, { useState, useEffect } from "react";

function ScreenLogView() {
  const [logs, setLogs] = useState([]);

  // Load log từ localStorage khi component mount
  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem("screenLogs") || "[]");
    setLogs(savedLogs);
  }, []);

  // Xóa log
  const clearLogs = () => {
    localStorage.removeItem("screenLogs");
    setLogs([]);
  };
// Hàm chuyển ISO string sang dd/mm/yyyy hh:mm:ss
const formatTime = (isoString) => {
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Tháng từ 0
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

  return (
    <div style={{ padding: "20px" }}>
      <h2>Log nghi ngờ rời tab / ẩn tab</h2>
      {logs.length === 0 ? (
        <p>Chưa có hành vi nào.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Thời gian</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>User</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>URL tab</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{formatTime(log.time)}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{log.user}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{log.url}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button
        onClick={clearLogs}
        style={{ marginTop: "20px", padding: "8px 16px", backgroundColor: "#f00", color: "#fff", border: "none", borderRadius: "4px" }}
      >
        Xóa log
      </button>
    </div>
  );
}

export default ScreenLogView;
 