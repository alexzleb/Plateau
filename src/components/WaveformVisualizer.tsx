import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying,
  barCount = 16,
  className = '',
}) => {
  const barsRef = useRef<HTMLDivElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      barsRef.current.forEach((bar) => {
        if (bar) bar.style.height = '3px';
      });
      return;
    }

    const updateBars = () => {
      const data = audioEngine.getVisualizerData();
      barsRef.current.forEach((bar, index) => {
        if (!bar) return;
        const val = data[index % data.length] || 0;
        // Map 0-255 to 3px - 22px
        const height = Math.max(3, Math.min(22, (val / 255) * 22));
        bar.style.height = `${height}px`;
      });
      animationFrameRef.current = requestAnimationFrame(updateBars);
    };

    animationFrameRef.current = requestAnimationFrame(updateBars);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className={`flex items-end gap-[2px] h-6 px-1 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) barsRef.current[i] = el;
          }}
          className="w-[2.5px] bg-amber-400 rounded-full transition-[height] duration-75"
          style={{ height: '3px' }}
        />
      ))}
    </div>
  );
};
