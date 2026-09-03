import { officialLinks } from "@/config/officialLinks";
import type { VotingMethod } from "@/lib/types/voting-method";

export function getOfficialVotingUrl(method: VotingMethod): string {
  return method === "facebook"
    ? officialLinks.facebookVerification
    : officialLinks.textVerification;
}

export function navigateToOfficialVoting(method: VotingMethod): void {
  window.location.assign(getOfficialVotingUrl(method));
}
