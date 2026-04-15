import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookUser,
  ChevronDown,
  CircleHelp,
  History,
  Wallet,
  WalletCards,
} from 'lucide-react';
import type { LearningSection } from '@/lib/learning-guide';

/** Same icons as the sidebar for each walkthrough section. */
const sectionIcons: Record<string, LucideIcon> = {
  dashboard: Wallet,
  wallets: WalletCards,
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  history: History,
  contacts: BookUser,
};

function LearningSectionSummaryTitle({ sectionId, title }: { sectionId: string; title: string }) {
  const Icon = sectionIcons[sectionId] ?? CircleHelp;
  return (
    <span className="flex min-w-0 flex-1 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-emerald-300">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h2 className="min-w-0 text-xl font-semibold text-white">{title}</h2>
    </span>
  );
}

function StepText({ children }: { children: string }) {
  const parts = children.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-emerald-200">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function BeginnerLearningWalkthrough({ sections }: { sections: LearningSection[] }) {
  return (
    <div className="space-y-6">
      <div>
        <span className="badge">Beginner walkthrough</span>
        <h1 className="mt-3 text-3xl font-bold">Learning</h1>
        <div className="mt-2 min-w-0 overflow-x-auto">
          <p className="whitespace-nowrap text-slate-400">
            Follow these sections in order. Each one matches a tab in the sidebar so you always know where to click next.
          </p>
        </div>
      </div>

      <ol className="space-y-4">
        {sections.map((section) => (
          <li key={section.id} className="list-none">
            <details className="group card overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 marker:hidden [&::-webkit-details-marker]:hidden">
                <LearningSectionSummaryTitle sectionId={section.id} title={section.title} />
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="border-t border-slate-800 px-6 pb-6 pt-4">
                <p className="text-sm leading-relaxed text-slate-300">{section.summary}</p>
                <ul className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-300">
                  {section.steps.map((step, stepIndex) => (
                    <li key={`${section.id}-${stepIndex}`}>
                      <StepText>{step}</StepText>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function NonBeginnerLearningNotice({ roleLabel }: { roleLabel: string }) {
  return (
    <div className="space-y-6">
      <div>
        <span className="badge">Learning</span>
        <h1 className="mt-3 text-3xl font-bold">Guided tutorials</h1>
        <p className="mt-2 max-w-2xl text-slate-400">Step-by-step sidebar tutorials are enabled for accounts with the <strong className="text-slate-200">Beginner trader</strong> profile. Your current role is <strong className="text-slate-200">{roleLabel}</strong>. Use the sidebar to move around the app as usual; if you need walkthroughs, update your profile type where you manage your account (for example at registration or through your team&apos;s process).</p>
      </div>
      <div className="card p-6 text-sm text-slate-400">
        Nothing else to show here yet for this role.
      </div>
    </div>
  );
}
