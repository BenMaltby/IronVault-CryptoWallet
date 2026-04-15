import { requireSession, roleLabels } from '@/lib/session';
import { MobileDrawer } from '@/components/layout/mobile-drawer';

export async function MobileHeader() {
  const session = await requireSession();
  const isPrivileged =
    session.user.role === 'ADMIN' || session.user.role === 'DEVELOPER';

  return (
    <MobileDrawer
      username={session.user.username}
      roleLabel={roleLabels[session.user.role]}
      isPrivileged={isPrivileged}
    />
  );
}
