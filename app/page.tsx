'use client';

import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Typing animation component with enhanced terminal feel
function TerminalTyping({ text, speed = 50, className = "" }: { text: string; speed?: number; className?: string }) {
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

// ASCII art loading animation
function LoadingAnimation() {
  const frames = ['[    ]', '[=   ]', '[==  ]', '[=== ]', '[====]', '[ ===]', '[  ==]', '[   =]'];
  const [frameIndex, setFrameIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 150);
    return () => clearInterval(interval);
  }, []);
  
  return <span className="font-mono text-green-400 font-bold">{frames[frameIndex]}</span>;
}

// Command prompt component
function CommandPrompt({ command, delay = 0 }: { command: string; delay?: number }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearInterval(timer);
  }, [delay]);
  
  if (!visible) return null;
  
  return (
    <div className="flex items-center space-x-2 text-green-300">
      <span className="text-cyan-300 font-bold">root@fsociety:~$</span>
      <TerminalTyping text={command} speed={80} className="font-bold" />
    </div>
  );
}

// Blinking cursor component
function BlinkingCursor() {
  return <span className="animate-blink text-green-300 font-bold text-xl">_</span>;
}

// ASCII art for the FSociety mask
const FsocietyLogo = () => (
  <pre className="text-green-300 text-sm leading-tight font-bold">
    {`
     .--.     .--. 
    |o_o |   |o_o | 
    |:_/ |   |:_/ | 
   //   \\ \\ //   \\ \\ 
  (|     | )(|     | )
 /'\\_   _/'\\\\'\_   _/'\\
 \\___)=(___/ \\___)=(___)
    `}
  </pre>
);

// Sound effects manager
function useSoundEffects() {
  const keySound = useRef<HTMLAudioElement | null>(null);
  const connectSound = useRef<HTMLAudioElement | null>(null);
  const alertSound = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    keySound.current = new Audio('/sounds/keystroke.mp3');
    connectSound.current = new Audio('/sounds/connect.mp3');
    alertSound.current = new Audio('/sounds/alert.mp3');
    
    // Preload
    keySound.current.load();
    connectSound.current.load();
    alertSound.current.load();
    
    // Set volume
    if (keySound.current) keySound.current.volume = 0.2;
    if (connectSound.current) connectSound.current.volume = 0.3;
    if (alertSound.current) alertSound.current.volume = 0.4;
  }, []);
  
  const playKeystroke = () => keySound.current?.play().catch(() => {});
  const playConnect = () => connectSound.current?.play().catch(() => {});
  const playAlert = () => alertSound.current?.play().catch(() => {});
  
  return { playKeystroke, playConnect, playAlert };
}

