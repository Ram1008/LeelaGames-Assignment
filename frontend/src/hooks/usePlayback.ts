import { useState, useEffect, useRef } from 'react';
import { MatchRecord } from '../types';

export function usePlayback(currentMatch: MatchRecord | null) {
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Sync initial duration when a new match is loaded
  useEffect(() => {
    if (currentMatch) {
      setCurrentTimeMs(currentMatch.duration_ms || 1000);
      setIsPlaying(false);
    }
  }, [currentMatch]);

  // Animation frame playback loop
  useEffect(() => {
    if (!isPlaying || !currentMatch) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const step = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setCurrentTimeMs((prevTime) => {
        const nextTime = prevTime + delta * playbackSpeed * 0.5;
        if (nextTime >= currentMatch.duration_ms) {
          setIsPlaying(false);
          return currentMatch.duration_ms;
        }
        return nextTime;
      });

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, currentMatch, playbackSpeed]);

  const togglePlay = () => {
    if (!currentMatch) return;
    if (currentTimeMs >= currentMatch.duration_ms) {
      setCurrentTimeMs(0);
    }
    setIsPlaying(!isPlaying);
  };

  const resetPlayback = () => {
    setCurrentTimeMs(0);
    setIsPlaying(false);
  };

  return {
    currentTimeMs,
    setCurrentTimeMs,
    isPlaying,
    togglePlay,
    resetPlayback,
    playbackSpeed,
    setPlaybackSpeed,
  };
}
