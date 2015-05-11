/**
 * 将零散的文件打包合成一个新文件。
 */
var rToken = /\$\{(.*)?\}/g;

module.exports = function(file, resouce, ret, opts) {
  var root = fis.project.getProjectPath();
  var idmapping = {};
  var urlmapping = {};

  Object.keys(ret.src).forEach(function(subpath) {
    var file = ret.src[subpath];
    idmapping[file.id] = file;
    urlmapping[file.getUrl()] = file;
  });

  pack(resouce.js, opts.js || 'pkg/${filepath}_aio.js');
  pack(resouce.css, opts.css || 'pkg/${filepath}_aio.css');

  function pack(list, fileTpl) {
    var unpacked = [];
    list.concat().forEach(function(item) {
      if (item.id && !item.pkg) {
        unpacked.push(item);
        list.splice(list.indexOf(item), 1);

        // todo 可能还要删除其他东西。
      }
    });

    if (unpacked.length) {
      var tokens = {
        filepath: file.subpath,
        hash: file.getHash()
      };

      var filepath = fileTpl
        .replace(rToken, function(_, key) {
          return tokens[key] || '';
        })
        .replace(/[\/\\]+/g, '/')
        .replace(/[:*?"<>|]/g, '_');

      var pkg = fis.file(root, filepath);
      pkg.setContent(unpacked.map(function(item) {
        var file = idmapping[item.id];

        return (file.isJsLike ? ';' : '') + file.getContent();
      }).join('\n'));

      list.push({
        id: pkg.id,
        uri: pkg.getUrl()
      });
      ret.pkg[pkg.subpath] = pkg;
    }
  }
};
