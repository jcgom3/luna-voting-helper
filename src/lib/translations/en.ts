export const en = {
  meta: {
    title: "Vote for Luna Love",
    description:
      "A simple family guide to cast your free daily vote for Luna Love on the official Baby of the Year website.",
  },
  header: {
    logo: "Vote for Luna",
    languageEnglish: "English",
    languageSpanish: "Español",
  },
  hero: {
    eyebrow: "Baby of the Year 2026",
    heading: "Vote for Luna Love",
    supporting: "Your free daily vote takes about one minute.",
    voteFacebook: "Vote Free with Facebook",
    voteText: "Vote Free by Text (U.S. Only)",
    seeProfile: "See Luna’s Official Profile",
    helper:
      "Voting and verification happen securely on the official Baby of the Year website.",
    leavingGuide:
      "You are leaving this guide and opening the official Baby of the Year or Facebook website.",
    lunaPhotoAlt: "Photo of Luna Love",
    lunaPhotoPlaceholder: "Luna Love photo coming soon",
    carouselLabel: "Luna Love photo carousel",
    carouselPrevious: "Previous photo",
    carouselNext: "Next photo",
    carouselNavigation: "Choose a photo",
    carouselGoTo: "Show photo {number}",
    carouselPosition: "Photo {current} of {total}",
  },
  chooseOption: {
    heading: "Choose the easiest option",
    facebookTitle: "Vote with Facebook",
    facebookSteps: [
      "Tap “Vote Free with Facebook.”",
      "Sign in to Facebook if requested.",
      "Continue with the Facebook verification.",
      "Return to Baby of the Year and continue until the vote confirmation appears.",
    ],
    facebookSafety:
      "Only enter your Facebook information when the address bar shows facebook.com.",
    textTitle: "Vote by text message (U.S. phone numbers only)",
    textSteps: [
      "Tap “Vote Free by Text.”",
      "Enter your name and United States mobile number on the official voting page.",
      "Tap “Send Confirmation.”",
      "Enter the confirmation code received by text.",
      "Continue until the vote confirmation appears.",
    ],
    textNote:
      "Text verification works only with United States phone numbers. If you are outside the United States, including Colombia, use Facebook verification to cast your free vote. Message and data rates may apply.",
  },
  profileWalkthrough: {
    heading: "Start from Luna’s official profile",
    steps: [
      "Open Luna’s official profile.",
      "Tap “VOTE.”",
      "Select “1 VOTE — FREE.”",
      "Choose “Verify with FB.” Use “Verify by Text” only if you have a United States phone number.",
    ],
    openProfile: "Open Luna’s Official Profile",
  },
  freeVoteReminder: {
    heading: "Free daily vote",
    text: "You can cast one free vote every 24 hours. You do not need to pay to use the daily free vote.",
  },
  estimatedNextVote: {
    message: "Your next free vote should be available around {time}.",
    estimateLabel: "Estimate only",
    estimateExplanation:
      "This estimate is based on when you last opened a voting method from this guide. It does not confirm whether your vote was completed.",
    dismiss: "Got it",
  },
  reminderSheet: {
    heading: "Remember to vote again",
    text: "Create a calendar reminder every 24 hours for the next 8 days.",
    addAndContinue: "Add Reminders and Continue",
    continueWithout: "Continue Without Reminders",
    helper:
      "Your device will ask you to add or save the reminders to your calendar.",
    accuracyNotice:
      "Reminder times are based on when you opened the voting method. Make sure a full 24 hours has passed since you completed your previous vote.",
    continueToVote: "Continue to Vote",
    existingSchedule:
      "You already have reminder information saved for this guide. First reminder around {time}.",
    downloadAgain: "Download Reminders Again",
    clearLocal: "Clear local reminder information",
    clearLocalSuccess:
      "Local reminder information cleared. Any calendar events you already imported stay on your device.",
    tryAgain: "Try Again",
    calendarError:
      "We could not create the calendar file. You can still continue to vote.",
    close: "Close",
  },
  troubleshooting: {
    heading: "Troubleshooting",
    items: [
      {
        question: "Why can’t I vote again?",
        answer:
          "A full 24 hours may not have passed since your previous free vote.",
      },
      {
        question: "The voting page is not working.",
        answer: "Try Safari, Chrome, another browser, or another device.",
      },
      {
        question: "Is this the official voting website?",
        answer:
          "No. This is an independent family-created guide. Votes are recorded only on babyoftheyear.org.",
      },
    ],
  },
  privacy: {
    heading: "Privacy and safety",
    items: [
      "This guide does not request or store names, phone numbers, passwords, or confirmation codes.",
      "Facebook credentials should only be entered on facebook.com.",
      "Phone and confirmation information should only be entered on babyoftheyear.org.",
      "Voting is completed entirely on the official website.",
      "The only locally stored information is your language preference and non-personal reminder information.",
    ],
  },
  footer: {
    profile: "Luna’s official profile",
    rules: "Official competition rules",
    support: "Official support",
    disclaimer:
      "This is an independent family-created voting guide and is not affiliated with or operated by Baby of the Year, Colossal, Facebook, or Meta.",
    externalLink: "Opens official website in this tab",
  },
  share: {
    button: "Share This Guide",
    title: "Vote for Luna Love",
    text: "Simple guide to cast a free daily vote for Luna Love.",
    copied: "Guide link copied.",
    error: "Could not share the guide link.",
  },
  common: {
    step: "Step",
    externalSite: "External site",
  },
} as const;

type DeepWiden<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly DeepWiden<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: DeepWiden<T[K]> }
      : T;

export type TranslationDictionary = DeepWiden<typeof en>;