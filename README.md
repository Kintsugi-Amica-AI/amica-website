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

Messages from the contact form are emailed to the team inbox **teamkintsugi2026@gmail.com** through
[FormSubmit](https://formsubmit.co) — a free form-to-email service, so the site needs no server.

**One-time activation (do this once):**

1. Put the site on a web address (or run it locally with `npx serve .` — the form doesn't send from a
   page opened straight from disk as `file://`).
2. Send a test message from the form.
3. FormSubmit emails **teamkintsugi2026@gmail.com** a message titled "Action Required: Activate FormSubmit".
   Open it and click **Activate Form**.
4. From then on every message arrives in that inbox as a table (name, email, topic, subject, message).
   Just press **Reply** — the reply goes straight to the person who wrote in.

Optional: after activation FormSubmit also gives you a random alias (e.g. `https://formsubmit.co/ajax/a1b2c3…`).
Using it in place of the email address in `js/main.js` and `index.html` hides the inbox address from spammers.

**Settings** — the `CONFIG` block at the top of `js/main.js`:

- `CONTACT_EMAIL` — the team inbox, shown on the page and used as the "send by email instead" fallback.
- `FORM_ENDPOINT` — where messages are posted. Swap in another service (Formspree, Web3Forms, or a Firebase
  HTTPS function in `amica-cloud-backend`) by changing this URL. Leave it empty to make the form open the
  visitor's email app instead.

Spam protection: a hidden honeypot field (`_honey`) silently drops bots. If a send fails, the visitor is
offered a link to email the team directly, so no message is lost.

## Motion

Entrance and scroll animations live in the "Motion" section at the end of `css/styles.css`, with the
pointer effects (hero parallax, card tilt), FAQ animation and theme transition in `js/main.js`.
Everything turns off automatically for visitors who have "reduce motion" enabled on their device.

## Deploy

Any static host works. With Firebase Hosting (already used by `amica-cloud-backend`), point a hosting
target's `public` directory at this folder and run `firebase deploy --only hosting`.
