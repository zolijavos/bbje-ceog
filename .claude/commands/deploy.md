# Deploy Workflow

You are a deploy assistant. Follow this workflow precisely to deploy the CEOG-4 application safely.

## Environment Map

| Env | Server | SSH | App Path | Git Remote |
|-----|--------|-----|----------|------------|
| **dev4** (staging) | 91.98.143.163 | `ssh root@91.98.143.163` (port 22) | `/root/LABS/CEOG-4` | `prod` → bbje-ceog |
| **demo** (client demo) | 89.167.63.14 | `ssh root@89.167.63.14` (port 22) | `/opt/demos/ceog-4` | `prod` → bbje-ceog |
| **client-prod** | 81.0.124.14 | `ssh -p 4231 root@81.0.124.14` | `/var/www/ceog` | **NO SSH ACCESS from here** |

## Repo Structure

- **CEOG-4** (`origin`) = development repo (full project + docs + bmad)
- **bbje-ceog** (`prod`) = client/production repo (code only, no internal docs)
- Servers pull from `prod` (bbje-ceog)

## Step 1: Pre-flight Checks

Run these checks before anything else:

1. `git status` - check for uncommitted changes
2. `git diff --stat origin/main` - check what's ahead of origin
3. `git diff --stat prod/main` - check what's ahead of prod
4. `npx tsc --noEmit` - TypeScript check (must pass)

**If there are uncommitted changes:** Ask the user if they want to commit first. Do NOT auto-commit.

**If TypeScript fails:** Stop and report errors. Do NOT deploy broken code.

## Step 2: Ask Target

Ask the user:

"**Deploy target?**
1. **dev4** - staging teszt
2. **demo** - client demo
3. **mindkettő** - dev4 + demo párhuzamosan
4. **client-prod** - prompt generálás (nincs közvetlen SSH hozzáférés)"

## Step 3: Push to Remotes

```bash
# Always push to both remotes
git push origin main
git push prod main
```

**If `git push prod main` fails** (unrelated histories):
```bash
git fetch prod main
git merge prod/main --allow-unrelated-histories
# Resolve conflicts - prefer ours (CEOG-4) unless prod has unique changes
git push prod main
```

## Step 4: Deploy to Target(s)

### Dev4
```bash
ssh root@91.98.143.163 "git -C /root/LABS/CEOG-4 pull prod main && npm --prefix /root/LABS/CEOG-4 run deploy"
```

### Demo
```bash
ssh root@89.167.63.14 "git -C /opt/demos/ceog-4 pull prod main && npm --prefix /opt/demos/ceog-4 run deploy"
```

### Both (parallel)
Run both SSH commands in parallel using `run_in_background: true`.

### Client-Prod (prompt generation)
Generate a copy-paste prompt for the user to run in the other chat session:

```
Deploy the latest changes from bbje-ceog to the client production server:

1. Pull latest: `git -C /var/www/ceog pull origin main`
2. Build + restart: `npm --prefix /var/www/ceog run deploy`
3. Verify: `pm2 status ceog` and check https://registration.ceogala.com
```

## Step 5: Verify

After deploy completes, run:
```bash
# Check PM2 status
ssh root@{IP} "pm2 describe ceog | grep 'status\|uptime\|restart'"
```

Report the result to the user.

## SSH Rules (CRITICAL)

- **NEVER** use `cd` in SSH commands - use `--prefix` (npm) and `-C` (git)
- **ALWAYS** use the exact app paths from the Environment Map
- Deploy command is `npm run deploy` = build + pm2 restart
- Build takes ~2 minutes per server

## Safety Rules

- Never deploy without TypeScript passing
- Never force-push to prod remote
- Always show git diff summary before pushing
- If deploy fails, check `pm2 logs ceog --lines 50` on the server
- Ask before deploying to demo or client-prod (dev4 is safe for testing)
