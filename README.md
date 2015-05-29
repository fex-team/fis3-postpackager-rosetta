# Rosetta resource loader & optimizer
For more information, please visit [here](https://github.com/jiexuangao/rosetta/wiki).

此插件用来对 rosetta 项目，进行资源加载和优化。

详情：

1. 针对 html/tpl(smarty template) 页面，分析其所有依赖（递归分析），自动生成 `<script>` 和 `<link>` 标签插入到页面。
2. 除了处理依赖文件外。html/tpl 内容里面现有的 js 和 css 也会分析提取。
3. 自动将所有分析到js 和 css分别插入在页面的底部和头部。（可以通过特殊注释来控制对应的位置，后面会提到）
4. 如果设置了 allInOne，所有收集到的 js 和 css 会智能合并。比如：挨在一起的 script 片段，会合并再一起，挨在一起的 js 文件，会合并成一个文件。

## 安装

支持全局安装和局部安装，根据自己的需求来定。

```bash
npm install fis3-postpackager-rosetta
```

## 配置

```javascript
fis.match('::packager', {
  postpackager: fis.plugin('rosetta', {
    allInOne: true
  })
})
```

## 配置说明

* `left_delimiter` 默认 `{%`, 用来配置 smarty 模板的左分界符。
* `right_delimiter` 默认 `%}`, 用来配置 smarty 模板的右分界符。

更多参数说明，请移步至 [fis3-postprocessor-loader](https://github.com/fex-team/fis3-postpackager-loader). 此插件依赖于它。
