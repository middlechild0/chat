import { useState, useEffect } from 'react';

export default function LoadingAnimation() {
  const frames = ['[    ]', '[=   ]', '[==  ]', '[=== ]', '[====]', '[ ===]', '[  ==]', '[   =]'];
  const [frameIndex, setFrameIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 150);
    return () => clearInterval(interval);
  }, []);
  
  return <span className="font-mono text-green-300 text-lg font-bold">{frames[frameIndex]}</span>;
}