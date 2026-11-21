import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { unlink, readFile, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import os from "os";

const execAsync = promisify(exec);

export const maxDuration = 600; // 10 minutes for batch processing

interface ClipRequest {
  startTime: number;
  endTime: number;
  id: string;
}

export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];

  try {
    const body = await request.json();
    const { youtubeUrl, clips } = body;

    if (!youtubeUrl || !clips || !Array.isArray(clips) || clips.length === 0) {
      return NextResponse.json(
        { error: "YouTube URL and clips array are required" },
        { status: 400 }
      );
    }

    const tempDir = os.tmpdir();
    const randomId = crypto.randomBytes(16).toString("hex");
    const downloadedFile = path.join(tempDir, `batch-${randomId}.mp4`);

    tempFiles.push(downloadedFile);

    console.log("Downloading video...");
    const ytDlpPath = "/home/ubuntu/.local/bin/yt-dlp";
    
    const downloadCmd = `${ytDlpPath} -f "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${downloadedFile}" "${youtubeUrl}"`;
    
    try {
      await execAsync(downloadCmd, { maxBuffer: 100 * 1024 * 1024 });
    } catch (error) {
      console.error("yt-dlp error:", error);
      return NextResponse.json(
        { error: "Failed to download video" },
        { status: 500 }
      );
    }

    console.log("Creating clips...");

    const generatedClips = [];

    // Process each clip
    for (let i = 0; i < Math.min(clips.length, 5); i++) {
      const clip = clips[i];
      const outputFile = path.join(tempDir, `clip-${randomId}-${i}.mp4`);
      tempFiles.push(outputFile);

      const duration = clip.endTime - clip.startTime;

      // Generate clip with FFmpeg
      const ffmpegCmd = `ffmpeg -i "${downloadedFile}" -ss ${clip.startTime} -t ${duration} -c:v libx264 -c:a aac -strict experimental "${outputFile}"`;

      try {
        await execAsync(ffmpegCmd, { maxBuffer: 100 * 1024 * 1024 });
        
        // Read the clip file
        const clipBuffer = await readFile(outputFile);
        const base64Clip = clipBuffer.toString('base64');

        generatedClips.push({
          id: clip.id,
          data: base64Clip,
          filename: `clip-${i + 1}.mp4`,
          size: clipBuffer.length,
          duration: duration,
        });

        console.log(`Generated clip ${i + 1}/${clips.length}`);
      } catch (error) {
        console.error(`Error creating clip ${i}:`, error);
      }
    }

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
      clips: generatedClips,
      message: `Generated ${generatedClips.length} clips`,
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

    console.error("Error creating batch clips:", error);
    return NextResponse.json(
      { error: "An error occurred while creating clips" },
      { status: 500 }
    );
  }
}
