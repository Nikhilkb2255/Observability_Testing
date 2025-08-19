const { trace } = require('@opentelemetry/api');

// Get the tracer
const tracer = trace.getTracer('student-marks-api');

// Helper function to create spans
const createSpan = (name, attributes = {}) => {
  return tracer.startSpan(name, { attributes });
};

// Helper function to add events to spans
const addSpanEvent = (span, name, attributes = {}) => {
  if (span && span.addEvent) {
    span.addEvent(name, attributes);
  }
};

// Helper function to set span attributes
const setSpanAttributes = (span, attributes = {}) => {
  if (span && span.setAttributes) {
    span.setAttributes(attributes);
  }
};

module.exports = {
  tracer,
  createSpan,
  addSpanEvent,
  setSpanAttributes,
  trace
};
