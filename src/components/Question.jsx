// src/components/Question.jsx
import React from "react";
import { InlineMath, BlockMath } from "react-katex";


const Question = ({ content }) => {
  // Chia block $$...$$ và inline $...$
  const renderContent = (text = "") => {
  if (!text) return null;
  const blockParts = text.split(/\$\$(.+?)\$\$/gs); // 's' để match newline
  return blockParts.map((block, i) => {
    if (i % 2 === 1) return <BlockMath key={i} math={block} />;
    // inline math
    const inlineParts = block.split(/\$(.+?)\$/g);
    return inlineParts.map((part, j) => {
      if (j % 2 === 1) return <InlineMath key={i + "-" + j} math={part} />;
      // markdown image
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
      return <span key={i + "-" + j}>{part}</span>;
    });
  });
};

  return <div style={{ marginBottom: "20px", fontSize: "18px" }}>{renderContent(content)}</div>;
};

export default Question;
