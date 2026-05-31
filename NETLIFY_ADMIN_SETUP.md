# Netlify Admin Setup

This site is now static and Netlify friendly. It does not need the old local Node server for editing content.

## Deploy

1. Push this folder to a GitHub repository.
2. Create a Netlify site from that GitHub repository.
3. Keep the publish directory as `.`.
4. No build command is required.

## Enable Admin Panel

1. In Netlify, open your site.
2. Go to **Identity** and enable Identity.
3. Go to **Identity > Services** and enable **Git Gateway**.
4. Invite admin users from **Identity > Invite users**.
5. Open `/admin/` on your deployed site.

## What Can Be Edited

The admin panel edits `content.json`, which is used by the website pages:

- Home page title, subtitle, leader messages, gallery, and slideshows
- Upcoming events
- Past events and event slideshow images
- Committee members
- About page content
- Contact page content
- Page background slideshows
- Membership list

Image uploads from the admin panel are stored in the `images` folder and committed to the GitHub repository by Netlify Git Gateway.

## Important Notes

- After saving in the admin panel, Netlify will rebuild/redeploy the site automatically.
- The old local-server files are excluded from Netlify deploy through `.netlifyignore`.
- If you change the GitHub branch name, update `admin/config.yml` from `branch: main` to your branch name.
