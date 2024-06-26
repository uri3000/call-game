const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, './client/index.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist/client'), // Output directory for client build
    filename: 'bundle.js',
    publicPath: '/'
  },
  mode: process.env.NODE_ENV || 'development', // Use 'production' mode for production builds
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.svg$/,  // Add this rule for handling SVG files
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/'
          }
        }
      },
      {
        test: /\.css$/,  // Add this rule for handling CSS files
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, './dist/client') // Serve static files from dist/client
    },
    historyApiFallback: true,
    port: 8080,
    hot: true,
    compress: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: {'^/api' : ''} // Remove '/api' prefix before forwarding to the backend
      }
    },
    watchFiles: ['client/**']
  }
};