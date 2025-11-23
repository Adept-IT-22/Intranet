# 🔗 Setting Up GitHub Repository

## Option 1: You Already Have a GitHub Repository

If you already created a repository on GitHub:

1. **Get your repository URL** from GitHub (click the green "Code" button)
   - HTTPS: `https://github.com/username/repo-name.git`
   - SSH: `git@github.com:username/repo-name.git`

2. **Add the remote and push:**
   ```powershell
   git remote add origin https://github.com/username/repo-name.git
   git branch -M main
   git push -u origin main
   ```

## Option 2: Create a New GitHub Repository

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `adept-intranet` (or your preferred name)
3. Description: "Adept Intranet Application"
4. Choose **Private** or **Public**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

### Step 2: Connect and Push

After creating the repository, GitHub will show you commands. Use these:

```powershell
# Add remote (replace with your actual repository URL)
git remote add origin https://github.com/YOUR_USERNAME/adept-intranet.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔐 Authentication

If you're asked for credentials:

- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)
  - Create one at: https://github.com/settings/tokens
  - Select scopes: `repo` (full control of private repositories)

## ✅ Verify Push

After pushing, check your GitHub repository - you should see all your files!

## 🔄 Future Updates

After initial setup, just use:
```powershell
git add .
git commit -m "Your commit message"
git push
```

