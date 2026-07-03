'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useXfyunAsr } from '@/hooks/useXfyunAsr';

interface VoiceButtonProps {
  onResult: (text: string) => void;
  isProcessing?: boolean;
}

export default function VoiceButton({ onResult, isProcessing }: VoiceButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { error, isListening, start, stop, transcript } = useXfyunAsr({ onFinalResult: onResult });

  const handlePointerDown = useCallback(() => {
    setIsPressed(true);
    holdTimerRef.current = setTimeout(() => {
      start();
    }, 200);
  }, [start]);

  const handlePointerUp = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isListening) {
      stop();
    }
    setIsPressed(false);
  }, [isListening, stop]);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  // Simulate voice result for demo when no speech API
  const handleDemoClick = useCallback(() => {
    const demos = [
      '生成10以内加减法50道',
      '生成20道乘法口算题',
      '打印三年级语文生字表',
      '生成五年级英语单词听写',
      '生成三年级应用题10道',
    ];
    const randomDemo = demos[Math.floor(Math.random() * demos.length)];
    onResult(randomDemo);
  }, [onResult]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Voice Button */}
      <div className="relative">
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full bg-amber-400/30 voice-active-ring" />
            <div className="absolute inset-[-8px] rounded-full bg-amber-400/20 voice-active-ring" style={{ animationDelay: '0.3s' }} />
            <div className="absolute inset-[-16px] rounded-full bg-amber-400/10 voice-active-ring" style={{ animationDelay: '0.6s' }} />
          </>
        )}

        {/* Idle pulse rings */}
        {!isListening && !isPressed && (
          <>
            <div className="absolute inset-0 rounded-full bg-amber-400/20 voice-pulse-ring" />
            <div className="absolute inset-[-8px] rounded-full bg-amber-400/10 voice-pulse-ring" style={{ animationDelay: '0.7s' }} />
          </>
        )}

        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={!isListening && !isPressed ? handleDemoClick : undefined}
          className={`
            relative z-10 w-28 h-28 rounded-full
            flex items-center justify-center
            transition-all duration-200 ease-out
            shadow-lg
            ${isListening || isPressed
              ? 'bg-amber-500 scale-110 shadow-amber-300/50'
              : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-300/40 hover:shadow-amber-300/60'
            }
            ${isProcessing ? 'opacity-60' : ''}
            active:scale-95
            select-none touch-none
          `}
          aria-label="按住说话"
        >
          {isListening ? (
            /* Wave animation */
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full wave-bar"
                  style={{ height: '8px' }}
                />
              ))}
            </div>
          ) : (
            /* Mic icon */
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
            </svg>
          )}
        </button>
      </div>

      {/* Status text */}
      <div className="text-center min-h-[48px]">
        {isListening ? (
          <div className="animate-fade-in">
            <p className="text-sm text-amber-600 font-medium">正在聆听...</p>
            {transcript && (
              <p className="text-xs text-muted-foreground mt-1 max-w-[240px] truncate">
                &quot;{transcript}&quot;
              </p>
            )}
          </div>
        ) : isProcessing ? (
          <p className="text-sm text-primary font-medium animate-pulse">AI 正在生成内容...</p>
        ) : error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <div className="animate-fade-in">
            <p className="text-sm text-muted-foreground">按住说话，松开识别</p>
          </div>
        )}
      </div>
    </div>
  );
}
