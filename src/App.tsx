import { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Sliders,
  Film,
  BookOpen,
  Terminal as TerminalIcon,
  Skull,
  Eye,
  Settings,
  Flame,
  Volume1,
  Activity,
  AlertOctagon,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SCENES } from "./scenesData";
import { DystopianAudioEngine, speakNarration, stopSpeaking } from "./audioEngine";
import { NoraTerminal } from "./components/NoraTerminal";
import { Scene } from "./types";

export default function App() {
  // Cinematic playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);
  const [isSynthEnabled, setIsSynthEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"theater" | "storyboard" | "terminal" | "production">("theater");

  // Interactive Storyboard explorer state
  const [selectedStoryboardScene, setSelectedStoryboardScene] = useState<Scene>(SCENES[0]);

  // Audio engine persistence ref
  const audioSynthRef = useRef<DystopianAudioEngine | null>(null);
  const lastNarratedSceneRef = useRef<number>(-1);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  // Derive current scene indices in the 60-second span
  const currentSceneIndex = useMemo(() => {
    // 0 to 60. Divide mapping
    if (currentTime >= 60) return 4; // Final frame
    const index = SCENES.findIndex(
      (s) => currentTime >= s.timeStart && currentTime < s.timeEnd
    );
    return index !== -1 ? index : 4;
  }, [currentTime]);

  const currentScene = SCENES[currentSceneIndex];

  // Post-60s credit sequence active
  const isPostCredits = currentTime >= 59.8;

  // Initialize and persist the audio synth engine
  useEffect(() => {
    const engine = new DystopianAudioEngine();
    audioSynthRef.current = engine;
    return () => {
      engine.destroy();
      stopSpeaking();
    };
  }, []);

  // Update synthesis parameters dynamically as time passes
  useEffect(() => {
    if (audioSynthRef.current && isSynthEnabled) {
      audioSynthRef.current.updateScoreForTime(currentTime);
    }
  }, [currentTime, isSynthEnabled]);

  // Handle Play / Pause commands smoothly
  const handlePlayToggle = () => {
    if (!audioSynthRef.current) return;

    if (!isPlaying) {
      // Lazy unlock AudioContext due to browser autoplay protections
      audioSynthRef.current.init();
      audioSynthRef.current.play();
      audioSynthRef.current.setVolume(volume);
      if (audioSynthRef.current.isMuted !== isMuted) {
        audioSynthRef.current.toggleMute();
      }
      setIsPlaying(true);
      lastTimeRef.current = Date.now();
    } else {
      audioSynthRef.current.pause();
      setIsPlaying(false);
      stopSpeaking();
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(prev => !prev);
    if (audioSynthRef.current) {
      audioSynthRef.current.toggleMute();
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioSynthRef.current) {
      audioSynthRef.current.setVolume(newVol);
    }
  };

  const resetExperience = () => {
    setCurrentTime(0);
    lastNarratedSceneRef.current = -1;
    stopSpeaking();
    
    if (audioSynthRef.current) {
      audioSynthRef.current.init();
      audioSynthRef.current.setVolume(volume);
    }

    if (!isPlaying) {
      setIsPlaying(true);
      lastTimeRef.current = Date.now();
      if (audioSynthRef.current) {
        audioSynthRef.current.play();
      }
    }
  };

  // Precise timing loop using high-precision requestAnimationFrame
  useEffect(() => {
    const tick = () => {
      if (isPlaying) {
        const now = Date.now();
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTime((prev) => {
          let next = prev + delta;
          if (next >= 65) {
            // Experience completes completely at 65s (leaves 5s for the silent credits text)
            next = 65;
            setIsPlaying(false);
            stopSpeaking();
            if (audioSynthRef.current) {
              audioSynthRef.current.pause();
            }
          }
          return next;
        });
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Synchronized Voiceover script orchestrator based on current scene indexes
  useEffect(() => {
    if (!isPlaying) return;

    // Trigger voice narration strictly ONCE upon crossing a scene threshold
    if (currentSceneIndex !== lastNarratedSceneRef.current && !isPostCredits) {
      lastNarratedSceneRef.current = currentSceneIndex;
      
      if (isTtsEnabled) {
        // Read text matching the exact requested script
        speakNarration(currentScene.voiceOver);
      }
    }

    // Trigger the final chilling whisper text over black screen
    if (isPostCredits && lastNarratedSceneRef.current !== 99) {
      lastNarratedSceneRef.current = 99;
      if (isTtsEnabled) {
        setTimeout(() => {
          speakNarration("This is NutriCode.");
        }, 1200);
        setTimeout(() => {
          speakNarration("This is what we chose.");
        }, 3800);
      }
    }
  }, [currentSceneIndex, isPlaying, isTtsEnabled, isPostCredits, currentScene]);

  // Play standout vocal line inside Storyboard inspector
  const playStandaloneLines = (scene: Scene) => {
    if (audioSynthRef.current) {
      audioSynthRef.current.init();
    }
    speakNarration(scene.voiceOver);
  };

  const textToSpeechBanner = () => {
    if (!("speechSynthesis" in window)) {
      return (
        <span className="text-[10px] text-red-400 font-bold bg-red-950/20 border border-red-900/50 py-0.5 px-2 rounded">
          Brower Audio Locked
        </span>
      );
    }
    return (
      <span className="text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 py-0.5 px-2 rounded flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Live Speech System Loaded
      </span>
    );
  };

  // Convert timeline seconds into cinematic standard MM:SS format
  const formatCinematicTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate Ken Burns zooming effect styles based on the scene timeline ratios
  const getKenBurnsStyle = (scene: Scene, time: number) => {
    if (!isPlaying) return { transform: "scale(1.02) translate(0px, 0px)" };
    const secondsInScene = time - scene.timeStart;
    const sceneDuration = scene.timeEnd - scene.timeStart;
    const progress = Math.min(Math.max(secondsInScene / sceneDuration, 0), 1);
    
    // Smooth cinematic zoom and panning
    switch (scene.id) {
      case 1:
        return { transform: `scale(${1.01 + progress * 0.08}) translate(${progress * -8}px, ${progress * -4}px)` };
      case 2:
        return { transform: `scale(${1.08 - progress * 0.06}) translate(0px, ${progress * 6}px)` };
      case 3:
        return { transform: `scale(${1.01 + progress * 0.06}) translate(${progress * 6}px, 0px)` };
      case 4:
        return { transform: `scale(${1.07 - progress * 0.05}) translate(${progress * -6}px, ${progress * 4}px)` };
      case 5:
        return { transform: `scale(${1.01 + progress * 0.12}) translate(0px, ${progress * -10}px)` };
      default:
        return { transform: "scale(1)" };
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-neutral-100 antialiased selection:bg-white/15 selection:text-white flex flex-col justify-between relative overflow-hidden">
      
      {/* Cinematic Header App Bar */}
      <header className="border-b border-white/5 bg-black/[0.15] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-black border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)] leading-none text-sm">
              N
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-[0.25em] text-white flex items-center gap-2 uppercase font-sans">
                NutriCode <span className="text-[8px] bg-white/10 text-white/50 py-0.5 px-2 rounded-full font-mono tracking-normal font-bold">PROJECT 2040</span>
              </h1>
              <p className="text-[9px] text-white/30 tracking-widest font-mono uppercase mt-0.5">
                Interactive Multi-Media Concept // Season 1 Promo
              </p>
            </div>
          </div>

          {/* Tab Selection Panel */}
          <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-sans">
            <button
              onClick={() => setActiveTab("theater")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer font-bold tracking-wider uppercase text-[10px] ${
                activeTab === "theater"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/40 hover:text-white/80"
              }`}
              id="tab_nav_theater"
            >
              <Film className="w-3 h-3" />
              <span>THEATER</span>
            </button>
            <button
              onClick={() => setActiveTab("storyboard")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer font-bold tracking-wider uppercase text-[10px] ${
                activeTab === "storyboard"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/40 hover:text-white/80"
              }`}
              id="tab_nav_storyboard"
            >
              <Sliders className="w-3 h-3" />
              <span>STORYBOARD</span>
            </button>
            <button
              onClick={() => setActiveTab("terminal")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer font-bold tracking-wider uppercase text-[10px] ${
                activeTab === "terminal"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/40 hover:text-white/80"
              }`}
              id="tab_nav_terminal"
            >
              <TerminalIcon className="w-3 h-3" />
              <span>CALIBRATOR</span>
            </button>
            <button
              onClick={() => setActiveTab("production")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer font-bold tracking-wider uppercase text-[10px] ${
                activeTab === "production"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/40 hover:text-white/80"
              }`}
              id="tab_nav_production"
            >
              <BookOpen className="w-3 h-3" />
              <span>NOTES</span>
            </button>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            {textToSpeechBanner()}
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex-1 flex flex-col justify-center">
        
        {/* TAB 1: THE DISASTROUS EXPERIENCE THEATER */}
        {activeTab === "theater" && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Cinematic Screen Element */}
            <div className="lg:col-span-8 flex flex-col gap-6" id="digital_theater_studio">
              <div className="relative aspect-[16/9] w-full bg-black rounded-3xl overflow-hidden border border-white/10 shadow-[0_25px_55px_rgba(0,0,0,0.9)] flex flex-col justify-between">
                
                {/* 1. Film Grain and Distortion Glitch Filters overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_10%,rgba(0,0,0,0.9)_100%)] pointer-events-none z-20"></div>
                
                {/* Rolling scan line effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                  <div className="w-full h-[4px] bg-white/5 opacity-50 translate-y-[-100%] absolute animate-scanline"></div>
                </div>

                {/* Simulated sound waves / equalizer inside corner */}
                {isPlaying && (
                  <div className="absolute top-5 left-5 z-30 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 font-mono text-[9px] tracking-widest text-white/80 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping mr-1"></span>
                    SCORE SYNTHESIZER RESOUNDING
                    <div className="flex items-end gap-0.5 h-3 ml-2.5">
                      <div className="w-[2px] bg-white animate-[bounce_0.8s_ease-in-out_infinite_delay-100]"></div>
                      <div className="w-[2px] bg-white/70 animate-[bounce_1.4s_ease-in-out_infinite_delay-300]"></div>
                      <div className="w-[2px] bg-white/45 animate-[bounce_1.1s_ease-in-out_infinite_delay-200]"></div>
                      <div className="w-[2px] bg-white/30 h-1.5"></div>
                    </div>
                  </div>
                )}

                {/* Time Indicator label inside frame */}
                <div className="absolute top-5 right-5 z-30 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 font-mono text-[10px] text-white/80 font-bold backdrop-blur-md">
                  <span className={`${isPlaying ? "text-red-500 animate-pulse" : "text-white/30"}`}>●</span>
                  <span>{isPlaying ? "REC" : "PAUSED"}</span>
                  <span className="text-white/20">|</span>
                  <span>{formatCinematicTime(currentTime)} / 1:00</span>
                </div>

                {/* 2. Panoramic Dynamic Video Frame Viewport */}
                <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center bg-[#010101] overflow-hidden">
                  <AnimatePresence mode="wait">
                    {!isPostCredits ? (
                      <motion.div
                        key={currentScene.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="relative w-full h-full flex items-center justify-center"
                      >
                        {/* Ken Burns Animated Backing Image Still */}
                        <img
                          src={currentScene.imageSrc}
                          alt={currentScene.title}
                          style={getKenBurnsStyle(currentScene, currentTime)}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-200"
                          referrerPolicy="no-referrer"
                        />

                        {/* Interactive Mood Filter grading mapping */}
                        <div
                          className={`absolute inset-0 mix-blend-color pointer-events-none transition-all duration-[1500ms] ${
                            currentScene.id === 1
                              ? "bg-orange-500/10"
                              : currentScene.id === 2
                              ? "bg-neutral-800/20"
                              : currentScene.id === 3
                              ? "bg-blue-500/12"
                              : currentScene.id === 4
                              ? "bg-teal-900/20"
                              : "bg-neutral-900/30"
                          }`}
                        ></div>
                      </motion.div>
                    ) : (
                      // Climax End Screen / Fades completely to black
                      <motion.div
                        key="credits-post"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.8 }}
                        className="absolute inset-0 bg-neutral-950 flex flex-col justify-center items-center p-6 text-center"
                      >
                        <div className="max-w-xl space-y-7 font-mono text-white/95">
                          {currentTime >= 60.5 && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 1.2 }}
                              className="text-lg md:text-2xl font-bold tracking-[0.2em] text-[#f5f5f5]"
                            >
                              This is NutriCode.
                            </motion.p>
                          )}
                          {currentTime >= 63.0 && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 1.4 }}
                              className="text-sm md:text-base font-light tracking-[0.18em] text-white/40"
                            >
                              This is what we chose.
                            </motion.p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Letterbox Mask Bars (Cinematic aspect ratio overlay) */}
                <div className="absolute top-0 inset-x-0 h-[6%] bg-black z-20 pointer-events-none border-b border-white/5"></div>
                <div className="absolute bottom-0 inset-x-0 h-[6%] bg-black z-20 pointer-events-none border-t border-white/5"></div>

                {/* 3. Immersive Subtitles Overlay */}
                <div className="absolute bottom-[10%] inset-x-0 z-30 px-6 text-center select-none pointer-events-none min-h-[4rem] flex justify-center items-end">
                  <AnimatePresence mode="wait">
                    {!isPostCredits && (
                      <motion.div
                        key={currentSceneIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-2xl bg-black/85 backdrop-blur-sm border border-white/10 px-6 py-3.5 rounded-2xl"
                      >
                        <p className="text-xs md:text-sm font-sans font-medium text-white/90 leading-relaxed tracking-wide">
                          "{currentScene.voiceOver}"
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Dynamic Video Playback controls */}
              <div className="glass p-6 rounded-3xl flex flex-col gap-5 border border-white/5">
                
                {/* Timeline Progress seek bar */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/45 uppercase tracking-widest font-bold">
                    <span>Cinematic Progress Timeline</span>
                    <span className="text-white/60">{formatCinematicTime(currentTime)} / 1:00</span>
                  </div>
                  
                  <div className="relative group w-full pt-1.5 pb-1">
                    {/* Tick-marks indicating scene boundaries */}
                    {[12, 24, 36, 48].map((boundary) => (
                      <div
                        key={boundary}
                        style={{ left: `${(boundary / 60) * 100}%` }}
                        className="absolute h-3 w-[1px] bg-white/20 -top-0.5 z-20 group-hover:bg-white/40 transition-colors"
                        title={`Scene Boundary ${boundary}s`}
                      />
                    ))}

                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="0.05"
                      value={currentTime > 60 ? 60 : currentTime}
                      onChange={(e) => {
                        const targetVal = parseFloat(e.target.value);
                        setCurrentTime(targetVal);
                        // Reset vocal index bounds
                        lastNarratedSceneRef.current = -1;
                        if (isPlaying) {
                          stopSpeaking();
                          // trigger clean speak for the specific moment if user drops seek
                          const index = SCENES.findIndex(
                            (s) => targetVal >= s.timeStart && targetVal < s.timeEnd
                          );
                          if (index !== -1 && isTtsEnabled) {
                            speakNarration(SCENES[index].voiceOver);
                            lastNarratedSceneRef.current = index;
                          }
                        }
                      }}
                      className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                      id="cinematic_progress_scroller"
                    />
                  </div>

                  {/* Scene Labels timeline tracks */}
                  <div className="grid grid-cols-5 text-[8px] font-mono text-white/20 pt-1 text-center font-bold tracking-wider uppercase">
                    <span className={currentSceneIndex === 0 ? "text-orange-400 font-extrabold" : ""}>Memory (0-12s)</span>
                    <span className={currentSceneIndex === 1 ? "text-white/80 font-extrabold" : ""}>Desolation (12-24s)</span>
                    <span className={currentSceneIndex === 2 ? "text-blue-400 font-extrabold" : ""}>NORA Lab (24-36s)</span>
                    <span className={currentSceneIndex === 3 ? "text-teal-400 font-extrabold" : ""}>The Erasure (36-48s)</span>
                    <span className={currentSceneIndex === 4 ? "text-purple-400 font-extrabold" : ""}>The Child (48-60s)</span>
                  </div>
                </div>

                {/* Primary Button Bar Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  
                  {/* Left Playback triggers */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePlayToggle}
                      className={`h-11 px-6 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.14em] transition-all cursor-pointer ${
                        isPlaying
                          ? "bg-white text-black hover:bg-neutral-200"
                          : "bg-white/10 border border-white/25 text-white hover:bg-white/20 shadow-2xl"
                      }`}
                      id="play_button"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current animate-pulse" />
                          <span>Pause Screen</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Begin Promo Film</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={resetExperience}
                      className="h-11 px-4.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                      title="Reset Film"
                      id="reset_button"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right Audio togglers and Slider */}
                  <div className="flex items-center gap-3 flex-wrap">
                    
                    {/* TTS voice narration toggle */}
                    <button
                      onClick={() => {
                        const nextState = !isTtsEnabled;
                        setIsTtsEnabled(nextState);
                        if (!nextState) stopSpeaking();
                        else if (isPlaying) {
                          lastNarratedSceneRef.current = -1; // trigger narration speak instantly
                        }
                      }}
                      className={`h-10 px-4 rounded-xl border text-[9px] uppercase font-extrabold tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                        isTtsEnabled
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-white/[0.01] border-white/5 text-white/25"
                      }`}
                      id="tts_toggle_btn"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isTtsEnabled ? 'bg-orange-400 animate-pulse' : 'bg-white/20'}`}></span>
                      Narrator (TTS): {isTtsEnabled ? "ACTIVE" : "MUTED"}
                    </button>

                    {/* Procedural Synth toggle */}
                    <button
                      onClick={() => setIsSynthEnabled(!isSynthEnabled)}
                      className={`h-10 px-4 rounded-xl border text-[9px] uppercase font-extrabold tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                        isSynthEnabled
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-white/[0.01] border-white/5 text-white/25"
                      }`}
                      id="synth_toggle_btn"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSynthEnabled ? 'bg-blue-400 animate-pulse' : 'bg-white/20'}`}></span>
                      synth score: {isSynthEnabled ? "LIVE" : "SILENT"}
                    </button>

                    {/* Volume adjustments */}
                    <div className="flex items-center gap-2 px-1">
                      <button
                        onClick={handleMuteToggle}
                        className="text-white/40 hover:text-white transition-colors cursor-pointer"
                        id="mute_button"
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-orange-400" />
                        ) : volume > 0.6 ? (
                          <Volume2 className="w-4 h-4" />
                        ) : (
                          <Volume1 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-16 md:w-20 accent-white h-1 bg-white/10 rounded-lg cursor-pointer animate-none"
                        id="audio_volume_slider"
                      />
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Sidebar Active Scene Details Context */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Act details card */}
              <div className={`glass ${currentScene.id === 1 ? 'warm-glow' : 'cold-glow'} rounded-2xl p-6 flex flex-col gap-5 border border-white/5 transition-all duration-[1000ms]`}>
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Activity className="w-4 h-4 text-white/50" />
                  <h3 className="text-[10px] uppercase font-black text-white/60 tracking-wider">
                    Creative Metadata Registry
                  </h3>
                </div>

                {isPostCredits ? (
                  <div className="space-y-4 py-8 text-center">
                    <Skull className="w-8 h-8 text-white/30 mx-auto animate-pulse" />
                    <p className="text-xs text-white/50 italic font-sans leading-relaxed">
                      "Every morning she takes her capsule. It keeps her alive. But someone decided what was in it..."
                    </p>
                    <div className="py-3 px-4 bg-orange-500/[0.02] border border-orange-500/20 text-[10px] rounded-xl text-orange-400 text-left font-mono leading-relaxed">
                      <strong>NORA DIETARY CODE COMPLETE:</strong> The transition to capsules was finalized in 2041. Cooking is forever illegal.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs font-mono">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/30 uppercase font-bold tracking-wider">Active Storyboard Part</span>
                      <span className="text-sm font-extrabold text-white uppercase tracking-tight">{currentScene.title}</span>
                    </div>

                    <div className="space-y-3 pt-3.5 border-t border-white/5">
                      <div className="flex justify-between">
                        <span className="text-white/40 font-bold uppercase text-[9px]">Timeline bounds:</span>
                        <span className="text-white/80 font-bold">{currentScene.timeStart}s - {currentScene.timeEnd}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40 font-bold uppercase text-[9px]">Color Grade Profile:</span>
                        <span className="text-orange-400 text-right max-w-[180px] leading-relaxed font-bold">{currentScene.colorGrade}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 bg-white/[0.01] p-3 rounded-xl border border-white/5 leading-relaxed text-white/60 font-sans">
                        <span className="text-[9px] font-bold font-mono text-white/30 uppercase tracking-widest">Visual Direction</span>
                        {currentScene.visualDirection}
                      </div>
                      <div className="flex flex-col gap-1.5 bg-white/[0.01] p-3 rounded-xl border border-white/5 leading-relaxed text-white/60 font-sans">
                        <span className="text-[9px] font-bold font-mono text-white/30 uppercase tracking-widest text-[#93c5fd]">Acoustic Score Mapping</span>
                        <span className="text-blue-200/70 text-xs">{currentScene.audioDescriptor}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Black Mirror Quick Context card */}
              <div className="glass rounded-2xl p-6 flex flex-col gap-4 text-xs font-mono border border-white/5">
                <div className="flex items-center gap-2 text-white font-black text-[10px] tracking-wider uppercase border-b border-white/5 pb-3">
                  <AlertOctagon className="w-4 h-4 text-white/50" />
                  <span>NORA Corp Mandate</span>
                </div>
                <p className="text-white/50 leading-relaxed font-sans text-xs">
                  By 2040, NORA distributes synthetic life-sustenance capsules to over 8 billion individuals globally. This eliminates crop failure dependencies entirely. 
                </p>
                <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-[10px] text-white/40 flex items-center gap-2.5 leading-normal">
                  <Award className="w-5 h-5 text-white/30 flex-shrink-0" />
                  <span>99.98% Satisfaction rating. Compliance metrics strictly enforced.</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: INTERACTIVE STORYBOARD & SCENE ROOM */}
        {activeTab === "storyboard" && (
          <div className="space-y-8">
            <div className="glass col-glow rounded-3xl p-6 md:p-8 border border-white/5">
              <h2 className="text-xl font-bold text-white tracking-tight mb-2">Cinematic Scene Sequence Board</h2>
              <p className="text-xs text-white/50 max-w-2xl leading-relaxed">
                Review the 5 separate visual chapters crafted for this Black Mirror promo. Select a storyboard panel to inspect director color grades, scene requirements, and test standalone vocal delivery.
              </p>
            </div>

            <div className="grid md:grid-cols-12 gap-8">
              {/* Scene Picker Board */}
              <div className="md:col-span-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4" id="storyboard_sequence_cards">
                {SCENES.map((scene) => (
                  <div
                    key={scene.id}
                    onClick={() => setSelectedStoryboardScene(scene)}
                    className={`glass border rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between ${
                      selectedStoryboardScene.id === scene.id
                        ? "border-white shadow-[0_4px_25px_rgba(255,255,255,0.08)] scale-[1.02]"
                        : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={scene.imageSrc}
                        alt={scene.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/80 border border-white/10 font-mono text-[9px] font-bold px-2.5 py-1 rounded-lg text-white/70">
                        {scene.timeStart}s - {scene.timeEnd}s
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h4 className="text-[9px] font-bold font-mono text-white/30 uppercase tracking-widest mb-1">
                          Scene 0{scene.id}
                        </h4>
                        <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                          {scene.title}
                        </h3>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playStandaloneLines(scene);
                        }}
                        className="w-full py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-[10px] font-bold font-mono uppercase tracking-widest transition-colors cursor-pointer shadow-md"
                      >
                        Listen Vocal Segment
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Storyboard Detail Inspector */}
              <div className="md:col-span-4 glass border border-white/5 rounded-2xl p-6 font-mono text-xs space-y-5 shadow-2xl">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Sliders className="w-4 h-4 text-white/50" />
                  <h3 className="text-xs uppercase font-extrabold text-white/60 tracking-wider">
                    Chapter Inspection Pane
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-[9px] uppercase font-bold tracking-wider">PART SEQUENCE:</span>
                    <span className="text-white font-extrabold bg-white/10 py-1 px-3 rounded-lg border border-white/10 font-mono text-[11px]">
                      0{selectedStoryboardScene.id} / 05
                    </span>
                  </div>

                  <div>
                    <span className="text-white/40 text-[9px] uppercase block mb-1 font-bold tracking-wider">Chapter Heading:</span>
                    <span className="text-white text-sm font-extrabold tracking-tight">{selectedStoryboardScene.title}</span>
                  </div>

                  <div className="border-t border-white/5 pt-3.5">
                    <span className="text-white/40 text-[9px] uppercase block mb-1 font-bold tracking-wider">Voice Over Dialogue (TTS):</span>
                    <p className="text-white/80 font-sans italic text-xs leading-relaxed border-l-2 border-white pl-3">
                      "{selectedStoryboardScene.voiceOver}"
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3.5">
                    <span className="text-white/40 text-[9px] uppercase block mb-1 font-bold tracking-wider">Visual Cinematography:</span>
                    <p className="text-white/50 leading-relaxed font-sans text-[11px]">
                      {selectedStoryboardScene.visualDirection}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3.5">
                    <span className="text-white/40 text-[9px] uppercase block mb-1 font-bold tracking-wider">Color Grade Mapping:</span>
                    <span className="text-orange-400 font-bold">{selectedStoryboardScene.colorGrade}</span>
                  </div>

                  <div className="border-t border-white/5 pt-3.5">
                    <span className="text-white/40 text-[9px] uppercase block mb-1 font-bold tracking-wider">Synthesis Sound Design:</span>
                    <p className="text-blue-200/70 leading-relaxed text-[11px]">
                      {selectedStoryboardScene.audioDescriptor}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REGISTER IN CENTRAL CAPSULE CALIBRATOR */}
        {activeTab === "terminal" && (
          <div className="space-y-6">
            <div className="glass cold-glow rounded-3xl p-6 md:p-8 border border-white/5">
              <h2 className="text-xl font-bold text-white tracking-tight mb-2">Personal Capsule Diagnostic Terminal</h2>
              <p className="text-xs text-white/50 max-w-2xl leading-relaxed">
                NORA issues customized dietary capsules based on citizen physical structures. Calibrate your registration parameters to inspect exactly what chemicals are synthesized within your daily morning dose.
              </p>
            </div>
            
            <NoraTerminal />
          </div>
        )}

        {/* TAB 4: DIRECTORS PRODUCTION NOTES */}
        {activeTab === "production" && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="glass cold-glow rounded-3xl p-6 md:p-8 border border-white/5">
              <h2 className="text-xl font-bold text-white tracking-tight mb-2">Director's Production Notes & Creative Strategy</h2>
              <p className="text-xs text-white/50 leading-relaxed max-w-3xl">
                This promotional experience has been meticulously modeled after modern dystopian near-future drama aesthetics. Review our color matching philosophies, acoustic choices, and worldbuilding documentation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pb-2">
              <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-white/5 pb-3 text-white">
                  <Flame className="w-5 h-5 text-white/70" />
                  <h3 className="text-[10px] uppercase font-mono font-black tracking-wider text-white/80">Color philosophy Contrast</h3>
                </div>
                <div className="space-y-3 font-sans text-xs text-white/50 leading-relaxed">
                  <p>
                    <strong className="text-white/80 font-semibold">Warm Amber (0s - 12s)</strong> represents safety, historical richness, and the cozy biological memory of food prep. Color saturation remains peaking, utilizing deep grain textures to give home video nostalgia.
                  </p>
                  <p>
                    <strong className="text-white/80 font-semibold">Steel Cold Blue-Grey (12s - 60s)</strong> maps out global crisis. As physical fields decay, NORA Corp encapsulates world crops, desaturating the world environment to sterile corporate colors, conveying lack of taste, smell, and emotional vitality.
                  </p>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-white/5 pb-3 text-white">
                  <Settings className="w-5 h-5 text-white/70" />
                  <h3 className="text-[10px] uppercase font-mono font-black tracking-wider text-white/80">Audiophile Score Modulation</h3>
                </div>
                <div className="space-y-3 font-sans text-xs text-white/50 leading-relaxed">
                  <p>
                    <strong className="text-white/80 font-semibold">Procedural Drone Synthesis:</strong> Operates low frequencies under 80hz that induce genuine atmospheric tension in headphones.
                  </p>
                  <p>
                    <strong className="text-white/80 font-semibold">Clinical Pulses:</strong> High-frequency chirps represent precision robotic assembly inside NORA labs. These pulses accelerate in pitch as the corporate control model tightens over human history, before going into complete silence to make the child's final whisper deeply unsettling.
                  </p>
                </div>
              </div>
            </div>            {/* General World Timeline */}
            <div className="glass rounded-2xl p-6 font-mono text-xs space-y-4 border border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60 border-b border-white/5 pb-3 flex items-center gap-2">
                <Eye className="text-white/50 w-4 h-4 animate-pulse" />
                Dystopian NORA Registry Historical Timeline
              </h3>

              <div className="space-y-4 font-sans text-xs text-white/50 leading-relaxed">
                <div className="flex gap-4 items-start pb-3.5 border-b border-white/5">
                  <span className="font-mono text-white text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">2034</span>
                  <p>
                    <strong className="text-white font-semibold">The Great Deciduous Crop Rot:</strong> Globally synchronized wheat, rice, and soil collapses render standard crop farming highly unstable. Global food riots ensue.
                  </p>
                </div>
                <div className="flex gap-4 items-start pb-3.5 border-b border-white/5">
                  <span className="font-mono text-white text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">2036</span>
                  <p>
                    <strong className="text-white font-semibold">NORA Core Established:</strong> Nutritional Organic Regulation Alliance proposes the localized "Life-Capsule Directive" guaranteeing optimal physical metabolic health without environmental impact.
                  </p>
                </div>
                <div className="flex gap-4 items-start pb-3.5 border-b border-white/5">
                  <span className="font-mono text-white text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">2038</span>
                  <p>
                    <strong className="text-white font-semibold">Soil Cultivation Outlawed:</strong> To prevent soil contamination, global governments ban private food cultivation under penal acts. Food prep appliances surrendered.
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="font-mono text-white text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">2041</span>
                  <p>
                    <strong className="text-white font-semibold">The Last Sanctuary Closed:</strong> Traditional restaurants closed permanently. 100% of the world population consumes NORA life-capsules. "Nobody asked what was in the capsule."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Aesthetic Footer */}
      <footer className="border-t border-white/5 py-10 bg-black/40 text-center text-[10px] font-mono text-white/20 relative overflow-hidden mt-12 backdrop-blur-sm">
        <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-white"></div>
        <p className="tracking-widest">
          // AUTHORIZED CORPORATE PORTAL APPROVED BY NORA DIRECTIVE 80-B
        </p>
        <p className="mt-1 text-white/30 leading-relaxed font-sans max-w-xl mx-auto">
          "A Black Mirror Sci-Fi Presentation. Produced using customized procedural audio synthesis mechanisms, HTML video stills, and React. 2026."
        </p>
      </footer>

    </div>
  );
}
