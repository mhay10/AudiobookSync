# Audiobook Sync

Syncs audio positions of audiobooks or music across multiple devices.

---

TODO:

- [x] Enable navigation buttons
- [x] Fix bug on windows where `mklink` doesn't get metadata (Bypasses with `ffprobe`)
- [x] Make desktop app (Cross platform)
- [ ] Make android app (If you use apple, I won't make something for that. Do it yourself)
- [ ] Add Offline Function (Desktop and Android app)

---

## Prerequisites

- FFMpeg
- NodeJS
- Admin access (Windows only)

## Setup

1. Install dependencies
2. Link you audiobook/music folder to `audio`
    - Linux: `ln -s src_dir audio`
    - Windows: `mklink /d audio src_dir`
3. Create the database by running the `audio` script
4. To start the server, run the `start` script

## Port Forwarding

To expose the server to other networks, use [localtunnel](https://www.npmjs.com/package/localtunnel) for an easy setup.
