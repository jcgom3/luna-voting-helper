import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { VotingGuide } from "@/components/VotingGuide";
import { isMobileOrTabletDevice } from "@/lib/device/is-mobile-or-tablet";
import { navigateToOfficialVoting } from "@/lib/reminder/navigation";

vi.mock("@/lib/device/is-mobile-or-tablet", () => ({
  isMobileOrTabletDevice: vi.fn(),
}));

vi.mock("@/lib/reminder/navigation", () => ({
  navigateToOfficialVoting: vi.fn(),
}));

describe("VotingGuide", () => {
  beforeEach(() => {
    localStorage.clear();

    document.cookie =
      "lunaVote.lang=; max-age=0; path=/";
    document.cookie =
      "lunaVote.langManual=; max-age=0; path=/";

    vi.clearAllMocks();

    // Reminder-flow tests simulate a phone or tablet.
    vi.mocked(
      isMobileOrTabletDevice,
    ).mockReturnValue(true);
  });

  it.each([
    "Vote Free with Facebook",
    "Vote Free by Text (U.S. Only)",
  ])(
    "opens the reminder sheet on mobile from %s",
    (buttonName) => {
      render(<VotingGuide initialLanguage="en" />);

      fireEvent.click(
        screen.getAllByRole("button", {
          name: buttonName,
        })[0],
      );

      expect(
        screen.getByRole("dialog", {
          name: "Remember to vote again",
        }),
      ).toBeInTheDocument();

      expect(
        navigateToOfficialVoting,
      ).not.toHaveBeenCalled();
    },
  );

  it.each([
    [
      "Vote Free with Facebook",
      "facebook",
    ],
    [
      "Vote Free by Text (U.S. Only)",
      "text",
    ],
  ] as const)(
    "bypasses reminders on a computer from %s",
    (buttonName, expectedMethod) => {
      vi.mocked(
        isMobileOrTabletDevice,
      ).mockReturnValue(false);

      render(<VotingGuide initialLanguage="en" />);

      fireEvent.click(
        screen.getAllByRole("button", {
          name: buttonName,
        })[0],
      );

      expect(
        screen.queryByRole("dialog"),
      ).not.toBeInTheDocument();

      expect(
        navigateToOfficialVoting,
      ).toHaveBeenCalledTimes(1);

      expect(
        navigateToOfficialVoting,
      ).toHaveBeenCalledWith(expectedMethod);

      expect(
        localStorage.getItem(
          "lunaVote.lastMethodClick",
        ),
      ).toBeNull();
    },
  );

  it("switches all primary content to Spanish", () => {
    render(<VotingGuide initialLanguage="en" />);

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Español",
      })[0],
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Vota por Luna Love",
      }),
    ).toBeInTheDocument();

    expect(
      document.documentElement.lang,
    ).toBe("es");
  });
});