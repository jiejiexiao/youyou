require(["config"],function(){
    require(["jquery","common"],function(){

        ;(function($){
            $(function($){
                //获取页面元素
                let $goodLists = $('.goodLists');
                let $nav = $goodLists.prev().children();
                let $page = $('#page');
                let $selected = $('#main .selected');
                let $right = $selected.find('.right');
                let goods;//全局变量页面的数据
                //向数据库获取数据
                let qty = 20;//每页显示的条数
                let pages;
                let orders = ['update','lower','upper','new','sell'];//编写传入后台的数据
                let idx;
                //用于搜索的参数
                let classify = '男鞋';
                let brand = '全部';
                let priceRang = '全部';
                let priceRangMin;
                let priceRangMax;
                let size;


                //初始化ajax加载数据
                $.ajax({
                    url:'../api/goodsList.php',
                    data:{
                        type:'new',
                        qty:qty,
                        classify:classify,
                        brand:brand,
                        priceRang:priceRang,
                        priceRangMin:priceRangMin,
                        priceRangMax:priceRangMax,
                        size:size

                    },
                    success(data){   
                        //将json字符串——》数组             
                        goods = JSON.parse(data).data;
                        let counts = JSON.parse(data).counts;
                        //得到数据，根据数据生成html
                        createTable(goods);

                        //产生分页
                        var len = Math.ceil(counts/qty);//页码数量
                        for(let i=0;i<len;i++){
                            let $span = $('<span/>');
                            $span.text(i+1);//页码
                            if(i==0){//默认第一个高亮
                                $span.addClass('active');
                            }
                            $page.append($span);
                        }
                    }
                })

                //绑定事件给商品添加样式
                $goodLists.on('mouseenter','li',function(){
                    $(this).addClass('active');
                }).on('mouseleave','li',function(){
                    $(this).removeClass('active');
                })

                //点击商品跳转到详情页
                .on('click','li',function(){
                    let id = $(this).attr('data-id');//获取id
                    location.href = "goodDetail.html?id="+id;//跳转传参
                })

                //点击分页切换
                $page.on('click','span',function(){
                    $(this).addClass('active').siblings().removeClass('active');//tab切换
                    //获取页码
                    page = $(this).text();
                    //传输页码和页码数量参数
                    ajax({
                        url:'../api/goodsList.php',
                        data:{
                            page:page,
                            qty:qty,
                            type:orders[idx],
                            classify:classify,
                            brand:brand,
                            priceRang:priceRang,
                            priceRangMin:priceRangMin,
                            priceRangMax:priceRangMax,
                            size:size
                        },
                        success(data){
                            goods = data.data;
                            // //得到数据，根据数据生成html
                            createTable(goods);
                        }
                    })
                })


                //点击进行价格排序   
                $nav.on('click','li',function(){
                    $(this).addClass('active').siblings().removeClass('active');//tab高亮切换
                    //遍历获取当前索引值
                    for(let i=0;i<orders.length;i++){
                        if($nav.children().eq(i).get(0)==this){
                            idx=i;
                        }
                    }

                    //发起ajax请求
                    $.ajax({
                        url:'../api/goodsList.php',
                        data:{
                            type:orders[idx],
                            classify:classify,
                            brand:brand,
                            priceRang:priceRang,
                            priceRangMin:priceRangMin,
                            priceRangMax:priceRangMax,
                            size:size
                        },
                        success(data){   
                            //将json字符串——》数组             
                            goods = JSON.parse(data).data;
                            let counts = JSON.parse(data).counts;
                            //得到数据，根据数据生成html
                            createTable(goods);

                            //产生分页
                            $page.html('');//清空页码
                            var len = Math.ceil(counts/qty);//页码数量
                            for(let i=0;i<len;i++){
                                let $span = $('<span/>');
                                $span.text(i+1);//页码
                                if(i==0){//默认第一个高亮
                                    $span.addClass('active');
                                }
                                $page.append($span);
                            }
                        }
                    })
                })     
                
                //对selected进行事件绑定进行搜索
                $right.on('click','span',function(event){
                    //样式tab切换
                    $(this).closest('.right').find('span').removeClass('active');
                    $(this).addClass('active');
                    event.preventDefault();


                    //获取参数
                    let $parma = $right.find('.active');
                    classify = $parma.eq(0).text();
                    brand = $parma.eq(1).text();
                    priceRang = $parma.eq(2).text();//100-200 ->100,200
                    size = $parma.eq(3).text();
                    //100-200 ->100,200
                    priceRangMin = priceRang.split('-')[0] || null;
                    priceRangMax = priceRang.split('-')[1] || null;
                    //根据参数发起ajax请求
                    $.ajax({
                        url:'../api/goodsList.php',
                        data:{
                            type:orders[idx],
                            classify:classify,
                            brand:brand,
                            priceRang:priceRang,
                            priceRangMin:priceRangMin,
                            priceRangMax:priceRangMax,
                            size:size
                        },
                        success(data){   
                            //将json字符串——》数组             
                            goods = JSON.parse(data).data;
                            let counts = JSON.parse(data).counts;
                            //得到数据，根据数据生成html
                            createTable(goods);

                            //产生分页
                            $page.html('');//清空页码
                            var len = Math.ceil(counts/qty);//页码数量
                            for(let i=0;i<len;i++){
                                let $span = $('<span/>');
                                $span.text(i+1);//页码
                                if(i==0){//默认第一个高亮
                                    $span.addClass('active');
                                }
                                $page.append($span);
                            }
                        }
                    });

                })

                //封装根据数据生成数据列表
                function createTable(goods){
                    $goodLists.html('');
                    let $res = $.map(goods,function(item,idx){
                        let $li = $('<li/>');
                        $li.attr('data-id',item.id)
                        $li.html(
                            `<img src="../img/${item.img}"/>
                            <p>${item.brand}${item.classifyForhuman}${item.classifyForshoe}${item.goodsName} ${item.color}</p>
                            <p>本店价<span class="price">${item.youyouPrice}</span><span class="counts">售出（0）件</span></p>
                            `
                        );
                        return $li;
                    })
                    $goodLists.append($res);
                }
                
            })
        }(jQuery));        

    })
})
