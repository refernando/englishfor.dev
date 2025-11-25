'use client';
import { useRef } from 'react';

export function useAudio() {
  const audioRef = useRef(null);

  const playSound = (sound) => {
    audioRef.current = new Audio(`/sounds/${sound}.wav`);
    audioRef.current?.play();
  }

  return { playSound };
}
