type SectionHeadProps = {
  kicker: string;
  title: string;
  note?: string;
  id?: string;
};

export function SectionHead({ kicker, title, note, id }: SectionHeadProps) {
  return (
    <header className="sechead">
      <p className="sechead__kicker mono">{kicker}</p>
      <h2 className="sechead__title" id={id}>{title}</h2>
      {note ? <p className="sechead__note">{note}</p> : null}
    </header>
  );
}
