export class PrimeOrbitSound {
  private audioContext: AudioContext | null = null;
  private soundEnabled = true;
  private humEnabled = false;
  private humOscillator: OscillatorNode | null = null;
  private humGain: GainNode | null = null;

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopHum();
    } else if (this.humEnabled) {
      this.startHum();
    }
  }

  public setHumEnabled(enabled: boolean): void {
    this.humEnabled = enabled;
    if (!this.soundEnabled) {
      return;
    }
    if (enabled) {
      this.startHum();
    } else {
      this.stopHum();
    }
  }

  public playTransformGlitch(): void {
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    gain.connect(ctx.destination);

    const square = ctx.createOscillator();
    square.type = 'square';
    square.frequency.setValueAtTime(410, now);
    square.frequency.exponentialRampToValueAtTime(1080, now + 0.1);
    square.frequency.exponentialRampToValueAtTime(330, now + 0.18);
    square.connect(gain);
    square.start(now);
    square.stop(now + 0.2);
  }

  public playPrimeWhoosh(): void {
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
    gain.connect(ctx.destination);

    const sine = ctx.createOscillator();
    sine.type = 'sine';
    sine.frequency.setValueAtTime(190, now);
    sine.frequency.exponentialRampToValueAtTime(680, now + 0.24);
    sine.connect(gain);
    sine.start(now);
    sine.stop(now + 0.28);
  }

  public dispose(): void {
    this.stopHum();
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.soundEnabled || typeof window === 'undefined') {
      return null;
    }

    const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) {
      return null;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioCtor();
    }

    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }

    return this.audioContext;
  }

  private startHum(): void {
    if (this.humOscillator || !this.humEnabled) {
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0065, ctx.currentTime + 0.18);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(78, ctx.currentTime);
    osc.detune.setValueAtTime(-7, ctx.currentTime);
    osc.connect(gain);
    osc.start();

    this.humGain = gain;
    this.humOscillator = osc;
  }

  private stopHum(): void {
    if (!this.humOscillator || !this.humGain) {
      return;
    }

    const ctx = this.audioContext;
    if (ctx) {
      const now = ctx.currentTime;
      this.humGain.gain.cancelScheduledValues(now);
      this.humGain.gain.setValueAtTime(this.humGain.gain.value, now);
      this.humGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      this.humOscillator.stop(now + 0.13);
    } else {
      this.humOscillator.stop();
    }

    this.humOscillator.disconnect();
    this.humGain.disconnect();
    this.humOscillator = null;
    this.humGain = null;
  }
}
