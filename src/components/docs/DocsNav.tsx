"use client";

import { useEffect, useState } from "react";

/** Sticky section list that follows the reader down the page. */
export function DocsNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const targets = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [sections]);
  return (
    <nav aria-label="On this page" className="sticky top-[100px] hidden max-h-[calc(100vh-120px)] overflow-y-auto lg:block">
      <ul className="grid gap-0.5">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className={`block rounded-[6px] px-3 py-2 text-[14px] transition-colors ${active === s.id ? "bg-white/[0.06] font-medium text-ink" : "text-ink-3 hover:text-ink"}`}>
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
