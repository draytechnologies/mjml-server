const logger = require("./log");

describe("log", () => {
  let lines;
  let writeSpy;

  beforeEach(() => {
    lines = [];
    writeSpy = jest
      .spyOn(process.stdout, "write")
      .mockImplementation((line) => lines.push(JSON.parse(line)));
  });

  afterEach(() => {
    writeSpy.mockRestore();
  });

  it("emits single-line JSON with severity and message", () => {
    logger.info("hello");

    expect(lines).toHaveLength(1);
    expect(lines[0].severity).toEqual("INFO");
    expect(lines[0].message).toEqual("hello");
    expect(lines[0].timestamp).toMatch(/\.\d{3}Z$/);
  });

  it("carries structured data when given", () => {
    logger.warning("careful", { reason: "test" });

    expect(lines[0].severity).toEqual("WARNING");
    expect(lines[0].data).toEqual({ reason: "test" });
  });

  it("omits trace ids without an active span", () => {
    logger.error("failed");

    expect(lines[0].trace_id).toBeUndefined();
    expect(lines[0].span_id).toBeUndefined();
  });

  it("carries trace and span ids when a span is active", () => {
    const { trace } = require("@opentelemetry/api");
    const spanContext = {
      traceId: "ab".repeat(16),
      spanId: "cd".repeat(8),
      traceFlags: 1,
    };
    const getActiveSpan = jest
      .spyOn(trace, "getActiveSpan")
      .mockReturnValue({ spanContext: () => spanContext });

    logger.info("hello");
    getActiveSpan.mockRestore();

    expect(lines[0].trace_id).toEqual("ab".repeat(16));
    expect(lines[0].span_id).toEqual("cd".repeat(8));
  });

  it("treats an all-zero trace id as absent", () => {
    const { trace } = require("@opentelemetry/api");
    const spanContext = {
      traceId: "0".repeat(32),
      spanId: "0".repeat(16),
      traceFlags: 0,
    };
    const getActiveSpan = jest
      .spyOn(trace, "getActiveSpan")
      .mockReturnValue({ spanContext: () => spanContext });

    logger.info("hello");
    getActiveSpan.mockRestore();

    expect(lines[0].trace_id).toBeUndefined();
  });
});
