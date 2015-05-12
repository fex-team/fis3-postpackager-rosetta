var lang = {
  html: require('./lib/lang/html.js'),
  smarty: require('./lib/lang/smarty.js')
};
var createResouce = require('./lib/resource.js');
var allInOnePack = require('./lib/pack.js');

function rosettaPackager(ret, pack, settings, opt) {
  var files = ret.src;

  // 生成映射表，方便快速查找！
  var idmapping = ret.idmapping = {};
  var urlmapping = ret.urlmapping = {};
  Object.keys(files).forEach(function(subpath) {
    var file = files[subpath];
    idmapping[file.id] = file;
    urlmapping[file.getUrl()] = file;
  });

  Object.keys(files).forEach(function(subpath) {
    var file = files[subpath];

    if (!file.isHtmlLike) {
      return;
    }

    var resouce = createResouce(ret);
    var processor = lang[settings.processor[file.ext]] || lang.html;

    processor.before && processor.before(file, resouce, settings);

    file.requires.forEach(function(id) {
      resouce.add(id);
    });

    file.asyncs.forEach(function(id) {
      resouce.add(id, true);
    });

    if (settings.allInOne) {
      allInOnePack(file, resouce, ret, settings.allInOne === true ? {} : settings.allInOne);
    }

    processor(file, resouce, settings);

    processor.after && processor.after(file, resouce, settings);
  });
}

// 默认配置信息
rosettaPackager.defaultOptions = {
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
  allInOne: false/*{
    css: '', // 打包后 css 的文件路径。
    js: ''  // 打包后 js 的文件路径。
  }*/,

  // 是否捕获页面内的 <script src="xxx"> 资源
  obtainScript: false,

  // 是否捕获页面内的 <link ref="stylesheet"></link>
  obtainStyle: false
};

module.exports = rosettaPackager;
