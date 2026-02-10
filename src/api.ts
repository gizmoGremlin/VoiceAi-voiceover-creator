/**
 * Voice.ai API client — all HTTP calls in one place.
 * Includes mock mode for full pipeline testing without real endpoints.
 *
 * TODO: Replace placeholder endpoints with real Voice.ai API when available.
 * See references/VOICEAI_API.md for field details.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Voice {
  id: string;
  name: string;
  type: string;
  language: string;
  description?: string;
  preview_url?: string;
}

export interface TTSRequest {
  text: string;
  voice_id: string;
  language?: string;
  format?: 'wav' | 'mp3';
}

export interface TTSResponse {
  audio_data: Buffer;
  duration_seconds: number;
  sample_rate: number;
  format: string;
}

export interface VoiceListResponse {
  voices: Voice[];
  total: number;
}

/* ------------------------------------------------------------------ */
/*  Mock voice catalog (showcases Voice.ai variety)                    */
/* ------------------------------------------------------------------ */

const MOCK_VOICES: Voice[] = [
  { id: 'v-warm-narrator', name: 'Warm Narrator', type: 'neural', language: 'en', description: 'Rich, inviting tone perfect for documentaries and brand stories.' },
  { id: 'v-energetic-host', name: 'Energetic Host', type: 'neural', language: 'en', description: 'Upbeat energy ideal for YouTube intros and product launches.' },
  { id: 'v-calm-storyteller', name: 'Calm Storyteller', type: 'neural', language: 'en', description: 'Soothing cadence for audiobooks and bedtime content.' },
  { id: 'v-pro-announcer', name: 'Professional Announcer', type: 'neural', language: 'en', description: 'Authoritative broadcast-quality delivery.' },
  { id: 'v-friendly-guide', name: 'Friendly Guide', type: 'neural', language: 'en', description: 'Approachable tutorial voice that puts viewers at ease.' },
  { id: 'v-deep-baritone', name: 'Deep Baritone', type: 'neural', language: 'en', description: 'Commanding low register for trailers and promos.' },
  { id: 'v-bright-soprano', name: 'Bright Soprano', type: 'neural', language: 'en', description: 'Clear, high-energy voice for lifestyle and beauty content.' },
  { id: 'v-documentary', name: 'Documentary Voice', type: 'neural', language: 'en', description: 'Classic documentary narration with gravitas.' },
  { id: 'v-podcast-casual', name: 'Podcast Casual', type: 'neural', language: 'en', description: 'Relaxed, conversational — like talking to a friend.' },
  { id: 'v-news-anchor', name: 'News Anchor', type: 'neural', language: 'en', description: 'Crisp, confident news delivery.' },
  { id: 'v-audiobook-classic', name: 'Audiobook Classic', type: 'neural', language: 'en', description: 'Measured pacing with excellent clarity for long-form.' },
  { id: 'v-tech-reviewer', name: 'Tech Reviewer', type: 'neural', language: 'en', description: 'Knowledgeable and direct — great for reviews and explainers.' },
  { id: 'v-meditation', name: 'Meditation Guide', type: 'neural', language: 'en', description: 'Gentle whisper-close delivery for wellness content.' },
  { id: 'v-sports-commentator', name: 'Sports Commentator', type: 'neural', language: 'en', description: 'Fast-paced excitement for highlights and recaps.' },
  { id: 'v-cinematic', name: 'Cinematic Narrator', type: 'neural', language: 'en', description: 'Epic, sweeping tone for trailers and intros.' },
  { id: 'v-conversational', name: 'Conversational', type: 'neural', language: 'en', description: 'Natural everyday speech — the most versatile voice.' },
  { id: 'v-dramatic', name: 'Dramatic Voice', type: 'neural', language: 'en', description: 'Intense, emotional range for fiction and drama.' },
  { id: 'v-upbeat-promo', name: 'Upbeat Promo', type: 'neural', language: 'en', description: 'High energy sell — ads, promos, and CTAs.' },
  { id: 'v-soft-whisper', name: 'Soft Whisper', type: 'neural', language: 'en', description: 'ASMR-adjacent intimacy for close-mic content.' },
  { id: 'v-corporate', name: 'Corporate Presenter', type: 'neural', language: 'en', description: 'Polished and neutral for enterprise videos.' },
];

/* ------------------------------------------------------------------ */
/*  WAV generator (mock mode)                                          */
/* ------------------------------------------------------------------ */

