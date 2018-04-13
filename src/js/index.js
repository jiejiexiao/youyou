
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
                let $imgCar = $('#header i').has('img');

                //点击跳转购物车 覆盖public.js的跳转
                $imgCar.on('click',function(){
                    location.href = 'html/car.html';
                })


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
        })(jQuery);


        //public的js
        $(function($){
            //获取元素
            let $imgCar = $('#header i').has('img');
            let $uls = $('#header .h_center .c_right').children();

            //获取当前保存购物车信息的cookie
            let goodsData = Cookie.get('goodsData');
            if(typeof goodsData === 'string' && goodsData != ''){
                goodsData = JSON.parse(goodsData);
            }else{
                goodsData = [];
            }

            //更新头部购物车的数量
            $imgCar.next().text(goodsData.length);

            let loginStatus = 'offline';//默认下线
            //判断用户登陆状态
            loginStatus = Cookie.get('loginStatus');

            //
            if(loginStatus==='online'){
                //获取用户名
                let username = Cookie.get('username');
                //tab切换
                $uls.addClass('none').last().removeClass('none').find('a').first().text(username).css('color','red');
                //获取退出 节点
                let $backBtn = $uls.eq(1).find('a').eq(2);

                //点击退出删除cookie 退出登陆状态
                $backBtn.click(function(){
                    //tab切换
                    $uls.addClass('none').first().removeClass('none');

                    //修改cookie
                    Cookie.set('loginStatus','offline','','/');
                    //注销购物车的信息
                    Cookie.remove('goodsData','/');

                    //向后台发送数据改变用户登陆状态
                    $.ajax({
                        url:'api/userLoginStatus.php',
                        data:{username:username,status:'offline'},
                    });

                    //刷新页面          
                    location.reload();

                });
            }
                
        })
    })
})

