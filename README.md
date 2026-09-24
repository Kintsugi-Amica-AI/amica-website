# Amica website

The public website for **Amica** — the women's safety app. A static site (HTML, CSS, JavaScript) with no build step, styled with the same "Blossom" theme as the mobile app (`amica-mobile-app/lib/core/constants/app_colors.dart`) and the app's own bundled fonts (Bricolage Grotesque and Public Sans).

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .            # or: python -m http.server 8080
```

## Structure

```
index.html              the whole page (hero, features, how it works, screens, team, FAQ, contact)
css/styles.css          Blossom tokens (light + dark), layout, responsive rules
js/main.js              theme toggle, mobile menu, scroll reveal, gallery, contact form
assets/fonts/           app fonts (SIL OFL 1.1, see OFL.txt)
assets/images/          logo, favicon, illustration, app screenshots (screens/*.webp)
```

## Receiving messages (contact form)

The form posts to a Firebase function in **amica-cloud-backend**:

```
https://us-central1-amica-cloud-backend.cloudfunctions.net/submitContactMessage
```

The function checks the message, saves it in Firestore (`contact_messages`) and emails it to
**teamkintsugi2026@gmail.com**. Press **Reply** on that email to answer the visitor directly. Every
message is also kept in the Firebase console, so nothing is lost if an email fails.

One-time setup (Gmail App Password, secret, deploy) is in
`amica-cloud-backend/docs/contact_form_setup.md`.

Settings — the `CONFIG` block at the top of `js/main.js`:

- `CONTACT_EMAIL` — shown on the page and used for the "send it by email instead" link if sending fails.
- `FORM_ENDPOINT` — the function URL above.

The function only accepts requests from `localhost`, `127.0.0.1` and the project's Firebase Hosting
domains. When the website gets its own domain, add it to `CONTACT_ALLOWED_ORIGINS` in
`amica-cloud-backend/functions/src/services/contactMessageService.ts` and redeploy.

Spam protection: a hidden honeypot field (`_honey`) and a limit of 5 messages per hour per sender.

## Motion

Entrance and scroll animations live in the "Motion" section at the end of `css/styles.css`, with the
pointer effects (hero parallax, card tilt), FAQ animation and theme transition in `js/main.js`.
Everything turns off automatically for visitors who have "reduce motion" enabled on their device.

## Deploy

Any static host works. With Firebase Hosting (already used by `amica-cloud-backend`), point a hosting
target's `public` directory at this folder and run `firebase deploy --only hosting`.
