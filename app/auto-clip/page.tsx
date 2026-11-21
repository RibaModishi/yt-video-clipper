"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ClipSuggestion {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  score: number;
  reason: string;
}

interface GeneratedClip {
  id: string;
  data: string;
  filename: string;
  size: number;
  duration: number;
}

export default function AutoClipPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<ClipSuggestion[]>([]);
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());
  const [generatedClips, setGeneratedClips] = useState<GeneratedClip[]>([]);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError("");
    setSuggestions([]);
    setProgress(10);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ youtubeUrl }),
      });

      setProgress(50);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze video");
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
      setProgress(100);
      
      // Auto-select all suggestions
      const allIds = new Set(data.suggestions.map((s: ClipSuggestion) => s.id));
      setSelectedClips(allIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleClipSelection = (id: string) => {
    const newSelection = new Set(selectedClips);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedClips(newSelection);
  };

  const handleGenerateClips = async () => {
    if (selectedClips.size === 0) {
      setError("Please select at least one clip");
      return;
    }

    setIsGenerating(true);
    setError("");
    setProgress(10);

    try {
      const clipsToGenerate = suggestions.filter(s => selectedClips.has(s.id));

      const response = await fetch("/api/batch-clip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          youtubeUrl,
          clips: clipsToGenerate,
        }),
      });

      setProgress(80);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate clips");
      }

      const data = await response.json();
      setGeneratedClips(data.clips);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadClip = (clip: GeneratedClip) => {
    const link = document.createElement('a');
    link.href = `data:video/mp4;base64,${clip.data}`;
    link.download = clip.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-6xl space-y-6">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              🤖 AI Auto-Clip Generator
            </CardTitle>
            <CardDescription className="text-center text-base">
              Automatically detect and create the best clips from any YouTube video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-6">
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
                  disabled={isAnalyzing || isGenerating}
                  className="h-11"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {(isAnalyzing || isGenerating) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{isAnalyzing ? "Analyzing video..." : "Generating clips..."}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button
                type="submit"
                disabled={isAnalyzing || isGenerating || !youtubeUrl}
                className="w-full h-11 text-base font-medium bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"
              >
                {isAnalyzing ? "Analyzing..." : "🔍 Analyze & Find Best Clips"}
              </Button>
            </form>

            {suggestions.length > 0 && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    📊 Suggested Clips ({suggestions.length})
                  </h3>
                  <Button
                    onClick={handleGenerateClips}
                    disabled={selectedClips.size === 0 || isGenerating}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    ✨ Generate {selectedClips.size} Clip{selectedClips.size !== 1 ? 's' : ''}
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {suggestions.map((suggestion) => (
                    <Card
                      key={suggestion.id}
                      className={`cursor-pointer transition-all ${
                        selectedClips.has(suggestion.id)
                          ? 'ring-2 ring-violet-600 bg-violet-50 dark:bg-violet-900/20'
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                      onClick={() => toggleClipSelection(suggestion.id)}
                    >
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedClips.has(suggestion.id)}
                              onChange={() => toggleClipSelection(suggestion.id)}
                              className="w-4 h-4"
                            />
                            <span className="font-semibold text-lg">
                              {suggestion.duration}s clip
                            </span>
                          </div>
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                            {Math.round(suggestion.score)}% match
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            ⏱️ {formatTime(suggestion.startTime)} → {formatTime(suggestion.endTime)}
                          </p>
                          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
                            {suggestion.reason}
                          </p>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Perfect for: {
                            suggestion.duration <= 15 ? "TikTok, IG Reels" :
                            suggestion.duration <= 30 ? "All platforms" :
                            suggestion.duration <= 60 ? "YouTube Shorts, IG" :
                            "IG Reels (90s)"
                          }
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {generatedClips.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-semibold">
                  🎬 Generated Clips ({generatedClips.length})
                </h3>

                <div className="grid gap-4">
                  {generatedClips.map((clip, index) => (
                    <Card key={clip.id} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-lg">
                              📹 Clip {index + 1} - {clip.duration}s
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Size: {formatSize(clip.size)}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => downloadClip(clip)}
                              variant="outline"
                              className="border-2"
                            >
                              ⬇️ Download
                            </Button>
                            <Button
                              onClick={() => {
                                // Navigate to social media posting
                                window.location.href = `/post?clipId=${clip.id}`;
                              }}
                              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                            >
                              📱 Post to Social
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
          >
            ← Back to Manual Clipper
          </a>
        </div>
      </div>
    </div>
  );
}
