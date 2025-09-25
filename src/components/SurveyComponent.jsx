import React from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css";
import { json_question } from "../assets/jsons/json_question";
import Question from "../components/Question";
import { createRoot } from "react-dom/client";
function renderWithQuestion(el, text) {
  if (el) {
    el.innerHTML = ""; // Xóa text cũ
    const mountPoint = document.createElement("div");
    el.appendChild(mountPoint);
    setTimeout(() => { // đảm bảo DOM đã mount
      const root = createRoot(mountPoint);
      root.render(<Question content={text} />);
    }, 0);
    
  }
}
function SurveyComponent() {
    const survey = new Model(json_question);
    survey.onComplete.add((sender, options) => {
        console.log(JSON.stringify(sender.data, null, 3));
    });
    // Render lại cả title + choices
    survey.onAfterRenderQuestion.add((survey, options) => {
        // Render title
        const titleEl = options.htmlElement.querySelector(".sv-title-actions__title .sv-string-viewer");
        renderWithQuestion(titleEl, options.question.title);

        const choiceEls = options.htmlElement.querySelectorAll(".sd-item__control-label .sv-string-viewer");
        choiceEls.forEach((el, idx) => {
        const choice = options.question.choices[idx];
        if (choice) {
            // choice có thể là string hoặc object {value, text}
            const text = typeof choice === "string" ? choice : choice.text;
            renderWithQuestion(el, text);
        }
        });
    });
    return (<Survey model={survey} />);
}

export default SurveyComponent;