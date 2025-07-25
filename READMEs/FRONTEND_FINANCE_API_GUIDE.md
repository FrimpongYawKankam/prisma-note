# 🏦 PrismaNote Finance API Documentation - Complete Frontend Integration Guide

## 📋 Overview
This documentation covers the **simplified finance system** that replaced the complex budget management. The system now focuses on **single active budget per user**, **fixed categories**, and **streamlined expense tracking**.

---

## 🌐 Base URL
All finance endpoints are under: `/api/finance`

**Authentication Required**: All endpoints require valid JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 📊 Core Concepts

### 💰 Budget System
- **One Active Budget**: User can only have one active budget at a time
- **Auto-Deactivation**: Creating new budget automatically deactivates previous ones
- **Minimum Duration**: All budgets must be at least 7 days long
- **Supported Currencies**: `GHS` (default), `USD`, `EUR`, `GBP`
- **Budget Periods**: `WEEKLY`, `MONTHLY`

### 🏷️ Fixed Categories (Pre-defined)
The system uses 11 fixed categories that cannot be modified:
1. 🍽️ **Food & Dining**
2. 🚗 **Transportation** 
3. 🛒 **Shopping**
4. 🎬 **Entertainment**
5. 🏠 **Bills & Utilities**
6. 🏥 **Healthcare**
7. 📚 **Education**
8. ✈️ **Travel**
9. 💳 **Personal Care**
10. 🎁 **Gifts & Donations**
11. 📦 **Other**

---

## 🛠️ API Endpoints

### 1. 💰 Budget Management

#### **GET /api/finance/budget** - Get Current Budget
```http
GET /api/finance/budget
```

**Response Success (200):**
```json
{
  "id": 123,
  "totalBudget": 5000.00,
  "currency": "GHS",
  "period": "MONTHLY",
  "startDate": "2025-07-01",
  "endDate": "2025-07-31",
  "isActive": true,
  "createdAt": "2025-07-01T10:00:00",
  "updatedAt": "2025-07-01T10:00:00",
  "totalSpent": 1250.75,
  "remainingBudget": 3749.25,
  "spentPercentage": 25.02
}
```

**Response No Budget (204):** Empty response when user has no active budget

**Response Error (404):**
```json
{
  "timestamp": "2025-07-25T17:00:00",
  "error": "No active budget found",
  "exception": "BudgetNotFoundException"
}
```

---

#### **POST /api/finance/budget** - Create New Budget
```http
POST /api/finance/budget
Content-Type: application/json
```

**Request Body:**
```json
{
  "totalBudget": 5000.00,
  "currency": "GHS",
  "period": "MONTHLY",
  "startDate": "2025-08-01",
  "endDate": "2025-08-31"
}
```

**Field Validations:**
- `totalBudget`: Required, minimum 0.01, max 10 digits + 2 decimals
- `currency`: Required, must be one of: `GHS`, `USD`, `EUR`, `GBP`
- `period`: Required, must be `WEEKLY` or `MONTHLY`
- `startDate`: Required, cannot be in the past
- `endDate`: Required, must be in the future, minimum 7 days from startDate

**Response Success (200):** Returns same structure as GET budget

**Response Validation Error (400):**
```json
{
  "timestamp": "2025-07-25T17:00:00",
  "error": "Validation failed",
  "validationErrors": {
    "totalBudget": "Total budget must be greater than 0",
    "endDate": "Budget period must be at least 7 days"
  }
}
```

---

#### **PUT /api/finance/budget** - Update Current Budget
```http
PUT /api/finance/budget
Content-Type: application/json
```

**Request Body (All fields optional):**
```json
{
  "totalBudget": 6000.00,
  "currency": "USD",
  "period": "WEEKLY",
  "startDate": "2025-08-01",
  "endDate": "2025-08-31"
}
```

**Response Success (200):** Returns updated budget structure

---

### 2. 💸 Expense Management

#### **GET /api/finance/expenses** - Get All Expenses
```http
GET /api/finance/expenses
```

