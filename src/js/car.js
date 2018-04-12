//引入模块
require(['config'],function(){
    require(['jquery','common','public'],function(){
        ;(function($){
            //获取页码元素
            let $carList = $('#carList');
            let $youyouCount = $('.youyouCount');
            let $shopCount = $('.shopCount');
            let $chajia = $('.chajia');
            let $rate = $('.rate');
            let $imgCar = $('#header i').has('img');

            //声明全局变量//过期时间
            let d = new Date();
            d.setDate(d.getDate()+10000);
            
            //读取cookie
            let goodsData = Cookie.get('goodsData');
            //判断数据
            if(typeof goodsData === 'string' && goodsData!=''){
                goodsData = JSON.parse(goodsData);
            }else{
                goodsData = [];
            }
            

            //根据数据生成数据列表
            if(goodsData.length===0){
                let $tr = $('<tr/>');
                let $td = $('<td/>');
                $td.text('购物车空空的');
                $td.css({
                    height:200,
                    lineHeight:'200px',
                    fontSize:'40px',
                    textAlign:'center'
                }).attr('colspan',6);
                $td.appendTo($tr);
                $tr.appendTo($carList);
            }else{
                //调用函数生成列表
                createList(goodsData);
                createCount(goodsData);
            }

            //绑定事件用事件委托
            //阻止默认行为
            $carList.on('click',function(event){
                event.preventDefault();
            })
            .on('mousemove',function(event){
                event.preventDefault();
            })
            //减少数量
            .on('click','.jian',function(){
                let $counts = $(this).next();
                if($counts.val()*1 <= 1){
                    $counts.val(1);
                }else{
                    $counts.val($counts.val()*1-1);

                    //改变cookie中的当前id的qty
                    let line = $(this).closest('tr').data().line - 1;
                    goodsData[line].qty = $counts.val()*1;

                    //改变总计 
                    $(this).closest('tr').children().eq(4).children().text(goodsData[line].youyouPrice * $counts.val() + '元');

                    //更新cookie
                    Cookie.set('goodsData',JSON.stringify(goodsData),d,'/');

                    //更新
                    createCount(goodsData);
                }   
            })
            //增加数量
            .on('click','.jia',function(){
                //获取counts
                let $counts = $(this).prev();
                $counts.val($counts.val()*1+1);

                //改变cookie中的当前id的qty
                let line = $(this).closest('tr').data().line - 1;
                goodsData[line].qty = $counts.val()*1;

                //改变总计 
                $(this).closest('tr').children().eq(4).children().text(goodsData[line].youyouPrice * $counts.val() + '元');

                //更新cookie
                Cookie.set('goodsData',JSON.stringify(goodsData),d,'/'); 

                //更新
                createCount(goodsData);         
            })
            //改变输入框的数量
            .on('change','input',function(){
                if(!/^\d{1,}$/.test($(this).val())){
                    alert('请输入正确的数量');
                    $(this).val(1);
                }

                //改变cookie中的当前id的qty
                let line = $(this).closest('tr').data().line - 1;
                goodsData[line].qty = $(this).val()*1;

                //改变总计 
                $(this).closest('tr').children().eq(4).children().text(goodsData[line].youyouPrice * $(this).val() + '元');

                //更新cookie
                Cookie.set('goodsData',JSON.stringify(goodsData),d,'/');


                //更新
                createCount(goodsData);
            })
            //点击删除按钮
            .on('click','.delBtn',function(){
                //当前对象
                let $self = $(this);

                //创建弹窗
                new Popul();
                //获取按钮
                let $confirmBtn = $('.confirmBtn');
                let $cancelBtn = $('.cancelBtn');
                //弹窗
                let $popul = $('.xPopul');
                let $overlay = $('.xoverlay'); //遮罩

                //绑定事件
                //
                //确认删除
                $confirmBtn.on('click',function(){
                    let idx = $self.closest('tr').data().line - 1  ;//获取当前行对应的index
                    goodsData.splice(idx,1);//删除当前行

                    //根据数据生成数据列表
                    if(goodsData.length===0){
                        //清空
                        $carList.html('');
                        $youyouCount.text('');
                        $shopCount.text('');
                        $chajia.text('');
                        $rate.text('');
                        
                        let $tr = $('<tr/>');
                        let $td = $('<td/>');
                        $td.text('购物车空空的');
                        $td.css({
                            height:200,
                            lineHeight:'200px',
                            fontSize:'40px',
                            textAlign:'center'
                        }).attr('colspan',6);
                        $td.appendTo($tr);
                        $tr.appendTo($carList);
                    }else{
                        //调用函数生成列表
                        createList(goodsData);
                        createCount(goodsData);
                    }

                    //更新cookie
                    Cookie.set('goodsData',JSON.stringify(goodsData),d,'/');
                    //更新头部购物车的数量
                    $imgCar.next().text(goodsData.length);

                    $popul.remove();
                    $overlay.remove();
                });

                //取消删除
                $cancelBtn.on('click',function(){
                    $popul.remove();
                    $overlay.remove();
                });
            })


            //封装生成商品列表
            function createList(goodsData){
                $carList.html('');
                let res = $.map(goodsData,function(item,idx){
                    return `<tr data-id="${item.id}" data-line="${idx+1}">
                                <td><img src="../img/${item.img}" /><p>${item.brand}${item.classifyForhuman}${item.classifyForshoe}${item.goodsName}</p></td>
                                <td>尺码：${item.size}</td>
                                <td><span>${item.shopPrice}元</span><span>${item.youyouPrice}元</span></td>
                                <td><span class="jian">-</span><input type="text" value="${item.qty}"/><span class="jia">+</span></td>
                                <td><span>${item.qty*item.youyouPrice}元</span></td>
                                <td><span class="delBtn">删除</span></td>
                            </tr>`
                }).join('');
                $carList.html(res);
            }

            //封装生成总价 差价 比率
            function createCount(goodsData){
                let youyouTotal=0;
                let shopTotal=0;

                for(let i=0;i<goodsData.length;i++){
                    youyouTotal += ((goodsData[i].youyouPrice*1) * (goodsData[i].qty*1));
                    shopTotal += ((goodsData[i].shopPrice*1) * (goodsData[i].qty*1));
                }

                $youyouCount.text(youyouTotal);
                $shopCount.text(shopTotal);
                $chajia.text(shopTotal - youyouTotal);
                $rate.text(Math.ceil((shopTotal - youyouTotal)/shopTotal*100));

            }

            //描述一个弹窗
            function Popul(option){
                let defaults = {
                    ele:'xPopul',
                    title:'温馨提示',
                    content:'是否要删除该商品?',
                    confirmBtn:'confirmBtn',
                    cancelBtn:'cancelBtn',
                    width:400,
                    height:300,
                    overlay:true
                }

                let opt = Object.assign({},defaults,option);
                //设置属性
                this.width = opt.width;
                this.height = opt.height;
                this.overlay = opt.overlay;
                this.ele = opt.ele;
                this.title = opt.title;
                this.content = opt.content;
                this.confirmBtn = opt.confirmBtn;
                this.cancelBtn = opt.cancelBtn;

                this.init();//初始化
            }
            Popul.prototype.init = function(){
                //弹窗主体
                let $popul = $('<div/>');
                $popul.addClass(this.ele);
                $popul.css({
                    width:this.width,
                    height:this.height,
                })

                //标题
                let $title = $('<div/>');
                $title.addClass('title');
                $title.text(this.title);
                $title.appendTo($popul);

                //content
                let $content = $('<div/>');
                $content.addClass('content');
                $content.text(this.content);
                $content.appendTo($popul);

                //确定按钮
                let $confirm = $('<span/>');
                $confirm.addClass(this.confirmBtn);
                $confirm.text('确定');
                $confirm.appendTo($popul);

                //取消按钮
                let $cancel = $('<span/>');
                $cancel.addClass(this.cancelBtn);
                $cancel.text('取消');
                $cancel.appendTo($popul);

                if(this.overlay){
                    let $overlay = $('<div/>');
                    $overlay.addClass('xoverlay');
                    $overlay.appendTo($('body'));
                }

                $popul.appendTo($('body'));
            }
        })(jQuery);
    })
})