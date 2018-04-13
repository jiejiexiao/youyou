;(function($){
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

            });
        }else{

        }


        

        
    })
})(jQuery);