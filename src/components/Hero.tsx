"use client";

import { ExternalLink, Heart, MessageCircle, Users } from "lucide-react";
import type { MouseEvent } from "react";

import { LunaPhotoCarousel } from "@/components/LunaPhotoCarousel";
import { officialLinks } from "@/config/officialLinks";
import type { TranslationDictionary } from "@/lib/translations/en";
import type { VotingMethod } from "@/lib/types/voting-method";

interface HeroProps {
  copy: TranslationDictionary["hero"];
  onVote: (method: VotingMethod, trigger: HTMLButtonElement) => void;
}

export function Hero({ copy, onVote }: HeroProps) {
  const chooseMethod =
    (method: VotingMethod) => (event: MouseEvent<HTMLButtonElement>) =>
      onVote(method, event.currentTarget);

  return (
    <section className="section-wrap grid items-center gap-8 py-12 md:grid-cols-[1.05fr_.95fr] md:py-20">
      <div className="order-2 text-center md:order-1 md:text-left">
        <p className="eyebrow mb-3">{copy.eyebrow}</p>
        <h1 className="text-[clamp(2.5rem,8vw,5.25rem)] font-black leading-[.94] tracking-[-0.055em] text-[#17243d]">
          {copy.heading}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#566078] md:mx-0 md:text-xl">
          {copy.supporting}
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button type="button" className="primary-button w-full" onClick={chooseMethod("facebook")}>
            <Users aria-hidden="true" size={21} />
            {copy.voteFacebook}
          </button>
          <button
            type="button"
            className="primary-button w-full border-[#a83f60] bg-[#a83f60] hover:bg-[#8f3150]"
            onClick={chooseMethod("text")}
          >
            <MessageCircle aria-hidden="true" size={21} />
            {copy.voteText}
          </button>
        </div>
        <a className="secondary-button mt-3 w-full sm:w-auto" href={officialLinks.profile}>
          {copy.seeProfile}
          <ExternalLink aria-hidden="true" size={18} />
        </a>
        <div className="mx-auto mt-5 flex max-w-xl items-start gap-2 text-left text-sm leading-6 text-[#566078] md:mx-0">
          <Heart aria-hidden="true" className="mt-0.5 shrink-0 text-[#d45d79]" size={18} />
          <p>{copy.helper}</p>
        </div>
        <p className="mt-2 text-xs text-[#697187]">{copy.leavingGuide}</p>
      </div>

      <div className="order-1 mx-auto w-full max-w-md md:order-2">
        <LunaPhotoCarousel copy={copy} />
      </div>
    </section>
  );
}
