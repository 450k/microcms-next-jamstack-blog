import { EventCard } from '@/components/eventcard';

export default async function Home() {
  return (
    <>
      <h2 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance mb-12">
      スケジュール
    </h2>
    <h3 className="scroll-m-20 text-center text-xl font-semibold tracking-tight mb-4">
      参加希望ありましたら連絡ください。
    </h3>
      <EventCard />
    </>
  );
}