**Response Success (200):**
```json
[
  {
    "id": 456,
    "categoryId": 1,
    "amount": 125.50,
    "description": "Lunch at restaurant",
    "date": "2025-07-25",
    "createdAt": "2025-07-25T12:30:00",
    "updatedAt": "2025-07-25T12:30:00",
    "categoryName": "Food & Dining",
    "categoryIcon": "🍽️"
  }
]
```

---

#### **POST /api/finance/expenses** - Create New Expense
```http
POST /api/finance/expenses
Content-Type: application/json
```

**Request Body:**
```json
{
  "categoryId": 1,
  "amount": 125.50,
  "description": "Lunch at restaurant",
  "date": "2025-07-25"
}
```

**Field Validations:**
- `categoryId`: Required, must be positive integer (1-11)
- `amount`: Required, minimum 0.01, max 10 digits + 2 decimals
- `description`: Optional, max 500 characters
- `date`: Required, cannot be in the future

**Response Success (200):** Returns created expense structure

**Response Error (404):**
```json
{
  "timestamp": "2025-07-25T17:00:00",
  "error": "Category not found",
  "exception": "CategoryNotFoundException"
}
```

---

#### **PUT /api/finance/expenses/{id}** - Update Expense
```http
PUT /api/finance/expenses/456
Content-Type: application/json
```

**Request Body (All fields optional):**
```json
{
  "categoryId": 2,
  "amount": 150.00,
  "description": "Updated description",
  "date": "2025-07-24"
}
```

**Response Success (200):** Returns updated expense structure

**Response Error (404):**
```json
{
  "timestamp": "2025-07-25T17:00:00",
  "error": "Expense not found",
  "exception": "ExpenseNotFoundException"
}
```

---

#### **DELETE /api/finance/expenses/{id}** - Delete Expense
```http
DELETE /api/finance/expenses/456
```

**Response Success (204):** Empty response

**Response Error (404):** Expense not found

---

### 3. 🏷️ Category Management

#### **GET /api/finance/categories** - Get All Categories
```http
GET /api/finance/categories
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Food & Dining",
    "icon": "🍽️"
  },
  {
    "id": 2,
    "name": "Transportation",
    "icon": "🚗"
  },
  {
    "id": 3,
    "name": "Shopping",
    "icon": "🛒"
  },
  {
    "id": 4,
    "name": "Entertainment",
    "icon": "🎬"
  },
  {
    "id": 5,
    "name": "Bills & Utilities",
    "icon": "🏠"
  },
  {
    "id": 6,
    "name": "Healthcare",
    "icon": "🏥"
  },
  {
    "id": 7,
    "name": "Education",
    "icon": "📚"
  },
  {
    "id": 8,
    "name": "Travel",
    "icon": "✈️"
  },
  {
    "id": 9,
    "name": "Personal Care",
    "icon": "💳"
  },
  {
    "id": 10,
    "name": "Gifts & Donations",
    "icon": "🎁"
  },
  {
    "id": 11,
    "name": "Other",
    "icon": "📦"
  }
]
```

---

### 4. 📈 Analytics & Summary

#### **GET /api/finance/summary** - Get Budget Summary
```http
GET /api/finance/summary
```

**Response Success (200):**
```json
{
  "totalBudget": 5000.00,
  "totalSpent": 1250.75,
  "remainingBudget": 3749.25,
  "spentPercentage": 25.02,
  "currency": "GHS",
  "daysRemaining": 6,
  "categoryBreakdown": [
    {
      "categoryId": 1,
      "categoryName": "Food & Dining",
      "categoryIcon": "🍽️",
      "totalAmount": 650.25,
      "percentage": 52.0,
      "transactionCount": 15
    },
    {
      "categoryId": 2,
      "categoryName": "Transportation",
      "categoryIcon": "🚗",
      "totalAmount": 400.50,
      "percentage": 32.0,
      "transactionCount": 8
    }
  ]
}
```

---

#### **GET /api/finance/analytics/categories** - Get Category Analytics
```http
GET /api/finance/analytics/categories
```

