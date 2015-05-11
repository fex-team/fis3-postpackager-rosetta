var html = require('./html.js');

function insertPlaceHolder(content, opts) {
  var ld = fis.util.escapeReg(opts.left_delimiter);
  var rd = fis.util.escapeReg(opts.right_delimiter);
  var rExtends = new RegExp(ld + 'extends.*?' + rd, 'ig');
  var rBlockHeader = new RegExp('(' +ld + 'block[\\s\\S]*?name=(\'|")rosetta_header\\2[\\s\\S]*?' + rd + ')([\\s\\S]*?)(' + ld + '/block' + rd + ')', 'i');
  var rBlockFooter = new RegExp('(' +ld + 'block[\\s\\S]*?name=(\'|")rosetta_footer\\2[\\s\\S]*?' + rd + ')([\\s\\S]*?)(' + ld + '/block' + rd + ')', 'i');

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

    // 如果没有找到 resouce placeholder
    if (!~content.indexOf(opts.resoucePlaceHolder)) {

      // 如果存在 rosetta_footer 的 block 则在其底部插入
      if (rBlockFooter.test(content)) {
        content = content.replace(rBlockFooter, function(all, start, quote, body, end) {
          return start + body + opts.resoucePlaceHolder + '\n' + end;
        });
      }

      // 否则，直接在底部插入 block 同时插入 placeholder
      else {
        content += '\n' + opts.left_delimiter + 'block name="rosetta_footer" append' + opts.right_delimiter + '\n' + opts.resoucePlaceHolder + '\n' + opts.left_delimiter + '/block' + opts.right_delimiter;
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
    }
  }

  // 否则，一般都是 layout.tpl
  else {

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
        content = content.replace(/<\/head>/i, opts.left_delimiter + 'block name="rosetta_header"' + opts.right_delimiter + '\n' + opts.stylePlaceHolder + '\n' + opts.left_delimiter + '/block' + opts.right_delimiter + '\n</head>');
      }
    }

    // 如果没有找到 resouce placeholder
    if (!~content.indexOf(opts.resoucePlaceHolder)) {

      // 如果存在 rosetta_footer 的 block 则在其底部插入
      if (rBlockFooter.test(content)) {
        content = content.replace(rBlockFooter, function(all, start, quote, body, end) {
          return start + body + opts.resoucePlaceHolder + '\n' + end;
        });
      }

      // 否则，直接在底部插入 block 同时插入 placeholder
      else {
        content = content.replace(/<\/body>/i, opts.left_delimiter + 'block name="rosetta_footer"' + opts.right_delimiter + '\n' + opts.resoucePlaceHolder + '\n' + opts.left_delimiter + '/block' + opts.right_delimiter + '\n</body>');
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
        content = content.replace(/<\/body>/i, opts.left_delimiter + 'block name="rosetta_footer"' + opts.right_delimiter + '\n' + opts.scriptPlaceHolder + '\n' + opts.left_delimiter + '/block' + opts.right_delimiter + '\n</body>');
      }
    }

  }

  return content;
}

function beforeProcess(file, resource, opts) {
  var content = file.getContent();
  opts.left_delimiter = opts.left_delimiter || fis.env().get('settings.smarty.left_delimiter') || fis.env().get('settings.template.left_delimiter') || '{%';
  opts.right_delimiter = opts.right_delimiter || fis.env().get('settings.smarty.right_delimiter') || fis.env().get('settings.template.right_delimiter') || '%}';
  content = insertPlaceHolder(content, opts);
  content = html.obtainScript(content, resource, opts);
  if (opts.obtainStyle) {
    content = html.obtainStyle(content, resource, opts);
  }
  file.setContent(content);
};

function process(file, resource, opts) {
  html(file, resource, opts);
};

module.exports = process;
process.before = beforeProcess;
