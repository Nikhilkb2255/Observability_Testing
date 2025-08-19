#!/bin/bash

echo "🧪 Testing Observability Setup"
echo "=============================="

# Test Backend
echo "1. Testing Backend API..."
BACKEND_RESPONSE=$(curl -s http://localhost:5002)
if [[ $BACKEND_RESPONSE == *"GraphQL Student Marks API running"* ]]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not responding"
fi

# Test Frontend
echo "2. Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s http://localhost:3002 | head -1)
if [[ $FRONTEND_RESPONSE == *"<!DOCTYPE html>"* ]]; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding"
fi

# Test Prometheus
echo "3. Testing Prometheus..."
PROMETHEUS_TARGETS=$(curl -s http://localhost:9091/api/v1/targets | grep -o '"health":"up"' | wc -l)
echo "✅ Prometheus has $PROMETHEUS_TARGETS healthy targets"

# Test Grafana
echo "4. Testing Grafana..."
GRAFANA_RESPONSE=$(curl -s http://localhost:3003)
if [[ $GRAFANA_RESPONSE == *"Found"* ]]; then
    echo "✅ Grafana is running"
else
    echo "❌ Grafana is not responding"
fi

# Test Jaeger
echo "5. Testing Jaeger..."
JAEGER_RESPONSE=$(curl -s http://localhost:16687 | head -1)
if [[ $JAEGER_RESPONSE == *"<!doctype html>"* ]]; then
    echo "✅ Jaeger is running"
else
    echo "❌ Jaeger is not responding"
fi

# Test Metrics Collection
echo "6. Testing Metrics Collection..."
METRICS_COUNT=$(curl -s http://localhost:5002/metrics | grep -c "http_request")
echo "✅ Backend has $METRICS_COUNT HTTP request metrics"

# Test Login (Generate Data)
echo "7. Testing Login (Generate Observability Data)..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(username: \"admin\", password: \"admin123\") }"}')
if [[ $LOGIN_RESPONSE == *"data"* ]]; then
    echo "✅ Login successful - Observability data generated"
else
    echo "❌ Login failed"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Open http://localhost:3002 in your browser"
echo "2. Login with admin/admin123"
echo "3. Check Grafana at http://localhost:3003 (admin/admin123)"
echo "4. View traces in Jaeger at http://localhost:16687"
echo "5. Explore metrics in Prometheus at http://localhost:9091"
