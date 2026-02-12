# 📋 Deployment Checklist

Use this checklist before deploying updates to production.

## Pre-Deployment

- [ ] **Test locally** - All features work on localhost
- [ ] **Run migrations locally** - `python manage.py migrate`
- [ ] **Check for errors** - No console errors or warnings
- [ ] **Update version number** - Increment version tag (e.g., v15 → v16)
- [ ] **Review changes** - Know what you're deploying

## Database Changes

If you added new models or changed existing ones:

- [ ] **Create migrations** - `python manage.py makemigrations`
- [ ] **Test migrations** - `python manage.py migrate` (locally)
- [ ] **Backup database** - (if using production database)

## Deployment Steps

1. [ ] **Build images** - Docker images build successfully
2. [ ] **Push to ACR** - Images pushed to Azure Container Registry
3. [ ] **Deploy to VM** - Containers deployed and running
4. [ ] **Run migrations** - Database migrations executed
5. [ ] **Verify containers** - Both containers are running

## Post-Deployment Verification

- [ ] **Application loads** - http://4.246.200.111/Intranet/ works
- [ ] **Login works** - Can log in with credentials
- [ ] **API works** - API endpoints respond correctly
- [ ] **WebSocket works** - Chat real-time features work
- [ ] **New features work** - Test newly deployed features
- [ ] **Check logs** - No errors in container logs

## Rollback Plan

If something goes wrong:

- [ ] **Know previous version** - Note the previous working version
- [ ] **Keep old images** - Don't delete previous version images
- [ ] **Test rollback** - Know how to rollback quickly

## Common Issues

- **Container won't start** → Check logs: `docker logs intranet-backend`
- **Migrations fail** → Check database connection
- **API not working** → Check ALLOWED_HOSTS environment variable
- **WebSocket not working** → Check firewall/network settings

