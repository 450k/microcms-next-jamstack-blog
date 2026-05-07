import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サイトの利用方法 | TTC 練習会スケジュール",
  description: "練習会エントリーの手順とLINE友だち追加方法を説明します。",
};

export default function UsagePage() {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">サイトの利用方法</h1>

      <div className="prose mb-8 text-lg leading-8">
        <p>練習会のエントリー手順をご案内します。<br/>
        <span className="text-sm text-red-600">※エントリー時LINEログインが必要ですが、当サイトではLINEへの登録情報は取得しません。</span></p>
      </div>

      <ol className="list-decimal space-y-4 pl-6 text-base leading-8">
        <li>一覧から参加希望の練習会の詳細ページへ移動してください。</li>
        <li>名前を入力し、エントリーボタンをクリックします。</li>
        <li>LINEのログイン画面に移動します。</li>
        <li>LINEに登録されているメールアドレスとパスワードでログインしてください。</li>
        <li>エントリー完了です。詳細ページに名前が表示されているかご確認ください。<br/><span className="text-sm text-red-600">※登録完了の通知は届きません。</span></li>
        <div>～（※以下は任意です）～</div>
        <li>下のQRコードを読み取るか <a href="https://line.me/R/ti/p/%40144wfgqn" target="_blank" rel="noreferrer" className="text-blue-500"><code>@144wfgqn</code></a> を検索し、「Toda Tennis Circle」を友だち追加してください。</li>
        <li>練習会の2日前に通知が届きます。</li>
        <li>ブラウザのお気に入り追加、スマートフォンのホーム画面にショートカット追加をお願いします。</li>
      </ol>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <p className="mb-4 text-lg font-semibold">QRコードで友だち追加</p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="w-full max-w-xs rounded-2xl border bg-white p-4 shadow-sm">
            <img
              src="/img/usage-qr.png"
              alt="Toda Tennis Circle LINE QRコード"
              className="h-72 w-full object-contain"
            />
          </div>
          <div className="max-w-xl text-sm leading-6 text-slate-700">
            <p>QRコードが表示されない場合は、LINEで次のIDを検索して友だち追加してください。</p>
            <p className="mt-3 font-semibold">LINE ID: @144wfgqn</p>
            <p className="mt-3">友だち追加後、練習会の2日前にリマインド通知が届きます。</p>
          </div>
        </div>
      </div>
    </article>
  );
}
