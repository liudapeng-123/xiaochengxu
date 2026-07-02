'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { store } from '@/lib/store';
import { GeneratedContent, PrintJob } from '@/lib/types';

export default function PreviewPage() {
  return (
    <Suspense fallback={<PreviewPageFallback />}>
      <PreviewPageContent />
    </Suspense>
  );
}

function PreviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [printStatus, setPrintStatus] = useState<'idle' | 'sending' | 'printing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const printIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id) {
      const found = store.getContent(id);
      if (found) {
        setContent(found);
        setEditedContent(found.content);
      }
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (printIntervalRef.current) {
        clearInterval(printIntervalRef.current);
      }
    };
  }, []);

  const handleSendPrint = useCallback(async () => {
    if (!content) return;
    if (printIntervalRef.current) {
      clearInterval(printIntervalRef.current);
      printIntervalRef.current = null;
    }
    setIsSending(true);
    setPrintStatus('sending');
    setProgress(0);

    // Update content if edited
    store.updateContent(content.id, { content: editedContent, status: 'sent' });

    // Simulate print process
    await new Promise(resolve => setTimeout(resolve, 800));
    setPrintStatus('printing');
    setProgress(30);

    const printJob: PrintJob = {
      id: `pj-${Date.now()}`,
      contentId: content.id,
      title: content.title,
      type: content.type,
      status: 'sending',
      progress: 0,
      createdAt: Date.now(),
    };
    store.addPrintJob(printJob);

    // Simulate progress
    let currentProgress = 30;
    const interval = setInterval(() => {
      currentProgress = Math.min(currentProgress + Math.random() * 20, 100);
      const roundedProgress = Math.round(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        printIntervalRef.current = null;
        setProgress(100);
        setPrintStatus('completed');
        store.updatePrintJob(printJob.id, {
          status: 'completed',
          progress: 100,
          completedAt: Date.now(),
        });
        store.updateContent(content.id, { status: 'printed' });
        setIsSending(false);
        return;
      }

      setProgress(roundedProgress);
      store.updatePrintJob(printJob.id, {
        progress: roundedProgress,
        status: roundedProgress > 80 ? 'printing' : 'sending',
      });
    }, 500);
    printIntervalRef.current = interval;
  }, [content, editedContent]);

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">内容未找到</p>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    math_arithmetic: '口算题',
    math_word: '应用题',
    chinese_chars: '生字表',
    chinese_practice: '练字帖',
    english_words: '英语单词',
    custom_text: '自定义文本',
    image: '图片',
    document: '文档',
  };

  const countUnits: Record<string, string> = {
    math_arithmetic: '道',
    math_word: '道',
    chinese_chars: '个字',
    chinese_practice: '个',
    english_words: '个单词',
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E2E2F9 0%, #F7FBFF 35%, #BCE2FD 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#E0F0FF]/90 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">返回</span>
          </button>
          <h1 className="text-sm font-medium text-foreground">内容预览</h1>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground"
          >
            首页
          </button>
        </div>
      </header>

      {/* Content Info */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
              {typeLabels[content.type] || content.type}
            </span>
            {content.metadata.grade && (
              <span className="px-2 py-0.5 rounded-md bg-[#D1F5E1] text-[#3D7A5A] text-xs">
                {content.metadata.grade}
              </span>
            )}
            {content.metadata.count && (
              <span className="px-2 py-0.5 rounded-md bg-[#F0E8FF] text-[#8A6FD4] text-xs">
                {content.metadata.count}{countUnits[content.type] || '个'}
              </span>
            )}
          </div>
          <h2 className="text-base font-semibold text-foreground">{content.title}</h2>
        </div>
      </div>

      {/* Preview Content */}
      <div className="px-4 pb-4">
        {content.type === 'image' && content.metadata.previewUrl ? (
          <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
              <span className="text-xs text-muted-foreground">图片预览</span>
              {content.metadata.size && (
                <span className="text-xs text-muted-foreground">
                  {(content.metadata.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
            <div className="bg-white p-3">
              <img
                src={content.metadata.previewUrl}
                alt={content.metadata.fileName || content.title}
                className="w-full max-h-[520px] rounded-lg object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
              <span className="text-xs text-muted-foreground">可编辑内容</span>
              <span className="text-xs text-muted-foreground">{editedContent.length} 字</span>
            </div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full min-h-[300px] p-4 text-sm text-foreground leading-relaxed resize-none focus:outline-none bg-transparent font-mono"
              placeholder="编辑内容..."
            />
          </div>
        )}
      </div>

      {/* Print Status */}
      {printStatus !== 'idle' && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {printStatus === 'sending' && '正在发送到打印机...'}
                {printStatus === 'printing' && '正在打印...'}
                {printStatus === 'completed' && '打印完成!'}
              </span>
              {printStatus === 'completed' && (
                <span className="text-lg">✅</span>
              )}
            </div>
            <div className="h-2 bg-[#E0F0FF] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  printStatus === 'completed' ? 'bg-[#98E4AD]' : 'bg-primary'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">{Math.round(progress)}%</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 pb-8">
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex-1 h-12 rounded-xl border border-border bg-card text-sm font-medium text-foreground active:scale-[0.98] transition-transform"
          >
            继续生成
          </button>
          <button
            onClick={handleSendPrint}
            disabled={isSending || printStatus === 'completed'}
            className={`
              flex-[2] h-12 rounded-xl text-sm font-medium text-white
              active:scale-[0.98] transition-all
              ${isSending || printStatus === 'completed'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary shadow-lg shadow-primary/30 hover:bg-primary/90'
              }
            `}
          >
            {isSending ? '发送中...' : printStatus === 'completed' ? '已打印' : '发送打印'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewPageFallback() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E2E2F9 0%, #F7FBFF 35%, #BCE2FD 100%)' }}>
      <header className="sticky top-0 z-40 bg-[#E0F0FF]/90 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-center px-4 h-12">
          <h1 className="text-sm font-medium text-foreground">内容预览</h1>
        </div>
      </header>
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  );
}
