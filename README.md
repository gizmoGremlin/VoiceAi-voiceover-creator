# voiceai-creator-voiceover-pipeline

> Turn scripts into publishable voiceovers with Voice.ai — segments, chapters, captions, review page, and video muxing.

**📖 Skill documentation: [SKILL.md](SKILL.md)**

---

## Developer setup

**Prerequisites:** Node.js 20+ · ffmpeg (optional, for stitching & muxing)

```bash
# Clone the repo
git clone <repo-url> voiceai-creator-voiceover-pipeline
cd voiceai-creator-voiceover-pipeline

# Install dependencies
npm install

# Build TypeScript
npm run build

# Register the voiceai-vo CLI command
npm link
```

### Set your API key

```bash
echo 'VOICE_AI_API_KEY=your-key-here' > .env
```

Get your key at [voice.ai/dashboard](https://voice.ai/dashboard).

### FFmpeg (optional but recommended)

```bash
# macOS
brew install ffmpeg

# Ubuntu / Debian
sudo apt install ffmpeg

# Windows
choco install ffmpeg
```

---

## Quick start

```bash
# List voices
voiceai-vo voices

# Build a voiceover (use aliases like "ellie", "oliver", "smooth")
voiceai-vo build --input examples/youtube_script.md --voice ellie --title "My Video"

# Test without an API key
voiceai-vo build --input examples/youtube_script.md --voice ellie --title "My Video" --mock

# Replace audio on a video
voiceai-vo replace-audio --video input.mp4 --audio out/my-video/master.wav
```

## What it produces

```
out/<title>/
  segments/        # Numbered WAV files
  master.wav       # Stitched master (ffmpeg)
  master.mp3       # MP3 encode (ffmpeg)
  review.html      # Interactive review page
  chapters.txt     # YouTube chapters
  captions.srt     # SRT captions
  description.txt  # YouTube description
  manifest.json    # Build metadata
  timeline.json    # Segment timing
```

## Development

```bash
npm run dev        # Watch mode (tsc --watch)
npm run test       # Run tests (vitest)
npm run lint       # Lint (eslint)
npm run format     # Format (prettier)
```

## Learn more

- **[SKILL.md](SKILL.md)** — Full skill documentation: commands, voices, outputs, configuration
- **[references/VOICEAI_API.md](references/VOICEAI_API.md)** — Voice.ai API endpoints and formats
- **[references/TROUBLESHOOTING.md](references/TROUBLESHOOTING.md)** — Common issues and fixes

---

*Powered by [Voice.ai](https://voice.ai) · Follows the [Agent Skills specification](https://agentskills.io/specification)*
