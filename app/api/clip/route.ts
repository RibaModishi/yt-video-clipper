import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { unlink, readFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import os from "os";

const execAsync = promisify(exec);

export const maxDuration = 300;

function parseTimeToSeconds(time: string): string {
  if (!time || time.trim() === "") {
    return "";
  }

  if (/^\d+$/.test(time)) {
    return time;
  }

  const parts = time.split(":").map((p) => parseInt(p, 10));
  
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return String(hours * 3600 + minutes * 60 + seconds);
  } else if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return String(minutes * 60 + seconds);
  } else if (parts.length === 1) {
    return String(parts[0]);
  }

  return time;
}

export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];

  try {
    const body = await request.json();
    const { youtubeUrl, startTime, endTime } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!urlPattern.test(youtubeUrl)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    const tempDir = os.tmpdir();
    const randomId = crypto.randomBytes(16).toString("hex");
    const downloadedFile = path.join(tempDir, `video-${randomId}.mp4`);
    const outputFile = path.join(tempDir, `clip-${randomId}.mp4`);

    tempFiles.push(downloadedFile, outputFile);

    console.log("Downloading video from YouTube...");
    const ytDlpPath = "/home/ubuntu/.local/bin/yt-dlp";
    
    const downloadCmd = `${ytDlpPath} -f "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${downloadedFile}" "${youtubeUrl}"`;
    
    try {
      await execAsync(downloadCmd, { maxBuffer: 50 * 1024 * 1024 });
    } catch (error) {
      console.error("yt-dlp error:", error);
      return NextResponse.json(
        { error: "Failed to download video. Please check the URL and try again." },
        { status: 500 }
      );
    }

    console.log("Video downloaded successfully");

    const startSeconds = parseTimeToSeconds(startTime);
    const endSeconds = parseTimeToSeconds(endTime);

    let ffmpegCmd = "ffmpeg -i " + `"${downloadedFile}"`;

    if (startSeconds) {
      ffmpegCmd += ` -ss ${startSeconds}`;
    }

    if (endSeconds) {
      if (startSeconds) {
        const duration = parseInt(endSeconds) - parseInt(startSeconds);
        ffmpegCmd += ` -t ${duration}`;
      } else {
        ffmpegCmd += ` -to ${endSeconds}`;
      }
    }

    ffmpegCmd += ` -c:v libx264 -c:a aac -strict experimental "${outputFile}"`;

    console.log("Clipping video with ffmpeg...");
    
    try {
      await execAsync(ffmpegCmd, { maxBuffer: 50 * 1024 * 1024 });
    } catch (error) {
      console.error("ffmpeg error:", error);
      return NextResponse.json(
        { error: "Failed to process video clip" },
        { status: 500 }
      );
    }

    console.log("Video clipped successfully");

    const videoBuffer = await readFile(outputFile);

    for (const file of tempFiles) {
      try {
        await unlink(file);
      } catch (err) {
        console.error(`Failed to delete temp file ${file}:`, err);
      }
    }

    return new NextResponse(videoBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="clip-${randomId}.mp4"`,
      },
    });
  } catch (error) {
    for (const file of tempFiles) {
      try {
        await unlink(file);
      } catch (err) {
        console.error(`Failed to delete temp file ${file}:`, err);
      }
    }

    console.error("Error processing video:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the video" },
      { status: 500 }
    );
  }
}
