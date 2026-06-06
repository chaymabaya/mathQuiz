// Generates applause sound using Web Audio API (no external file needed)
export function playApplause() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // ── 1. Individual clap hits ─────────────────────────────
    const NUM_CLAPS  = 28;
    const SPREAD     = 1.6; // seconds over which claps are spread

    for (let i = 0; i < NUM_CLAPS; i++) {
      const startTime    = Math.random() * SPREAD * 0.75;
      const clapDuration = 0.06 + Math.random() * 0.10;
      const samples      = Math.floor(ctx.sampleRate * clapDuration);
      const buf          = ctx.createBuffer(1, samples, ctx.sampleRate);
      const data         = buf.getChannelData(0);

      for (let s = 0; s < samples; s++) {
        // Decaying noise burst = a single clap
        const decay = Math.pow(1 - s / samples, 1.8);
        data[s] = (Math.random() * 2 - 1) * decay;
      }

      const src    = ctx.createBufferSource();
      src.buffer   = buf;

      // High-pass to give the "smack" brightness
      const hpf    = ctx.createBiquadFilter();
      hpf.type     = 'highpass';
      hpf.frequency.value = 900 + Math.random() * 600;

      const gain   = ctx.createGain();
      gain.gain.value = 0.18 + Math.random() * 0.28;

      src.connect(hpf);
      hpf.connect(gain);
      gain.connect(ctx.destination);
      src.start(ctx.currentTime + startTime);
    }

    // ── 2. Crowd noise base ─────────────────────────────────
    const CROWD_DUR = 2.4;
    const crowdBuf  = ctx.createBuffer(2, Math.floor(ctx.sampleRate * CROWD_DUR), ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const d = crowdBuf.getChannelData(ch);
      for (let s = 0; s < crowdBuf.length; s++) {
        d[s] = Math.random() * 2 - 1;
      }
    }

    const crowdSrc   = ctx.createBufferSource();
    crowdSrc.buffer  = crowdBuf;

    // Bandpass shapes it into a crowd-murmur frequency range
    const bpf        = ctx.createBiquadFilter();
    bpf.type         = 'bandpass';
    bpf.frequency.value = 700;
    bpf.Q.value      = 0.35;

    const crowdGain  = ctx.createGain();
    const t          = ctx.currentTime;
    crowdGain.gain.setValueAtTime(0, t);
    crowdGain.gain.linearRampToValueAtTime(0.25, t + 0.25);
    crowdGain.gain.setValueAtTime(0.25, t + 0.9);
    crowdGain.gain.linearRampToValueAtTime(0.12, t + 1.6);
    crowdGain.gain.linearRampToValueAtTime(0, t + CROWD_DUR);

    crowdSrc.connect(bpf);
    bpf.connect(crowdGain);
    crowdGain.connect(ctx.destination);
    crowdSrc.start(t);
    crowdSrc.stop(t + CROWD_DUR);

    crowdSrc.onended = () => { try { ctx.close(); } catch (_) {} };
  } catch (_) {
    // Silently ignore if Web Audio API is unavailable
  }
}
