'use strict';

require(['config'], function () {
    require(['jquery', 'common'], function () {

        var loginStatus = 'offline'; //默认下线
        //判断用户登陆状态
        loginStatus = Cookie.get('loginStatus');

        if (loginStatus == 'online') {
            alert('你已经登陆');
            location.href = '../index.html';
        }
    });
});