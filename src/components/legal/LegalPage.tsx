/** Shared shell for the Terms and Privacy pages. */
export function LegalPage({ title, updated, intro, sections }: { title: string; updated: string; intro: string; sections: { heading: string; body?: string; list?: string[] }[] }) {
  return (
    <div className="wrap pb-24 pt-12 sm:pt-[70px]">
      <h1 className="h-page">{title}</h1>
      <p className="mt-3 text-[18px] text-mute">Last updated: {updated}</p>
      <div className="prose-doc mt-12 max-w-[760px]">
        <p>{intro}</p>
        {sections.map((s, i) => (
          <section key={s.heading}>
            <h3 className="!mt-10 !text-[20px]">
              {i + 1}. {s.heading}
            </h3>
            {s.body ? <p>{s.body}</p> : null}
            {s.list ? (
              <ul>
                {s.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
