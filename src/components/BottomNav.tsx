'use client';

import { TabType } from '@/lib/types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: Array<{ id: TabType; label: string; icon: (active: boolean) => React.ReactNode }> = [
  {
    id: 'home',
    label: '首页',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        {active ? (
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
        )}
      </svg>
    ),
  },
  {
    id: 'knowledge',
    label: '知识库',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        {active ? (
          <path d="M4 4.75A2.75 2.75 0 016.75 2h10.5A2.75 2.75 0 0120 4.75v14.5A2.75 2.75 0 0117.25 22H6.75A2.75 2.75 0 014 19.25V4.75zm4.75 2.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 4a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 4a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.25V4.75A2.75 2.75 0 016.75 2h10.5A2.75 2.75 0 0120 4.75v14.5A2.75 2.75 0 0117.25 22H6.75A2.75 2.75 0 014 19.25zM8.75 7.25h6.5M8.75 11.25h6.5M8.75 15.25h3.5" />
        )}
      </svg>
    ),
  },
  {
    id: 'print',
    label: '打印记录',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        {active ? (
          <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        )}
      </svg>
    ),
  },
  {
    id: 'profile',
    label: '我的',
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        {active ? (
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        )}
      </svg>
    ),
  },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="flex items-center justify-around h-[var(--nav-height)]" style={{ paddingBottom: 'var(--safe-bottom)' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center gap-0.5
                flex-1 py-1 rounded-lg
                transition-colors duration-200
                ${isActive ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              {tab.icon(isActive)}
              <span className={`text-[10px] ${isActive ? 'font-medium' : ''}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