function generateMockWav(durationSeconds: number, sampleRate = 22050): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * numChannels * bytesPerSample;
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk (PCM)
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk (silence — zeros already from Buffer.alloc)
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Add a tiny click at the start so players show a waveform
  if (numSamples > 100) {
    for (let i = 0; i < 80; i++) {
      const val = Math.floor(Math.sin((i / 80) * Math.PI) * 2000);
      buffer.writeInt16LE(val, headerSize + i * 2);
    }
  }

  return buffer;
}

/* ------------------------------------------------------------------ */
/*  Voice cache (in-memory, with TTL)                                  */
/* ------------------------------------------------------------------ */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const voiceCache: { entry?: CacheEntry<VoiceListResponse> } = {};
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/* ------------------------------------------------------------------ */
/*  API Client                                                         */
/* ------------------------------------------------------------------ */

export class VoiceAIClient {
  private apiKey: string | null;
  readonly mock: boolean;
  private baseUrl: string;

  constructor(options: { apiKey?: string; mock?: boolean }) {
    this.apiKey = options.apiKey ?? null;
    this.mock = options.mock ?? false;
    this.baseUrl = process.env.VOICEAI_API_BASE ?? 'https://api.voice.ai/v1';
  }

  /* ---------- Voices ------------------------------------------------ */

  async listVoices(options?: { limit?: number; query?: string }): Promise<VoiceListResponse> {
    if (this.mock) return this.mockListVoices(options);

    // Check cache
    if (voiceCache.entry && Date.now() < voiceCache.entry.expiresAt) {
      return this.filterVoices(voiceCache.entry.data, options);
    }

    // TODO: Replace with real Voice.ai GET /voices endpoint
    // Expected: GET {baseUrl}/voices  Headers: Authorization: Bearer {apiKey}
    // Response: { voices: Voice[], total: number }
    // See references/VOICEAI_API.md
    const res = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Voice.ai API error ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as VoiceListResponse;
    voiceCache.entry = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return this.filterVoices(data, options);
  }

  /* ---------- TTS --------------------------------------------------- */

  async generateSpeech(request: TTSRequest): Promise<TTSResponse> {
    if (this.mock) return this.mockGenerateSpeech(request);

    // TODO: Replace with real Voice.ai POST /tts endpoint
    // Expected: POST {baseUrl}/tts
    //   Headers: Authorization: Bearer {apiKey}, Content-Type: application/json
    //   Body: { text, voice_id, language?, format? }
    //   Response: binary audio (WAV) with headers x-audio-duration, x-sample-rate
    // See references/VOICEAI_API.md
    const res = await fetch(`${this.baseUrl}/tts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        voice_id: request.voice_id,
        language: request.language ?? 'en',
        format: request.format ?? 'wav',
      }),
    });

    if (!res.ok) {
      throw new Error(`Voice.ai TTS error ${res.status}: ${await res.text()}`);
    }

    const audioBuffer = Buffer.from(await res.arrayBuffer());
    const durationHeader = res.headers.get('x-audio-duration');
    const sampleRateHeader = res.headers.get('x-sample-rate');

    return {
      audio_data: audioBuffer,
      duration_seconds: durationHeader ? parseFloat(durationHeader) : 0,
      sample_rate: sampleRateHeader ? parseInt(sampleRateHeader, 10) : 22050,
      format: request.format ?? 'wav',
    };
  }

  /* ---------- Mock implementations ---------------------------------- */

  private mockListVoices(options?: { limit?: number; query?: string }): VoiceListResponse {
    return this.filterVoices({ voices: MOCK_VOICES, total: MOCK_VOICES.length }, options);
  }

  private filterVoices(
    data: VoiceListResponse,
    options?: { limit?: number; query?: string },
  ): VoiceListResponse {
    let voices = [...data.voices];
    if (options?.query) {
      const q = options.query.toLowerCase();
      voices = voices.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.type.toLowerCase().includes(q) ||
          (v.description ?? '').toLowerCase().includes(q),
      );
    }
    const total = voices.length;
    if (options?.limit) voices = voices.slice(0, options.limit);
    return { voices, total };
  }

  private mockGenerateSpeech(request: TTSRequest): TTSResponse {
    // Estimate duration: ~2.5 words/second (natural speech rate)
    const wordCount = request.text.split(/\s+/).filter(Boolean).length;
    const duration = Math.max(0.5, wordCount / 2.5);
    const sampleRate = 22050;
    const audio = generateMockWav(duration, sampleRate);
    return {
      audio_data: audio,
      duration_seconds: duration,
      sample_rate: sampleRate,
      format: 'wav',
    };
  }
}
