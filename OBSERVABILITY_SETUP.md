# 🚀 Observability Setup for React Student Marks App

## 📋 Overview

This document describes the complete observability implementation for the React Student Marks application, including metrics collection, logging, distributed tracing, and visualization.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Observability │
│   (React)       │    │   (Node.js)     │    │   Stack         │
│   Port: 3002    │    │   Port: 5002    │    │                 │
│                 │    │                 │    │                 │
│ • User Actions  │───▶│ • API Endpoints │───▶│ • Prometheus    │
│ • Performance   │    │ • Database      │    │ • Grafana       │
│ • Errors        │    │ • Business Logic│    │ • Loki          │
│ • User Journey  │    │ • Authentication│    │ • Jaeger        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Observability Components

### 1. **Metrics Collection (Prometheus)**
- **Port**: 9091
- **URL**: http://localhost:9091
- **Purpose**: Collect and store time-series metrics

**Backend Metrics:**
- HTTP request duration and count
- GraphQL query performance
- Login attempts (success/failure)
- Active connections
- System metrics (CPU, memory, etc.)

**Frontend Metrics:**
- Page load times
- User interactions
- API call performance
- Error rates
- User journey tracking

### 2. **Visualization (Grafana)**
- **Port**: 3003
- **URL**: http://localhost:3003
- **Credentials**: admin/admin123
- **Purpose**: Create dashboards and visualizations

**Available Dashboards:**
- Application Performance
- User Experience Metrics
- Error Monitoring
- Business Metrics

### 3. **Log Aggregation (Loki)**
- **Port**: 3101
- **Purpose**: Centralized log collection and querying

**Log Sources:**
- Backend application logs
- Frontend error logs
- System logs
- Access logs

### 4. **Distributed Tracing (Jaeger)**
- **Port**: 16687 (Web UI)
- **URL**: http://localhost:16687
- **Purpose**: Trace requests across services

**Trace Points:**
- User login flow
- GraphQL queries
- Database operations
- API requests

## 🔧 Implementation Details

### Backend Observability

#### Metrics Collection
```javascript
// Custom metrics defined in metrics.js
- httpRequestDuration: Histogram for request timing
- httpRequestTotal: Counter for request count
- loginAttempts: Counter for login success/failure
- graphqlQueries: Counter for GraphQL operations
- activeConnections: Gauge for current connections
```

#### Structured Logging
```javascript
// Winston logger with JSON format
- Error logs with stack traces
- Request/response logging
- Authentication events
- Business logic execution
```

#### Distributed Tracing
```javascript
// OpenTelemetry integration
- Request span creation
- Database operation tracing
- GraphQL query tracing
- Error tracking
```

### Frontend Observability

#### User Interaction Tracking
```javascript
// Custom metrics collection
- Page views
- Button clicks
- Form interactions
- Navigation events
```

#### Performance Monitoring
```javascript
// Web Performance API integration
- Page load times
- DOM content loaded
- First paint metrics
- Resource loading times
```

#### Error Tracking
```javascript
// Global error handlers
- JavaScript errors
- Unhandled promise rejections
- API call failures
- User interaction errors
```

## 🚀 Getting Started

### 1. Start Observability Stack
```bash
cd /home/nikhilkb/Documents/Task_3
docker-compose -f docker-compose.observability.yml up -d
```

### 2. Start Backend Server
```bash
cd backend
node index.js
```

### 3. Start Frontend Application
```bash
cd frontend
npm start
```

### 4. Access Observability Tools

| Tool | URL | Purpose |
|------|-----|---------|
| **Grafana** | http://localhost:3003 | Dashboards & Visualization |
| **Prometheus** | http://localhost:9091 | Metrics Collection |
| **Jaeger** | http://localhost:16687 | Distributed Tracing |
| **Loki** | http://localhost:3101 | Log Aggregation |

## 📈 Available Metrics

### Backend Metrics
- `http_request_duration_seconds` - Request response times
- `http_requests_total` - Total request count
- `login_attempts_total` - Login success/failure rates
- `graphql_queries_total` - GraphQL operation counts
- `active_connections` - Current active connections

### Frontend Metrics
- `page_load_time` - Page load performance
- `user_interactions` - User interaction counts
- `api_call_duration` - API call performance
- `error_count` - Error rates by type

### System Metrics
- `process_cpu_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage
- `nodejs_heap_size_total_bytes` - Heap memory
- `nodejs_gc_duration_seconds` - Garbage collection

## 🔍 Monitoring & Alerting

### Key Performance Indicators (KPIs)
1. **Response Time**: < 500ms for API calls
2. **Error Rate**: < 1% for all endpoints
3. **Login Success Rate**: > 95%
4. **Page Load Time**: < 3 seconds

### Alert Rules (Configured in Prometheus)
- High error rate alerts
- Slow response time alerts
- Service down alerts
- Memory/CPU usage alerts

## 📝 Logging Strategy

### Log Levels
- **ERROR**: Application errors, exceptions
- **WARN**: Warning conditions, potential issues
- **INFO**: General information, user actions
- **DEBUG**: Detailed debugging information

### Log Format
```json
{
  "level": "info",
  "message": "User logged in successfully",
  "timestamp": "2025-08-18T16:43:14.243Z",
  "service": "student-marks-api",
  "userId": "admin",
  "sessionId": "session_1234567890",
  "metadata": {
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

## 🔧 Configuration Files

### Docker Compose
- `docker-compose.observability.yml` - Observability stack configuration

### Prometheus
- `observability/prometheus/prometheus.yml` - Metrics collection targets

### Grafana
- `observability/grafana/provisioning/datasources/datasources.yml` - Data source configuration

### Loki
- `observability/loki/loki-config.yml` - Log aggregation configuration

### Promtail
- `observability/promtail/promtail-config.yml` - Log collection configuration

## 🎯 Benefits

### 1. **Full Visibility**
- Real-time monitoring of application performance
- Complete traceability of user requests
- Centralized logging for debugging

### 2. **Proactive Monitoring**
- Early detection of performance issues
- Automated alerting for critical problems
- Capacity planning insights

### 3. **User Experience Optimization**
- Performance bottleneck identification
- User journey analysis
- Error pattern recognition

### 4. **Operational Excellence**
- Reduced mean time to resolution (MTTR)
- Data-driven decision making
- Improved system reliability

## 🔄 Next Steps

### Phase 1: Basic Setup ✅
- [x] Prometheus metrics collection
- [x] Grafana dashboards
- [x] Structured logging
- [x] Basic tracing

### Phase 2: Advanced Features
- [ ] Custom Grafana dashboards
- [ ] Alert rules configuration
- [ ] Performance optimization
- [ ] Business metrics tracking

### Phase 3: Production Ready
- [ ] High availability setup
- [ ] Data retention policies
- [ ] Security hardening
- [ ] Performance tuning

## 📞 Support

For issues or questions about the observability setup:
1. Check the logs in `backend/logs/`
2. Verify Docker containers are running
3. Test individual service endpoints
4. Review configuration files

---

**Last Updated**: August 18, 2025
**Version**: 1.0.0
