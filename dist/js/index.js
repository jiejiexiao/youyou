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
'use strict';

/**
 * [生成任意范围内随机整数的函数]
 * @param  {Number} min [最小值]
 * @param  {Number} max [最大值]
 * @return {Number}     [返回值]
 */
function randomNumber(min, max) {
	return parseInt(Math.random() * (max - min + 1)) + min;
}

/**
 * [生成随机颜色函数]
 * @return {String} [返回rgb格式颜色]
 */
function randomColor() {
	// 16进制：#ddd
	// rgb(255,222,66);

	// var r = parseInt(Math.random()*256);
	// var g = parseInt(Math.random()*256);
	// var b = parseInt(Math.random()*256);

	// 使用其它封装
	var r = randomNumber(0, 255);
	var g = randomNumber(0, 255);
	var b = randomNumber(0, 255);

	return 'rgb(' + r + ',' + g + ',' + b + ')'; //rgb(225,225,88)
}

/**
 * [生成16进制随机颜色函数]
 * @return {String} [返回16进制格式颜色代码]
 */
function rColor() {
	var str = '0123456789abcdef'; //15

	var res = '#';

	for (var i = 0; i < 6; i++) {
		res += str[parseInt(Math.random() * str.length)];
	}

	return res;
}

var Element = {
	/*
 	获取元素（过滤文本节点）
  */
	get: function get(nodes) {
		var res = [];

		// 遍历所有节点
		for (var i = 0; i < nodes.length; i++) {
			// 找出元素节点并写入res
			if (nodes[i].nodeType === 1) {
				res.push(nodes[i]);
			}
		}

		// 返回元素节点
		return res;
	},

	// 传入一个元素，获取它的子元素
	children: function children(ele) {
		var nodes = ele.childNodes;

		var res = [];

		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].nodeType === 1) {
				res.push(nodes[i]);
			}
		}

		return res;
	},
	// 获取前一个元素节点
	next: function next(ele) {},

	// 获取后一个元素节点
	prev: function prev(ele) {},

	// 把new 插入old的后面
	insertAfter: function insertAfter(newNode, old) {}

	// Element.get(list.childNodes);//7->3

	/**
  * [获取元素样式，兼容IE8-]
  * @param  {Element} ele [获取样式的元素]
  * @param  {String} key [css属性]
  * @return {String}     [返回key对应的属性值]
  */
};function getCss(ele, key) {
	// 思路：判断浏览器是否支持这个方法
	if (window.getComputedStyle) {
		// 标准浏览器
		return getComputedStyle(ele)[key];
	} else if (ele.currentStyle) {
		// IE8-
		return ele.currentStyle[key];
	} else {
		// 
		return ele.style[key];
	}
}

// getCss(box,'font-size');//16px

/**
 * [绑定事件函数，兼容IE8-]
 * @param  {Element}  ele       [绑定事件的元素]
 * @param  {String}  type      [事件名]
 * @param  {Function}  handler   [事件处理函数]
 * @param  {[Boolean]} isCapture [是否捕获]
 */
function bind(ele, type, handler, isCapture) {
	// 优先使用事件监听器
	if (ele.addEventListerner) {
		// 标准浏览器
		ele.addEventListerner(type, handler, isCapture);
	} else if (ele.attachEvent) {
		// IE8-
		ele.attachEvent('on' + type, handler);
	} else {
		// DOM节点绑定方式
		ele['on' + type] = handler;
	}
}

// bind(ele,'click',function(){},true);


/*
	Cookie操作
	* 增
	* 删
	* 查
	* 改
 */
var Cookie = {
	/**
  * [获取cookie]
  * @param  {String} key [cookie名]
  * @return {String}      [返回cookie自]
  */
	get: function get(key) {
		// 先获取所有cookie
		var cookies = document.cookie;
		if (cookies.length === 0) {
			return '';
		}

		// 拆分每一个cookie
		cookies = cookies.split('; ');

		for (var i = 0; i < cookies.length; i++) {
			// 拆分key,value
			var arr = cookies[i].split('=');

			if (arr[0] === key) {
				return arr[1];
			}
		}
	},

	/**
  * [设置/修改cookie]
  * @param {String} key   [cookie名]
  * @param {String} value [cookie值]
  * @param {[Date]} date  [有效期，必须为Date类型]
  * @param {[String]} path  [cookie保存路径]
  */
	set: function set(key, value, date, path) {
		var str = key + '=' + value;

		// 有效期
		if (date) {
			str += ';expires=' + date.toUTCString();
		}

		// 路径
		if (path) {
			str += ';path=' + path;
		}

		document.cookie = str;
	},

	/**
  * [删除cookie]
  * @param  {String} key [cookie名]
  * @param {[String]} path     [cookie保存的路径]
  */
	remove: function remove(key, path) {
		var d = new Date();
		d.setDate(d.getDate() - 1);

		// document.cookie = key + '=x;expires=' + d.toUTCString();
		this.set(key, 'x', d, path);
	},

	// 清空cookie
	clear: function clear() {}

	// Cookie.get('name');//laoxie
	// Cookie.set('username','lemon',date,path);//laoxie
	// Cookie.remove('username','/');


	/*function animate(ele,attr,target){
 	// 清除定时器，避免多个定时器用作于一个效果
 	clearInterval(ele.timer);
 
 	ele.timer = setInterval(()=>{
 		// 获取当前值
 		let current = getCss(ele,attr);//100px,45deg,0.5(string)
 
 		// 提取单位
 		let unit = current.match(/[a-z]+$/i);//[0:px,index:6,input:current],null
 
 		// 三元运算实现提取单位
 		unit = unit ? unit[0] : '';
 
 		// 提取值
 		current = parseFloat(current);
 
 		// 计算缓冲速度
 		let speed = (target-current)/10;//0.5=>1,-0.5=>-1
 
 
 		// 避免速度为小数
 		speed = speed>0 ? Math.ceil(speed) : Math.floor(speed);//1,-1
 
 		// 针对opacity进行操作
 		if(attr === 'opacity'){
 			speed = speed>0 ? 0.05 : -0.05;
 		}
 
 		// 根据速度改变当前值
 		current += speed;
 
 
 		// 当到达目标指时
 		if(current === target || speed === 0){
 			clearInterval(ele.timer);
 
 			// 避免超出target的范围
 			current = target;
 		}
 
 
 		ele.style[attr] = current + unit;
 	},30)
 }*/

	// opt:{width:200,height:100,top:20}
	/**
  * [动画函数]
  * @param  {Element}   ele      [动画元素]
  * @param  {Object}   opt      [动画属性]
  * @param  {Function} callback [回调函数]
  */
};function animate(ele, opt, callback) {
	// 记录动画的数量
	var timerLen = 0;

	// 遍历opt，获取所有attr和target
	for (var attr in opt) {
		timerLen++;

		createTimer(attr);
	}

	function createTimer(attr) {
		var target = opt[attr];

		// 设置定时器的名字与attr关联
		var timerName = attr + 'timer'; //widthtimer,heighttimer,toptimer


		// 清除定时器，避免多个定时器用作于一个效果
		clearInterval(ele[timerName]);

		ele[timerName] = setInterval(function () {
			// 获取当前值
			var current = getCss(ele, attr); //100px,45deg,0.5(string)

			// 提取单位
			var unit = current.match(/[a-z]+$/i); //[0:px,index:6,input:current],null

			// 三元运算实现提取单位
			unit = unit ? unit[0] : '';

			// 提取值
			current = parseFloat(current);

			// 计算缓冲速度
			var speed = (target - current) / 10; //0.5=>1,-0.5=>-1


			// 避免速度为小数
			speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed); //1,-1

			// 针对opacity进行操作
			if (attr === 'opacity') {
				speed = speed > 0 ? 0.05 : -0.05;
			}

			// 根据速度改变当前值
			current += speed;

			// 当到达目标指时
			if (current === target || speed === 0) {
				clearInterval(ele[timerName]);

				// 避免超出target的范围
				current = target;

				// 每一个动画完成数量减一
				timerLen--;

				//动画结束后执行回掉函数
				// if(timerLen===0 && typeof callback === 'function'){
				// 	callback();
				// }

				if (timerLen === 0) {
					typeof callback === 'function' && callback();
				}
			}

			ele.style[attr] = current + unit;
		}, 30);
	}
}
// animate(box,'opacity',1);
// animate(box,'opacity',0.5);


