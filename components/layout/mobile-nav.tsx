import { requireSession, roleLabels } from '@/lib/session';
import { MobileNavClient } from './mobile-nav-client';

/** Async server component: fetches the session then renders the client nav. */
export async function MobileNav() {
  const session = await requireSession();
  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'DEVELOPER';

  return (
    <MobileNavClient
      username={session.user.username}
      roleLabel={roleLabels[session.user.role]}
      isAdmin={isAdmin}
    />
  );
}
