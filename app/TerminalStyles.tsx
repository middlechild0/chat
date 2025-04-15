import React from 'react';

const TerminalStyles: React.FC = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
    
    body {
      font-family: 'VT323', monospace;
      background-color: #000;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
    
    .terminal-bg {
      background-color: rgba(0, 20, 0, 0.15);
      box-shadow: inset 0 0 30px rgba(0, 100, 0, 0.1);
      position: relative;
    }
    
    .terminal-bg::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(rgba(0, 50, 0, 0.05) 50%, transparent 50%);
      background-size: 100% 4px;
      pointer-events: none;
      z-index: 1;
    }
    
    .terminal-line {
      position: relative;
      z-index: 2;
    }
    
    .glitch-text {
      position: relative;
      color: #0f0;
      text-shadow:
        0 0 5px #0f0,
        0 0 10px #0f0,
        0 0 20px #0f0;
      animation: glitch 3s infinite;
    }
    
    .glitch-text-subtle {
      position: relative;
      animation: glitch-subtle 5s infinite;
    }
    
    .glitch-hover:hover {
      animation: glitch 0.3s infinite;
    }
    
    @keyframes glitch {
      0% {
        text-shadow:
          0 0 5px #0f0,
          0 0 10px #0f0;
      }
      25% {
        text-shadow:
          1px 0 5px #0ff,
          -1px 0 5px #0f0;
      }
      50% {
        text-shadow:
          -1px 0 3px #0ff,
          1px 0 3px #0f0;
      }
      75% {
        text-shadow:
          0 0 5px #0ff,
          0 0 10px #0f0;
      }
      100% {
        text-shadow:
          0 0 5px #0f0,
          0 0 10px #0f0;
      }
    }
    
    @keyframes glitch-subtle {
      0%, 100% { opacity: 1; }
      92%, 94%, 96% { opacity: 0.8; }
      93%, 95%, 97% { opacity: 1; text-shadow: 0 0 5px #0f0; }
    }
    
    .bg-scanline {
      background: repeating-linear-gradient(
        to bottom,
        transparent 0%,
        rgba(0, 50, 0, 0.05) 0.5px,
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
  `}</style>
);

export default TerminalStyles;
