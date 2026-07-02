/**
 * Procedural synthesizer for the dystopian score of NutriCode.
 * Uses Web Audio API to create a live atmospheric soundscape.
 */
export class DystopianAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private lowDroneOsc: OscillatorNode | null = null;
  private lowDroneFilter: BiquadFilterNode | null = null;
  private highTensionOsc: OscillatorNode | null = null;
  private highTensionGain: GainNode | null = null;
  private pulseIntervalId: number | null = null;
  private lfoOsc: OscillatorNode | null = null;
  
  public isMuted: boolean = false;
  public masterVolume: number = 0.5;

  constructor() {}

  /**
   * Initializes the AudioContext on user interaction.
   */
  public init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupDrones();
    } catch (e) {
      console.error("Failed to initialize Web Audio API:", e);
    }
  }

  private setupDrones() {
    if (!this.ctx || !this.masterGain) return;

    // 1. Low Drone: Deep, uncomfortable rumble (F1 ~ 43.65Hz / C2 ~ 65.4Hz)
    this.lowDroneOsc = this.ctx.createOscillator();
    this.lowDroneOsc.type = "sawtooth";
    this.lowDroneOsc.frequency.setValueAtTime(46.25, this.ctx.currentTime); // F#1 dark pitch

    this.lowDroneFilter = this.ctx.createBiquadFilter();
    this.lowDroneFilter.type = "lowpass";
    this.lowDroneFilter.frequency.setValueAtTime(80, this.ctx.currentTime); // very muffled
    this.lowDroneFilter.Q.setValueAtTime(5, this.ctx.currentTime);

    const lowGain = this.ctx.createGain();
    lowGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // start silent

    // Connect Low Drone
    this.lowDroneOsc.connect(this.lowDroneFilter);
    this.lowDroneFilter.connect(lowGain);
    lowGain.connect(this.masterGain);

    // LFO to modulate the lowpass filter frequency (giving it natural breathing)
    this.lfoOsc = this.ctx.createOscillator();
    this.lfoOsc.frequency.value = 0.15; // very slow, 1 cycle per 6 seconds
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 30; // vary frequency by +-30Hz
    this.lfoOsc.connect(lfoGain);
    if (this.lowDroneFilter) {
      lfoGain.connect(this.lowDroneFilter.frequency);
    }

    // 2. High Tension Drone: Uncomfoting high register pitch (starts at G5 ~ 784Hz)
    this.highTensionOsc = this.ctx.createOscillator();
    this.highTensionOsc.type = "sine";
    this.highTensionOsc.frequency.setValueAtTime(740, this.ctx.currentTime); // F#5 tense pitch

    this.highTensionGain = this.ctx.createGain();
    this.highTensionGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.highTensionOsc.connect(this.highTensionGain);
    this.highTensionGain.connect(this.masterGain);

    // Warm up the oscillators in suspension
    this.lowDroneOsc.start(0);
    this.highTensionOsc.start(0);
    this.lfoOsc.start(0);

    // Ramp up the low drone on start
    const now = this.ctx.currentTime;
    lowGain.gain.linearRampToValueAtTime(0.4, now + 3);
  }

  /**
   * Sets the current volume.
   */
  public setVolume(vol: number) {
    this.masterVolume = vol;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : vol;
      this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.1);
    }
  }

  /**
   * Toggles the mute state.
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolume(this.masterVolume);
    return this.isMuted;
  }

  /**
   * Dynamically modulates the score density, speed, and filter cutoffs based on playback time.
   */
  public updateScoreForTime(time: number) {
    if (!this.ctx || !this.lowDroneFilter || !this.highTensionGain || !this.highTensionOsc) return;

    const now = this.ctx.currentTime;

    // Scene 1: Comfort. Time 0 - 12. Low rumble gently breathing. High tension off.
    if (time >= 0 && time < 12) {
      this.stopClinicalPulses();
      this.lowDroneFilter.frequency.setValueAtTime(90, now);
      this.highTensionGain.gain.linearRampToValueAtTime(0.0, now + 0.5);
    }
    
    // Scene 2: Crisis. Time 12 - 24. Drone gets deeper, filter cut-off opens slightly.
    else if (time >= 12 && time < 24) {
      this.stopClinicalPulses();
      this.lowDroneFilter.frequency.linearRampToValueAtTime(140, now + 2); // open filter slightly
      this.highTensionGain.gain.linearRampToValueAtTime(0.05, now + 2); // very subtle high tense pitch
      this.highTensionOsc.frequency.setValueAtTime(740, now);
    }

    // Scene 3: NORA Lab. Time 24 - 36. Sequencer pulses start. Clinical.
    else if (time >= 24 && time < 36) {
      this.lowDroneFilter.frequency.setValueAtTime(120, now);
      this.highTensionGain.gain.linearRampToValueAtTime(0.02, now + 1);
      this.startClinicalPulses(1.0); // 1Hz pulses
    }

    // Scene 4: The Erasure. Time 36 - 48. Faster sequencer bleeps, detuned, high tension rises.
    else if (time >= 36 && time < 48) {
      this.lowDroneFilter.frequency.linearRampToValueAtTime(200, now + 2); // brighter, harsh
      this.highTensionGain.gain.linearRampToValueAtTime(0.12, now + 2);
      this.highTensionOsc.frequency.linearRampToValueAtTime(830, now + 4); // higher tense pitch
      this.startClinicalPulses(0.5); // faster sequence beats (every 0.5 sec)
    }

    // Scene 5: Child solitary. Time 48 - 60. Pulses disappear. High tension drone extremely thin.
    else if (time >= 48 && time < 60) {
      this.stopClinicalPulses();
      this.lowDroneFilter.frequency.linearRampToValueAtTime(70, now + 3); // drop filter back to extreme muffle
      this.highTensionGain.gain.linearRampToValueAtTime(0.15, now + 2);
      // Detune low drone to create severe discordance
      this.lowDroneOsc?.frequency.setValueAtTime(45.0, now);
    }

    // Post-credits/Fade to Black. Time > 60. Rapid fade to zero.
    else {
      this.stopClinicalPulses();
      this.lowDroneFilter.frequency.linearRampToValueAtTime(40, now + 1);
      this.highTensionGain.gain.linearRampToValueAtTime(0.0, now + 1);
      if (this.masterGain) {
        this.masterGain.gain.linearRampToValueAtTime(0.0, now + 1.5);
      }
    }
  }

  private startClinicalPulses(rateInSeconds: number) {
    if (this.pulseIntervalId !== null) {
      // If rate changed, reset it
      this.stopClinicalPulses();
    }

    const triggerPulse = () => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      // high clinical pitch
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    };

    triggerPulse();
    this.pulseIntervalId = window.setInterval(triggerPulse, rateInSeconds * 1000);
  }

  private stopClinicalPulses() {
    if (this.pulseIntervalId !== null) {
      clearInterval(this.pulseIntervalId);
      this.pulseIntervalId = null;
    }
  }

  /**
   * Resumes ctx if suspended (browsers block autoplay).
   */
  public resumeCtx() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  /**
   * Pauses the synthesis smoothly.
   */
  public pause() {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.5);
    }
    this.stopClinicalPulses();
  }

  /**
   * Resumes the synth levels smoothly.
   */
  public play() {
    this.resumeCtx();
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.3);
    }
  }

  /**
   * Teardown audio nodes completely when component unmounts.
   */
  public destroy() {
    this.stopClinicalPulses();
    try {
      this.lowDroneOsc?.stop();
      this.highTensionOsc?.stop();
      this.lfoOsc?.stop();
    } catch (e) {}
    this.ctx?.close();
    this.ctx = null;
  }
}

/**
 * Text to Speech Narrator specifically customized for the dystopian, flat female delivery.
 */
export function speakNarration(
  text: string, 
  onStart?: () => void, 
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech Synthesis is not supported in this browser.");
    return null;
  }

  // Cancel any ongoing speaking immediately to prevent overlap
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Search for an appropriate calm, measured female voice
  const voices = window.speechSynthesis.getVoices();
  // Prefer English female voices, specifically Google US English, Siri, Hazel, Zira, etc.
  const femaleVoice = voices.find(v => 
    v.lang.startsWith("en") && 
    (v.name.includes("Google") || v.name.includes("Zira") || v.name.includes("Samantha") || v.name.includes("Hazel") || v.name.includes("female") || v.name.includes("Natural"))
  );

  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  // Speed and Pitch: Calm, robotic, flat, matter-of-fact
  utterance.rate = 0.82; // significantly slower
  utterance.pitch = 0.85; // slightly lower pitch for a calm, cold drone

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
