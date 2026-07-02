'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VoiceButton from '@/components/VoiceButton';
import QuickActions from '@/components/QuickActions';
import BottomNav from '@/components/BottomNav';
import { store } from '@/lib/store';
import { GeneratedContent, QuickAction, TabType, PrinterState } from '@/lib/types';

type ParsedCommand = {
  type: GeneratedContent['type'];
  metadata: GeneratedContent['metadata'];
};

export default function HomePage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentContent, setRecentContent] = useState<GeneratedContent | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [printerState, setPrinterState] = useState<PrinterState>(() => store.getPrinterState());

  useEffect(() => {
    return store.subscribe(() => {
      setPrinterState(store.getPrinterState());
    });
  }, []);

  const handleVoiceResult = useCallback(async (text: string) => {
    setIsProcessing(true);
    const parsed = parseCommand(text, store.getSelectedGrade());
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: text, parsed }),
      });

      if (!response.ok) throw new Error('生成失败');

      const data = await response.json();
      const content: GeneratedContent = {
        id: Date.now().toString(),
        type: normalizeContentType(data.type, parsed.type),
        title: typeof data.title === 'string' ? data.title : buildFallbackTitle(text, parsed),
        content: typeof data.content === 'string' ? data.content : generateFallbackContent(text, parsed),
        metadata: { ...parsed.metadata, ...(isMetadata(data.metadata) ? data.metadata : {}) },
        createdAt: Date.now(),
        status: 'generated',
      };

      store.addContent(content);
      setRecentContent(content);
      router.push(`/preview?id=${content.id}`);
    } catch {
      // Fallback: create type-aware demo content when the AI service is unavailable.
      const demoContent: GeneratedContent = {
        id: Date.now().toString(),
        type: parsed.type,
        title: buildFallbackTitle(text, parsed),
        content: generateFallbackContent(text, parsed),
        metadata: parsed.metadata,
        createdAt: Date.now(),
        status: 'generated',
      };
      store.addContent(demoContent);
      setRecentContent(demoContent);
      router.push(`/preview?id=${demoContent.id}`);
    } finally {
      setIsProcessing(false);
    }
  }, [router]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    if (action.id === 'manual_text') {
      router.push('/manual');
      return;
    }
    if (action.id === 'image_print') {
      router.push('/manual?type=image');
      return;
    }
    if (action.id === 'doc_print') {
      router.push('/manual?type=document');
      return;
    }
    if (action.command) {
      handleVoiceResult(action.command);
    }
  }, [router, handleVoiceResult]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'knowledge') {
      router.push('/knowledge');
    } else if (tab === 'print') {
      router.push('/print');
    } else if (tab === 'profile') {
      router.push('/profile');
    }
  }, [router]);

  return (
    <div className="safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#E0F0FF]/90 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">AI智能打印</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${printerState.status === 'connected' ? 'bg-[#98E4AD]' : 'bg-[#9CA3AF]'}`} />
            <span className="text-xs text-muted-foreground">
              {printerState.status === 'connected' ? '打印机已连接' : '打印机未连接'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center pt-8 pb-6">
        {/* Voice Section */}
        <section className="w-full flex flex-col items-center mb-8">
          <VoiceButton onResult={handleVoiceResult} isProcessing={isProcessing} />
        </section>

        {/* Recent Content */}
        {recentContent && (
          <section className="w-full px-4 mb-6 animate-fade-in">
            <button
              onClick={() => router.push(`/preview?id=${recentContent.id}`)}
              className="w-full bg-card rounded-xl border border-primary/20 p-4 text-left shadow-sm hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-primary font-medium">最近生成</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{recentContent.title}</p>
                </div>
                <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </section>
        )}

        {/* Quick Actions */}
        <section className="w-full">
          <QuickActions onAction={handleQuickAction} />
        </section>

        {/* Tips */}
        <section className="w-full px-4 mt-6">
          <div className="bg-[#EAF4FF] rounded-xl p-4">
            <p className="text-xs font-medium text-foreground mb-2">试试这样说：</p>
            <div className="space-y-1.5">
              {[
                '生成10以内加减法50道',
                '生成三年级语文生字表',
                '打印五年级英语单词',
              ].map((tip) => (
                <button
                  key={tip}
                  onClick={() => handleVoiceResult(tip)}
                  className="block w-full text-left text-xs text-[#6B7A90] hover:text-primary transition-colors py-1"
                >
                  <span className="text-primary/60 mr-1">"</span>
                  {tip}
                  <span className="text-primary/60 ml-1">"</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

function parseCommand(command: string, defaultGrade: string): ParsedCommand {
  const grade = normalizeGrade(command.match(/初[一二三]|[一二三四五六七八九123456789]年级/)?.[0]);
  const countMatch = command.match(/(\d+)\s*(道|题|个|词|组)/);
  const range = command.match(/\d+\s*以内/)?.[0];
  const count = countMatch ? Number(countMatch[1]) : undefined;
  const targetGrade = grade || defaultGrade;

  if (/英语|单词|听写/i.test(command)) {
    return {
      type: 'english_words',
      metadata: {
        grade: targetGrade,
        subject: '英语',
        count: count || 20,
        range: range || `${targetGrade}常用词汇`,
      },
    };
  }

  if (/生字|字表/.test(command)) {
    return {
      type: 'chinese_chars',
      metadata: {
        grade: targetGrade,
        subject: '语文',
        count: count || 20,
        range: range || `${targetGrade}常用生字`,
      },
    };
  }

  if (/练字|字帖/.test(command)) {
    return {
      type: 'chinese_practice',
      metadata: {
        grade: targetGrade,
        subject: '语文',
        count: count || 20,
        range: range || `${targetGrade}练字内容`,
      },
    };
  }

  if (/应用题|文字题/.test(command)) {
    return {
      type: 'math_word',
      metadata: {
        grade: targetGrade,
        subject: '数学',
        count: count || 10,
        range: range || '课内常见题型',
      },
    };
  }

  const operation = /乘法|乘/.test(command)
    ? '乘法'
    : /除法|除/.test(command)
      ? '除法'
      : /加减|加法|减法|加|减/.test(command)
        ? '加减法'
        : '加减法';

  return {
    type: 'math_arithmetic',
    metadata: {
      grade: targetGrade,
      subject: '数学',
      count: count || 50,
      range: range || '10以内',
      operation,
    },
  };
}

function normalizeGrade(grade: string | undefined): string | undefined {
  if (!grade) return undefined;

  return grade
    .replace('1', '一')
    .replace('2', '二')
    .replace('3', '三')
    .replace('4', '四')
    .replace('5', '五')
    .replace('6', '六')
    .replace('7', '七')
    .replace('8', '八')
    .replace('9', '九');
}

function normalizeContentType(type: unknown, fallback: GeneratedContent['type']): GeneratedContent['type'] {
  const validTypes: GeneratedContent['type'][] = [
    'math_arithmetic',
    'math_word',
    'chinese_chars',
    'chinese_practice',
    'english_words',
    'custom_text',
    'image',
    'document',
  ];
  return typeof type === 'string' && validTypes.includes(type as GeneratedContent['type'])
    ? type as GeneratedContent['type']
    : fallback;
}

function isMetadata(value: unknown): value is GeneratedContent['metadata'] {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function buildFallbackTitle(command: string, parsed: ParsedCommand): string {
  const typeTitles: Record<GeneratedContent['type'], string> = {
    math_arithmetic: '口算练习',
    math_word: '数学应用题',
    chinese_chars: '语文生字表',
    chinese_practice: '练字帖',
    english_words: '英语单词听写',
    custom_text: '自定义文本',
    image: '图片打印',
    document: '文档打印',
  };
  const grade = parsed.metadata.grade ? `${parsed.metadata.grade} ` : '';
  return `${grade}${typeTitles[parsed.type]} - ${command.slice(0, 15)}`;
}

function generateFallbackContent(command: string, parsed: ParsedCommand): string {
  if (parsed.type === 'english_words') {
    return generateEnglishWordsContent(parsed);
  }
  if (parsed.type === 'chinese_chars') {
    return generateChineseCharsContent(parsed);
  }
  if (parsed.type === 'chinese_practice') {
    return generateChinesePracticeContent(parsed);
  }
  if (parsed.type === 'math_word') {
    return generateMathWordContent(parsed);
  }
  return generateArithmeticContent(parsed);
}

function generateArithmeticContent(parsed: ParsedCommand): string {
  const lines: string[] = [];
  const count = parsed.metadata.count || 50;
  const operation = parsed.metadata.operation || '加减法';
  const max = parsed.metadata.range?.match(/(\d+)\s*以内/)?.[1]
    ? Number(parsed.metadata.range.match(/(\d+)\s*以内/)?.[1])
    : 10;
  lines.push('口算练习题');
  lines.push(`（共${count}道）`);
  lines.push('');

  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * Math.max(1, Math.min(max, 10))) + 1;
    const op = pickOperator(operation);
    const num = op === '-' && a < b ? b : a;
    const num2 = op === '-' && a < b ? a : b;
    lines.push(`${String(i + 1).padStart(2, ' ')}. ${num} ${op} ${num2} = ____`);
    if ((i + 1) % 5 === 0) lines.push('');
  }

  return lines.join('\n');
}

function pickOperator(operation: string): string {
  if (operation === '乘法') return 'x';
  if (operation === '除法') return '÷';
  return Math.random() > 0.5 ? '+' : '-';
}

function generateEnglishWordsContent(parsed: ParsedCommand): string {
  const words = [
    ['season', '季节'],
    ['because', '因为'],
    ['usually', '通常'],
    ['exercise', '锻炼'],
    ['morning', '早晨'],
    ['weekend', '周末'],
    ['library', '图书馆'],
    ['subject', '科目'],
    ['science', '科学'],
    ['interesting', '有趣的'],
    ['favorite', '最喜欢的'],
    ['holiday', '假期'],
    ['weather', '天气'],
    ['picture', '图片'],
    ['answer', '回答'],
    ['question', '问题'],
    ['listen', '听'],
    ['speak', '说'],
    ['write', '写'],
    ['remember', '记住'],
  ];
  const count = parsed.metadata.count || 20;
  const lines = [`${parsed.metadata.grade || '五年级'}英语单词听写`, `（共${count}个）`, ''];
  words.slice(0, count).forEach(([word, meaning], index) => {
    lines.push(`${index + 1}. ${word}    ${meaning}`);
  });
  return lines.join('\n');
}

function generateChineseCharsContent(parsed: ParsedCommand): string {
  const chars = [
    ['晨', 'chen', '11画', '早晨、清晨'],
    ['读', 'du', '10画', '读书、朗读'],
    ['课', 'ke', '10画', '上课、课文'],
    ['练', 'lian', '8画', '练习、训练'],
    ['题', 'ti', '15画', '题目、问题'],
  ];
  const lines = [`${parsed.metadata.grade || '三年级'}语文生字表`, ''];
  chars.forEach(([char, pinyin, strokes, words], index) => {
    lines.push(`${index + 1}. ${char}  拼音: ${pinyin}  笔画: ${strokes}  组词: ${words}`);
  });
  return lines.join('\n');
}

function generateChinesePracticeContent(parsed: ParsedCommand): string {
  const lines = [`${parsed.metadata.grade || '三年级'}练字帖`, ''];
  ['认真', '坚持', '观察', '思考', '进步'].forEach((word, index) => {
    lines.push(`${index + 1}. ${word}    ____    ____    ____`);
  });
  return lines.join('\n');
}

function generateMathWordContent(parsed: ParsedCommand): string {
  const count = parsed.metadata.count || 10;
  const lines = [`${parsed.metadata.grade || '三年级'}数学应用题`, `（共${count}道）`, ''];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 20) + 10;
    const b = Math.floor(Math.random() * 10) + 1;
    lines.push(`${i + 1}. 小明有${a}本书，借给同学${b}本，还剩多少本？`);
    lines.push('答：________________');
    lines.push('');
  }
  return lines.join('\n');
}
