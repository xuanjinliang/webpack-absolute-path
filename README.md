### 安装

```javascript
   npm install webpack-absolute-path --save-dev
```

### 使用

```
	webpack.config.js
       
    plugins: [
		new HtmlWebpackPlugin({	//html-webpack-plugin 必须装，因为在这个插件上拓展
            filename: xxx.html,
            template: xxx.html,
            inject:true,
            hash: false,
            cache: true,
            minify:{    //压缩HTML文件
                removeComments:true,    //移除HTML中的注释
                collapseWhitespace:true,    //删除空白符与换行符
            }
        }),
        new HtmlAbsolutePath({
            cssDomain:'http://xxxxxxxxxxx',    //支持 字符串与['http://11.xxxx','http://22.xxxx']
            jsDomain:'http://xxxxxxxxxxx'
        })
	]

```

逻辑：
当插件html-webpack-plugin输出一个html页面时，会对页面的css,js资源进行扫描，替换其域名;

(欢迎反馈BUG，方便提升插件的质量)

