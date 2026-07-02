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
    icon: '',
    label: '文档打印',
    command: '',
    bgColor: 'bg-[#F0E8FF]',
    iconColor: 'bg-[#F0E8FF] text-[#8A6FD4]',
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
              {action.icon}
            </span>
            <span className="text-xs text-foreground font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
