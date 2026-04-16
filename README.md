# IronVault

Repository for the **IronVault** crypto wallet.

## Stack

- **Next.js (App Router) + React + TypeScript** for the web app and API routes
- **Node.js runtime** through Next.js route handlers
- **MongoDB + Prisma** for non-sensitive application data
- **Tailwind CSS** for styling
- Optional later: `viem` or `ethers` for real blockchain integrations on **testnets only**

## Why this stack

The reports already lean towards a browser-based React front end, a Node.js backend, and MongoDB for non-sensitive data. We explicitly say sensitive information like private keys and recovery phrases should **not** be stored on the backend in plaintext, and that the prototype should keep complexity small and focus on core features first.

## Important security note

This is a **prototype starter**, not a production wallet. We are not using this code to hold real assets. This Build and demo is only used against **testnets**.

## Quick start

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

MongoDB Atlas `DATABASE_URL` must include a database name after `.net/`, for example:

```bash
DATABASE_URL="mongodb+srv://<username>:<password>@cluster-name.mongodb.net/ironvault?retryWrites=true&w=majority"
```