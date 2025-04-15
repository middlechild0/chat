import { useState, useEffect, useRef } from 'react';

interface TerminalTypingProps {
  text: string;
  speed?: number;
  className?: string;
}

export default function TerminalTyping({ 
  text, 
  speed = 50, 
  className = "" 
}: TerminalTypingProps) {
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
}