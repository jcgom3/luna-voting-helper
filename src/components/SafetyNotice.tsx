import { LockKeyhole } from "lucide-react";

interface SafetyNoticeProps {
  heading: string;
  items: readonly string[];
}

export function SafetyNotice({ heading, items }: SafetyNoticeProps) {
  return (
    <section className="section-wrap py-10" aria-labelledby="privacy-heading">
      <div className="rounded-[1.5rem] border border-[#c8b6d6] bg-[#f4edf8] p-6 sm:p-9">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-white text-[#5f3d88]">
            <LockKeyhole aria-hidden="true" size={23} />
          </span>
          <h2 id="privacy-heading" className="text-2xl font-extrabold tracking-tight">{heading}</h2>
        </div>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="flex gap-3 leading-7 text-[#423650]">
              <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-[#7d5ba6]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
