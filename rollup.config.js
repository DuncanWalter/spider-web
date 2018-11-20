const path = require('path')
const typescript = require('rollup-plugin-typescript')

module.exports = [
  {
    input: ['./src/index.ts', './src/operations/operations.ts'],
    output: [
      {
        dir: '.',
        format: 'es',
        name: 'spider-web',
      },
    ],
    plugins: [typescript()],
    external: ['flatqueue'],
    experimentalCodeSplitting: true,
  },
]
