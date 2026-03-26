// Props型を定義
type Props = {
  member: string[];
};

export function JoinMember({ member }: Props) {
  return (
    <div className="mb-8">
      <h3 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0">
        参加者
      </h3>
      <ul>
        {member.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
    </div>
  );
}