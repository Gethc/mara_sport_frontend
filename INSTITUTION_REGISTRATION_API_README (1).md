# Institution Registration API Documentation

## Overview
This document provides comprehensive API documentation for the Institution Registration system. All endpoints are available at `http://localhost:8000/api/v1/` (or your deployed backend URL).

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 **Institution Registration Flow APIs**

### **1. OTP Verification (Step 0)**

#### Send OTP for Institution Registration
```http
POST /otp/send/institution
Content-Type: application/json

{
  "email": "institution@example.com",
  "name": "Institution Name",
  "otp_type": "institution_registration"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully for institution registration",
  "data": {
    "otp_id": "unique_otp_id"
  }
}
```

#### Verify OTP
```http
POST /otp/verify
Content-Type: application/json

{
  "email": "institution@example.com",
  "otp": "123456",
  "otp_type": "institution_registration"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "access_token": "jwt_token_here",
    "token_type": "bearer",
    "user_type": "institution"
  }
}
```

---

### **2. Public Data APIs (No Authentication Required)**

#### Get Institute Types
```http
GET /public/institute-types
```

**Response:**
```json
{
  "success": true,
  "message": "Institute types retrieved successfully",
  "data": [
    "Academies",
    "Govt Schools", 
    "Kaiso Schools"
  ]
}
```

#### Get Gender Options
```http
GET /public/gender-options
```

**Response:**
```json
{
  "success": true,
  "message": "Gender options retrieved successfully",
  "data": [
    {"value": "Male", "label": "Male"},
    {"value": "Female", "label": "Female"},
    {"value": "Other", "label": "Other"}
  ]
}
```

#### Get All Sports
```http
GET /public/sports?sport_type=Team
```

**Response:**
```json
{
  "success": true,
  "message": "Sports retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Football",
      "type": "Team",
      "age_from": "9",
      "age_to": "19",
      "gender": "Other",
      "min_limit": 7,
      "max_limit": 7
    },
    {
      "id": 2,
      "name": "Basketball", 
      "type": "Team",
      "age_from": "9",
      "age_to": "19",
      "gender": "Other",
      "min_limit": 5,
      "max_limit": 5
    }
  ]
}
```

#### Get Sport Categories
```http
GET /public/sports/{sport_id}/categories
```

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Under 12",
      "description": "Age group under 12"
    }
  ]
}
```

#### Get Sport Sub-Categories
```http
GET /public/sports/{sport_id}/categories/{category_id}/sub-categories
```

**Response:**
```json
{
  "success": true,
  "message": "Sub-categories retrieved successfully", 
  "data": [
    {
      "id": 1,
      "name": "Boys",
      "description": "Boys category"
    },
    {
      "id": 2,
      "name": "Girls", 
      "description": "Girls category"
    }
  ]
}
```

---

### **3. Checkpoint System APIs**

#### Save Registration Checkpoint
```http
POST /institution/checkpoint/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "institution@example.com",
  "step": 1,
  "data": {
    "institutionName": "Test Institute",
    "phoneNumber": "1234567890",
    "website": "https://test.com",
    "principalName": "John Doe",
    "principalContact": "9876543210"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checkpoint saved for step 1",
  "data": {
    "institution_id": 275,
    "step": 1,
    "email": "institution@example.com"
  }
}
```

#### Load Registration Checkpoint
```http
GET /institution/checkpoint/load/{email}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Checkpoint loaded successfully",
  "data": {
    "step": 1,
    "data": {
      "userType": "institution",
      "email": "institution@example.com",
      "institutionDetails": {
        "institutionName": "Test Institute",
        "phoneNumber": "1234567890",
        "website": "https://test.com",
        "principalName": "John Doe",
        "principalContact": "9876543210"
      },
      "selectedSports": [],
      "sportTeams": [],
      "payment": {}
    },
    "completed_steps": [1],
    "institution_id": 275
  }
}
```

#### Clear Registration Checkpoint
```http
DELETE /institution/checkpoint/clear/{email}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Checkpoint cleared successfully"
}
```

---

### **4. Fee Calculation API**

#### Calculate Total Fees
```http
POST /fee-calculation/calculate-total-fees
Authorization: Bearer <token>
Content-Type: application/json

