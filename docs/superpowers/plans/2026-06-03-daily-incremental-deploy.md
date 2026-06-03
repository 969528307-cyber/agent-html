# Daily Incremental Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split daily content generation from production deployment so Hermes only commits and pushes content, while GitHub Actions builds and deploys the public site.

**Architecture:** Hermes remains the local content producer and pushes changes to `main`. GitHub Actions becomes the deploy owner: it builds with `npm run build:public`, uploads GitHub Pages, mirrors the public `dist/` to Hostinger with bounded FTP settings, and verifies the live tools page. Public build cleanup removes review and prototype routes before any deploy target sees the artifact.

**Tech Stack:** Astro 6, Node 22, GitHub Actions, lftp, Hermes cron.

---

### Task 1: Public Build Cleanup

**Files:**
- Modify: `site/scripts/public-build-utils.mjs`
- Modify: `site/scripts/public-build-utils.test.mjs`

- [ ] Add `prototype` to forbidden public output paths.
- [ ] Extend the public build utility test to create and verify removal of `prototype`.
- [ ] Run `node --test scripts/public-build-utils.test.mjs`.

### Task 2: GitHub Actions Deployment

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] Change build command from `npx astro build` to `npm run build:public`.
- [ ] Add Hostinger FTP deploy step after GitHub Pages deploy.
- [ ] Require `FTP_HOST`, `FTP_USER`, and `FTP_PASSWORD` secrets for the Hostinger step.
- [ ] Add bounded lftp timeouts and `--only-newer --parallel=1`.
- [ ] Add a live smoke check for `https://2playclaw.com/tools`.

### Task 3: Hermes Content Pipeline

**Files:**
- Modify: `/Users/ld/.hermes/scripts/agentk-daily-pipeline.sh`
- Modify: `/Users/ld/.hermes/cron/jobs.json`

- [ ] Replace `npx astro build` with `npm run build:public` as a local pre-push validation.
- [ ] Remove FTP deploy commands from the local script.
- [ ] Remove FTP deployment instructions from the Hermes cron prompt.
- [ ] Keep content generation, commit, and `git push origin main`.

### Task 4: Verification

- [ ] Run public build utility test.
- [ ] Run deploy workflow syntax sanity check by inspecting the YAML.
- [ ] Run `npm run build:public`.
- [ ] Confirm no lingering local `lftp` pipeline process remains.
- [ ] Report required GitHub Secrets and any remaining manual setup.
