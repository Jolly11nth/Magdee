# 📝 Git & GitHub Commands Reference

Quick reference guide for common Git and GitHub operations for Magdee development.

---

## 🚀 Initial Setup

### First Time Setup
```bash
# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize repository
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/magdee.git

# Verify remote
git remote -v
```

### Initial Commit and Push
```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Magdee with Python backend integration"

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## 🌿 Branch Management

### Create and Switch Branches
```bash
# Create new branch
git checkout -b feature/new-feature

# Or with newer syntax
git switch -c feature/new-feature

# List all branches
git branch -a

# Switch to existing branch
git checkout main
git switch main

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

### Common Branch Names
```bash
# Features
git checkout -b feature/pdf-processing
git checkout -b feature/audio-player

# Bug fixes
git checkout -b fix/login-error
git checkout -b fix/upload-timeout

# Hotfixes
git checkout -b hotfix/security-patch

# Refactoring
git checkout -b refactor/database-layer

# Documentation
git checkout -b docs/api-documentation
```

---

## 💾 Committing Changes

### Staging Files
```bash
# Stage all changes
git add .

# Stage specific file
git add path/to/file.tsx

# Stage specific directory
git add components/

# Stage by pattern
git add "*.tsx"

# Interactive staging
git add -p
```

### Committing
```bash
# Commit with message
git commit -m "feat: add PDF upload functionality"

# Commit with detailed message
git commit -m "feat: add PDF upload functionality" \
  -m "- Implement file validation" \
  -m "- Add progress tracking" \
  -m "- Update UI components"

# Amend last commit
git commit --amend -m "Updated message"

# Amend without changing message
git commit --amend --no-edit
```

### Commit Message Convention
```bash
# Format: <type>(<scope>): <subject>

feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: maintenance tasks
perf: performance improvements

# Examples:
git commit -m "feat(backend): add analytics router"
git commit -m "fix(auth): resolve login timeout issue"
git commit -m "docs(readme): update installation steps"
git commit -m "refactor(components): extract AudioPlayer logic"
```

---

## 🔄 Syncing Changes

### Pulling Updates
```bash
# Pull from main
git pull origin main

# Pull with rebase
git pull --rebase origin main

# Fetch without merging
git fetch origin

# See what changed
git log origin/main..HEAD
```

### Pushing Changes
```bash
# Push current branch
git push

# Push and set upstream
git push -u origin feature/new-feature

# Force push (use carefully!)
git push --force-with-lease

# Push all branches
git push --all

# Push tags
git push --tags
```

---

## 🔍 Viewing Changes

### Status and Logs
```bash
# View status
git status

# Short status
git status -s

# View commit history
git log

# One-line log
git log --oneline

# Graph view
git log --graph --oneline --all

# Last 5 commits
git log -5

# Commits by author
git log --author="Your Name"

# Commits in date range
git log --since="2 weeks ago"
```

### Viewing Differences
```bash
# View unstaged changes
git diff

# View staged changes
git diff --staged

# Compare branches
git diff main..feature/new-feature

# Compare specific files
git diff main..develop -- path/to/file.tsx

# Show changes in commit
git show <commit-hash>
```

---

## ↩️ Undoing Changes

### Unstaging Files
```bash
# Unstage file
git restore --staged path/to/file.tsx

# Unstage all
git restore --staged .

# Old syntax
git reset HEAD path/to/file.tsx
```

### Discarding Changes
```bash
# Discard changes in file
git restore path/to/file.tsx

# Discard all changes
git restore .

# Old syntax
git checkout -- path/to/file.tsx
```

### Reverting Commits
```bash
# Revert last commit (creates new commit)
git revert HEAD

# Revert specific commit
git revert <commit-hash>

# Reset to previous commit (dangerous!)
git reset --hard HEAD~1

# Reset but keep changes
git reset --soft HEAD~1
```

---

## 🔀 Merging and Rebasing

### Merging
```bash
# Merge branch into current
git merge feature/new-feature

# Merge without fast-forward
git merge --no-ff feature/new-feature

# Abort merge
git merge --abort
```

### Rebasing
```bash
# Rebase onto main
git rebase main

# Interactive rebase
git rebase -i HEAD~5

# Continue rebase
git rebase --continue

# Abort rebase
git rebase --abort
```

---

## 🏷️ Tags

### Creating Tags
```bash
# Lightweight tag
git tag v1.0.0

# Annotated tag
git tag -a v1.0.0 -m "Version 1.0.0 release"

# Tag specific commit
git tag -a v1.0.0 <commit-hash> -m "Version 1.0.0"

# Push tag
git push origin v1.0.0

# Push all tags
git push --tags
```

### Managing Tags
```bash
# List tags
git tag

# List tags with pattern
git tag -l "v1.*"

# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin --delete v1.0.0
```

---

## 🔧 Stashing

### Save Work Temporarily
```bash
# Stash changes
git stash

# Stash with message
git stash save "Work in progress on feature"

# Stash including untracked files
git stash -u

# List stashes
git stash list

# Apply last stash
git stash apply

# Apply and remove stash
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Drop stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

---

## 🐙 GitHub CLI Commands

### Installation
```bash
# macOS
brew install gh

