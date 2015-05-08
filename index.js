var smarty = require('./lib/lang/smarty.js');
var html = require('./lib/lang/html.js');
var createResouce = require('./lib/resource.js');

function rosettaPackager(ret, pack, settings, opt) {
  var files = ret.src;

  Object.keys(files).forEach(function(subpath) {
    var file = files[subpath];

    if (!file.isHtmlLike) {
      return;
    }

    var resouce = createResouce(ret.map);

    file.requires.forEach(function(id) {
      resouce.add(id);
    });

    file.asyncs.forEach(function(id) {
      resouce.add(id, true);
    });

    switch (settings.processor[file.ext]) {
      case 'html':
        html(file, resouce, settings);
        break;

      case 'smarty':
        smarty(file, resouce, settings);
        break;
    }
  });
}

// 默认配置信息
rosettaPackager.defaultOptions = {
  // 固定的脚本和样式。
  scripts: null,
  styles: null,

  // 脚本占位符
  scriptPlaceHolder: '<!--SCRIPT_PLACEHOLDER-->',

  // 样式占位符
  stylePlaceHolder: '<!--STYLE_PLACEHOLDER-->',

  // 资源占位符
  resoucePlaceHolder: '<!--RESOURCEMAP_PLACEHOLDER-->',

  // 资源表格式。
  // 可选：
  // - `mod` 生成适合 mod.js 的版本。
  // - `amd` 生成适合 require.js 的版本。
  resouceType: 'mod',

  // 页面类型
  // 可选：
  // - `html` 普通 html 页面
  // - `smarty` smarty 模板页面。
  processor: {
    '.html': 'html',
    '.tpl': 'smarty'
  },

  // 是否将所有零散文件合并成一个文件。
  // 如果用户配置 pack，  则 用户配置的 pack 优先。
  allInOne: true
};

module.exports = rosettaPackager;
