type SectionHeadProps = {
  kicker: string;
  title: string;
  note?: string;
};

export function SectionHead({ kicker, title, note }: SectionHeadProps) {
  return (
    <header className="sechead">
      <p className="sechead__kicker mono">{kicker}</p>
      <h2 className="sechead__title">{title}</h2>
      {note ? <p className="sechead__note">{note}</p> : null}
    </header>
  );
}
