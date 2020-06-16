import CircularDependencyPlugin from 'circular-dependency-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import NodemonWebpackPlugin from 'nodemon-webpack-plugin'
import { Configuration } from 'webpack'
import merge from 'webpack-merge'

import commonConfig from './webpack.common'

const config: Configuration = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-cheap-module-source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new NodemonWebpackPlugin(),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
    }),
  ],
  stats: {
    all: false,
    errors: true,
    timings: true,
    warnings: true,
  },
})

export default config
