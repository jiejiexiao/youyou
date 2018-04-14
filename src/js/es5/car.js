'use strict';

//引入模块
require(['config'], function () {
    require(['jquery', 'common', 'public'], function () {
        ;(function ($) {
            //获取页码元素
            var $carList = $('#carList');
            var $youyouCount = $('.youyouCount');
            var $shopCount = $('.shopCount');
            var $chajia = $('.chajia');
            var $rate = $('.rate');
            var $imgCar = $('#header i').has('img');

            //声明全局变量//过期时间
            var d = new Date();
            d.setDate(d.getDate() + 10000);

            //获取当前用户的登陆状态
            var loginStatus = Cookie.get('loginStatus'); //''、'online'、'offline'
            //获取用户
            var username = Cookie.get('username');

            //读取cookie
            var goodsData = Cookie.get('goodsData');
            //判断数据
            if (typeof goodsData === 'string' && goodsData != '') {
                goodsData = JSON.parse(goodsData);
            } else {
                goodsData = [];
            }
            // console.log(goodsData);


            //根据数据生成数据列表
            if (goodsData.length === 0) {
                var $tr = $('<tr/>');
                var $td = $('<td/>');
                $td.text('购物车空空的');
                $td.css({
                    height: 200,
                    lineHeight: '200px',
                    fontSize: '40px',
                    textAlign: 'center'
                }).attr('colspan', 6);
                $td.appendTo($tr);
                $tr.appendTo($carList);
            } else {
                //调用函数生成列表
                createList(goodsData);
                createCount(goodsData);
            }

            //绑定事件用事件委托
            //阻止默认行为
            $carList.on('click', function (event) {
                event.preventDefault();
            }).on('mousemove', function (event) {
                event.preventDefault();
            })
            //减少数量
            .on('click', '.jian', function () {
                var $counts = $(this).next();
                if ($counts.val() * 1 <= 1) {
                    $counts.val(1);
                } else {
                    $counts.val($counts.val() * 1 - 1);

                    //获取当前商品的id
                    var id = $(this).closest('tr').data().id;
                    //获取当前商品的size
                    var size = $(this).closest('tr').find('td').eq(1).text().slice(3) * 1;

                    //改变cookie中的当前id的qty
                    var line = $(this).closest('tr').data().line - 1;
                    goodsData[line].qty = $counts.val() * 1;

                    //改变总计 
                    $(this).closest('tr').children().eq(4).children().text(goodsData[line].youyouPrice * $counts.val() + '元');

                    //更新cookie
                    Cookie.set('goodsData', JSON.stringify(goodsData), d, '/');

                    //更新
                    createCount(goodsData);

                    //发起Ajax请求向后端发起数据 保存用户购物车信息
                    if (loginStatus === 'online') {
                        $.ajax({
                            url: '../api/userCar.php',
                            data: {
                                username: username,
                                goodId: id,
                                qty: goodsData[line].qty,
                                size: size,
                                type: 'unadd'

                            }
                        });
                    }
                }
            })
            //增加数量
            .on('click', '.jia', function () {
                //获取counts
                var $counts = $(this).prev();
                $counts.val($counts.val() * 1 + 1);

                //获取当前商品的id
                var id = $(this).closest('tr').data().id;
                //获取当前商品的size
                var size = $(this).closest('tr').find('td').eq(1).text().slice(3) * 1;

                //改变cookie中的当前id的qty
                var line = $(this).closest('tr').data().line - 1;
                goodsData[line].qty = $counts.val() * 1;

                //改变总计 
                $(this).closest('tr').children().eq(4).children().text(goodsData[line].youyouPrice * $counts.val() + '元');

                //更新cookie
                Cookie.set('goodsData', JSON.stringify(goodsData), d, '/');

                //更新
                createCount(goodsData);

                //发起Ajax请求向后端发起数据 保存用户购物车信息
                if (loginStatus === 'online') {
                    $.ajax({
                        url: '../api/userCar.php',
                        data: {
                            username: username,
                            goodId: id,
                            qty: goodsData[line].qty,
                            size: size,
                            type: 'unadd'

                        }
                    });
                }
            })
            //改变输入框的数量
            .on('change', 'input', function () {
                if (!/^\d{1,}$/.test($(this).val())) {
                    alert('请输入正确的数量');
                    $(this).val(1);
                }

                //改变cookie中的当前id的qty
                var line = $(this).closest('tr').data().line - 1;
                goodsData[line].qty = $(this).val() * 1;

                //获取当前商品的id
                var id = $(this).closest('tr').data().id;
                //获取当前商品的size
                var size = $(this).closest('tr').find('td').eq(1).text().slice(3) * 1;

                //改变总计 
                $(this).closest('tr').children().eq(4).children().text(goodsData[line].youyouPrice * $(this).val() + '元');

                //更新cookie
                Cookie.set('goodsData', JSON.stringify(goodsData), d, '/');

                //更新
                createCount(goodsData);

                //发起Ajax请求向后端发起数据 保存用户购物车信息
                if (loginStatus === 'online') {
                    $.ajax({
                        url: '../api/userCar.php',
                        data: {
                            username: username,
                            goodId: id,
                            qty: goodsData[line].qty,
                            size: size,
                            type: 'unadd'

                        }
                    });
                }
            })
            //点击删除按钮
            .on('click', '.delBtn', function () {
                //当前对象
                var $self = $(this);

                //创建弹窗
                new Popul();
                //获取按钮
                var $confirmBtn = $('.confirmBtn');
                var $cancelBtn = $('.cancelBtn');
                //弹窗
                var $popul = $('.xPopul');
                var $overlay = $('.xoverlay'); //遮罩

                //绑定事件
                //
                //确认删除
                $confirmBtn.on('click', function () {
                    //获取当前商品的id
                    var id = $self.closest('tr').data().id;
                    //获取当前商品的size
                    var size = $self.closest('tr').find('td').eq(1).text().slice(3) * 1;

                    var idx = $self.closest('tr').data().line - 1; //获取当前行对应的index
                    goodsData.splice(idx, 1); //删除当前行

                    //根据数据生成数据列表
                    if (goodsData.length === 0) {
                        //清空
                        $carList.html('');
                        $youyouCount.text('');
                        $shopCount.text('');
                        $chajia.text('');
                        $rate.text('');

                        var _$tr = $('<tr/>');
                        var _$td = $('<td/>');
                        _$td.text('购物车空空的');
                        _$td.css({
                            height: 200,
                            lineHeight: '200px',
                            fontSize: '40px',
                            textAlign: 'center'
                        }).attr('colspan', 6);
                        _$td.appendTo(_$tr);
                        _$tr.appendTo($carList);
                    } else {
                        //调用函数生成列表
                        createList(goodsData);
                        createCount(goodsData);
                    }
                    //发起Ajax请求向后端发起数据 保存用户购物车信息
                    if (loginStatus === 'online') {
                        $.ajax({
                            url: '../api/userCar.php',
                            data: {
                                username: username,
                                goodId: id,
                                size: size,
                                type: 'del'

                            }
                        });
                    }

                    //更新cookie
                    Cookie.set('goodsData', JSON.stringify(goodsData), d, '/');
                    //更新头部购物车的数量
                    $imgCar.next().text(goodsData.length);

                    $popul.remove();
                    $overlay.remove();
                });

                //取消删除
                $cancelBtn.on('click', function () {
                    $popul.remove();
                    $overlay.remove();
                });
            });

            //封装生成商品列表
            function createList(goodsData) {
                $carList.html('');
                var res = $.map(goodsData, function (item, idx) {
                    return '<tr data-id="' + item.id + '" data-line="' + (idx + 1) + '">\n                                <td><img src="../img/' + item.img + '" /><p>' + item.brand + item.classifyForhuman + item.classifyForshoe + item.goodsName + '</p></td>\n                                <td>\u5C3A\u7801\uFF1A' + item.size + '</td>\n                                <td><span>' + item.shopPrice + '\u5143</span><span>' + item.youyouPrice + '\u5143</span></td>\n                                <td><span class="jian">-</span><input type="text" value="' + item.qty + '"/><span class="jia">+</span></td>\n                                <td><span>' + item.qty * item.youyouPrice + '\u5143</span></td>\n                                <td><span class="delBtn">\u5220\u9664</span></td>\n                            </tr>';
                }).join('');
                $carList.html(res);
            }

            //封装生成总价 差价 比率
            function createCount(goodsData) {
                var youyouTotal = 0;
                var shopTotal = 0;

                for (var i = 0; i < goodsData.length; i++) {
                    youyouTotal += goodsData[i].youyouPrice * 1 * (goodsData[i].qty * 1);
                    shopTotal += goodsData[i].shopPrice * 1 * (goodsData[i].qty * 1);
                }

                $youyouCount.text(youyouTotal);
                $shopCount.text(shopTotal);
                $chajia.text(shopTotal - youyouTotal);
                $rate.text(Math.ceil((shopTotal - youyouTotal) / shopTotal * 100));
            }

            //描述一个弹窗
            function Popul(option) {
                var defaults = {
                    ele: 'xPopul',
                    title: '温馨提示',
                    content: '是否要删除该商品?',
                    confirmBtn: 'confirmBtn',
                    cancelBtn: 'cancelBtn',
                    width: 400,
                    height: 300,
                    overlay: true
                };

                var opt = Object.assign({}, defaults, option);
                //设置属性
                this.width = opt.width;
                this.height = opt.height;
                this.overlay = opt.overlay;
                this.ele = opt.ele;
                this.title = opt.title;
                this.content = opt.content;
                this.confirmBtn = opt.confirmBtn;
                this.cancelBtn = opt.cancelBtn;

                this.init(); //初始化
            }
            Popul.prototype.init = function () {
                //弹窗主体
                var $popul = $('<div/>');
                $popul.addClass(this.ele);
                $popul.css({
                    width: this.width,
                    height: this.height
                });

                //标题
                var $title = $('<div/>');
                $title.addClass('title');
                $title.text(this.title);
                $title.appendTo($popul);

                //content
                var $content = $('<div/>');
                $content.addClass('content');
                $content.text(this.content);
                $content.appendTo($popul);

                //确定按钮
                var $confirm = $('<span/>');
                $confirm.addClass(this.confirmBtn);
                $confirm.text('确定');
                $confirm.appendTo($popul);

                //取消按钮
                var $cancel = $('<span/>');
                $cancel.addClass(this.cancelBtn);
                $cancel.text('取消');
                $cancel.appendTo($popul);

                if (this.overlay) {
                    var $overlay = $('<div/>');
                    $overlay.addClass('xoverlay');
                    $overlay.appendTo($('body'));
                }

                $popul.appendTo($('body'));
            };
        })(jQuery);
    });
});