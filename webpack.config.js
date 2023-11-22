var path = require('path');

module.exports = {
  entry: './src/MkvDemuxer.js',
  mode: 'production',
  output: {
    library: 'MkvDemuxer',
    // libraryTarget: 'window',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
    filename: 'MkvDemuxer.js'
  }
};