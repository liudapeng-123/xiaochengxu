'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { store } from '@/lib/store';
import { PrintJob, TabType, PrinterDevice, PrinterState } from '@/lib/types';

type ModalType = 'printer' | 'stats' | 'grade' | 'notify' | 'settings' | 'help' | 'wifi' | null;

const grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三'];

const MOCK_DISCOVERED: PrinterDevice[] = [
  {
    id: 'bt-001',
    name: 'AI智能打印机 Pro',
    model: 'AP-2024X',
    firmware: 'v3.2.1',
    connectionType: '蓝牙',
    inkLevel: 85,
    paperRemaining: 200,
    paperSize: 'A4',
  },
  {
    id: 'bt-002',
    name: 'HP LaserJet Mini',
    model: 'LJ-M200',
    firmware: 'v2.1.0',
    connectionType: '蓝牙',
    inkLevel: 60,
    paperRemaining: 150,
    paperSize: 'A4',
  },
  {
    id: 'bt-003',
    name: 'Canon PIXMA TS',
    model: 'TS-3380',
    firmware: 'v1.8.3',
    connectionType: '蓝牙',
    inkLevel: 40,
    paperRemaining: 80,
    paperSize: 'A4',
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab] = useState<TabType>('profile');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedGrade, setSelectedGrade] = useState(() => store.getSelectedGrade());
  const [jobs, setJobs] = useState(() => store.getPrintJobs());
  const [printerState, setPrinterState] = useState<PrinterState>(() => store.getPrinterState());
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<PrinterDevice | null>(null);
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiConnecting, setWifiConnecting] = useState(false);
  const [wifiSuccess, setWifiSuccess] = useState(false);

  useEffect(() => {
    return store.subscribe(() => {
      setSelectedGrade(store.getSelectedGrade());
      setJobs(store.getPrintJobs());
      setPrinterState(store.getPrinterState());
    });
  }, []);

  const completedJobs = jobs.filter(job => job.status === 'completed');
  const monthlyJobs = completedJobs.filter(isThisMonth);
  const monthlyPrints = monthlyJobs.length;
  const totalPrints = completedJobs.length;
  const monthlyPages = monthlyPrints;
  const totalPages = totalPrints;
  const typeStats = [
    { label: '口算题', count: countJobsByType(monthlyJobs, ['math_arithmetic']), color: 'bg-[#84C5F9]' },
    { label: '应用题', count: countJobsByType(monthlyJobs, ['math_word']), color: 'bg-[#C197FA]' },
    { label: '生字表', count: countJobsByType(monthlyJobs, ['chinese_chars']), color: 'bg-[#98E4AD]' },
    { label: '英语单词', count: countJobsByType(monthlyJobs, ['english_words']), color: 'bg-[#F7A38D]' },
    { label: '文档/图片', count: countJobsByType(monthlyJobs, ['document', 'image']), color: 'bg-[#9CA3AF]' },
  ];
  const recentJobs = completedJobs.slice(0, 4);

  const handleTabChange = useCallback((tab: TabType) => {
    if (tab === 'home') router.push('/');
    else if (tab === 'knowledge') router.push('/knowledge');
    else if (tab === 'print') router.push('/print');
  }, [router]);

  const closeModal = () => setActiveModal(null);

  const handleDisconnect = useCallback(() => {
    store.disconnectPrinter();
  }, []);

  const handleReSearch = useCallback(() => {
    store.setPrinterStatus('scanning');
    store.setDiscoveredDevices([]);
    setTimeout(() => {
      store.setDiscoveredDevices(MOCK_DISCOVERED);
      store.setPrinterStatus('disconnected');
    }, 2000);
  }, []);

  const handleWifiConnect = useCallback(() => {
    if (!selectedDevice || !wifiSsid.trim() || !wifiPassword.trim()) return;
    setWifiConnecting(true);
    store.setWifiConfig(wifiSsid, wifiPassword);
    setTimeout(() => {
      store.connectPrinter({
        ...selectedDevice,
        connectionType: 'Wi-Fi',
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 50),
      });
      store.clearWifiConfig();
      setWifiConnecting(false);
      setWifiSuccess(true);
    }, 2500);
  }, [selectedDevice, wifiSsid, wifiPassword]);

  return (
    <div className="safe-bottom min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#E0F0FF] px-4 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#59B0FE]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#59B0FE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">AI智能打印助手</h2>
            <button
              onClick={() => setActiveModal('grade')}
              className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-[#59B0FE]/10 text-primary text-xs active:bg-[#59B0FE]/20 transition-colors"
            >
              {selectedGrade}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Menu */}
      <main className="px-4 mt-4 flex-1 flex flex-col">
        <div className="bg-white/85 rounded-xl border border-border/50 shadow-sm overflow-hidden">
          {/* 打印机管理 */}
          <MenuRow
            icon="🖨️"
            label="打印机管理"
            desc={printerState.device ? `已连接: ${printerState.device.name}` : '未连接打印机'}
            onClick={() => setActiveModal('printer')}
            hasBorder
          />
          {/* 使用统计 */}
          <MenuRow
            icon="📊"
            label="使用统计"
            desc={`本月已打印 ${monthlyPrints} 份`}
            onClick={() => setActiveModal('stats')}
            hasBorder
          />
          {/* 打印提醒 */}
          <MenuRow
            icon="🔔"
            label="打印提醒"
            desc={notifyEnabled ? '已开启' : '已关闭'}
            onClick={() => setActiveModal('notify')}
            hasBorder
          />
          {/* 设置 */}
          <MenuRow
            icon="⚙️"
            label="设置"
            desc="语言、主题、关于"
            onClick={() => setActiveModal('settings')}
            hasBorder
          />
          {/* 帮助与反馈 */}
          <MenuRow
            icon="❓"
            label="帮助与反馈"
            desc="常见问题、使用指南"
            onClick={() => setActiveModal('help')}
          />
        </div>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-auto pb-6">
          AI智能打印助手 v1.0.0
        </p>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={closeModal}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Modal Content */}
          <div
            className="relative w-full max-w-[480px] bg-card rounded-t-2xl animate-slide-up max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Printer Management */}
            {activeModal === 'printer' && (
              <ModalContent title="打印机管理" onClose={closeModal}>
                <div className="space-y-4">
                  {printerState.status === 'connected' && printerState.device ? (
                    <>
                      {/* Connected Status Card */}
                      <div className="bg-[#D1F5E1] rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#98E4AD]/30 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-[#98E4AD]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#3D7A5A]">已连接</p>
                          <p className="text-xs text-[#3D7A5A]/70">{printerState.device.name}</p>
                        </div>
                      </div>

                      {/* Device Info */}
                      <div className="space-y-3">
                        <InfoRow label="设备名称" value={printerState.device.name} />
                        <InfoRow label="设备型号" value={printerState.device.model} />
                        <InfoRow label="固件版本" value={printerState.device.firmware} />
                        <InfoRow label="连接方式" value={printerState.device.connectionType} />
                        {printerState.device.ipAddress && (
                          <InfoRow label="IP 地址" value={printerState.device.ipAddress} />
                        )}
                        <InfoRow label="墨量" value={`${printerState.device.inkLevel >= 60 ? '充足' : printerState.device.inkLevel >= 20 ? '一般' : '不足'} (${printerState.device.inkLevel}%)`} />
                        <InfoRow label="纸张" value={`${printerState.device.paperSize} (剩余约${printerState.device.paperRemaining}张)`} />
                      </div>
                    </>
                  ) : printerState.status === 'scanning' ? (
                    <>
                      {/* Scanning State */}
                      <div className="bg-[#E0F0FF] rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#84C5F9]/30 flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#4A8FD4] animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#4A8FD4]">正在搜索设备...</p>
                          <p className="text-xs text-[#4A8FD4]/70">通过蓝牙扫描附近的打印机</p>
                        </div>
                      </div>

                      {printerState.discoveredDevices.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-medium">发现的设备：</p>
                          {printerState.discoveredDevices.map((device) => (
                            <button
                              key={device.id}
                              onClick={() => {
                                setSelectedDevice(device);
                                setActiveModal('wifi');
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/50 active:bg-muted transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{device.name}</p>
                                <p className="text-xs text-muted-foreground">{device.model} · {device.connectionType}</p>
                              </div>
                              <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Disconnected State */}
                      <div className="bg-[#F0F2F5] rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#9CA3AF]/20 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-[#9CA3AF]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#6B7A90]">未连接</p>
                          <p className="text-xs text-[#6B7A90]/70">
                            {printerState.discoveredDevices.length > 0
                              ? `已发现 ${printerState.discoveredDevices.length} 台设备，请选择连接`
                              : '点击重新搜索查找打印机'}
                          </p>
                        </div>
                      </div>

                      {printerState.discoveredDevices.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-medium">发现的设备：</p>
                          {printerState.discoveredDevices.map((device) => (
                            <button
                              key={device.id}
                              onClick={() => {
                                setSelectedDevice(device);
                                setActiveModal('wifi');
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/50 active:bg-muted transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{device.name}</p>
                                <p className="text-xs text-muted-foreground">{device.model} · {device.connectionType}</p>
                              </div>
                              <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleReSearch}
                      disabled={printerState.status === 'scanning'}
                      className={`
                        flex-1 h-10 rounded-xl border border-border text-sm font-medium transition-all active:scale-[0.98]
                        ${printerState.status === 'scanning'
                          ? 'text-muted-foreground cursor-not-allowed opacity-50'
                          : 'text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      {printerState.status === 'scanning' ? '搜索中...' : '重新搜索'}
                    </button>
                    {printerState.status === 'connected' && (
                      <button
                        onClick={handleDisconnect}
                        className="flex-1 h-10 rounded-xl bg-destructive/10 text-destructive text-sm font-medium active:scale-[0.98] transition-transform"
                      >
                        断开连接
                      </button>
                    )}
                  </div>
                </div>
              </ModalContent>
            )}

            {/* WiFi Configuration Modal */}
            {activeModal === 'wifi' && selectedDevice && (
              <ModalContent title="蓝牙配网" onClose={() => { setActiveModal('printer'); setSelectedDevice(null); setWifiSuccess(false); }}>
                <div className="space-y-4">
                  {/* Selected Device */}
                  <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedDevice.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedDevice.model} · 蓝牙已配对</p>
                    </div>
                  </div>

                  {!wifiSuccess ? (
                    <>
                      <p className="text-xs text-muted-foreground">请输入WiFi信息，将通过蓝牙发送给打印机进行联网配置</p>

                      {/* WiFi SSID Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">WiFi 名称 (SSID)</label>
                        <input
                          type="text"
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          placeholder="请输入WiFi名称"
                          className="w-full h-10 rounded-xl border border-border bg-muted/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      {/* WiFi Password Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">WiFi 密码</label>
                        <input
                          type="password"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="请输入WiFi密码"
                          className="w-full h-10 rounded-xl border border-border bg-muted/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      {/* Connect Button */}
                      <button
                        onClick={handleWifiConnect}
                        disabled={!wifiSsid.trim() || !wifiPassword.trim() || wifiConnecting}
                        className={`
                          w-full h-11 rounded-xl text-sm font-medium transition-all active:scale-[0.98]
                          ${!wifiSsid.trim() || !wifiPassword.trim() || wifiConnecting
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-primary text-white shadow-md shadow-primary/30'
                          }
                        `}
                      >
                        {wifiConnecting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            配网中...
                          </span>
                        ) : (
                          '发送WiFi配置'
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Success State */}
                      <div className="bg-[#D1F5E1] rounded-xl p-6 flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-[#98E4AD]/30 flex items-center justify-center">
                          <svg className="w-7 h-7 text-[#3D7A5A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-[#3D7A5A]">配网成功</p>
                          <p className="text-xs text-[#3D7A5A]/70 mt-1">打印机已连接到 WiFi: {wifiSsid}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveModal('printer');
                          setSelectedDevice(null);
                          setWifiSuccess(false);
                          setWifiSsid('');
                          setWifiPassword('');
                        }}
                        className="w-full h-11 rounded-xl bg-primary text-white text-sm font-medium shadow-md shadow-primary/30 active:scale-[0.98] transition-transform"
                      >
                        完成
                      </button>
                    </>
                  )}
                </div>
              </ModalContent>
            )}

            {/* Statistics */}
            {activeModal === 'stats' && (
              <ModalContent title="使用统计" onClose={closeModal}>
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="本月打印" value={String(monthlyPrints)} unit="份" color="text-primary" />
                    <StatCard label="累计打印" value={String(totalPrints)} unit="份" color="text-[#3D7A5A]" />
                    <StatCard label="本月页数" value={String(monthlyPages)} unit="页" color="text-[#D47A5A]" />
                    <StatCard label="累计页数" value={String(totalPages)} unit="页" color="text-[#8A6FD4]" />
                  </div>

                  {/* Type Breakdown */}
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm font-medium text-foreground mb-3">本月打印类型分布</p>
                    <div className="space-y-2.5">
                      {typeStats.map(stat => (
                        <TypeBar
                          key={stat.label}
                          label={stat.label}
                          count={stat.count}
                          total={monthlyPrints}
                          color={stat.color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm font-medium text-foreground mb-3">最近打印</p>
                    <div className="space-y-2">
                      {recentJobs.length > 0 ? (
                        recentJobs.map(job => (
                          <RecentItem
                            key={job.id}
                            title={job.title}
                            time={formatPrintTime(job.completedAt || job.createdAt)}
                          />
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground py-1.5">暂无打印记录</p>
                      )}
                    </div>
                  </div>
                </div>
              </ModalContent>
            )}

            {/* Grade Selection */}
            {activeModal === 'grade' && (
              <ModalContent title="年级设置" onClose={closeModal}>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">选择当前年级，AI将生成适合该年级的学习内容</p>
                  <div className="grid grid-cols-3 gap-2">
                    {grades.map((grade) => (
                      <button
                        key={grade}
                        onClick={() => {
                          store.setSelectedGrade(grade);
                          closeModal();
                        }}
                        className={`
                          h-10 rounded-xl text-sm font-medium transition-all active:scale-95
                          ${selectedGrade === grade
                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                          }
                        `}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              </ModalContent>
            )}

            {/* Notification Settings */}
            {activeModal === 'notify' && (
              <ModalContent title="打印提醒" onClose={closeModal}>
                <div className="space-y-4">
                  <ToggleRow
                    label="打印完成提醒"
                    desc="打印完成后发送通知"
                    enabled={notifyEnabled}
                    onChange={setNotifyEnabled}
                  />
                  <ToggleRow
                    label="错误提醒"
                    desc="打印出错时发送通知"
                    enabled={true}
                    onChange={() => {}}
                  />
                  <ToggleRow
                    label="缺纸/缺墨提醒"
                    desc="纸张或墨量不足时提醒"
                    enabled={true}
                    onChange={() => {}}
                  />

                  <div className="pt-2 border-t border-border/50">
                    <button
                      onClick={() => {
                        setNotifyEnabled(!notifyEnabled);
                        closeModal();
                      }}
                      className={`
                        w-full h-10 rounded-xl text-sm font-medium transition-all active:scale-[0.98]
                        ${notifyEnabled
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-primary text-white shadow-md shadow-primary/30'
                        }
                      `}
                    >
                      {notifyEnabled ? '关闭所有提醒' : '开启所有提醒'}
                    </button>
                  </div>
                </div>
              </ModalContent>
            )}

            {/* Settings / About */}
            {activeModal === 'settings' && (
              <ModalContent title="设置" onClose={closeModal}>
                <div className="space-y-4">
                  {/* Language */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">语言</p>
                      <p className="text-xs text-muted-foreground">应用界面语言</p>
                    </div>
                    <span className="text-sm text-primary font-medium">简体中文</span>
                  </div>

                  {/* Theme */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">主题</p>
                      <p className="text-xs text-muted-foreground">界面显示主题</p>
                    </div>
                    <span className="text-sm text-primary font-medium">跟随系统</span>
                  </div>

                  {/* Font Size */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">字体大小</p>
                      <p className="text-xs text-muted-foreground">调整界面字体大小</p>
                    </div>
                    <span className="text-sm text-primary font-medium">标准</span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border/50" />

                  {/* About */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">关于</p>
                    <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                      <InfoRow label="应用名称" value="AI智能打印助手" />
                      <InfoRow label="版本号" value="v1.0.0" />
                      <InfoRow label="适配设备" value="AI智能打印机 Pro" />
                    </div>
                  </div>

                  {/* Clear Cache */}
                  <button className="w-full h-10 rounded-xl border border-border text-sm font-medium text-foreground active:scale-[0.98] transition-transform">
                    清除缓存
                  </button>
                </div>
              </ModalContent>
            )}

            {/* 帮助与反馈 */}
            {activeModal === 'help' && (
              <ModalContent title="帮助与反馈" onClose={closeModal}>
                <div className="space-y-4">
                  {/* 常见问题 */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">常见问题</p>
                    <div className="space-y-3">
                      <FaqItem
                        question="语音识别不准确怎么办？"
                        answer="请确保在安静环境下使用，说话时语速适中、吐字清晰。如果仍然识别不准，可以尝试手动输入内容。"
                      />
                      <FaqItem
                        question="生成的内容可以修改吗？"
                        answer="可以。生成内容后会自动跳转到预览页面，您可以直接点击内容进行编辑修改，确认无误后再发送打印。"
                      />
                      <FaqItem
                        question="打印机连接失败如何处理？"
                        answer="1. 确认打印机已开机且处于可发现状态\n2. 检查手机与打印机是否在同一网络\n3. 尝试在打印机管理中重新搜索设备\n4. 重启打印机后重试"
                      />
                      <FaqItem
                        question="支持哪些文档格式？"
                        answer="目前支持 TXT、PDF、DOCX 格式的文件直接上传打印。图片和拍照也支持直接打印。"
                      />
                      <FaqItem
                        question="打印任务卡住了怎么办？"
                        answer="可以在打印记录页面查看任务状态，尝试取消后重新发送。如果问题持续，请重启打印机和应用。"
                      />
                    </div>
                  </div>

                  {/* 分隔线 */}
                  <div className="border-t border-border/50" />

                  {/* 使用技巧 */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">使用技巧</p>
                    <div className="bg-[#E0F0FF] rounded-xl p-4 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <span className="text-[#59B0FE] mt-0.5">💡</span>
                        <p className="text-xs text-[#4A8FD4] leading-relaxed">语音指令支持自然语言，如"帮我出50道10以内加法题"</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#59B0FE] mt-0.5">💡</span>
                        <p className="text-xs text-[#4A8FD4] leading-relaxed">可以在顶部切换年级，AI会根据年级自动调整内容难度</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#59B0FE] mt-0.5">💡</span>
                        <p className="text-xs text-[#4A8FD4] leading-relaxed">打印记录中可以查看历史任务，支持重新打印</p>
                      </div>
                    </div>
                  </div>

                  {/* 分隔线 */}
                  <div className="border-t border-border/50" />

                  {/* 意见反馈 */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">意见反馈</p>
                    <textarea
                      className="w-full h-24 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="请描述您遇到的问题或建议..."
                    />
                    <button className="w-full h-10 mt-3 rounded-xl bg-primary text-white text-sm font-medium shadow-md shadow-primary/30 active:scale-[0.98] transition-transform">
                      提交反馈
                    </button>
                  </div>
                </div>
              </ModalContent>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Sub Components ---- */

function MenuRow({ icon, label, desc, onClick, hasBorder }: {
  icon: string;
  label: string;
  desc: string;
  onClick: () => void;
  hasBorder?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3.5
        ${hasBorder ? 'border-b border-border/50' : ''}
        hover:bg-muted/50 active:bg-muted transition-colors text-left
      `}
    >
      <span className="text-xl w-8 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
      </div>
      <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

function ModalContent({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4">
      {/* Handle bar */}
      <div className="flex justify-center mb-3">
        <div className="w-10 h-1 rounded-full bg-border" />
      </div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform"
        >
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
      {/* Bottom safe area */}
      <div className="h-4" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground font-medium">{value}</span>
    </div>
  );
}

function StatCard({ label, value, unit, color }: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="bg-muted/50 rounded-xl p-3 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{unit}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function TypeBar({ label, count, total, color }: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#E0F0FF] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{count}份</span>
    </div>
  );
}

function isThisMonth(job: PrintJob): boolean {
  const date = new Date(job.completedAt || job.createdAt);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function countJobsByType(jobs: PrintJob[], types: Array<PrintJob['type']>): number {
  return jobs.filter(job => types.includes(job.type)).length;
}

function formatPrintTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  if (date.toDateString() === now.toDateString()) {
    return `今天 ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${time}`;
  }

  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) + ` ${time}`;
}

function RecentItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-foreground truncate flex-1">{title}</span>
      <span className="text-xs text-muted-foreground ml-2 shrink-0">{time}</span>
    </div>
  );
}

function ToggleRow({ label, desc, enabled, onChange }: {
  label: string;
  desc: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`
          w-11 h-6 rounded-full transition-colors duration-200 relative
          ${enabled ? 'bg-primary' : 'bg-[#D1D5DB]'}
        `}
      >
        <div
          className={`
            absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200
            ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-muted/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-muted transition-colors"
      >
        <span className="text-sm font-medium text-foreground pr-2">{question}</span>
        <svg
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}
