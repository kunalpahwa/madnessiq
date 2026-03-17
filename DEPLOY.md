# MadnessIQ — Deployment Guide

## What You're Deploying

A React website powered by Claude's API with web search. The bracket analysis loads instantly (pre-computed). The "Ask AI" chat makes real Claude API calls that search the web for live scores, injuries, and odds.

**Architecture:**
- **Frontend**: React app (runs in the browser)
- **Backend**: One serverless function (`/api/chat.js`) that securely proxies Claude API calls
- **Hosting**: Vercel (free tier is plenty)
- **Cost**: ~$0.01-0.03 per AI chat query. Domain: $12/yr if you want a custom one.

---

## Prerequisites (One-Time Setup)

### 1. Install Node.js
If you don't have it, download from https://nodejs.org (LTS version).  
Verify in PowerShell:
```powershell
node --version    # Should show v18+ or v20+
npm --version     # Should show 9+ or 10+
```

### 2. Install Git
Download from https://git-scm.com/download/win  
Verify:
```powershell
git --version
```

### 3. Install Vercel CLI
```powershell
npm install -g vercel
```

### 4. Create Accounts (if you don't have them)
- **GitHub**: https://github.com (free)
- **Vercel**: https://vercel.com (free — sign in with your GitHub account)
- **Anthropic API**: https://console.anthropic.com (you'll need an API key — costs ~$0.01/query)

---

## Step-by-Step Deployment

### Step 1: Download the project files from Claude

Download the `madnessiq-deploy` folder. Save it somewhere like `C:\Users\Kunal\Projects\madnessiq`.

The folder structure should look like:
```
madnessiq/
├── api/
│   └── chat.js          ← Serverless function (keeps API key secret)
├── public/
├── src/
│   ├── App.jsx          ← The main app (bracket + chat)
│   └── main.jsx         ← Entry point
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

### Step 2: Install dependencies

Open PowerShell, navigate to the project folder, and install:

```powershell
cd C:\Users\Kunal\Projects\madnessiq
npm install
```

This downloads React, Vite, and other dependencies (~30 seconds).

### Step 3: Test locally

```powershell
npm run dev
```

This starts a local server. Open http://localhost:5173 in your browser.  
The bracket will work. The AI chat won't yet (no API key locally) — that's expected.

Press `Ctrl+C` in PowerShell to stop the server when done testing.

### Step 4: Create a GitHub repository

Go to https://github.com/new and create a new repo:
- **Name**: `madnessiq`
- **Public** or Private (your choice)
- Do NOT check "Add a README" (we already have files)

Then push your code:

```powershell
cd C:\Users\Kunal\Projects\madnessiq

git init
git add .
git commit -m "MadnessIQ v1 - AI March Madness bracket"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/madnessiq.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 5: Deploy to Vercel

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `madnessiq` repo
4. Vercel auto-detects it's a Vite project — leave defaults
5. Click "Deploy"
6. Wait ~60 seconds — your site is live!

**Option B: Via PowerShell**

```powershell
cd C:\Users\Kunal\Projects\madnessiq
vercel
```

Follow the prompts:
- Set up and deploy? `Y`
- Which scope? Select your account
- Link to existing project? `N`
- Project name? `madnessiq`
- In which directory? `./`
- Override settings? `N`

Vercel will deploy and give you a URL like `madnessiq-abc123.vercel.app`.

### Step 6: Add your Anthropic API key

This is the critical step — without it, the AI chat won't work.

1. Go to https://console.anthropic.com/settings/keys
2. Click "Create Key" — copy the key (starts with `sk-ant-...`)
3. Go to your Vercel dashboard → your project → **Settings** → **Environment Variables**
4. Add:
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: paste your API key
   - **Environment**: All (Production, Preview, Development)
5. Click "Save"
6. Go to **Deployments** tab → click the three dots on the latest deployment → **Redeploy**

### Step 7: You're live!

Your site is now at `https://madnessiq.vercel.app` (or whatever URL Vercel assigned).

The bracket loads instantly. The AI chat calls Claude with web search for real-time data.

---

## Making Updates

Whenever you want to change something:

```powershell
cd C:\Users\Kunal\Projects\madnessiq

# Make your changes to the files...

git add .
git commit -m "Update bracket picks after Round of 64"
git push
```

Vercel automatically deploys when you push to GitHub. New version is live in ~60 seconds.

---

## Custom Domain (Optional)

1. Buy a domain (e.g., `madnessiq.com`) from Namecheap, Google Domains, etc.
2. In Vercel dashboard → your project → **Settings** → **Domains**
3. Add your domain and follow the DNS instructions

---

## Troubleshooting

**"npm: command not found"**  
→ Install Node.js from https://nodejs.org, then restart PowerShell.

**"git: command not found"**  
→ Install Git from https://git-scm.com, then restart PowerShell.

**AI chat says "ANTHROPIC_API_KEY not configured"**  
→ Go to Vercel → Settings → Environment Variables. Make sure the key is there and you redeployed after adding it.

**AI chat gives an error**  
→ Check that your Anthropic account has API credits. You may need to add a payment method at https://console.anthropic.com.

**The bracket shows but the page is blank**  
→ Open browser dev tools (F12 → Console tab) and check for errors. Usually a missing dependency — try `npm install` again.

---

## Architecture for the Curious

```
[User's Browser]
    │
    ├── GET / ──→ [Vercel CDN] ──→ React app (bracket, UI)
    │                                  All 32 games pre-computed
    │                                  Loads instantly, no API call needed
    │
    └── POST /api/chat ──→ [Vercel Serverless Function]
                                │
                                ├── Adds ANTHROPIC_API_KEY (secret, never in browser)
                                │
                                └── POST api.anthropic.com/v1/messages
                                        │
                                        ├── Claude searches the web
                                        ├── Finds live scores, injuries, odds
                                        ├── Generates analyst-quality response
                                        │
                                        └── Response flows back to browser
```

The API key never touches the browser. The serverless function runs on Vercel's servers and is the only thing that knows the key.
