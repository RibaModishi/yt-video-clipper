"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");
    setDownloadUrl("");
    setProgress(10);

    try {
      const response = await fetch("/api/clip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          youtubeUrl,
          startTime,
          endTime,
        }),
      });

      setProgress(50);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process video");
      }

      setProgress(80);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `clip-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            YouTube Video Clipper
          </CardTitle>
          <CardDescription className="text-center text-base">
            Create clips from YouTube videos - completely free!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="youtube-url" className="text-base font-medium">
                YouTube URL
              </Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
                disabled={isProcessing}
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time" className="text-base font-medium">
                  Start Time
                </Label>
                <Input
                  id="start-time"
                  type="text"
                  placeholder="00:00:00 or 0"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isProcessing}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Format: HH:MM:SS or seconds
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time" className="text-base font-medium">
                  End Time
                </Label>
                <Input
                  id="end-time"
                  type="text"
                  placeholder="00:01:00 or 60"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={isProcessing}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Format: HH:MM:SS or seconds
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Processing your clip...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={isProcessing || !youtubeUrl}
                className="flex-1 h-11 text-base font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isProcessing ? "Processing..." : "Create Clip"}
              </Button>

              {downloadUrl && (
                <Button
                  type="button"
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1 h-11 text-base font-medium border-2"
                >
                  Download Clip
                </Button>
              )}
            </div>
          </form>

          <div className="mt-8 pt-6 border-t space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">How to use:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">1.</span>
                  <span>Paste any YouTube video URL</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">2.</span>
                  <span>Set start and end times (leave empty to clip from start/to end)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">3.</span>
                  <span>Click &quot;Create Clip&quot; and download your video!</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-violet-100 to-pink-100 dark:from-violet-900/20 dark:to-pink-900/20 rounded-lg border-2 border-violet-200 dark:border-violet-800">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-violet-900 dark:text-violet-100">
                    🤖 Try AI Auto-Clip Generator!
                  </h3>
                  <p className="text-sm text-violet-700 dark:text-violet-300">
                    Let AI find and create the best clips automatically
                  </p>
                </div>
                <a
                  href="/auto-clip"
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all whitespace-nowrap"
                >
                  Try Now →
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