function ajax(options) {

	var defaults = {
		type: 'get', //post,put,delete,jsonp
		async: true, //异步与同步
		// data:{},
		// success:function(){}
		status: [200, 304],
		callbackName: 'callback' //jsonp请求参数
	};

	var opt = Object.assign({}, defaults, options);

	// 处理大小写
	opt.type = opt.type.toLowerCase();

	// 根据type确定参数类型
	// {page:1,qty:10}-> 'page=1&qty=10'
	var params = '';
	if (opt.data) {
		for (var key in opt.data) {
			params += key + '=' + opt.data[key] + '&';
		}

		// 清除多余&
		// page=1&qty=10& -> page=1&qty=1
		params = params.slice(0, -1);
	}

	// 请求类型判断
	// get：参数写到url
	// post:写到send()
	if (opt.type === 'get' || opt.type === 'jsonp') {
		// 判断url中是否已经存在?

		opt.url += (opt.url.indexOf('?') >= 0 ? '&' : '?') + params;

		// 清空params
		params = null;
	}

	// jsonp请求
	// 生成script标签，并传递全局函数名
	if (opt.type === 'jsonp') {
		var script;
		var fnName = 'getData' + Date.now();
		window[fnName] = function (data) {
			// 执行传如的函数
			if (typeof opt.success === 'function') {
				opt.success(data);

				// 清除script标签
				document.body.removeChild(script);
			}
		};

		// 生成script标签
		script = document.createElement('script');
		script.src = opt.url + '&' + callbackName + '=' + fnName;
		document.body.appendChild(script);

		return;
	}

	// 兼容异步请求对象
	var xhr = null;
	try {
		xhr = new XMLHttpRequest();
	} catch (error) {
		// ie低版本浏览有多种异步请求的实现
		try {
			xhr = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (err) {
			try {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				alert('你的浏览器太low了，这个世界不适合你');
			}
		}
	}

	// 此处不数据处理
	// 只返回数据
	xhr.onload = function () {
		if (opt.status.indexOf(xhr.status) >= 0) {
			var data = xhr.responseText; //json,string
			try {
				data = JSON.parse(data);
			} catch (error) {
				try {
					data = eval('(' + data + ')');
				} catch (err) {
					data = xhr.responseText;
				}
			}

			// 执行传如的函数
			if (typeof opt.success === 'function') {
				opt.success(data);
			}
		}
	};

	xhr.open(opt.type, opt.url, opt.async);

	// post,put,delete
	// 设置请求头Content-Type
	if (opt.type != 'get') {
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	}

	xhr.send(params);
}

/*
	ajax({
		url:'http://localhost:80/api/football.php?qty=10',
		type:'jsonp',//post,put,delete,jsonp
		data:{page:10},
		success:function(){}
	}).then(function(data){})
 */

/**
 * [判断数据类型函数]
 * @param  {Any} data [传入的数据]
 * @return {String}      [返回data对应的数据类型]
 */
function type(data) {
	return Object.prototype.toString.call(data).slice(8, -1).toLowerCase(); //[Object,xxx]
}
'use strict';

/*
    requirejs的配置文件 
 */
require.config({
    // baseUrl:'lib',

    // 配置别名（虚拟路径）
    paths: {
        // 格式：别名:真实路径（基于baseUrl）
        jquery: '../lib/jquery-3.2.1',
        xzoom: '../lib/jquery-xZoom/jquery.xZoom',
        xcarousel: '../lib/jquery-xcarousel/jquery.xCarousel',
        md5: '../lib/encryption/md5'
    },

    // 配置依赖
    shim: {
        xzoom: ['jquery'],
        xcarousel: ['jquery'],
        'public': ['jquery', 'common']
    }
});
'use strict';

require(['config'], function () {
    require(['jquery', 'common', 'xzoom', 'public'], function () {
        ;(function ($) {
            //获取页面元素
            var $show = $('#main .show');
            var $title = $show.find('.title');
            var $marketPrice = $show.find('.marketPrice');
            var $shopPrice = $show.find('.shopPrice');
            var $youyouPrice = $show.find('.youyouPrice');
            var $brand = $show.find('.brand');
            var $jianBtn = $show.find('.jian');
            var $jiaBtn = $show.find('.jia');
            var $counts = $('#counts');
            var $addBtn = $('#btnAdd');
            var $one = $('.one');
            var $two = $('.two');
            var $three = $('.three');
            var $left = $show.find('.left');
            var $imgColor = $show.find('.imgColor');
            var $imgMove = $addBtn.children();
            var $imgCar = $('#header i').has('img');

            //点击跳转购物车
            $imgCar.on('click', function () {
                location.href = 'car.html';
            });

            //获取参数
            var res = location.search.slice(1).split('=');
            var id = res[1];

            //当前对象
            var good = void 0;

            //获取当前用户的登陆状态
            var loginStatus = Cookie.get('loginStatus'); //''、'online'、'offline'
            //获取用户
            var username = Cookie.get('username');

            //获取当前保存购物车信息的cookie
            var goodsData = Cookie.get('goodsData');
            if (typeof goodsData === 'string' && goodsData != '') {
                goodsData = JSON.parse(goodsData);
            } else {
                goodsData = [];
            }
            // console.log(goodsData)
            //更新头部购物车的数量
            $imgCar.next().text(goodsData.length);

            //根据获取的id发ajax请求
            $.ajax({
                url: '../api/goodsDetail.php',
                data: { 'id': id },
                success: function success(data) {
                    good = JSON.parse(data)[0];

                    //根据数据生成页面数据
                    $one.text(good.classifyForshoe);
                    $two.text(good.classifyForhuman);
                    $three.text('' + good.brand + good.classifyForhuman + good.classifyForshoe + good.goodsName + ' ' + good.color);
                    $title.text('' + good.brand + good.classifyForhuman + good.classifyForshoe + good.goodsName + ' ' + good.color);
                    $marketPrice.text(good.marketPrice + '元');
                    $shopPrice.text(good.shopPrice);
                    $youyouPrice.text(good.youyouPrice);
                    $brand.text(good.brand);
                    //生成小图片
                    $imgMove.html('<img src="../img/' + good.img + '"/>');

                    //生成图片
                    $left.html('<img src="../img/' + good.img + '" data-big="../img/' + good.img + '" />');

                    //颜色图片选择
                    var $img = $('<img src="../img/' + good.img + '">');
                    $imgColor.append($img);

                    //默认选择第一个
                    $imgColor.find('img').eq(0).addClass('active');
                    $imgColor.next().find('span').eq(0).addClass('active');

                    //绑定事件 样式tab切换
                    $imgColor.on('click', 'img', function () {
                        $(this).toggleClass('active');
                    })

                    //鞋码点击选择
                    .next().on('click', 'span', function () {
                        $(this).addClass('active');
                        $(this).siblings().removeClass('active');
                    });

                    //数量选择
                    $counts.val(1); //设置默认值
                    //减少数量
                    $jianBtn.on('click', function (event) {
                        var res = $counts.val() - 1;
                        if (res < 1) {
                            res = 1;
                        }
                        $counts.val(res);
                    });
                    //增加数量
                    $jiaBtn.on('click', function (event) {
                        var res = $counts.val() * 1 + 1;
                        $counts.val(res);
                    });
                    $counts.on('change', function () {
                        if (!/^\d{1,}$/.test($counts.val())) {
                            alert('请输入正确的数量');
                            $counts.val(1);
                        }
                    });

                    //放大镜效果
                    $left.xZoom({
                        width: 402, //可视效果宽度
                        gap: 50, //间隙
                        position: 'right' //left,top,bottom,right   
                    });
                }
            });

            //点击添加购物车按钮生成cookie 并向后端发送数据保存用户的购物车信息
            $addBtn.on('click', function () {
                //设置保存时间
                var d = new Date();
                d.setDate(d.getDate() + 10000);

                //获取添加数量
                var qty = $counts.val() * 1;

                //获取当前鞋码
                var size = $imgColor.next().find('.active').text() * 1;

                //判断cookie中goodsDate中的数据是否有相同的id 有则qty+ 没则push
                var indexId = void 0; //如果存在获取当前索引值
                var indexSize = void 0;
                //判断是否有相同id
                var hasId = goodsData.some(function (g, i) {
                    if (g.id === id) {
                        indexId = i;
                    }
                    return g.id === id;
                });
                //判断有相同id的同时是否有相同尺码
                var hasSize = goodsData.some(function (g, i) {
                    return g.id === id && g.size === size;
                });
                //声明一个数组用来保存当同一个id有多个尺码 及有多个同一商品不同尺码
                var idMsg = [];
                for (var i = 0; i < goodsData.length; i++) {
                    if (goodsData[i].id === id) {
                        idMsg.push(i);
                    }
                };
                //遍历idMsg获得对应的indexSize
                for (var _i = 0; _i < idMsg.length; _i++) {
                    if (goodsData[idMsg[_i]].size === size) {
                        indexSize = idMsg[_i];
                    }
                }

                //逆向判断
                if (hasSize) {
                    //判断是否有相同size
                    goodsData[indexSize].qty = goodsData[indexSize].qty * 1 + qty;

                    //发起Ajax请求向后端发起数据 保存用户购物车信息
                    if (loginStatus === 'online') {
                        $.ajax({
                            url: '../api/userCar.php',
                            data: {
                                username: username,
                                goodId: id,
                                qty: goodsData[indexSize].qty,
                                size: size,
                                type: 'unadd'

                            }
                        });
                    }
                } else {
                    good.qty = qty; //给good添加qty属性
                    good.size = size; //给对象添加鞋码属性
                    //要深复制 上述只是引用数据类型会覆盖
                    goodsData.push(JSON.parse(JSON.stringify(good))); //添加到数组

                    //发起Ajax请求向后端发起数据 保存用户购物车信息
                    if (loginStatus === 'online') {
                        $.ajax({
                            url: '../api/userCar.php',
                            data: {
                                username: username,
                                goodId: id,
                                qty: qty,
                                size: size,
                                type: 'add'

                            }
                        });
                    }
                }

                //产生cookie或更新cookie
                Cookie.set('goodsData', JSON.stringify(goodsData), d, '/');

                //更新头部购物车的数量
                $imgCar.next().text(goodsData.length);
            })
            //点击飞入购物效果
            .on('click', function () {
                //动画效果前清除之前的动画队列 并初始化默认位置
                $imgMove.stop().css({ right: -80, top: -50 });

                $imgMove.fadeIn(200, function () {

                    $imgMove.animate({ right: -360, top: -530 }, 800, function () {

                        $imgMove.fadeOut(200, function () {

                            $imgMove.css({ right: -80, top: -50 });
                        });
                    });
                });
            });
        })(jQuery);
    });
});
'use strict';

require(['config'], function () {
    require(['jquery', 'common', 'xcarousel'], function () {

        ;(function ($) {
            $(function ($) {
                //首页轮播图
                //获取页面元素
                var $banner = $('#banner');
                var $header = $('#header');
                var $search = $header.find(':text');
                var $searchBtn = $search.next();
                var $imgCar = $('#header i').has('img');

                //点击跳转购物车 覆盖public.js的跳转
                $imgCar.on('click', function () {
                    location.href = 'html/car.html';
                });

                //获取页面屏幕大小
                var widthVisite = $(window).width();
                //通过xCarousel插件生成轮播图
                $banner.xCarousel({
                    width: widthVisite,
                    height: 700,
                    type: 'fade',
                    imgs: ['img/20161220srhdhj.jpg', 'img/20161228qlksse.jpg', 'img/20170112dexkdc.jpg', 'img/20170508rrufts.gif'],
                    seamless: true,
                    page: true
                });
                //carousel自适应
                $(window).on('resize', function () {
                    widthVisite = $(window).width();
                    $banner.html('');
                    $banner.xCarousel({
                        width: widthVisite,
                        height: 700,
                        type: 'fade',
                        imgs: ['img/20161220srhdhj.jpg', 'img/20161228qlksse.jpg', 'img/20170112dexkdc.jpg', 'img/20170508rrufts.gif'],
                        seamless: true,
                        page: true
                    });
                });

                //给搜索框绑定事件
                var text = $search.val();
                $search.on('focus', function () {
                    $search.val('');
                    $search.css('border', '1px solid blue');
                }).on('blur', function () {
                    $search.val(text);
                    $search.css('border', '1px solid #000');
                });
            });
        })(jQuery);

        //public的js
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
                        url: 'api/userLoginStatus.php',
                        data: { username: username, status: 'offline' }
                    });

                    //刷新页面          
                    location.reload();
                });
            }
        });
    });
});
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
"use strict";

