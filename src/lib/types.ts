export interface GeneratedContent {
  id: string;
  type: 'math_arithmetic' | 'math_word' | 'chinese_chars' | 'chinese_practice' | 'english_words' | 'custom_text' | 'image' | 'document';
  title: string;
  content: string;
  metadata: {
    grade?: string;
    subject?: string;
    count?: number;
    range?: string;
    operation?: string;
    size?: number;
    previewUrl?: string;
    mimeType?: string;
    fileName?: string;
  };
  createdAt: number;
  status: 'generated' | 'editing' | 'sent' | 'printing' | 'printed';
}

export interface PrintJob {
  id: string;
  contentId: string;
  title: string;
  type: GeneratedContent['type'];
  status: 'queued' | 'sending' | 'printing' | 'completed' | 'failed';
  progress: number;
  createdAt: number;
  completedAt?: number;
}

export interface VoiceCommand {
  raw: string;
  parsed: {
    type: GeneratedContent['type'];
    params: Record<string, string | number>;
  } | null;
}

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  command: string;
  color?: string;
  bgColor?: string;
  iconColor?: string;
}

export type TabType = 'home' | 'knowledge' | 'print' | 'profile';

export interface PrinterDevice {
  id: string;
  name: string;
  model: string;
  firmware: string;
  connectionType: 'Wi-Fi 直连' | '蓝牙' | 'Wi-Fi';
  ipAddress?: string;
  inkLevel: number;
  paperRemaining: number;
  paperSize: string;
}

export type PrinterConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'scanning';

export interface PrinterState {
  status: PrinterConnectionStatus;
  device: PrinterDevice | null;
  discoveredDevices: PrinterDevice[];
  wifiConfig: { ssid: string; password: string } | null;
}
