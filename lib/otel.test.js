describe("otel", () => {
  const loadFresh = () => {
    let mod;
    jest.isolateModules(() => {
      mod = require("./otel");
    });
    return mod;
  };

  afterEach(() => {
    delete process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  });

  it("is inert without an exporter endpoint", () => {
    delete process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;

    const { sdk } = loadFresh();

    expect(sdk).toBeNull();
  });

  it("starts the SDK when an exporter endpoint is configured", async () => {
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = "http://localhost:4317";

    const { sdk } = loadFresh();

    expect(sdk).not.toBeNull();
    await sdk.shutdown();
  });
});
