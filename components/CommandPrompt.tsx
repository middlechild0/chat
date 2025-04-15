import React, { useState, useEffect } from 'react';
import TerminalTyping from './TerminalTyping';

interface CommandPromptProps {
  command: string;
  delay?: number;
}

const CommandPrompt: React.FC<CommandPromptProps> = ({ command, delay = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <div className="flex items-center space-x-2 text-green-400">
      <span className="text-cyan-400">root@fsociety:~$</span>
      <TerminalTyping text={command} speed={80} />
    </div>
  );
};

export default CommandPrompt;
