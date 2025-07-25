// 🏦 Finance Service Integration Test
// Complete test suite for finance API endpoints

const axios = require('axios');

const baseURL = 'https://prismanote-backend.onrender.com';
const testUser = {
  "email": "jeremyboatengoa@gmail.com",
  "password": "Test123="
};

let authToken = '';
let testBudgetId = null;
let testExpenseId = null;

// Helper function to get auth headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authToken}`
});

// Helper function to generate unique test data
const generateTestData = () => ({
  budget: {
    totalBudget: Math.floor(Math.random() * 5000) + 1000, // 1000-6000
    currency: 'GHS',
    period: 'MONTHLY',
    startDate: '2025-08-01',
    endDate: '2025-08-31'
  },
  expense: {
    categoryId: Math.floor(Math.random() * 11) + 1, // 1-11
    amount: Math.floor(Math.random() * 500) + 10, // 10-510
    description: `Test expense ${Date.now()}`,
    date: '2025-07-25'
  }
});

// 1. Authentication Test
const testAuthentication = async () => {
  try {
    console.log('🔐 Testing authentication...');
    
    const response = await axios.post(`${baseURL}/api/auth/login`, testUser, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    authToken = response.data.token;
    console.log('✅ Authentication successful');
    console.log('   Token:', authToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
};

// 2. Get Categories Test
const testGetCategories = async () => {
  try {
    console.log('\n🏷️ Testing GET categories...');
    
    const response = await axios.get(`${baseURL}/api/finance/categories`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log('✅ Categories fetched successfully');
    console.log(`   Found ${response.data.length} categories`);
    console.log('   Sample categories:', response.data.slice(0, 3).map(c => `${c.id}: ${c.name} ${c.icon}`));
    return true;
  } catch (error) {
    console.error('❌ Get categories failed:', error.response?.data || error.message);
    return false;
  }
};

// 3. Get Current Budget Test (should be empty initially)
const testGetCurrentBudget = async () => {
  try {
    console.log('\n💰 Testing GET current budget (expecting no budget)...');
    
    const response = await axios.get(`${baseURL}/api/finance/budget`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    if (response.status === 204) {
      console.log('✅ No current budget found (as expected)');
      return true;
    } else {
      console.log('ℹ️ Found existing budget:', response.data);
      testBudgetId = response.data.id;
      return true;
    }
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 204) {
      console.log('✅ No current budget found (as expected)');
      return true;
    }
    console.error('❌ Get current budget failed:', error.response?.data || error.message);
    return false;
  }
};

// 4. Create Budget Test
const testCreateBudget = async () => {
  try {
    console.log('\n💰 Testing CREATE budget...');
    const testData = generateTestData();
    
    const response = await axios.post(`${baseURL}/api/finance/budget`, testData.budget, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    testBudgetId = response.data.id;
    console.log('✅ Budget created successfully');
    console.log(`   Budget ID: ${testBudgetId}`);
    console.log(`   Total Budget: ${response.data.currency} ${response.data.totalBudget}`);
    console.log(`   Period: ${response.data.period} (${response.data.startDate} to ${response.data.endDate})`);
    console.log(`   Is Active: ${response.data.isActive}`);
    return true;
  } catch (error) {
    console.error('❌ Create budget failed:', error.response?.data || error.message);
    return false;
  }
};

// 5. Update Budget Test
const testUpdateBudget = async () => {
  try {
    console.log('\n💰 Testing UPDATE budget...');
    
    const updateData = {
      totalBudget: 7500.00,
      currency: 'USD'
    };
    
    const response = await axios.put(`${baseURL}/api/finance/budget`, updateData, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log('✅ Budget updated successfully');
    console.log(`   New Total Budget: ${response.data.currency} ${response.data.totalBudget}`);
    return true;
  } catch (error) {
    console.error('❌ Update budget failed:', error.response?.data || error.message);
    return false;
  }
};

// 6. Create Expense Test
const testCreateExpense = async () => {
  try {
    console.log('\n💸 Testing CREATE expense...');
    const testData = generateTestData();
    
    const response = await axios.post(`${baseURL}/api/finance/expenses`, testData.expense, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    testExpenseId = response.data.id;
    console.log('✅ Expense created successfully');
    console.log(`   Expense ID: ${testExpenseId}`);
    console.log(`   Amount: ${response.data.amount}`);
    console.log(`   Category: ${response.data.categoryName} ${response.data.categoryIcon}`);
    console.log(`   Description: ${response.data.description}`);
    console.log(`   Date: ${response.data.date}`);
    return true;
  } catch (error) {
    console.error('❌ Create expense failed:', error.response?.data || error.message);
    return false;
  }
};

// 7. Get All Expenses Test
const testGetExpenses = async () => {
  try {
    console.log('\n💸 Testing GET all expenses...');
    
    const response = await axios.get(`${baseURL}/api/finance/expenses`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log('✅ Expenses fetched successfully');
    console.log(`   Found ${response.data.length} expenses`);
    if (response.data.length > 0) {
      console.log('   Recent expense:', {
        id: response.data[0].id,
        amount: response.data[0].amount,
        category: response.data[0].categoryName,
        date: response.data[0].date
      });
    }
    return true;
  } catch (error) {
    console.error('❌ Get expenses failed:', error.response?.data || error.message);
    return false;
  }
};

// 8. Update Expense Test
const testUpdateExpense = async () => {
  if (!testExpenseId) {
    console.log('\n💸 Skipping UPDATE expense test (no expense ID)');
    return true;
  }
  
  try {
    console.log('\n💸 Testing UPDATE expense...');
    
    const updateData = {
      amount: 299.99,
      description: `Updated test expense ${Date.now()}`,
      categoryId: 2
    };
    
    const response = await axios.put(`${baseURL}/api/finance/expenses/${testExpenseId}`, updateData, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log('✅ Expense updated successfully');
    console.log(`   New Amount: ${response.data.amount}`);
    console.log(`   New Description: ${response.data.description}`);
    console.log(`   New Category: ${response.data.categoryName}`);
    return true;
  } catch (error) {
    console.error('❌ Update expense failed:', error.response?.data || error.message);
    return false;
  }
};

// 9. Get Budget Summary Test
const testGetBudgetSummary = async () => {
  try {
    console.log('\n📊 Testing GET budget summary...');
    
    const response = await axios.get(`${baseURL}/api/finance/summary`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log('✅ Budget summary fetched successfully');
    console.log(`   Total Budget: ${response.data.currency} ${response.data.totalBudget}`);
    console.log(`   Total Spent: ${response.data.currency} ${response.data.totalSpent}`);
    console.log(`   Remaining: ${response.data.currency} ${response.data.remainingBudget}`);
    console.log(`   Spent Percentage: ${response.data.spentPercentage}%`);
    console.log(`   Days Remaining: ${response.data.daysRemaining}`);
    console.log(`   Categories with spending: ${response.data.categoryBreakdown.length}`);
    return true;
  } catch (error) {
    console.error('❌ Get budget summary failed:', error.response?.data || error.message);
    return false;
  }
};

// 10. Get Category Analytics Test
const testGetCategoryAnalytics = async () => {
  try {
    console.log('\n📈 Testing GET category analytics...');
    
    const response = await axios.get(`${baseURL}/api/finance/analytics/categories`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log('✅ Category analytics fetched successfully');
    console.log(`   Categories with spending: ${response.data.length}`);
    if (response.data.length > 0) {
      console.log('   Top spending category:', {
        name: response.data[0].categoryName,
        amount: response.data[0].totalAmount,
        percentage: response.data[0].percentage,
        transactions: response.data[0].transactionCount
      });
    }
    return true;
  } catch (error) {
    console.error('❌ Get category analytics failed:', error.response?.data || error.message);
    return false;
  }
};

// 11. Delete Expense Test (cleanup)
const testDeleteExpense = async () => {
  if (!testExpenseId) {
    console.log('\n💸 Skipping DELETE expense test (no expense ID)');
    return true;
  }
  
  try {
    console.log('\n💸 Testing DELETE expense...');
    
    await axios.delete(`${baseURL}/api/finance/expenses/${testExpenseId}`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log('✅ Expense deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Delete expense failed:', error.response?.data || error.message);
    return false;
  }
};

// 12. Validation Tests
const testValidations = async () => {
  console.log('\n🔍 Testing validation errors...');
  
  try {
    // Test invalid budget creation
    await axios.post(`${baseURL}/api/finance/budget`, {
      totalBudget: -100, // Invalid amount
      currency: 'INVALID', // Invalid currency
      period: 'INVALID', // Invalid period
      startDate: '2025-01-01', // Past date
      endDate: '2025-01-02' // Too short period
    }, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log('❌ Validation test failed - should have rejected invalid data');
    return false;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.validationErrors) {
      console.log('✅ Validation errors caught correctly');
      console.log('   Validation errors:', Object.keys(error.response.data.validationErrors));
      return true;
    }
    console.error('❌ Unexpected validation error:', error.response?.data || error.message);
    return false;
  }
};

// Main test runner
const runFinanceTests = async () => {
  console.log('🏦 Starting Finance Service Integration Tests');
  console.log('================================================\n');
  
  const tests = [
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Get Categories', fn: testGetCategories },
    { name: 'Get Current Budget', fn: testGetCurrentBudget },
    { name: 'Create Budget', fn: testCreateBudget },
    { name: 'Update Budget', fn: testUpdateBudget },
    { name: 'Create Expense', fn: testCreateExpense },
    { name: 'Get All Expenses', fn: testGetExpenses },
    { name: 'Update Expense', fn: testUpdateExpense },
    { name: 'Get Budget Summary', fn: testGetBudgetSummary },
    { name: 'Get Category Analytics', fn: testGetCategoryAnalytics },
    { name: 'Delete Expense', fn: testDeleteExpense },
    { name: 'Validation Tests', fn: testValidations }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} threw an error:`, error.message);
      failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n================================================');
  console.log('🏦 Finance Service Tests Complete');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All finance service tests passed! Finance system is ready for production.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
};

// Run the tests
runFinanceTests().catch(error => {
  console.error('💥 Test runner crashed:', error.message);
  process.exit(1);
});
