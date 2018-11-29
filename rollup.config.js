const typescript = require('rollup-plugin-typescript2')

module.exports = [
  {
    input: [
      './src/index.ts',
      './src/operations/operations.ts',
      './src/react/useSlice.ts',
    ],
    output: [
      {
        dir: '.',
        format: 'es',
        name: 'spider-web',
        chunkFileNames: '[name].js',
      },
    ],
    plugins: [typescript()],
    external: ['flatqueue', 'react'],
    experimentalCodeSplitting: true,
  },
]
