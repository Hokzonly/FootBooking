# Google Drive API Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in:
   - Name: "FootBooking Upload Service"
   - Description: "Service account for video uploads"
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

## Step 3: Generate JSON Key

1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON"
5. Download the file and rename it to `google-credentials.json`
6. Place it in the `backend` folder

## Step 4: Share Google Drive Folder

1. Create a folder in your Google Drive called "FootBooking Submissions"
2. Right-click the folder > "Share"
3. Add your service account email (found in the JSON file)
4. Give it "Editor" permissions
5. Copy the folder ID from the URL

## Step 5: Environment Variables

Create a `.env` file in the backend folder:

```env
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

## Step 6: Test the Setup

The backend will now upload videos to your Google Drive folder! 