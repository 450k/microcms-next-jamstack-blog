import { EventCard } from '@/components/eventcard';

export default async function Home() {
  return (
    <>
      <h2 className="scroll-m-20 text-center text-3xl font-bold tracking-tight text-balance mb-6">
      練習会一覧
    </h2>
    <h3 className="scroll-m-20 text-center text-lg font-medium tracking-tight mb-8 ">
      参加希望あれば連絡ください。
    </h3>
      <EventCard />
    </>
  );
}
