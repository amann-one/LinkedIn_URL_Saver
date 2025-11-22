# LinkedIn URL Saver - Installation Guide

## How to Install the Chrome Extension

### Step 1: Prepare the Extension Files
1. Make sure you have the complete extension folder with all files:
   - `manifest.json`
   - `popup.html`
   - `popup.js`
   - `images/` folder (containing icon16.png, icon48.png, icon128.png)

### Step 2: Open Chrome Extensions Page
1. Open Google Chrome
2. Click the **three-dot menu** (⋮) in the top-right corner
3. Select **More tools** → **Extensions**
   - Or navigate directly to: `chrome://extensions/`

### Step 3: Enable Developer Mode
1. In the top-right corner of the Extensions page, toggle **Developer mode** ON

### Step 4: Load the Extension
1. Click the **Load unpacked** button
2. Navigate to the folder containing your extension files
3. Select the folder and click **Select Folder**

### Step 5: Verify Installation
1. The extension should now appear in your Extensions list as "LinkedIn URL Saver"
2. Click the extension icon in Chrome's toolbar to see the popup
3. You should see a button labeled "Profil speichern" (Save Profile) when on a LinkedIn page

## Configuration

Before using the extension, you need to update the Google Apps Script URL:

1. Open `popup.js` in a text editor
2. Find line 5: `const GOOGLE_SCRIPT_URL = '...'`
3. Replace the URL with your own Google Apps Script deployment URL
4. Also update the `SHEET_URL` on line 6 with your Google Sheet URL

## Using the Extension

1. Navigate to a LinkedIn profile, company page, or school page
2. Click the LinkedIn URL Saver icon in your Chrome toolbar
3. Click the "Profil speichern" button to save the URL and data to your Google Sheet
4. Click "Tabelle öffnen" to open your Google Sheet in a new tab

## Troubleshooting

**Extension doesn't appear**: Make sure Developer mode is enabled and you loaded the correct folder.

**Icons not showing**: Verify the `images/` folder is in the extension directory with all PNG files.

**Data not saving**: Check that your Google Apps Script URL is correctly configured in `popup.js`.

**Emojis showing as symbols**: The charset meta tag should be set to UTF-8 in popup.html (this is already configured).
