import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

interface SocialMediaPost {
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
  videoData: string; // base64
  caption: string;
  credentials?: {
    accessToken?: string;
    apiKey?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, videoData, caption, credentials } = body as SocialMediaPost;

    if (!platform || !videoData) {
      return NextResponse.json(
        { error: "Platform and video data are required" },
        { status: 400 }
      );
    }

    // For now, return instructions on how to post to each platform
    // In production, you would integrate with each platform's API
    
    const postingInfo = getPostingInstructions(platform);

    return NextResponse.json({
      success: true,
      platform,
      status: "ready_to_post",
      instructions: postingInfo,
      message: `Clip prepared for ${platform}. Follow the instructions to complete posting.`,
      downloadUrl: `data:video/mp4;base64,${videoData}`,
    });

  } catch (error) {
    console.error("Error preparing social media post:", error);
    return NextResponse.json(
      { error: "An error occurred while preparing the post" },
      { status: 500 }
    );
  }
}

function getPostingInstructions(platform: string) {
  const instructions: Record<string, any> = {
    instagram: {
      method: "Manual Upload",
      steps: [
        "1. Download the clip from the provided link",
        "2. Open Instagram app on your phone",
        "3. Tap '+' → Reels",
        "4. Select the downloaded video",
        "5. Add caption and hashtags",
        "6. Tap 'Share'",
      ],
      apiInfo: "Instagram Graph API requires Facebook Business Account",
      requirements: [
        "Facebook Page connected",
        "Instagram Business Account",
        "Access Token from Facebook Developer",
      ],
      setupGuide: "https://developers.facebook.com/docs/instagram-api",
    },
    tiktok: {
      method: "Manual Upload",
      steps: [
        "1. Download the clip",
        "2. Open TikTok app",
        "3. Tap '+' button",
        "4. Upload your video",
        "5. Add captions and effects",
        "6. Post",
      ],
      apiInfo: "TikTok API requires developer account approval",
      requirements: [
        "TikTok Developer Account",
        "App approval (2-4 weeks)",
        "Access Token",
      ],
      setupGuide: "https://developers.tiktok.com",
    },
    youtube: {
      method: "Manual Upload",
      steps: [
        "1. Download the clip",
        "2. Go to YouTube.com",
        "3. Click 'Create' → 'Upload video'",
        "4. Select 'Shorts' if under 60 seconds",
        "5. Add title and description",
        "6. Publish",
      ],
      apiInfo: "YouTube Data API v3 (Free tier available)",
      requirements: [
        "Google Cloud Project",
        "YouTube Data API enabled",
        "OAuth 2.0 credentials",
      ],
      setupGuide: "https://developers.google.com/youtube/v3",
    },
    twitter: {
      method: "Manual Upload or API",
      steps: [
        "1. Download the clip",
        "2. Go to Twitter.com",
        "3. Click 'Tweet'",
        "4. Add your video",
        "5. Write caption",
        "6. Tweet",
      ],
      apiInfo: "Twitter API v2 (Free tier: 50 tweets/month)",
      requirements: [
        "Twitter Developer Account",
        "Bearer Token",
        "API v2 access",
      ],
      setupGuide: "https://developer.twitter.com/en/docs/twitter-api",
    },
    facebook: {
      method: "Manual Upload",
      steps: [
        "1. Download the clip",
        "2. Go to Facebook.com",
        "3. Click 'Create Post'",
        "4. Upload video",
        "5. Add caption",
        "6. Post",
      ],
      apiInfo: "Facebook Graph API",
      requirements: [
        "Facebook Developer Account",
        "Page Access Token",
        "publish_video permission",
      ],
      setupGuide: "https://developers.facebook.com/docs/graph-api",
    },
  };

  return instructions[platform] || { error: "Platform not supported" };
}
