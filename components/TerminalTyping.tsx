import React, { useState, useEffect, useRef } from 'react';

interface TerminalTypingProps {
  text: string;
  speed?: number;
  className?: string;
}

const TerminalTyping: React.FC<TerminalTypingProps> = ({ text, speed = 50, className = "" }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayedText('');
    indexRef.current = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(indexRef.current));
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={className}>{displayedText}</span>;
};

export default TerminalTyping;
