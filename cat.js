const cat = require('catlistener')

cat.server({
  node: 'http-server -c-1'
})

cat.browserify({
  original: './js/files/index.js',
  compilado: './js/index.js',
  presets: ['es2015']
})