import type { UserRole } from '@prisma/client';

/** One sidebar destination — add the next entry when you are ready. */
export type LearningSection = {
  id: string;
  /** Matches the label in the sidebar (for consistency). */
  navLabel: string;
  title: string;
  /** Short plain-language goal for a beginner. */
  summary: string;
  steps: string[];
};

/** Ordered like the sidebar (excluding Learning & Admin). Extend one section at a time. */
export const beginnerSections: LearningSection[] = [
  {
    id: 'dashboard',
    navLabel: 'Dashboard',
    title: 'Dashboard',
    summary:
      'After you sign in, Dashboard is your home base: a snapshot of wallets, balances, and recent activity so you know where you stand before sending or receiving.',
    steps: [
      'In the **left sidebar**, click **Dashboard** (wallet icon). The page opens in the main area on the right.',
      'At the top you will see a short line about your account type — that is normal and helps the app tailor hints.',
      'The **wallet summary** shows the wallets you have. You can expand or skim them to see which wallet holds what.',
      '**Summary cards** give quick numbers (for example total value and pending items). Use them as a quick health check.',
      'The **asset table** lists coins or tokens and amounts. That is where you confirm what you actually hold.',
      '**Recent transactions** at the bottom shows the latest sends and receives. Open **History** in the sidebar when you need the full list.',
      'When you are ready to move money, use **Send** or **Receive** in the sidebar.',
    ],
  },
  {
    id: 'wallets',
    navLabel: 'Wallets',
    title: 'Wallets',
    summary:
      'The Wallets screen is where you see every wallet on your account, inspect addresses, and use the tools to create a new wallet, import one with a recovery phrase, or move encrypted backups in and out.',
    steps: [
      'In the **left sidebar**, click **Wallets** (stacked-cards icon). The page title is **Create and manage wallets** — use it whenever you need to add or review wallets, not only the first time.',
      'On the left (or on top on smaller screens) you will see **Your wallets**: each card shows the **wallet name**, **network** (for example Ethereum Sepolia), and every **address** with its label. Read those addresses carefully before you share them or send funds.',
      'On the right you will see a card with four actions as tabs: **Create wallet**, **Import by phrase**, **Export backup**, and **Import backup**. Only one panel is active at a time — click the tab you need.',
      '**Create wallet**: enter a name, pick a **test network** (Ethereum Sepolia, Polygon Amoy, or Base Sepolia), and a **passphrase** you will remember. After submit, the app may show a **recovery phrase** — write it down somewhere safe offline; treat it like a master password for that wallet.',
      '**Import by phrase**: use this when you already have a 12- or 24-word recovery phrase from another wallet. You still choose a name, network, and passphrase for how IronVault stores it in this prototype.',
      '**Export backup** / **Import backup**: these work with an **encrypted JSON backup** plus passwords you set in the form. Use them to move a wallet between devices in a controlled way — never email the raw backup or share passwords in chat.',
      'When you are done here, use **Send** or **Receive** from the sidebar to use an address, or return to **Dashboard** for the big picture.',
    ],
  },
];

export function showBeginnerLearning(role: UserRole): boolean {
  return role === 'BEGINNER_TRADER';
}
