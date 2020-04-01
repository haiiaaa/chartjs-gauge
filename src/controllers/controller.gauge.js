import Chart from 'chart.js';

// default options
Chart.defaults._set('gauge', {
  needle: {
    // Needle circle radius as the percentage of the chart area width
    radiusPercentage: 2,
    // Needle width as the percentage of the chart area width
    widthPercentage: 3.2,
    // Needle length as the percentage of the interval between inner radius (0%) and outer radius (100%) of the arc
    lengthPercentage: 80,
    // The color of the needle
    color: 'rgba(0, 0, 0, 1)',
  },
  valueLabel: {
    display: true,
    formatter: null,
    color: 'rgba(255, 255, 255, 1)',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    borderRadius: 5,
    padding: {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5,
    },
    bottomMarginPercentage: 5,
  },
  animation: {
    duration: 1000,
    animateRotate: true,
    animateScale: false,
  },
  // The percentage of the chart that we cut out of the middle.
  cutoutPercentage: 50,
  // The rotation of the chart, where the first data arc begins.
  rotation: -Math.PI,
  // The total circumference of the chart.
  circumference: Math.PI,
  legend: {
    display: false,
  },
  tooltips: {
    enabled: false,
  },
});

const GaugeController = Chart.controllers.doughnut.extend({
  getMaxValue(data) {
    // assuming array is sorted
    return data[data.length - 1] || 1;
  },
  getWidth(chart) {
    return chart.chartArea.right - chart.chartArea.left;
  },
  getTranslation(chart) {
    const { chartArea, offsetX, offsetY } = chart;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const dx = (centerX + offsetX);
    const dy = (centerY + offsetY);
    return { dx, dy };
  },
  getAngle({ chart, value, maxValue }) {
    const { rotation, circumference } = chart.options;
    return rotation + (circumference * (value / maxValue));
  },
  /* TODO set min padding, not applied until chart.update() (also chartArea must have been set)
  setBottomPadding(chart) {
    const needleRadius = this.getNeedleRadius(chart);
    const padding = this.chart.config.options.layout.padding;
    if (needleRadius > padding.bottom) {
      padding.bottom = needleRadius;
      return true;
    }
    return false;
  },
  */
  drawNeedle(ease) {
    if (!this.chart.animating) { // triggered when hovering
      ease = 1;
    }
    const {
      ctx,
      config,
      innerRadius,
      outerRadius,
    } = this.chart;
    const dataset = config.data.datasets[this.index];
    const { previous } = this.getMeta();
    const {
      radiusPercentage,
      widthPercentage,
      lengthPercentage,
      color,
    } = config.options.needle;

    const width = this.getWidth(this.chart);
    const needleRadius = (radiusPercentage / 100) * width;
    const needleWidth = (widthPercentage / 100) * width;
    const needleLength = (lengthPercentage / 100) * (outerRadius - innerRadius) + innerRadius;

    // center
    const { dx, dy } = this.getTranslation(this.chart);

    // interpolate
    const origin = this.getAngle({ chart: this.chart, value: previous.value, maxValue: previous.maxValue });
    // TODO maxValue is in current.maxValue also
    const target = this.getAngle({ chart: this.chart, value: dataset.value, maxValue: this.getMaxValue(dataset.data) });
    const angle = origin + (target - origin) * ease;

    // draw
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(angle);
    ctx.fillStyle = color;

    // draw circle
    ctx.beginPath();
    ctx.ellipse(0, 0, needleRadius, needleRadius, 0, 0, 2 * Math.PI);
    ctx.fill();

    // draw needle
    ctx.beginPath();
    ctx.moveTo(0, needleWidth / 2);
    ctx.lineTo(needleLength, 0);
    ctx.lineTo(0, -needleWidth / 2);
    ctx.fill();

    ctx.restore();
  },
  drawValueLabel(ease) { // eslint-disable-line no-unused-vars
    if (!this.chart.config.options.valueLabel.display) {
      return;
    }
    const { ctx, config } = this.chart;
    const dataset = config.data.datasets[this.index];
    const {
      formatter,
      color,
      backgroundColor,
      borderRadius,
      padding,
      bottomMarginPercentage,
    } = config.options.valueLabel;

    const width = this.getWidth(this.chart);
    const bottomMargin = (bottomMarginPercentage / 100) * width;

    const fmt = formatter || (value => value);
    const valueText = fmt(dataset.value).toString();
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // const { width: textWidth, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(valueText);
    // const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;
    const { width: textWidth } = ctx.measureText(valueText);
    // approximate height until browsers support advanced TextMetrics
    const textHeight = ctx.measureText('M').width;

    const x = -(padding.left + textWidth / 2);
    const y = -(padding.top + textHeight / 2);
    const w = (padding.left + textWidth + padding.right);
    const h = (padding.top + textHeight + padding.bottom);

    // center
    let { dx, dy } = this.getTranslation(this.chart);
    // add rotation
    const rotation = this.chart.options.rotation % (Math.PI * 2.0);
    dx += bottomMargin * Math.cos(rotation + Math.PI / 2);
    dy += bottomMargin * Math.sin(rotation + Math.PI / 2);

    // draw
    ctx.save();
    ctx.translate(dx, dy);

    // draw background
    ctx.beginPath();
    Chart.helpers.canvas.roundedRect(ctx, x, y, w, h, borderRadius);
    ctx.fillStyle = backgroundColor;
    ctx.fill();

    // draw value text
    ctx.fillStyle = color || config.options.defaultFontColor;
    ctx.fillText(valueText, 0, textHeight / 2 - (padding.bottom));

    ctx.restore();
  },
  // overrides
  update(reset) {
    const dataset = this.chart.config.data.datasets[this.index];
    const meta = this.getMeta();
    const initialValue = {
      value: 0,
      maxValue: 1,
    };
    // animations on will call update(reset) before update()
    if (reset) {
      meta.previous = null;
      meta.current = initialValue;
    } else {
      dataset.data.sort((a, b) => a - b);
      meta.previous = meta.current || initialValue;
      meta.current = {
        value: dataset.value,
        maxValue: this.getMaxValue(dataset.data),
      };
    }
    Chart.controllers.doughnut.prototype.update.call(this, reset);
  },
  updateElement(arc, index, reset) {
    // TODO handle reset and options.animation
    Chart.controllers.doughnut.prototype.updateElement.call(this, arc, index, reset);
    const dataset = this.getDataset();
    const { data } = dataset;
    const { options } = this.chart.config;

    // scale data
    const maxValue = this.getMaxValue(data);
    const previousValue = data[index - 1] || 0;
    const value = data[index];
    const startAngle = options.rotation + (options.circumference * (previousValue / maxValue));
    const endAngle = startAngle + (options.circumference * ((value - previousValue) / maxValue));
    const circumference = endAngle - startAngle;

    Object.assign(arc._model, { startAngle, endAngle, circumference });
  },
  draw(ease) {
    Chart.controllers.doughnut.prototype.draw.call(this, ease);

    this.drawNeedle(ease);
    this.drawValueLabel(ease);
  },
});

export default GaugeController;
