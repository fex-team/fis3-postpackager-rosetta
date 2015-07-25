var html = require('./html.js');
var common = require('fis3-postpackager-loader/lib/common.js');
var rHead = /<!--([\s\S]*?)(?:-->|$)|<\/head>/ig;
var rBody = /<!--([\s\S]*?)(?:-->|$)|<\/body>/ig;

function insertPlaceHolder(content, resource, opts) {
  var ld = fis.util.escapeReg(opts.left_delimiter);
  var rd = fis.util.escapeReg(opts.right_delimiter);
  var rExtends = new RegExp(ld + 'extends.*?' + rd, 'ig');
  var rBlockHeader = new RegExp('(' +ld + 'block[\\s\\S]*?name=(\'|")rosetta_header\\2[\\s\\S]*?' + rd + ')([\\s\\S]*?)(' + ld + '/block' + rd + ')', 'i');
  var rBlockFooter = new RegExp('(' +ld + 'block[\\s\\S]*?name=(\'|")rosetta_footer\\2[\\s\\S]*?' + rd + ')([\\s\\S]*?)(' + ld + '/block' + rd + ')', 'i');
  var rBlockShim = new RegExp('(' +ld + 'block[\\s\\S]*?name=(\'|")rosetta_shim\\2[\\s\\S]*?' + rd + ')([\\s\\S]*?)(' + ld + '/block' + rd + ')', 'i');

  // 如果是模板继承的页面
  if (rExtends.test(content)) {
    // 如果没有找到 style placeholder，则找位置插入
    if (!~content.indexOf(opts.stylePlaceHolder)) {

      // 如果存在 rosetta_header 的 block 则再其底部插入。
      if (rBlockHeader.test(content)) {
        content = content.replace(rBlockHeader, function(all, start, quote, body, end) {
          return start + body + opts.stylePlaceHolder + '\n' + end;
        });
      }

      // 否则，直接在底部插入 block 同时插入 placeholder
      else {
        content += '\n' + opts.left_delimiter + 'block name="rosetta_header" append' + opts.right_delimiter  + '\n' + opts.stylePlaceHolder + '\n' + opts.left_delimiter + '/block' + opts.right_delimiter;
      }
    }

    // 如果没有找到 script placeholder
    if (!~content.indexOf(opts.scriptPlaceHolder)) {

      // 如果存在 rosetta_footer 的 block 则在其底部插入
      if (rBlockFooter.test(content)) {
        content = content.replace(rBlockFooter, function(all, start, quote, body, end) {
          return start + body + opts.scriptPlaceHolder + '\n' + end;
        });
      }

      // 否则，直接在底部插入 block 同时插入 placeholder
      else {
        content += '\n' + opts.left_delimiter + 'block name="rosetta_footer" append' + opts.right_delimiter + '\n' + opts.scriptPlaceHolder + '\n' + opts.left_delimiter + '/block' + opts.right_delimiter;
      }

      if (opts.useInlineMap) {
        if (!~content.indexOf(opts.resourcePlaceHolder)) {
          resource.addJsEmbed('/*resourcemap*/\n'+opts.resourcePlaceHolder);
        }
      } else {
        resource.addJs('resourcePlaceHolder');
      }
    }

    // 如果没有找到 shim placeholder，则找位置插入
    if (!~content.indexOf(opts.shimPlaceHolder)) {

      // 如果存在 rosetta_shim 的 block 则再其底部插入。
      if (rBlockShim.test(content)) {
        content = content.replace(rBlockShim, function(all, start, quote, body, end) {
          return start + body + opts.shimPlaceHolder + '\n' + end;
        });
      }

      // 否则，直接在底部插入 block 同时插入 placeholder
      else {
        content += '\n' + opts.left_delimiter + 'block name="rosetta_shim" append' + opts.right_delimiter  + '\n' + opts.shimPlaceHolder + '\n' + opts.left_delimiter + '/block' + opts.right_delimiter;
      }
    }
  }

  // 否则，一般都是 layout.tpl
  else {
    var flag;

    // 如果没有找到 style placeholder，则找位置插入
    if (!~content.indexOf(opts.stylePlaceHolder)) {

      // 如果存在 rosetta_header 的 block 则再其底部插入。
      if (rBlockHeader.test(content)) {
        content = content.replace(rBlockHeader, function(all, start, quote, body, end) {
          return start + body + opts.stylePlaceHolder + '\n' + end;
        });
      }

      // 否则，直接在底部插入 block 同时插入 placeholder
      else {
        flag = false;
        content = content.replace(rHead, function(all, comment) {
          if (comment) {
            return all;
          } else if (!flag) {
            flag = true;
            return opts.left_delimiter + 'block name="rosetta_header"' + opts.right_delimiter + '\n' + opts.stylePlaceHolder + '\n' + opts.left_delimiter + '/block' + opts.right_delimiter + '\n' + all;
          }
        });
      }
    }

    // 如果没有找到 script placeholder
    if (!~content.indexOf(opts.scriptPlaceHolder)) {

      // 如果存在 rosetta_footer 的 block 则在其底部插入
      if (rBlockFooter.test(content)) {
        content = content.replace(rBlockFooter, function(all, start, quote, body, end) {
          return start + body + opts.scriptPlaceHolder + '\n' + end;
        });
      }

      // 否则，直接在底部插入 block 同时插入 placeholder
      else {
        flag = false;
        content = content.replace(rBody, function(all, comment) {
          if (comment) {
            return all;
          } else if (!flag) {
            flag = true;
            return opts.left_delimiter + 'block name="rosetta_footer"' + opts.right_delimiter + '\n' + opts.scriptPlaceHolder + '\n' + opts.left_delimiter + '/block' + opts.right_delimiter + '\n' + all;
          }
        });
      }
    }

    // 如果没有找到 shim placeholder，则找位置插入
    if (!~content.indexOf(opts.shimPlaceHolder)) {

      // 如果存在 rosetta_shim 的 block 则再其底部插入。
      if (rBlockShim.test(content)) {
        content = content.replace(rBlockShim, function(all, start, quote, body, end) {
          return start + body + opts.shimPlaceHolder + '\n' + end;
        });
      }

      // 否则，直接在底部插入 block 同时插入 placeholder
      else {
        flag = false;
        content = content.replace(rHead, function(all, comment) {
          if (comment) {
            return all;
          } else if (!flag) {
            flag = true;
            return opts.left_delimiter + 'block name="rosetta_shim"' + opts.right_delimiter + '\n' + opts.shimPlaceHolder + '\n' + opts.left_delimiter + '/block' + opts.right_delimiter + '\n' + all;
          }
        });
      }
    }

  }

  return content;
}

