# Deployment Guide

This guide covers deploying the Leave Request PDF Maker PWA to production.

## Build Output

The production build is generated in the `dist/` directory by running:

```bash
npm run build
```

Build output includes:
- `index.html` - Main HTML entry point
- `assets/` - Minified JavaScript and CSS bundles
- `sw.js` - Service worker for offline support
- `manifest.webmanifest` - PWA manifest
- `icon-*.svg` - App icons
- `workbox-*.js` - Workbox runtime for service worker

## Static Hosting Requirements

The application is a **static site** and can be deployed to any static hosting service:

### Recommended Hosting Platforms

#### Netlify
1. Push code to Git repository
2. Import project in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add redirect rule in `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Vercel
1. Push code to Git repository
2. Import project in Vercel dashboard
3. Vercel automatically detects Vite configuration
4. Ensure output directory is set to `dist`

#### GitHub Pages
1. Build the project locally: `npm run build`
2. Create `gh-pages` branch with `dist/` contents
3. Or use `gh-pages` npm package:

```bash
npm install -g gh-pages
npm run build
gh-pages -d dist
```

#### Other Options
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket, configure CloudFront
- **Firebase Hosting**: `firebase deploy --only hosting`
- **Surge.sh**: `surge dist`
- **Static server**: Any web server serving static files

## HTTPS Requirement

**HTTPS is required** for PWA features to work correctly:

- Service workers require HTTPS (or localhost for development)
- PWA installation prompts only appear over HTTPS
- Secure contexts are required for certain APIs

### Getting HTTPS

Most hosting platforms provide free HTTPS:
- **Netlify**, **Vercel**: Automatic HTTPS via Let's Encrypt
- **GitHub Pages**: HTTPS enabled by default
- **Custom domains**: Use Let's Encrypt or Cloudflare SSL

## Content-Type Headers

The build generates files with correct extensions, but ensure your server serves them with these Content-Type headers:

| File Pattern | Content-Type |
|--------------|---------------|
| `*.html` | `text/html` |
| `*.js` | `application/javascript` or `text/javascript` |
| `*.css` | `text/css` |
| `*.json` | `application/json` |
| `*.webmanifest` | `application/manifest+json` |
| `*.svg` | `image/svg+xml` |

### Nginx Example

```nginx
types {
    application/manifest+json webmanifest;
}
```

### Apache Example

```apache
AddType application/manifest+json .webmanifest
```

Most modern servers handle these automatically.

## Service Worker Configuration

The service worker is configured in `vite.config.ts`:

- **Scope**: `/` (root directory)
- **Precache**: All static assets (JS, CSS, HTML, SVG, PNG, JPG, JSON)
- **Runtime Caching**: External resources with 30-day TTL
- **Fallback**: Navigate to `/index.html` for SPA routing

### Service Worker Scope

The service worker is scoped to `/` (root). Ensure:

- Site is deployed at root URL (e.g., `https://example.com/`)
- **Not** in a subdirectory (e.g., `https://example.com/leave-app/`)
- If deploying to subdirectory, update `vite.config.ts`:

```typescript
VitePWA({
  manifest: {
    scope: '/leave-app/',
    start_url: '/leave-app/',
  },
})
```

And also update `base` in Vite config:

```typescript
export default defineConfig({
  base: '/leave-app/',
  // ...
})
```

## Deployment Checklist

Before deploying to production:

- [ ] Run `npm run build` successfully
- [ ] Verify `dist/` contains all expected files
- [ ] Test build locally: `npm run preview`
- [ ] Ensure HTTPS is enabled on hosting platform
- [ ] Confirm Content-Type headers are correct
- [ ] Verify service worker scope matches deployment path
- [ ] Test PWA installation prompt
- [ ] Test offline functionality
- [ ] Verify PDF generation works
- [ ] Test on mobile devices (iOS, Android)

## Troubleshooting

### Service Worker Not Installing

1. Check HTTPS is enabled
2. Verify service worker is served from correct scope
3. Clear browser cache and reload
4. Check DevTools > Application > Service Workers

### PDF Generation Fails

1. Check browser console for errors
2. Ensure jsPDF is bundled correctly
3. Verify no CORS issues with external resources
4. Test on different browsers

### Icons Not Displaying

1. Verify icon files are in `dist/` directory
2. Check paths in `manifest.webmanifest` are correct
3. Ensure icons are served with `image/svg+xml` Content-Type
4. Test icon URLs directly in browser

### Build Errors

```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist
npm run build
```

### Runtime Errors in Production

1. Compare build output with development build
2. Check for missing environment variables
3. Verify all API endpoints and external URLs are correct
4. Check browser console for specific errors

## Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Performance Optimization

The build is already optimized:

- **Tree-shaking**: Removes unused code
- **Minification**: JavaScript and CSS are minified
- **Code splitting**: Chunks are generated for optimal loading
- **Asset hashing**: Cache busting via content hash in filenames

For additional optimization:

1. Enable CDN for static assets
2. Use compression (gzip/brotli) on server
3. Implement HTTP/2 or HTTP/3
4. Cache static assets aggressively

## Monitoring

After deployment:

- Monitor build size via `dist/` directory size
- Check Lighthouse scores for performance and PWA criteria
- Monitor service worker updates and caching behavior
- Test on slow 3G connections for performance

## Support

For issues related to:
- **Build process**: Check Vite documentation
- **PWA configuration**: Refer to Vite PWA plugin docs
- **Deployment**: Contact your hosting platform's support
