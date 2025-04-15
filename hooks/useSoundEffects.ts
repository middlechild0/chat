import { useEffect, useRef } from 'react';

const useSoundEffects = () => {
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
};

export default useSoundEffects;
