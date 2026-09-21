"use strict";

// Single-line JSON logs on stdout (collected by vlagent into VictoriaLogs)
// with `severity` and, when a span is active, the trace/span ids that join
// them to Tempo.
const { trace } = require("@opentelemetry/api");

const ZERO_TRACE = "0".repeat(32);

const write = (severity, message, data) => {
  const payload = {
    timestamp: new Date().toISOString(),
    severity,
    message,
  };
  const span = trace.getActiveSpan();
  const context = span && span.spanContext();
  if (context && context.traceId && context.traceId !== ZERO_TRACE) {
    payload.trace_id = context.traceId;
    payload.span_id = context.spanId;
  }
  if (data) {
    payload.data = data;
  }
  process.stdout.write(`${JSON.stringify(payload)}\n`);
};

module.exports = {
  info: (message, data) => write("INFO", message, data),
  warning: (message, data) => write("WARNING", message, data),
  error: (message, data) => write("ERROR", message, data),
};
