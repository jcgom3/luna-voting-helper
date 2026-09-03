export const officialLinks = {
  profile: "https://babyoftheyear.org/2026/luna-917f",
  profileVote: "https://babyoftheyear.org/2026/luna-917f#vote",
  freeVoteOptions: "https://babyoftheyear.org/vote/options/2026/luna-917f",
  facebookVerification:
    "https://babyoftheyear.org/connect/facebook/luna-917f",
  textVerification: "https://babyoftheyear.org/vote/verify/2026/luna-917f",
  rules: "https://babyoftheyear.org/rules",
  support: "https://babyoftheyear.org/support",
} as const;

export type OfficialLinkKey = keyof typeof officialLinks;
