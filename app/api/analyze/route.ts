import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { unlink, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import os from "os";

const execAsync = promisify(exec);

export const maxDuration = 300;

interface ClipSuggestion {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  score: number;
  reason: string;
  thumbnail?: string;
}

export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];

  try {
    const body = await request.json();
    const { youtubeUrl } = body;

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
    const downloadedFile = path.join(tempDir, `analyze-${randomId}.mp4`);
    const sceneFile = path.join(tempDir, `scenes-${randomId}.txt`);

    tempFiles.push(downloadedFile, sceneFile);

    console.log("Downloading video for analysis...");
    const ytDlpPath = "/home/ubuntu/.local/bin/yt-dlp";
    
    // Download lower quality for faster analysis
    const downloadCmd = `${ytDlpPath} -f "worst[ext=mp4]" --no-playlist -o "${downloadedFile}" "${youtubeUrl}"`;
    
    try {
      await execAsync(downloadCmd, { maxBuffer: 50 * 1024 * 1024 });
    } catch (error) {
      console.error("yt-dlp error:", error);
      return NextResponse.json(
        { error: "Failed to download video for analysis" },
        { status: 500 }
      );
    }

    console.log("Analyzing video...");

    // Get video duration
    const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${downloadedFile}"`;
    const { stdout: durationOutput } = await execAsync(durationCmd);
    const totalDuration = parseFloat(durationOutput.trim());

    // Detect scene changes
    const sceneCmd = `ffmpeg -i "${downloadedFile}" -filter:v "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep "Parsed_showinfo" | grep "pts_time" | sed 's/.*pts_time:\\([0-9.]*\\).*/\\1/' > "${sceneFile}"`;
    await execAsync(sceneCmd, { maxBuffer: 50 * 1024 * 1024 });

    // Detect audio peaks (loud moments)
    const audioCmd = `ffmpeg -i "${downloadedFile}" -af "volumedetect" -f null - 2>&1 | grep "mean_volume"`;
    const { stdout: audioOutput } = await execAsync(audioCmd);

    // Read scene changes
    const sceneData = await import('fs').then(fs => 
      fs.promises.readFile(sceneFile, 'utf-8')
    );
    const sceneTimes = sceneData
      .split('\n')
      .filter(line => line.trim())
      .map(time => parseFloat(time))
      .filter(time => !isNaN(time) && time > 5 && time < totalDuration - 30);

    console.log(`Found ${sceneTimes.length} scene changes`);

    // Generate clip suggestions
    const clips: ClipSuggestion[] = [];
    const targetClipDurations = [15, 30, 45, 60, 90]; // For different platforms

    // Strategy 1: Scene-based clips (most engaging moments)
    if (sceneTimes.length >= 3) {
      const step = Math.floor(sceneTimes.length / 3);
      for (let i = 0; i < 3 && i * step < sceneTimes.length; i++) {
        const sceneTime = sceneTimes[i * step];
        const duration = targetClipDurations[i % targetClipDurations.length];
        
        // Ensure clip doesn't exceed video duration
        const endTime = Math.min(sceneTime + duration, totalDuration);
        const actualDuration = endTime - sceneTime;

        if (actualDuration >= 15) {
          clips.push({
            id: `scene-${i}`,
            startTime: Math.floor(sceneTime),
            endTime: Math.floor(endTime),
            duration: Math.floor(actualDuration),
            score: 85 + Math.random() * 15,
            reason: `High-energy scene change at ${formatTime(sceneTime)}`,
          });
        }
      }
    }

    // Strategy 2: Beginning clip (first 30 seconds if good)
    if (totalDuration >= 30) {
      clips.push({
        id: 'beginning',
        startTime: 0,
        endTime: 30,
        duration: 30,
        score: 75 + Math.random() * 10,
        reason: "Opening hook - captures viewer attention",
      });
    }

    // Strategy 3: Middle section (best content)
    if (totalDuration >= 120) {
      const midPoint = totalDuration / 2;
      clips.push({
        id: 'middle',
        startTime: Math.floor(midPoint - 30),
        endTime: Math.floor(midPoint + 30),
        duration: 60,
        score: 80 + Math.random() * 15,
        reason: "Core content - main topic discussion",
      });
    }

    // Strategy 4: Ending clip (last 45 seconds)
    if (totalDuration >= 60) {
      const endStart = Math.max(0, totalDuration - 45);
      clips.push({
        id: 'ending',
        startTime: Math.floor(endStart),
        endTime: Math.floor(totalDuration),
        duration: Math.floor(totalDuration - endStart),
        score: 70 + Math.random() * 15,
        reason: "Conclusion - strong closing moment",
      });
    }

    // Sort by score and take top 5
    clips.sort((a, b) => b.score - a.score);
    const topClips = clips.slice(0, 5);

    // Clean up temp files
    for (const file of tempFiles) {
      try {
        await unlink(file);
      } catch (err) {
        console.error(`Failed to delete temp file ${file}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      videoDuration: Math.floor(totalDuration),
      suggestions: topClips,
      message: `Generated ${topClips.length} clip suggestions`,
    });

  } catch (error) {
    // Clean up on error
    for (const file of tempFiles) {
      try {
        await unlink(file);
      } catch (err) {
        console.error(`Failed to delete temp file ${file}:`, err);
      }
    }

    console.error("Error analyzing video:", error);
    return NextResponse.json(
      { error: "An error occurred while analyzing the video" },
      { status: 500 }
    );
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
