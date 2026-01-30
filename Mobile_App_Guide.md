# Store Bloom Mobile App Build System

This project is configured to generate **White-labeled Native Android/iOS Apps** for any tenant.

## Prerequisites
- Node.js installed
- **Android Studio** (for Android builds)
- **Xcode** (for iOS builds, Mac only)

## How to Build a Tenant App

We have created an automated script to handle the configuration for you.

### 1. Run the Build Script
Open your terminal and run:

```bash
node build-mobile-app.js
```

You will be asked for 3 things:
1.  **Tenant Slug**: The exact `store_slug` from the database (e.g., `dannys-pizza`).
2.  **App Name**: The name displayed on the phone home screen (e.g., `Danny's Pizza`).
3.  **App ID**: The unique package identifier (e.g., `com.dannyspizza.app`).

### 2. Compile the App

After the script finishes, it will sync the code to the `android` folder.

#### For Android:
1.  Run `npx cap open android`
2.  Android Studio will open.
3.  Wait for the Gradle Sync to finish (bottom right bar).
4.  Go to **Build > Generate Signed Bundle / APK**.
5.  Follow the prompts to create your `.apk` file to send to the client or upload to Play Store.

## Important Notes

- **Resetting:** After you are done building the specific client app, the source code (`src/native-config.ts`) remains in "Store Mode". If you want to continue developing the main platform features, reset it manually or run the script again with "Platform" settings.
- **Icons:** You will need to manually replace the icons in `android/app/src/main/res` for each client if you want custom icons. The script does not automate icon generation (yet).
