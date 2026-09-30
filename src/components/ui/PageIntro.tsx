/** Page header used by the app pages: eyebrow, title, lead and an optional action on the right. */
export function PageIntro({ eyebrow, title, lead, action, children }: { eyebrow?: React.ReactNode; title: React.ReactNode; lead?: React.ReactNode; action?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 pt-12 sm:pt-[70px] lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-[760px]">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="h-page mt-4">{title}</h1>
        {lead ? <p className="mt-4 text-[17px] leading-[1.6] text-mute sm:text-[18px]">{lead}</p> : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
