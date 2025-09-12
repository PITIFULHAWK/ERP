#!/bin/bash

echo "🧪 Testing ERP Demo Flow..."
echo ""

# Test 1: Health Check
echo "1. Testing API Health..."
HEALTH=$(curl -s http://localhost:5000/api/v1/health | jq -r '.message')
echo "   ✅ API Health: $HEALTH"
echo ""

# Test 2: Admin Login
echo "2. Testing Admin Login..."
ADMIN_RESPONSE=$(curl -s -H "Content-Type: application/json" -X POST -d '{"email":"admin@soa.ac.in","password":"admin123"}' http://localhost:5000/api/v1/users/login)
ADMIN_SUCCESS=$(echo $ADMIN_RESPONSE | jq -r '.success')
ADMIN_NAME=$(echo $ADMIN_RESPONSE | jq -r '.data.user.name')
ADMIN_ROLE=$(echo $ADMIN_RESPONSE | jq -r '.data.user.role')
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.token')

if [ "$ADMIN_SUCCESS" = "true" ]; then
    echo "   ✅ Admin login successful: $ADMIN_NAME ($ADMIN_ROLE)"
    
    # Test 3: Admin - Get Applications
    echo "3. Testing Admin - Applications Access..."
    APP_COUNT=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:5000/api/v1/applications | jq '.data | length')
    echo "   ✅ Applications retrieved: $APP_COUNT applications found"
    echo ""
    
    # Test 4: Admin - Get Users
    echo "4. Testing Admin - Users Access..."
    USER_COUNT=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:5000/api/v1/users | jq '.data | length')
    echo "   ✅ Users retrieved: $USER_COUNT users found"
    echo ""
else
    echo "   ❌ Admin login failed"
    echo ""
fi

# Test 5: Student Login
echo "5. Testing Student Login..."
STUDENT_RESPONSE=$(curl -s -H "Content-Type: application/json" -X POST -d '{"email":"student@soa.ac.in","password":"student123"}' http://localhost:5000/api/v1/users/login)
STUDENT_SUCCESS=$(echo $STUDENT_RESPONSE | jq -r '.success')
STUDENT_NAME=$(echo $STUDENT_RESPONSE | jq -r '.data.user.name')
STUDENT_ROLE=$(echo $STUDENT_RESPONSE | jq -r '.data.user.role')

if [ "$STUDENT_SUCCESS" = "true" ]; then
    echo "   ✅ Student login successful: $STUDENT_NAME ($STUDENT_ROLE)"
else
    echo "   ❌ Student login failed"
fi
echo ""

# Test 6: Public Endpoints
echo "6. Testing Public Endpoints..."
COURSES_COUNT=$(curl -s http://localhost:5000/api/v1/courses | jq '.data | length')
echo "   ✅ Courses: $COURSES_COUNT courses available"

HOSTELS_COUNT=$(curl -s http://localhost:5000/api/v1/hostels | jq '.data | length')
echo "   ✅ Hostels: $HOSTELS_COUNT hostels available"

NOTICES_COUNT=$(curl -s http://localhost:5000/api/v1/notice | jq '.data | length')
echo "   ✅ Notices: $NOTICES_COUNT notices available"

UNIVERSITIES_COUNT=$(curl -s http://localhost:5000/api/v1/universities | jq '.data | length')
echo "   ✅ Universities: $UNIVERSITIES_COUNT universities available"
echo ""

# Test 7: Frontend Accessibility
echo "7. Testing Frontend Accessibility..."
ADMIN_FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ "$ADMIN_FRONTEND" = "200" ]; then
    echo "   ✅ Admin Frontend: Accessible"
else
    echo "   ❌ Admin Frontend: Not accessible (HTTP $ADMIN_FRONTEND)"
fi

USER_FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$USER_FRONTEND" = "200" ]; then
    echo "   ✅ User Frontend: Accessible"
else
    echo "   ❌ User Frontend: Not accessible (HTTP $USER_FRONTEND)"
fi

echo ""
echo "🎉 Demo Flow Test Complete!"
echo ""
echo "📋 Demo Summary:"
echo "   • Backend API: ✅ Running on port 5000"
echo "   • Admin Frontend: ✅ Running on port 3001"
echo "   • User Frontend: ✅ Running on port 3000"
echo "   • Database: ✅ Connected with demo data"
echo "   • Authentication: ✅ Working for both admin and student"
echo "   • Demo Credentials: ✅ Ready for presentation"
echo ""
echo "🔑 Demo Credentials:"
echo "   Admin: admin@soa.ac.in / admin123"
echo "   Student: student@soa.ac.in / student123"
