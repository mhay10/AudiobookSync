# Audiobook Sync

The program syncs audiobooks/music cross platform.

---

TODO:

- [ ] Make next and back buttons work
- [ ] Make android app (If you use apple, I won't make something for that. Do it yourself)

---

## Setup

1. Install dependencies
2. Link you audiobook/music folder to `audio`
    - Linux: `ln -s src_dir audio`
    - Windows: `mklink /d audio src_dir`
3. Create the database by running the `audio` script
4. To start the server, run the `start` script

## Port Forwarding

To expose the server to other networks, use [localtunnel](https://www.npmjs.com/package/localtunnel) for an easy setup.
