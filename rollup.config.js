const babel = require('rollup-plugin-babel');
const { terser } = require('rollup-plugin-terser');
const pkg = require('./package.json');

const input = 'src/index.js';
const banner = `/*!
 * chartjs-gauge.js v${pkg.version}
 * ${pkg.homepage}
 * (c) ${new Date().getFullYear()} chartjs-gauge.js Contributors
 * Released under the MIT License
 */`;

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
    ],
    output: {
      name: 'Gauge',
      file: 'dist/chartjs-gauge.js',
      banner,
      format: 'umd',
      indent: false,
      globals: {
        'chart.js': 'Chart',
      },
    },
    external: [
      'chart.js',
    ],
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
    ],
    output: {
      name: 'Gauge',
      file: 'dist/chartjs-gauge.min.js',
      format: 'umd',
      indent: false,
      globals: {
        'chart.js': 'Chart',
      },
    },
    external: [
      'chart.js',
    ],
  },
];
