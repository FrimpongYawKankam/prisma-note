// Quick test script to verify notes backend integration
const axios = require('axios');

const BASE_URL = 'http://10.40.32.231:8080';

const testNotes = async () => {
  try {
    console.log('Testing notes backend integration...');
    
    // First login to get token
    console.log('\n1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'boatengjoa9@gmail.com',
      password: 'Test1233='
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Test creating a note
    console.log('\n2. Creating a test note...');
    const createResponse = await axios.post(`${BASE_URL}/api/notes`, {
      title: 'Test Note from Frontend Integration',
      content: 'This note was created to test the frontend-backend integration.'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Note created successfully:', createResponse.data);
    const noteId = createResponse.data.id;
    
    // Test getting all notes
    console.log('\n3. Fetching all notes...');
    const notesResponse = await axios.get(`${BASE_URL}/api/notes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Found ${notesResponse.data.length} notes`);
    notesResponse.data.forEach((note, index) => {
      console.log(`   ${index + 1}. ${note.title} (ID: ${note.id})`);
    });
    
    // Test updating the note
    console.log('\n4. Updating the test note...');
    const updateResponse = await axios.put(`${BASE_URL}/api/notes/${noteId}`, {
      title: 'Updated Test Note',
      content: 'This content has been updated via the API test.'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Note updated successfully:', updateResponse.data);
    
    // Test searching notes
    console.log('\n5. Searching notes...');
    const searchResponse = await axios.get(`${BASE_URL}/api/notes/search?keyword=test`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Search found ${searchResponse.data.length} notes with keyword "test"`);
    
    // Clean up - delete the test note
    console.log('\n6. Cleaning up - deleting test note...');
    await axios.delete(`${BASE_URL}/api/notes/${noteId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Test note deleted successfully');
    
    console.log('\n🎉 All tests passed! Notes backend integration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - is the backend server running on 10.40.32.231:8080?');
    }
  }
};

testNotes();
