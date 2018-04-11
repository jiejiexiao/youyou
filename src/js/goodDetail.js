require(['config'],function(){
    require(['jquery','common','xzoom'],function(){
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

        //获取参数
        let res = location.search.slice(1).split('=');
        let id = res[1];

        //根据获取的id发钱ajax请求
        $.ajax({
            url:'../api/goodsDetail.php',
            data:{'id':id},
            success(data){
                let res = JSON.parse(data)[0];console.log(res);

                //根据数据生成页面数据
                $three.text(`${res.brand}${res.classifyForhuman}${res.classifyForshoe}${res.goodsName} ${ res.color}`);
                $title.text(`${res.brand}${res.classifyForhuman}${res.classifyForshoe}${res.goodsName} ${ res.color}`);
                $marketPrice.text(res.marketPrice+'元');
                $shopPrice.text(res.shopPrice);
                $youyouPrice.text(res.youyouPrice); 
                $brand.text(res.brand);
                //生成图片
                $left.html(`<img src="../img/${res.img}" data-big="../img/${res.img}" />`);

                //颜色图片选择
                let $img = $(`<img src="../img/${res.img}">`);
                $imgColor.append($img);
                $imgColor.on('click','img',function(){
                    $(this).toggleClass('active');
                })
                //鞋码点击选择
                .next().on('click','span',function(){
                    $(this).toggleClass('active');
                    $(this).siblings().removeClass('active');
                })
                //数量选择
                $counts.val(1);//设置默认值
                $jianBtn.on('click',function(event){
                    event.preventDefault();
                    let res = $counts.val() - 1;
                    if(res<1){
                        res = 1;
                    }
                    $counts.val(res);
                });
                $jiaBtn.on('click',function(event){
                    event.preventDefault();
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
    })
})