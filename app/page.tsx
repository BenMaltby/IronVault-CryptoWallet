import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-6 py-16">
      <div className="max-w-3xl">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-emerald-300">IronVault</p>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">A safe, student-friendly crypto wallet MVP.</h1>
        <p className="mt-6 text-lg text-slate-300">
          This starter uses Next.js, TypeScript, Prisma, MongoDB, and a mock wallet service so your team can build the core flows first: register, create wallet, portfolio, send, receive, and transaction history.
        </p>
      </div>
      <div className="flex gap-4">
        <Button href="/dashboard">Open dashboard</Button>
        <Button href="/register" className="bg-slate-100 text-slate-950 hover:bg-white">Create demo account</Button>
      </div>
    </main>
  );
}
