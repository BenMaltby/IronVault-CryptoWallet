export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-16">
      <div className="card w-full p-6">
        <h1 className="text-2xl font-bold">Create account</h1>
        <form className="mt-6 grid gap-4">
          <input className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Username" />
          <input type="email" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Email" />
          <input type="password" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Password" />
          <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950">Register</button>
        </form>
      </div>
    </main>
  );
}
