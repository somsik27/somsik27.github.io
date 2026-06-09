type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
};

export function SectionHeader({ eyebrow, title }: SectionHeaderProps) {
  return (
    <header className="section-header">
      {eyebrow ? <p className="section-header__eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
    </header>
  );
}
