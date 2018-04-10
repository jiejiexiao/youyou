require(['config'],function(){
    require(["jquery","common"],function(){


        ;(function($){
            $(function($){
                //获取页面元素
                let $username = $('#username');
                let $password = $('#password');
                let $vCodeInput = $('#vCode');
                let $vCodeShow = $vCodeInput.prev();
                let $btn = $('#btn');

                //验证码验证
                //生成随机验证码
                $vCodeShow.text(randomNumber(1000,9999));
                //点击生成随机验证码
                $vCodeShow.on('click',function(){
                    $vCodeShow.text(randomNumber(1000,9999));
                })
                //验证码输入是否匹配
                $vCodeInput.on('focus',function(){
                    $vCodeInput.css('border-color','blue');
                    $vCodeInput.next().text('*').removeClass('active');
                }).on('blur',function(){
                    let _show = $vCodeShow.text();
                    let _input = $vCodeInput.val().trim();

                    if(_show==_input){
                        $vCodeInput.next().text('验证码确认成功').addClass('active');
                    }else{
                        $vCodeInput.next().text('验证码确认错误');
                    }
                })

                //用户名输入
                $username.on('focus',function(){
                    $username.css('border-color','blue');
                    $username.next().text('').removeClass('active');
                }).on('blur',function(){
                    $username.css('border-color','#B3B3B3')
                });

                //密码输入
                $password.on('focus',function(){
                    $password.css('border-color','blue');
                    $password.next().text('').removeClass('active');
                }).on('blur',function(){
                    $password.css('border-color','#B3B3B3')
                });


                //给登陆按钮绑定事件 向后端发送信息验证
                $btn.on('click',function(){
                    let _username = $username.val().trim();
                    let _password = $password.val().trim();

                    if(_username == ''){
                        $username.next().text('请输入用户名');
                        return;
                    }

                    if(_password == ''){
                        $password.next().text('请输入密码');
                        return;
                    }

                    if($vCodeInput.val().trim()=='' ){
                        $vCodeInput.next().text('请输入验证码');
                        return;
                    }
                    if(!$vCodeInput.next().hasClass('active')){
                        return;
                    }

                    $.ajax({
                        url:'../api/login.php',
                        data:{
                            username:_username,
                            password:_password,
                        },
                        success(data){
                            if(data=="fail_user"){
                                $username.next().text("用户名输入错误")
                            }
                            if(data=="fail_psd"){
                                $password.next().text("密码输入错误")
                            }
                            if(data=="success"){
                                alert("用户登陆成功");
                            }
                        }
                    })

                })

            })
        })(jQuery);  

      
    })
})

