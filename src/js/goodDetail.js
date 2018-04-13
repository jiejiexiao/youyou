require(['config'],function(){
    require(['jquery','common','xzoom','public'],function(){
        ;(function($){
            //获取页面元素
            let $show = $('#main .show');
            let $title = $show.find('.title');
            let $marketPrice = $show.find('.marketPrice');
            let $shopPrice = $show.find('.shopPrice');
            let $youyouPrice = $show.find('.youyouPrice');
            let $brand = $show.find('.brand');
            let $jianBtn = $show.find('.jian');
            let $jiaBtn = $show.find('.jia');
            let $counts = $('#counts');
            let $addBtn = $('#btnAdd');
            let $one = $('.one');
            let $two = $('.two');
            let $three = $('.three');
            let $left = $show.find('.left');
            let $imgColor = $show.find('.imgColor');
            let $imgMove = $addBtn.children();
            let $imgCar = $('#header i').has('img');


            //点击跳转购物车
            $imgCar.on('click',function(){
                location.href = 'car.html';
            })


            //获取参数
            let res = location.search.slice(1).split('=');
            let id = res[1];


            //当前对象
            let good;


            //获取当前用户的登陆状态
            let loginStatus = Cookie.get('loginStatus');//''、'online'、'offline'
            //获取用户
            let username = Cookie.get('username');


            //获取当前保存购物车信息的cookie
            let goodsData = Cookie.get('goodsData');
            if(typeof goodsData === 'string' && goodsData != ''){
                goodsData = JSON.parse(goodsData);
            }else{
                goodsData = [];
            }
            // console.log(goodsData)
            //更新头部购物车的数量
            $imgCar.next().text(goodsData.length);


            //根据获取的id发ajax请求
            $.ajax({
                url:'../api/goodsDetail.php',
                data:{'id':id},
                success(data){
                    good = JSON.parse(data)[0];


                    //根据数据生成页面数据
                    $one.text(good.classifyForshoe);
                    $two.text(good.classifyForhuman);
                    $three.text(`${good.brand}${good.classifyForhuman}${good.classifyForshoe}${good.goodsName} ${ good.color}`);
                    $title.text(`${good.brand}${good.classifyForhuman}${good.classifyForshoe}${good.goodsName} ${ good.color}`);
                    $marketPrice.text(good.marketPrice+'元');
                    $shopPrice.text(good.shopPrice);
                    $youyouPrice.text(good.youyouPrice); 
                    $brand.text(good.brand);
                    //生成小图片
                    $imgMove.html(`<img src="../img/${good.img}"/>`);

                    //生成图片
                    $left.html(`<img src="../img/${good.img}" data-big="../img/${good.img}" />`);


                    //颜色图片选择
                    let $img = $(`<img src="../img/${good.img}">`);
                    $imgColor.append($img);


                    //默认选择第一个
                    $imgColor.find('img').eq(0).addClass('active');
                    $imgColor.next().find('span').eq(0).addClass('active');


                    //绑定事件 样式tab切换
                    $imgColor.on('click','img',function(){
                        $(this).toggleClass('active');
                    })


                    //鞋码点击选择
                    .next().on('click','span',function(){
                        $(this).addClass('active');
                        $(this).siblings().removeClass('active');
                    })


                    //数量选择
                    $counts.val(1);//设置默认值
                    //减少数量
                    $jianBtn.on('click',function(event){
                        let res = $counts.val() - 1;
                        if(res<1){
                            res = 1;
                        }
                        $counts.val(res);
                    });
                    //增加数量
                    $jiaBtn.on('click',function(event){    
                        let res = $counts.val()*1 + 1;
                        $counts.val(res);                    
                    });
                    $counts.on('change',function(){
                        if(!/^\d{1,}$/.test($counts.val())){
                            alert('请输入正确的数量');
                            $counts.val(1);
                        }
                    })


                    //放大镜效果
                    $left.xZoom({
                        width:402,//可视效果宽度
                        gap:50,//间隙
                        position:'right',//left,top,bottom,right   
                    })

                }
            })


            //点击添加购物车按钮生成cookie 并向后端发送数据保存用户的购物车信息
            $addBtn.on('click',function(){
                //设置保存时间
                let d = new Date();
                d.setDate(d.getDate()+10000);

                //获取添加数量
                let qty = $counts.val()*1;

                //获取当前鞋码
                let size = $imgColor.next().find('.active').text()*1;
            
                //判断cookie中goodsDate中的数据是否有相同的id 有则qty+ 没则push
                let indexId;//如果存在获取当前索引值
                let indexSize;
                //判断是否有相同id
                let hasId = goodsData.some(function(g,i){
                    if(g.id===id){
                        indexId = i;
                    }
                    return g.id === id ;
                });
                //判断有相同id的同时是否有相同尺码
                let hasSize = goodsData.some(function(g,i){
                    return (g.id===id && g.size === size)
                })
                //声明一个数组用来保存当同一个id有多个尺码 及有多个同一商品不同尺码
                let idMsg = [];
                for(let i=0;i<goodsData.length;i++){
                    if(goodsData[i].id === id){
                        idMsg.push(i);
                    }
                };
                //遍历idMsg获得对应的indexSize
                for(let i=0; i<idMsg.length; i++){
                    if(goodsData[idMsg[i]].size === size){
                        indexSize = idMsg[i];
                    }
                }
                
                //逆向判断
                if(hasSize){//判断是否有相同size
                    goodsData[indexSize].qty = goodsData[indexSize].qty*1 + qty;

                    //发起Ajax请求向后端发起数据 保存用户购物车信息
                    if(loginStatus==='online'){
                       $.ajax({
                            url:'../api/userCar.php',
                            data:{
                                username:username,
                                goodId:id,
                                qty:goodsData[indexSize].qty,
                                size:size,
                                type:'unadd',

                            },
                        }) 
                    }
                }else{                                                        
                    good.qty = qty;//给good添加qty属性
                    good.size = size;//给对象添加鞋码属性
                    //要深复制 上述只是引用数据类型会覆盖
                    goodsData.push(JSON.parse(JSON.stringify(good)));//添加到数组

                    //发起Ajax请求向后端发起数据 保存用户购物车信息
                    if(loginStatus==='online'){
                       $.ajax({
                            url:'../api/userCar.php',
                            data:{
                                username:username,
                                goodId:id,
                                qty:qty,
                                size:size,
                                type:'add',

                            },
                        }) 
                    }
                    
                }
               
                //产生cookie或更新cookie
                Cookie.set('goodsData',JSON.stringify(goodsData),d,'/');

                //更新头部购物车的数量
                $imgCar.next().text(goodsData.length);
            })
            //点击飞入购物效果
            .on('click',function(){
                //动画效果前清除之前的动画队列 并初始化默认位置
                $imgMove.stop().css({right:-80,top:-50,});

                $imgMove.fadeIn(200,function(){

                    $imgMove.animate({right:-360,top:-530},800,function(){

                        $imgMove.fadeOut(200,function(){
                            
                            $imgMove.css({right:-80,top:-50,})
                        })
                    })
                });
            })


        })(jQuery);
    })
})