const path = require('path');
const nodeExternals = require('webpack-node-externals');
const {TsConfigPathsPlugin} = require('awesome-typescript-loader');

module.exports = [
  {
    mode: 'development',
    entry: './monitoring/maintenance/update_job.ts',
    target: 'node',
    externals: [nodeExternals()],
    node: {
      __dirname: false,
      __filename: false,
    },
    module: {
      rules: [
        {
          loader: 'ts-loader',
          test: /\.ts$/,
          exclude: [/node_modules/],
          options: {
            configFile: 'tsconfig.json',
          },
        },
      ],
    },
    resolve: {
      plugins: [new TsConfigPathsPlugin()],
      extensions: ['.ts', '.js'],
    },
    output: {
      path: path.resolve(__dirname, './monitoring/maintenance'),
      filename: 'update_job.js',
    },
    cache: false,
  },
  {
    mode: 'development',
    entry: './monitoring/index.ts',
    target: 'node',
    externals: [nodeExternals()],
    node: {
      __dirname: false,
      __filename: false,
    },
    module: {
      rules: [
        {
          loader: 'ts-loader',
          test: /\.ts$/,
          exclude: [/node_modules/],
          options: {
            configFile: 'tsconfig.json',
          },
        },
      ],
    },
    resolve: {
      plugins: [new TsConfigPathsPlugin()],
      extensions: ['.ts', '.js'],
    },
    output: {
      path: path.resolve(__dirname, './monitoring/'),
      filename: 'inkbird.js',
    },
    cache: false,
  },
];
