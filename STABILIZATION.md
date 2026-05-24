# Stabilization & Deployment Validation Guide

> **This is the operational baseline before any architecture refactoring.**

## Current State

- **Repository**: fairybellysmail/McknPlumbering
- **Baseline Branch**: `stabilization-baseline`
- **Backup Tag**: `pre-normalization-backup`
- **Status**: ⚠️ Pre-deployment validation phase

---

## Phase 1: Repository Sanitation (NOW)

### Verify Git Integrity

```bash
# Check repo size
git count-objects -vH

# Verify no corruption
git fsck

# Review history
git log --graph --oneline -10
```

**Expected Results:**
- No corruption warnings
- Reasonable object count (< 100MB for new repo)
- Clean linear history

### Verify No Secrets

```bash
# Search for accidentally committed env files
git log --all --full-history -- '.env*'

# Check current tracked files
git ls-files | grep -E '\.(env|key|secret)'
```

**Required Actions:**
- ✅ No `.env.local` in git
- ✅ No API keys tracked
- ✅ `.gitignore` updated

---

## Phase 2: Runtime Standardization (NOW)

### Node.js Version Lock

**Files Added:**
- `.nvmrc` → Node 20.x
- `package.json` already specifies engines

**Validate Locally:**

```bash
# Use nvm
nvm install 20
nvm use 20
node --version  # Must be v20.x.x

# Or use Volta
volta pin node@20
```

### Dependency Snapshot

**Create inventory:**

```bash
npm ls --depth=0
```

**Document current state** (for rollback reference):

```bash
npm list > DEPENDENCY_SNAPSHOT.txt
```

**Check for issues:**

```bash
npm audit
```

---

## Phase 3: Build Reproducibility (PRIORITY)

### Test Clean Build

```bash
# Remove all build artifacts
rm -rf node_modules dist .next
npm cache clean --force

# Fresh install
npm install

# Type check
npm run lint

# Build
npm run build

# Verify dist exists
ls -la dist/
```

**Success Criteria:**
- ✅ No errors during `npm install`
- ✅ No TypeScript errors from `lint`
- ✅ Build completes without warnings
- ✅ `dist/` contains `.htaccess` and static files
- ✅ `.htaccess` present (Apache routing)

### Document Build Output

```bash
npm run build 2>&1 | tee BUILD_LOG.txt
```

**Keep this log** for reference during deployment troubleshooting.

---

## Phase 4: Environment Validation (CRITICAL)

### Verify .env.example is Safe

**Current `.env.example`:**
```
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
```

**✅ Correct** - no real secrets exposed.

### Create Local .env.local (Never commit)

```bash
# Copy template
cp .env.example .env.local

# Edit with YOUR real values
# GEMINI_API_KEY=your_actual_key_here
# APP_URL=http://localhost:3000
```

**⚠️ DANGER**: Never commit `.env.local` to git.

### Verify Environment Variables Load

```bash
npm run dev

# Visit http://localhost:3000
# Check:
# - Page loads
# - No console errors
# - API calls succeed (if applicable)
```

---

## Phase 5: Deployment Strategy (POST-VALIDATION)

### Do NOT Deploy Yet

**Wait until:**
- ✅ Clean build reproducible
- ✅ Lint passes
- ✅ Dev server works locally
- ✅ No git corruption
- ✅ Dependencies documented

### Recommended Initial Deployment

For **static site** (cPanel or GitHub Pages):

```bash
# Build
npm run build

# Output ready at: ./dist/
```

**Next decision point:**
- Deploy to cPanel shared hosting (per README)
- OR GitHub Pages (requires workflow)
- NOT both yet

---

## Checklist: Ready for Deployment?

- [ ] Git integrity verified (`git fsck`)
- [ ] No secrets in git history
- [ ] `.nvmrc` enforces Node 20.x
- [ ] `.gitignore` prevents future leaks
- [ ] Clean build succeeds locally
- [ ] TypeScript lint passes
- [ ] `.htaccess` present in dist/
- [ ] `.env.example` contains no real secrets
- [ ] Build logs documented
- [ ] Dependency snapshot created
- [ ] Dev server runs locally without errors

---

## If Problems Occur

### Build fails

```bash
npm run clean
npm cache clean --force
rm -rf node_modules
npm install
npm run build
```

### Type errors

```bash
npm run lint
# Fix errors, then:
npm run build
```

### Version conflicts

```bash
node --version  # Must be 20.x
npm --version   # Must match package-lock.json
npx envinfo --npmPackages=react,react-dom,vite
```

### Reset to baseline

```bash
git checkout stabilization-baseline
git reset --hard
```

---

## Next Steps (After Validation)

1. **Verify this checklist passes** ← START HERE
2. Create deployment branch (separate from this)
3. Choose deployment target (cPanel or GitHub Pages)
4. Configure environment secrets safely
5. Perform test deployment
6. Validate in production-like environment

---

**Status**: 🟡 Awaiting stabilization validation  
**Last Updated**: 2026-05-24  
**Owner**: @fairybellysmail
