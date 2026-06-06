import { useState, useEffect } from "react";

const TypingText = ({paraText}) => {
  const fullText =paraText;

  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + fullText[index]);
        setIndex((prev) => prev + 1);
      }, 25);

      return () => clearTimeout(timeout);
    } else {
      const timer = setTimeout(() => {
        setDone(true); // typing finished
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [index]);

  return (
    <p className="text-blue-100 text-lg font-medium max-w-sm mx-auto leading-relaxed whitespace-pre-line">
      {text}
      {!done && <span className="animate-pulse">|</span>}
    </p>
  );
};

export default TypingText;
