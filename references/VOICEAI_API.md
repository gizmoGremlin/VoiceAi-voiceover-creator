# Voice.ai API Reference (for contributors)

> **Status:** The endpoints below are placeholders. When Voice.ai publishes production API docs, update `src/api.ts` accordingly.

## Authentication

All requests require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <VOICEAI_API_KEY>
```

Get your key from [voice.ai](https://voice.ai).

## Base URL

```
https://api.voice.ai/v1
```

Override via `VOICEAI_API_BASE` environment variable.

---

## Endpoints

### `GET /voices` — List available voices

**Expected Response:**

```json
{
  "voices": [
    {
      "id": "v-warm-narrator",
      "name": "Warm Narrator",
      "type": "neural",
      "language": "en",
      "description": "Rich, inviting tone perfect for documentaries.",
      "preview_url": "https://api.voice.ai/previews/v-warm-narrator.mp3"
    }
  ],
  "total": 20
}
```

**Query Parameters (assumed):**
| Param   | Type   | Description               |
|---------|--------|---------------------------|
| `limit` | number | Max voices to return      |
| `query` | string | Search by name/description|

### `POST /tts` — Generate speech from text

**Request Body:**

```json
{
  "text": "Hello world, this is a test.",
  "voice_id": "v-warm-narrator",
  "language": "en",
  "format": "wav"
}
```

**Expected Response:**
- **Body:** Binary audio data (WAV or MP3)
- **Headers:**
  - `x-audio-duration`: Duration in seconds (float)
  - `x-sample-rate`: Sample rate in Hz (integer)
  - `Content-Type`: `audio/wav` or `audio/mpeg`

**Fields to fill in `src/api.ts`:**
- `POST /tts` endpoint URL
- Request body schema (confirm field names)
- Response headers (confirm duration/sample-rate header names)
- Error response format
- Rate limit headers (if any)

---

## Mock Mode

When `--mock` is passed (or when `VoiceAIClient` is constructed with `mock: true`):

- **Voice listing** returns 20 built-in mock voices with realistic metadata
- **TTS generation** returns valid WAV files with:
  - Estimated duration based on word count (~2.5 words/sec)
  - 22050 Hz sample rate, mono, 16-bit PCM
  - Mostly silence with a tiny click at the start for waveform visibility
- **No network requests** are made
- **No API key** is required

Mock mode runs the **entire pipeline** end-to-end — chunking, caching, stitching, review page generation, chapters, captions, and video muxing all work identically.

---

## TODO for integration

1. [ ] Confirm endpoint URLs with Voice.ai team
2. [ ] Confirm auth header format
3. [ ] Confirm TTS request body schema
4. [ ] Confirm response headers for duration/sample-rate
5. [ ] Add rate limiting / retry logic if needed
6. [ ] Add streaming support if available (for long segments)
