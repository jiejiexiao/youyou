;(function($){
    $.fn.xZoom = function(option){
        //this => jquery对象
        
        //设置默认值
        let defaults = {
            width:400,//可视效果宽度
            gap:10,//间隙
            position:'right',//left,top,bottom,right,inner
            ratio: 3.5,
            scale:2 ,//设置缩放比例
            change:false//如果只改变图片要设置true

        }

        //设置并且覆盖默认值
        let opt = $.extend({},defaults,option);

        return this.each(function(idx,ele){
            //this => ele
            var $self = $(this);

            let $zoom;
            let $big;
            let $smallImg;
            let $img;

            //描述对象能做什么
            let descript = {
                init(){
                    //初始化
                    //设置展示区样式
                    $self.addClass('xzoom-small');
                    $self.css({width:opt.width});                     
                    


                    //获取展示区图片
                    $smallImg = $self.children('img');console.log($smallImg.data().big)
                    //移除上一次页面上产生的元素
                    if(opt.change){
                        $self.find('.zoom').remove();
                        $('body').find('.xzoom-big').remove();
                    }
                    //创建放大镜框
                    $zoom = $('<div/>');
                    $zoom.addClass('zoom');                   
                    $zoom.appendTo($self);//加入页面后变化大小 与显示框比例缩放
                    $zoom.width($zoom.width()*opt.ratio);
                    $zoom.height($zoom.height()*opt.ratio);
                    
                    //创建bigImg容器
                    $big = $('<div/>');
                    $big.width($zoom.width()*opt.ratio).height($zoom.height()*opt.ratio)
                    .addClass('xzoom-big');
                    $big.appendTo('body');
                    //生成img图片 根据比例放大
                    $img = $('<img/>');
                    $img.prop('src',$smallImg.data('big'));
                    $img.css({width:opt.ratio*opt.width}).appendTo($big);

                    //绑定事件：移入显示放大镜和bigImg容器
                    $self.on('mouseenter',function(){
                        descript.show();   
                        
                    })
                    //移除隐藏放大镜和bigImg容器
                    .on('mouseleave',function(){
                        descript.hide();
                    })
                    //在容器上移动实现大图片移动
                    .on('mousemove',function(e){
                        descript.follow(e);
                    })

                },//显示容器和放大镜
                show(){
                    $zoom.show();
                    $big.fadeIn();

                    //显示容器位置
                    descript.position();
                },//隐藏容器和放大镜
                hide(){
                    $zoom.hide();
                    $big.fadeOut();
                },
                follow(e){
                    let x = e.pageX - $self.offset().left - $zoom.width()/2;
                    let y = e.pageY - $self.offset().top - $zoom.height()/2;

                    if(x<0){
                        x = 0;
                    }else if(x>($self.width()-$zoom.outerWidth())){
                        x = $self.width()-$zoom.outerWidth()
                    }

                    if(y<0){
                        y = 0;
                    }else if(y>($self.height()-$zoom.outerHeight())){
                        y = $self.height()-$zoom.outerHeight()
                    }

                    $zoom.css({left:x,top:y})

                    descript.followBig(x,y);
                },//大图片移动
                followBig(x,y){
                    
                    $img.css({left:-x*opt.ratio,top:-y*opt.ratio});
                },
                position(){
                    if(opt.position == 'right'){
                        $big.offset({
                            left:$self.offset().left + opt.gap + $self.outerWidth(),
                            top:$self.offset().top
                        })
                    }else if(opt.position == 'left'){
                        $big.offset({
                            left:$self.offset().left - opt.gap - $big.outerWidth(),
                            top:$self.offset().top
                        })
                    }else if(opt.position == 'top'){
                        $big.offset({
                            left:$self.offset().left,
                            top:$self.offset().top - $big.outerWidth - opt.gap,
                        })
                    }else if(opt.position == 'bottom'){
                        $big.offset({
                            left:$self.offset().left,
                            top:$self.offset().top + $self.outerWidth + opt.gap,
                        })
                    }
                }

            }

            //操作对象
            descript.init();

        })
    }
})(jQuery);