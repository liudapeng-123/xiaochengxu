'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type UseXfyunAsrOptions = {
  onFinalResult?: (text: string) => void;
};

type XfyunUrlResponse = {
  appId?: string;
  url?: string;
  error?: string;
};

type XfyunMessage = {
  code?: number;
  message?: string;
  data?: {
    status?: number;
    result?: {
      ws?: Array<{
        cw?: Array<{ w?: string }>;
      }>;
    };
  };
};

const TARGET_SAMPLE_RATE = 16000;

type WindowWithWebkitAudioContext = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export function useXfyunAsr({ onFinalResult }: UseXfyunAsrOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const appIdRef = useRef('');
  const finalTextRef = useRef('');
  const hasSentFirstFrameRef = useRef(false);
  const finalizedRef = useRef(false);
  const socketReadyRef = useRef(false);

  const cleanupAudio = useCallback(() => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    void audioContextRef.current?.close();

    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
  }, []);

  const finalize = useCallback(() => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    setIsListening(false);
    cleanupAudio();

    const finalText = finalTextRef.current.trim();
    if (finalText) {
      onFinalResult?.(finalText);
    }
  }, [cleanupAudio, onFinalResult]);

  const sendAudioFrame = useCallback((audio: string, status: 0 | 1 | 2) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const frame = status === 0
      ? {
          common: { app_id: appIdRef.current },
          business: {
            language: 'zh_cn',
            domain: 'iat',
            accent: 'mandarin',
            vad_eos: 3000,
            dwa: 'wpgs',
          },
          data: {
            status,
            format: 'audio/L16;rate=16000',
            encoding: 'raw',
            audio,
          },
        }
      : {
          data: {
            status,
            format: 'audio/L16;rate=16000',
            encoding: 'raw',
            audio,
          },
        };

    socket.send(JSON.stringify(frame));
  }, []);

  const stop = useCallback(() => {
    if (!isListening && !socketRef.current) return;

    cleanupAudio();
    sendAudioFrame('', 2);

    window.setTimeout(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      finalize();
    }, 600);
  }, [cleanupAudio, finalize, isListening, sendAudioFrame]);

  const start = useCallback(async () => {
    setError('');
    setTranscript('');
    finalTextRef.current = '';
    hasSentFirstFrameRef.current = false;
    finalizedRef.current = false;
    socketReadyRef.current = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('当前浏览器不支持录音，请使用支持麦克风权限的浏览器');
      return;
    }

    try {
      const response = await fetch('/api/asr/xfyun-url');
      const data = await response.json() as XfyunUrlResponse;

      if (!response.ok || !data.url || !data.appId) {
        throw new Error(data.error || '获取讯飞鉴权地址失败');
      }

      appIdRef.current = data.appId;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('当前浏览器不支持音频采集');
      }

      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const socket = new WebSocket(data.url);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      sourceRef.current = source;
      processorRef.current = processor;
      socketRef.current = socket;

      socket.onopen = () => {
        socketReadyRef.current = true;
        source.connect(processor);
        processor.connect(audioContext.destination);
        setIsListening(true);
      };

      socket.onerror = () => {
        setError('讯飞语音识别连接失败');
        finalize();
      };

      socket.onclose = () => {
        finalize();
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data as string) as XfyunMessage;

        if (message.code && message.code !== 0) {
          setError(`讯飞语音识别错误: ${message.message || message.code} (${message.code})`);
          socket.close();
          return;
        }

        const text = parseXfyunText(message);
        if (text) {
          finalTextRef.current += text;
          setTranscript(finalTextRef.current);
        }

        if (message.data?.status === 2) {
          socket.close();
        }
      };

      processor.onaudioprocess = (event) => {
        if (!socketReadyRef.current) return;

        const pcm = convertFloat32ToPcm16(event.inputBuffer.getChannelData(0), audioContext.sampleRate);
        if (!pcm.byteLength) return;

        const status = hasSentFirstFrameRef.current ? 1 : 0;
        sendAudioFrame(arrayBufferToBase64(pcm.buffer as ArrayBuffer), status);
        hasSentFirstFrameRef.current = true;
      };
    } catch (err) {
      cleanupAudio();
      setIsListening(false);
      setError(err instanceof Error ? err.message : '语音识别启动失败');
    }
  }, [cleanupAudio, finalize, sendAudioFrame]);

  useEffect(() => {
    return () => {
      cleanupAudio();
      socketRef.current?.close();
    };
  }, [cleanupAudio]);

  return {
    error,
    isListening,
    start,
    stop,
    transcript,
  };
}

function parseXfyunText(message: XfyunMessage): string {
  return message.data?.result?.ws
    ?.map((item) => item.cw?.[0]?.w || '')
    .join('') || '';
}

function convertFloat32ToPcm16(samples: Float32Array, sourceSampleRate: number): Int16Array {
  const sampleRateRatio = sourceSampleRate / TARGET_SAMPLE_RATE;
  const outputLength = Math.floor(samples.length / sampleRateRatio);
  const output = new Int16Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const sourceIndex = Math.floor(i * sampleRateRatio);
    const sample = Math.max(-1, Math.min(1, samples[sourceIndex]));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return output;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
}