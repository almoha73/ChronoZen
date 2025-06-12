# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at `src/app/page.tsx`.

## Notification Sounds

This application uses a sound notification (`notification.mp3`) for timer events. For this to work:

1.  **Create a `public` folder at the root of your project** (if it doesn't already exist). This folder should be at the same level as `src`, `package.json`, etc.
2.  Place your desired notification sound file inside this `public` folder and name it `notification.mp3`.

The components `src/components/ChronoZenApp.tsx` and `src/components/PomodoroController.tsx` are already configured to play `/notification.mp3` when this file is present in the `public` folder.
