import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginView from "./views/LoginView";
import EditorView from "./views/EditorView";
import ExamView from "./views/ExamView";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginView />} />
        
        {/* Chỉ admin mới vào EditorView */}
        <Route 
          path="/editor" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditorView />
            </ProtectedRoute>
          } 
        />

        {/* Admin và user đều có quyền vào ExamView */}
        <Route 
          path="/exam" 
          element={
            <ProtectedRoute allowedRoles={["admin","user"]}>
              <ExamView />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
