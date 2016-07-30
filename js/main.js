
    (function(){  'use strict';   //自执行环境

        //声明一个类  存储设置
        var Uilt = (function(){
            //本地存储
            var prefix = 'html5_reader_'; //来一个前缀，避免冲突
            //获取
            var StorageGetter = function( key ){
                return localStorage.getItem( prefix + key );
            };
            //设置
            var StorageSetter = function(key,val){
                return localStorage.setItem( prefix + key, val );
            };
            //获取jsonp数据
            var getBSONP = function(url, callback){
                return $.jsonp({   //利用的是json插件的功能
                    url : url,
                    cache : true,
                    callback : "duokan_fiction_chapter",
                    success : function(result){
                        var data = $.base64.decode( result ); //解码
                        var json = decodeURIComponent( escape(data) )
                        callback( json );
                    }
                });
            };
                return {   //暴露出来
                    StorageGetter  : StorageGetter,
                    StorageSetter : StorageSetter,
                    getBSONP : getBSONP
                }
        })();

        //重复应用的dom
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
        var bBtn = true;
        var initFontSize = Uilt.StorageGetter("font_size"); //默认字体
        var initBgColor = Uilt.StorageGetter("bgColor"); //默认bg
        initFontSize = parseInt(initFontSize);
        if( !initFontSize ){
            initFontSize = 14;
        }
        if( !initBgColor ){
            initBgColor = arrColor[0];
        }
        Dom.fiction_container.css('font-size',initFontSize);
        Dom.Body.css('backgroundColor',initBgColor);

        function main(){
            //todo  整个项目的入口函数


            readerModel = ReaderModel();
            readerUI = ReaderBaseFrame( Dom.fiction_container  );
            readerModel.init( function( data ){
                readerUI( data );
            } );
            EventHander();
        }

        function ReaderModel(){
            // todo  实现和阅读器相关的数据交互的方法
            var Chapter_id;
            var CharterTotal;
            var init = function( UIcallback ){ //初始化
                getFictionInfo(function(  ){
                    getCurChapterContent(Chapter_id,function(data){
                            UIcallback && UIcallback( data );
                    })
                })
            }
            var getFictionInfo = function( callback ){
                $.get("data/chapter.json",function( data ){
                    //todo 拿到章节信息之后的回调
                    console.log( data );
                    Chapter_id = data.chapters[1].chapter_id;
                    CharterTotal = data.chapters.length;
                    callback && callback();
                },'json')
            };

            var getCurChapterContent = function( chapter_id, callback ){
                $.get("data/data"+chapter_id+".json",function(data){
                    if( data.result == 0 ){
                        var url = data.jsonp;
                        Uilt.getBSONP( url, function(data){
                            callback && callback( data );
                        })
                    }
                },'json');
            };

            var prevChapter = function( UIcallbacks){
                Chapter_id = parseInt( Chapter_id );
                if( Chapter_id == 1 ){
                        alert('已经是第一章了');
                        return;
                }
                Chapter_id -=  1;
                getCurChapterContent( Chapter_id, UIcallbacks );
            }

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

        function ReaderBaseFrame( container ){
            // todo  渲染基本的UI结构
            function parseChapterData(jsonData){
                var jsonObj = JSON.parse( jsonData );
                var html =  '<h4>' + jsonObj.t + '<h4>';
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

        function EventHander(){
            //todo  交互的事件绑定
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

            //滚动的时候藏起来
            Win.scroll(function(){
                Dom.bottom_nav.hide();
                Dom.top_nav.hide();
                Dom.font_container.hide();
                Dom.font_button.find(".icon").removeClass("icon-fonts-active");
            });

            //点击字体
            Dom.font_button.click(function(){
                if( Dom.font_container.css('display') == 'none' ){
                    Dom.font_container.show();
                    Dom.font_button.find(".icon").addClass("icon-fonts-active");
                }else{
                    Dom.font_button.find(".icon").removeClass("icon-fonts-active");
                    Dom.font_container.hide();
                }
            });

            //点击切换夜间
            Dom.night_day_switch_button.click(function(){
                //todo  触发背景切换事件
                if( bBtn ){
                    $(this).find('.icon').addClass("icon-nig");
                    Dom.Body.css('backgroundColor','rgb(233, 223, 199)');
                    Uilt.StorageSetter('bgColor', 'rgb(233, 223, 199)');
                    bBtn = false;
                }else{
                    $(this).find('.icon').removeClass("icon-nig");
                    Dom.Body.css('backgroundColor','rgb(15, 20, 16)');
                    Uilt.StorageSetter('bgColor', 'rgb(15, 20, 16)');
                    bBtn = true;
                }
            });

            //放大字体
            $("#large-font").click(function(){
                initFontSize += 1;
                if( initFontSize > 20 ){
                    return ;
                }
                Dom.fiction_container.css('font-size',initFontSize);
                //把字体大小存起来
                Uilt.StorageSetter('font_size', initFontSize);
            });
            //缩字体
            $("#small-font").click(function(){
                initFontSize -= 1;
                if( initFontSize <= 12 ){
                    return;
                }
                Dom.fiction_container.css('font-size',initFontSize)
                //把字体大小存起来s
                Uilt.StorageSetter('font_size', initFontSize);
            });

            //切换背景颜色
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


            //上一章
            Dom.prevBtn.click(function(){
                    //todo 获取章节翻页数据->把数据拿出来渲染
                    readerModel.prevChapter( function(data){
                        //todo  渲染页面
                        readerUI(data);
                    } )
            })
            //下一章
            Dom.nextBtn.click(function(){
                readerModel.nextChapter( function(data){
                    //todo  渲染页面
                    readerUI(data);
                } )
            })
        }

        main();
    })()