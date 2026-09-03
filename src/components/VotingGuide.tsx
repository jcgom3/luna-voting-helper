"use client";

import { Clock3, Heart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { EstimatedNextVote } from "@/components/EstimatedNextVote";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ReminderSheet } from "@/components/ReminderSheet";
import { SafetyNotice } from "@/components/SafetyNotice";
import { ShareGuide } from "@/components/ShareGuide";
import { StepGuide } from "@/components/StepGuide";
import { Troubleshooting } from "@/components/Troubleshooting";
import { VotingMethodCard } from "@/components/VotingMethodCard";
import { persistLanguagePreference } from "@/lib/language/persist";
import { readReminderState, recordVotingMethodClick, type ReminderState } from "@/lib/reminder/storage";
import { getTranslations } from "@/lib/translations";
import type { Language } from "@/lib/types/language";
import type { VotingMethod } from "@/lib/types/voting-method";

interface VotingGuideProps {
  initialLanguage: Language;
}

export function VotingGuide({ initialLanguage }: VotingGuideProps) {
  const [language, setLanguage] = useState(initialLanguage);
  const [method, setMethod] = useState<VotingMethod | null>(null);
  const [clickedAt, setClickedAt] = useState<Date | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderState, setReminderState] = useState<ReminderState | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const copy = getTranslations(language);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setReminderState(readReminderState());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.meta.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute("content", copy.meta.description);
  }, [copy.meta.description, copy.meta.title, language]);

  const changeLanguage = useCallback((nextLanguage: Language) => {
    setLanguage(nextLanguage);
    persistLanguagePreference(nextLanguage, true);
  }, []);

  const chooseVotingMethod = useCallback((nextMethod: VotingMethod, trigger: HTMLButtonElement) => {
    const now = new Date();
    triggerRef.current = trigger;
    recordVotingMethodClick(nextMethod, now);
    setReminderState(readReminderState());
    setMethod(nextMethod);
    setClickedAt(now);
    setReminderOpen(true);
  }, []);

  const closeReminder = useCallback(() => {
    setReminderOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  return (
    <div className="page-shell min-h-screen">
      <a href="#main-content" className="fixed left-3 top-3 z-[60] -translate-y-24 rounded-full bg-white px-4 py-3 font-bold text-[#5f3d88] shadow-lg focus:translate-y-0">
        {language === "es" ? "Ir al contenido" : "Skip to content"}
      </a>
      <header className="sticky top-0 z-40 border-b border-[#e6dce9]/80 bg-[#fffaf5]/90 backdrop-blur-xl">
        <div className="section-wrap flex min-h-18 items-center justify-between gap-3 py-3">
          <a href="#main-content" className="flex min-h-11 items-center gap-2 font-black tracking-tight text-[#5f3d88]">
            <Heart aria-hidden="true" className="fill-[#d45d79] text-[#d45d79]" size={20} />
            <span className="hidden sm:inline">{copy.header.logo}</span>
            <span className="sm:hidden">Luna</span>
          </a>
          <LanguageToggle language={language} englishLabel={copy.header.languageEnglish} spanishLabel={copy.header.languageSpanish} onChange={changeLanguage} />
        </div>
      </header>

      <main id="main-content">
        <Hero copy={copy.hero} onVote={chooseVotingMethod} />
        <EstimatedNextVote language={language} copy={copy.estimatedNextVote} reminderState={reminderState} />

        <section className="section-wrap py-12" aria-labelledby="choose-method-heading">
          <h2 id="choose-method-heading" className="section-title text-center">{copy.chooseOption.heading}</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <VotingMethodCard
              method="facebook"
              title={copy.chooseOption.facebookTitle}
              steps={copy.chooseOption.facebookSteps}
              note={copy.chooseOption.facebookSafety}
              buttonLabel={copy.hero.voteFacebook}
              onVote={chooseVotingMethod}
            />
            <VotingMethodCard
              method="text"
              title={copy.chooseOption.textTitle}
              steps={copy.chooseOption.textSteps}
              note={copy.chooseOption.textNote}
              buttonLabel={copy.hero.voteText}
              onVote={chooseVotingMethod}
            />
          </div>
        </section>

        <StepGuide heading={copy.profileWalkthrough.heading} steps={copy.profileWalkthrough.steps} stepLabel={copy.common.step} buttonLabel={copy.profileWalkthrough.openProfile} />

        <section className="section-wrap py-6" aria-labelledby="daily-vote-heading">
          <div className="flex items-start gap-4 rounded-[1.5rem] bg-[#5f3d88] p-6 text-white shadow-xl sm:p-8">
            <Clock3 aria-hidden="true" className="mt-1 shrink-0" size={30} />
            <div>
              <h2 id="daily-vote-heading" className="text-2xl font-black">{copy.freeVoteReminder.heading}</h2>
              <p className="mt-2 text-lg leading-8 text-[#f4ebfb]">{copy.freeVoteReminder.text}</p>
            </div>
          </div>
        </section>

        <Troubleshooting copy={copy.troubleshooting} />
        <SafetyNotice heading={copy.privacy.heading} items={copy.privacy.items} />
        <section className="section-wrap py-8"><ShareGuide copy={copy.share} /></section>
      </main>

      <Footer language={language} copy={copy} onLanguageChange={changeLanguage} />
      <ReminderSheet
        key={`${method ?? "none"}-${clickedAt?.toISOString() ?? "closed"}`}
        open={reminderOpen}
        language={language}
        method={method}
        clickedAt={clickedAt}
        reminderState={reminderState}
        copy={copy.reminderSheet}
        onClose={closeReminder}
        onStateChange={setReminderState}
      />
    </div>
  );
}
