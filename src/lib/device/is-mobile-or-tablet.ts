interface BrowserNavigator {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
  userAgentData?: {
    mobile?: boolean;
  };
}

const MOBILE_OR_TABLET_USER_AGENT_PATTERN =
  /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|BlackBerry|BB10|Opera Mini|Mobile|Mobi|Tablet|Kindle|Silk|PlayBook/i;

export function isMobileOrTabletDevice(
  providedNavigator?: BrowserNavigator,
): boolean {
  const currentNavigator =
    providedNavigator ??
    (typeof navigator !== "undefined"
      ? (navigator as BrowserNavigator)
      : null);

  if (!currentNavigator) {
    return false;
  }

  /*
   * Chromium-based browsers expose this hint on supported devices.
   * A true value confirms that the device is mobile.
   *
   * A false value does not necessarily mean desktop because tablets
   * may report false, so tablet detection must continue below.
   */
  if (currentNavigator.userAgentData?.mobile === true) {
    return true;
  }

  const userAgent = currentNavigator.userAgent ?? "";
  const platform = currentNavigator.platform ?? "";
  const maxTouchPoints =
    currentNavigator.maxTouchPoints ?? 0;

  /*
   * Newer iPads can identify themselves as macOS devices.
   * MacIntel combined with multiple touch points identifies this
   * iPad desktop-style user-agent behavior.
   */
  const isModernIPad =
    platform === "MacIntel" && maxTouchPoints > 1;

  if (isModernIPad) {
    return true;
  }

  return MOBILE_OR_TABLET_USER_AGENT_PATTERN.test(
    userAgent,
  );
}