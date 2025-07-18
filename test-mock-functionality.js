// Test script for mock functionality
const { mockAuthService } = require('./src/mockFunctionality/mockServices/mockAuthService');
const { mockNoteService } = require('./src/mockFunctionality/mockServices/mockNoteService');
const { MOCK_CONFIG } = require('./src/mockFunctionality/utils/constants');

const testMockFunctionality = async () => {
  try {
    console.log('🎭 Testing Mock Functionality...\n');
    
    // Test login
    console.log('1. Testing Mock Login...');
    const loginResult = await mockAuthService.login(
      MOCK_CONFIG.TEST_USER.email, 
      MOCK_CONFIG.TEST_USER.password
    );
    console.log('✅ Login successful:', loginResult.user.fullName);
    
    // Test get current user
    console.log('\n2. Testing Get Current User...');
    const currentUser = await mockAuthService.getCurrentUser();
    console.log('✅ Current user:', currentUser.fullName);
    
    // Test get notes
    console.log('\n3. Testing Get Notes...');
    const notes = await mockNoteService.getUserNotes();
    console.log(`✅ Found ${notes.length} mock notes:`);
    notes.forEach((note, index) => {
      console.log(`   ${index + 1}. ${note.title}`);
    });
    
    // Test create note
    console.log('\n4. Testing Create Note...');
    const newNote = await mockNoteService.createNote({
      title: 'Test Note from Mock System',
      content: 'This note was created by the mock service test!'
    });
    console.log('✅ Note created:', newNote.title);
    
    // Test search notes
    console.log('\n5. Testing Search Notes...');
    const searchResults = await mockNoteService.searchNotes('test');
    console.log(`✅ Search found ${searchResults.length} notes with "test"`);
    
    // Test logout
    console.log('\n6. Testing Logout...');
    await mockAuthService.logout();
    console.log('✅ Logout successful');
    
    console.log('\n🎉 All mock functionality tests passed!');
    console.log('\n📝 Mock System Ready:');
    console.log(`   📧 Email: ${MOCK_CONFIG.TEST_USER.email}`);
    console.log(`   🔑 Password: ${MOCK_CONFIG.TEST_USER.password}`);
    console.log(`   📱 Mode: ${MOCK_CONFIG.USE_MOCK ? 'MOCK' : 'REAL'}`);
    
  } catch (error) {
    console.error('\n❌ Mock test failed:', error.message);
  }
};

// Only run test if this file is executed directly
if (require.main === module) {
  testMockFunctionality();
}

module.exports = testMockFunctionality;
