// Test script for finance service endpoints
const axios = require('axios');

const baseURL = 'https://prismanote-backend.onrender.com';
const testUser = {
  email: 'boatengjoa9@gmail.com',
  password: 'Test123='
};

let authToken = null;

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
  validateStatus: function (status) {
    return status < 500; // Don't throw errors for 4xx responses
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    console.log(`❌ ${error.response?.status || 'Network Error'} ${error.response?.statusText || error.message}`);
    return Promise.resolve(error.response || { status: 0, data: null });
  }
);

async function login() {
  console.log('\n🔐 LOGGING IN...');
  console.log(`Email: ${testUser.email}`);
  
  try {
    const response = await api.post('/api/auth/login', testUser);
    
    if (response.status === 200 && response.data?.token) {
      authToken = response.data.token;
      console.log('✅ Login successful!');
      console.log(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Login failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testEndpoint(method, endpoint, data = null) {
  console.log(`\n📡 Testing: ${method.toUpperCase()} ${endpoint}`);
  
  try {
    let response;
    switch (method.toLowerCase()) {
      case 'get':
        response = await api.get(endpoint);
        break;
      case 'post':
        response = await api.post(endpoint, data);
        break;
      case 'put':
        response = await api.put(endpoint, data);
        break;
      case 'delete':
        response = await api.delete(endpoint);
        break;
      default:
        console.log('❌ Invalid method');
        return;
    }
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
    return response;
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return null;
  }
}

async function testFinanceEndpoints() {
  console.log('\n🔍 TESTING FINANCE ENDPOINTS...');
  
  // Test all the finance endpoints the frontend expects - corrected paths
  const endpoints = [
    { method: 'GET', path: '/api/budgets', description: 'Get user budgets' },
    { method: 'GET', path: '/api/budgets/current', description: 'Get current budget' },
    { method: 'GET', path: '/api/budgets/categories', description: 'Get all categories' },
    { method: 'GET', path: '/api/budgets/user-categories', description: 'Get user categories' },
    { method: 'GET', path: '/api/budgets/expenses', description: 'Get user expenses (paginated)' },
    { method: 'GET', path: '/api/budgets/expenses/list', description: 'Get user expenses (list)' },
  ];

  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`\n📋 ${endpoint.description}`);
    const response = await testEndpoint(endpoint.method, endpoint.path);
    
    results.push({
      endpoint: endpoint.path,
      method: endpoint.method,
      description: endpoint.description,
      status: response?.status || 'FAILED',
      exists: response?.status !== 404 && response?.status !== 403,
      hasData: response?.data && Object.keys(response.data).length > 0
    });
  }
  
  return results;
}

async function testCreateOperations() {
  console.log('\n🏗️ TESTING CREATE OPERATIONS...');
  
  // Test creating a budget with correct backend field names
  const budgetData = {
    totalBudget: 3000,  // Backend expects 'totalBudget', not 'totalAmount'
    currency: 'USD',    // Backend validates: 3 chars, uppercase
    period: 'MONTHLY',  // Required field - must be enum value
    startDate: '2025-08-01',  // Backend validates: FutureOrPresent
    endDate: '2025-08-31'     // Backend validates: Future
  };
  
  console.log('\n📝 Testing budget creation...');
  const budgetResponse = await testEndpoint('POST', '/api/budgets', budgetData);
  
  // Test creating a category
  const categoryData = {
    name: 'Test Category 2',
    icon: 'test-outline'  // Backend only requires name and icon
  };
  
  console.log('\n📝 Testing category creation...');
  const categoryResponse = await testEndpoint('POST', '/api/budgets/categories', categoryData);
  
  // Test assigning a category to user with correct fields
  if (categoryResponse?.status === 200 && categoryResponse.data?.id && budgetResponse?.status === 200 && budgetResponse.data?.id) {
    console.log('\n📝 Testing user category assignment...');
    const userCategoryData = {
      categoryId: categoryResponse.data.id,
      budgetId: budgetResponse.data.id,  // Required by backend
      allocatedBudget: 500.00           // Required by backend
    };
    await testEndpoint('POST', '/api/budgets/user-categories', userCategoryData);
  }
  
  // Test creating an expense with correct field order and today's date
  let expenseResponse = null;
  if (budgetResponse?.status === 200 && budgetResponse.data?.id) {
    const today = new Date().toISOString().split('T')[0]; // Today's date for validation
    const expenseData = {
      categoryId: categoryResponse?.data?.id || 1, // Required: category ID
      budgetId: budgetResponse.data.id,            // Required: budget ID  
      amount: 50.00,                               // Required: positive amount
      description: 'Test expense from script',     // Optional: description
      date: today                                  // Required: PastOrPresent date
    };
    
    console.log('\n📝 Testing expense creation...');
    expenseResponse = await testEndpoint('POST', '/api/budgets/expenses', expenseData);
  } else {
    console.log('\n❌ Skipping expense creation - no valid budget created');
  }
  
  return {
    budget: budgetResponse?.status,
    category: categoryResponse?.status,
    expense: expenseResponse?.status || 'SKIPPED'
  };
}

async function checkExistingEndpoints() {
  console.log('\n🔍 CHECKING WHAT ENDPOINTS EXIST...');
  
  // Test common endpoints that might exist
  const commonEndpoints = [
    '/api/auth/login',
    '/api/auth/register', 
    '/api/test/public',
    '/api/test/health-check',
    '/api/notes',
    '/api/events',
    '/api/tasks/today',
    '/actuator/health',
    '/api/budgets'
  ];
  
  console.log('\n📊 Testing known endpoints:');
  for (const endpoint of commonEndpoints) {
    await testEndpoint('GET', endpoint);
  }
}

async function generateReport(financeResults, createResults) {
  console.log('\n📊 FINANCE ENDPOINTS TEST REPORT');
  console.log('=====================================');
  
  console.log('\n🔍 ENDPOINT AVAILABILITY:');
  financeResults.forEach(result => {
    const status = result.exists ? '✅ EXISTS' : '❌ MISSING';
    const data = result.hasData ? '(has data)' : '(empty/error)';
    console.log(`${status} ${result.method} ${result.endpoint} - ${result.description} ${data}`);
  });
  
  console.log('\n🏗️ CREATE OPERATIONS:');
  console.log(`Budget Creation: ${createResults.budget === 200 ? '✅ SUCCESS' : `❌ FAILED (${createResults.budget})`}`);
  console.log(`Category Creation: ${createResults.category === 200 ? '✅ SUCCESS' : `❌ FAILED (${createResults.category})`}`);
  console.log(`Expense Creation: ${createResults.expense === 200 ? '✅ SUCCESS' : `❌ FAILED (${createResults.expense})`}`);
  
  const missingEndpoints = financeResults.filter(r => !r.exists);
  if (missingEndpoints.length > 0) {
    console.log('\n❌ MISSING ENDPOINTS THAT NEED TO BE CREATED:');
    missingEndpoints.forEach(endpoint => {
      console.log(`   ${endpoint.method} ${endpoint.endpoint} - ${endpoint.description}`);
    });
  }
  
  console.log('\n💡 RECOMMENDATION:');
  if (missingEndpoints.length === financeResults.length) {
    console.log('   🚨 ALL FINANCE ENDPOINTS ARE MISSING!');
    console.log('   📝 The backend needs to implement the complete finance module.');
    console.log('   🔧 This explains the 403 errors in the frontend.');
  } else if (missingEndpoints.length > 0) {
    console.log(`   ⚠️  ${missingEndpoints.length} endpoints are missing.`);
    console.log('   🔧 Implement the missing endpoints to fix frontend errors.');
  } else {
    console.log('   ✅ All endpoints exist! Check data structure compatibility.');
  }
}

async function main() {
  console.log('🧪 FINANCE ENDPOINTS TEST SCRIPT');
  console.log('==================================');
  console.log(`Testing backend: ${baseURL}`);
  
  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication. Exiting...');
    return;
  }
  
  // Step 2: Test existing endpoints
  await checkExistingEndpoints();
  
  // Step 3: Test finance endpoints
  const financeResults = await testFinanceEndpoints();
  
  // Step 4: Test create operations
  const createResults = await testCreateOperations();
  
  // Step 5: Generate report
  await generateReport(financeResults, createResults);
  
  console.log('\n✅ Test completed!');
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.log('\n❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the test
main().catch(error => {
  console.log('\n❌ Test script failed:', error.message);
  process.exit(1);
});
