import path from 'path'
import TSConfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { Configuration } from 'webpack'

const config: Configuration = {
  entry: './src/server.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TSConfigPathsPlugin()],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
  },
}

export default config
