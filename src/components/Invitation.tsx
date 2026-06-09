import { SectionHeader } from './SectionHeader';

type InvitationProps = {
  messages: string[];
};

export function Invitation({ messages }: InvitationProps) {
  return (
    <section className="section invitation">
      <SectionHeader eyebrow="Invitation" title="소중한 분들을 초대합니다" />
      <div className="invitation__message">
        {messages.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </section>
  );
}
