// components/tennisoff-url.tsx

type Props = {
  tennisOffUrl: string;
};

export function TennisOffUrl({ tennisOffUrl }: Props) {
  return (
    <div className="tennisoff-url-link mb-8">
      <h3 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
        テニスオフで募集中
      </h3>
      <p>
        <a href={tennisOffUrl} target="_blank" rel="noopener noreferrer">
          {tennisOffUrl}
        </a>
      </p>
    </div>
  );
}