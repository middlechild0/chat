import { RefObject } from 'react';
import CommandPrompt from './CommandPrompt'; // Ensure this is imported only once

interface BootSequenceProps {
  commandHistory: string[];
  terminalRef: RefObject<HTMLDivElement | null>;
}

export default function BootSequence({ commandHistory, terminalRef }: BootSequenceProps) {
  return (
    <div
      className="bg-gray-900 border-2 border-green-400 rounded p-4 h-96 overflow-y-auto space-y-2 terminal-bg"
      ref={terminalRef}
    >
      {commandHistory.map((cmd, idx) => (
        <CommandPrompt key={idx} command={cmd} />
      ))}
    </div>
  );
}