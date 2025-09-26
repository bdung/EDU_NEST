// src/components/Question.jsx
import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

// Hàm chuẩn hóa LaTeX
const normalizeLaTeX = (str) => {
  if (!str) return "";
  return str
    .replace(/[\u2018\u2019]/g, "'")          // smart quotes ‘ ’ → '
    .replace(/[\u201C\u201D]/g, '"')         // smart quotes “ ” → "
    
    .replace(/\u2212/g, "-")                 // dấu trừ dài → -
    .replace(/\\alpha/g, "\\alpha")
    .replace(/\\beta/g, "\\beta")
    .replace(/\\gamma/g, "\\gamma")
    .replace(/\\angle/g, "\\angle")
    .replace(/\\triangle/g, "\\triangle");
};

const Question = ({ content }) => {
  if (!content) return null;

  // Chia block $$...$$ (block math) và text/inline
  const blockParts = content.split(/\$\$(.*?)\$\$/s);

  return (
    <div style={{ marginBottom: "20px", fontSize: "18px" }}>
      {blockParts.map((block, i) => {
        if (i % 2 === 1) {
          // Block math
          return (
            <BlockMath
              key={i}
              math={normalizeLaTeX(block.trim())}
            />
          );
        } else {
          // Text + Inline math
          const inlineParts = block.split(/\$(.*?)\$/);

          return inlineParts.map((part, j) => {
            if (j % 2 === 1)
              return (
                <InlineMath
                  key={i + "-" + j}
                  math={normalizeLaTeX(part.trim())}
                />
              );

            // Render Markdown hình ảnh ![](url)
            const imgMatch = part.match(/!\[\]\((.*?)\)/);
            if (imgMatch)
              return (
                <img
                  key={i + "-" + j}
                  src={imgMatch[1]}
                  alt="paste"
                  style={{ maxWidth: "200px", display: "block", margin: "10px 0" }}
                />
              );

            // Text bình thường
            return <span key={i + "-" + j}>{part}</span>;
          });
        }
      })}
    </div>
  );
};

export default Question;
