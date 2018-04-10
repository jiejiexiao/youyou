require(["config"],function(){
    require(["jquery","common"],function(){

        ;(function($){
            $(function($){
                let $goodLists = $('.goodLists');
                
                $.ajax({
                    url:'../api/goodsList.php',
                    data:{},
                    success(data){                
                        var goods = JSON.parse(data);
                        console.log(goods)
                    }
                })
         



                
            })
        }(jQuery));        

    })
})
