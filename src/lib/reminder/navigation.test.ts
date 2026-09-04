import {
  describe,
  expect,
  it,
} from "vitest";

import { getOfficialVotingUrl } from "@/lib/reminder/navigation";

describe("official voting navigation", () => {
  it("maps Facebook voting to Luna's official Facebook verification route", () => {
    expect(
      getOfficialVotingUrl("facebook"),
    ).toBe(
      "https://babyoftheyear.org/connect/facebook/luna-917f",
    );
  });

  it("maps text voting to Luna's official phone verification route", () => {
    expect(
      getOfficialVotingUrl("text"),
    ).toBe(
      "https://babyoftheyear.org/vote/verify/2026/luna-917f",
    );
  });
});