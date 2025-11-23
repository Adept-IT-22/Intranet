# 📝 Render Setup Notes

## Important: Update nginx.conf for Render

Before deploying frontend to Render, you need to update `nginx.conf`:

1. Open `nginx.conf`
2. Find the line: `proxy_pass http://intranet-backend:8000/api/;`
3. Replace with: `proxy_pass https://adept-intranet-backend.onrender.com/api/;`
4. Also update WebSocket location `/ws/` to use Render backend URL
5. Commit and push

**Or use the Render-specific config:**

When creating frontend service in Render:
- Use `Dockerfile.nginx.render` instead of `Dockerfile.nginx`
- This uses `nginx.render.conf` which is pre-configured for Render

## Backend URL Configuration

Your backend will be at: `https://adept-intranet-backend.onrender.com`

Make sure to:
1. Update `ALLOWED_HOSTS` in backend env vars
2. Update `CORS_ALLOWED_ORIGINS` to include frontend URL
3. Update nginx.conf to point to backend URL

## Environment Variables Summary

### Backend:
- `DATABASE_URL` - From PostgreSQL service
- `ALLOWED_HOSTS` - Include Render URL
- `DEBUG` - `False`
- `SECRET_KEY` - Generate secure key
- `CORS_ALLOWED_ORIGINS` - Frontend URL

### Frontend:
- `BACKEND_URL` - Backend Render URL (if using env-based config)