**Response Success (200):**
```json
[
  {
    "categoryId": 1,
    "categoryName": "Food & Dining", 
    "categoryIcon": "🍽️",
    "totalAmount": 650.25,
    "percentage": 52.0,
    "transactionCount": 15
  },
  {
    "categoryId": 2,
    "categoryName": "Transportation",
    "categoryIcon": "🚗", 
    "totalAmount": 400.50,
    "percentage": 32.0,
    "transactionCount": 8
  }
]
```

---

## 🚨 Error Handling

### Common HTTP Status Codes:
- **200**: Success
- **204**: No Content (successful but empty response)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing JWT)
- **403**: Forbidden (access denied)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

### Error Response Format:
```json
{
  "timestamp": "2025-07-25T17:00:00",
  "error": "Error message here",
  "exception": "ExceptionType"
}
```

### Validation Error Format:
```json
{
  "timestamp": "2025-07-25T17:00:00", 
  "error": "Validation failed",
  "validationErrors": {
    "fieldName": "Field error message",
    "anotherField": "Another error message"
  }
}
```

---

## 💡 Frontend Implementation Tips

### 1. **Budget Workflow**
```javascript
// Check if user has active budget
const checkBudget = async () => {
  try {
    const response = await fetch('/api/finance/budget', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 204) {
      // No budget - show create budget form
      showCreateBudgetForm();
    } else if (response.ok) {
      const budget = await response.json();
      // Display budget dashboard
      displayBudgetDashboard(budget);
    }
  } catch (error) {
    handleError(error);
  }
};
```

### 2. **Expense Creation**
```javascript
const createExpense = async (expenseData) => {
  try {
    const response = await fetch('/api/finance/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(expenseData)
    });
    
    if (response.ok) {
      const expense = await response.json();
      // Refresh expense list and budget summary
      refreshExpenseList();
      refreshBudgetSummary();
    } else {
      const error = await response.json();
      handleValidationErrors(error.validationErrors);
    }
  } catch (error) {
    handleError(error);
  }
};
```

### 3. **Real-time Budget Updates**
```javascript
// After any expense operation, refresh budget summary
const refreshBudgetSummary = async () => {
  const summary = await fetch('/api/finance/summary', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  updateBudgetProgress(summary.spentPercentage);
  updateRemainingAmount(summary.remainingBudget);
  updateDaysRemaining(summary.daysRemaining);
};
```

### 4. **Category Dropdown Initialization**
```javascript
const loadCategories = async () => {
  const categories = await fetch('/api/finance/categories', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  populateCategoryDropdown(categories);
};
```

---

## 🔧 Data Validation Rules

### Budget Creation:
- Total budget: ≥ 0.01, ≤ 999999999.99
- Currency: GHS, USD, EUR, GBP only
- Period: WEEKLY or MONTHLY only  
- Date range: ≥ 7 days, start date ≥ today, end date > start date

### Expense Creation:
- Category ID: 1-11 only (fixed categories)
- Amount: ≥ 0.01, ≤ 999999999.99
- Description: ≤ 500 characters, optional
- Date: ≤ today (no future expenses)

---

## 🎯 Key Frontend Features to Implement

1. **Budget Dashboard**: Show current budget with progress bar, remaining amount, days left
2. **Expense Tracker**: List recent expenses with category icons, easy add/edit/delete
3. **Category Analytics**: Pie chart or bar chart showing spending by category
4. **Budget Creation Wizard**: Step-by-step budget setup with validation
5. **Expense Quick Add**: Modal or form for fast expense entry
6. **Responsive Design**: Mobile-friendly expense tracking on the go

---

## ✅ Testing Checklist

- [ ] Create budget with all required fields
- [ ] Try to create budget with invalid data (test validation)
- [ ] Update budget with partial data
- [ ] Add expenses to current budget  
- [ ] Edit and delete expenses
- [ ] Test budget summary calculations
- [ ] Test category analytics
- [ ] Test error handling for missing budget
- [ ] Test authentication token expiry
- [ ] Test with different currencies and periods

---

This simplified finance system provides a clean, focused experience for budget and expense management. The fixed categories eliminate complexity while the single active budget keeps users focused on their current financial goals.
