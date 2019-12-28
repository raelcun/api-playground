import path from 'path'
import TSConfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import NodemonWebpackPlugin from 'nodemon-webpack-plugin'
import CircularDependencyPlugin from 'circular-dependency-plugin'
import { Configuration } from 'webpack'

const config: Configuration = {
  entry: './src/server.ts',
  target: 'node',
  mode: 'development',
  devtool: 'inline-source-map',
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
  plugins: [new CleanWebpackPlugin(), new NodemonWebpackPlugin(), new CircularDependencyPlugin()],
}

module.exports = config
