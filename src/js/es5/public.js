'use strict';

;(function ($) {
    $(function ($) {
        //获取元素
        var $imgCar = $('#header i').has('img');
        var $uls = $('#header .h_center .c_right').children();

        //获取当前保存购物车信息的cookie
        var goodsData = Cookie.get('goodsData');
        if (typeof goodsData === 'string' && goodsData != '') {
            goodsData = JSON.parse(goodsData);
        } else {
            goodsData = [];
        }

        //更新头部购物车的数量
        $imgCar.next().text(goodsData.length);

        var loginStatus = 'offline'; //默认下线
        //判断用户登陆状态
        loginStatus = Cookie.get('loginStatus');

        //
        if (loginStatus === 'online') {
            //获取用户名
            var username = Cookie.get('username');
            //tab切换
            $uls.addClass('none').last().removeClass('none').find('a').first().text(username).css('color', 'red');
            //获取退出 节点
            var $backBtn = $uls.eq(1).find('a').eq(2);

            //点击退出删除cookie 退出登陆状态
            $backBtn.click(function () {
                //tab切换
                $uls.addClass('none').first().removeClass('none');

                //修改cookie
                Cookie.set('loginStatus', 'offline', '', '/');
                //注销购物车的信息
                Cookie.remove('goodsData', '/');

                //向后台发送数据改变用户登陆状态
                $.ajax({
                    url: '../api/userLoginStatus.php',
                    data: { username: username, status: 'offline' }
                });

                //刷新页面          
                location.reload();
            });
        }
    });
})(jQuery);