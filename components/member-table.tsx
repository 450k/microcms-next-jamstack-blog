'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Button } from '@/components/ui/button';
import { approveMember, rejectMember, deleteMember } from '@/app/admin/actions';

dayjs.extend(utc);
dayjs.extend(timezone);

export type Member = {
  line_user_id: string;
  display_name: string | null;
  name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

type Action = 'approve' | 'reject' | 'delete';

type Props = {
  title: string;
  members: Member[];
  actions: Action[];
};

const actionConfig = {
  approve: { label: '承認', action: approveMember, variant: 'default', confirm: null },
  reject: { label: '却下', action: rejectMember, variant: 'outline', confirm: 'このメンバーを却下しますか？' },
  delete: { label: '削除', action: deleteMember, variant: 'destructive', confirm: 'このメンバーを削除しますか？\n（次回エントリー時に再び承認待ちになります）' },
} as const;

export function MemberTable({ title, members, actions }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="m-0 text-xl font-semibold">{title}（{members.length}名）</h3>
      {members.length === 0 ? (
        <p className="m-0 text-sm text-gray-500">該当するメンバーはいません。</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">名前</th>
              <th className="border p-2 text-left">LINE名</th>
              <th className="border p-2 text-left">申請日時</th>
              <th className="border p-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.line_user_id}>
                <td className="border p-2">{member.name ?? '-'}</td>
                <td className="border p-2">{member.display_name ?? '-'}</td>
                <td className="border p-2">{dayjs(member.created_at).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm')}</td>
                <td className="border p-2">
                  <div className="flex gap-2">
                    {actions.map((key) => {
                      const config = actionConfig[key];
                      return (
                        <form
                          key={key}
                          action={config.action}
                          onSubmit={(e) => {
                            if (config.confirm && !window.confirm(config.confirm)) e.preventDefault();
                          }}
                        >
                          <input type="hidden" name="lineUserId" value={member.line_user_id} />
                          <Button type="submit" size="sm" variant={config.variant}>
                            {config.label}
                          </Button>
                        </form>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
