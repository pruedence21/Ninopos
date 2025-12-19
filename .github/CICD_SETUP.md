# GitHub Actions CI/CD Setup Guide

## Required GitHub Secrets

Add these secrets in your GitHub repository settings (`Settings` → `Secrets and variables` → `Actions`):

### Database & Auth
```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://yourapp.com
```

### Google OAuth
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Midtrans
```
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_IS_PRODUCTION=true
```

### Resend Email
```
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourapp.com
```

### Vercel Deployment (Optional)
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

### App Config
```
ROOT_DOMAIN=yourapp.com
```

---

## Workflow Jobs

### 1. **Lint & Type Check**
- Runs ESLint
- TypeScript type checking
- Continues on error (won't block build)

### 2. **Build**
- Builds Next.js application
- Uploads build artifacts
- Requires database URL for build-time queries

### 3. **Test**
- Spins up PostgreSQL test database
- Runs database migrations
- Executes test suite
- Isolated from production data

### 4. **Deploy Preview** (Pull Requests)
- Deploys to Vercel preview environment
- Automatic preview URL for each PR
- Only runs on pull requests

### 5. **Deploy Production** (Main Branch)
- Deploys to Vercel production
- Only runs on `main` branch pushes
- Requires all tests to pass

### 6. **Security Scan**
- Scans for vulnerabilities using Trivy
- Uploads results to GitHub Security tab
- Runs on every push

---

## How to Use

### 1. Setup Repository Secrets
Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret

Add all secrets listed above.

### 2. Push to GitHub
```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

### 3. Monitor Workflow
- Go to `Actions` tab in GitHub
- Watch the workflow run
- Check logs if any job fails

### 4. Pull Request Flow
```bash
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR on GitHub
# CI will run automatically
# Preview deployment will be created
```

---

## Troubleshooting

### Build Fails
- Check if all required secrets are set
- Verify DATABASE_URL is accessible from GitHub Actions
- Check build logs for specific errors

### Tests Fail
- Ensure database migrations are up to date
- Check test database connection
- Review test logs

### Deployment Fails
- Verify Vercel tokens are correct
- Check Vercel project settings
- Ensure environment variables are set in Vercel dashboard

---

## Optional: Add Status Badge

Add to your `README.md`:

```markdown
![CI/CD](https://github.com/your-username/your-repo/workflows/CI%2FCD%20Pipeline/badge.svg)
```

---

## Next Steps

1. **Add Tests**: Create test files in `__tests__` directory
2. **Configure Vercel**: Link your Vercel project
3. **Setup Database**: Use Vercel Postgres or external provider
4. **Domain Setup**: Configure custom domain in Vercel
5. **Monitoring**: Add error tracking (Sentry, etc.)
