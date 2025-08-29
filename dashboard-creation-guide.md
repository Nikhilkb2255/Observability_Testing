# Observability Dashboard Creation Guide

## 🎯 Complete Observability Testing Framework

### 📊 Dashboard 1: APM Dashboard

#### Panel 1.1: Request Success Rate
```
Panel Type: Stat
Data Source: Prometheus
Query: rate(http_requests_total{status_code="200"}[5m]) / rate(http_requests_total[5m]) * 100
Title: "Request Success Rate"
Unit: percent
Thresholds: Green(>95%) Yellow(90-95%) Red(<90%)
```

#### Panel 1.2: Response Time Percentiles
```
Panel Type: Time Series
Data Source: Prometheus
Query A: histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))
Query B: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
Query C: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
Title: "Response Time Percentiles"
Legend: 50th, 95th, 99th Percentile
```

#### Panel 1.3: Login Success Rate
```
Panel Type: Stat
Data Source: Prometheus
Query: rate(login_attempts_total{status="success"}[5m])
Title: "Login Success Rate"
Unit: logins/sec
```

### 📊 Dashboard 2: Metrics Dashboard

#### Panel 2.1: System Resources
```
Panel Type: Time Series
Data Source: Prometheus
Query A: process_cpu_seconds_total
Query B: process_resident_memory_bytes / 1024 / 1024
Query C: nodejs_heap_size_total_bytes / 1024 / 1024
Title: "System Resource Usage"
Legend: CPU, Memory (MB), Heap (MB)
```

#### Panel 2.2: Request Rate
```
Panel Type: Stat
Data Source: Prometheus
Query: rate(http_requests_total[5m])
Title: "Request Rate"
Unit: reqps
```

### 📊 Dashboard 3: Logs Dashboard

#### Panel 3.1: Log Volume
```
Panel Type: Time Series
Data Source: Loki
Query: rate({job="backend"}[5m])
Title: "Log Volume Over Time"
Legend: Backend Logs
```

#### Panel 3.2: Error Logs
```
Panel Type: Logs
Data Source: Loki
Query: {job="backend"} |= "error"
Title: "Error Logs"
Max Lines: 20
```

### 📊 Dashboard 4: Traces Dashboard

#### Panel 4.1: Span Generation
```
Panel Type: Stat
Data Source: Prometheus
Query: rate(jaeger_spans_total[5m])
Title: "Total Spans Generated"
Unit: spans/sec
```

#### Panel 4.2: Trace Duration
```
Panel Type: Time Series
Data Source: Prometheus
Query: histogram_quantile(0.95, rate(jaeger_span_duration_seconds_bucket[5m]))
Title: "Trace Duration (95th Percentile)"
Unit: seconds
```

### 📊 Dashboard 5: Alerts Dashboard

#### Panel 5.1: Active Alerts
```
Panel Type: Stat
Data Source: Prometheus
Query: alertmanager_alerts{state="firing"}
Title: "Active Alerts"
Thresholds: Green(0) Yellow(1-3) Red(>3)
```

#### Panel 5.2: Alert Latency
```
Panel Type: Time Series
Data Source: Prometheus
Query: rate(alertmanager_notification_latency_seconds[5m])
Title: "Alert Notification Latency"
Unit: seconds
```

### 📊 Dashboard 6: Infrastructure Dashboard

#### Panel 6.1: Service Health
```
Panel Type: Stat
Data Source: Prometheus
Query: up{job="backend-api"}
Title: "Backend Service Health"
Thresholds: Green(1) Red(0)
```

#### Panel 6.2: Prometheus Targets
```
Panel Type: Stat
Data Source: Prometheus
Query: up
Title: "Prometheus Targets Up"
Thresholds: Green(>90%) Yellow(80-90%) Red(<80%)
```

### 📊 Dashboard 7: Coverage Dashboard

#### Panel 7.1: Service Instrumentation
```
Panel Type: Stat
Data Source: Prometheus
Query: count(up{job=~".*"}) / count(up{job=~".*"}) * 100
Title: "Services Instrumented"
Unit: percent
Thresholds: Green(>95%) Yellow(80-95%) Red(<80%)
```

#### Panel 7.2: Metrics Coverage
```
Panel Type: Stat
Data Source: Prometheus
Query: count({__name__=~"http_request.*|login_attempts.*|graphql_queries.*"}) / count({__name__=~".*"}) * 100
Title: "Custom Metrics Coverage"
Unit: percent
```

### 📊 Dashboard 8: Performance Dashboard

#### Panel 8.1: Load Testing
```
Panel Type: Time Series
Data Source: Prometheus
Query: rate(http_requests_total[1m])
Title: "Request Rate Under Load"
Legend: {{method}} {{route}}
```

#### Panel 8.2: Performance Baselines
```
Panel Type: Stat
Data Source: Prometheus
Query: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
Title: "95th Percentile Response Time"
Unit: seconds
Thresholds: Green(<0.5s) Yellow(0.5-1s) Red(>1s)
```

## 🚨 Alert Configuration

### Alert 1: High Response Time
```
Name: High Response Time
Condition: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
Duration: 2m
Severity: warning
```

### Alert 2: High Error Rate
```
Name: High Error Rate
Condition: rate(http_requests_total{status_code=~"4..|5.."}[5m]) > 0.05
Duration: 1m
Severity: critical
```

### Alert 3: Service Down
```
Name: Service Down
Condition: up{job="backend-api"} == 0
Duration: 30s
Severity: critical
```

### Alert 4: High Memory Usage
```
Name: High Memory Usage
Condition: process_resident_memory_bytes / 1024 / 1024 > 200
Duration: 5m
Severity: warning
```

## 📋 Testing Checklist

### ✅ Infrastructure Health
- [ ] All services running (Prometheus, Grafana, Loki, Jaeger)
- [ ] Data sources configured
- [ ] Targets healthy

### ✅ Metrics Collection
- [ ] Custom metrics generated
- [ ] Prometheus scraping data
- [ ] Metrics available in Grafana

### ✅ Logging
- [ ] Logs being collected
- [ ] Loki receiving logs
- [ ] Log queries working

### ✅ Tracing
- [ ] Traces being generated
- [ ] Jaeger collecting spans
- [ ] Trace queries working

### ✅ Alerts
- [ ] Alert rules configured
- [ ] Alert notifications working
- [ ] Alert accuracy >90%

### ✅ Dashboards
- [ ] All 8 dashboards created
- [ ] Panels showing data
- [ ] Thresholds configured

## 🎯 Success Criteria

### Coverage Targets:
- **Services Instrumented**: >95%
- **Metrics Coverage**: >80%
- **Log Sources**: >2
- **Trace Services**: >1
- **Alert Accuracy**: >90%

### Performance Targets:
- **Response Time (95th)**: <1s
- **Error Rate**: <5%
- **Uptime**: >99.9%
- **Alert Latency**: <30s
