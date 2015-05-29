var rude = require('fis3-postpackager-loader');
var html = module.exports = rude.lang.html;
var rScript = /<!--([\s\S]*?)(?:-->|$)|(<script[^>]*>([\s\S]*?)<\/script>)/ig;
var rScriptType = /type=('|")(.*?)\1/i;
var rRosettaType = /type=('|")text\/rosetta\1/i;
var rSrcHref = /(?:src|href)=('|")(.+?)\1/i;

function obtainScript(content, resource, opts, host) {
  rScript.lastIndex = 0;
  return content.replace(rScript, function(all, comment, script, body) {

    if (comment) {
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
