import { describe, expect, it } from "vitest";

import { isMobileOrTabletDevice } from "@/lib/device/is-mobile-or-tablet";

describe("mobile and tablet detection", () => {
  it.each([
    {
      name: "iPhone",
      navigator: {
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      },
    },
    {
      name: "Android phone",
      navigator: {
        userAgent:
          "Mozilla/5.0 (Linux; Android 16; Pixel 10 Pro) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36",
      },
    },
    {
      name: "Android tablet",
      navigator: {
        userAgent:
          "Mozilla/5.0 (Linux; Android 16; Pixel Tablet) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
      },
    },
    {
      name: "traditional iPad",
      navigator: {
        userAgent:
          "Mozilla/5.0 (iPad; CPU OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      },
    },
    {
      name: "modern iPad using desktop user agent",
      navigator: {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.6 Safari/605.1.15",
        platform: "MacIntel",
        maxTouchPoints: 5,
      },
    },
    {
      name: "Kindle Fire",
      navigator: {
        userAgent:
          "Mozilla/5.0 (Linux; U; en-US) AppleWebKit/533.1 Silk/120.4 Safari/533.1",
      },
    },
  ])(
    "classifies $name as mobile or tablet",
    ({ navigator }) => {
      expect(
        isMobileOrTabletDevice(navigator),
      ).toBe(true);
    },
  );

  it.each([
    {
      name: "Mac",
      navigator: {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.6 Safari/605.1.15",
        platform: "MacIntel",
        maxTouchPoints: 0,
      },
    },
    {
      name: "Windows computer",
      navigator: {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
        platform: "Win32",
        maxTouchPoints: 0,
      },
    },
    {
      name: "Linux computer",
      navigator: {
        userAgent:
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
        platform: "Linux x86_64",
        maxTouchPoints: 0,
      },
    },
  ])(
    "classifies $name as a computer",
    ({ navigator }) => {
      expect(
        isMobileOrTabletDevice(navigator),
      ).toBe(false);
    },
  );

  it("uses client hints when mobile is explicitly true", () => {
    expect(
      isMobileOrTabletDevice({
        userAgent: "desktop-looking-user-agent",
        userAgentData: {
          mobile: true,
        },
      }),
    ).toBe(true);
  });

  it("continues checking for tablets when client hints reports false", () => {
    expect(
      isMobileOrTabletDevice({
        userAgent:
          "Mozilla/5.0 (Linux; Android 16; Pixel Tablet)",
        userAgentData: {
          mobile: false,
        },
      }),
    ).toBe(true);
  });

  it("returns false for an unidentified device", () => {
    expect(
      isMobileOrTabletDevice({
        userAgent: "",
      }),
    ).toBe(false);
  });
});