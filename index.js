var rude = module.exports = require('fis3-postpackager-loader');
var _ = fis.util;

rude.lang.html = require('./lib/html.js');
rude.lang.smarty = require('./lib/smarty.js');

_.assign(rude.defaultOptions, {
  left_delimiter: '{%',
  right_delimiter: '%}',

  processor: {
    '.html': 'html',
    '.tpl': 'smarty'
  }
});