export default function Home() {
  const [clientId, setClientId] = useState('');
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [messages, setMessages] = useState<
    { type: string; from?: string; to?: string; message?: string; error?: string; timestamp: any }[]
  >([]);
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  
  // System status
  const [bootSequence, setBootSequence] = useState(true);
  const [systemStatus, setSystemStatus] = useState('initializing');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [showLogo, setShowLogo] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const { playKeystroke, playConnect, playAlert } = useSoundEffects();

  // Simulate boot sequence
  useEffect(() => {
    if (bootSequence) {
      const bootCommands = [
        { command: "init system", delay: 1000 },
        { command: "loading kernel modules...", delay: 2000 },
        { command: "establishing secure connection", delay: 3000 },
        { command: "checking for surveillance...", delay: 4000 },
        { command: "bypassing security protocols", delay: 5000 },
        { command: "fsociety connection established", delay: 6000 },
      ];
      
      bootCommands.forEach((cmd, index) => {
        setTimeout(() => {
          setCommandHistory(prev => [...prev, cmd.command]);
          if (index === bootCommands.length - 1) {
            setBootSequence(false);
            setSystemStatus('ready');
            setShowLogo(true);
            playConnect();
          } else {
            playKeystroke();
          }
        }, cmd.delay);
      });
    }
  }, [bootSequence]);

  // Scroll to bottom of terminal output
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory, messages]);

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('clientList', (clients: string[]) => {
      setAvailableClients(clients.filter((id: string) => id !== clientId));
      playKeystroke();
    });

    socketRef.current.on('receiveMessage', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'received',
          from: data.from,
          message: data.message,
          timestamp: data.timestamp,
        },
      ]);
      playAlert();
    });

    socketRef.current.on('messageSent', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'sent',
          to: data.to,
          message: data.message,
          timestamp: data.timestamp,
        },
      ]);
      playKeystroke();
    });

    socketRef.current.on('messageError', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          to: data.to,
          error: data.error,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        },
      ]);
      playAlert();
    });

    socketRef.current.on('userOffline', (to) => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          to,
          error: `User ${to} is offline`,
          timestamp: new Date(),
        },
      ]);
      playAlert();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    setAvailableClients((prev) => prev.filter((id) => id !== clientId));
  }, [clientId]);

  const registerClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId.trim()) {
      if (socketRef.current) {
        socketRef.current.emit('register', clientId);
      }
      setRegistered(true);
      playConnect();
      setCommandHistory(prev => [...prev, `identity assigned: ${clientId}`]);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && recipient) {
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', {
          to: recipient,
          from: clientId,
          message,
        });
      }
      
      // Add to command history for effect
      if (message.startsWith('/')) {
        setCommandHistory(prev => [...prev, `execute: ${message}`]);
      }
      
      setMessage('');
      playKeystroke();
    }
  };

  // Handle special commands
  const handleSpecialCommand = (cmd: string) => {
    playKeystroke();
    
    setCommandHistory(prev => [...prev, `> ${cmd}`]);
    
    switch(cmd.toLowerCase()) {
      case 'prepare':
        setTimeout(() => {
          setCommandHistory(prev => [...prev, ">> system primed for data extraction"]);
          playConnect();
        }, 800);
        break;
      case 'question':
        setTimeout(() => {
          setCommandHistory(prev => [...prev, ">> secure line open for inquiries"]);
          playConnect();
        }, 800);
        break;
      case 'join':
        setTimeout(() => {
          setCommandHistory(prev => [...prev, ">> initiating recruitment protocol"]);
          playConnect();
        }, 800);
        break;
      case 'wake up':
        setTimeout(() => {
          setCommandHistory(prev => [...prev, ">> Hello, friend. You've been sleeping too long."]);
          playAlert();
        }, 800);
        break;
      default:
        setTimeout(() => {
          setCommandHistory(prev => [...prev, ">> command not recognized"]);
        }, 400);
    }
  };

  return (
    <div className="bg-black min-h-screen text-green-300 font-mono p-4 flex flex-col overflow-hidden relative">
      {/* CRT screen overlay effect - minimal opacity for better visibility */}
      <div className="absolute inset-0 pointer-events-none bg-scanline opacity-3 z-10"></div>
      
      {/* Content wrapper */}
      <div className="max-w-4xl mx-auto flex flex-col space-y-6 relative z-0 w-full">
        {/* Header with enhanced glitch effect */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-300 relative glitch-text">
            {bootSequence ? (
              <LoadingAnimation />
            ) : (
              <TerminalTyping text="FSociety Terminal" speed={80} className="font-bold" />
            )}
          </h1>
          
          <div className="flex space-x-4 text-sm">
            <div className="text-cyan-300 font-bold">
              <span>STATUS:</span> 
              <span className={`ml-2 ${systemStatus === 'ready' ? 'text-green-300' : 'text-yellow-300'} font-bold`}>
                {systemStatus.toUpperCase()}
              </span>
            </div>
            <div className="text-cyan-300 font-bold">
              {new Date().toLocaleDateString()} <span className="blink">|</span> {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        {showLogo && (
          <div className="flex justify-center my-2">
            <FsocietyLogo />
          </div>
        )}
        
        {/* Boot sequence or main terminal */}
        {bootSequence ? (
          <div className="bg-black border-4 border-green-500 rounded p-4 h-96 overflow-y-auto space-y-2 terminal-bg-improved" ref={terminalRef}>
            {commandHistory.map((cmd, idx) => (
              <CommandPrompt key={idx} command={cmd} />
            ))}
          </div>
        ) : !registered ? (
          <div className="space-y-4">
            <div className="bg-black border-4 border-green-500 rounded p-4 h-60 overflow-y-auto terminal-bg-improved" ref={terminalRef}>
              {commandHistory.map((cmd, idx) => (
                <div key={idx} className="text-green-300 my-1 font-bold">
                  {cmd.startsWith('>') ? (
                    <div>{cmd}</div>
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
                <span className="text-cyan-300 mr-2 font-bold">root@fsociety:~$</span>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    playKeystroke();
                  }}
                  className="bg-black border-b-4 border-green-400 px-3 py-2 w-full text-green-300 focus:outline-none focus:border-cyan-300 bg-transparent font-bold text-lg"
                  placeholder="Enter hacker handle"
                  autoFocus
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-700 hover:bg-green-600 border-4 border-green-400 px-6 py-3 rounded font-mono text-base font-bold glitch-hover"
              >
                INITIALIZE CONNECTION
              </button>
            </form>
            
            <div className="text-base text-green-300 mt-4 font-bold">
              <p className="glitch-text-subtle">[Secure connection established. Encryption: AES-256. Signal: STRONG]</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center text-base">
              <div className="text-green-300">
                <span className="text-cyan-300 font-bold">USER:</span> <span className="font-bold glitch-text-subtle">{clientId}</span>
              </div>
              <div className="text-green-300">
                <span className="text-cyan-300 font-bold">NETWORK:</span> <span className="font-bold">{availableClients.length} operative{availableClients.length !== 1 ? 's' : ''} online</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Terminal output */}
              <div className="md:col-span-2 bg-black border-4 border-green-500 rounded h-96 terminal-bg-improved overflow-hidden flex flex-col">
                <div className="bg-green-600 px-3 py-1 text-sm text-white border-b-4 border-green-500 flex justify-between items-center font-bold">
                  <span>terminal_output.log</span>
                  <span className="flex space-x-2">
                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                    <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
                    <span className="h-3 w-3 rounded-full bg-green-500"></span>
                  </span>
                </div>
                
                <div className="p-3 overflow-y-auto flex-grow" ref={terminalRef}>
                  {commandHistory.map((cmd, idx) => (
                    <div key={`cmd-${idx}`} className="text-green-300 my-1 terminal-line font-bold">
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
                      className={`whitespace-pre-wrap my-2 ${
                        msg.type === 'sent'
                          ? 'text-green-300 ml-4 border-l-4 border-green-500 pl-2 font-bold'
                          : msg.type === 'received'
                          ? 'text-cyan-300 mr-4 border-l-4 border-cyan-500 pl-2 font-bold'
                          : 'text-red-300 border-l-4 border-red-500 pl-2 font-bold'
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
              
              {/* Command panel */}
              <div className="bg-black border-4 border-green-500 rounded overflow-hidden flex flex-col">
                <div className="bg-green-600 px-3 py-1 text-sm text-white border-b-4 border-green-500 font-bold">
                  command_center.exe
                </div>
                
                <div className="p-3 space-y-4 text-base flex-grow">
                  <div>
                    <h3 className="text-cyan-300 mb-2 text-base font-bold">AVAILABLE OPERATIVES:</h3>
                    <div className="bg-black/50 border-4 border-green-500 p-2 max-h-24 overflow-y-auto">
                      {availableClients.length === 0 ? (
                        <p className="text-red-300 text-base font-bold">No operatives online</p>
                      ) : (
                        availableClients.map((client) => (
                          <div 
                            key={client} 
                            className={`flex items-center space-x-2 py-1 cursor-pointer hover:text-cyan-300 ${recipient === client ? 'text-cyan-300' : 'text-green-300'} font-bold`}
                            onClick={() => setRecipient(client)}
                          >
                            <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
                            <span>{client}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-cyan-300 mb-2 text-base font-bold">QUICK COMMANDS:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['prepare', 'question', 'join', 'wake up'].map((cmd) => (
                        <button
                          key={cmd}
                          onClick={() => handleSpecialCommand(cmd)}
                          className="bg-green-700 border-2 border-green-500 px-2 py-2 text-sm hover:bg-green-600 hover:text-cyan-300 text-left font-bold"
                        >
                          /{cmd}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <form onSubmit={sendMessage} className="mt-auto p-3 border-t-4 border-green-500">
                  <div className="mb-2">
                    <select
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="bg-black border-4 border-green-500 rounded px-3 py-2 text-green-300 focus:outline-none focus:border-cyan-300 text-base w-full font-bold"
                      required
                    >
                      <option value="">SELECT TARGET</option>
                      {availableClients.map((client) => (
                        <option key={client} value={client}>
                          {client}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (e.target.value.length % 3 === 0) playKeystroke();
                      }}
                      rows={2}
                      className="bg-black border-4 border-green-500 rounded w-full px-3 py-2 text-green-300 resize-none focus:outline-none focus:border-cyan-300 text-base font-bold"
                      placeholder="Enter transmission data..."
                      required
                    />
                    <div className="absolute bottom-2 right-3">
                      <BlinkingCursor />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!recipient}
                    className="bg-green-700 hover:bg-green-600 border-4 border-green-500 mt-2 px-4 py-2 rounded text-base font-mono font-bold disabled:opacity-50 w-full glitch-hover"
                  >
                    TRANSMIT
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-2 text-base text-green-300 flex justify-between items-center font-bold">
              <div className="glitch-text-subtle">[Connection secure. Signal encrypted. No surveillance detected.]</div>
              <div className="animate-pulse">
                <span className="mr-2">◉</span> LIVE CONNECTION
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        
        body {
          font-family: 'VT323', monospace;
          background-color: #000;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        /* Improved terminal background with better visibility */
        .terminal-bg-improved {
          background-color: rgba(0, 20, 0, 0.6);  /* Increased opacity for better contrast */
          box-shadow: inset 0 0 30px rgba(0, 255, 0, 0.2);
          position: relative;
        }
        
        .terminal-bg-improved::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(rgba(0, 255, 0, 0.03) 50%, transparent 50%);
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 1;
          opacity: 0.3;  /* Reduced opacity for better text readability */
        }
        
        .terminal-line {
          position: relative;
          z-index: 2;
          text-shadow: 0 0 3px rgba(0, 255, 0, 0.9);  /* Enhanced text glow for better visibility */
          letter-spacing: 0.5px; /* Slightly increased letter spacing for readability */
        }
        
        .glitch-text {
          position: relative;
          color: #4ade80;  /* Brighter green */
          text-shadow:
            0 0 5px #4ade80,
            0 0 10px #4ade80;
          animation: glitch 3s infinite;
        }
        
        .glitch-text-subtle {
          position: relative;
          animation: glitch-subtle 5s infinite;
          opacity: 1;  /* Ensure full opacity */
          text-shadow: 0 0 5px rgba(0, 255, 0, 0.7);  /* Enhanced text glow */
        }
        
        .glitch-hover:hover {
          animation: glitch 0.3s infinite;
          text-shadow: 0 0 8px #4ade80;
        }
        
        @keyframes glitch {
          0% {
            text-shadow:
              0 0 5px #4ade80,
              0 0 10px #4ade80;
          }
          25% {
            text-shadow:
              1px 0 5px #22d3ee,
              -1px 0 5px #4ade80;
          }
          50% {
            text-shadow:
              -1px 0 3px #22d3ee,
              1px 0 3px #4ade80;
          }
          75% {
            text-shadow:
              0 0 5px #22d3ee,
              0 0 10px #4ade80;
          }
          100% {
            text-shadow:
              0 0 5px #4ade80,
              0 0 10px #4ade80;
          }
        }
        
        @keyframes glitch-subtle {
          0%, 100% { opacity: 1; }
          92%, 94%, 96% { opacity: 0.9; }
          93%, 95%, 97% { opacity: 1; text-shadow: 0 0 5px #4ade80; }
        }
        
        .bg-scanline {
          background: repeating-linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 255, 0, 0.05) 0.5px, /* Minimal visibility for better readability */
            transparent 1px
          );
        }
        
        .animate-blink {
          animation: blink 1s step-start 0s infinite;
        }
        
        @keyframes blink {
          50% { opacity: 0; }
        }
        
        .blink {
          animation: cursor-blink 1s step-end infinite;
        }
        
        @keyframes cursor-blink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
        
        /* Better visibility for all inputs and borders */
        input, textarea, select, button {
          border-width: 4px !important; /* Thicker borders */
          color: #4ade80 !important; /* Brighter text */
          font-size: 1.1rem; /* Slightly larger font size */
        }
        
        /* Ensure all text is clearly visible */
        .text-green-300, .text-green-400, .text-cyan-300, .text-cyan-400 {
          text-shadow: 0 0 4px currentColor; /* Enhanced text shadow */
          letter-spacing: 0.5px; /* Improved letter spacing */
        }
        
        /* Larger font size for better readability */
        .text-xs {
          font-size: 0.875rem !important;
        }
        
        .text-sm {
          font-size: 1rem !important;
        }
        
        .text-base {
          font-size: 1.125rem !important;
        }
        
        /* High contrast text colors */
        .text-green-300 {
          color: #86efac !important; /* Brighter green */
        }
        
        .text-cyan-300 {
          color: #67e8f9 !important; /* Brighter cyan */
        }
        
        /* Thicker outlines and borders for all UI elements */
        .border-green-500 {
          border-color: #22c55e !important; /* Brighter border color */
        }
      `}</style>
    </div>
  );
}