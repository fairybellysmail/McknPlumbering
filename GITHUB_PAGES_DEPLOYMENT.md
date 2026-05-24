# GitHub Pages Deployment Guide

> **This is your execution checklist for deploying to GitHub Pages**

## Prerequisites

✅ **Completed on `stabilization-baseline` branch:**
- `.nvmrc` locks Node 20.x
- `package.json` has engines constraint
- `.gitignore` secured against secrets
- `STABILIZATION.md` created

---

## Phase 1: Create GitHub Actions Workflow (YOU DO THIS)

### Step 1: Create workflow directory structure

On your local machine:

```bash
mkdir -p .github/workflows
```

### Step 2: Create build validation workflow

Create file: `.github/workflows/validate-build.yml`

```yaml
name: Build Validation & Reproducibility Check

on:
  push:
    branches: [stabilization-baseline, main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Verify Node version
        run: |
          echo "Node version: $(node --version)"
          echo "npm version: $(npm --version)"
          node --version | grep -E '^v20\.' || (echo "ERROR: Node 20.x required" && exit 1)

      - name: Verify .nvmrc
        run: |
          echo "Required Node version from .nvmrc:"
          cat .nvmrc

      - name: Check for secrets in git history
        run: |
          echo "Checking for accidentally committed secrets..."
          git log --all --full-history -- '.env*' | head -20 || echo "No .env files in history (good)"

      - name: Git integrity check
        run: |
          echo "Running git fsck..."
          git fsck --full
          echo "Repository integrity: OK"

      - name: Install dependencies
        run: npm ci

      - name: List dependency tree
        run: |
          npm ls --depth=0
          echo "---"
          echo "Dev dependencies:"
          npm ls --depth=0 --only=dev

      - name: Type check (lint)
        run: npm run lint

      - name: Build project
        run: npm run build

      - name: Verify build artifacts
        run: |
          echo "Build output structure:"
          ls -la dist/ | head -20
          echo ""
          echo "Checking for .htaccess..."
          [ -f dist/.htaccess ] && echo "✓ .htaccess found" || echo "⚠ .htaccess missing"

      - name: Bundle size analysis
        run: |
          echo "Build artifact sizes:"
          du -sh dist/*
          echo ""
          echo "Total build size:"
          du -sh dist/

      - name: Generate build report
        run: |
          cat > BUILD_REPORT.txt << EOF
          Build Validation Report
          =======================
          Date: $(date)
          Node: $(node --version)
          npm: $(npm --version)
          Commit: $(git rev-parse HEAD)
          Branch: $(git rev-parse --abbrev-ref HEAD)
          
          Build Status: SUCCESS
          
          Artifacts:
          $(ls -lh dist/ | tail -n +2)
          
          Total Size: $(du -sh dist/ | cut -f1)
          EOF
          cat BUILD_REPORT.txt

      - name: Upload build artifact
        if: success()
        uses: actions/upload-artifact@v4
        with:
          name: build-dist
          path: dist/
          retention-days: 7

      - name: Upload build report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: build-report
          path: BUILD_REPORT.txt
          retention-days: 7
```

### Step 3: Create GitHub Pages deployment workflow

Create file: `.github/workflows/deploy-github-pages.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_run:
    workflows: ["Build Validation & Reproducibility Check"]
    branches: [main]
    types:
      - completed

jobs:
  deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'dist/'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Phase 2: Enable GitHub Pages (YOU DO THIS IN BROWSER)

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - Click **Save**

---

## Phase 3: Add Gemini API Key Secret (YOU DO THIS)

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. **Name**: `GEMINI_API_KEY`
4. **Value**: Your Gemini API key from https://aistudio.google.com/apikey
5. Click **Add secret**

---

## Phase 4: Commit and Push Workflow Files (YOU DO THIS)

```bash
# Locally
git add .github/workflows/
git add .nvmrc
git add package.json
git add .gitignore

git commit -m "ci: Add GitHub Actions workflows and stabilization setup"

git push origin stabilization-baseline
```

---

## Phase 5: Verify First Workflow Run

After pushing:

1. Go to your repo on GitHub
2. Click **Actions** tab
3. Watch "Build Validation & Reproducibility Check" run
4. Verify it **passes** ✅

Expected output:
- ✅ Node 20.x verified
- ✅ No secrets in history
- ✅ Git integrity OK
- ✅ Dependencies installed
- ✅ TypeScript lint passed
- ✅ Build succeeded
- ✅ .htaccess present

---

## Phase 6: Create Pull Request to Main

```bash
# After stabilization-baseline passes:
# Go to GitHub → Click "Compare & pull request"
# Title: "chore: Add stabilization and deployment infrastructure"
# Merge to main
```

---

## Phase 7: GitHub Pages Goes Live

After merge to `main`:

1. GitHub Actions triggers automatically
2. Build validation runs
3. If successful → deployment workflow runs
4. Pages deployed to: `https://fairybellysmail.github.io/McknPlumbering`

---

## Deployment Status Dashboard

After deployment:

| Component | Status | URL |
|-----------|--------|-----|
| Build Validation | ✅ Automated | Actions tab |
| GitHub Pages | ✅ Live | https://fairybellysmail.github.io/McknPlumbering |
| Source Control | ✅ Protected | main branch |
| Secrets | ✅ Secure | Settings → Secrets |

---

## Troubleshooting

### Workflow fails on Node version

```bash
# Verify locally
nvm use 20
node --version  # Must be v20.x.x
npm install
npm run build
```

### Build fails with missing dependencies

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Pages not appearing

1. Check **Actions** tab for deployment status
2. Verify **Settings → Pages** shows "Your site is live"
3. Clear browser cache
4. Wait 1-2 minutes for DNS propagation

### Secrets not accessible in workflow

1. Go to **Settings → Secrets and variables → Actions**
2. Verify `GEMINI_API_KEY` exists
3. Re-run workflow (Actions tab → workflow → "Re-run jobs")

---

## Success Indicators

You'll know deployment succeeded when:

✅ All GitHub Actions workflows pass  
✅ Build artifacts uploaded to Pages  
✅ Site accessible at GitHub Pages URL  
✅ .htaccess present in deployed files  
✅ No console errors in browser  
✅ API calls to Gemini work (if applicable)

---

## Next Steps (After Deployment)

1. **Monitor**: Watch GitHub Actions for any failed builds
2. **Validate**: Test the live site thoroughly
3. **Stabilize**: Fix any runtime issues found
4. **Document**: Update README with deployment info
5. **Plan**: Architecture improvements can start after proven stability

---

**Status**: 🟡 Ready for you to execute Phase 1-3  
**Owner**: @fairybellysmail  
**Target**: GitHub Pages deployment validation
