import { MessageCircle, ShieldCheck, Users } from "lucide-react";

import type { VotingMethod } from "@/lib/types/voting-method";

interface VotingMethodCardProps {
  method: VotingMethod;
  title: string;
  steps: readonly string[];
  note: string;
  buttonLabel: string;
  onVote: (method: VotingMethod, trigger: HTMLButtonElement) => void;
}

export function VotingMethodCard({
  method,
  title,
  steps,
  note,
  buttonLabel,
  onVote,
}: VotingMethodCardProps) {
  const Icon = method === "facebook" ? Users : MessageCircle;

  return (
    <article className="section-card flex h-full flex-col p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#eee5f5] text-[#5f3d88]">
          <Icon aria-hidden="true" size={24} />
        </span>
        <h3 className="text-xl font-extrabold tracking-tight">{title}</h3>
      </div>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-[1.02rem] leading-7 text-[#3f4a61]">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f9dce4] text-sm font-extrabold text-[#8f3150]">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex items-start gap-2 rounded-2xl bg-[#f7f2fa] p-4 text-sm leading-6 text-[#4f4260]">
        <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-[#5f3d88]" size={19} />
        <p>{note}</p>
      </div>
      <button
        type="button"
        className="primary-button mt-6 w-full"
        onClick={(event) => onVote(method, event.currentTarget)}
      >
        <Icon aria-hidden="true" size={20} />
        {buttonLabel}
      </button>
    </article>
  );
}
