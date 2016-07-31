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