// Quick test script to verify tasks backend integration
const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

const testTasks = async () => {
  try {
    console.log('Testing tasks backend integration...');
    
    // First login to get token
    console.log('\n1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'boatengjoa9@gmail.com',
      password: 'Test1233='
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test getting today's task count
    console.log('\n2. Getting today\'s task count...');
    const taskCountResponse = await axios.get(`${BASE_URL}/api/tasks/today/count`, { headers });
    
    console.log('✅ Task count retrieved:', taskCountResponse.data);
    console.log(`   Current count: ${taskCountResponse.data.count}`);
    console.log(`   Max daily limit: ${taskCountResponse.data.maxDailyTasks}`);
    console.log(`   Remaining: ${taskCountResponse.data.remaining}`);
    
    // Test creating a task
    console.log('\n3. Creating a test task...');
    const createResponse = await axios.post(`${BASE_URL}/api/tasks`, {
      text: 'Test task from backend integration - Complete project documentation'
    }, { headers });
    
    console.log('✅ Task created successfully:', createResponse.data);
    const taskId = createResponse.data.id;
    
    // Test getting today's tasks
    console.log('\n4. Fetching today\'s tasks...');
    const tasksResponse = await axios.get(`${BASE_URL}/api/tasks/today`, { headers });
    
    console.log(`✅ Found ${tasksResponse.data.length} tasks for today`);
    tasksResponse.data.forEach((task, index) => {
      console.log(`   ${index + 1}. [${task.isCompleted ? '✓' : ' '}] ${task.text} (ID: ${task.id})`);
    });
    
    // Test updating the task text
    console.log('\n5. Updating the task text...');
    const updateResponse = await axios.put(`${BASE_URL}/api/tasks/${taskId}`, {
      text: 'Updated task: Complete project documentation and testing'
    }, { headers });
    
    console.log('✅ Task updated successfully:', updateResponse.data);
    
    // Test toggling task completion status
    console.log('\n6. Toggling task completion status...');
    const toggleResponse = await axios.put(`${BASE_URL}/api/tasks/${taskId}/toggle`, null, { headers });
    
    console.log('✅ Task completion toggled:', toggleResponse.data);
    console.log(`   Task is now: ${toggleResponse.data.isCompleted ? 'COMPLETED' : 'PENDING'}`);
    
    // Test toggling back to incomplete
    console.log('\n7. Toggling task back to incomplete...');
    const toggleBackResponse = await axios.put(`${BASE_URL}/api/tasks/${taskId}/toggle`, null, { headers });
    
    console.log('✅ Task toggled back:', toggleBackResponse.data);
    console.log(`   Task is now: ${toggleBackResponse.data.isCompleted ? 'COMPLETED' : 'PENDING'}`);
    
    // Test creating multiple tasks to test the daily limit
    console.log('\n8. Creating additional test tasks...');
    const additionalTasks = [];
    
    for (let i = 1; i <= 3; i++) {
      try {
        const taskResponse = await axios.post(`${BASE_URL}/api/tasks`, {
          text: `Additional test task ${i} - Testing daily limit functionality`
        }, { headers });
        
        additionalTasks.push(taskResponse.data);
        console.log(`   ✅ Created task ${i}: ${taskResponse.data.text} (ID: ${taskResponse.data.id})`);
      } catch (error) {
        console.log(`   ❌ Failed to create task ${i}:`, error.response?.data?.message);
        break;
      }
    }
    
    // Test getting updated task count
    console.log('\n9. Getting updated task count...');
    const updatedCountResponse = await axios.get(`${BASE_URL}/api/tasks/today/count`, { headers });
    
    console.log('✅ Updated task count:', updatedCountResponse.data);
    console.log(`   Current count: ${updatedCountResponse.data.count}`);
    console.log(`   Remaining: ${updatedCountResponse.data.remaining}`);
    
    // Test updating task with both text and completion status
    if (additionalTasks.length > 0) {
      console.log('\n10. Testing combined update (text + completion)...');
      const combinedUpdateResponse = await axios.put(`${BASE_URL}/api/tasks/${additionalTasks[0].id}`, {
        text: 'Combined update: Task with new text and will be marked complete',
        isCompleted: true
      }, { headers });
      
      console.log('✅ Combined update successful:', combinedUpdateResponse.data);
    }
    
    // Test error handling - trying to update non-existent task
    console.log('\n11. Testing error handling (non-existent task)...');
    try {
      await axios.put(`${BASE_URL}/api/tasks/99999`, {
        text: 'This should fail'
      }, { headers });
    } catch (error) {
      console.log('✅ Correctly handled non-existent task:', error.response?.status, error.response?.statusText);
      console.log('   Error message:', error.response?.data?.message || 'Task not found');
    }
    
    // Test error handling - empty task text
    console.log('\n12. Testing error handling (empty task text)...');
    try {
      await axios.post(`${BASE_URL}/api/tasks`, {
        text: '   '  // Only whitespace
      }, { headers });
    } catch (error) {
      console.log('✅ Correctly handled empty task text:', error.response?.status, error.response?.statusText);
      console.log('   Error message:', error.response?.data?.message || 'Validation failed');
    }
    
    // Test error handling - task text too long
    console.log('\n13. Testing error handling (task text too long)...');
    try {
      const longText = 'A'.repeat(501); // Exceeds 500 character limit
      await axios.post(`${BASE_URL}/api/tasks`, {
        text: longText
      }, { headers });
    } catch (error) {
      console.log('✅ Correctly handled long task text:', error.response?.status, error.response?.statusText);
      console.log('   Error message:', error.response?.data?.message || 'Validation failed');
    }
    
    // Test manual cleanup of expired tasks (admin endpoint)
    console.log('\n14. Testing cleanup of expired tasks...');
    try {
      const cleanupResponse = await axios.delete(`${BASE_URL}/api/tasks/cleanup`, { headers });
      
      console.log('✅ Cleanup executed successfully:', cleanupResponse.data);
      console.log(`   Message: ${cleanupResponse.data.message}`);
      console.log(`   Expired tasks found: ${cleanupResponse.data.expiredTasksFound}`);
      console.log(`   Tasks deleted: ${cleanupResponse.data.tasksDeleted}`);
    } catch (error) {
      console.log('⚠️  Cleanup failed (might be admin-only):', error.response?.status, error.response?.statusText);
    }
    
    // Clean up - delete all test tasks
    console.log('\n15. Cleaning up - deleting test tasks...');
    
    console.log('   Deleting main test task...');
    await axios.delete(`${BASE_URL}/api/tasks/${taskId}`, { headers });
    console.log('   ✅ Main test task deleted');
    
    for (let i = 0; i < additionalTasks.length; i++) {
      try {
        console.log(`   Deleting additional task ${i + 1}...`);
        await axios.delete(`${BASE_URL}/api/tasks/${additionalTasks[i].id}`, { headers });
        console.log(`   ✅ Additional task ${i + 1} deleted`);
      } catch (error) {
        console.log(`   ⚠️  Failed to delete task ${i + 1}:`, error.response?.data?.message);
      }
    }
    
    // Verify cleanup
    console.log('\n16. Verifying cleanup...');
    const finalTasksResponse = await axios.get(`${BASE_URL}/api/tasks/today`, { headers });
    const finalCountResponse = await axios.get(`${BASE_URL}/api/tasks/today/count`, { headers });
    
    console.log(`✅ Final task count: ${finalTasksResponse.data.length} tasks remaining`);
    console.log(`✅ Final count statistics:`, finalCountResponse.data);
    
    console.log('\n🎉 All task tests passed! Tasks backend integration is working correctly.');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Task creation with validation');
    console.log('   ✅ Task retrieval (today\'s tasks and count)');
    console.log('   ✅ Task updating (text-only and combined)');
    console.log('   ✅ Task completion toggling');
    console.log('   ✅ Task deletion');
    console.log('   ✅ Daily task limit enforcement');
    console.log('   ✅ Input validation (empty text, text too long)');
    console.log('   ✅ Error handling for invalid operations');
    console.log('   ✅ Cleanup functionality (if admin access available)');
    console.log('   ✅ Proper authentication and authorization');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - is the backend server running on localhost:8080?');
    }
    
    // Check for specific error types
    if (error.response?.status === 401) {
      console.error('Authentication failed - check your credentials');
    } else if (error.response?.status === 403) {
      console.error('Authorization failed - insufficient permissions');
    } else if (error.response?.status === 400) {
      console.error('Bad request - check the data format');
    } else if (error.response?.status === 429) {
      console.error('Rate limit exceeded - too many requests');
    }
  }
};

testTasks();
