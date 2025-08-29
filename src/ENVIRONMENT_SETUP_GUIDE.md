# Environment Setup Guide for Magdee

This guide will help you set up the required environment variables to get your Magdee app running with your own Supabase project.

## Quick Setup (5 minutes)

### 1. Create Your Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name: `magdee-app`
5. Enter a strong database password
6. Select a region close to your users
7. Click "Create new project"

### 2. Get Your Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)
   - **Service role key** (starts with `eyJ`)

### 3. Create Environment File

1. In your project root, copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your credentials:
   ```env
   # Replace with your actual Supabase project URL
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co

   # Replace with your actual anon key
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Replace with your actual service role key  
   REACT_APP_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Optional: Database URL (for advanced features)
   REACT_APP_SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
   ```

### 4. Set Up Database Tables

1. Go to your Supabase project
2. Click on **SQL Editor**
3. Run the setup script from `DATABASE_SETUP_GUIDE.md`

### 5. Test Your Setup

1. Start your app:
   ```bash
   npm start
   ```

2. Check the console for any environment warnings
3. If you see "Using fallback Supabase configuration", double-check your `.env` file

## Alternative Environment Variable Names

Magdee supports multiple environment variable naming conventions:

### React (Create React App)
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Vite
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Generic (for server-side)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### "Using fallback Supabase configuration" Warning

This means your environment variables aren't being detected. Try:

1. **Check your `.env` file location**: It should be in the project root (same level as `package.json`)

2. **Restart your development server**: 
   ```bash
   # Stop the server (Ctrl+C)
   npm start
   ```

3. **Check variable names**: Make sure they start with `REACT_APP_` or `VITE_`

4. **Verify no spaces**: 
   ```env
   # ✅ Correct
   REACT_APP_SUPABASE_URL=https://project.supabase.co
   
   # ❌ Wrong - has space
   REACT_APP_SUPABASE_URL = https://project.supabase.co
   ```

### "Invalid JWT" Error

Your anon key or service role key is incorrect:

1. Go to Supabase → Settings → API
2. Copy the key again
3. Make sure you copied the entire key (they're quite long)

### Connection Issues

1. **Check project status**: Make sure your Supabase project isn't paused
2. **Verify URL**: Ensure the URL ends with `.supabase.co`
3. **Test connectivity**: 
   ```bash
   python quick-diagnostics.py
   ```

### Database Issues

If you can connect but get database errors:

1. Run the database setup guide: `DATABASE_SETUP_GUIDE.md`
2. Make sure all required tables are created
3. Check your service role key has the right permissions

## Development vs Production

### Development
- Use `REACT_APP_` prefixed variables
- Store in `.env` file
- Never commit `.env` to git

### Production
- Set environment variables in your hosting platform
- Use `VITE_` prefix for Vite builds
- Use build-time injection for static sites

## Security Notes

- **Never commit your `.env` file to git**
- **Never share your service role key publicly**
- **Use different projects for development and production**
- **Rotate your keys if they're compromised**

## Quick Commands

```bash
# Check your current configuration
python quick-diagnostics.py

# Test server connectivity
python server-diagnostics.py

# Fix common issues automatically
python fix-server-issues.py

# Validate your build setup
node validate-build.js
```

## Need Help?

1. Check the console for specific error messages
2. Run diagnostic scripts for detailed information
3. Review the troubleshooting section above
4. Check the main README.md for additional guidance

---

✅ Once you complete this setup, your Magdee app will be connected to your own Supabase project and ready to use!