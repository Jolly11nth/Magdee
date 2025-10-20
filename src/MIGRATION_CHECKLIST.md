# Project Structure Migration Checklist

Use this checklist to ensure a smooth migration to the new frontend/backend structure.

## Pre-Migration

- [ ] **Backup your current project**
  ```bash
  git add .
  git commit -m "Pre-migration backup"
  git push
  ```

- [ ] **Review the new structure**
  - Read `PROJECT_STRUCTURE.md`
  - Review `DEPLOYMENT_NEW_STRUCTURE.md`

- [ ] **Check prerequisites**
  - Node.js 18+ installed
  - Python 3.9+ installed
  - ffmpeg installed
  - Supabase CLI installed (`npm install -g supabase`)

## Migration Steps

### 1. Run Migration Script

- [ ] **Make script executable**
  ```bash
  chmod +x migrate-to-new-structure.sh
  ```

- [ ] **Run migration**
  ```bash
  ./migrate-to-new-structure.sh
  ```

- [ ] **Review console output** for any errors

### 2. Update Frontend

- [ ] **Check imports in App.tsx**
  - Update any broken import paths
  - Ensure all components are imported correctly

- [ ] **Update import paths in all files**
  ```bash
  cd frontend/src
  # Check for any absolute imports that need updating
  grep -r "import.*from ['\"]/" .
  ```

- [ ] **Move remaining frontend files**
  - Check if any components were missed
  - Ensure all assets are in `frontend/public/`

- [ ] **Test frontend builds**
  ```bash
  cd frontend
  npm install
  npm run build
  ```

### 3. Update Backend

- [ ] **Verify Python app structure**
  ```bash
  cd backend/python
  ls -la app/
  ```

- [ ] **Check requirements.txt is in place**
  ```bash
  cat backend/python/requirements.txt
  ```

- [ ] **Verify Supabase functions**
  ```bash
  cd backend/supabase/functions/server
  ls -la
  ```

- [ ] **Test Python backend**
  ```bash
  cd backend/python
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  python -m app.main
  ```

### 4. Environment Setup

- [ ] **Create frontend .env**
  ```bash
  cd frontend
  cp .env.example .env
  # Edit with your values
  ```

- [ ] **Create backend .env**
  ```bash
  cd backend/python
  cp .env.example .env
  # Edit with your values
  ```

- [ ] **Set Supabase secrets**
  ```bash
  cd backend/supabase
  supabase secrets set SUPABASE_URL=your-url
  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
  supabase secrets set SUPABASE_ANON_KEY=your-key
  ```

### 5. Update Configuration Files

- [ ] **Update vite.config.ts** (if needed)
  - Check proxy settings
  - Verify build output directory

- [ ] **Update tsconfig.json** (if exists)
  - Ensure paths are correct

- [ ] **Update .gitignore**
  ```
  # Frontend
  frontend/node_modules/
  frontend/dist/
  frontend/.env
  
  # Backend Python
  backend/python/venv/
  backend/python/__pycache__/
  backend/python/.env
  backend/python/*.pyc
  
  # Logs
  logs/
  *.log
  ```

### 6. GitHub Workflows

- [ ] **Update workflow paths**
  - Check all `.github/workflows/*.yml` files
  - Ensure paths point to new directories

- [ ] **Add GitHub secrets**
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `RAILWAY_TOKEN`
  - `RAILWAY_PROJECT_ID`
  - `SUPABASE_ACCESS_TOKEN`
  - `SUPABASE_PROJECT_ID`
  - All Supabase URLs and keys

- [ ] **Test workflows**
  - Create a test branch
  - Push changes
  - Check GitHub Actions run successfully

### 7. Documentation

- [ ] **Update main README.md**
  - Replace with `README_NEW.md` or merge content
  - Update installation instructions
  - Update project structure section

- [ ] **Update all documentation**
  - Check for hardcoded paths
  - Update deployment instructions
  - Update development setup guides

- [ ] **Create/update CHANGELOG.md**
  - Document the migration
  - Note any breaking changes

### 8. Docker Configuration

- [ ] **Test Docker Compose**
  ```bash
  docker-compose up --build
  ```

