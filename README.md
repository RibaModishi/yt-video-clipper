# YouTube Video Clipper

A free, open-source web application for creating clips from YouTube videos. Perfect for content creators who need to extract specific segments from YouTube videos for Instagram, TikTok, or other platforms.

## Features

- ✂️ **Clip Any YouTube Video** - Extract specific segments from any YouTube video
- 🎯 **Flexible Time Selection** - Set start and end times using timestamps (HH:MM:SS) or seconds
- 📥 **Instant Downloads** - Download your clips as MP4 files
- 🎨 **Modern UI** - Beautiful, responsive interface that works on all devices
- 💯 **100% Free** - No subscriptions, no trials, no limits

## Prerequisites

Before running this application, ensure you have:

- Node.js 18+ installed
- Python 3 with pip
- FFmpeg installed on your system
- yt-dlp installed (`pip install yt-dlp`)

## Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

2. Install dependencies:
```bash
npm install
```

3. Install system dependencies:
```bash
# Install yt-dlp
pip3 install yt-dlp

# FFmpeg should already be installed, but if not:
# Ubuntu/Debian: sudo apt install ffmpeg
# macOS: brew install ffmpeg
```

## Usage

### Running Locally

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Enter a YouTube URL and specify your desired clip times:
   - **Start Time**: When the clip should begin (e.g., `0:30` or `30` for 30 seconds)
   - **End Time**: When the clip should end (e.g., `1:30` or `90` for 90 seconds)
   - Leave either blank to clip from the start or to the end

4. Click "Create Clip" and wait for processing (usually 30-60 seconds)

5. Download your clip!

### Time Format Examples

- Seconds: `30`, `90`, `120`
- MM:SS format: `1:30`, `2:45`
- HH:MM:SS format: `0:01:30`, `0:02:45`

## How It Works

1. **Video Download**: Uses yt-dlp to download the YouTube video in high quality (up to 1080p)
2. **Video Processing**: Uses FFmpeg to extract the specified time segment
3. **Delivery**: Streams the processed clip directly to your browser for download

## 📱 Deploy to Use from Your iPhone

Want to access this from your phone? **See [DEPLOY.md](./DEPLOY.md) for step-by-step instructions!**

The easiest options:
- **Railway** - $5/month free credit, best for regular use
- **Render** - Completely free (app sleeps when inactive)

Both support all the tools needed (yt-dlp, ffmpeg) and will give you a public URL you can access from any device.

## Production Deployment

The included `Dockerfile` makes deployment easy. Recommended platforms:

1. **Railway** (Recommended) - Auto-detects Dockerfile, free tier available
2. **Render** - Docker support, generous free tier
3. **Google Cloud Run** - Pay per use
4. **AWS ECS** - More advanced setup

**Note**: This app requires FFmpeg and yt-dlp, which are automatically installed via the Dockerfile.

## Tips for Content Creators

- **Instagram Reels**: Keep clips under 90 seconds
- **TikTok**: Aim for 15-60 second clips
- **YouTube Shorts**: Keep clips under 60 seconds
- For best quality, download from source videos with high resolution

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Video Processing**: FFmpeg, yt-dlp

## Limitations

- Processing time depends on video length and your server's resources
- Very long videos may take longer to process
- Download speeds depend on YouTube's servers

## License

MIT License - feel free to use this for your content creation!

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

---

Built for creators who want to clip videos without subscription fees or limits.