/*
 * 去重资源。
 */
function uniqueResource(file, resource, opts) {
  var ld = fis.util.escapeReg(opts.left_delimiter);
  var rd = fis.util.escapeReg(opts.right_delimiter);
  var rInclude = new RegExp(ld + '(extends|include).*?\\bfile=(\'|")(.+?)\\2.*?' + rd, 'ig');
  var content = file.getContent();

  content.replace(rInclude, function(all, type, quote, target) {
    var info = fis.project.lookup(target, file);
    var layout;
    if (!info.file || !(layout = resource.getFileById(info.id))) {
      return;
    }

    process._compile(layout);
    file._tplIncludes = file._tplIncludes || [];
    file._tplIncludes.push(layout);
  });

  // 去重所有带 id 信息的资源。
  (function(file) {
    if (!file._tplIncludes)return;
    var fn = arguments.callee;

    file._tplIncludes.forEach(function(layout) {
      fn(layout);

      layout._resource.res.forEach(function(item) {
        item.id && resource.remove(item.id, item.async);
      });
    });
  })(file);
}

function init(file, resource, opts) {
  var content = file.getContent();
  opts.left_delimiter = opts.left_delimiter || fis.env().get('settings.smarty.left_delimiter') || fis.env().get('settings.template.left_delimiter') || '{%';
  opts.right_delimiter = opts.right_delimiter || fis.env().get('settings.smarty.right_delimiter') || fis.env().get('settings.template.right_delimiter') || '%}';
  content = insertPlaceHolder(content, resource, opts);
  content = html.obtainFramework(content, resource, opts, file);
  html.loadDeps(file, resource);
  file.setContent(content);
}

function process(file, resource, opts) {
  html(file, resource, opts);
};

function beforePack(file, resource, opts) {
  var content = file.getContent();

  if (~content.indexOf(opts.scriptPlaceHolder) && opts.obtainScript) {
    content = html.obtainScript(content, resource, opts, file);
  }

  if (~content.indexOf(opts.stylePlaceHolder) && opts.obtainStyle) {
    content = html.obtainStyle(content, resource, opts, file);
  }

  file.setContent(content);

  uniqueResource(file, resource, opts);

  // 如果是外链 resourceMap
  // 一定要放在 pack 之前。
  if (!opts.useInlineMap) {
    var idx = common.search(resource.res, function(item) {
      return item.type === 'js' && item.uri === 'resourcePlaceHolder';
    });

    if (~idx) {
      var resoucemap = resource.buildConf(opts.resourceType);
      var item;
      if (!resoucemap) {
        resource.res.splice(idx, 1);
      } else {
        var filepath = common.tokenizePath(opts.resoucemap || '/pkg/${filepath}_map.js', {
          filepath: file.subpath,
          hash: file.getHash()
        });
        var pkg = fis.file(fis.project.getProjectPath(), filepath);
        pkg.setContent(resoucemap);
        item = {
          type: 'js',
          id: pkg.getId(),
          uri: pkg.getUrl(),
          pkg: null
        };
        resource._ret.idmapping[pkg.getId()] = pkg;
        resource._ret.pkg[pkg.getId()] = pkg;
        resource.res.splice(idx, 1, item);
      }

      idx = common.search(resource.js, function(item) {
        return item.uri === 'resourcePlaceHolder';
      });
      ~idx && (item ? resource.js.splice(idx, 1, item) : resource.js.splice(idx, 1));
    }
  }
}

module.exports = process;
process.init = init;
process.beforePack = beforePack;
process.after = html.after;
