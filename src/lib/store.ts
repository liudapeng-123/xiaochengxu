import { GeneratedContent, PrintJob, TabType } from './types';

// Simple in-memory store using module scope
let _contents: GeneratedContent[] = [];
let _printJobs: PrintJob[] = [];
let _activeTab: TabType = 'home';
let _selectedGrade = '三年级';
let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach(fn => fn());
}

export const store = {
  subscribe(listener: () => void) {
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter(fn => fn !== listener);
    };
  },

  getContents(): GeneratedContent[] {
    return _contents;
  },

  addContent(content: GeneratedContent) {
    _contents = [content, ..._contents];
    notify();
  },

  updateContent(id: string, updates: Partial<GeneratedContent>) {
    _contents = _contents.map(c => c.id === id ? { ...c, ...updates } : c);
    notify();
  },

  getContent(id: string): GeneratedContent | undefined {
    return _contents.find(c => c.id === id);
  },

  removeContent(id: string) {
    _contents = _contents.filter(c => c.id !== id);
    notify();
  },

  getPrintJobs(): PrintJob[] {
    return _printJobs;
  },

  addPrintJob(job: PrintJob) {
    _printJobs = [job, ..._printJobs];
    notify();
  },

  updatePrintJob(id: string, updates: Partial<PrintJob>) {
    _printJobs = _printJobs.map(j => j.id === id ? { ...j, ...updates } : j);
    notify();
  },

  getActiveTab(): TabType {
    return _activeTab;
  },

  setActiveTab(tab: TabType) {
    _activeTab = tab;
    notify();
  },

  getSelectedGrade(): string {
    return _selectedGrade;
  },

  setSelectedGrade(grade: string) {
    _selectedGrade = grade;
    notify();
  },
};
