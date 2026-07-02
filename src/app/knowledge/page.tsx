'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { store } from '@/lib/store';
import { GeneratedContent, TabType } from '@/lib/types';

const typeLabels: Record<GeneratedContent['type'], string> = {
  math_arithmetic: '口算题',
  math_word: '应用题',
  chinese_chars: '生字表',
  chinese_practice: '练字帖',
  english_words: '英语单词',
  custom_text: '自定义文本',
  image: '图片',
  document: '文档',
};

export default function KnowledgePage() {
  const router = useRouter();
  const [activeTab] = useState<TabType>('knowledge');
  const [contents, setContents] = useState(() => store.getContents());

  useEffect(() => {
    return store.subscribe(() => {
      setContents(store.getContents());
    });
  }, []);

  const handleTabChange = (tab: TabType) => {
    if (tab === 'home') router.push('/');
    else if (tab === 'print') router.push('/print');
    else if (tab === 'profile') router.push('/profile');
  };

  const generatedCount = contents.filter(item => item.status === 'generated' || item.status === 'editing').length;
  const printedCount = contents.filter(item => item.status === 'printed').length;
  const assetCount = contents.filter(item => item.type === 'image' || item.type === 'document').length;

  return (
    <div className="safe-bottom">
      <header className="sticky top-0 z-40 bg-[#E0F0FF]/90 backdrop-blur-md border-b border-border/50">
        <div className="px-4 h-12 flex items-center">
          <h1 className="text-base font-semibold text-foreground">知识库</h1>
        </div>
      </header>

      <main className="px-4 pt-4 pb-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatBox value={String(contents.length)} label="全部内容" color="text-primary" bgColor="bg-[#F0E8FF]" />
          <StatBox value={String(printedCount)} label="已打印" color="text-[#3D7A5A]" bgColor="bg-[#D1F5E1]" />
          <StatBox value={String(assetCount)} label="文件资料" color="text-[#D47A5A]" bgColor="bg-[#FDE8E4]" />
        </div>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">内容归档</h2>
            <span className="text-xs text-muted-foreground">待打印 {generatedCount}</span>
          </div>

          {contents.length > 0 ? (
            <div className="space-y-3">
              {contents.map(content => (
                <button
                  key={content.id}
                  type="button"
                  onClick={() => router.push(`/preview?id=${content.id}`)}
                  className="w-full bg-white rounded-xl border border-border/50 p-4 text-left shadow-sm active:scale-[0.99] hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                          {typeLabels[content.type]}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                          {getStatusLabel(content.status)}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-foreground truncate">{content.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatContentMeta(content)}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-muted-foreground shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-[#E0F0FF] rounded-xl border border-border/50 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#E0F0FF] flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#4A8FD4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.25V4.75A2.75 2.75 0 016.75 2h10.5A2.75 2.75 0 0120 4.75v14.5A2.75 2.75 0 0117.25 22H6.75A2.75 2.75 0 014 19.25zM8.75 7.25h6.5M8.75 11.25h6.5M8.75 15.25h3.5" />
                </svg>
              </div>
              <p className="text-sm text-[#4A8FD4]">暂无知识库内容</p>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="mt-4 px-4 py-2 rounded-lg bg-[#59B0FE] text-white text-sm font-medium"
              >
                去生成内容
              </button>
            </div>
          )}
        </section>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

function StatBox({ value, label, color, bgColor }: { value: string; label: string; color: string; bgColor?: string }) {
  return (
    <div className={`${bgColor || 'bg-card'} rounded-xl border border-border/50 p-3 text-center shadow-sm`}>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function getStatusLabel(status: GeneratedContent['status']): string {
  const labels: Record<GeneratedContent['status'], string> = {
    generated: '待打印',
    editing: '编辑中',
    sent: '已发送',
    printing: '打印中',
    printed: '已打印',
  };
  return labels[status];
}

function formatContentMeta(content: GeneratedContent): string {
  const parts = [new Date(content.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })];
  if (content.metadata.grade) parts.push(content.metadata.grade);
  if (content.metadata.count) parts.push(`${content.metadata.count}个项目`);
  if (content.metadata.size) parts.push(`${(content.metadata.size / 1024).toFixed(1)} KB`);
  return parts.join(' · ');
}