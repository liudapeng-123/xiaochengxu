import { GeneratedContent, PrintJob, TabType, PrinterDevice, PrinterConnectionStatus, PrinterState } from './types';

let _contents: GeneratedContent[] = [];
let _printJobs: PrintJob[] = [];
let _activeTab: TabType = 'home';
let _selectedGrade = '三年级';
let _printerState: PrinterState = {
  status: 'connected',
  device: {
    id: 'printer-001',
    name: 'AI智能打印机 Pro',
    model: 'AP-2024X',
    firmware: 'v3.2.1',
    connectionType: 'Wi-Fi 直连',
    ipAddress: '192.168.1.100',
    inkLevel: 85,
    paperRemaining: 200,
    paperSize: 'A4',
  },
  discoveredDevices: [],
  wifiConfig: null,
};
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

  getPrinterState(): PrinterState {
    return _printerState;
  },

  setPrinterStatus(status: PrinterConnectionStatus) {
    _printerState = { ..._printerState, status };
    notify();
  },

  setPrinterDevice(device: PrinterDevice | null) {
    _printerState = { ..._printerState, device };
    notify();
  },

  setDiscoveredDevices(devices: PrinterDevice[]) {
    _printerState = { ..._printerState, discoveredDevices: devices };
    notify();
  },

  connectPrinter(device: PrinterDevice) {
    _printerState = {
      ..._printerState,
      status: 'connected',
      device,
      discoveredDevices: [],
    };
    notify();
  },

  disconnectPrinter() {
    _printerState = {
      ..._printerState,
      status: 'disconnected',
      device: null,
    };
    notify();
  },

  setWifiConfig(ssid: string, password: string) {
    _printerState = {
      ..._printerState,
      wifiConfig: { ssid, password },
    };
    notify();
  },

  clearWifiConfig() {
    _printerState = {
      ..._printerState,
      wifiConfig: null,
    };
    notify();
  },
};
