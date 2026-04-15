import { AppShell } from '@/components/layout/app-shell';
import { requireSession, roleLabels } from '@/lib/session';

export default async function SettingsPage() {
  const session = await requireSession();

  return (
    <AppShell>
      <div>
        <span className="badge">Security first</span>
        <h1 className="mt-3 text-3xl font-bold">Wallet settings</h1>
        <p className="mt-2 text-slate-400">
          Signed in as {session.user.username} ({roleLabels[session.user.role]}).
        </p>
      </div>
      <div className="card p-6">
        <ul className="space-y-3 text-slate-300">
          <li>• Auto-lock after inactivity</li>
          <li>• Export encrypted backup</li>
          <li>• Enable email notifications</li>
          <li>• Update password / passphrase</li>
        </ul>
      </div>
    </AppShell>
  );
}
