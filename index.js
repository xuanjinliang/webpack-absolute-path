/**
 * Created by timxuan on 2016/11/4.
 */

"use strict";

let path = require('path');

let linkTest = /(?:\s*(<link([^>]*?)(stylesheet){1}([^>]*?)(?:\/)?>))/ig,
    styleUrl = /(?:\shref\s*=\s*)('([^'<>]+)'|"([^"<>]+)"|[^\s\/>]+)/i,
    ScriptTest = /(?:(\s*<script([^>]*)>([\s\S]*?)<\/script>))/ig,
    scriptSrc = /(?:\ssrc\s*=\s*)('([^<>']+)'|"([^<>\"]+)")/i,
    deleteComment = /((<!(?:--)?\[[\s\S]*?<\!\[endif\](?:--)?>|<!--[\s\S]*?(?:-->|$))|(?:(\s*<script[^>]*>[^<>]*<\/script>)|(?:\s*(<link([^>]*?)(?:\/)?>)|(<style([^>]*)>([\s\S]*?)<\/style>))))<!--delete-->/ig;

let class2type = {};

"Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach(function(name){
    class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function type(obj) {
    return obj == null ? String(obj) :
    class2type[toString.call(obj)] || "object";
}

function checkNum(num,len){
    return num >= len ? 0: (num < 0 ? (len - 1):num);
}

function replaceHtml(html,linkTest,urlTest,filePath,domain){
    let num = 0,
        len = 0,
        domainStr = domain,
        isArray = domain instanceof Array;

    if(isArray){
        len = domain.length;
        domainStr = '';
        if(len > 0){
            num = Math.floor(Math.random() / (1 / len));
            num = checkNum(num, len);
            domainStr = domain[num]
        }
    }

    return html.replace(linkTest,function(v,u){
        let urlPath =  v.replace(urlTest,function(url,$1){
            let route = $1.replace(/\'|\"/ig,'').trim(),
                realPath = path.isAbsolute(route)?route:path.join(filePath,route);

            realPath = path.normalize(realPath).split('\\').join('\/');
            if(realPath.charAt(0) != '/'){
                realPath = '/' + realPath;
            }
            if(domainStr){
                let str = domainStr.charAt(domainStr.length - 1);
                if(str.match(/\\|\//gi)){
                    domainStr = domainStr.substring(0,domainStr.length - 1);
                }
                realPath = domainStr + realPath;
            }

            return url.replace($1,'"'+realPath+'"');
        });

        if(isArray){
            num = checkNum(num + 1, len);
            domainStr = domain[num];
        }

        return urlPath;
    });
}

function AbsolutePath(options){
    this.cssDomain = '';
    this.jsDomain = '';
    if(type(options) === 'object'){
        for (var i in options) this[i] = options[i];
    }
}

AbsolutePath.prototype.apply = function(compiler) {
    /*compiler.plugin("compile", function(params) {
     console.log("The compiler is starting to compile...");
     });*/

    compiler.plugin("compilation", function(compilation) {
        //console.log("The compiler is starting a new compilation...");

        /*compilation.plugin('html-webpack-plugin-before-html-generation', function(htmlPluginData, callback) {
         console.log('html-webpack-plugin-before-html-generation-->');
         console.log(htmlPluginData);
         callback(null, htmlPluginData);
         });*/

        compilation.plugin('html-webpack-plugin-before-html-processing', function(htmlPluginData, callback) {
            htmlPluginData.html = htmlPluginData.html.replace(deleteComment,'');    //删除测试的css与js
            callback(null, htmlPluginData);
        });

        /*compilation.plugin('html-webpack-plugin-alter-asset-tags', function(htmlPluginData, callback) {
         console.log('html-webpack-plugin-alter-asset-tags-->');
         console.log(htmlPluginData);
         callback(null, htmlPluginData);
         });*/

        compilation.plugin('html-webpack-plugin-after-html-processing', function(htmlPluginData, callback) {
            let htmlPath = htmlPluginData.plugin.options.filename,
                html = htmlPluginData.html,
                linkArray = html.match(linkTest),
                scriptArray = html.match(ScriptTest);

            if(linkArray && linkArray.length > 0 && this.cssDomain){
                html = replaceHtml(html,linkTest,styleUrl,htmlPath,this.cssDomain);
            }

            if(scriptArray && scriptArray.length > 0 && this.jsDomain){
                html = replaceHtml(html,ScriptTest,scriptSrc,htmlPath,this.jsDomain);
            }

            htmlPluginData.html = html;
            callback(null, htmlPluginData);
        }.bind(this));
        /*
         compilation.plugin('html-webpack-plugin-after-emit', function(htmlPluginData, callback) {
         console.log('html-webpack-plugin-after-emit-->');
         console.log(htmlPluginData);
         callback(null, htmlPluginData);
         });

         compilation.plugin("optimize", function() {
         console.log("The compilation is starting to optimize files...");
         });
         */
    }.bind(this));

    /*compiler.plugin("emit", function(compilation, callback) {
     console.log("The compilation is going to emit files...");
     callback();
     });*/
};

module.exports = AbsolutePath;
