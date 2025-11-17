Place your splash assets here:

- `splash.png` - full-screen background image as shown in the mock (recommended size: 1920x1920 or similar square, will be resized by ImageBackground). 
- `logo-small.png` - circular logo image used inside the splash's white translucent circle (recommended size: 512x512, transparent background).

If you don't add these images, the splash will fall back to `theme.colors.primary` as background color and may fail to load the require() paths in debug builds. To test without images, replace the `require()` calls in `src/screens/SplashScreen.tsx` with `undefined` or remove the `source` prop from `ImageBackground`.
