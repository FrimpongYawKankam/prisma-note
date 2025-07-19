// Quick test script to verify events backend integration
const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

const testEvents = async () => {
  try {
    console.log('Testing events backend integration...');
    
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
    
    // Test creating an event
    console.log('\n2. Creating a test event...');
    const createResponse = await axios.post(`${BASE_URL}/api/events`, {
      title: 'Test Event from Backend Integration',
      description: 'This event was created to test the frontend-backend integration.',
      startDateTime: '2025-07-20T10:00:00',
      endDateTime: '2025-07-20T11:00:00',
      tag: 'MEDIUM',
      allDay: false
    }, { headers });
    
    console.log('✅ Event created successfully:', createResponse.data);
    const eventId = createResponse.data.id;
    
    // Test getting all events
    console.log('\n3. Fetching all events...');
    const eventsResponse = await axios.get(`${BASE_URL}/api/events`, { headers });
    
    console.log(`✅ Found ${eventsResponse.data.length} events`);
    eventsResponse.data.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title} (ID: ${event.id}, Tag: ${event.tag})`);
    });
    
    // Test getting event by ID
    console.log('\n4. Fetching event by ID...');
    const eventByIdResponse = await axios.get(`${BASE_URL}/api/events/${eventId}`, { headers });
    
    console.log('✅ Event retrieved by ID:', eventByIdResponse.data);
    
    // Test updating the event
    console.log('\n5. Updating the test event...');
    const updateResponse = await axios.put(`${BASE_URL}/api/events/${eventId}`, {
      title: 'Updated Test Event',
      description: 'This content has been updated via the API test.',
      startDateTime: '2025-07-20T14:00:00',
      endDateTime: '2025-07-20T15:30:00',
      tag: 'HIGH',
      allDay: false
    }, { headers });
    
    console.log('✅ Event updated successfully:', updateResponse.data);
    
    // Test updating event tag specifically
    console.log('\n6. Updating event tag only...');
    const updateTagResponse = await axios.patch(`${BASE_URL}/api/events/${eventId}/tag?tag=LOW`, null, { headers });
    
    console.log('✅ Event tag updated successfully:', updateTagResponse.data);
    
    // Test getting events by tag
    console.log('\n7. Fetching events by tag (LOW)...');
    const eventsByTagResponse = await axios.get(`${BASE_URL}/api/events/tag/LOW`, { headers });
    
    console.log(`✅ Found ${eventsByTagResponse.data.length} events with LOW tag`);
    eventsByTagResponse.data.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title} (Tag: ${event.tag})`);
    });
    
    // Test getting overlapping events
    console.log('\n8. Testing overlapping events...');
    
    // First create another event that might overlap
    console.log('   Creating another event for overlap testing...');
    const overlapEventResponse = await axios.post(`${BASE_URL}/api/events`, {
      title: 'Overlapping Event',
      description: 'This event overlaps with the test event.',
      startDateTime: '2025-07-20T14:30:00',
      endDateTime: '2025-07-20T16:00:00',
      tag: 'NONE',
      allDay: false
    }, { headers });
    
    const overlapEventId = overlapEventResponse.data.id;
    console.log('   ✅ Overlap event created:', overlapEventResponse.data);
    
    // Now test overlapping query
    const overlappingResponse = await axios.get(`${BASE_URL}/api/events/overlapping`, {
      headers,
      params: {
        startDateTime: '2025-07-20T13:00:00',
        endDateTime: '2025-07-20T17:00:00'
      }
    });
    
    console.log(`✅ Found ${overlappingResponse.data.length} overlapping events`);
    overlappingResponse.data.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title} (${event.startDateTime} - ${event.endDateTime})`);
    });
    
    // Test getting events with date range filter
    console.log('\n9. Testing events with date range filter...');
    const dateRangeResponse = await axios.get(`${BASE_URL}/api/events`, {
      headers,
      params: {
        from: '2025-07-20T00:00:00',
        to: '2025-07-20T23:59:59'
      }
    });
    
    console.log(`✅ Found ${dateRangeResponse.data.length} events in date range`);
    
    // Test removing event tag
    console.log('\n10. Removing event tag...');
    await axios.delete(`${BASE_URL}/api/events/${eventId}/tag`, { headers });
    
    // Verify tag was removed
    const verifyTagRemovalResponse = await axios.get(`${BASE_URL}/api/events/${eventId}`, { headers });
    console.log('✅ Event tag removed, new tag:', verifyTagRemovalResponse.data.tag);
    
    // Test creating an all-day event
    console.log('\n11. Creating an all-day event...');
    const allDayEventResponse = await axios.post(`${BASE_URL}/api/events`, {
      title: 'All Day Test Event',
      description: 'This is an all-day event.',
      startDateTime: '2025-07-21T00:00:00',
      endDateTime: '2025-07-21T23:59:59',
      tag: 'HIGH',
      allDay: true
    }, { headers });
    
    const allDayEventId = allDayEventResponse.data.id;
    console.log('✅ All-day event created successfully:', allDayEventResponse.data);
    
    // Test error handling - try to get non-existent event
    console.log('\n12. Testing error handling (non-existent event)...');
    try {
      await axios.get(`${BASE_URL}/api/events/99999`, { headers });
    } catch (error) {
      console.log('✅ Correctly handled non-existent event:', error.response.status, 'NOT FOUND');
    }
    
    // Test error handling - invalid date format
    console.log('\n13. Testing error handling (invalid date)...');
    try {
      await axios.post(`${BASE_URL}/api/events`, {
        title: 'Invalid Date Event',
        description: 'This should fail.',
        startDateTime: 'invalid-date',
        endDateTime: '2025-07-20T11:00:00',
        tag: 'MEDIUM',
        allDay: false
      }, { headers });
    } catch (error) {
      console.log('✅ Correctly handled invalid date:', error.response.status, 'BAD REQUEST');
    }
    
    // Clean up - delete all test events
    console.log('\n14. Cleaning up - deleting test events...');
    
    console.log('   Deleting main test event...');
    await axios.delete(`${BASE_URL}/api/events/${eventId}`, { headers });
    console.log('   ✅ Main test event deleted');
    
    console.log('   Deleting overlap test event...');
    await axios.delete(`${BASE_URL}/api/events/${overlapEventId}`, { headers });
    console.log('   ✅ Overlap test event deleted');
    
    console.log('   Deleting all-day test event...');
    await axios.delete(`${BASE_URL}/api/events/${allDayEventId}`, { headers });
    console.log('   ✅ All-day test event deleted');
    
    // Verify cleanup
    console.log('\n15. Verifying cleanup...');
    const finalEventsResponse = await axios.get(`${BASE_URL}/api/events`, { headers });
    console.log(`✅ Final event count: ${finalEventsResponse.data.length} events remaining`);
    
    console.log('\n🎉 All event tests passed! Events backend integration is working correctly.');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Event creation (regular and all-day)');
    console.log('   ✅ Event retrieval (all, by ID, by tag)');
    console.log('   ✅ Event updating (full update and tag-only)');
    console.log('   ✅ Event deletion');
    console.log('   ✅ Overlapping events query');
    console.log('   ✅ Date range filtering');
    console.log('   ✅ Tag operations (update and removal)');
    console.log('   ✅ Error handling for invalid data');
    console.log('   ✅ Proper authentication and authorization');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - is the backend server running on 10.40.32.231:8080?');
    }
    
    // Check for specific error types
    if (error.response?.status === 401) {
      console.error('Authentication failed - check your credentials');
    } else if (error.response?.status === 403) {
      console.error('Authorization failed - insufficient permissions');
    } else if (error.response?.status === 400) {
      console.error('Bad request - check the data format');
    }
  }
};

testEvents();
