'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import PrintStatusCard from '@/components/PrintStatusCard';
import { store } from '@/lib/store';
import { TabType } from '@/lib/types';

export default function PrintPage() {
  const router = useRouter();
  const [activeTab] = useState<TabType>('print');
  const [jobs, setJobs] = useState(() => store.getPrintJobs());

  useEffect(() => {
    return store.subscribe(() => {
      setJobs(store.getPrintJobs());
    });
  }, []);

  const handleTabChange = (tab: TabType) => {
    if (tab === 'home') router.push('/');
    else if (tab === 'knowledge') router.push('/knowledge');
    else if (tab === 'profile') router.push('/profile');
  };

  const completedJobs = jobs.filter(j => j.status === 'completed');
  const activeJobs = jobs.filter(j => j.status !== 'completed' && j.status !== 'failed');
  const failedJobs = jobs.filter(j => j.status === 'failed');

  return (
    <div className="safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/50">
        <div className="px-4 h-12 flex items-center">
          <h1 className="text-base font-semibold text-foreground">打印记录</h1>
        </div>
      </header>

      <main className="px-4 pt-4 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl border border-border/50 p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-primary">{jobs.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">总打印</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-500">{completedJobs.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">已完成</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-amber-500">{activeJobs.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">进行中</p>
          </div>
        </div>

        {/* Active Jobs */}
        {activeJobs.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">进行中</h3>
            <div className="space-y-3">
              {activeJobs.map(job => (
                <PrintStatusCard
                  key={job.id}
                  job={job}
                  onClick={() => router.push(`/preview?id=${job.contentId}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed Jobs */}
        {completedJobs.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">已完成</h3>
            <div className="space-y-3">
              {completedJobs.map(job => (
                <PrintStatusCard
                  key={job.id}
                  job={job}
                  onClick={() => router.push(`/preview?id=${job.contentId}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Failed Jobs */}
        {failedJobs.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">失败</h3>
            <div className="space-y-3">
              {failedJobs.map(job => (
                <PrintStatusCard
                  key={job.id}
                  job={job}
                  onClick={() => router.push(`/preview?id=${job.contentId}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">暂无打印记录</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium"
            >
              去生成内容
            </button>
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