- [ ] **Verify services connect**
  - Frontend → Backend API
  - Backend → Supabase

- [ ] **Update Dockerfiles if needed**

### 9. Testing

- [ ] **Test frontend locally**
  ```bash
  cd frontend
  npm run dev
  # Visit http://localhost:5173
  ```

- [ ] **Test backend locally**
  ```bash
  cd backend/python
  source venv/bin/activate
  python -m app.main
  # Visit http://localhost:8001/docs
  ```

- [ ] **Test full stack**
  ```bash
  chmod +x start-dev.sh
  ./start-dev.sh
  ```

- [ ] **Test core features**
  - [ ] User signup/login
  - [ ] PDF upload
  - [ ] Audio conversion
  - [ ] Audio playback
  - [ ] Profile updates
  - [ ] Settings changes

### 10. Deployment

- [ ] **Deploy frontend to Vercel**
  ```bash
  cd frontend
  vercel --prod
  ```

- [ ] **Deploy backend to Railway**
  ```bash
  cd backend/python
  railway up
  ```

- [ ] **Deploy Supabase functions**
  ```bash
  cd backend/supabase
  supabase functions deploy
  ```

- [ ] **Update production environment variables**
  - Frontend URLs point to production backend
  - Backend CORS includes production frontend
  - All API keys are production keys

- [ ] **Test production deployment**
  - [ ] Visit production frontend URL
  - [ ] Test all core features in production
  - [ ] Check error logs

## Post-Migration

### Cleanup

- [ ] **Remove old files** (after confirming everything works)
  ```bash
  # Only after thorough testing!
  rm -rf app/ components/ hooks/ services/ types/ utils/ constants/ styles/
  rm App.tsx package.json vite.config.ts
  rm requirements.txt
  ```

- [ ] **Update .gitignore** to ignore old directories

- [ ] **Clean up old documentation**
  - Archive outdated docs in `/docs/archive/`
  - Update navigation/links

### Verification

- [ ] **All tests pass**
  - Frontend: `cd frontend && npm test`
  - Backend: `cd backend/python && pytest`

- [ ] **No console errors**
  - Check browser console
  - Check server logs

- [ ] **All features work**
  - Authentication
  - File uploads
  - Audio playback
  - User settings

### Communication

- [ ] **Update team**
  - Send email about new structure
  - Share this checklist
  - Hold knowledge transfer session

- [ ] **Update project board/issues**
  - Close old deployment issues
  - Update with new deployment process

- [ ] **Update external documentation**
  - Wiki pages
  - Onboarding docs
  - API documentation

## Rollback Plan

If something goes wrong:

1. **Stop all services**
2. **Revert to backup**
   ```bash
   git reset --hard <pre-migration-commit>
   ```
3. **Restart old structure**
4. **Document what went wrong**
5. **Fix issues before re-attempting migration**

## Common Issues

### Import errors in frontend

**Problem:** Module not found errors

**Solution:**
```bash
cd frontend/src
# Update import paths from absolute to relative
# Example: import { X } from 'components/Y' → import { X } from './components/Y'
```

### Backend won't start

**Problem:** Module import errors

**Solution:**
```bash
cd backend/python
# Ensure you're in the venv
source venv/bin/activate
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Supabase functions fail

**Problem:** Functions can't find modules

**Solution:**
- Check all imports use correct paths
- Ensure kv_store.tsx is in the same directory
- Verify secrets are set: `supabase secrets list`

### Docker compose fails

**Problem:** Services can't communicate

**Solution:**
- Check service names in docker-compose.yml
- Verify environment variables
- Check network configuration

## Success Criteria

✅ All of the following should be true:

- [ ] Frontend builds without errors
- [ ] Backend starts without errors
- [ ] Supabase functions deploy successfully
- [ ] All tests pass
- [ ] Production deployment works
- [ ] No functionality is lost
- [ ] Documentation is updated
- [ ] Team is informed

---

## Need Help?

- Check `PROJECT_STRUCTURE.md`
- Review `DEPLOYMENT_NEW_STRUCTURE.md`
- Check individual READMEs in frontend/backend directories
- Open an issue on GitHub
- Contact the team

**Remember:** Take your time and test thoroughly at each step! 🚀
