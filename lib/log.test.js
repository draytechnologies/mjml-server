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
});
