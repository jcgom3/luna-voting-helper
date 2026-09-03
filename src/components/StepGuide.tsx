import { ExternalLink } from "lucide-react";

import { officialLinks } from "@/config/officialLinks";

interface StepGuideProps {
  heading: string;
  steps: readonly string[];
  stepLabel: string;
  buttonLabel: string;
}

export function StepGuide({ heading, steps, stepLabel, buttonLabel }: StepGuideProps) {
  return (
    <section className="section-wrap py-10" aria-labelledby="profile-walkthrough-heading">
      <div className="section-card p-6 sm:p-10">
        <h2 id="profile-walkthrough-heading" className="section-title text-center">{heading}</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step} className="rounded-2xl border border-[#e4dce9] bg-[#fffafc] p-5">
              <span className="eyebrow">{stepLabel} {index + 1}</span>
              <p className="mt-3 text-base font-semibold leading-7 text-[#354159]">{step}</p>
            </li>
          ))}
        </ol>
        <div className="mt-7 text-center">
          <a className="primary-button" href={officialLinks.profileVote}>
            {buttonLabel}
            <ExternalLink aria-hidden="true" size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
