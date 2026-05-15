# Madina Bekassyl — Interior Design Portfolio

Static portfolio site for interior designer **Madina Bekassyl**, served via GitHub Pages.

## Stack

Pure HTML + CSS + JS — no build tools, no dependencies.

## Structure

```
docs/
├── index.html               # single-page site (all CSS and JS inline)
└── static/
    └── images/
        ├── logo/            # logo-black.png, logo-white.png, signature*.gif/mp4
        ├── photos/          # portrait.jpg, portrait-2.jpg
        └── projects/        # belle-view/, kazybek/, arena-park/, arena-park-2/, arman/, office/
```

## Features

- Project gallery modal with CSS masonry grid and stagger animations
- Full-screen lightbox with thumbnail strip, keyboard (←/→/Esc) and swipe navigation
- Custom cursor with lerp animation
- Scroll-reveal animations throughout
- MP4 signature animation with GIF fallback
- Fully responsive (mobile menu, single-column gallery)

## Deployment

GitHub Pages serves directly from the `docs/` folder on `master`.  
Any push to `master` updates the live site within ~1 minute.

---

Portfolio of [Madina Bekassyl](https://instagram.com/madinabks.interiors) — interior designer, Almaty, Kazakhstan.
