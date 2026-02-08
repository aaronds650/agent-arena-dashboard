import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiState } from '@shared/schema';

interface Snapshot {
  timestamp: number;
  data: ApiState;
}

interface UsePlaybackResult {
  snapshots: Snapshot[];
  currentIndex: number;
  isPlaying: boolean;
  isLive: boolean;
  playbackSpeed: number;
  currentSnapshot: Snapshot | null;
  addSnapshot: (data: ApiState) => void;
  play: () => void;
  pause: () => void;
  goLive: () => void;
  seek: (index: number) => void;
  stepBack: () => void;
  stepForward: () => void;
  setPlaybackSpeed: (speed: number) => void;
}

const MAX_SNAPSHOTS = 300;

export function usePlayback(initialLive: boolean = true): UsePlaybackResult {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLive, setIsLive] = useState(initialLive);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addSnapshot = useCallback((data: ApiState) => {
    const snapshot: Snapshot = {
      timestamp: Date.now(),
      data,
    };
    
    setSnapshots(prev => {
      const newSnapshots = [...prev, snapshot];
      if (newSnapshots.length > MAX_SNAPSHOTS) {
        return newSnapshots.slice(-MAX_SNAPSHOTS);
      }
      return newSnapshots;
    });
    
    if (isLive) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [isLive]);

  const play = useCallback(() => {
    if (isLive) return;
    setIsPlaying(true);
  }, [isLive]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const goLive = useCallback(() => {
    setIsPlaying(false);
    setIsLive(true);
    setCurrentIndex(snapshots.length > 0 ? snapshots.length - 1 : 0);
  }, [snapshots.length]);

  const seek = useCallback((index: number) => {
    if (isLive) {
      setIsLive(false);
    }
    setCurrentIndex(Math.max(0, Math.min(index, snapshots.length - 1)));
  }, [isLive, snapshots.length]);

  const stepBack = useCallback(() => {
    if (isLive) {
      setIsLive(false);
      setCurrentIndex(Math.max(0, snapshots.length - 2));
    } else {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  }, [isLive, snapshots.length]);

  const stepForward = useCallback(() => {
    if (isLive) return;
    setCurrentIndex(prev => Math.min(snapshots.length - 1, prev + 1));
  }, [isLive, snapshots.length]);

  useEffect(() => {
    if (isPlaying && !isLive) {
      const intervalMs = 1000 / playbackSpeed;
      
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= snapshots.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, isLive, playbackSpeed, snapshots.length]);

  useEffect(() => {
    if (isLive && snapshots.length > 0) {
      setCurrentIndex(snapshots.length - 1);
    }
  }, [isLive, snapshots.length]);

  const currentSnapshot = snapshots[currentIndex] || null;

  return {
    snapshots,
    currentIndex,
    isPlaying,
    isLive,
    playbackSpeed,
    currentSnapshot,
    addSnapshot,
    play,
    pause,
    goLive,
    seek,
    stepBack,
    stepForward,
    setPlaybackSpeed,
  };
}
