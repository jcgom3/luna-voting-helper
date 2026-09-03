import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { VotingGuide } from "@/components/VotingGuide";

describe("VotingGuide", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "lunaVote.lang=; max-age=0; path=/";
    document.cookie = "lunaVote.langManual=; max-age=0; path=/";
  });

  it.each(["Vote Free with Facebook", "Vote Free by Text (U.S. Only)"])(
    "opens the reminder sheet from %s",
    (buttonName) => {
      render(<VotingGuide initialLanguage="en" />);
      fireEvent.click(screen.getAllByRole("button", { name: buttonName })[0]);
      expect(
        screen.getByRole("dialog", { name: "Remember to vote again" }),
      ).toBeInTheDocument();
    },
  );

  it("switches all primary content to Spanish", () => {
    render(<VotingGuide initialLanguage="en" />);
    fireEvent.click(screen.getAllByRole("button", { name: "Español" })[0]);
    expect(
      screen.getByRole("heading", { level: 1, name: "Vota por Luna Love" }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("es");
  });
});
