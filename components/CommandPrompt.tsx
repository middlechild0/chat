import { useState, useEffect } from 'react';
import TerminalTyping from './TerminalTyping';

interface CommandPromptProps {
  command: string;
  delay?: number;
}

export default function CommandPrompt({ command, delay = 0 }: CommandPromptProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  if (!visible) return null;
  
  return (
    <div className="flex items-center space-x-2 text-green-300 text-lg">
      <span className="text-cyan-300 font-bold">root@fsociety:~$</span>
      <TerminalTyping text={command} speed={80} />
    </div>
  );
}