const typescript = require('rollup-plugin-typescript2')
// const { terser } = require('rollup-plugin-terser')

module.exports = [
  {
    input: ['./src/index.ts'],
    output: [
      {
        dir: '.',
        format: 'es',
        name: 'spider-web',
        chunkFileNames: '[name].js',
      },
    ],
    plugins: [typescript() /*terser()*/],
    external: ['flatqueue', 'react'],
    experimentalCodeSplitting: true,
  },
]
