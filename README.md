<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6fc77077-4fde-4515-bbbb-304a03de5af3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
## cPanel shared hosting deployment

This project builds to static files that can be uploaded to cPanel shared hosting.

1. Run `npm.cmd install` if dependencies are not installed.
2. Run `npm.cmd run build`.
3. Upload the contents of `dist/` to `public_html/` or to any sub-folder such as `public_html/plumbing/`.
4. Make sure hidden files are included during upload. The generated `dist/.htaccess` file is required for Apache fallback routing, MIME types, and asset caching.

The Vite build uses relative asset paths, so the same `dist/` output works from the domain root or from a sub-folder.
