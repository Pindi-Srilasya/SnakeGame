/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Music, 
  Trophy, 
  RefreshCw,
  Gamepad2,
  ChevronRight,
  User
} from 'lucide-react';
import { Point, Track, GameStatus } from './types';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;

const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Cyber Pulse',
    artist: 'AI Gen V1',
    url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibe-130.mp3',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop'
  },
  {
    id: '2',
    title: 'Neon Dreams',
    artist: 'AI Gen V2',
    url: 'https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop'
  },
  {
    id: '3',
    title: 'Midnight Drive',
    artist: 'AI Gen V3',
    url: 'https://assets.mixkit.co/music/preview/mixkit-slow-trail-71.mp3',
    cover: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=400&fit=crop'
  }
];

export default function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('snake-highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake-highscore', score.toString());
    }
  }, [score, highScore]);

  const handleTrackChange = (index: number) => {
    setCurrentTrackIndex(index);
    if (isPlaying) {
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 bg-[#000000] crt-screen crt-flicker selection:bg-neon-magenta selection:text-black">
      {/* Background Static Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://media.giphy.com/media/oEI9uWUicZ6SM/giphy.gif')] mix-blend-overlay" />

      <audio 
        ref={audioRef}
        src={TRACKS[currentTrackIndex].url}
        onEnded={() => handleTrackChange((currentTrackIndex + 1) % TRACKS.length)}
      />

      <div className="z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: System Identity */}
        <div className="lg:col-span-3 space-y-4">
          <div className="brutalist-card p-4 tear-effect">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border-2 border-neon-cyan flex items-center justify-center text-neon-cyan shadow-[0_0_10px_#00fbff]">
                <User size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-neon-cyan truncate leading-none uppercase">ID: GUEST_01</h3>
                <p className="text-[10px] text-neon-magenta uppercase tracking-widest mt-1">Status: DEPLOYED</p>
              </div>
            </div>
            
            <div className="space-y-4 font-digital border-t-2 border-white/10 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-white/40 uppercase">CURR_VAL</span>
                <span className="text-4xl text-neon-cyan">{score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-white/40 uppercase">HI_VAL</span>
                <span className="text-3xl text-neon-magenta">{highScore}</span>
              </div>
            </div>
          </div>

          <div className="brutalist-card p-4 border-neon-magenta shadow-[4px_4px_0_#00fbff]">
            <h4 className="text-[12px] uppercase tracking-widest text-white/60 mb-4 border-b border-white/10 pb-2">
              INPUT_MAP
            </h4>
            <div className="grid grid-cols-1 gap-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-white/40">NAV_VEC:</span>
                <span>DIRS/WASD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">INTERRUPT:</span>
                <span>SPACE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: The Grid */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="relative aspect-square brutalist-card lg:border-4 border-neon-cyan shadow-[8px_8px_0_rgba(255,0,255,0.5)]">
            <SnakeGame 
              status={gameStatus} 
              onStatusChange={setGameStatus} 
              onScoreChange={setScore}
            />
          </div>

          {/* Bottom Music Unit: The Radio Deck */}
          <div className="brutalist-card p-4 flex flex-col sm:flex-row items-center gap-4 border-neon-magenta shadow-[4px_4px_0_#00fbff]">
            <div className="relative group shrink-0 border-2 border-neon-magenta p-1">
              <motion.img 
                key={TRACKS[currentTrackIndex].cover}
                initial={{ filter: 'grayscale(1) contrast(2)' }}
                animate={{ filter: isPlaying ? 'grayscale(0) contrast(1.2)' : 'grayscale(1) contrast(2)' }}
                src={TRACKS[currentTrackIndex].cover} 
                className="w-12 h-12 grayscale invert object-cover"
              />
            </div>

            <div className="flex-grow min-w-0 w-full">
              <div className="flex justify-between items-start mb-1 gap-2">
                <h4 className="text-md font-bold text-neon-cyan truncate uppercase leading-none">{TRACKS[currentTrackIndex].title}</h4>
                <p className="text-[10px] text-neon-magenta/60 shrink-0 font-mono">0x{currentTrackIndex}A</p>
              </div>
              
              <div className="flex items-center gap-4 w-full">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleTrackChange((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length)}
                    className="text-white hover:text-neon-cyan transition-colors"
                  >
                    <SkipBack size={18} fill="currentColor" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="w-10 h-10 bg-neon-cyan text-black flex items-center justify-center hover:bg-neon-magenta hover:text-black transition-all"
                  >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
                  </button>
                  <button 
                    onClick={() => handleTrackChange((currentTrackIndex + 1) % TRACKS.length)}
                    className="text-white hover:text-neon-cyan transition-colors"
                  >
                    <SkipForward size={18} fill="currentColor" />
                  </button>
                </div>
                
                <div className="flex-grow flex items-center gap-2 border-2 border-white/10 px-2 py-1 bg-white/5">
                  <Volume2 size={14} className="text-white/40" />
                  <input 
                    type="range" 
                    min="0" max="1" step="0.01" 
                    value={volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      if (audioRef.current) audioRef.current.volume = v;
                    }}
                    className="flex-grow h-1 bg-white/20 appearance-none cursor-crosshair accent-neon-magenta"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Signal List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="brutalist-card p-4 border-neon-cyan">
            <h4 className="text-[12px] uppercase tracking-widest text-neon-cyan mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-cyan animate-pulse" />
              SIGNAL_STACK
            </h4>
            <div className="space-y-1">
              {TRACKS.map((track, idx) => (
                <button
                  key={track.id}
                  onClick={() => handleTrackChange(idx)}
                  className={`w-full text-left px-3 py-2 transition-all group relative border-2 ${
                    currentTrackIndex === idx 
                      ? 'border-neon-magenta bg-neon-magenta/10 text-neon-magenta' 
                      : 'border-transparent text-white/40 hover:text-white'
                  }`}
                >
                  <div className="text-[14px] font-bold truncate uppercase">
                    {idx}. {track.title}
                  </div>
                  {currentTrackIndex === idx && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5">
                      <div className="w-0.5 h-3 bg-neon-magenta animate-bounce" />
                      <div className="w-0.5 h-3 bg-neon-magenta animate-bounce [animation-delay:0.1s]" />
                      <div className="w-0.5 h-3 bg-neon-magenta animate-bounce [animation-delay:0.2s]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="brutalist-card p-4 text-[10px] space-y-2 opacity-50 bg-neon-cyan/5">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>SYNC_LATENCY:</span>
              <span className="text-neon-lime">MINIMAL</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>FREQ_MOD:</span>
              <span className="text-neon-cyan">ENABLED</span>
            </div>
            <div className="flex justify-between">
              <span>KERNEL_PATH:</span>
              <span className="truncate max-w-[80px]">/AIS/RUNTM/SNK_MSR</span>
            </div>
          </div>

          <div className="flex-grow brutalist-card p-2 border-neon-magenta flex flex-col justify-center items-center overflow-hidden h-[120px]">
            <span className="text-[40px] leading-none glitch-text tracking-tighter opacity-20 select-none">ERROR</span>
            <span className="text-[10px] uppercase font-mono tracking-widest -mt-2">Core Integrity: 99%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SnakeGame({ 
  status, 
  onStatusChange, 
  onScoreChange 
}: { 
  status: GameStatus, 
  onStatusChange: (s: GameStatus) => void,
  onScoreChange: (s: number) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const directionRef = useRef<Point>({ x: 0, y: -1 });

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 0, y: -1 });
    directionRef.current = { x: 0, y: -1 };
    setSpeed(INITIAL_SPEED);
    onScoreChange(0);
    onStatusChange('playing');
  }, [onScoreChange, onStatusChange]);

  const moveSnake = useCallback(() => {
    if (status !== 'playing') return;

    setSnake((prev) => {
      const newHead = {
        x: prev[0].x + direction.x,
        y: prev[0].y + direction.y
      };

      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        onStatusChange('gameover');
        return prev;
      }

      if (prev.some(p => p.x === newHead.x && p.y === newHead.y)) {
        onStatusChange('gameover');
        return prev;
      }

      const newSnake = [newHead, ...prev];

      if (newHead.x === food.x && newHead.y === food.y) {
        onScoreChange(newSnake.length - 1);
        setFood({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        });
        setSpeed(s => Math.max(50, s - SPEED_INCREMENT));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, status, onStatusChange, onScoreChange]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (directionRef.current.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (directionRef.current.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (directionRef.current.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (directionRef.current.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          if (status === 'playing') onStatusChange('paused');
          else if (status === 'paused') onStatusChange('playing');
          else if (status === 'idle' || status === 'gameover') resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [status, onStatusChange, resetGame]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    if (status === 'playing') {
      const interval = setInterval(moveSnake, speed);
      return () => clearInterval(interval);
    }
  }, [status, speed, moveSnake]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      const size = Math.min(container.clientWidth, container.clientHeight);
      canvas.width = size;
      canvas.height = size;
    };
    
    resize();
    const observer = new ResizeObserver(resize);
    if (containerRef.current) observer.observe(containerRef.current);

    const cellSize = canvas.width / GRID_SIZE;

    const render = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Lines (Glitchy)
      ctx.strokeStyle = 'rgba(0, 251, 255, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
      }

      // Draw Food
      ctx.fillStyle = '#ff00ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff00ff';
      ctx.fillRect(food.x * cellSize + 2, food.y * cellSize + 2, cellSize - 4, cellSize - 4);

      // Draw Snake
      snake.forEach((p, i) => {
        const isHead = i === 0;
        ctx.fillStyle = isHead ? '#00fbff' : '#00a3a6';
        ctx.shadowBlur = isHead ? 20 : 0;
        ctx.shadowColor = '#00fbff';
        
        ctx.fillRect(p.x * cellSize + 1, p.y * cellSize + 1, cellSize - 2, cellSize - 2);

        if (isHead) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#000';
          const eyeSize = cellSize / 5;
          ctx.fillRect(p.x * cellSize + cellSize/4, p.y * cellSize + cellSize/4, eyeSize, eyeSize);
          ctx.fillRect(p.x * cellSize + cellSize*2/3, p.y * cellSize + cellSize/4, eyeSize, eyeSize);
        }
      });
      
      requestAnimationFrame(render);
    };

    const animationId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [snake, food]);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-none group">
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      <AnimatePresence>
        {status !== 'playing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="text-center p-8 brutalist-card border-neon-cyan max-w-xs w-full shadow-[8px_8px_0_#ff00ff]">
              {status === 'idle' && (
                <>
                  <ChevronRight size={48} className="text-neon-cyan mx-auto mb-4 animate-pulse" />
                  <h2 className="text-4xl font-bold mb-2 tracking-tighter text-neon-cyan">SNK_GHOST.EXE</h2>
                  <p className="text-sm text-neon-magenta mb-8 uppercase tracking-[0.2em]">INITIATE SEQUENCE</p>
                  <button 
                    onClick={resetGame}
                    className="w-full py-4 bg-neon-cyan text-black font-bold text-xl hover:bg-neon-magenta hover:shadow-[0_0_20px_#ff00ff] transition-all"
                  >
                    RUN_PROCESS
                  </button>
                </>
              )}

              {status === 'paused' && (
                <>
                  <Pause size={48} className="text-white/40 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-8 tracking-tighter uppercase text-neon-cyan">INTERRUPT_</h2>
                  <button 
                    onClick={() => onStatusChange('playing')}
                    className="w-full py-4 bg-white text-black font-bold text-xl hover:bg-neon-cyan transition-all"
                  >
                    RESUME_
                  </button>
                </>
              )}

              {status === 'gameover' && (
                <>
                  <Trophy size={48} className="text-neon-magenta mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2 tracking-tighter uppercase text-neon-magenta">VAL_FAILURE</h2>
                  <p className="text-sm text-white/60 mb-8 uppercase tracking-widest">FINAL_SCORE: {snake.length - 1}</p>
                  <button 
                    onClick={resetGame}
                    className="w-full py-4 bg-neon-magenta text-white font-bold text-xl hover:bg-neon-cyan hover:text-black transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={24} />
                    REBOOT
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Machine Elements */}
      <div className="absolute top-2 left-2 text-[10px] text-neon-cyan/40">SEC: {Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
      <div className="absolute top-2 right-2 text-[10px] text-neon-magenta/40">GRID: 20x20</div>
    </div>
  );
}

