# voiceai-creator-voiceover-pipeline

> Turn scripts into publishable voiceovers with Voice.ai — segments, chapters, captions, review page, and video muxing.

**📖 Full documentation: [SKILL.md](SKILL.md)**

## Quick start

```bash
npm install && npm run build

# List voices (mock mode)
voiceai-vo voices --mock

# Build a voiceover
voiceai-vo build --input examples/youtube_script.md --voice v-warm-narrator --title "My Video" --mock

# Replace audio on a video
voiceai-vo replace-audio --video input.mp4 --audio out/my-video/master.wav
```

## What it produces

```
out/<title>/
  segments/        # Numbered WAV files
  master.wav       # Stitched master (ffmpeg)
  review.html      # Interactive review page
  chapters.txt     # YouTube chapters
  captions.srt     # SRT captions
  description.txt  # YouTube description
  manifest.json    # Build metadata
  timeline.json    # Segment timing
```

## Learn more

- **[SKILL.md](SKILL.md)** — Complete usage guide, command reference, and examples
- **[references/VOICEAI_API.md](references/VOICEAI_API.md)** — API endpoint details
- **[references/TROUBLESHOOTING.md](references/TROUBLESHOOTING.md)** — Common issues

---

*Built with [Voice.ai](https://voice.ai) · Follows the [Agent Skills specification](https://agentskills.io/specification)*
