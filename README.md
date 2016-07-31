分析：
  
	1、HTML5的应用场景
		1)、传统的web 
		支持的浏览器，使用
		不支持的浏览器，不使用
		兼容性处理。
		这是种渐强性的体验。

		2)、基于webview的hybrid native app 开发
		这种开发的产生，是因为，我们要转化为andriod的更新很方便
		，但是转换为ios就比较麻烦，要审核。因此，我们通过webview这种方式，
		可以让我们更新非常灵活。
		
		3)、Web app开发
		像微信里的分享的HTML5的广告、游戏

	2)、HTML5的现状
		1)、不能达到一次开发，多终端适配。

	3)、如果说html5的性能能无限接近于native app，那会取代它。
		facebook提供了一个框架 react  解决的就是性能问题

	4)、设计模式
		1)、单例模式
		一个对象不用实例化多次，实例化一次即可。不会造成占用内存。
		2)、构造函数模式
	
	5)、项目整体概况的分析

	6)、使用base64格式的图片制作Icon
		background:url( data: image/png;base64,{img_data} )
		填的是字符串
		包含图片的数据信息img_data, 相当于我们提前把图片的数据放到了css文件
		通过base64图片编辑器，将图片拖进去，就可以生成	base64格式。
		base64格式的优点：
			利于页面直接加载，减少请求。
		缺点：
			维护不方便
	
	7)、使用css3来制作Icon
		比起用base64格式的制作方式，
		css3的方式的Icon体积更小，
		也存在问题：不容易维护，存在兼容性的问题。
		制作一些有规则的，不复杂的图形，举例：圆形

	8)、用chrome调试打断点

    9)、用回调函数来把数据层与UI层之间串起来。

    10)、回调函数用的多，逻辑不容易看清。如何能避免使用回调函数？
        1、事件消息通知
        2、ES6 Promise
        3、ES6 generator

        4、使用Promise:
           使用前申明： "use strict";  严格模式， 否则会报错

           //todo  解决获取小说内容，回调函数造成逻辑复杂问题
           var getFictionInfoPromise = function(){
               return new Promise(function(resolve,reject){
                   $.get('data/chapter.json', function( data ){
                       if( data.result == 0 ){
                               Chapter_id = (Chapter_id == undefined) ? data.chapters[1].chapter_id : Chapter_id;
                               CharterTotal = data.chapters.length;
                               resolve();
                       }else{
                               reject();
                       }
                   });
               });
           }

            //todo 解决获取章节内容，回调函数造成逻辑复杂问题
            var getCurChapterContentPromise =function() {
                return new Promise(function (resolve, reject) {
                    $.get("data/data" + Chapter_id + ".json", function (data) {
                        if (data.result == 0) {
                            var url = data.jsonp;
                            Uilt.getBSONP(url, function (data) {
                                resolve(data);
                            })
                        } else {
                            reject({"msg": "fail"});
                        }
                    });
                });
            }

            //todo 调用：
            getFictionInfoPromise()
                .then(function(d){
                    return getCurChapterContentPromise();
                })
                .then(function(d){
                    UIcallback && UIcallback( d );
                });