{
  "selectedSports": [
    {"sport_id": 1},
    {"sport_id": 2}
  ],
  "parentCount": 2,
  "baseFee": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fees calculated successfully",
  "data": {
    "currency": "KES",
    "breakdown": {
      "base_fee": 1000,
      "sports_fees": [
        {
          "sport_id": 1,
          "sport_name": "Football",
          "type": "individual",
          "fee": 1000
        },
        {
          "sport_id": 2,
          "sport_name": "Basketball", 
          "type": "individual",
          "fee": 1000
        }
      ],
      "parent_fee": 1500,
      "total": 4500
    },
    "summary": {
      "base_fee": 1000,
      "sports_fee": 2000,
      "parent_fee": 1500,
      "total_amount": 4500,
      "sports_count": 2,
      "parent_count": 2
    }
  }
}
```

---

### **5. Institute Management APIs**

#### Create Institute (Final Registration)
```http
POST /institutes/
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "institution@example.com",
  "name": "Test Institute",
  "type_id": 1,
  "contactPersonName": "John Doe",
  "contactPersonEmail": "contact@example.com",
  "contactPersonPhone": "1234567890",
  "contactPersonDesignation": "Principal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Institute created successfully",
  "data": {
    "id": 275,
    "email": "institution@example.com",
    "name": "Test Institute",
    "type_id": 1,
    "created_at": "2025-01-25T20:00:00Z"
  }
}
```

#### Get Institute Details
```http
GET /institutes/{institute_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Institute retrieved successfully",
  "data": {
    "id": 275,
    "email": "institution@example.com",
    "name": "Test Institute",
    "type_id": 1,
    "institute_type": {
      "id": 1,
      "type_name": "Academies"
    },
    "contact_persons": [
      {
        "id": 1,
        "name": "John Doe",
        "designation": "Principal",
        "phone": "1234567890",
        "email": "contact@example.com"
      }
    ],
    "institute_information": {
      "id": 1,
      "phone_number": "1234567890",
      "website": "https://test.com",
      "principal_name": "John Doe",
      "principal_phone_number": "9876543210"
    }
  }
}
```

---

## 🔄 **Complete Registration Flow**

### **Step-by-Step Process:**

1. **OTP Verification**
   - Send OTP: `POST /otp/send/institution`
   - Verify OTP: `POST /otp/verify`
   - Store JWT token for subsequent requests

2. **Load Initial Data**
   - Get institute types: `GET /public/institute-types`
   - Get gender options: `GET /public/gender-options`
   - Get sports: `GET /public/sports`

3. **Step 1: Institution Details**
   - Save checkpoint: `POST /institution/checkpoint/save` (step: 1)
   - Load checkpoint: `GET /institution/checkpoint/load/{email}`

4. **Step 2: Sports Selection**
   - Get sport categories: `GET /public/sports/{sport_id}/categories`
   - Get sub-categories: `GET /public/sports/{sport_id}/categories/{category_id}/sub-categories`
   - Save checkpoint: `POST /institution/checkpoint/save` (step: 2)

5. **Step 3: Student Addition**
   - Use gender options from API
   - Save checkpoint: `POST /institution/checkpoint/save` (step: 3)

6. **Step 4: Fee Calculation**
   - Calculate fees: `POST /fee-calculation/calculate-total-fees`
   - Save checkpoint: `POST /institution/checkpoint/save` (step: 4)

7. **Step 5: Final Registration**
   - Create institute: `POST /institutes/`
   - Clear checkpoint: `DELETE /institution/checkpoint/clear/{email}`

---

## ⚠️ **Important Notes**

### **Data Types:**
- Phone numbers should be sent as **strings** (not integers)
- Principal contact should be **string** format
- All IDs are integers

### **Error Handling:**
All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE"
}
```

### **Authentication:**
- Include JWT token in Authorization header for protected endpoints
- Token expires after 24 hours
- Refresh token if needed

### **Checkpoint System:**
- Saves progress automatically
- Prevents data loss during registration
- Can resume from any step
- Clear checkpoint after successful registration

### **Fee Calculation:**
- Returns fees in KES (Kenyan Shillings)
- Includes breakdown of all costs
- Supports dynamic pricing based on sports selection

---

## 🧪 **Testing Endpoints**

Use the provided test script to verify checkpoint functionality:
```bash
cd marasports_backend
python test_checkpoint_fix.py
```

---

## 📞 **Support**

For API issues or questions, contact the backend team with:
- Request/response examples
- Error messages
- Step where issue occurs
- Browser console logs (if applicable)
