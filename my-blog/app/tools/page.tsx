'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ===== 音效生成（纯代码合成）=====
type AlarmType = 'classic' | 'chime' | 'digital' | 'soft'

const ALARM_OPTIONS: { value: AlarmType; label: string }[] = [
  { value: 'classic', label: '经典闹钟' },
  { value: 'chime', label: '空灵和弦' },
  { value: 'digital', label: '电子滴答' },
  { value: 'soft', label: '柔和单音' },
]

function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return ctxRef.current
  }

  const playTick = useCallback(() => {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.05)
  }, [])

  const playAlarmTone = useCallback((type: AlarmType = 'classic') => {
    const ctx = getCtx()
    const dest = ctx.destination

    const playTone = (freq: number, oscType: OscillatorType, timeStart: number, duration: number, vol = 0.3) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(dest)
      osc.type = oscType
      osc.frequency.setValueAtTime(freq, ctx.currentTime + timeStart)
      gain.gain.setValueAtTime(vol, ctx.currentTime + timeStart)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeStart + duration)
      osc.start(ctx.currentTime + timeStart)
      osc.stop(ctx.currentTime + timeStart + duration)
    }

    switch (type) {
      case 'classic': [0, 0.25, 0.5].forEach((t) => playTone(660, 'square', t, 0.2, 0.3)); break
      case 'chime': 
        playTone(523.25, 'sine', 0, 0.6, 0.4); 
        playTone(659.25, 'sine', 0.2, 0.8, 0.4); 
        playTone(783.99, 'sine', 0.4, 1.0, 0.4); break
      case 'digital': [0, 0.1, 0.2, 0.3].forEach((t) => playTone(1000, 'square', t, 0.05, 0.15)); break
      case 'soft': playTone(440, 'triangle', 0, 1.2, 0.5); break
    }
  }, [])

  // 开始循环播放铃声（不点击就不停）
  const startAlarmLoop = useCallback((type: AlarmType) => {
    if (loopRef.current) clearInterval(loopRef.current)
    playAlarmTone(type) // 马上响第一遍
    loopRef.current = setInterval(() => playAlarmTone(type), 2500) // 每 2.5 秒响一次
  }, [playAlarmTone])

  const stopAlarmLoop = useCallback(() => {
    if (loopRef.current) {
      clearInterval(loopRef.current)
      loopRef.current = null
    }
  }, [])

  // 组件卸载时清理
  useEffect(() => stopAlarmLoop, [stopAlarmLoop])

  return { playTick, playAlarmTone, startAlarmLoop, stopAlarmLoop }
}

