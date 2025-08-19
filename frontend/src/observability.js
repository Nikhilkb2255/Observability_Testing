// Frontend Observability Configuration
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

// Simple metrics collection for frontend
class FrontendMetrics {
  constructor() {
    this.metrics = {
      pageViews: 0,
      userInteractions: 0,
      apiCalls: 0,
      errors: 0,
      performance: {}
    };
  }

  // Track page views
  trackPageView(pageName) {
    this.metrics.pageViews++;
    this.sendMetric('page_view', { page: pageName });
    console.log(`📊 Page View: ${pageName}`);
  }

  // Track user interactions
  trackUserInteraction(action, details = {}) {
    this.metrics.userInteractions++;
    this.sendMetric('user_interaction', { action, ...details });
    console.log(`👆 User Interaction: ${action}`, details);
  }

  // Track API calls
  trackApiCall(endpoint, method, duration, status) {
    this.metrics.apiCalls++;
    this.sendMetric('api_call', { endpoint, method, duration, status });
    console.log(`🌐 API Call: ${method} ${endpoint} - ${status} (${duration}ms)`);
  }

  // Track errors
  trackError(error, context = {}) {
    this.metrics.errors++;
    this.sendMetric('error', { 
      message: error.message, 
      stack: error.stack,
      ...context 
    });
    console.error(`❌ Error: ${error.message}`, context);
  }

  // Track performance metrics
  trackPerformance(metricName, value) {
    this.metrics.performance[metricName] = value;
    this.sendMetric('performance', { metric: metricName, value });
    console.log(`⚡ Performance: ${metricName} = ${value}`);
  }

  // Send metrics to backend (simplified)
  sendMetric(type, data) {
    // In a real implementation, you'd send this to your metrics endpoint
    // For now, we'll just log it
    const metricData = {
      type,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    };

    // You could send this to your backend metrics endpoint
    // fetch('/api/metrics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metricData)
    // });

    // For now, just store in localStorage for debugging
    this.storeMetric(metricData);
  }

  // Get session ID
  getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Get user ID from auth context
  getUserId() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.username;
      } catch (e) {
        return 'anonymous';
      }
    }
    return 'anonymous';
  }

  // Store metric in localStorage for debugging
  storeMetric(metricData) {
    const metrics = JSON.parse(localStorage.getItem('frontend_metrics') || '[]');
    metrics.push(metricData);
    
    // Keep only last 100 metrics
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
    
    localStorage.setItem('frontend_metrics', JSON.stringify(metrics));
  }

  // Get all stored metrics
  getStoredMetrics() {
    return JSON.parse(localStorage.getItem('frontend_metrics') || '[]');
  }

  // Clear stored metrics
  clearStoredMetrics() {
    localStorage.removeItem('frontend_metrics');
  }
}

// Frontend tracing
class FrontendTracing {
  constructor() {
    this.tracer = trace.getTracer('react-app');
  }

  // Create a span for user interactions
  createUserInteractionSpan(action, attributes = {}) {
    return this.tracer.startSpan(`user_interaction_${action}`, {
      attributes: {
        'user.interaction': action,
        'user.session_id': this.getSessionId(),
        'user.user_id': this.getUserId(),
        ...attributes
      }
    });
  }

  // Create a span for API calls
  createApiCallSpan(endpoint, method, attributes = {}) {
    return this.tracer.startSpan(`api_call_${method}_${endpoint}`, {
      attributes: {
        'http.url': endpoint,
        'http.method': method,
        'user.session_id': this.getSessionId(),
        'user.user_id': this.getUserId(),
        ...attributes
      }
    });
  }

  // Create a span for page navigation
  createPageNavigationSpan(pageName, attributes = {}) {
    return this.tracer.startSpan(`page_navigation_${pageName}`, {
      attributes: {
        'page.name': pageName,
        'user.session_id': this.getSessionId(),
        'user.user_id': this.getUserId(),
        ...attributes
      }
    });
  }

  // Get session ID
  getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Get user ID
  getUserId() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.username;
      } catch (e) {
        return 'anonymous';
      }
    }
    return 'anonymous';
  }
}

// Frontend logging
class FrontendLogger {
  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
  }

  // Log levels
  debug(message, data = {}) {
    if (this.shouldLog('debug')) {
      this.log('debug', message, data);
    }
  }

  info(message, data = {}) {
    if (this.shouldLog('info')) {
      this.log('info', message, data);
    }
  }

  warn(message, data = {}) {
    if (this.shouldLog('warn')) {
      this.log('warn', message, data);
    }
  }

  error(message, error = null, data = {}) {
    if (this.shouldLog('error')) {
      this.log('error', message, { ...data, error: error?.message, stack: error?.stack });
    }
  }

  // Check if we should log at this level
  shouldLog(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  // Log message
  log(level, message, data) {
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      data
    };

    // Console logging
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data);

    // Store in localStorage for debugging
    this.storeLog(logEntry);
  }

  // Get session ID
  getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Get user ID
  getUserId() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.username;
      } catch (e) {
        return 'anonymous';
      }
    }
    return 'anonymous';
  }

  // Store log in localStorage
  storeLog(logEntry) {
    const logs = JSON.parse(localStorage.getItem('frontend_logs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 50 logs
    if (logs.length > 50) {
      logs.splice(0, logs.length - 50);
    }
    
    localStorage.setItem('frontend_logs', JSON.stringify(logs));
  }

  // Get stored logs
  getStoredLogs() {
    return JSON.parse(localStorage.getItem('frontend_logs') || '[]');
  }

  // Clear stored logs
  clearStoredLogs() {
    localStorage.removeItem('frontend_logs');
  }
}

// Create instances
const metrics = new FrontendMetrics();
const tracing = new FrontendTracing();
const logger = new FrontendLogger();

// Performance monitoring
const observePerformance = () => {
  // Observe page load performance
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        metrics.trackPerformance('pageLoadTime', perfData.loadEventEnd - perfData.loadEventStart);
        metrics.trackPerformance('domContentLoaded', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
        metrics.trackPerformance('firstPaint', performance.getEntriesByName('first-paint')[0]?.startTime || 0);
      }
    });
  }
};

// Error boundary for React
const setupErrorBoundary = () => {
  window.addEventListener('error', (event) => {
    metrics.trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
    logger.error('JavaScript Error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    metrics.trackError(new Error(event.reason), { type: 'unhandledrejection' });
    logger.error('Unhandled Promise Rejection', new Error(event.reason), { type: 'unhandledrejection' });
  });
};

// Initialize observability
const initObservability = () => {
  observePerformance();
  setupErrorBoundary();
  logger.info('Frontend observability initialized');
};

export {
  metrics,
  tracing,
  logger,
  initObservability
};
