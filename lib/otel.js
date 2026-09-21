"use strict";

// Must be required before any other module so http/express get patched.
// Configuration comes from the standard OTEL_* env vars (service name,
// exporter endpoint); without an endpoint the SDK is not started at all.
const start = () => {
  if (!process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) {
    return null;
  }

  const { NodeSDK } = require("@opentelemetry/sdk-node");
  const {
    OTLPTraceExporter,
  } = require("@opentelemetry/exporter-trace-otlp-grpc");
  const {
    HttpInstrumentation,
  } = require("@opentelemetry/instrumentation-http");
  const {
    ExpressInstrumentation,
  } = require("@opentelemetry/instrumentation-express");

  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [
      new HttpInstrumentation({
        // kubelet probes would otherwise emit a server-span trace every few seconds
        ignoreIncomingRequestHook: (req) =>
          (req.url || "").startsWith("/health"),
      }),
      new ExpressInstrumentation(),
    ],
  });

  sdk.start();
  process.on("SIGTERM", () => {
    sdk.shutdown().catch(() => {});
  });
  return sdk;
};

module.exports = { sdk: start() };
