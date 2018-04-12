;(function($){
    $(function($){
        //获取元素
        let $imgCar = $('#header i').has('img');

        //获取当前保存购物车信息的cookie
        let goodsData = Cookie.get('goodsData');
        if(typeof goodsData === 'string' && goodsData != ''){
            goodsData = JSON.parse(goodsData);
        }else{
            goodsData = [];
        }

        //更新头部购物车的数量
        $imgCar.next().text(goodsData.length);

        
    })
})(jQuery);