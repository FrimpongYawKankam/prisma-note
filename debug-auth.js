// Quick debug script to test auth service
const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing login endpoint...');
    
    const response = await axios.post('http://10.40.32.231:8080/api/auth/login', {
      email: 'boatengjoa9@gmail.com',
      password: 'Test1233='
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('Success! Response:', response.data);
  } catch (error) {
    console.error('Error details:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - is the backend server running on localhost:8080?');
    }
  }
};

testLogin();
