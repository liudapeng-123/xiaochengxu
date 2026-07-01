'use client';

import { Suspense, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { store } from '@/lib/store';
import { GeneratedContent } from '@/lib/types';

export default function ManualPage() {
  return (
    <Suspense fallback={<ManualPageFallback />}>
      <ManualPageContent />
    </Suspense>
  );
}

function ManualPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'text';

  const [mode, setMode] = useState<'text' | 'image' | 'document'>(
    initialType === 'image' ? 'image' : initialType === 'document' ? 'document' : 'text'
  );
  const [textInput, setTextInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = useCallback(() => {
    if (!textInput.trim()) return;

    const content: GeneratedContent = {
      id: Date.now().toString(),
      type: 'custom_text',
      title: `自定义文本 - ${textInput.slice(0, 20)}...`,
      content: textInput,
      metadata: {},
      createdAt: Date.now(),
      status: 'generated',
    };

    store.addContent(content);
    router.push(`/preview?id=${content.id}`);
  }, [textInput, router]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    if (mode === 'image' && !file.type.startsWith('image/')) {
      setIsUploading(false);
      return;
    }

    if (mode === 'image' && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      const generated: GeneratedContent = {
        id: Date.now().toString(),
        type: 'image',
        title: file.name,
        content: '',
        metadata: {
          size: file.size,
          previewUrl,
          mimeType: file.type,
          fileName: file.name,
        },
        createdAt: Date.now(),
        status: 'generated',
      };

      store.addContent(generated);
      setIsUploading(false);
      router.push(`/preview?id=${generated.id}`);
      return;
    }

    const readFileContent = async () => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      try {
        // Plain text files - read directly
        if (ext === 'txt' || ext === 'csv' || ext === 'md') {
          const text = await file.text();
          return text;
        }

        // PDF files - extract text with pdfjs-dist
        if (ext === 'pdf') {
          const pdfjs = await import('pdfjs-dist');
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          const texts: string[] = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
              .map((item) => ('str' in item ? item.str : ''))
              .join(' ');
            texts.push(`--- 第 ${i} 页 ---\n${pageText}`);
          }
          return texts.join('\n\n');
        }

        // DOCX files - extract text with mammoth
        if (ext === 'docx') {
          const mammoth = await import('mammoth');
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          return result.value;
        }

        // Unsupported formats - show file info
        return `[文件: ${file.name}]\n[类型: ${file.type || ext}]\n[大小: ${(file.size / 1024).toFixed(1)} KB]\n\n该格式暂不支持内容提取，请直接发送打印。`;
      } catch (err) {
        console.error('File read error:', err);
        return `[文件: ${file.name}]\n读取文件内容失败，请重试。`;
      }
    };

    readFileContent().then((content) => {
      const generated: GeneratedContent = {
        id: Date.now().toString(),
        type: mode === 'image' ? 'image' : 'document',
        title: file.name,
        content,
        metadata: { size: file.size },
        createdAt: Date.now(),
        status: 'generated',
      };

      store.addContent(generated);
      setIsUploading(false);
      router.push(`/preview?id=${generated.id}`);
    });
  }, [mode, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/50">
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
          <h1 className="text-sm font-medium text-foreground">手动输入</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Mode Tabs */}
      <div className="px-4 pt-4">
        <div className="flex bg-muted rounded-xl p-1">
          {(['text', 'image', 'document'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`
                flex-1 py-2 rounded-lg text-sm font-medium transition-all
                ${mode === m
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
                }
              `}
            >
              {m === 'text' ? '文本' : m === 'image' ? '图片' : '文档'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pt-4 pb-8">
        {mode === 'text' && (
          <div className="animate-fade-in">
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="输入要打印的文本内容...&#10;&#10;支持任意文字、笔记、公式等"
                className="w-full min-h-[250px] p-4 text-sm text-foreground leading-relaxed resize-none focus:outline-none bg-transparent"
              />
            </div>
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className={`
                w-full mt-4 h-12 rounded-xl text-sm font-medium text-white transition-all
                ${textInput.trim()
                  ? 'bg-primary shadow-lg shadow-primary/30 active:scale-[0.98]'
                  : 'bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              预览并打印
            </button>
          </div>
        )}

        {mode === 'image' && (
          <div className="animate-fade-in">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="bg-card rounded-xl border-2 border-dashed border-border p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground">点击选择图片或拍照</p>
              <p className="text-xs text-muted-foreground mt-1">支持 JPG、PNG 格式</p>
            </div>

            {fileName && (
              <div className="mt-4 bg-card rounded-xl border border-border/50 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <span className="text-lg">🖼️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {isUploading ? '上传中...' : '已就绪'}
                  </p>
                </div>
                {isUploading && (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {mode === 'document' && (
          <div className="animate-fade-in">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="bg-card rounded-xl border-2 border-dashed border-border p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground">点击选择文档</p>
              <p className="text-xs text-muted-foreground mt-1">支持 PDF、Word、Excel 格式</p>
            </div>

            {fileName && (
              <div className="mt-4 bg-card rounded-xl border border-border/50 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <span className="text-lg">📄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {isUploading ? '上传中...' : '已就绪'}
                  </p>
                </div>
                {isUploading && (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ManualPageFallback() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-center px-4 h-12">
          <h1 className="text-sm font-medium text-foreground">手动输入</h1>
        </div>
      </header>
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  );
}
