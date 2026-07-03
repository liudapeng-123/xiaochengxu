// A4 纸张尺寸常量（单位：mm）
export const A4_MM = { width: 210, height: 297 };
export const A4_MARGIN_MM = { top: 20, bottom: 15, left: 15, right: 15 };

// A4 纸张像素尺寸（96 DPI）
export const A4_PX = {
  width: Math.round(A4_MM.width * 3.7795),   // ~794px
  height: Math.round(A4_MM.height * 3.7795), // ~1123px
};

// A4 页边距像素值
export const A4_MARGIN_PX = {
  top: Math.round(A4_MARGIN_MM.top * 3.7795),
  bottom: Math.round(A4_MARGIN_MM.bottom * 3.7795),
  left: Math.round(A4_MARGIN_MM.left * 3.7795),
  right: Math.round(A4_MARGIN_MM.right * 3.7795),
};

export interface PageConfig {
  pageSize: 'A4';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export type ContentLayout = 'grid' | 'list' | 'grid-char' | 'lines' | 'text' | 'image';

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
    pageCount?: number;
    pageSize?: 'A4';
    layout?: ContentLayout;
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
