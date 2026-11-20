// 管理者のLINEへプッシュ通知
export async function pushToAdmin(text: string) {
  try {
    await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: process.env.LINE_USER_ID,
        messages: [{ type: 'text', text }],
      }),
    });
  } catch (error) {
    console.error('Failed to push LINE message to admin:', error);
  }
}