require(['config'], function () {
    require(["jquery", "common", "md5", "loginStatus"], function () {

        ;(function ($) {
            $(function ($) {
                //获取页面元素
                var $username = $('#username');
                var $password = $('#password');
                var $vCodeInput = $('#vCode');
                var $vCodeShow = $vCodeInput.prev();
                var $btn = $('#btn');

                //验证码验证
                //生成随机验证码
                $vCodeShow.text(randomNumber(1000, 9999));
                //点击生成随机验证码
                $vCodeShow.on('click', function () {
                    $vCodeShow.text(randomNumber(1000, 9999));
                });
                //验证码输入是否匹配
                $vCodeInput.on('focus', function () {
                    $vCodeInput.css('border-color', 'blue');
                    $vCodeInput.next().text('*').removeClass('active');
                }).on('blur', function () {
                    var _show = $vCodeShow.text();
                    var _input = $vCodeInput.val().trim();

                    if (_show == _input) {
                        $vCodeInput.next().text('验证码确认成功').addClass('active');
                    } else {
                        $vCodeInput.next().text('验证码确认错误');
                    }
                });

                //用户名输入
                $username.on('focus', function () {
                    $username.css('border-color', 'blue');
                    $username.next().text('').removeClass('active');
                }).on('blur', function () {
                    $username.css('border-color', '#B3B3B3');
                });

                //密码输入
                $password.on('focus', function () {
                    $password.css('border-color', 'blue');
                    $password.next().text('').removeClass('active');
                }).on('blur', function () {
                    $password.css('border-color', '#B3B3B3');
                });

                //给登陆按钮绑定事件 向后端发送信息验证
                $btn.on('click', function () {
                    var _username = $username.val().trim();
                    var _password = $password.val().trim();

                    if (_username == '') {
                        $username.next().text('请输入用户名');
                        return;
                    }

                    if (_password == '') {
                        $password.next().text('请输入密码');
                        return;
                    }

                    if ($vCodeInput.val().trim() == '') {
                        $vCodeInput.next().text('请输入验证码');
                        return;
                    }
                    if (!$vCodeInput.next().hasClass('active')) {
                        return;
                    }

                    //对密码进行加密
                    _password = hex_md5(_password);

                    //发送数据进行验证
                    $.ajax({
                        url: '../api/login.php',
                        data: {
                            username: _username,
                            password: _password
                        },
                        success: function success(data) {
                            if (data == "fail_user") {
                                $username.next().text("用户名输入错误");
                            }
                            if (data == "fail_psd") {
                                $password.next().text("密码输入错误");
                            }
                            if (data == "success") {
                                //设置过期时间 //默认7天免登录
                                var d = new Date();
                                d.setDate(d.getDate() + 7);

                                //向后端发送请求 保存用户登陆状态
                                $.ajax({
                                    url: '../api/userLoginStatus.php',
                                    data: { username: _username, status: 'online' },
                                    success: function success(data) {
                                        if (data == 'success') {
                                            alert('登陆成功');

                                            $.ajax({
                                                url: '../api/userCar.php',
                                                data: {
                                                    username: _username,
                                                    type: 'get'
                                                },
                                                success: function success(data) {
                                                    console.log(data);
                                                    // 生成cookie 用来保存登陆状态
                                                    Cookie.set('loginStatus', 'online', d, '/');

                                                    // //生成cookie 用来保存用户名字
                                                    Cookie.set('username', _username, d, '/');

                                                    //生成cookie 用来保存用户的购物车信息
                                                    Cookie.set('goodsData', data, '', '/');
                                                    //默认跳转到首页
                                                    location.href = "../index.html";
                                                }
                                            });
                                        } else {
                                            alert('登陆失败');
                                        }
                                    }
                                });
                            }
                        }
                    });
                });
            });
        })(jQuery);
    });
});
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
"use strict";

