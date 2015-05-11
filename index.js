var lang = {
  html: require('./lib/lang/html.js'),
  smarty: require('./lib/lang/smarty.js')
};
var createResouce = require('./lib/resource.js');
var allInOnePack = require('./lib/pack.js');

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

    var processor = lang[settings.processor[file.ext]] || lang.html;

    processor.before && processor.before(file, resouce, settings);

    if (settings.allInOne) {
      allInOnePack(file, resouce, ret, settings.allInOne === true ? {} : settings.allInOne);
    }

    processor(file, resouce, settings);

    processor.after && processor.after(file, resouce, settings);
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
  allInOne: {
    css: '', // 打包后 css 的文件路径。
    js: ''  // 打包后 js 的文件路径。
  }
};

module.exports = rosettaPackager;
