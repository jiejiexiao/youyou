;(function($){
    $(function($){
        //首页轮播图
        //获取页面元素
        let $banner = $('#banner');

        //获取页面屏幕大小
        let widthVisite = $(document).width();


        $banner.xCarousel({
            width:widthVisite,
            height:700,
            type:'fade',
            imgs:['img/20161220srhdhj.jpg','img/20161228qlksse.jpg','img/20170112dexkdc.jpg','img/20170508rrufts.gif'],
            seamless:true,
            page:true
        })







    })
}(jQuery));