
// Assuming you're already using webpack for your React app
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  // Your existing webpack configuration...
  
  // Add an additional entry point for background.js
  entry: {
    main: './src/index.tsx', // Your existing entry
    background: './src/background.js'
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  
  // Add a plugin to copy your manifest and icons
  plugins: [
    // Your existing plugins...
    new CopyPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'public/icons', to: 'icons' } // Assuming you have icons in a public/icons folder
      ]
    })
  ]
};