"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const mjml2html = require("mjml");

const healthchecks = require("./healthcheck");
const logger = require("./log");

const app = express();

const maxReqBody = process.env.MAX_REQUEST_BODY || "2048kb";
app.use(
  bodyParser.text({ limit: maxReqBody, type: "text/*" }),
  bodyParser.json({ limit: maxReqBody }),
);

const opts = {
  keepComments: process.env.MJML_KEEP_COMMENTS === "true",
  beautify: process.env.MJML_BEAUTIFY === "true",
  validationLevel: ["soft", "strict", "skip"].includes(
    process.env.MJML_VALIDATION_LEVEL,
  )
    ? process.env.MJML_VALIDATION_LEVEL
    : "soft",
};

healthchecks.create(app, opts);

app.post("/", function (req, res) {
  if (process.env.CORS) {
    res.header("Access-Control-Allow-Origin", process.env.CORS);
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "POST");
    res.header("Access-Control-Max-Age", "-1");
  }

  if (!req.headers["content-type"]) {
    res
      .status(400)
      .send(
        "Content-Type must be set, use text/html or application/json if unsure",
      );
    return;
  }
  const isJson = req.headers["content-type"] === "application/json";
  try {
    const input = req.body.mjml || req.body || "";
    const result = mjml2html(input, opts);
    return res.send(isJson ? { html: result.html } : result.html);
  } catch (ex) {
    // never log the body: full email markup, potentially with PII
    logger.warning("mjml render failed", {
      error: ex.message,
      content_type: req.headers["content-type"],
      body_bytes: req.headers["content-length"],
    });
    return res.status(400).send(isJson ? { error: ex.message } : ex.message);
  }
});

module.exports = { app };
