var rude = module.exports = require('fis3-postpackager-loader');
var Resource = require('fis3-postpackager-loader/lib/resource.js');
var _ = fis.util;

rude.lang.html = require('./lib/html.js');
rude.lang.smarty = require('./lib/smarty.js');

_.assign(rude.defaultOptions, {
  left_delimiter: '{%',
  right_delimiter: '%}',

  processor: {
    '.html': 'html',
    '.tpl': 'smarty'
  },

  // 资源占位符
  shimPlaceHolder: '<!--ROSETTA_SHIM_PLACEHOLDER-->',

  loaderScripts: ['require.js', 'esl.js', 'mod.js', 'sea.js', 'Rosetta.js', 'rosetta.js'],
  resourceType: 'rosetta'
});

Resource.extend({
  buildConf: function(type) {
    if (/mod|commonJs/i.test(type)) {
      return this.buildResourceMap();
    } else if (/sea\.js|cmd/i.test(type)) {
      return this.buildCMDPath();
    } else if (/rosetta/i.test(type)) {
      return this.buildRosetta();
    } else {
      return this.buildAMDPath()
    }
  },

  buildRosetta: function() {
    var self = this;
    var res = {};
    var pkg = {};

    this.calculate();

    Object.keys(this.loaded).forEach(function(id) {
      if (self.loaded[id] !== true) {
        return;
      }

      var node = self.getNode(id);
      if (node.type !== 'js') {
        return;
      }

      var item = {
        url: node.uri,
        type: node.type
      };

      if (node.deps) {

        // 过滤掉不是 js 的文件依赖。
        var deps = node.deps.filter(function(id) {
          if (self.loaded[id] !== false) {
            var dep = self.getFileById(id);

            if (dep) {
              return dep.isJsLike;
            } else {
              return !/\.css$/i.test(id);
            }
          }

          return false;
        });

        deps.length && (item.deps = deps);
      }

      var file = self.getFileById(id);
      var moduleId = node.extras && node.extras.moduleId || file && file.moduleId || id.replace(/\.js$/i, '');
      res[moduleId] = item;

      if (node.pkg) {
        item.pkg = node.pkg;
        var pkgNode = self.getNode(node.pkg, "pkg");
        var pkgItem = {
          url: pkgNode.uri,
          type: pkgNode.type
        };

        pkg[node.pkg] = pkgItem;
      }
    });

    if (this.isEmpty(res)) {
      return '';
    }

    var map = {
      res: res
    };

    if (this.isEmpty(pkg)) {
      map.pkg = pkg;
    }

    return 'Rosetta.config(' + JSON.stringify({res: res, pkg: pkg}, null, 2) + ');';
  }
});