// ===== 格式化时间 =====
const fmt = (ms: number) => {
  const totalSecs = Math.floor(ms / 1000)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return h > 0 
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const fmtMs = (ms: number) => {
  const totalSecs = Math.floor(ms / 1000)
  return `${String(Math.floor(totalSecs / 60)).padStart(2, '0')}:${String(totalSecs % 60).padStart(2, '0')}.${String(Math.floor((ms % 1000) / 10)).padStart(2, '0')}`
}

// ===== 公共容器 =====
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40 dark:border-gray-700/30 ${className}`}>
    {children}
  </div>
)

// ===== 倒计时组件 =====
function TimerTool({ alarmType }: { alarmType: AlarmType }) {
  const [input, setInput] = useState({ h: 0, m: 25, s: 0 })
  const [remaining, setRemaining] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [isRinging, setIsRinging] = useState(false) // 新增：是否正在响铃
  
  const { playTick, startAlarmLoop, stopAlarmLoop } = useAudio()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalMs = (input.h * 3600 + input.m * 60 + input.s) * 1000

  const start = () => {
    if (remaining === null) {
      if (totalMs <= 0) return
      setRemaining(totalMs)
    }
    setRunning(true)
  }

  const reset = () => {
    setRunning(false)
    setRemaining(null)
    setIsRinging(false)
    stopAlarmLoop()
  }

  const confirmStop = () => {
    setIsRinging(false)
    stopAlarmLoop()
    setRemaining(null) // 停止后直接重置
  }

  useEffect(() => {
    if (running && remaining !== null && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev === null) return null
          if (prev <= 100) {
            setRunning(false)
            setIsRinging(true)
            startAlarmLoop(alarmType) // 时间到，开始无限循环响铃
            return 0
          }
          if (prev % 60000 < 100) playTick()
          return prev - 100
        })
      }, 100)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, remaining, alarmType, startAlarmLoop, playTick])

  const display = remaining !== null ? remaining : totalMs
  const progress = totalMs > 0 ? (display / totalMs) * 100 : 0
  const circumference = 2 * Math.PI * 88

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative flex items-center justify-center w-56 h-56">
        <svg className="absolute" width="224" height="224">
          <circle cx="112" cy="112" r="88" fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-700" strokeWidth="10" />
          <motion.circle
            cx="112" cy="112" r="88" fill="none" stroke="currentColor"
            className={isRinging ? 'text-red-500' : 'text-teal-500'}
            strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress / 100)}
            transform="rotate(-90 112 112)" transition={{ duration: 0.1 }}
          />
        </svg>
        <div className="text-center z-10">
          {isRinging ? (
            <motion.button
              initial={{ scale: 0.9 }} animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 1 }}
              onClick={confirmStop}
              className="w-28 h-28 rounded-full bg-red-500 text-white font-bold text-xl shadow-lg shadow-red-500/50 hover:bg-red-600"
            >
              确认停止
            </motion.button>
          ) : (
            <div className="font-mono text-4xl font-bold tabular-nums text-gray-800 dark:text-white">{fmt(display)}</div>
          )}
        </div>
      </div>

      {remaining === null && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-center">
            {(['h', 'm', 's'] as const).map((key) => (
              <div key={key} className="flex items-end gap-1">
                <input
                  type="number" min={0} max={key === 'h' ? 99 : 59} value={input[key]}
                  onChange={(e) => setInput(prev => ({ ...prev, [key]: Math.max(0, Math.min(key === 'h' ? 99 : 59, +e.target.value)) }))}
                  className="w-14 text-center font-mono text-2xl font-bold bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-1 py-2 outline-none focus:ring-2 focus:ring-teal-400"
                />
                <span className="text-xs text-gray-400 mb-2">{key === 'h' ? '时' : key === 'm' ? '分' : '秒'}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {[5, 10, 25, 45, 60].map((m) => (
              <button
                key={m} onClick={() => setInput({ h: 0, m, s: 0 })}
                className="px-3 py-1 text-xs rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors"
              >
                {m >= 60 ? '1小时' : `${m}分`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-2">
        {!isRinging && (
          <>
            <button onClick={running ? () => setRunning(false) : start} className={`px-8 py-3 text-white font-bold rounded-2xl transition-colors shadow-sm ${running ? 'bg-amber-400 hover:bg-amber-500' : 'bg-teal-500 hover:bg-teal-600'}`}>
              {running ? '暂停' : remaining !== null ? '继续' : '开始'}
            </button>
            <button onClick={reset} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-bold rounded-2xl transition-colors">重置</button>
          </>
        )}
      </div>
    </div>
  )
}

// ===== 秒表组件 =====
function StopwatchTool() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const refs = useRef({ startTime: 0, base: 0, raf: 0 })

  const tick = useCallback(() => {
    setElapsed(refs.current.base + (Date.now() - refs.current.startTime))
    refs.current.raf = requestAnimationFrame(tick)
  }, [])

  const toggle = () => {
    if (running) {
      cancelAnimationFrame(refs.current.raf)
      refs.current.base += Date.now() - refs.current.startTime
    } else {
      refs.current.startTime = Date.now()
      refs.current.raf = requestAnimationFrame(tick)
    }
    setRunning(!running)
  }

  const reset = () => {
    cancelAnimationFrame(refs.current.raf)
    setRunning(false); setElapsed(0); setLaps([]); refs.current.base = 0
  }

  useEffect(() => () => cancelAnimationFrame(refs.current.raf), [])

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <div className="font-mono text-6xl font-bold tabular-nums text-gray-800 dark:text-white tracking-tight">{fmtMs(elapsed)}</div>
        {laps.length > 0 && <div className="text-sm text-teal-500 font-mono mt-1">当前圈 {fmtMs(elapsed - laps[laps.length - 1])}</div>}
      </div>
      <div className="flex gap-3">
        <button onClick={toggle} className={`px-8 py-3 text-white font-bold rounded-2xl shadow-sm ${running ? 'bg-amber-400 hover:bg-amber-500' : 'bg-teal-500 hover:bg-teal-600'}`}>
          {running ? '暂停' : elapsed === 0 ? '开始' : '继续'}
        </button>
        {running && <button onClick={() => setLaps(prev => [...prev, elapsed])} className="px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-2xl">计圈</button>}
        <button onClick={reset} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl">重置</button>
      </div>
      {laps.length > 0 && (
        <div className="w-full max-w-sm max-h-48 overflow-y-auto space-y-2 pr-2">
          {[...laps].reverse().map((total, revI) => {
            const i = laps.length - 1 - revI
            return (
              <div key={i} className="flex justify-between text-sm px-3 py-2 rounded-xl bg-white/40 dark:bg-gray-700/30">
                <span className="text-gray-400">圈 {i + 1}</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">{fmtMs(total - (i > 0 ? laps[i - 1] : 0))}</span>
                <span className="font-mono text-gray-500">{fmtMs(total)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ===== 番茄钟组件 =====
const POMODORO_PHASES = [
  { id: 'focus', label: '专注', color: 'text-red-500' },
  { id: 'short', label: '短休', color: 'text-green-500' },
  { id: 'long', label: '长休', color: 'text-blue-500' },
] as const

function PomodoroTool({ alarmType }: { alarmType: AlarmType }) {
  const [customMins, setCustomMins] = useState({ focus: 25, short: 5, long: 15 })
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [baseMs, setBaseMs] = useState(25 * 60 * 1000)
  const [remaining, setRemaining] = useState(25 * 60 * 1000)
  const [running, setRunning] = useState(false)
  const [isRinging, setIsRinging] = useState(false) // 响铃状态
  
  const [cycles, setCycles] = useState(0)
  const [todayFocusMs, setTodayFocusMs] = useState(0)

  const { startAlarmLoop, stopAlarmLoop } = useAudio()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phase = POMODORO_PHASES[phaseIdx]

  useEffect(() => {
    const stats = localStorage.getItem('pomodoro_stats')
    if (stats) {
      try {
        const { date, ms } = JSON.parse(stats)
        if (date === new Date().toDateString()) setTodayFocusMs(ms)
        else localStorage.removeItem('pomodoro_stats')
      } catch (e) {}
    }
  }, [])

  // 仅倒计时，不处理结算
  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => setRemaining((prev) => Math.max(0, prev - 1000)), 1000)
    } else if (running && remaining === 0) {
      // 时间归零，触发无限响铃状态，等待用户确认
      setRunning(false)
      setIsRinging(true)
      startAlarmLoop(alarmType)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, remaining, alarmType, startAlarmLoop])

  // 用户点击中间按钮进行结算确认
  const handleConfirm = () => {
    stopAlarmLoop()
    setIsRinging(false)

    let nextCycles = cycles
    // 只有完成的是“专注”，才计算总时间
    if (phaseIdx === 0) {
      nextCycles += 1
      setCycles(nextCycles)
      setTodayFocusMs((prev) => {
        const newVal = prev + baseMs
        localStorage.setItem('pomodoro_stats', JSON.stringify({ date: new Date().toDateString(), ms: newVal }))
        return newVal
      })
    }

    // 判断下一阶段
    const nextPhase = phaseIdx === 0 ? ((nextCycles > 0 && nextCycles % 4 === 0) ? 2 : 1) : 0
    const nextMs = customMins[POMODORO_PHASES[nextPhase].id] * 60 * 1000
    
    setPhaseIdx(nextPhase)
    setBaseMs(nextMs)
    setRemaining(nextMs)
  }

  const switchPhase = (idx: number) => {
    setRunning(false); setIsRinging(false); stopAlarmLoop();
    const ms = customMins[POMODORO_PHASES[idx].id] * 60 * 1000
    setPhaseIdx(idx); setBaseMs(ms); setRemaining(ms)
  }

  const reset = () => {
    setRunning(false); setIsRinging(false); stopAlarmLoop();
    setPhaseIdx(0); setBaseMs(customMins.focus * 60 * 1000); setRemaining(customMins.focus * 60 * 1000)
    setCycles(0)
  }

  const progress = (remaining / baseMs) * 100
  const todayH = Math.floor(todayFocusMs / 3600000)
  const todayM = Math.floor((todayFocusMs % 3600000) / 60000)

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex gap-2 p-1 bg-gray-100/60 dark:bg-gray-700/40 rounded-2xl">
        {POMODORO_PHASES.map((p, i) => (
          <button key={i} onClick={() => switchPhase(i)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${phaseIdx === i ? 'bg-white dark:bg-gray-600 shadow-sm ' + p.color : 'text-gray-400 hover:text-gray-600'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center w-56 h-56">
        <svg className="absolute" width="224" height="224">
          <circle cx="112" cy="112" r="88" fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-700" strokeWidth="10" />
          <motion.circle cx="112" cy="112" r="88" fill="none" stroke="currentColor" className={isRinging ? 'text-red-500' : phase.color} strokeWidth="10" strokeLinecap="round" strokeDasharray={Math.PI * 176} strokeDashoffset={(Math.PI * 176) * (1 - progress / 100)} transform="rotate(-90 112 112)" transition={{ duration: 1 }} />
        </svg>
        <div className="text-center z-10">
          {isRinging ? (
            <motion.button
              initial={{ scale: 0.9 }} animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 1 }}
              onClick={handleConfirm}
              className="w-28 h-28 rounded-full bg-red-500 text-white font-bold text-xl shadow-lg shadow-red-500/50 hover:bg-red-600 flex flex-col items-center justify-center"
            >
              <span>确认</span>
              <span className="text-xs font-normal opacity-80 mt-1">进入下阶段</span>
            </motion.button>
          ) : (
            <>
              <div className={`font-mono text-4xl font-bold tabular-nums ${phase.color}`}>{fmt(remaining)}</div>
              <div className="text-xs text-gray-400 mt-1">{phase.label} · 第 {cycles + 1} 个</div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4 text-xs text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-2xl w-full max-w-[280px]">
        {POMODORO_PHASES.map((p) => (
          <div key={p.id} className="flex items-center gap-1">
            <span>{p.label}</span>
            <input type="number" min={1} max={99} value={customMins[p.id]}
              onChange={(e) => {
                const val = Math.max(1, Math.min(99, +e.target.value))
                setCustomMins(prev => ({ ...prev, [p.id]: val }))
                if (phase.id === p.id) { setRunning(false); setBaseMs(val * 60000); setRemaining(val * 60000) }
              }}
              className="w-8 text-center font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md py-0.5 outline-none focus:ring-1 focus:ring-teal-400 text-gray-700 dark:text-gray-300"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {!isRinging && (
          <>
            <button onClick={running ? () => setRunning(false) : () => setRunning(true)} className={`px-8 py-3 text-white font-bold rounded-2xl shadow-sm ${running ? 'bg-amber-400 hover:bg-amber-500' : 'bg-teal-500 hover:bg-teal-600'}`}>
              {running ? '暂停' : '开始'}
            </button>
            <button onClick={reset} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl">重置</button>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 mt-2 h-[60px]">
        {cycles > 0 && <div className="flex gap-1 flex-wrap justify-center">{Array.from({ length: cycles }).map((_, i) => <span key={i} className="text-lg">🍅</span>)}</div>}
        <AnimatePresence>
          {todayFocusMs > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="px-4 py-2 mt-1 bg-teal-50 text-teal-600 rounded-full text-sm font-medium">
              🏆 今日专注：{todayH > 0 ? `${todayH} 小时 ` : ''}{todayM} 分钟
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ===== 主页面：左右双栏布局 =====
const TABS: { id: 'timer' | 'stopwatch' | 'pomodoro'; label: string; icon: string }[] = [
  { id: 'timer', label: '倒计时', icon: '⏳' },
  { id: 'stopwatch', label: '秒表', icon: '⏱' },
  { id: 'pomodoro', label: '番茄钟', icon: '🍅' },
]

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'timer' | 'stopwatch' | 'pomodoro'>('timer')
  const [globalAlarm, setGlobalAlarm] = useState<AlarmType>('chime')
  const { playAlarmTone } = useAudio()

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:pt-36">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-6 items-start">
        
        {/* 左侧：垂直导航区 & 全局设置 */}
        <div className="flex flex-col gap-4 w-full md:w-56 shrink-0">
          <Card className="!p-3 flex flex-col gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 py-4 px-5 rounded-[1.2rem] font-bold text-sm transition-all ${
                  activeTab === tab.id ? 'bg-teal-500 text-white shadow-md scale-[1.02]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </Card>

          {/* 全局铃声设置面板 */}
          {(activeTab === 'timer' || activeTab === 'pomodoro') && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="!p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <label className="font-medium">时间到提醒铃声：</label>
                  <select
                    value={globalAlarm}
                    onChange={(e) => {
                      const val = e.target.value as AlarmType
                      setGlobalAlarm(val)
                      playAlarmTone(val) // 试听
                    }}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                  >
                    {ALARM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* 右侧：功能主体区 */}
        <div className="flex-1 w-full relative">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }}>
              <Card className="min-h-[500px] flex items-center justify-center p-8">
                {activeTab === 'timer' && <TimerTool alarmType={globalAlarm} />}
                {activeTab === 'stopwatch' && <StopwatchTool />}
                {activeTab === 'pomodoro' && <PomodoroTool alarmType={globalAlarm} />}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}