require(['config'], function () {
    require(["jquery", "common", "md5", "loginStatus"], function () {

        ;(function ($) {
            $(function ($) {
                //获取页面元素
                var $username = $('#username');
                var $password = $('#password');
                var $email = $('#email');
                var $passwordSure = $('#passwordSure');
                var $psdStrong = $('.psdStrong');
                var $vCodeInput = $('#vCode');
                var $vCodeShow = $vCodeInput.prev();
                var $selected = $('#selected');
                var $btn = $('#btn');
                var $spanPsd = $psdStrong.children(); //密码强度
                //用户名验证
                $username.on('focus', function () {

                    $username.css('border-color', 'blue');
                    $username.next().text('*').removeClass('active');
                }).on('blur', function () {

                    $username.css('border-color', '#B3B3B3');
                    //获取输入的内容
                    var _username = $username.val().trim();console.log(_username);
                    //进行判断
                    if (_username.length < 3) {
                        $username.next().text('用户名不能少于3个字');
                    } else if (!/^[a-z\d]{3,18}$/i.test(_username)) {
                        $username.next().text('用户名只能是字母和数字组合，3~18个字');
                    } else {
                        $.ajax({
                            url: '../api/reg.php',
                            data: { username: _username },
                            success: function success(data) {
                                if (data == 'success') {
                                    $username.next().text('用户名合法').addClass('active');
                                } else {
                                    $username.next().text('用户名已经存在');
                                }
                            }
                        });
                    }
                });

                //邮箱验证
                $email.on('focus', function () {

                    $email.css('border-color', 'blue');
                    $email.next().text('*').removeClass('active');
                }).on('blur', function () {
                    $email.css('border-color', '#B3B3B3');
                    //获取输入的内容
                    var _email = $email.val().trim();

                    if (/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(_email)) {
                        $email.next().text('邮箱合法').addClass('active');
                    } else {
                        $email.next().text('邮箱不合法');
                    }
                });

                //密码验证
                $password.on('focus', function () {
                    $password.css('border-color', 'blue');
                    $password.next().text('*').removeClass('active');
                }).on('blur', function () {
                    $password.css('border-color', '#B3B3B3');
                    //获取输入的内容
                    var _password = $password.val().trim();

                    if (_password.length < 6) {
                        $password.next().text('请输入6位及以上密码');
                        $spanPsd.removeClass('activePsd');
                    } else {
                        if (/^[a-z0-9_-]{6,18}$/.test(_password)) {
                            $password.next().text('密码合法').addClass('active');
                        } else {
                            $password.next().text('密码不合法');
                            $spanPsd.removeClass('activePsd');
                        }
                    }
                })
                //密码强度检验
                .on('keyup', function () {

                    var _password = $password.val().trim();

                    if (_password.length < 6) {
                        return;
                    } else {
                        var _psw = _password.toUpperCase();
                        var hasNumber = false;
                        var hasLetter = false;
                        var hasSign = false;

                        for (var i = 0; i < _psw.length; i++) {
                            if (!isNaN(_psw[i])) {
                                hasNumber = true;
                            } else {
                                if (_psw.charCodeAt(i) >= 65 && _psw.charCodeAt(i) <= 90) {
                                    hasLetter = true;
                                } else {
                                    hasSign = true;
                                }
                            }
                        }

                        $spanPsd.removeClass('activePsd');

                        if (hasSign && (hasLetter || hasNumber)) {
                            $spanPsd.addClass('activePsd');
                        } else if (hasLetter && hasNumber) {
                            $spanPsd.last().siblings().addClass('activePsd');
                        } else if (hasSign || hasLetter || hasNumber) {
                            $spanPsd.first().addClass('activePsd');
                        } else {
                            $spanPsd.removeClass('activePsd');
                        }
                    }
                });

                //确认密码验证
                $passwordSure.on('focus', function () {
                    $passwordSure.css('border-color', 'blue');
                    $passwordSure.next().text('*').removeClass('active');
                }).on('blur', function () {
                    if (!$password.next().hasClass('active')) return;

                    var _password = $password.val().trim();
                    var _passwordSure = $passwordSure.val().trim();

                    if (_password == _passwordSure) {
                        $passwordSure.next().text('密码确认成功').addClass('active');
                    } else {
                        $passwordSure.next().text('密码确认错误');
                    }
                });

                //验证码验证
                //生成随机验证码
                $vCodeShow.text(randomNumber(1000, 9999));
                //点击生成随机验证码
                $vCodeShow.on('click', function () {
                    $vCodeShow.text(randomNumber(1000, 9999));
                });
                //验证码输入是否匹配
                $vCodeInput.on('focus', function () {
                    $vCodeInput.css('border-color', 'blue');
                    $vCodeInput.next().text('*').removeClass('active');
                }).on('blur', function () {
                    var _show = $vCodeShow.text();
                    var _input = $vCodeInput.val().trim();

                    if (_show == _input) {
                        $vCodeInput.next().text('验证码确认成功').addClass('active');
                    } else {
                        $vCodeInput.next().text('验证码确认错误');
                    }
                });

                //验证所有信息是否正确发送到数据库
                $btn.on('click', function () {

                    if (!$username.next().hasClass('active')) {
                        $username.next().text('请填写用户名');
                        return;
                    }

                    if (!$password.next().hasClass('active')) {
                        $password.next().text('请填写密码');
                        return;
                    }

                    if (!$email.next().hasClass('active')) {
                        $email.next().text('请填写邮箱');
                        return;
                    }

                    if (!$passwordSure.next().hasClass('active')) {
                        $passwordSure.next().text('请确认密码');
                        return;
                    }

                    if (!$vCodeInput.next().hasClass('active')) {
                        $vCodeInput.next().text('请填写验证码');
                        return;
                    }

                    if (!$selected.prop('checked')) {
                        alert('请勾选同意框');
                        return;
                    }

                    //所有条件匹配将信息发送数据库保存
                    var _username = $username.val().trim();
                    var _email = $email.val().trim();
                    var _password = $password.val().trim();

                    //对密码进行加密
                    _password = hex_md5(_password);

                    //发送数据
                    $.ajax({
                        url: '../api/reg.php',
                        data: {
                            password: _password,
                            username: _username,
                            email: _email,
                            type: 'reg'
                        },
                        success: function success(data) {
                            if (data == 'success') {
                                alert('注册成功');
                                //设置过期时间 //默认7天免登录
                                var d = new Date();
                                d.setDate(d.getDate() + 7);

                                //向后端发送请求 保存用户登陆状态
                                $.ajax({
                                    url: '../api/userLoginStatus.php',
                                    data: { username: _username, status: 'online' },
                                    success: function success(data) {
                                        console.log(data);
                                        if (data == 'success') {
                                            //生成cookie 用来保存登陆状态
                                            Cookie.set('loginStatus', 'online', d, '/');
                                            //生成cookie 用来保存用户名字
                                            Cookie.set('username', _username, d, '/');
                                            //默认跳转到首页
                                            location.href = '../index.html';
                                        } else {
                                            alert('登陆失败');
                                        }
                                    }
                                });
                            } else {

                                alert('注册失败');
                            }
                        }
                    });
                });
            });
        })(jQuery);
    });
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.3.5 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, https://github.com/requirejs/requirejs/blob/master/LICENSE
 */
//Not using strict: uneven strict support in browsers, #392, and causes
//problems with requirejs.exec()/transpiler plugins that may not be strict.
/*jslint regexp: true, nomen: true, sloppy: true */
/*global window, navigator, document, importScripts, setTimeout, opera */

var requirejs, _require, define;
(function (global, setTimeout) {
    var req,
        s,
        head,
        baseElement,
        dataMain,
        src,
        interactiveScript,
        currentlyAddingScript,
        mainScript,
        subPath,
        version = '2.3.5',
        commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        jsSuffixRegExp = /\.js$/,
        currDirRegExp = /^\.\//,
        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,
        isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document),
        isWebWorker = !isBrowser && typeof importScripts !== 'undefined',

    //PS3 indicates loaded and complete, but need to wait for complete
    //specifically. Sequence is 'loading', 'loaded', execution,
    // then 'complete'. The UA check is unfortunate, but not sure how
    //to feature test w/o causing perf issues.
    readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ? /^complete$/ : /^(complete|loaded)$/,
        defContextName = '_',

    //Oh the tragedy, detecting opera. See the usage of isOpera for reason.
    isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
        contexts = {},
        cfg = {},
        globalDefQueue = [],
        useInteractive = false;

    //Could match something like ')//comment', do not lose the prefix to comment.
    function commentReplace(match, singlePrefix) {
        return singlePrefix || '';
    }

    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }

    /**
     * Helper function for iterating over an array. If the func returns
     * a true value, it will break out of the loop.
     */
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    /**
     * Helper function for iterating over an array backwards. If the func
     * returns a true value, it will break out of the loop.
     */
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }

    /**
     * Cycles over properties in an object and calls a function for each
     * property value. If the function returns a truthy value, then the
     * iteration is stopped.
     */
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     */
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value && !isArray(value) && !isFunction(value) && !(value instanceof RegExp)) {

                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }

    //Similar to Function.prototype.bind, but the 'this' object is specified
    //first, since it is easier to read/figure out what 'this' will be.
    function bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }

    function scripts() {
        return document.getElementsByTagName('script');
    }

    function defaultOnError(err) {
        throw err;
    }

    //Allow getting a global that is expressed in
    //dot notation, like 'a.b.c'.
    function getGlobal(value) {
        if (!value) {
            return value;
        }
        var g = global;
        each(value.split('.'), function (part) {
            g = g[part];
        });
        return g;
    }

    /**
     * Constructs an error with a pointer to an URL with more information.
     * @param {String} id the error ID that maps to an ID on a web page.
     * @param {String} message human readable error.
     * @param {Error} [err] the original error, if there is one.
     *
     * @returns {Error}
     */
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.originalError = err;
        }
        return e;
    }

    if (typeof define !== 'undefined') {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    if (typeof requirejs !== 'undefined') {
        if (isFunction(requirejs)) {
            //Do not overwrite an existing requirejs instance.
            return;
        }
        cfg = requirejs;
        requirejs = undefined;
    }

    //Allow for a require config object
    if (typeof _require !== 'undefined' && !isFunction(_require)) {
        //assume it is a config object.
        cfg = _require;
        _require = undefined;
    }

    function newContext(contextName) {
        var inCheckLoaded,
            Module,
            context,
            handlers,
            checkLoadedTimeoutId,
            _config = {
            //Defaults. Do not set a default for map
            //config to speed up normalize(), which
            //will run faster if there is no default.
            waitSeconds: 7,
            baseUrl: './',
            paths: {},
            bundles: {},
            pkgs: {},
            shim: {},
            config: {}
        },
            registry = {},

        //registry of just enabled modules, to speed
        //cycle breaking code when lots of modules
        //are registered, but not activated.
        enabledRegistry = {},
            undefEvents = {},
            defQueue = [],
            _defined = {},
            urlFetched = {},
            bundlesMap = {},
            requireCounter = 1,
            unnormalizedCounter = 1;

        /**
         * Trims the . and .. from an array of path segments.
         * It will keep a leading path segment if a .. will become
         * the first path segment, to help with module name lookups,
         * which act like paths, but can be remapped. But the end result,
         * all paths that use this function should look normalized.
         * NOTE: this method MODIFIES the input array.
         * @param {Array} ary the array of path segments.
         */
        function trimDots(ary) {
            var i, part;
            for (i = 0; i < ary.length; i++) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || i === 1 && ary[2] === '..' || ary[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }

        /**
         * Given a relative module name, like ./something, normalize it to
         * a real name that can be mapped to a path.
         * @param {String} name the relative name
         * @param {String} baseName a real name that the name arg is relative
         * to.
         * @param {Boolean} applyMap apply the map config to the value. Should
         * only be done if this normalization is for a dependency ID.
         * @returns {String} normalized name
         */
        function normalize(name, baseName, applyMap) {
            var pkgMain,
                mapValue,
                nameParts,
                i,
                j,
                nameSegment,
                lastIndex,
                foundMap,
                foundI,
                foundStarMap,
                starI,
                normalizedBaseParts,
                baseParts = baseName && baseName.split('/'),
                map = _config.map,
                starMap = map && map['*'];

            //Adjust any relative paths.
            if (name) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // If wanting node ID compatibility, strip .js from end
                // of IDs. Have to do this here, and not in nameToUrl
                // because node allows either .js or non .js to map
                // to same file.
                if (_config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                // Starts with a '.' so need the baseName
                if (name[0].charAt(0) === '.' && baseParts) {
                    //Convert baseName to array, and lop off the last part,
                    //so that . matches that 'directory' and not name of the baseName's
                    //module. For instance, baseName of 'one/two/three', maps to
                    //'one/two/three.js', but we want the directory, 'one/two' for
                    //this normalization.
                    normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                    name = normalizedBaseParts.concat(name);
                }

                trimDots(name);
                name = name.join('/');
            }

            //Apply map config if available.
            if (applyMap && map && (baseParts || starMap)) {
                nameParts = name.split('/');

                outerLoop: for (i = nameParts.length; i > 0; i -= 1) {
                    nameSegment = nameParts.slice(0, i).join('/');

                    if (baseParts) {
                        //Find the longest baseName segment match in the config.
                        //So, do joins on the biggest to smallest lengths of baseParts.
                        for (j = baseParts.length; j > 0; j -= 1) {
                            mapValue = getOwn(map, baseParts.slice(0, j).join('/'));

                            //baseName segment has config, find if it has one for
                            //this name.
                            if (mapValue) {
                                mapValue = getOwn(mapValue, nameSegment);
                                if (mapValue) {
                                    //Match, update name to the new value.
                                    foundMap = mapValue;
                                    foundI = i;
                                    break outerLoop;
                                }
                            }
                        }
                    }

                    //Check for a star map match, but just hold on to it,
                    //if there is a shorter segment match later in a matching
                    //config, then favor over this star map.
                    if (!foundStarMap && starMap && getOwn(starMap, nameSegment)) {
                        foundStarMap = getOwn(starMap, nameSegment);
                        starI = i;
                    }
                }

                if (!foundMap && foundStarMap) {
                    foundMap = foundStarMap;
                    foundI = starI;
                }

                if (foundMap) {
                    nameParts.splice(0, foundI, foundMap);
                    name = nameParts.join('/');
                }
            }

            // If the name points to a package's name, use
            // the package main instead.
            pkgMain = getOwn(_config.pkgs, name);

            return pkgMain ? pkgMain : name;
        }

        function removeScript(name) {
            if (isBrowser) {
                each(scripts(), function (scriptNode) {
                    if (scriptNode.getAttribute('data-requiremodule') === name && scriptNode.getAttribute('data-requirecontext') === context.contextName) {
                        scriptNode.parentNode.removeChild(scriptNode);
                        return true;
                    }
                });
            }
        }

        function hasPathFallback(id) {
            var pathConfig = getOwn(_config.paths, id);
            if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
                //Pop off the first array value, since it failed, and
                //retry
                pathConfig.shift();
                context.require.undef(id);

                //Custom require that does not do map translation, since
                //ID is "absolute", already mapped/resolved.
                context.makeRequire(null, {
                    skipMap: true
                })([id]);

                return true;
            }
        }

        //Turns a plugin!resource to [plugin, resource]
        //with the plugin being undefined if the name
        //did not have a plugin prefix.
        function splitPrefix(name) {
            var prefix,
                index = name ? name.indexOf('!') : -1;
            if (index > -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }
            return [prefix, name];
        }

        /**
         * Creates a module mapping that includes plugin prefix, module
         * name, and path. If parentModuleMap is provided it will
         * also normalize the name via require.normalize()
         *
         * @param {String} name the module name
         * @param {String} [parentModuleMap] parent module map
         * for the module name, used to resolve relative names.
         * @param {Boolean} isNormalized: is the ID already normalized.
         * This is true if this call is done for a define() module ID.
         * @param {Boolean} applyMap: apply the map config to the ID.
         * Should only be true if this map is for a dependency.
         *
         * @returns {Object}
         */
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var url,
                pluginModule,
                suffix,
                nameParts,
                prefix = null,
                parentName = parentModuleMap ? parentModuleMap.name : null,
                originalName = name,
                isDefine = true,
                normalizedName = '';

            //If no name, then it means it is a require call, generate an
            //internal name.
            if (!name) {
                isDefine = false;
                name = '_@r' + (requireCounter += 1);
            }

            nameParts = splitPrefix(name);
            prefix = nameParts[0];
            name = nameParts[1];

            if (prefix) {
                prefix = normalize(prefix, parentName, applyMap);
                pluginModule = getOwn(_defined, prefix);
            }

            //Account for relative paths if there is a base name.
            if (name) {
                if (prefix) {
                    if (isNormalized) {
                        normalizedName = name;
                    } else if (pluginModule && pluginModule.normalize) {
                        //Plugin is loaded, use its normalize method.
                        normalizedName = pluginModule.normalize(name, function (name) {
                            return normalize(name, parentName, applyMap);
                        });
                    } else {
                        // If nested plugin references, then do not try to
                        // normalize, as it will not normalize correctly. This
                        // places a restriction on resourceIds, and the longer
                        // term solution is not to normalize until plugins are
                        // loaded and all normalizations to allow for async
                        // loading of a loader plugin. But for now, fixes the
                        // common uses. Details in #1131
                        normalizedName = name.indexOf('!') === -1 ? normalize(name, parentName, applyMap) : name;
                    }
                } else {
                    //A regular module.
                    normalizedName = normalize(name, parentName, applyMap);

                    //Normalized name may be a plugin ID due to map config
                    //application in normalize. The map config values must
                    //already be normalized, so do not need to redo that part.
                    nameParts = splitPrefix(normalizedName);
                    prefix = nameParts[0];
                    normalizedName = nameParts[1];
                    isNormalized = true;

                    url = context.nameToUrl(normalizedName);
                }
            }

            //If the id is a plugin id that cannot be determined if it needs
            //normalization, stamp it with a unique ID so two matching relative
            //ids that may conflict can be separate.
            suffix = prefix && !pluginModule && !isNormalized ? '_unnormalized' + (unnormalizedCounter += 1) : '';

            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ? prefix + '!' + normalizedName : normalizedName) + suffix
            };
        }

        function getModule(depMap) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }

            return mod;
        }

        function on(depMap, name, fn) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (hasProp(_defined, id) && (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(_defined[id]);
                }
            } else {
                mod = getModule(depMap);
                if (mod.error && name === 'error') {
                    fn(mod.error);
                } else {
                    mod.on(name, fn);
                }
            }
        }

        function onError(err, errback) {
            var ids = err.requireModules,
                notified = false;

            if (errback) {
                errback(err);
            } else {
                each(ids, function (id) {
                    var mod = getOwn(registry, id);
                    if (mod) {
                        //Set error on module, so it skips timeout checks.
                        mod.error = err;
                        if (mod.events.error) {
                            notified = true;
                            mod.emit('error', err);
                        }
                    }
                });

                if (!notified) {
                    req.onError(err);
                }
            }
        }

        /**
         * Internal method to transfer globalQueue items to this context's
         * defQueue.
         */
        function takeGlobalQueue() {
            //Push all the globalDefQueue items into the context's defQueue
            if (globalDefQueue.length) {
                each(globalDefQueue, function (queueItem) {
                    var id = queueItem[0];
                    if (typeof id === 'string') {
                        context.defQueueMap[id] = true;
                    }
                    defQueue.push(queueItem);
                });
                globalDefQueue = [];
            }
        }

        handlers = {
            'require': function require(mod) {
                if (mod.require) {
                    return mod.require;
                } else {
                    return mod.require = context.makeRequire(mod.map);
                }
            },
            'exports': function exports(mod) {
                mod.usingExports = true;
                if (mod.map.isDefine) {
                    if (mod.exports) {
                        return _defined[mod.map.id] = mod.exports;
                    } else {
                        return mod.exports = _defined[mod.map.id] = {};
                    }
                }
            },
            'module': function module(mod) {
                if (mod.module) {
                    return mod.module;
                } else {
                    return mod.module = {
                        id: mod.map.id,
                        uri: mod.map.url,
                        config: function config() {
                            return getOwn(_config.config, mod.map.id) || {};
                        },
                        exports: mod.exports || (mod.exports = {})
                    };
                }
            }
        };

        function cleanRegistry(id) {
            //Clean up machinery used for waiting modules.
            delete registry[id];
            delete enabledRegistry[id];
        }

        function breakCycle(mod, traced, processed) {
            var id = mod.map.id;

            if (mod.error) {
                mod.emit('error', mod.error);
            } else {
                traced[id] = true;
                each(mod.depMaps, function (depMap, i) {
                    var depId = depMap.id,
                        dep = getOwn(registry, depId);

                    //Only force things that have not completed
                    //being defined, so still in the registry,
                    //and only if it has not been matched up
                    //in the module already.
                    if (dep && !mod.depMatched[i] && !processed[depId]) {
                        if (getOwn(traced, depId)) {
                            mod.defineDep(i, _defined[depId]);
                            mod.check(); //pass false?
                        } else {
                            breakCycle(dep, traced, processed);
                        }
                    }
                });
                processed[id] = true;
            }
        }

        function checkLoaded() {
            var err,
                usingPathFallback,
                waitInterval = _config.waitSeconds * 1000,

            //It is possible to disable the wait interval by using waitSeconds of 0.
            expired = waitInterval && context.startTime + waitInterval < new Date().getTime(),
                noLoads = [],
                reqCalls = [],
                stillLoading = false,
                needCycleCheck = true;

            //Do not bother if this call was a result of a cycle break.
            if (inCheckLoaded) {
                return;
            }

            inCheckLoaded = true;

            //Figure out the state of all the modules.
            eachProp(enabledRegistry, function (mod) {
                var map = mod.map,
                    modId = map.id;

                //Skip things that are not enabled or in error state.
                if (!mod.enabled) {
                    return;
                }

                if (!map.isDefine) {
                    reqCalls.push(mod);
                }

                if (!mod.error) {
                    //If the module should be executed, and it has not
                    //been inited and time is up, remember it.
                    if (!mod.inited && expired) {
                        if (hasPathFallback(modId)) {
                            usingPathFallback = true;
                            stillLoading = true;
                        } else {
                            noLoads.push(modId);
                            removeScript(modId);
                        }
                    } else if (!mod.inited && mod.fetched && map.isDefine) {
                        stillLoading = true;
                        if (!map.prefix) {
                            //No reason to keep looking for unfinished
                            //loading. If the only stillLoading is a
                            //plugin resource though, keep going,
                            //because it may be that a plugin resource
                            //is waiting on a non-plugin cycle.
                            return needCycleCheck = false;
                        }
                    }
                }
            });

            if (expired && noLoads.length) {
                //If wait time expired, throw error of unloaded modules.
                err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
                err.contextName = context.contextName;
                return onError(err);
            }

            //Not expired, check for a cycle.
            if (needCycleCheck) {
                each(reqCalls, function (mod) {
                    breakCycle(mod, {}, {});
                });
            }

            //If still waiting on loads, and the waiting load is something
            //other than a plugin resource, or there are still outstanding
            //scripts, then just try back later.
            if ((!expired || usingPathFallback) && stillLoading) {
                //Something is still waiting to load. Wait for it, but only
                //if a timeout is not already in effect.
                if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                    }, 50);
                }
            }

            inCheckLoaded = false;
        }

        Module = function Module(map) {
            this.events = getOwn(undefEvents, map.id) || {};
            this.map = map;
            this.shim = getOwn(_config.shim, map.id);
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0;

            /* this.exports this.factory
               this.depMaps = [],
               this.enabled, this.fetched
            */
        };

        Module.prototype = {
            init: function init(depMaps, factory, errback, options) {
                options = options || {};

                //Do not do more inits if already done. Can happen if there
                //are multiple define calls for the same module. That is not
                //a normal, common case, but it is also not unexpected.
                if (this.inited) {
                    return;
                }

                this.factory = factory;

                if (errback) {
                    //Register for errors on this module.
                    this.on('error', errback);
                } else if (this.events.error) {
                    //If no errback already, but there are error listeners
                    //on this module, set up an errback to pass to the deps.
                    errback = bind(this, function (err) {
                        this.emit('error', err);
                    });
                }

                //Do a copy of the dependency array, so that
                //source inputs are not modified. For example
                //"shim" deps are passed in here directly, and
                //doing a direct modification of the depMaps array
                //would affect that config.
                this.depMaps = depMaps && depMaps.slice(0);

                this.errback = errback;

                //Indicate this module has be initialized
                this.inited = true;

                this.ignore = options.ignore;

                //Could have option to init this module in enabled mode,
                //or could have been previously marked as enabled. However,
                //the dependencies are not known until init is called. So
                //if enabled previously, now trigger dependencies as enabled.
                if (options.enabled || this.enabled) {
                    //Enable this module and dependencies.
                    //Will call this.check()
                    this.enable();
                } else {
                    this.check();
                }
            },

            defineDep: function defineDep(i, depExports) {
                //Because of cycles, defined callback for a given
                //export can be called more than once.
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true;
                    this.depCount -= 1;
                    this.depExports[i] = depExports;
                }
            },

            fetch: function fetch() {
                if (this.fetched) {
                    return;
                }
                this.fetched = true;

                context.startTime = new Date().getTime();

                var map = this.map;

                //If the manager is for a plugin managed resource,
                //ask the plugin to load it now.
                if (this.shim) {
                    context.makeRequire(this.map, {
                        enableBuildCallback: true
                    })(this.shim.deps || [], bind(this, function () {
                        return map.prefix ? this.callPlugin() : this.load();
                    }));
                } else {
                    //Regular dependency.
                    return map.prefix ? this.callPlugin() : this.load();
                }
            },

            load: function load() {
                var url = this.map.url;

                //Regular dependency.
                if (!urlFetched[url]) {
                    urlFetched[url] = true;
                    context.load(this.map.id, url);
                }
            },

            /**
             * Checks if the module is ready to define itself, and if so,
             * define it.
             */
            check: function check() {
                if (!this.enabled || this.enabling) {
                    return;
                }

                var err,
                    cjsModule,
                    id = this.map.id,
                    depExports = this.depExports,
                    exports = this.exports,
                    factory = this.factory;

                if (!this.inited) {
                    // Only fetch if not already in the defQueue.
                    if (!hasProp(context.defQueueMap, id)) {
                        this.fetch();
                    }
                } else if (this.error) {
                    this.emit('error', this.error);
                } else if (!this.defining) {
                    //The factory could trigger another require call
                    //that would result in checking this module to
                    //define itself again. If already in the process
                    //of doing that, skip this work.
                    this.defining = true;

                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            //If there is an error listener, favor passing
                            //to that instead of throwing an error. However,
                            //only do it for define()'d  modules. require
                            //errbacks should not be called for failures in
                            //their callbacks (#699). However if a global
                            //onError is set, use that.
                            if (this.events.error && this.map.isDefine || req.onError !== defaultOnError) {
                                try {
                                    exports = context.execCb(id, factory, depExports, exports);
                                } catch (e) {
                                    err = e;
                                }
                            } else {
                                exports = context.execCb(id, factory, depExports, exports);
                            }

                            // Favor return value over exports. If node/cjs in play,
                            // then will not have a return value anyway. Favor
                            // module.exports assignment over exports object.
                            if (this.map.isDefine && exports === undefined) {
                                cjsModule = this.module;
                                if (cjsModule) {
                                    exports = cjsModule.exports;
                                } else if (this.usingExports) {
                                    //exports already set the defined value.
                                    exports = this.exports;
                                }
                            }

                            if (err) {
                                err.requireMap = this.map;
                                err.requireModules = this.map.isDefine ? [this.map.id] : null;
                                err.requireType = this.map.isDefine ? 'define' : 'require';
                                return onError(this.error = err);
                            }
                        } else {
                            //Just a literal value
                            exports = factory;
                        }

                        this.exports = exports;

                        if (this.map.isDefine && !this.ignore) {
                            _defined[id] = exports;

                            if (req.onResourceLoad) {
                                var resLoadMaps = [];
                                each(this.depMaps, function (depMap) {
                                    resLoadMaps.push(depMap.normalizedMap || depMap);
                                });
                                req.onResourceLoad(context, this.map, resLoadMaps);
                            }
                        }

                        //Clean up
                        cleanRegistry(id);

                        this.defined = true;
                    }

                    //Finished the define stage. Allow calling check again
                    //to allow define notifications below in the case of a
                    //cycle.
                    this.defining = false;

                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true;
                        this.emit('defined', this.exports);
                        this.defineEmitComplete = true;
                    }
                }
            },

            callPlugin: function callPlugin() {
                var map = this.map,
                    id = map.id,

                //Map already normalized the prefix.
                pluginMap = makeModuleMap(map.prefix);

                //Mark this as a dependency for this plugin, so it
                //can be traced for cycles.
                this.depMaps.push(pluginMap);

                on(pluginMap, 'defined', bind(this, function (plugin) {
                    var load,
                        normalizedMap,
                        normalizedMod,
                        bundleId = getOwn(bundlesMap, this.map.id),
                        name = this.map.name,
                        parentName = this.map.parentMap ? this.map.parentMap.name : null,
                        localRequire = context.makeRequire(map.parentMap, {
                        enableBuildCallback: true
                    });

                    //If current map is not normalized, wait for that
                    //normalized name to load instead of continuing.
                    if (this.map.unnormalized) {
                        //Normalize the ID if the plugin allows it.
                        if (plugin.normalize) {
                            name = plugin.normalize(name, function (name) {
                                return normalize(name, parentName, true);
                            }) || '';
                        }

                        //prefix and name should already be normalized, no need
                        //for applying map config again either.
                        normalizedMap = makeModuleMap(map.prefix + '!' + name, this.map.parentMap, true);
                        on(normalizedMap, 'defined', bind(this, function (value) {
                            this.map.normalizedMap = normalizedMap;
                            this.init([], function () {
                                return value;
                            }, null, {
                                enabled: true,
                                ignore: true
                            });
                        }));

                        normalizedMod = getOwn(registry, normalizedMap.id);
                        if (normalizedMod) {
                            //Mark this as a dependency for this plugin, so it
                            //can be traced for cycles.
                            this.depMaps.push(normalizedMap);

                            if (this.events.error) {
                                normalizedMod.on('error', bind(this, function (err) {
                                    this.emit('error', err);
                                }));
                            }
                            normalizedMod.enable();
                        }

                        return;
                    }

                    //If a paths config, then just load that file instead to
                    //resolve the plugin, as it is built into that paths layer.
                    if (bundleId) {
                        this.map.url = context.nameToUrl(bundleId);
                        this.load();
                        return;
                    }

                    load = bind(this, function (value) {
                        this.init([], function () {
                            return value;
                        }, null, {
                            enabled: true
                        });
                    });

                    load.error = bind(this, function (err) {
                        this.inited = true;
                        this.error = err;
                        err.requireModules = [id];

                        //Remove temp unnormalized modules for this module,
                        //since they will never be resolved otherwise now.
                        eachProp(registry, function (mod) {
                            if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
                                cleanRegistry(mod.map.id);
                            }
                        });

                        onError(err);
                    });

                    //Allow plugins to load other code without having to know the
                    //context or how to 'complete' the load.
                    load.fromText = bind(this, function (text, textAlt) {
                        /*jslint evil: true */
                        var moduleName = map.name,
                            moduleMap = makeModuleMap(moduleName),
                            hasInteractive = useInteractive;

                        //As of 2.1.0, support just passing the text, to reinforce
                        //fromText only being called once per resource. Still
                        //support old style of passing moduleName but discard
                        //that moduleName in favor of the internal ref.
                        if (textAlt) {
                            text = textAlt;
                        }

                        //Turn off interactive script matching for IE for any define
                        //calls in the text, then turn it back on at the end.
                        if (hasInteractive) {
                            useInteractive = false;
                        }

                        //Prime the system by creating a module instance for
                        //it.
                        getModule(moduleMap);

                        //Transfer any config to this other module.
                        if (hasProp(_config.config, id)) {
                            _config.config[moduleName] = _config.config[id];
                        }

                        try {
                            req.exec(text);
                        } catch (e) {
                            return onError(makeError('fromtexteval', 'fromText eval for ' + id + ' failed: ' + e, e, [id]));
                        }

                        if (hasInteractive) {
                            useInteractive = true;
                        }

                        //Mark this as a dependency for the plugin
                        //resource
                        this.depMaps.push(moduleMap);

                        //Support anonymous modules.
                        context.completeLoad(moduleName);

                        //Bind the value of that module to the value for this
                        //resource ID.
                        localRequire([moduleName], load);
                    });

                    //Use parentName here since the plugin's name is not reliable,
                    //could be some weird string with no path that actually wants to
                    //reference the parentName's path.
                    plugin.load(map.name, localRequire, load, _config);
                }));

                context.enable(pluginMap, this);
                this.pluginMaps[pluginMap.id] = pluginMap;
            },

            enable: function enable() {
                enabledRegistry[this.map.id] = this;
                this.enabled = true;

                //Set flag mentioning that the module is enabling,
                //so that immediate calls to the defined callbacks
                //for dependencies do not trigger inadvertent load
                //with the depCount still being zero.
                this.enabling = true;

                //Enable each dependency
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler;

                    if (typeof depMap === 'string') {
                        //Dependency needs to be converted to a depMap
                        //and wired up to this module.
                        depMap = makeModuleMap(depMap, this.map.isDefine ? this.map : this.map.parentMap, false, !this.skipMap);
                        this.depMaps[i] = depMap;

                        handler = getOwn(handlers, depMap.id);

                        if (handler) {
                            this.depExports[i] = handler(this);
                            return;
                        }

                        this.depCount += 1;

                        on(depMap, 'defined', bind(this, function (depExports) {
                            if (this.undefed) {
                                return;
                            }
                            this.defineDep(i, depExports);
                            this.check();
                        }));

                        if (this.errback) {
                            on(depMap, 'error', bind(this, this.errback));
                        } else if (this.events.error) {
                            // No direct errback on this module, but something
                            // else is listening for errors, so be sure to
                            // propagate the error correctly.
                            on(depMap, 'error', bind(this, function (err) {
                                this.emit('error', err);
                            }));
                        }
                    }

                    id = depMap.id;
                    mod = registry[id];

                    //Skip special modules like 'require', 'exports', 'module'
                    //Also, don't call enable if it is already enabled,
                    //important in circular dependency cases.
                    if (!hasProp(handlers, id) && mod && !mod.enabled) {
                        context.enable(depMap, this);
                    }
                }));

                //Enable each plugin that is used in
                //a dependency
                eachProp(this.pluginMaps, bind(this, function (pluginMap) {
                    var mod = getOwn(registry, pluginMap.id);
                    if (mod && !mod.enabled) {
                        context.enable(pluginMap, this);
                    }
                }));

                this.enabling = false;

                this.check();
            },

            on: function on(name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },

            emit: function emit(name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt);
                });
                if (name === 'error') {
                    //Now that the error handler was triggered, remove
                    //the listeners, since this broken Module instance
                    //can stay around for a while in the registry.
                    delete this.events[name];
                }
            }
        };

        function callGetModule(args) {
            //Skip modules already defined.
            if (!hasProp(_defined, args[0])) {
                getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
            }
        }

        function removeListener(node, func, name, ieName) {
            //Favor detachEvent because of IE9
            //issue, see attachEvent/addEventListener comment elsewhere
            //in this file.
            if (node.detachEvent && !isOpera) {
                //Probably IE. If not it will throw an error, which will be
                //useful to know.
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            } else {
                node.removeEventListener(name, func, false);
            }
        }

        /**
         * Given an event from a script node, get the requirejs info from it,
         * and then removes the event listeners on the node.
         * @param {Event} evt
         * @returns {Object}
         */
        function getScriptData(evt) {
            //Using currentTarget instead of target for Firefox 2.0's sake. Not
            //all old browsers will be supported, but this one was easy enough
            //to support and still makes sense.
            var node = evt.currentTarget || evt.srcElement;

            //Remove the listeners once here.
            removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
            removeListener(node, context.onScriptError, 'error');

            return {
                node: node,
                id: node && node.getAttribute('data-requiremodule')
            };
        }

        function intakeDefines() {
            var args;

            //Any defined modules in the global queue, intake them now.
            takeGlobalQueue();

            //Make sure any remaining defQueue items get properly processed.
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' + args[args.length - 1]));
                } else {
                    //args are id, deps, factory. Should be normalized by the
                    //define() function.
                    callGetModule(args);
                }
            }
            context.defQueueMap = {};
        }

        context = {
            config: _config,
            contextName: contextName,
            registry: registry,
            defined: _defined,
            urlFetched: urlFetched,
            defQueue: defQueue,
            defQueueMap: {},
            Module: Module,
            makeModuleMap: makeModuleMap,
            nextTick: req.nextTick,
            onError: onError,

            /**
             * Set a configuration for the context.
             * @param {Object} cfg config object to integrate.
             */
            configure: function configure(cfg) {
                //Make sure the baseUrl ends in a slash.
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
                        cfg.baseUrl += '/';
                    }
                }

                // Convert old style urlArgs string to a function.
                if (typeof cfg.urlArgs === 'string') {
                    var urlArgs = cfg.urlArgs;
                    cfg.urlArgs = function (id, url) {
                        return (url.indexOf('?') === -1 ? '?' : '&') + urlArgs;
                    };
                }

                //Save off the paths since they require special processing,
                //they are additive.
                var shim = _config.shim,
                    objs = {
                    paths: true,
                    bundles: true,
                    config: true,
                    map: true
                };

                eachProp(cfg, function (value, prop) {
                    if (objs[prop]) {
                        if (!_config[prop]) {
                            _config[prop] = {};
                        }
                        mixin(_config[prop], value, true, true);
                    } else {
                        _config[prop] = value;
                    }
                });

                //Reverse map the bundles
                if (cfg.bundles) {
                    eachProp(cfg.bundles, function (value, prop) {
                        each(value, function (v) {
                            if (v !== prop) {
                                bundlesMap[v] = prop;
                            }
                        });
                    });
                }

                //Merge shim
                if (cfg.shim) {
                    eachProp(cfg.shim, function (value, id) {
                        //Normalize the structure
                        if (isArray(value)) {
                            value = {
                                deps: value
                            };
                        }
                        if ((value.exports || value.init) && !value.exportsFn) {
                            value.exportsFn = context.makeShimExports(value);
                        }
                        shim[id] = value;
                    });
                    _config.shim = shim;
                }

                //Adjust packages if necessary.
                if (cfg.packages) {
                    each(cfg.packages, function (pkgObj) {
                        var location, name;

                        pkgObj = typeof pkgObj === 'string' ? { name: pkgObj } : pkgObj;

                        name = pkgObj.name;
                        location = pkgObj.location;
                        if (location) {
                            _config.paths[name] = pkgObj.location;
                        }

                        //Save pointer to main module ID for pkg name.
                        //Remove leading dot in main, so main paths are normalized,
                        //and remove any trailing .js, since different package
                        //envs have different conventions: some use a module name,
                        //some use a file name.
                        _config.pkgs[name] = pkgObj.name + '/' + (pkgObj.main || 'main').replace(currDirRegExp, '').replace(jsSuffixRegExp, '');
                    });
                }

                //If there are any "waiting to execute" modules in the registry,
                //update the maps for them, since their info, like URLs to load,
                //may have changed.
                eachProp(registry, function (mod, id) {
                    //If module already has init called, since it is too
                    //late to modify them, and ignore unnormalized ones
                    //since they are transient.
                    if (!mod.inited && !mod.map.unnormalized) {
                        mod.map = makeModuleMap(id, null, true);
                    }
                });

                //If a deps array or a config callback is specified, then call
                //require with those args. This is useful when require is defined as a
                //config object before require.js is loaded.
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }
            },

            makeShimExports: function makeShimExports(value) {
                function fn() {
                    var ret;
                    if (value.init) {
                        ret = value.init.apply(global, arguments);
                    }
                    return ret || value.exports && getGlobal(value.exports);
                }
                return fn;
            },

            makeRequire: function makeRequire(relMap, options) {
                options = options || {};

                function localRequire(deps, callback, errback) {
                    var id, map, requireMod;

                    if (options.enableBuildCallback && callback && isFunction(callback)) {
                        callback.__requireJsBuild = true;
                    }

                    if (typeof deps === 'string') {
                        if (isFunction(callback)) {
                            //Invalid call
                            return onError(makeError('requireargs', 'Invalid require call'), errback);
                        }

                        //If require|exports|module are requested, get the
                        //value for them from the special handlers. Caveat:
                        //this only works while module is being defined.
                        if (relMap && hasProp(handlers, deps)) {
                            return handlers[deps](registry[relMap.id]);
                        }

                        //Synchronous access to one module. If require.get is
                        //available (as in the Node adapter), prefer that.
                        if (req.get) {
                            return req.get(context, deps, relMap, localRequire);
                        }

                        //Normalize module name, if it contains . or ..
                        map = makeModuleMap(deps, relMap, false, true);
                        id = map.id;

                        if (!hasProp(_defined, id)) {
                            return onError(makeError('notloaded', 'Module name "' + id + '" has not been loaded yet for context: ' + contextName + (relMap ? '' : '. Use require([])')));
                        }
                        return _defined[id];
                    }

                    //Grab defines waiting in the global queue.
                    intakeDefines();

                    //Mark all the dependencies as needing to be loaded.
                    context.nextTick(function () {
                        //Some defines could have been added since the
                        //require call, collect them.
                        intakeDefines();

                        requireMod = getModule(makeModuleMap(null, relMap));

                        //Store if map config should be applied to this require
                        //call for dependencies.
                        requireMod.skipMap = options.skipMap;

                        requireMod.init(deps, callback, errback, {
                            enabled: true
                        });

                        checkLoaded();
                    });

                    return localRequire;
                }

                mixin(localRequire, {
                    isBrowser: isBrowser,

                    /**
                     * Converts a module name + .extension into an URL path.
                     * *Requires* the use of a module name. It does not support using
                     * plain URLs like nameToUrl.
                     */
                    toUrl: function toUrl(moduleNamePlusExt) {
                        var ext,
                            index = moduleNamePlusExt.lastIndexOf('.'),
                            segment = moduleNamePlusExt.split('/')[0],
                            isRelative = segment === '.' || segment === '..';

                        //Have a file extension alias, and it is not the
                        //dots from a relative path.
                        if (index !== -1 && (!isRelative || index > 1)) {
                            ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                            moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                        }

                        return context.nameToUrl(normalize(moduleNamePlusExt, relMap && relMap.id, true), ext, true);
                    },

                    defined: function defined(id) {
                        return hasProp(_defined, makeModuleMap(id, relMap, false, true).id);
                    },

                    specified: function specified(id) {
                        id = makeModuleMap(id, relMap, false, true).id;
                        return hasProp(_defined, id) || hasProp(registry, id);
                    }
                });

                //Only allow undef on top level require calls
                if (!relMap) {
                    localRequire.undef = function (id) {
                        //Bind any waiting define() calls to this context,
                        //fix for #408
                        takeGlobalQueue();

                        var map = makeModuleMap(id, relMap, true),
                            mod = getOwn(registry, id);

                        mod.undefed = true;
                        removeScript(id);

                        delete _defined[id];
                        delete urlFetched[map.url];
                        delete undefEvents[id];

                        //Clean queued defines too. Go backwards
                        //in array so that the splices do not
                        //mess up the iteration.
                        eachReverse(defQueue, function (args, i) {
                            if (args[0] === id) {
                                defQueue.splice(i, 1);
                            }
                        });
                        delete context.defQueueMap[id];

                        if (mod) {
                            //Hold on to listeners in case the
                            //module will be attempted to be reloaded
                            //using a different config.
                            if (mod.events.defined) {
                                undefEvents[id] = mod.events;
                            }

                            cleanRegistry(id);
                        }
                    };
                }

                return localRequire;
            },

            /**
             * Called to enable a module if it is still in the registry
             * awaiting enablement. A second arg, parent, the parent module,
             * is passed in for context, when this method is overridden by
             * the optimizer. Not shown here to keep code compact.
             */
            enable: function enable(depMap) {
                var mod = getOwn(registry, depMap.id);
                if (mod) {
                    getModule(depMap).enable();
                }
            },

            /**
             * Internal method used by environment adapters to complete a load event.
             * A load event could be a script load or just a load pass from a synchronous
             * load call.
             * @param {String} moduleName the name of the module to potentially complete.
             */
            completeLoad: function completeLoad(moduleName) {
                var found,
                    args,
                    mod,
                    shim = getOwn(_config.shim, moduleName) || {},
                    shExports = shim.exports;

                takeGlobalQueue();

                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        args[0] = moduleName;
                        //If already found an anonymous module and bound it
                        //to this name, then this is some other anon module
                        //waiting for its completeLoad to fire.
                        if (found) {
                            break;
                        }
                        found = true;
                    } else if (args[0] === moduleName) {
                        //Found matching define call for this script!
                        found = true;
                    }

                    callGetModule(args);
                }
                context.defQueueMap = {};

                //Do this after the cycle of callGetModule in case the result
                //of those calls/init calls changes the registry.
                mod = getOwn(registry, moduleName);

                if (!found && !hasProp(_defined, moduleName) && mod && !mod.inited) {
                    if (_config.enforceDefine && (!shExports || !getGlobal(shExports))) {
                        if (hasPathFallback(moduleName)) {
                            return;
                        } else {
                            return onError(makeError('nodefine', 'No define call for ' + moduleName, null, [moduleName]));
                        }
                    } else {
                        //A script that does not call define(), so just simulate
                        //the call for it.
                        callGetModule([moduleName, shim.deps || [], shim.exportsFn]);
                    }
                }

                checkLoaded();
            },

            /**
             * Converts a module name to a file path. Supports cases where
             * moduleName may actually be just an URL.
             * Note that it **does not** call normalize on the moduleName,
             * it is assumed to have already been normalized. This is an
             * internal API, not a public one. Use toUrl for the public API.
             */
            nameToUrl: function nameToUrl(moduleName, ext, skipExt) {
                var paths,
                    syms,
                    i,
                    parentModule,
                    url,
                    parentPath,
                    bundleId,
                    pkgMain = getOwn(_config.pkgs, moduleName);

                if (pkgMain) {
                    moduleName = pkgMain;
                }

                bundleId = getOwn(bundlesMap, moduleName);

                if (bundleId) {
                    return context.nameToUrl(bundleId, ext, skipExt);
                }

                //If a colon is in the URL, it indicates a protocol is used and it is just
                //an URL to a file, or if it starts with a slash, contains a query arg (i.e. ?)
                //or ends with .js, then assume the user meant to use an url and not a module id.
                //The slash is important for protocol-less URLs as well as full paths.
                if (req.jsExtRegExp.test(moduleName)) {
                    //Just a plain path, not module name lookup, so just return it.
                    //Add extension if it is included. This is a bit wonky, only non-.js things pass
                    //an extension, this method probably needs to be reworked.
                    url = moduleName + (ext || '');
                } else {
                    //A module that needs to be converted to a path.
                    paths = _config.paths;

                    syms = moduleName.split('/');
                    //For each module name segment, see if there is a path
                    //registered for it. Start with most specific name
                    //and work up from it.
                    for (i = syms.length; i > 0; i -= 1) {
                        parentModule = syms.slice(0, i).join('/');

                        parentPath = getOwn(paths, parentModule);
                        if (parentPath) {
                            //If an array, it means there are a few choices,
                            //Choose the one that is desired
                            if (isArray(parentPath)) {
                                parentPath = parentPath[0];
                            }
                            syms.splice(0, i, parentPath);
                            break;
                        }
                    }

                    //Join the path parts together, then figure out if baseUrl is needed.
                    url = syms.join('/');
                    url += ext || (/^data\:|^blob\:|\?/.test(url) || skipExt ? '' : '.js');
                    url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : _config.baseUrl) + url;
                }

                return _config.urlArgs && !/^blob\:/.test(url) ? url + _config.urlArgs(moduleName, url) : url;
            },

            //Delegates to req.load. Broken out as a separate function to
            //allow overriding in the optimizer.
            load: function load(id, url) {
                req.load(context, id, url);
            },

            /**
             * Executes a module callback function. Broken out as a separate function
             * solely to allow the build system to sequence the files in the built
             * layer in the right sequence.
             *
             * @private
             */
            execCb: function execCb(name, callback, args, exports) {
                return callback.apply(exports, args);
            },

            /**
             * callback for script loads, used to check status of loading.
             *
             * @param {Event} evt the event from the browser for the script
             * that was loaded.
             */
            onScriptLoad: function onScriptLoad(evt) {
                //Using currentTarget instead of target for Firefox 2.0's sake. Not
                //all old browsers will be supported, but this one was easy enough
                //to support and still makes sense.
                if (evt.type === 'load' || readyRegExp.test((evt.currentTarget || evt.srcElement).readyState)) {
                    //Reset interactive script so a script node is not held onto for
                    //to long.
                    interactiveScript = null;

                    //Pull out the name of the module and the context.
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },

            /**
             * Callback for script errors.
             */
            onScriptError: function onScriptError(evt) {
                var data = getScriptData(evt);
                if (!hasPathFallback(data.id)) {
                    var parents = [];
                    eachProp(registry, function (value, key) {
                        if (key.indexOf('_@r') !== 0) {
                            each(value.depMaps, function (depMap) {
                                if (depMap.id === data.id) {
                                    parents.push(key);
                                    return true;
                                }
                            });
                        }
                    });
                    return onError(makeError('scripterror', 'Script error for "' + data.id + (parents.length ? '", needed by: ' + parents.join(', ') : '"'), evt, [data.id]));
                }
            }
        };

        context.require = context.makeRequire();
        return context;
    }

    /**
     * Main entry point.
     *
     * If the only argument to require is a string, then the module that
     * is represented by that string is fetched for the appropriate context.
     *
     * If the first argument is an array, then it will be treated as an array
     * of dependency string names to fetch. An optional function callback can
     * be specified to execute when all of those dependencies are available.
     *
     * Make a local req variable to help Caja compliance (it assumes things
     * on a require that are not standardized), and to give a short
     * name for minification/local scope use.
     */
    req = requirejs = function requirejs(deps, callback, errback, optional) {

        //Find the right context, use default
        var context,
            config,
            contextName = defContextName;

        // Determine if have config object in the call.
        if (!isArray(deps) && typeof deps !== 'string') {
            // deps is a config object
            config = deps;
            if (isArray(callback)) {
                // Adjust args if there are dependencies
                deps = callback;
                callback = errback;
                errback = optional;
            } else {
                deps = [];
            }
        }

        if (config && config.context) {
            contextName = config.context;
        }

        context = getOwn(contexts, contextName);
        if (!context) {
            context = contexts[contextName] = req.s.newContext(contextName);
        }

        if (config) {
            context.configure(config);
        }

        return context.require(deps, callback, errback);
    };

    /**
     * Support require.config() to make it easier to cooperate with other
     * AMD loaders on globally agreed names.
     */
    req.config = function (config) {
        return req(config);
    };

    /**
     * Execute something after the current tick
     * of the event loop. Override for other envs
     * that have a better solution than setTimeout.
     * @param  {Function} fn function to execute later.
     */
    req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
        setTimeout(fn, 4);
    } : function (fn) {
        fn();
    };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!_require) {
        _require = req;
    }

    req.version = version;

    //Used to filter out dependencies that are already paths.
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    req.isBrowser = isBrowser;
    s = req.s = {
        contexts: contexts,
        newContext: newContext
    };

    //Create default context.
    req({});

    //Exports some context-sensitive methods on global require.
    each(['toUrl', 'undef', 'defined', 'specified'], function (prop) {
        //Reference from contexts instead of early binding to default context,
        //so that during builds, the latest instance of the default context
        //with its config gets used.
        req[prop] = function () {
            var ctx = contexts[defContextName];
            return ctx.require[prop].apply(ctx, arguments);
        };
    });

    if (isBrowser) {
        head = s.head = document.getElementsByTagName('head')[0];
        //If BASE tag is in play, using appendChild is a problem for IE6.
        //When that browser dies, this can be removed. Details in this jQuery bug:
        //http://dev.jquery.com/ticket/2709
        baseElement = document.getElementsByTagName('base')[0];
        if (baseElement) {
            head = s.head = baseElement.parentNode;
        }
    }

    /**
     * Any errors that require explicitly generates will be passed to this
     * function. Intercept/override it if you want custom error handling.
     * @param {Error} err the error object.
     */
    req.onError = defaultOnError;

    /**
     * Creates the node for the load command. Only used in browser envs.
     */
    req.createNode = function (config, moduleName, url) {
        var node = config.xhtml ? document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') : document.createElement('script');
        node.type = config.scriptType || 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        return node;
    };

    /**
     * Does the request to load a module for the browser case.
     * Make this a separate function to allow other environments
     * to override it.
     *
     * @param {Object} context the require context to find state.
     * @param {String} moduleName the name of the module.
     * @param {Object} url the URL to the module.
     */
    req.load = function (context, moduleName, url) {
        var config = context && context.config || {},
            node;
        if (isBrowser) {
            //In the browser so use a script tag
            node = req.createNode(config, moduleName, url);

            node.setAttribute('data-requirecontext', context.contextName);
            node.setAttribute('data-requiremodule', moduleName);

            //Set up load listener. Test attachEvent first because IE9 has
            //a subtle issue in its addEventListener and script onload firings
            //that do not match the behavior of all other browsers with
            //addEventListener support, which fire the onload event for a
            //script right after the script execution. See:
            //https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution
            //UNFORTUNATELY Opera implements attachEvent but does not follow the script
            //script execution mode.
            if (node.attachEvent &&
            //Check if node.attachEvent is artificially added by custom script or
            //natively supported by browser
            //read https://github.com/requirejs/requirejs/issues/187
            //if we can NOT find [native code] then it must NOT natively supported.
            //in IE8, node.attachEvent does not have toString()
            //Note the test for "[native code" with no closing brace, see:
            //https://github.com/requirejs/requirejs/issues/273
            !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera) {
                //Probably IE. IE (at least 6-8) do not fire
                //script onload right after executing the script, so
                //we cannot tie the anonymous define call to a name.
                //However, IE reports the script as being in 'interactive'
                //readyState at the time of the define call.
                useInteractive = true;

                node.attachEvent('onreadystatechange', context.onScriptLoad);
                //It would be great to add an error handler here to catch
                //404s in IE9+. However, onreadystatechange will fire before
                //the error handler, so that does not help. If addEventListener
                //is used, then IE will fire error before load, but we cannot
                //use that pathway given the connect.microsoft.com issue
                //mentioned above about not doing the 'script execute,
                //then fire the script load event listener before execute
                //next script' that other browsers do.
                //Best hope: IE10 fixes the issues,
                //and then destroys all installs of IE 6-9.
                //node.attachEvent('onerror', context.onScriptError);
            } else {
                node.addEventListener('load', context.onScriptLoad, false);
                node.addEventListener('error', context.onScriptError, false);
            }
            node.src = url;

            //Calling onNodeCreated after all properties on the node have been
            //set, but before it is placed in the DOM.
            if (config.onNodeCreated) {
                config.onNodeCreated(node, config, moduleName, url);
            }

            //For some cache cases in IE 6-8, the script executes before the end
            //of the appendChild execution, so to tie an anonymous define
            //call to the module name (which is stored on the node), hold on
            //to a reference to this node, but clear after the DOM insertion.
            currentlyAddingScript = node;
            if (baseElement) {
                head.insertBefore(node, baseElement);
            } else {
                head.appendChild(node);
            }
            currentlyAddingScript = null;

            return node;
        } else if (isWebWorker) {
            try {
                //In a web worker, use importScripts. This is not a very
                //efficient use of importScripts, importScripts will block until
                //its script is downloaded and evaluated. However, if web workers
                //are in play, the expectation is that a build has been done so
                //that only one script needs to be loaded anyway. This may need
                //to be reevaluated if other use cases become common.

                // Post a task to the event loop to work around a bug in WebKit
                // where the worker gets garbage-collected after calling
                // importScripts(): https://webkit.org/b/153317
                setTimeout(function () {}, 0);
                importScripts(url);

                //Account for anonymous modules
                context.completeLoad(moduleName);
            } catch (e) {
                context.onError(makeError('importscripts', 'importScripts failed for ' + moduleName + ' at ' + url, e, [moduleName]));
            }
        }
    };

    function getInteractiveScript() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }

        eachReverse(scripts(), function (script) {
            if (script.readyState === 'interactive') {
                return interactiveScript = script;
            }
        });
        return interactiveScript;
    }

    //Look for a data-main script attribute, which could also adjust the baseUrl.
    if (isBrowser && !cfg.skipDataMain) {
        //Figure out baseUrl. Get it from the script tag with require.js in it.
        eachReverse(scripts(), function (script) {
            //Set the 'head' where we can append children by
            //using the script's parent.
            if (!head) {
                head = script.parentNode;
            }

            //Look for a data-main attribute to set main script for the page
            //to load. If it is there, the path to data main becomes the
            //baseUrl, if it is not already set.
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                //Preserve dataMain in case it is a path (i.e. contains '?')
                mainScript = dataMain;

                //Set final baseUrl if there is not already an explicit one,
                //but only do so if the data-main value is not a loader plugin
                //module ID.
                if (!cfg.baseUrl && mainScript.indexOf('!') === -1) {
                    //Pull off the directory of data-main for use as the
                    //baseUrl.
                    src = mainScript.split('/');
                    mainScript = src.pop();
                    subPath = src.length ? src.join('/') + '/' : './';

                    cfg.baseUrl = subPath;
                }

                //Strip off any trailing .js since mainScript is now
                //like a module name.
                mainScript = mainScript.replace(jsSuffixRegExp, '');

                //If mainScript is still a path, fall back to dataMain
                if (req.jsExtRegExp.test(mainScript)) {
                    mainScript = dataMain;
                }

                //Put the data-main script in the files to load.
                cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript];

                return true;
            }
        });
    }

    /**
     * The function that handles definitions of modules. Differs from
     * require() in that a string for the module should be the first argument,
     * and the function to execute after dependencies are loaded should
     * return a value to define the module corresponding to the first argument's
     * name.
     */
    define = function define(name, deps, callback) {
        var node, context;

        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!isArray(deps)) {
            callback = deps;
            deps = null;
        }

        //If no name, and callback is a function, then figure out if it a
        //CommonJS thing with dependencies.
        if (!deps && isFunction(callback)) {
            deps = [];
            //Remove comments from the callback string,
            //look for require calls, and pull them into the dependencies,
            //but only if there are function args.
            if (callback.length) {
                callback.toString().replace(commentRegExp, commentReplace).replace(cjsRequireRegExp, function (match, dep) {
                    deps.push(dep);
                });

                //May be a CommonJS thing even without require calls, but still
                //could use exports, and module. Avoid doing exports and module
                //work though if it just needs require.
                //REQUIRES the function to expect the CommonJS variables in the
                //order listed below.
                deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
            }
        }

        //If in IE 6-8 and hit an anonymous define() call, do the interactive
        //work.
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (node) {
                if (!name) {
                    name = node.getAttribute('data-requiremodule');
                }
                context = contexts[node.getAttribute('data-requirecontext')];
            }
        }

        //Always save off evaluating the def call until the script onload handler.
        //This allows multiple modules to be in a file without prematurely
        //tracing dependencies, and allows for anonymous module support,
        //where the module name is not known until the script onload event
        //occurs. If no context, use the global queue, and get it processed
        //in the onscript load callback.
        if (context) {
            context.defQueue.push([name, deps, callback]);
            context.defQueueMap[name] = true;
        } else {
            globalDefQueue.push([name, deps, callback]);
        }
    };

    define.amd = {
        jQuery: true
    };

    /**
     * Executes the text. Normally just uses eval, but can be modified
     * to use a better, environment-specific call. Only used for transpiling
     * loader plugins, not for plain JS modules.
     * @param {String} text the text to execute/evaluate.
     */
    req.exec = function (text) {
        /*jslint evil: true */
        return eval(text);
    };

    //Set up with config info.
    req(cfg);
})(undefined, typeof setTimeout === 'undefined' ? undefined : setTimeout);