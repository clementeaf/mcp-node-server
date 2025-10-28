const path = require('path');

module.exports = {
  entry: './lambda/handler.js',
  target: 'node',
  mode: 'production',
  externals: {
    'aws-sdk': 'aws-sdk',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: 'handler.js',
  },
  optimization: {
    minimize: true,
  },
};
