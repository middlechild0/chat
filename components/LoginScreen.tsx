import { RefObject } from 'react';
import TerminalTyping from './TerminalTyping';

interface LoginScreenProps {
  commandHistory: string[];
  clientId: string;
  setClientId: (id: string) => void;
  registerClient: (e: React.FormEvent) => void;
  playKeystroke: () => void;
  terminalRef: RefObject<HTMLDivElement | null>;
}

export default function LoginScreen({
  commandHistory,
  clientId,
  setClientId,
  registerClient,
  playKeystroke,
  terminalRef
}: LoginScreenProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border-2 border-green-400 rounded p-4 h-60 overflow-y-auto terminal-bg" ref={terminalRef}>
        {commandHistory.map((cmd, idx) => (
          <div key={idx} className="text-green-300 my-1 text-lg">
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
        <div className="mt-4 text-green-300">
          <TerminalTyping 
            text="Hello, friend. We need your identity to proceed. Are you ready to join the revolution?" 
            speed={30}
            className="text-yellow-300 font-bold text-lg"
          />
        </div>
      </div>
      
      <form onSubmit={registerClient} className="space-y-4">
        <div className="flex items-center">
          <span className="text-cyan-300 mr-2 font-bold text-lg">root@fsociety:~$</span>
          <input
            type="text"
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              playKeystroke();
            }}
            className="bg-gray-900 border-b-2 border-green-300 px-3 py-2 w-full text-green-300 focus:outline-none focus:border-cyan-300 text-lg font-medium"
            placeholder="Enter hacker handle"
            autoFocus
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-700 hover:bg-green-600 border-2 border-green-300 px-4 py-2 rounded font-mono text-base font-bold glitch-hover text-green-100"
        >
          INITIALIZE CONNECTION
        </button>
      </form>
      
      <div className="text-base text-green-300 mt-4 font-bold">
        <p className="glitch-text-subtle">[Secure connection established. Encryption: AES-256. Signal: STRONG]</p>
      </div>
    </div>
  );
}