const path = require('path')
const typescript = require('rollup-plugin-typescript')

module.exports = {
  input: './src/index.ts',
  output: {
    file: './lib/index.bundle.js',
    format: 'umd',
    name: 'spider-web',
  },
  plugins: [typescript()],
}
