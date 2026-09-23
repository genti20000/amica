import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Disc, Play, Pause, Sparkles } from 'lucide-react';

export const JazzAmbientAudio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.35); // Gentle default volume
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentChordName, setCurrentChordName] = useState<string>('Fmaj9');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const vinylNodeRef = useRef<AudioNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  // 1950s Soho Jazz Lounge Chord Progression (Mellow 7th/9th voicings in Hz)
  const JAZZ_CHORDS = [
    {
      name: 'Fmaj9 (Soho Twilight)',
      frequencies: [174.61, 220.00, 261.63, 329.63, 392.00], // F3, A3, C4, E4, G4
      bass: 87.31, // F2
    },
    {
      name: 'Em7 (Frith St Cellar)',
      frequencies: [164.81, 196.00, 246.94, 293.66, 392.00], // E3, G3, B3, D4, G4
      bass: 82.41, // E2
    },
    {
      name: 'Dm9 (Subterranean Jazz)',
      frequencies: [146.83, 174.61, 220.00, 261.63, 329.63], // D3, F3, A3, C4, E4
      bass: 73.42, // D2
    },
    {
      name: 'G13 (1950s Golden Hour)',
      frequencies: [196.00, 246.94, 293.66, 349.23, 440.00], // G3, B3, D4, F4, A4
      bass: 98.00, // G2
    },
    {
      name: 'Cmaj9 (Venetian Sunset)',
      frequencies: [130.81, 164.81, 196.00, 246.94, 293.66], // C3, E3, G3, B3, D4
      bass: 65.41, // C2
    },
    {
      name: 'A7b9 (Vermouth Reserve)',
      frequencies: [220.00, 277.18, 329.63, 392.00, 466.16], // A3, C#4, E4, G4, Bb4
      bass: 110.00, // A2
    },
  ];

  // Initialize Web Audio
  const startAudioEngine = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Start Vinyl Crackle background
    startVinylCrackle(ctx, masterGain);

    // Start Jazz Chord Loop
    let chordIndex = 0;
    playJazzChord(ctx, masterGain, JAZZ_CHORDS[chordIndex]);
    setCurrentChordName(JAZZ_CHORDS[chordIndex].name);

    intervalRef.current = window.setInterval(() => {
      chordIndex = (chordIndex + 1) % JAZZ_CHORDS.length;
      const nextChord = JAZZ_CHORDS[chordIndex];
      setCurrentChordName(nextChord.name);
      if (audioCtxRef.current && masterGainRef.current) {
        playJazzChord(audioCtxRef.current, masterGainRef.current, nextChord);
      }
    }, 4200);

    setIsPlaying(true);
  };

  const stopAudioEngine = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.suspend();
    }
    setIsPlaying(false);
  };

  // Generate continuous analog vinyl noise & subtle crackles
  const startVinylCrackle = (ctx: AudioContext, destination: GainNode) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Warm pink noise formula
      const white = Math.random() * 2 - 1;
      output[i] = white * 0.015;
      
      // Random vinyl pops
      if (Math.random() < 0.0008) {
        output[i] += (Math.random() > 0.5 ? 1 : -1) * (0.05 + Math.random() * 0.1);
      }
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // Filter noise to sound like warm 1950s vinyl
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, ctx.currentTime);

    noiseNode.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(destination);

    noiseNode.start();
    vinylNodeRef.current = noiseNode;
  };

  // Play a warm rhodes-style piano jazz chord with soft attack and decay
  const playJazzChord = (
    ctx: AudioContext,
    destination: GainNode,
    chord: typeof JAZZ_CHORDS[0]
  ) => {
    const now = ctx.currentTime;

    // Upright Bass Note
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassFilter = ctx.createBiquadFilter();

    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(chord.bass, now);
    
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(300, now);

    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.linearRampToValueAtTime(0.18, now + 0.1);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(destination);

    bassOsc.start(now);
    bassOsc.stop(now + 4.0);

    // Chord Harmonies
    chord.frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Soft sine/triangle blend for rhodes tone
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Warm lowpass
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850 + idx * 100, now);

      // Stagger note start slightly for realistic human strum
      const stagger = idx * 0.04;
      const noteStart = now + stagger;

      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.linearRampToValueAtTime(0.08, noteStart + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 3.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(noteStart);
      osc.stop(noteStart + 3.8);
    });
  };

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      stopAudioEngine();
    } else {
      startAudioEngine();
    }
  };

  // Handle Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : val, audioCtxRef.current.currentTime);
    }
  };

  // Handle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(nextMuted ? 0 : volume, audioCtxRef.current.currentTime);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAudioEngine();
    };
  }, []);

  return (
    <div className="bg-[#141418]/95 border border-[#C5A059]/40 rounded-xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Info Column */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full border border-[#C5A059] flex items-center justify-center shrink-0 transition-all duration-500 ${
              isPlaying
                ? 'bg-[#1C1C26] text-[#FFEAA7] animate-spin [animation-duration:8s]'
                : 'bg-[#0B0B0C] text-[#C5A059]/60'
            }`}
          >
            <Disc className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-[#FDFBF7] tracking-wide">
                23 Frith Street Jazz Atmosphere
              </span>
              {isPlaying && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[9px] text-[#FFEAA7] font-display">
                  {/* Equalizer Wave Visualizer */}
                  <div className="flex items-end gap-0.5 h-3 w-4">
                    <span className="w-0.5 bg-[#C5A059] rounded-full animate-bounce h-full [animation-delay:0.1s]" />
                    <span className="w-0.5 bg-[#C5A059] rounded-full animate-bounce h-2/3 [animation-delay:0.3s]" />
                    <span className="w-0.5 bg-[#C5A059] rounded-full animate-bounce h-full [animation-delay:0.2s]" />
                    <span className="w-0.5 bg-[#C5A059] rounded-full animate-bounce h-1/2 [animation-delay:0.4s]" />
                  </div>
                  <span>LIVE VINYL</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#DFBE7B] font-sans">
              {isPlaying
                ? `Playing: ${currentChordName} · Warm Analog Vinyl`
                : 'Subtle ambient jazz chordscapes & analog vinyl feel'}
            </p>
          </div>
        </div>

        {/* Right Controls Column */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Play/Pause Main Button */}
          <button
            onClick={togglePlay}
            className={`px-4 py-2 rounded-lg font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer ${
              isPlaying
                ? 'btn-brass-outline'
                : 'btn-brass'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Jazz</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span>Play Soho Ambient</span>
              </>
            )}
          </button>

          {/* Volume Slider & Mute Toggle */}
          {isPlaying && (
            <div className="flex items-center gap-2 border-l border-[#C5A059]/30 pl-4">
              <button
                onClick={toggleMute}
                className="text-[#C5A059] hover:text-[#DFBE7B] transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-[#C5A059]/50" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#C5A059]" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="0.8"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-[#C5A059] cursor-pointer bg-[#0B0B0C] h-1.5 rounded-lg"
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
