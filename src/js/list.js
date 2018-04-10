require(["config"],function(){
    require(["jquery","common"],function(){

        ;(function($){
            $(function($){
                //获取页面元素
                let $goodLists = $('.goodLists');
                //向数据库获取数据
                $.ajax({
                    url:'../api/goodsList.php',
                    data:{},
                    success(data){   
                        //将json字符串——》数组             
                        let goods = JSON.parse(data);console.log(goods)
                        
                        //得到数据，根据数据生成html
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

                        //绑定事件
                        $goodLists.on('mouseenter','li',function(){
                            $(this).addClass('active');
                        }).on('mouseleave','li',function(){
                            $(this).removeClass('active');
                        })

                    }
                })
         



                
            })
        }(jQuery));        

    })
})
