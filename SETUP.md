# Valentine's Visual Novel - Setup Guide

## Media Files Required

To complete the visual novel experience, you need to add the following media files:

### Video Files

Place the following video files in the `public/videos/` directory:

- `scene1.mp4` - First meeting scene
- `scene2.mp4` - Growing connection scene
- `scene3.mp4` - Happy moments together scene
- `scene4.mp4` - Deeper feelings scene
- `scene5.mp4` - Valentine's Day approach scene
- `scene6.mp4` - Final confession scene

**Video Requirements:**
- Aspect ratio: 9:16 (vertical/portrait format)
- Format: MP4
- Recommended resolution: 1080x1920 or 720x1280
- The videos will loop automatically

### Audio File

Place the background music file in the `public/audio/` directory:

- `background-music.mp3` - Retro 8-bit lo-fi love song

**Audio Requirements:**
- Format: MP3
- Style: 8-bit retro/lo-fi romantic
- The audio will loop automatically

## Directory Structure

```
public/
├── audio/
│   └── background-music.mp3
└── videos/
    ├── scene1.mp4
    ├── scene2.mp4
    ├── scene3.mp4
    ├── scene4.mp4
    ├── scene5.mp4
    └── scene6.mp4
```

## Customization

### Story Text

Edit the story dialogue in `src/data/storyData.ts`:

```typescript
export const storyScenes: StoryScene[] = [
  {
    id: 1,
    videoSrc: '/videos/scene1.mp4',
    dialogue: 'Your custom text here...'
  },
  // ... more scenes
];
```

### Colors and Styling

The app uses a retro pixel art aesthetic with romantic pastels. Main colors:
- Pink: `#ec4899`
- Purple: `#8b5cf6`
- Deep purple/pink gradients for backgrounds

Modify colors in the component files or `tailwind.config.js`.

## Features

- Mobile-first responsive design
- Desktop view with blurred background effect
- Smooth page transitions
- Retro pixel art aesthetic with Press Start 2P font
- Audio controls with mute/unmute toggle
- Full-screen video backgrounds
- Interactive dialogue boxes
- Touch/click to advance

## Running the App

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
