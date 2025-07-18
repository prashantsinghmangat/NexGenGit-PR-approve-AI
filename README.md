# NexGenGit

## Project Structure

```
/nexgengit
  /pages
    /api
      /auth
        callback.ts
      webhook.ts
    index.tsx
    dashboard.tsx
  /lib
    github.ts
    ai-reviewer.ts
  /components
    LoginButton.tsx
    PRReviewList.tsx
  .env.local
  next.config.js
```

## Environment Variables (.env.local)

```
GITHUB_APP_ID=your_app_id
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_PRIVATE_KEY=your_private_key
WEBHOOK_SECRET=your_webhook_secret
TOGETHER_API_KEY=your_together_ai_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_string
```

## Setup
- Place your environment variables in `.env.local` as shown above.
- The project uses Next.js with a `pages` directory structure.
- See `next.config.js` for environment variable exposure.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

An AI-powered GitHub App to automatically review Pull Requests and comment feedback using AI.
Built with Next.js, NextAuth, Prisma, TailwindCSS, and Octokit.

🚀 Key Features
🔒 OAuth Login — Secure GitHub sign-in using NextAuth.

⚙️ GitHub App Integration — Repo-scoped app with PR event webhooks.

🤖 Automated AI PR Reviews — Uses AI to analyze PRs and comment back.

📊 User Dashboard — See connected repos, manage installations.

🔗 Secure Webhooks — Verifies PR events with HMAC signatures.

🧩 Modern Stack — TypeScript, Prisma ORM, TailwindCSS.

🗂️ App Structure
Path	Description
pages/api/auth/[...nextauth].ts	GitHub OAuth with NextAuth
pages/api/github/install.ts	Handles GitHub App install redirects
pages/api/github/webhook.ts	Receives PR webhook events
lib/aiReview.ts	Central AI PR review logic
lib/githubApp.ts	GitHub App auth & Octokit setup
lib/githubOAuth.ts	User access token handling
components/	UI components
pages/dashboard/	User repo dashboard & PR views
prisma/schema.prisma	Database schema for users, repos, installs
lib/prisma.ts	Prisma client
utils/constants.ts	Centralized config
utils/jwt.ts	GitHub App JWT generation
utils/verifyWebhook.ts	Webhook HMAC signature verification
public/	Static assets
styles/	Tailwind CSS config & custom styles

🔄 How It Works
plaintext
Copy
Edit
                ┌────────────────────┐
                │   User logs in     │
                │  via GitHub OAuth  │
                └────────┬───────────┘
                         │
               Gets user access token
                         │
                         ▼
              ┌──────────────────────┐
              │  User Dashboard      │
              │ - See their repos    │
              │ - See installation   │
              └────────┬─────────────┘
                       │
         If GitHub App not installed
                       ▼
           ┌────────────────────────┐
           │ Prompt to install App  │
           └────────┬───────────────┘
                    │
        Redirects to GitHub install page
                    │
                    ▼
      ┌───────────────────────────────┐
      │ GitHub App (repo-scoped)     │
      │ - Gets webhook PR events     │
      │ - Reviews PRs with AI        │
      │ - Comments back to GitHub    │
      └──────────────────────────────┘
⚙️ Setup
1️⃣ Clone & Install
bash
Copy
Edit
git clone https://github.com/your-username/git-ai-pr-approver.git
cd git-ai-pr-approver
npm install
2️⃣ Environment Variables
Create a .env file:

env
Copy
Edit
DATABASE_URL=postgresql://...
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

GITHUB_APP_ID=your_github_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GITHUB_WEBHOOK_SECRET=your_webhook_secret

NEXTAUTH_SECRET=some_random_string
NEXTAUTH_URL=http://localhost:3000
3️⃣ Run Prisma Migrations
bash
Copy
Edit
npx prisma migrate dev
4️⃣ Run the Dev Server
bash
Copy
Edit
npm run dev
✅ Usage
Login: Go to /login and sign in with GitHub.

Install App: If not installed, follow the prompt to install your GitHub App on selected repos.

Dashboard: View your repositories.

PR Event: When a new PR is opened, the GitHub App receives a webhook → triggers AI → posts comments automatically.

🔐 Security
All webhooks verified with HMAC signatures.

GitHub App JWTs signed per request.

OAuth tokens stored securely.

Prisma ORM for safe DB access.

📚 Tech Stack
Next.js + NextAuth — React app + GitHub OAuth

Prisma — PostgreSQL ORM

TailwindCSS — Styling

Octokit — GitHub REST API

OpenAI API (or other) — AI review engine

🧩 Future Improvements
More advanced AI suggestions.

Automated approval/merge on pass.

PR status checks.

Slack / email notifications.

⚖️ License
MIT — free to use and modify.



## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
