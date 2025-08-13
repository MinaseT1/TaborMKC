// Test script to trigger image upload and check Supabase configuration
require('dotenv').config();
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Create a simple test image (SVG)
const testImageContent = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="12">Test</text>
</svg>`;

const testImagePath = path.join(__dirname, 'test-upload.svg');
fs.writeFileSync(testImagePath, testImageContent);

async function testImageUpload() {
  console.log('🧪 Testing image upload functionality...');
  
  try {
    const formData = new FormData();
    
    // Add member data
    formData.append('firstName', 'Test');
    formData.append('middleName', 'Image');
    formData.append('lastName', 'Upload');
    formData.append('email', `test-upload-${Date.now()}@example.com`);
    formData.append('phone', '+251911234567');
    formData.append('subcity', 'Test Subcity');
    formData.append('kebele', '01');
    formData.append('dateOfBirth', '1990-01-01');
    formData.append('gender', 'MALE');
    formData.append('maritalStatus', 'SINGLE');
    formData.append('profession', 'Tester');
    formData.append('educationLevel', 'BACHELOR');
    formData.append('childrenAges', JSON.stringify([]));
    formData.append('uniqueSkills', JSON.stringify(['Testing']));
    formData.append('childrenInfo', JSON.stringify([]));
    
    // Add image file
    const imageBuffer = fs.readFileSync(testImagePath);
    formData.append('profileImage', imageBuffer, {
      filename: 'test-upload.svg',
      contentType: 'image/svg+xml'
    });
    
    console.log('📤 Sending registration request with image...');
    
    const response = await fetch('http://localhost:3000/api/members', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Registration with image successful!');
      console.log('👤 Member created:', {
        id: data.member.id,
        name: `${data.member.firstName} ${data.member.lastName}`,
        email: data.member.email,
        profileImage: data.member.profileImage
      });
      
      if (data.member.profileImage && data.member.profileImage.startsWith('http')) {
        console.log('🌐 Image uploaded to cloud storage successfully!');
      } else if (data.member.profileImage && data.member.profileImage.startsWith('local:')) {
        console.log('💾 Image stored locally (cloud storage not configured)');
      } else {
        console.log('❓ Unknown image storage result');
      }
    } else {
      console.log('❌ Registration failed:', data.error || 'Unknown error');
    }
    
  } catch (error) {
    console.log('❌ Error testing image upload:', error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

// Run the test
testImageUpload();