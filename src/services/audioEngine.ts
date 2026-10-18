/**
 * Audio Engine supporting both HTML5 Audio (for uploaded files)
 * and high-fidelity Web Audio Synthesizer (for generated original demo tracks).
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;

  // Synthesizer scheduler state
  private isSynthPlaying = false;
  private synthTimer: number | null = null;
  private currentTrackId: string | null = null;
  private synthStep = 0;
  private synthStartTime = 0;
  private synthPauseOffset = 0;
  private synthPreset = 0;
  private synthDuration = 180; // default 3 min

  // Listeners
  private onTimeUpdateCallback: ((currentTime: number, duration: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private onPlayStateChangeCallback: ((isPlaying: boolean) => void) | null = null;

  constructor() {
    // Lazy initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.analyser.connect(this.gainNode);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setCallbacks(
    onTimeUpdate: (currentTime: number, duration: number) => void,
    onEnded: () => void,
    onPlayStateChange: (isPlaying: boolean) => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
    this.onPlayStateChangeCallback = onPlayStateChange;
  }

  public setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(clamped, this.ctx?.currentTime || 0);
    }
    if (this.audioElement) {
      this.audioElement.volume = clamped;
    }
  }

  public playTrack(trackId: string, audioUrl: string, duration = 180, startOffset = 0) {
    this.initContext();
    this.stop();

    this.currentTrackId = trackId;
    const isSynthetic = audioUrl.startsWith('synth:') || !audioUrl.startsWith('blob:') && !audioUrl.startsWith('http') && !audioUrl.startsWith('data:');

    if (isSynthetic) {
      this.startSynthesizer(trackId, audioUrl, duration, startOffset);
    } else {
      this.startHtmlAudio(audioUrl, startOffset);
    }
  }

  private startHtmlAudio(url: string, startOffset = 0) {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.src = url;
    this.audioElement.currentTime = startOffset;

    try {
      if (this.ctx && !this.sourceNode) {
        this.sourceNode = this.ctx.createMediaElementSource(this.audioElement);
        if (this.analyser) {
          this.sourceNode.connect(this.analyser);
        } else {
          this.sourceNode.connect(this.ctx.destination);
        }
      }
    } catch {
      // If already connected or CORS issue, fallback to direct audio element output
    }

    this.audioElement.ontimeupdate = () => {
      if (this.audioElement && this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audioElement.currentTime, this.audioElement.duration || 180);
      }
    };

    this.audioElement.onended = () => {
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    };

    this.audioElement.play().then(() => {
      this.onPlayStateChangeCallback?.(true);
    }).catch(() => {
      this.onPlayStateChangeCallback?.(false);
    });
  }

  private startSynthesizer(trackId: string, presetName: string, duration: number, startOffset = 0) {
    if (!this.ctx) return;
    this.isSynthPlaying = true;
    this.synthDuration = duration;
    this.synthPauseOffset = startOffset;
    this.synthStartTime = this.ctx.currentTime - startOffset;

    // Pick preset profile based on name or trackId
    let hash = 0;
    const key = presetName + trackId;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    this.synthPreset = Math.abs(hash) % 4;
    this.synthStep = Math.floor(startOffset * 4);

    this.onPlayStateChangeCallback?.(true);
    this.scheduleSynthLoop();
  }

  private scheduleSynthLoop = () => {
    if (!this.isSynthPlaying || !this.ctx) return;

    const currentSec = this.ctx.currentTime - this.synthStartTime;
    if (currentSec >= this.synthDuration) {
      this.stop();
      this.onEndedCallback?.();
      return;
    }

    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(currentSec, this.synthDuration);
    }

    // Play next musical bar / note every ~250ms (16th note at 120bpm)
    this.playSynthStep(this.synthStep);
    this.synthStep++;

    this.synthTimer = window.setTimeout(this.scheduleSynthLoop, 250);
  };

  private playSynthStep(step: number) {
    if (!this.ctx || !this.analyser) return;

    const now = this.ctx.currentTime;
    const chords = [
      // Preset 0: Ambient Gold (Fmaj7 - Em7 - Dm9 - Cmaj7)
      [[174.61, 261.63, 329.63, 440], [164.81, 246.94, 329.63, 392], [146.83, 220, 261.63, 349.23], [130.81, 196, 246.94, 329.63]],
      // Preset 1: Deep Minimal Warmth (Am - F - C - G)
      [[220, 261.63, 329.63, 440], [174.61, 220, 261.63, 349.23], [130.81, 196, 261.63, 329.63], [196, 246.94, 293.66, 392]],
      // Preset 2: Neo Soul / Lo-Fi (Ebmaj9 - Dm7 - Gm7 - Bb7)
      [[155.56, 233.08, 311.13, 392], [146.83, 220, 261.63, 349.23], [196, 293.66, 349.23, 440], [233.08, 293.66, 349.23, 466.16]],
      // Preset 3: Electronic Amber Pulse (D minor arpeggiated)
      [[146.83, 220, 293.66, 369.99], [174.61, 220, 261.63, 349.23], [196, 246.94, 293.66, 392], [220, 261.63, 329.63, 440]]
    ][this.synthPreset];

    const chordIndex = Math.floor(step / 16) % chords.length;
    const currentChord = chords[chordIndex];

    // Every 8 steps, trigger warm soft polyphonic pad note
    if (step % 8 === 0) {
      currentChord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600 + (this.synthPreset * 200), now);
        filter.Q.setValueAtTime(2, now);

        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.045, now + 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.analyser!);

        osc.start(now);
        osc.stop(now + 2.3);
      });
    }

    // Gentle melodic arp note on alternating steps
    if (step % 2 === 0) {
      const noteNote = currentChord[(step / 2) % currentChord.length] * 2;
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();

      leadOsc.type = 'triangle';
      leadOsc.frequency.setValueAtTime(noteNote, now);

      leadGain.gain.setValueAtTime(0, now);
      leadGain.gain.linearRampToValueAtTime(0.025, now + 0.05);
      leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      leadOsc.connect(leadGain);
      leadGain.connect(this.analyser);

      leadOsc.start(now);
      leadOsc.stop(now + 0.65);
    }

    // Warm sub bass on downbeats
    if (step % 8 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(currentChord[0] / 2, now);

      bassGain.gain.setValueAtTime(0.08, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      bassOsc.connect(bassGain);
      bassGain.connect(this.analyser);

      bassOsc.start(now);
      bassOsc.stop(now + 1.3);
    }

    // Soft percussion tick / tap (gentle high frequency brush)
    if (step % 4 === 2) {
      const noiseNode = this.createNoiseBuffer(now, 0.04, 0.015);
      if (noiseNode) {
        noiseNode.connect(this.analyser);
      }
    }
  }

  private createNoiseBuffer(time: number, length: number, gainLevel: number) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * length;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(5000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainLevel, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + length);

    noise.connect(filter);
    filter.connect(gain);
    noise.start(time);
    return gain;
  }

  public pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
    if (this.isSynthPlaying) {
      this.isSynthPlaying = false;
      if (this.synthTimer) {
        window.clearTimeout(this.synthTimer);
        this.synthTimer = null;
      }
      if (this.ctx) {
        this.synthPauseOffset = this.ctx.currentTime - this.synthStartTime;
      }
    }
    this.onPlayStateChangeCallback?.(false);
  }

  public resume() {
    this.initContext();
    if (this.audioElement) {
      this.audioElement.play().then(() => {
        this.onPlayStateChangeCallback?.(true);
      }).catch(() => {
        this.onPlayStateChangeCallback?.(false);
      });
    } else if (this.currentTrackId) {
      this.isSynthPlaying = true;
      if (this.ctx) {
        this.synthStartTime = this.ctx.currentTime - this.synthPauseOffset;
      }
      this.onPlayStateChangeCallback?.(true);
      this.scheduleSynthLoop();
    }
  }

  public seek(seconds: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = seconds;
    } else if (this.isSynthPlaying && this.ctx) {
      this.synthStartTime = this.ctx.currentTime - seconds;
      this.synthPauseOffset = seconds;
      this.synthStep = Math.floor(seconds * 4);
    } else {
      this.synthPauseOffset = seconds;
    }
  }

  public stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    if (this.isSynthPlaying) {
      this.isSynthPlaying = false;
      if (this.synthTimer) {
        window.clearTimeout(this.synthTimer);
        this.synthTimer = null;
      }
    }
    this.synthPauseOffset = 0;
    this.onPlayStateChangeCallback?.(false);
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(32);
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
}

export const audioEngine = new AudioEngine();
