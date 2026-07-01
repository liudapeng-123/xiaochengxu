'use client';

import { PrintJob } from '@/lib/types';

interface PrintStatusCardProps {
  job: PrintJob;
  onClick?: () => void;
}

const statusConfig: Record<PrintJob['status'], { label: string; color: string; bgColor: string; icon: string }> = {
  queued: { label: '排队中', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '⏳' },
  sending: { label: '发送中', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '📤' },
  printing: { label: '打印中', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: '🖨️' },
  completed: { label: '已完成', color: 'text-green-600', bgColor: 'bg-green-100', icon: '✅' },
  failed: { label: '失败', color: 'text-red-600', bgColor: 'bg-red-100', icon: '❌' },
};

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

export default function PrintStatusCard({ job, onClick }: PrintStatusCardProps) {
  const config = statusConfig[job.status];
  const timeStr = new Date(job.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`w-full text-left bg-card rounded-xl border border-border/50 p-4 shadow-sm animate-fade-in transition-all ${
        onClick ? 'cursor-pointer active:scale-[0.99] hover:border-primary/30' : 'cursor-default'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground truncate">{job.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {typeLabels[job.type] || job.type} · {timeStr}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}>
          <span>{config.icon}</span>
          {config.label}
        </span>
      </div>

      {/* Progress bar */}
      {(job.status === 'sending' || job.status === 'printing') && (
        <div className="mt-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">{job.progress}%</p>
        </div>
      )}
    </button>
  );
}
