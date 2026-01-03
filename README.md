# New Tabinator

A minimal, calm Chrome extension that overrides the New Tab page with a reflective prompt and search box.

## Features

- 🧘 **Calm interface** — Clean white space, subtle shadows, thoughtful design
- 🔍 **Smart search** — Uses your default search engine, not hardcoded
- ⚡ **Fast** — No external calls, system fonts, <100ms load
- 🎹 **Keyboard-first** — Auto-focus on search input
- 🔒 **Private** — No analytics, no trackers, no external calls

## Prerequisites

- [Bun](https://bun.sh) — Fast JavaScript runtime and package manager

```bash
# Install Bun (macOS/Linux)
curl -fsSL https://bun.sh/install | bash
```

## Development

### Build the extension

```bash
# Install dependencies (none currently, but good practice)
bun install

# Build to dist/
bun run build
```

### Load in Chrome

1. Open `chrome://extensions/` in Chrome
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. Open a new tab! ✨

### Development workflow

```bash
# Make changes to src/ files
# Rebuild
bun run build

# In Chrome: click the refresh icon on the extension card
# Or press Cmd+Shift+R on the new tab page
```

## Project Structure

```
new-tabinator/
├── src/
│   ├── newtab.html    # Page structure
│   ├── newtab.css     # Styling
│   └── newtab.js      # Search logic
├── icons/             # Extension icons (optional)
├── manifest.json      # Chrome extension config
├── build.js           # Build script
└── dist/              # Build output (load this in Chrome)
```

## Packaging for Chrome Web Store

```bash
# Build production version
bun run build

# Create zip from dist/
cd dist && zip -r ../new-tabinator.zip . && cd ..
```

Upload `new-tabinator.zip` to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Design Decisions

- **System fonts** — `-apple-system, BlinkMacSystemFont, system-ui` for instant rendering
- **Chrome Search API** — `chrome.search.query()` respects user's default search engine
- **No bundler** — Simple file copy keeps build fast and dependencies at zero
- **CSS variables** — Easy theming without framework overhead

## License

MIT
