import React, { useState, useEffect } from 'react';

const LoadingAnimation: React.FC = () => {
  const frames = ['[    ]', '[=   ]', '[==  ]', '[=== ]', '[====]', '[ ===]', '[  ==]', '[   =]'];
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return <span className="font-mono text-green-400">{frames[frameIndex]}</span>;
};

export default LoadingAnimation;
