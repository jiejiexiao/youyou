"use strict";

require(["config"], function () {
    require(["jquery", "common", "public"], function () {

        ;(function ($) {
            $(function ($) {
                //获取页面元素
                var $goodLists = $('.goodLists');
                var $nav = $goodLists.prev().children();
                var $page = $('#page');
                var $selected = $('#main .selected');
                var $right = $selected.find('.right');
                var $imgCar = $('#header i').has('img');
                var goods = void 0; //全局变量页面的数据
                //向数据库获取数据
                var qty = 20; //每页显示的条数
                var pages = void 0;
                var orders = ['update', 'lower', 'upper', 'new', 'sell']; //编写传入后台的数据
                var idx = void 0;
                //用于搜索的参数
                var classify = '男鞋';
                var brand = '全部';
                var priceRang = '全部';
                var priceRangMin = void 0;
                var priceRangMax = void 0;
                var size = void 0;

                //点击跳转购物车
                $imgCar.on('click', function () {
                    location.href = 'car.html';
                });

                //初始化ajax加载数据
                $.ajax({
                    url: '../api/goodsList.php',
                    data: {
                        type: 'new',
                        qty: qty,
                        classify: classify,
                        brand: brand,
                        priceRang: priceRang,
                        priceRangMin: priceRangMin,
                        priceRangMax: priceRangMax,
                        size: size

                    },
                    success: function success(data) {
                        //将json字符串——》数组             
                        goods = JSON.parse(data).data;
                        var counts = JSON.parse(data).counts;
                        //得到数据，根据数据生成html
                        createTable(goods);

                        //产生分页
                        var len = Math.ceil(counts / qty); //页码数量
                        for (var i = 0; i < len; i++) {
                            var $span = $('<span/>');
                            $span.text(i + 1); //页码
                            if (i == 0) {
                                //默认第一个高亮
                                $span.addClass('active');
                            }
                            $page.append($span);
                        }
                    }
                });

                //绑定事件给商品添加样式
                $goodLists.on('mouseenter', 'li', function () {
                    $(this).addClass('active');
                }).on('mouseleave', 'li', function () {
                    $(this).removeClass('active');
                })

                //点击商品跳转到详情页
                .on('click', 'li', function () {
                    var id = $(this).attr('data-id'); //获取id
                    location.href = "goodDetail.html?id=" + id; //跳转传参
                });

                //点击分页切换
                $page.on('click', 'span', function () {
                    $(this).addClass('active').siblings().removeClass('active'); //tab切换
                    //获取页码
                    page = $(this).text();
                    //传输页码和页码数量参数
                    ajax({
                        url: '../api/goodsList.php',
                        data: {
                            page: page,
                            qty: qty,
                            type: orders[idx],
                            classify: classify,
                            brand: brand,
                            priceRang: priceRang,
                            priceRangMin: priceRangMin,
                            priceRangMax: priceRangMax,
                            size: size
                        },
                        success: function success(data) {
                            goods = data.data;
                            // //得到数据，根据数据生成html
                            createTable(goods);
                        }
                    });
                });

                //点击进行价格排序   
                $nav.on('click', 'li', function () {
                    $(this).addClass('active').siblings().removeClass('active'); //tab高亮切换
                    //遍历获取当前索引值
                    for (var i = 0; i < orders.length; i++) {
                        if ($nav.children().eq(i).get(0) == this) {
                            idx = i;
                        }
                    }

                    //发起ajax请求
                    $.ajax({
                        url: '../api/goodsList.php',
                        data: {
                            type: orders[idx],
                            classify: classify,
                            brand: brand,
                            priceRang: priceRang,
                            priceRangMin: priceRangMin,
                            priceRangMax: priceRangMax,
                            size: size
                        },
                        success: function success(data) {
                            //将json字符串——》数组             
                            goods = JSON.parse(data).data;
                            var counts = JSON.parse(data).counts;
                            //得到数据，根据数据生成html
                            createTable(goods);

                            //产生分页
                            $page.html(''); //清空页码
                            var len = Math.ceil(counts / qty); //页码数量
                            for (var _i = 0; _i < len; _i++) {
                                var $span = $('<span/>');
                                $span.text(_i + 1); //页码
                                if (_i == 0) {
                                    //默认第一个高亮
                                    $span.addClass('active');
                                }
                                $page.append($span);
                            }
                        }
                    });
                });

                //对selected进行事件绑定进行搜索
                $right.on('click', 'span', function (event) {
                    //样式tab切换
                    $(this).closest('.right').find('span').removeClass('active');
                    $(this).addClass('active');
                    event.preventDefault();

                    //获取参数
                    var $parma = $right.find('.active');
                    classify = $parma.eq(0).text();
                    brand = $parma.eq(1).text();
                    priceRang = $parma.eq(2).text(); //100-200 ->100,200
                    size = $parma.eq(3).text();
                    //100-200 ->100,200
                    priceRangMin = priceRang.split('-')[0] || null;
                    priceRangMax = priceRang.split('-')[1] || null;
                    //根据参数发起ajax请求
                    $.ajax({
                        url: '../api/goodsList.php',
                        data: {
                            type: orders[idx],
                            classify: classify,
                            brand: brand,
                            priceRang: priceRang,
                            priceRangMin: priceRangMin,
                            priceRangMax: priceRangMax,
                            size: size
                        },
                        success: function success(data) {
                            //将json字符串——》数组             
                            goods = JSON.parse(data).data;
                            var counts = JSON.parse(data).counts;
                            //得到数据，根据数据生成html
                            createTable(goods);

                            //产生分页
                            $page.html(''); //清空页码
                            var len = Math.ceil(counts / qty); //页码数量
                            for (var i = 0; i < len; i++) {
                                var $span = $('<span/>');
                                $span.text(i + 1); //页码
                                if (i == 0) {
                                    //默认第一个高亮
                                    $span.addClass('active');
                                }
                                $page.append($span);
                            }
                        }
                    });
                });

                //封装根据数据生成数据列表
                function createTable(goods) {
                    $goodLists.html('');
                    var $res = $.map(goods, function (item, idx) {
                        var $li = $('<li/>');
                        $li.attr('data-id', item.id);
                        $li.html("<img src=\"../img/" + item.img + "\"/>\n                            <p>" + item.brand + item.classifyForhuman + item.classifyForshoe + item.goodsName + " " + item.color + "</p>\n                            <p>\u672C\u5E97\u4EF7<span class=\"price\">" + item.youyouPrice + "</span><span class=\"counts\">\u552E\u51FA\uFF080\uFF09\u4EF6</span></p>\n                            ");
                        return $li;
                    });
                    $goodLists.append($res);
                }
            });
        })(jQuery);
    });
});