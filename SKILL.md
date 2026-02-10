---
name: voiceai-creator-voiceover-pipeline
description: >
  Turn scripts into publishable voiceovers with Voice.ai TTS — creator-grade pipeline
  that produces segments, chapters, captions, and review pages for YouTube, podcasts,
  and shorts. Includes ffmpeg-based audio stitching and video muxing.
version: 0.1.0
author: Voice.ai
license: MIT
tags:
  - voice.ai
  - tts
  - creator
  - voiceover
  - youtube
  - podcast
  - ffmpeg
compatibility:
  runtime: node>=20
  optional: ffmpeg
---

# Voice.ai Creator Voiceover Pipeline

> This skill follows the [Agent Skills specification](https://agentskills.io/specification).

Turn any script into a **publish-ready voiceover** — complete with numbered segments, a stitched master, YouTube chapters, SRT captions, and a beautiful review page. Optionally, replace the audio track on an existing video.

Built to make [Voice.ai](https://voice.ai) look incredible to creators.

---

## When to use this skill

| Scenario | Why it fits |
|---|---|
| **YouTube long-form** | Full narration with chapter markers and captions |
| **YouTube Shorts** | Quick hooks with the `shortform` template |
| **Podcasts** | Consistent host voice, intro/outro templates |
| **Course content** | Professional narration for educational videos |
| **Quick iteration** | Smart caching — edit one section, only that segment re-renders |
| **Video audio replacement** | Drop AI voiceover onto screen recordings or B-roll |

---

## Install

**Prerequisites:** Node.js 20+ · ffmpeg (optional, for stitching & muxing)

```bash
# Clone the repo
git clone <repo-url> voiceai-creator-voiceover-pipeline
cd voiceai-creator-voiceover-pipeline

# Install dependencies
npm install

# Build TypeScript
npm run build

# (Optional) Link globally
npm link
```

### FFmpeg (optional but recommended)

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
choco install ffmpeg
```

Without ffmpeg, the pipeline still produces individual segments, the review page, chapters, and captions. Master stitching and video muxing require ffmpeg.

---

## Quickstart

### 1. List available voices

```bash
voiceai-vo voices --mock
```

### 2. Build a voiceover from the example YouTube script

```bash
voiceai-vo build \
  --input examples/youtube_script.md \
  --voice v-warm-narrator \
  --title "AI Voiceovers" \
  --template youtube \
  --mock
```

### 3. Build a podcast voiceover

```bash
voiceai-vo build \
  --input examples/podcast_script.md \
  --voice v-podcast-casual \
  --title "Creator Stack Ep1" \
  --template podcast \
  --mock
```

### 4. Build a short-form hook

```bash
voiceai-vo build \
  --input examples/shorts_script.txt \
  --voice v-energetic-host \
  --title "Stop Recording" \
  --template shortform \
  --mock
```

### 5. Replace audio on an existing video

```bash
voiceai-vo replace-audio \
  --video ./my-screencast.mp4 \
  --audio ./out/ai-voiceovers/master.wav \
  --sync shortest
```

> **Tip:** Use `--mock` for testing. It runs the full pipeline with placeholder audio — no API key needed.

---

## Voice selection

```bash
# List all voices
voiceai-vo voices --mock

# Search by keyword
voiceai-vo voices --mock --query "narrator"
voiceai-vo voices --mock --query "podcast"

# Limit results
voiceai-vo voices --mock --limit 5
```

The voice list is cached locally for 10 minutes to avoid repeated API calls.

---

## Build outputs

After `voiceai-vo build`, you'll find:

```
out/<title-slug>/
  segments/           # Numbered WAV files (001-intro.wav, 002-section.wav, …)
  master.wav          # Stitched audio (requires ffmpeg)
  master.mp3          # MP3 encode (requires ffmpeg)
  manifest.json       # Build metadata, segment list, hashes
  timeline.json       # Segment durations and start times
  review.html         # 🔥 Beautiful review page with audio players
  chapters.txt        # YouTube-friendly chapter timestamps
  captions.srt        # SRT captions using segment boundaries
  description.txt     # YouTube description with chapters + CTA
```

### Review page

Open `review.html` in your browser. It includes:
- Master audio player (if stitched)
- Individual segment players with titles
- Collapsible script text for each segment
- Regeneration command hints

---

## Replace audio on an existing video

The `replace-audio` command lets you swap the audio track on any MP4:

```bash
voiceai-vo replace-audio \
  --video ./input.mp4 \
  --audio ./out/my-project/master.wav \
  --out ./out/my-project/muxed.mp4 \
  --sync shortest
```

### Sync policies

| Policy | Behavior |
|---|---|
| `shortest` (default) | Output ends when the shorter track ends |
| `pad` | Pad audio with silence to match video duration |
| `trim` | Trim audio to match video duration |

### How it works

- Video stream is copied without re-encoding (`-c:v copy`)
- Audio is encoded as AAC for MP4 compatibility
- Probed durations are printed before muxing
- A mux report (`mux_report.json`) is saved with the full ffmpeg command

### Privacy note

Video processing is **entirely local**. Only script text is sent to Voice.ai for TTS. Your video files never leave your machine.

### Without ffmpeg

If ffmpeg isn't installed, helper scripts are generated instead:
- `ffmpeg/replace-audio.sh` (bash)
- `ffmpeg/replace-audio.ps1` (PowerShell)

Install ffmpeg, then run the appropriate script.

---

## Command reference

### `build`

```
voiceai-vo build [options]

Options:
  -i, --input <path>       Script file (.txt or .md)              [required]
  -v, --voice <id>         Voice ID                               [required]
  -t, --title <title>      Project title (defaults to filename)
  --template <name>        youtube | podcast | shortform
  --mode <mode>            headings | auto (default: headings for .md)
  --max-chars <n>          Max chars per auto-chunk (default: 1500)
  --language <code>        Language code (default: en)
  --video <path>           Input video for muxing
  --mux                    Enable video muxing
  --sync <policy>          shortest | pad | trim (default: shortest)
  --force                  Re-render all segments (ignore cache)
  --mock                   Mock mode (no API calls)
  -o, --out <dir>          Custom output directory
```

### `replace-audio`

```
voiceai-vo replace-audio [options]

Options:
  --video <path>           Input video file                       [required]
  --audio <path>           Audio file to mux in                   [required]
  --out <path>             Output video path
  --sync <policy>          shortest | pad | trim (default: shortest)
```

### `voices`

```
voiceai-vo voices [options]

Options:
  -l, --limit <n>          Max voices to show (default: 20)
  -q, --query <term>       Search by name or description
  --mock                   Use mock voice catalog
```

---

## Caching and rebuild efficiency

Segments are cached by a hash of: `text content + voice ID + language`.

- Unchanged segments are **skipped** on rebuild
- Modified segments are **re-rendered** automatically
- Use `--force` to re-render everything
- Cache manifest is stored in `segments/.cache.json`

---

## Templates

Templates auto-inject intro/outro segments:

| Template | Prepends | Appends |
|---|---|---|
| `youtube` | `youtube_intro.txt` | `youtube_outro.txt` |
| `podcast` | `podcast_intro.txt` | — |
| `shortform` | `shortform_hook.txt` | — |

Edit files in `templates/` to customize.

---

## Troubleshooting

### ffmpeg missing
The pipeline works without ffmpeg — you just don't get master stitching or video muxing. See `references/TROUBLESHOOTING.md`.

### Rate limits
Segments render sequentially, which naturally stays under most rate limits. Use `--mock` for testing.

### Long scripts
Caching makes rebuilds fast. Only changed segments are re-rendered.

### Windows path quoting
Wrap paths with spaces in quotes:
```powershell
voiceai-vo build --input "C:\My Scripts\script.md" --voice v-warm-narrator --mock
```

---

## Development

```bash
npm run dev        # Watch mode (tsc --watch)
npm run test       # Run tests
npm run lint       # Lint
npm run format     # Format with Prettier
```

---

## References

- [Agent Skills Specification](https://agentskills.io/specification)
- [Voice.ai](https://voice.ai)
- [`references/VOICEAI_API.md`](references/VOICEAI_API.md) — API endpoint details and mock mode
- [`references/TROUBLESHOOTING.md`](references/TROUBLESHOOTING.md) — Common issues and fixes