# Windows
winget install gh

# Linux
sudo apt install gh
```

### Authentication
```bash
# Login
gh auth login

# Check status
gh auth status
```

### Repository Operations
```bash
# Create repository
gh repo create magdee --private

# Clone repository
gh repo clone YOUR_USERNAME/magdee

# View repository
gh repo view

# Fork repository
gh repo fork
```

### Pull Requests
```bash
# Create PR
gh pr create

# Create PR with details
gh pr create --title "Add feature" --body "Description"

# List PRs
gh pr list

# View PR
gh pr view 123

# Check out PR
gh pr checkout 123

# Merge PR
gh pr merge 123

# Close PR
gh pr close 123
```

### Issues
```bash
# Create issue
gh issue create

# List issues
gh issue list

# View issue
gh issue view 123

# Close issue
gh issue close 123
```

### Workflows
```bash
# List workflows
gh workflow list

# Run workflow
gh workflow run deploy-python-backend.yml

# View workflow runs
gh run list

# Watch workflow run
gh run watch

# View run logs
gh run view <run-id> --log
```

### Secrets
```bash
# Set secret
gh secret set SECRET_NAME

# List secrets
gh secret list

# Delete secret
gh secret delete SECRET_NAME
```

---

## 🚨 Emergency Commands

### Undo Last Push (Local Only)
```bash
# Reset to previous commit
git reset --hard HEAD~1

# Force push (if no one else pulled)
git push --force-with-lease
```

### Fix Wrong Branch
```bash
# If you committed to wrong branch
git log  # Note the commit hash
git reset --hard HEAD~1
git checkout correct-branch
git cherry-pick <commit-hash>
```

### Recover Deleted Branch
```bash
# Find the commit
git reflog

# Recreate branch
git checkout -b recovered-branch <commit-hash>
```

### Clean Up Repository
```bash
# Remove untracked files
git clean -fd

# Preview what will be removed
git clean -fdn

# Remove ignored files too
git clean -fdx
```

---

## 📋 Daily Workflow

### Starting Work
```bash
# 1. Update main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Make changes
# ... code ...

# 4. Stage and commit
git add .
git commit -m "feat: implement new feature"

# 5. Push to GitHub
git push -u origin feature/new-feature

# 6. Create PR
gh pr create
```

### Code Review Changes
```bash
# 1. Address review comments
# ... code changes ...

# 2. Amend or new commit
git add .
git commit -m "fix: address review comments"

# 3. Push changes
git push

# 4. PR updates automatically
```

### After PR Merge
```bash
# 1. Switch to main
git checkout main

# 2. Pull latest
git pull origin main

# 3. Delete feature branch
git branch -d feature/new-feature
git push origin --delete feature/new-feature

# 4. Start new feature
git checkout -b feature/next-feature
```

---

## 🎯 Magdee Specific Workflows

### Python Backend Changes
```bash
# Create branch
git checkout -b backend/analytics-endpoint

# Make changes to app/routers/
# ... code ...

# Test locally
pytest app/ -v

# Commit
git add app/
git commit -m "feat(backend): add analytics endpoint"

# Push and create PR
git push -u origin backend/analytics-endpoint
gh pr create --title "Add analytics endpoint" --label "python-backend"
```

### Frontend Changes
```bash
# Create branch
git checkout -b frontend/audio-player

# Make changes to components/
# ... code ...

# Test build
npm run build

# Commit
git add components/
git commit -m "feat(frontend): enhance audio player UI"

# Push and create PR
git push -u origin frontend/audio-player
gh pr create --title "Enhance audio player" --label "frontend"
```

### Documentation Updates
```bash
# Create branch
git checkout -b docs/api-guide

# Update docs
# ... edit markdown ...

# Commit
git add *.md
git commit -m "docs: add API usage guide"

# Push
git push -u origin docs/api-guide
gh pr create --title "Add API guide" --label "documentation"
```

---

## 🆘 Help and Resources

### Get Help
```bash
# Git help
git help
git help <command>

# GitHub CLI help
gh help
gh <command> --help
```

### Useful Aliases
```bash
# Add to ~/.gitconfig
[alias]
  st = status
  co = checkout
  br = branch
  ci = commit
  unstage = restore --staged
  last = log -1 HEAD
  visual = log --graph --oneline --all
```

---

## ✅ Best Practices

1. **Commit often** - Small, focused commits
2. **Write clear messages** - Follow convention
3. **Pull before push** - Stay in sync
4. **Use branches** - Never work directly on main
5. **Review before commit** - Check `git diff`
6. **Test before push** - Run tests locally
7. **Keep history clean** - Rebase if needed
8. **Tag releases** - Use semantic versioning

---

**Keep this reference handy!** 📌

For more details, see:
- GITHUB_SETUP.md
- Official Git docs: https://git-scm.com/doc
- GitHub CLI docs: https://cli.github.com/manual
