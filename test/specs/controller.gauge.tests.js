describe('Chart.controllers.gauge', () => {
  it('should be registered as dataset controller', () => {
    expect(typeof Chart.controllers.gauge).toBe('function');
  });

  it('should be constructed', () => {
    const chart = window.acquireChart({
      type: 'gauge',
      data: {
        datasets: [{
          value: 1,
          data: [],
        }],
      },
    });

    const meta = chart.getDatasetMeta(0);
    expect(meta.type).toBe('gauge');
    expect(meta.controller).not.toBe(undefined);
    expect(meta.controller.index).toBe(0);
    expect(meta.data).toEqual([]);

    meta.controller.updateIndex(1);
    expect(meta.controller.index).toBe(1);
  });

  it('should create gauge arc elements for each data item during initialization', () => {
    const chart = window.acquireChart({
      type: 'gauge',
      data: {
        datasets: [{
          value: 2,
          data: [10, 15, 0, 4],
        }],
      },
    });

    const meta = chart.getDatasetMeta(0);
    expect(meta.data.length).toBe(4); // 4 rectangles created
    expect(meta.data[0] instanceof Chart.elements.Arc).toBe(true);
    expect(meta.data[1] instanceof Chart.elements.Arc).toBe(true);
    expect(meta.data[2] instanceof Chart.elements.Arc).toBe(true);
    expect(meta.data[3] instanceof Chart.elements.Arc).toBe(true);
  });

  it('should scale values', () => {
    const chart = window.acquireChart({
      type: 'gauge',
      data: {
        datasets: [{
          value: 1,
          data: [2, 3, 4],
        }],
      },
      options: {
        rotation: -Math.PI,
        circumference: Math.PI,
      },
    });

    const meta = chart.getDatasetMeta(0);

    expect(meta.data.length).toBe(3);

    // Only startAngle, endAngle and circumference should be different.
    [
      { c: Math.PI / 2, s: -Math.PI, e: -Math.PI / 2 },
      { c: Math.PI / 4, s: -Math.PI / 2, e: -Math.PI / 4 },
      { c: Math.PI / 4, s: -Math.PI / 4, e: 0 },
    ].forEach((expected, i) => {
      expect(meta.data[i]._model.circumference).toBeCloseTo(expected.c, 8, `circumference ${i}`);
      expect(meta.data[i]._model.startAngle).toBeCloseTo(expected.s, 8, `startAngle ${i}`);
      expect(meta.data[i]._model.endAngle).toBeCloseTo(expected.e, 8, `endAngle ${i}`);
    });
  });

  it('should scale values for minValue', () => {
    const chart = window.acquireChart({
      type: 'gauge',
      data: {
        datasets: [{
          value: 0,
          minValue: -1, // number | true
          data: [1, 2, 3], // or [0, 2, 3, 4] with [null, 'green', 'yellow', 'red']
        }],
      },
      options: {
        rotation: -Math.PI,
        circumference: Math.PI,
      },
    });

    const meta = chart.getDatasetMeta(0);

    expect(meta.data.length).toBe(3);

    // Only startAngle, endAngle and circumference should be different.
    [
      { c: Math.PI / 2, s: -Math.PI, e: -Math.PI / 2 },
      { c: Math.PI / 4, s: -Math.PI / 2, e: -Math.PI / 4 },
      { c: Math.PI / 4, s: -Math.PI / 4, e: 0 },
    ].forEach((expected, i) => {
      expect(meta.data[i]._model.circumference).toBeCloseTo(expected.c, 8, `circumference ${i}`);
      expect(meta.data[i]._model.startAngle).toBeCloseTo(expected.s, 8, `startAngle ${i}`);
      expect(meta.data[i]._model.endAngle).toBeCloseTo(expected.e, 8, `endAngle ${i}`);
    });
  });
});
