const babel = require('rollup-plugin-babel');
const { terser } = require('rollup-plugin-terser');
const json = require('@rollup/plugin-json');
const pkg = require('./package.json');

const banner = `/*!
 * chartjs-gauge.js v${pkg.version}
 * ${pkg.homepage}
 * (c) ${new Date().getFullYear()} chartjs-gauge.js Contributors
 * Released under the MIT License
 */`;

const input = 'src/index.js';
const inputESM = 'src/index.esm.js';
const external = [
  'chart.js',
  'chart.js/helpers'
];
const globals = {
  'chart.js': 'Chart',
  'chart.js/helpers': 'Chart.helpers'
};

module.exports = [
  // UMD builds (excluding Chart)
  // dist/chartjs-gauge.js
  // dist/chartjs-gauge.min.js
  {
    input,
    plugins: [
      babel({
        exclude: 'node_modules/**',
      }),
      json(),
    ],
    output: {
      name: 'Gauge',
      file: 'dist/chartjs-gauge.js',
      banner,
      format: 'umd',
      indent: false,
      globals
    },
    external
  },
  {
    input,
    plugins: [
      babel({
        exclude: 'node_modules/**',
      }),
      terser({
        output: {
          preamble: banner,
        },
      }),
      json(),
    ],
    output: {
      name: 'Gauge',
      file: 'dist/chartjs-gauge.min.js',
      format: 'umd',
      indent: false,
      globals
    },
    external
  },
];
