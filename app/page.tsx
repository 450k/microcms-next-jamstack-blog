import { Eventcard } from '@/components/card';

export default async function Home() {
  return (
    <>
      <h2 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance mb-12">
      スケジュール
    </h2>
    <h3 className="scroll-m-20 text-center text-xl font-semibold tracking-tight mb-4">
      参加希望ありましたら連絡ください。
    </h3>
    <p className='mb-8 text-center'>直前キャンセルされたコートを拾っているので、1週間前にコートが取れることが多いです。<br />直前エントリーOKです。</p>
      <Eventcard />
    </>
  );
}
