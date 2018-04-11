
require(['config'],function(){
    require(['jquery','common','xcarousel'],function(){

        ;(function($){
            $(function($){
                //首页轮播图
                //获取页面元素
                let $banner = $('#banner');
                let $header = $('#header');
                let $search = $header.find(':text');
                let $searchBtn = $search.next();


                //获取页面屏幕大小
                let widthVisite = $(window).width();
                //通过xCarousel插件生成轮播图
                $banner.xCarousel({
                    width:widthVisite,
                    height:700,
                    type:'fade',
                    imgs:['img/20161220srhdhj.jpg','img/20161228qlksse.jpg','img/20170112dexkdc.jpg','img/20170508rrufts.gif'],
                    seamless:true,
                    page:true
                })
                //carousel自适应
                $(window).on('resize',function(){
                    widthVisite = $(window).width();
                    $banner.html('');
                    $banner.xCarousel({
                        width:widthVisite,
                        height:700,
                        type:'fade',
                        imgs:['img/20161220srhdhj.jpg','img/20161228qlksse.jpg','img/20170112dexkdc.jpg','img/20170508rrufts.gif'],
                        seamless:true,
                        page:true
                    })
                })


                //给搜索框绑定事件
                let text = $search.val();
                $search.on('focus',function(){
                    $search.val('');
                    $search.css('border','1px solid blue')
                }).on('blur',function(){
                    $search.val(text);
                    $search.css('border','1px solid #000');
                })




            })
        }(jQuery));

    })
})

