// src/components/Question.jsx
import React, { StrictMode } from "react";
import { InlineMath, BlockMath } from "react-katex";
import 'katex/dist/katex.min.css';

const Question = ({ content }) => {
  // Chia block $$...$$ và inline $...$
  const normalizeLaTeX = (str) => {
  if (!str) return "";
  return str
   .replace(/\\+/g, "/\/") // \\ → \

    .replace(/\u2212/g, "-");        // dấu trừ dài
};
  const renderContent = (text) => {
    const blockParts = text.split(/\$\$(.*?)\$\$/s);
    return blockParts.map((block, i) => {
      if (i % 2 === 1) {
        return <BlockMath key={i} math={normalizeLaTeX(block) } />;
      } else {
        const inlineParts = block.split(/\$(.*?)\$/);
        return inlineParts.map((part, j) => {
          if (j % 2 === 1) return <InlineMath key={i + '-' + j} math={normalizeLaTeX(part)} />;
          // Render Markdown hình
          const imgMatch = part.match(/!\[\]\((.*?)\)/);
          if (imgMatch) return <img key={i+'-'+j} src={imgMatch[1]} alt="paste" style={{ maxWidth: "200px", display: "block", margin: "10px 0" }} />;
          return <span key={i+'-'+j}>{part}</span>;
        });
      }
    });
  };

  return <div style={{ marginBottom: "20px", fontSize: "18px" }}>{renderContent(content)}</div>;
};

export default Question;
