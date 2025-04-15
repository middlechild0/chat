'use client';

import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import TerminalTyping from '@/components/TerminalTyping';
import LoadingAnimation from '@/components/LoadingAnimation';
import FsocietyLogo from '@/components/FsocietyLogo';
import BootSequence from '@/components/BootSequence';
import LoginScreen from '@/components/LoginScreen';
import TerminalOutput from '@/components/TerminalOutput';
import CommandPanel from '@/components/CommandPanel';
// Removed unused BlinkingCursor import
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useTerminalCommands } from '@/hooks/useTerminalCommands';
import '@/styles/terminal.css';

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
  
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const { playKeystroke, playConnect, playAlert } = useSoundEffects();
  const { handleSpecialCommand } = useTerminalCommands();

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
  }, [bootSequence, playConnect, playKeystroke]);

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
  }, [clientId, playAlert, playKeystroke]);

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

  return (
    <div className="bg-black min-h-screen text-green-300 font-mono p-4 flex flex-col overflow-hidden relative">
      {/* CRT screen overlay effect - even more reduced opacity */}
      <div className="absolute inset-0 pointer-events-none bg-scanline opacity-10 z-10"></div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-green-900/10 z-10"></div>
      
      {/* Content wrapper */}
      <div className="max-w-4xl mx-auto flex flex-col space-y-6 relative z-0 w-full">
        {/* Header with enhanced glitch effect */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-green-300 relative glitch-text">
            {bootSequence ? (
              <LoadingAnimation />
            ) : (
              <TerminalTyping text="FSociety Terminal" speed={80} className="font-bold text-4xl" />
            )}
          </h1>
          
          <div className="flex space-x-4 text-base">
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
          <BootSequence 
            commandHistory={commandHistory} 
            terminalRef={terminalRef} 
          />
        ) : !registered ? (
          <LoginScreen 
            commandHistory={commandHistory}
            clientId={clientId}
            setClientId={setClientId}
            registerClient={registerClient}
            playKeystroke={playKeystroke}
            terminalRef={terminalRef}
          />
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
              <TerminalOutput 
                commandHistory={commandHistory}
                messages={messages}
                terminalRef={terminalRef}
              />
              
              {/* Command panel */}
              <CommandPanel 
                clientId={clientId}
                availableClients={availableClients}
                recipient={recipient}
                setRecipient={setRecipient}
                message={message}
                setMessage={setMessage}
                sendMessage={sendMessage}
                handleSpecialCommand={handleSpecialCommand}
                playKeystroke={playKeystroke}
              />
            </div>

            <div className="mt-2 text-base text-green-300 flex justify-between items-center">
              <div className="glitch-text-subtle font-bold">[Connection secure. Signal encrypted. No surveillance detected.]</div>
              <div className="animate-pulse">
                <span className="mr-2 text-lg">◉</span> LIVE CONNECTION
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}