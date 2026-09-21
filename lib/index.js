#!/usr/bin/env node

"use strict";

require("./otel");

const os = require("os");
const logger = require("./log");
const { app } = require("./app");

const server = app.listen(process.env.PORT || 80);

const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

const shutdown = (signal, value) => {
  server.close(() => {
    logger.info("app stopped", { signal });
    process.exit(128 + value);
  });
};

Object.keys(signals).forEach((signal) => {
  process.on(signal, () => {
    logger.info("shutdown signal received", { signal });
    shutdown(signal, signals[signal]);
  });
});

logger.info("mjml-server started", {
  host: os.hostname(),
  port: server.address().port,
  cors: process.env.CORS || "n/a",
  response_content_type: process.env.DEFAULT_RESPONSE_CONTENT_TYPE,
  write_charset: process.env.CHARSET,
});
