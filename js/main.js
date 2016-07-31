
    (function(){  'use strict';   //自执行环境
        //todo dom对象
        var  Dom = {
            top_nav : $("#top-nav"),
            bottom_nav :  $(".bottom-nav"),
            night_day_switch_button : $("#night-button"),
            font_button : $("#font-button"),
            font_container : $(".font-container"),
            root_container  : $("#root"),
            fiction_container : $("#fiction_container"),
            bk_container : $(".bk-container"),
            Body : $(document.body),
            prevBtn : $("#prev_buttton"),
            nextBtn : $("#next_button")
        };
        var arrColor = ["#fff","#e9dfc7","#a4a4a4","#cdefce","#283548"]; //bgColor
        var Win = $(window);
        var Doc = $(document);
        var readerModel;
        var readerUI;
        var bBtn = Uilt.StorageGetter("bBtn") == 'true' ? true : false;  //取到的是字符串，转换成布尔值
        var initFontSize = Uilt.StorageGetter("font_size"); //默认字体
        var initBgColor = Uilt.StorageGetter("bgColor"); //默认bg
        initFontSize = parseInt(initFontSize);
        if( !initFontSize ){
            initFontSize = 14;
        }
        if( !initBgColor ){
            initBgColor = arrColor[0];
        }

        //todo 还原“白天/夜间”状态
        if( bBtn ){
            Dom.night_day_switch_button.find('.icon').removeClass("icon-nig");
            Dom.night_day_switch_button.find(".nav-title").text("夜间");
        }else{
            Dom.night_day_switch_button.find('.icon').addClass("icon-nig");
            Dom.night_day_switch_button.find(".nav-title").text("白天");
        }

        //todo   还原上一次字体、北京色状态
        Dom.fiction_container.css('font-size',initFontSize);
        Dom.Body.css('backgroundColor',initBgColor);

        //todo  整个项目的入口函数
        function main(){
            readerModel = ReaderModel();
            readerUI = ReaderBaseFrame( Dom.fiction_container  );
            readerModel.init(function( data ){
                readerUI( data );
            });
            EventHander();
        }

        // todo  实现和阅读器相关的数据交互的方法
        function ReaderModel(){
            var Chapter_id = Uilt.StorageGetter("Chapter_id");
            var CharterTotal;
            var init = function( UIcallback ){ //初始化

                /*getFictionInfo(function(){
                    getCurChapterContent(Chapter_id,function(data){
                            UIcallback && UIcallback( data );
                    })
                })*/

                //优化后回调
                getFictionInfoPromise()
                    .then(function(d){
                        return getCurChapterContentPromise();
                    })
                    .then(function(d){
                        UIcallback && UIcallback( d );
                    });

            };

            //todo 获取所有数据
            var getFictionInfo = function( callback ){
                $.get("data/chapter.json",function( data ){
                    //todo 拿到章节信息之后的回调
                    //如果等于undefined意味着没记录，取第一章节id； 否则取记录章节的id；
                    Chapter_id = (Chapter_id == undefined) ? data.chapters[1].chapter_id : Chapter_id;
                    CharterTotal = data.chapters.length;
                    callback && callback();
                },'json')
            };

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

            //todo 获取章节内容
            var getCurChapterContent = function( chapter_id, callback ){
                $.get("data/data"+chapter_id+".json",function(data){
                    if( data.result == 0 ){
                        var url = data.jsonp;
                        Uilt.getBSONP( url, function(data){
                            callback && callback( data, chapter_id );
                        })
                    }
                },'json');
            };

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


            //todo 获取上一章内容
            var prevChapter = function( UIcallbacks){
                Chapter_id = parseInt( Chapter_id );
                if( Chapter_id == 1 ){
                        alert('已经是第一章了');
                        return;
                }
                Chapter_id -=  1;
                getCurChapterContent( Chapter_id, UIcallbacks );
            }

            // todo 获取下一章内容
            var nextChapter = function( UIcallbacks ){
                Chapter_id = parseInt( Chapter_id );
                if( Chapter_id == CharterTotal ){
                    alert('已经是最后一章了');
                    return;
                }
                Chapter_id  += 1;
                getCurChapterContent( Chapter_id, UIcallbacks );
            }

            return {
                init : init,
                prevChapter : prevChapter,
                nextChapter : nextChapter
            }
        }

        // todo  渲染基本的UI结构
        function ReaderBaseFrame( container ){
            function parseChapterData(jsonData){
                var jsonObj = JSON.parse( jsonData );
                var html =  '<h4>' + jsonObj.t + '</h4>';
                var len = jsonObj.p.length;
                for( var i=0; i<len; i++ ){
                    html += '<p>' + jsonObj["p"][i] + '<p>';
                }
                return html;
             }

             return function( data ){
                container.html( parseChapterData( data ) );
             }
        }

        //todo  交互的事件绑定
        function EventHander(){
            //点击中间的时候展现/隐藏
            $("#action_mid").click(function(){
                if( Dom.top_nav.css("display") == "none" ){
                    Dom.bottom_nav.show();
                    Dom.top_nav.show();
                }else{
                    Dom.bottom_nav.hide();
                    Dom.top_nav.hide();
                    Dom.font_container.hide();
                    Dom.font_button.find(".icon").removeClass("icon-fonts-active");
                }
            });

            //todo 滚动的时候藏起来
            Win.scroll(function(){
                Dom.bottom_nav.hide();
                Dom.top_nav.hide();
                Dom.font_container.hide();
                Dom.font_button.find(".icon").removeClass("icon-fonts-active");
            });

            //todo 点击字体
            Dom.font_button.click(function(){
                if( Dom.font_container.css('display') == 'none' ){
                    Dom.font_container.show();
                    Dom.font_button.find(".icon").addClass("icon-fonts-active");
                }else{
                    Dom.font_button.find(".icon").removeClass("icon-fonts-active");
                    Dom.font_container.hide();
                }
            });

            //todo 点击切换夜间
            Dom.night_day_switch_button.click(function(){
                //todo  触发背景切换事件
                if( bBtn ){
                    $(this).find('.icon').addClass("icon-nig");
                    $(this).find(".nav-title").text("白天");
                    Dom.Body.css('backgroundColor','rgb(15, 20, 16)');
                    Uilt.StorageSetter('bgColor', 'rgb(15, 20, 16)');
                    bBtn = false;
                    Uilt.StorageSetter("bBtn",bBtn);
                }else{
                    $(this).find('.icon').removeClass("icon-nig");
                    $(this).find(".nav-title").text("夜间");
                    Dom.Body.css('backgroundColor','#fff');
                    Uilt.StorageSetter('bgColor', '#fff');
                    bBtn = true;
                    Uilt.StorageSetter("bBtn",bBtn);
                }
            });

            //todo 放大字体
            $("#large-font").click(function(){
                if( initFontSize > 20 ){
                    return ;
                }
                initFontSize += 1
                Dom.fiction_container.css('font-size',initFontSize);

                //todo 把字体大小存起来
                Uilt.StorageSetter('font_size', initFontSize);
            });

            //todo 缩字体
            $("#small-font").click(function(){
                if( initFontSize <= 12 ){
                    return;
                }
                initFontSize -= 1;
                Dom.fiction_container.css('font-size',initFontSize);

                //todo 把字体大小存起来s
                Uilt.StorageSetter('font_size', initFontSize);
            });

            //todo 切换背景颜色
            for( var i=0; i<Dom.bk_container.length ; i++ ){
                Dom.bk_container.eq(i).click(function(){
                    for( var k=0; k<Dom.bk_container.length ;k++ ){
                        Dom.bk_container.eq(k).find('div').removeClass("showActive");
                    }
                    $(this).find('div').addClass('showActive');
                    var bgStyle = $.trim( $(this).data('bg') );
                    switch( bgStyle ){
                        case '米白':
                            Dom.Body.css('backgroundColor',arrColor[0]);
                            Uilt.StorageSetter('bgColor', arrColor[0]);
                            break;
                        case '纸张':
                            Dom.Body.css('backgroundColor',arrColor[1]);
                            Uilt.StorageSetter('bgColor',arrColor[1]);
                            break;
                        case '浅灰':
                            Dom.Body.css('backgroundColor',arrColor[2]);
                            Uilt.StorageSetter('bgColor', arrColor[2]);
                            break;
                        case '护眼':
                            Dom.Body.css('backgroundColor',arrColor[3]);
                            Uilt.StorageSetter('bgColor', arrColor[3]);
                            break;
                        case '灰蓝':
                            Dom.Body.css('backgroundColor',arrColor[4]);
                            Uilt.StorageSetter('bgColor', arrColor[4]);
                            break;
                    }
                })
            }

            //todo 点击获取上一章内容
            Dom.prevBtn.click(function(){
                    //todo 获取章节翻页数据->把数据拿出来渲染
                    readerModel.prevChapter( function(data,chapter_id){
                        //todo  渲染页面
                        readerUI(data);
                        Uilt.StorageSetter("Chapter_id",chapter_id);
                    } )
            })

            //todo 点击获取下一章
            Dom.nextBtn.click(function(){
                readerModel.nextChapter( function(data,chapter_id){
                    //todo  渲染页面
                    readerUI(data);
                    Uilt.StorageSetter("Chapter_id",chapter_id);
                } )
            })
        }

		//todo  函数调用
        main();
    })();