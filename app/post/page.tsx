"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Platform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';

interface PlatformInfo {
  name: string;
  icon: string;
  color: string;
  maxDuration: number;
  description: string;
}

const platforms: Record<Platform, PlatformInfo> = {
  instagram: {
    name: "Instagram Reels",
    icon: "📸",
    color: "from-pink-500 to-purple-500",
    maxDuration: 90,
    description: "Perfect for 15-90 second engaging clips",
  },
  tiktok: {
    name: "TikTok",
    icon: "🎵",
    color: "from-black to-cyan-500",
    maxDuration: 60,
    description: "Best for 15-60 second viral content",
  },
  youtube: {
    name: "YouTube Shorts",
    icon: "▶️",
    color: "from-red-500 to-red-600",
    maxDuration: 60,
    description: "Upload shorts up to 60 seconds",
  },
  twitter: {
    name: "Twitter/X",
    icon: "🐦",
    color: "from-blue-400 to-blue-500",
    maxDuration: 140,
    description: "Share video clips with your followers",
  },
  facebook: {
    name: "Facebook",
    icon: "👥",
    color: "from-blue-600 to-blue-700",
    maxDuration: 240,
    description: "Post to your Facebook page or profile",
  },
};

export default function PostPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set());
  const [caption, setCaption] = useState("");
  const [showInstructions, setShowInstructions] = useState<Platform | null>(null);

  const togglePlatform = (platform: Platform) => {
    const newSelection = new Set(selectedPlatforms);
    if (newSelection.has(platform)) {
      newSelection.delete(platform);
    } else {
      newSelection.add(platform);
    }
    setSelectedPlatforms(newSelection);
  };

  const handlePost = async (platform: Platform) => {
    setShowInstructions(platform);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              📱 Post to Social Media
            </CardTitle>
            <CardDescription className="text-center text-base">
              Share your clips across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Select Platforms to Post:
              </Label>
              
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(platforms).map(([key, platform]) => {
                  const platformKey = key as Platform;
                  const isSelected = selectedPlatforms.has(platformKey);
                  
                  return (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                      onClick={() => togglePlatform(platformKey)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePlatform(platformKey)}
                            className="w-5 h-5 mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{platform.icon}</span>
                              <h3 className="font-bold text-lg">{platform.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {platform.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Max: {platform.maxDuration}s
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption" className="text-base font-medium">
                Caption / Description
              </Label>
              <textarea
                id="caption"
                placeholder="Write your caption here... Add hashtags for better reach! #viral #trending"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-xs text-muted-foreground">
                💡 Tip: Use relevant hashtags to increase visibility
              </p>
            </div>

            {selectedPlatforms.size > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Ready to post to:</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedPlatforms).map((platform) => (
                    <Button
                      key={platform}
                      onClick={() => handlePost(platform)}
                      className={`bg-gradient-to-r ${platforms[platform].color} hover:opacity-90`}
                    >
                      {platforms[platform].icon} Post to {platforms[platform].name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {showInstructions && (
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {platforms[showInstructions].icon} {platforms[showInstructions].name} - Posting Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">📋 Quick Steps:</h4>
                    {showInstructions === 'instagram' && (
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Download your clip (click Download button)</li>
                        <li>Open Instagram app on your phone</li>
                        <li>Tap '+' button → Select 'Reels'</li>
                        <li>Choose the downloaded video</li>
                        <li>Add your caption and hashtags</li>
                        <li>Tap 'Share' to post!</li>
                      </ol>
                    )}
                    {showInstructions === 'tiktok' && (
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Download your clip</li>
                        <li>Open TikTok app</li>
                        <li>Tap '+' button at the bottom</li>
                        <li>Select 'Upload' and choose your video</li>
                        <li>Add effects, text, and sounds</li>
                        <li>Add caption and hashtags</li>
                        <li>Post!</li>
                      </ol>
                    )}
                    {showInstructions === 'youtube' && (
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Download your clip</li>
                        <li>Go to YouTube.com or open YouTube app</li>
                        <li>Click 'Create' → 'Upload video'</li>
                        <li>Select your clip</li>
                        <li>If under 60s, it will be a Short automatically</li>
                        <li>Add title and description</li>
                        <li>Click 'Publish'</li>
                      </ol>
                    )}
                    {showInstructions === 'twitter' && (
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Download your clip</li>
                        <li>Go to Twitter.com or open app</li>
                        <li>Click 'Tweet' button</li>
                        <li>Click the media icon and select your video</li>
                        <li>Write your caption</li>
                        <li>Click 'Tweet'!</li>
                      </ol>
                    )}
                    {showInstructions === 'facebook' && (
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Download your clip</li>
                        <li>Go to Facebook.com or open app</li>
                        <li>Click 'What\'s on your mind?'</li>
                        <li>Click 'Photo/Video' and upload your clip</li>
                        <li>Add your caption</li>
                        <li>Click 'Post'</li>
                      </ol>
                    )}
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">📝 Your Caption:</h4>
                    <p className="text-sm italic">{caption || "(No caption added yet)"}</p>
                  </div>

                  <Button
                    onClick={() => setShowInstructions(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Close Instructions
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Best posting times are 6-9 AM and 5-8 PM
          </p>
          <a
            href="/auto-clip"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline block"
          >
            ← Back to Auto-Clip Generator
          </a>
        </div>
      </div>
    </div>
  );
}
