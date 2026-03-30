import type { EventMember } from '@/lib/types';

// Props型を定義
type Props = {
  member: EventMember[];
};

export function JoinMember({ member }: Props) {
  return (
    <div className="mb-8">
      <h3 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0">
        参加者
      </h3>
      <ul className="list-disc list-inside">
        {member.map((m) => (
          <li key={m.id}>{m.userNickname}</li>
        ))}
      </ul>
    </div>
  );
}