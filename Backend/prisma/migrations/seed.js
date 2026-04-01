import prisma from "../prisma/client.js";

const seedCampaigns = async () => {
  try {
    await prisma.campaign.createMany({
      data: [
        {
          name: "Spotify Viral Music Campaign",
          email: "spotify@brand.com",
          company: "Spotify",
          details: "Promote new trending songs",

          totalBudget: 50000,
          remainingBudget: 50000,
          ratePerMillion: 8000,

          type: "MUSIC",
          allowedPlatforms: ["YOUTUBE", "INSTAGRAM"],

          thumbnail: "https://picsum.photos/200/300?1",
          bannerImage: "https://picsum.photos/800/300?1",
          description: "Create reels using Spotify trending audio",

          maxSubmissions: 5,
          maxSubmissionsPerAccount: 1,
          maxEarnings: 10000,
          maxEarningsPerPost: 3000,

          status: "ACTIVE"
        },

        {
          name: "NVIDIA Gaming Shorts Challenge",
          email: "nvidia@gaming.com",
          company: "NVIDIA",
          details: "Showcase gaming performance",

          totalBudget: 100000,
          remainingBudget: 100000,
          ratePerMillion: 12000,

          type: "GAMING",
          allowedPlatforms: ["YOUTUBE"],

          thumbnail: "https://picsum.photos/200/300?2",
          bannerImage: "https://picsum.photos/800/300?2",
          description: "Upload your best gaming clips",

          maxSubmissions: 3,
          maxSubmissionsPerAccount: 1,
          maxEarnings: 20000,
          maxEarningsPerPost: 7000,

          status: "ACTIVE"
        },

        {
          name: "Instagram Reel Boost Campaign",
          email: "meta@brand.com",
          company: "Meta",
          details: "Promote Instagram reels",

          totalBudget: 30000,
          remainingBudget: 30000,
          ratePerMillion: 6000,

          type: "BRAND",
          allowedPlatforms: ["INSTAGRAM"],

          thumbnail: "https://picsum.photos/200/300?3",
          bannerImage: "https://picsum.photos/800/300?3",
          description: "Create engaging reels using new features",

          maxSubmissions: 4,
          maxSubmissionsPerAccount: 1,
          maxEarnings: 8000,
          maxEarningsPerPost: 2500,

          status: "ACTIVE"
        },

        {
          name: "YouTube Shorts Viral Clips",
          email: "yt@google.com",
          company: "Google",
          details: "Create viral short videos",

          totalBudget: 80000,
          remainingBudget: 80000,
          ratePerMillion: 10000,

          type: "CLIP",
          allowedPlatforms: ["YOUTUBE"],

          thumbnail: "https://picsum.photos/200/300?4",
          bannerImage: "https://picsum.photos/800/300?4",
          description: "Make engaging YouTube Shorts",

          maxSubmissions: 6,
          maxSubmissionsPerAccount: 2,
          maxEarnings: 15000,
          maxEarningsPerPost: 5000,

          status: "ACTIVE"
        },

        {
          name: "Startup Product Awareness",
          email: "startup@brand.com",
          company: "StartupX",
          details: "Promote new startup product",

          totalBudget: 10000,
          remainingBudget: 10000,
          ratePerMillion: 5000,

          type: "BRAND",
          allowedPlatforms: ["INSTAGRAM", "YOUTUBE"],

          thumbnail: "https://picsum.photos/200/300?5",
          bannerImage: "https://picsum.photos/800/300?5",
          description: "Create content around product awareness",

          maxSubmissions: 2,
          maxSubmissionsPerAccount: 1,
          maxEarnings: 3000,
          maxEarningsPerPost: 1500,

          status: "ACTIVE"
        }
      ]
    });

    console.log("✅ Campaigns seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding campaigns:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedCampaigns();