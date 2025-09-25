import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginView from "./views/LoginView";
import EditorView from "./views/EditorView";
import ExamView from "./views/ExamView";
<<<<<<< HEAD
import ScreenLogView from "./views/ScreenLogView";
import SurveyComponent from "./components/SurveyComponent";
import 'katex/dist/katex.min.css';

=======
>>>>>>> parent of bad0eae (add time)
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
              <SurveyComponent />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/servey" 
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
