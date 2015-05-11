var rScript = /<!--(?!\[)([\s\S]*?)(?:-->|$)|(<script[^>]*>([\s\S]*?)<\/script>)/ig;
var rRosettaType = /type=('|")text\/rosetta\1/i;

function obtainRosetaScript(content, resource) {
  content = content.replace(rScript, function(all, comment, script, body) {
    if (!comment && rRosettaType.test(script)) {
      resource.addJsEmbed(body);
      all = '';
    }

    return all;
  });

  return content;
}

function insertPlaceHolder(content, opts) {
  // 插入  style placeholder
  if (!~content.indexOf(opts.stylePlaceHolder)) {
    content = content.replace(/<\/head>/i, opts.stylePlaceHolder + '\n</head>');
  }

  // 插入  resource placeholder
  if (!~content.indexOf(opts.resoucePlaceHolder)) {
    content = content.replace(/<\/body>/i, opts.resoucePlaceHolder + '\n</body>');
  }

  if (!~content.indexOf(opts.scriptPlaceHolder)) {
    content = content.replace(/<\/body>/i, opts.scriptPlaceHolder + '\n</body>');
  }

  return content;
}

function beforeProcess(file, resource, opts) {
  var content = file.getContent();
  content = insertPlaceHolder(content, opts);
  file.setContent(content);
};

function process(file, resource, opts) {
  var content = file.getContent();
  var pool = [];
  var list;

  if (~content.indexOf(opts.stylePlaceHolder)) {
    var css = '';

    pool = [];
    if (resource.css.length) {
      resource.css.forEach(function(item) {
        if (item.type === 'embed') {
          pool.push(item.content);
        } else {
          if (pool.length) {
            css += '<style>' + pool.join('\n') + '</style>\n';
            pool = [];
          }

          css += '<link rel="stylesheet" type="text/css" href="' + item.uri + '" />\n';
        }
      });

      if (pool.length) {
        css += '<style>' + pool.join('\n') + '</style>\n';
      }
    }

    content = content.replace(opts.stylePlaceHolder, css);
  }

  if (~content.indexOf(opts.resoucePlaceHolder)) {
    var resoucemap = resource[opts.resouceType === 'mod' ? 'buildResourceMap' : 'buildAMDPath']();

    if (resoucemap) {
      resoucemap = '<script type="text/javascript">' + resoucemap + '</script>\n';
    }

    content = content.replace(opts.resoucePlaceHolder, resoucemap);
  }

  if (~content.indexOf(opts.scriptPlaceHolder)) {
    content = obtainRosetaScript(content, resource);

    var js = '';
    pool = [];
    if (resource.js.length) {
      resource.js.forEach(function(item) {
        if (item.type === 'embed') {
          pool.push(item.content);
        } else {
          if (pool.length) {
            js += '<script type="text/javascript">' + pool.join('\n') + '</script>\n';
            pool = [];
          }

          js += '<script type="text/javascript" src="' + item.uri + '"></script>\n';
        }
      });

      if (pool.length) {
        js += '<script type="text/javascript">' + pool.join('\n') + '</script>\n';
      }
    }

    content = content.replace(opts.scriptPlaceHolder, js);
  }

  file.setContent(content);
};

module.exports = process;
process.before = beforeProcess;
