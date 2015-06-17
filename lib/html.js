var rude = require('fis3-postpackager-loader');
var html = module.exports = rude.lang.html;
var rScript = /<!--([\s\S]*?)(?:-->|$)|(<script[^>]*>([\s\S]*?)<\/script>)(<!--ignore-->)?/ig;
var rScriptType = /type=('|")(.*?)\1/i;
var rRosettaType = /type=('|")text\/rosetta\1/i;
var rSrcHref = /(?:src|href)=('|")(.+?)\1/i;
var rHead = /<!--([\s\S]*?)(?:-->|$)|<\/head>/ig;

function obtainScript(content, resource, opts, host) {
  rScript.lastIndex = 0;
  return content.replace(rScript, function(all, comment, script, body, ignored) {

    if (comment || ignored) {
      return all;
    }

    if (!body.trim() && rSrcHref.test(script)) {
      var src = RegExp.$2;
      var file = resource.getFileByUrl(src);

      file ? resource.add(file.id) : resource.addJs(src);
      all = '';
    } else if (!rScriptType.test(script) || rScriptType.test(script) && ~['text/javascript', 'application/javascript'].indexOf(RegExp.$2.toLowerCase())) {
      resource.addJsEmbed(body);
      all = '';
    } else if (rRosettaType.test(script)) {
      resource.addJsEmbed(body);
      all = '';
    }

    return all;
  });
}

html.obtainScript = obtainScript;
html.init = (function(origin) {
  return function(file, resource, opts) {
    origin.apply(this, arguments);
    var content = file.getContent();

    var flag;

    // 插入  style placeholder
    if (!~content.indexOf(opts.shimPlaceHolder)) {
      flag = false;
      content = content.replace(rHead, function(all, comment) {
        if (comment) {
          return all;
        } else if (!flag) {
          flag = true;
          return opts.shimPlaceHolder + '\n' + all;
        }
      });
    }

    file.setContent(content);
  };
})(html.init);

html.after = function(file, resource, opts) {
  var rosettas = (function(f) {
    var fn = arguments.callee;
    var ret = [];

    f.requires.forEach(function(id) {
      var dep = resource.getFileById(id);
      if (!dep) return;

      if (dep.rosetta) {
        ret.push(dep.rosetta);
      }

      [].push.apply(ret, fn(dep));
    });

    return ret;
  })(file);

  var shim = '';
  var content = file.getContent();

  if (rosettas.length) {
    shim = '<!--[if lt IE 9]>\n<script type="text/javascript">\n' +
      rosettas.map(function(name) {
        return 'document.createElement(\''+ name +'\');';
      }).join('\n') +

      '\n</script>\n<![endif]-->';
  }

  content = content.replace(opts.shimPlaceHolder, shim);
  file.setContent(content);
};
