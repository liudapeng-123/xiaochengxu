'use client';

import { QuickAction } from '@/lib/types';

const defaultActions: QuickAction[] = [
  {
    id: 'manual_text',
    icon: '⌨️',
    label: '文本打印',
    command: '',
    bgColor: 'bg-[#E0F0FF]',
    iconColor: 'bg-[#E0F0FF] text-[#4A8FD4]',
  },
  {
    id: 'image_print',
    icon: '🖼️',
    label: '图片打印',
    command: '',
    bgColor: 'bg-[#FDE8E4]',
    iconColor: 'bg-[#FDE8E4] text-[#D47A5A]',
  },
  {
    id: 'doc_print',
    icon: 'doc',
    label: '文档打印',
    command: '',
    bgColor: 'bg-[#F0E8FF]',
    iconColor: 'bg-[#F0E8FF]',
  },
];

interface QuickActionsProps {
  onAction: (action: QuickAction) => void;
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="px-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">快捷功能</h3>
      <div className="grid grid-cols-3 gap-3">
        {defaultActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${action.bgColor} border border-border/50 hover:border-primary/30 active:scale-95 transition-all duration-150 shadow-sm`}
          >
            <span className={`w-10 h-10 rounded-xl ${action.iconColor} flex items-center justify-center text-xl`}>
              {action.icon === 'doc' ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="2" width="16" height="20" rx="2" fill="#4A8FD4" />
                  <path d="M14 2L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2H14Z" fill="#5B9FE6" />
                  <path d="M14 2V8H20" fill="#8BB8F0" />
                  <rect x="8" y="12" width="8" height="1.5" rx="0.75" fill="white" />
                  <rect x="8" y="15" width="6" height="1.5" rx="0.75" fill="white" />
                  <rect x="8" y="18" width="7" height="1.5" rx="0.75" fill="white" />
                </svg>
              ) : (
                action.icon
              )}
            </span>
            <span className="text-xs text-foreground font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
