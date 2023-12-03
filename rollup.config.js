import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

export default {
  input: 'src-server/main.js',
  output: {
    file: 'dist/server.cjs',
    format: 'cjs',
    sourcemap: true,
    sourcemapExcludeSources: true
  },
  plugins: [
    commonjs(),
    json()
  ]
}
