# Local Static Website Guide

This version can run directly on a local computer with HTML, CSS, and JavaScript.

## Open Website

Open `index.html` in Chrome or Edge.

The pages load content from `content.js` through `js/contentLoader.js`.

## Edit Content Locally

Open `local-admin.html` in Chrome or Edge.

You can edit:

- Homepage title and subtitle
- Leader messages
- Homepage gallery
- Upcoming events
- Past events
- Committee members
- About page content
- Contact details
- Members list

## Save Changes

For best results, first click **Choose Website Folder** and select the extracted website folder.

Then edit content and click **Save content.js**.

If you selected the website folder, the editor saves `content.js` directly in that folder.

If your browser downloads the file instead, copy the downloaded `content.js` into the website folder and replace the old file.

Then refresh `index.html` or any page to see the updated content.

## Images

Image and video fields show a preview and a **Choose File** button.

If you selected the website folder first, choosing a media file copies it into the `images` folder and saves a relative path like:

```text
images/my-event-photo.jpg
```

If the browser does not allow folder access, copy the media file into the `images` folder manually and enter the relative path.

## Intranet Notes

Use relative paths only:

```text
images/photo.jpg
```

Do not save paths like:

```text
C:\Users\Name\Pictures\photo.jpg
file:///C:/Users/Name/Pictures/photo.jpg
```

The loader includes a safety fix for old `file:///.../images/...` paths, but clean relative paths are best for intranet deployment.
