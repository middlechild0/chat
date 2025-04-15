import { RefObject } from 'react';

interface Message {
  type: string;
  from?: string;
  to?: string;
  message?: string;
  error?: string;
  timestamp: any;
}

interface TerminalOutputProps {
  commandHistory: string[];
  messages: Message[];
  terminalRef: RefObject<HTMLDivElement | null>;
}

export default function TerminalOutput({
  commandHistory,
  messages,
  terminalRef
}: TerminalOutputProps) {
  return (
    <div className="md:col-span-2 bg-gray-900 border-2 border-green-400 rounded h-96 terminal-bg overflow-hidden flex flex-col">
      <div className="bg-green-600 px-3 py-1 text-base text-green-100 border-b-2 border-green-400 flex justify-between items-center">
        <span className="font-bold">terminal_output.log</span>
        <span className="flex space-x-2">
          <span className="h-3 w-3 rounded-full bg-red-500"></span>
          <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
          <span className="h-3 w-3 rounded-full bg-green-500"></span>
        </span>
      </div>
      
      <div className="p-3 overflow-y-auto flex-grow" ref={terminalRef}>
        {commandHistory.map((cmd, idx) => (
          <div key={`cmd-${idx}`} className="text-green-300 my-1 terminal-line text-lg">
            {cmd.startsWith('>') ? (
              <div className="font-bold">{cmd}</div>
            ) : (
              <div className="flex">
                <span className="text-cyan-300 mr-2 font-bold">root@fsociety:~$</span>
                <span>{cmd}</span>
              </div>
            )}
          </div>
        ))}
        
        {messages.map((msg, idx) => (
          <div
            key={`msg-${idx}`}
            className={`whitespace-pre-wrap my-2 text-lg ${
              msg.type === 'sent'
                ? 'text-green-300 ml-4 border-l-2 border-green-400 pl-2'
                : msg.type === 'received'
                ? 'text-cyan-300 mr-4 border-l-2 border-cyan-400 pl-2'
                : 'text-red-300 border-l-2 border-red-400 pl-2'
            }`}
          >
            {msg.type === 'sent' && (
              <p className="text-sm text-green-400 font-bold">TX: {msg.to} @ {new Date(msg.timestamp).toLocaleTimeString()}</p>
            )}
            {msg.type === 'received' && (
              <p className="text-sm text-cyan-400 font-bold">RX: {msg.from} @ {new Date(msg.timestamp).toLocaleTimeString()}</p>
            )}
            {msg.type === 'error' && (
              <p className="text-red-300 font-bold">ERROR: {msg.error}</p>
            )}
            <p className="terminal-line">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}