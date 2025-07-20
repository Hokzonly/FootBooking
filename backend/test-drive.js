const { google } = require('googleapis');
require('dotenv').config();

async function testGoogleDrive() {
  try {
    console.log('🔍 Testing Google Drive connection...');
    
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json',
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    // Test listing files
    const response = await drive.files.list({
      pageSize: 5,
      fields: 'files(id, name, size)',
    });

    console.log('✅ Google Drive connection successful!');
    console.log(`📁 Found ${response.data.files?.length || 0} files in Drive`);
    
    if (response.data.files && response.data.files.length > 0) {
      console.log('📋 Sample files:');
      response.data.files.forEach(file => {
        console.log(`  - ${file.name} (${file.size} bytes)`);
      });
    }

    // Test folder access
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (folderId) {
      console.log(`📂 Testing folder access: ${folderId}`);
      const folderResponse = await drive.files.list({
        pageSize: 1,
        fields: 'files(id, name)',
        q: `'${folderId}' in parents`
      });
      
      console.log(`✅ Folder access successful! Found ${folderResponse.data.files?.length || 0} files in target folder`);
    } else {
      console.log('⚠️  No GOOGLE_DRIVE_FOLDER_ID set in .env file');
    }

  } catch (error) {
    console.error('❌ Google Drive test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure google-credentials.json exists in backend folder');
    console.log('2. Check that GOOGLE_DRIVE_FOLDER_ID is set in .env file');
    console.log('3. Verify the service account has access to the folder');
  }
}

testGoogleDrive(); 