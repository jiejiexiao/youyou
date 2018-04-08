;(function($){
	'use strict'
	$.fn.xCarousel = function(options){
		// this指向$(.box元素)
		// console.log(this)

		let defaults = {
			imgs:[],
			width:800,
			height:320,
			index:0,
			duration:3000,
			autoPlay:true,
			type:'vertical',//horizontal,fade
			seamless:false,
			page:true,
			// imgs:[],保存图片路径
		}

		return this.each(function(){
			// 这里的this指向
			

			let $self = $(this);

			// let opt = Object.assign({},defaults,options);
			let opt = $.extend(true,{},defaults,options);//深复制

			opt.len = opt.imgs.length;
			if(opt.seamless){
				opt.len++;
				opt.imgs.push(opt.imgs[0]);
			}

			let $ul;
			let $page;

			// 上一张图处索引值
			let lastIndex = opt.index;


			// 获取/创建元素
			// 绑定事件
			let init = ()=>{
				// 应用插件样式
				$self.addClass('xcarousel');
				$self.width(opt.width);
				$self.height(opt.height);


				$ul = $('<ul/>');

				let $res = $.map(opt.imgs,function(url){
					let $li = $('<li/>');
					let $img = $('<img/>');
					$img.attr('src',url).css({
						width:opt.width,
						height:opt.height
					}).appendTo($li);

					return $li;
				});//[$li,$li,$li]

				$ul.append($res);

				$ul.appendTo($self);

				//添加分页
				if(opt.page){
					$page = $('<div/>');
					$page.addClass('page');
					if(opt.seamless){
						opt.imgs = opt.imgs.slice(0,-1);
					}
					$.each(opt.imgs,function(idx,img){
						let $span = $('<span/>');
						$span.text((idx+1)).appendTo($page);
						if(opt.index==idx){
							$span.addClass('active')
						}
					})

					$page.appendTo($self);
				}
				

				// 水平滚动必须设置ul的宽度
				if(opt.type === 'horizontal'){
					$ul.width(opt.width*opt.len);
					$ul.addClass('horizontal');
				}

				// 淡入淡出必须设置定位
				else if(opt.type === 'fade'){
					$ul.addClass('fade');
					$ul.css({
						width:opt.width,
						height:opt.height
					});

					$ul.children('li').eq(opt.index).siblings('li').css('opacity',0);
				}

				// 移入移出
				$self.on('mouseenter',()=>{
					clearInterval($self.timer);
				}).on('mouseleave',()=>{
					move();
				})

				// 点击页码
				.on('click','.page span',function(){
					
					$self.find(':animated').stop(true)

					if(opt.type == 'fade'){
						if(opt.index ==$(this).text()-1){
							return false;
						}
					}

					opt.index = $(this).text()-1;
					
					show();
					pageMove();

				});

				move();
			}

			// 运动
			let move = ()=>{
				$self.timer = setInterval(()=>{
					opt.index++;

					show();
				},opt.duration);
			};
			//页码
			let pageMove = ()=>{
				if(opt.seamless && opt.index==opt.len-1){
					$page.children().filter('.active').removeClass('active');
					$page.children().eq(0).addClass('active');
				}else{
					$page.children().filter('.active').removeClass('active');
					$page.children().eq(opt.index).addClass('active');
				}
				
			}


			let show = function(){
				if(opt.index >= opt.len){
					

					if(opt.seamless){
						if(opt.type == 'horizontal'){
							$ul.css({left:0});
						}else if(opt.type == 'vertical'){
							$ul.css({top:0});
						}
						
						opt.index = 1;
					}else{
						opt.index = 0;
					}
				}else if(opt.index < 0){
					opt.index = opt.len-1
				}

				let obj = {};
				if(opt.type === 'vertical'){
					obj.top = -opt.height*opt.index;
					$ul.animate(obj);


					if(opt.page){
						pageMove();
					}
				}else if(opt.type === 'horizontal'){
					obj.left = -opt.width*opt.index;
					$ul.animate(obj);

					if(opt.page){
						pageMove();
					}
					
				}else if(opt.type === 'fade'){
					// 改变li的opacity
					$ul.children('li').eq(opt.index).animate({opacity:1},function(){
						lastIndex = opt.index;
					});
					$ul.children('li').eq(lastIndex).animate({opacity:0},function(){
						lastIndex = opt.index;
					});

					if(opt.page){
						pageMove();
					}

				}
				

			}

			init();
		});

		// return this;
	}

	$.fn.extend({
		xPopover(){},
		xAjax(){},
		xAjax(){},
		xAjax(){},
		xAjax(){}
	})

})(jQuery);
