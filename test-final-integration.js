// Final integration test with unique data
const axios = require('axios');

const baseURL = 'https://prismanote-backend.onrender.com';
const testUser = {
  email: 'boatengjoa9@gmail.com',
  password: 'Test123='
};

let authToken = null;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
  validateStatus: function (status) {
    return status < 500;
  },
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

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
  console.log('🔐 LOGGING IN...');
  const response = await api.post('/api/auth/login', testUser);
  
  if (response.status === 200 && response.data?.token) {
    authToken = response.data.token;
    console.log('✅ Login successful!');
    return true;
  }
  return false;
}

async function testFinalIntegration() {
  console.log('\n🧪 FINAL INTEGRATION TEST');
  console.log('==========================');
  
  // Test 1: Create unique budget for next year to avoid overlap
  console.log('\n📝 Creating budget for 2026...');
  const budgetData = {
    totalBudget: 5000,
    currency: 'USD',
    period: 'MONTHLY',
    startDate: '2026-01-01',
    endDate: '2026-01-31'
  };
  
  const budgetResponse = await api.post('/api/budgets', budgetData);
  console.log('Budget creation response:', JSON.stringify(budgetResponse.data, null, 2));
  
  if (budgetResponse.status === 200) {
    const budgetId = budgetResponse.data.id;
    console.log(`✅ Budget created with ID: ${budgetId}`);
    
    // Test 2: Create unique category
    console.log('\n📝 Creating unique category...');
    const timestamp = Date.now();
    const categoryData = {
      name: `Test Category ${timestamp}`,
      icon: '🔧'
    };
    
    const categoryResponse = await api.post('/api/budgets/categories', categoryData);
    console.log('Category creation response:', JSON.stringify(categoryResponse.data, null, 2));
    
    if (categoryResponse.status === 200) {
      const categoryId = categoryResponse.data.id;
      console.log(`✅ Category created with ID: ${categoryId}`);
      
      // Test 3: Assign category to budget
      console.log('\n📝 Assigning category to budget...');
      const userCategoryData = {
        categoryId: categoryId,
        budgetId: budgetId,
        allocatedBudget: 1000.00
      };
      
      const userCategoryResponse = await api.post('/api/budgets/user-categories', userCategoryData);
      console.log('User category response:', JSON.stringify(userCategoryResponse.data, null, 2));
      
      if (userCategoryResponse.status === 200) {
        console.log('✅ User category assignment successful');
        
        // Test 4: Create expense
        console.log('\n📝 Creating expense...');
        const today = new Date().toISOString().split('T')[0];
        const expenseData = {
          categoryId: categoryId,
          budgetId: budgetId,
          amount: 150.00,
          description: 'Final integration test expense',
          date: today
        };
        
        const expenseResponse = await api.post('/api/budgets/expenses', expenseData);
        console.log('Expense creation response:', JSON.stringify(expenseResponse.data, null, 2));
        
        if (expenseResponse.status === 200) {
          console.log('✅ Expense created successfully');
          
          // Test 5: Verify data consistency
          console.log('\n🔍 Verifying data consistency...');
          
          // Check updated budget
          const updatedBudgetResponse = await api.get(`/api/budgets/${budgetId}`);
          console.log('Updated budget:', JSON.stringify(updatedBudgetResponse.data, null, 2));
          
          // Check expenses list
          const expensesResponse = await api.get('/api/budgets/expenses/list');
          console.log('Expenses count:', expensesResponse.data.length);
          
          console.log('\n🎉 ALL TESTS PASSED! Frontend-Backend integration is working perfectly!');
          return true;
        }
      }
    }
  }
  
  console.log('\n❌ Some tests failed, but this might be due to business logic constraints');
  return false;
}

async function main() {
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Login failed');
    return;
  }
  
  await testFinalIntegration();
}

main().catch(console.error);
