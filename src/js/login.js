require(['config'],function(){
    require(["jquery","common","md5","loginStatus"],function(){


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

                    //对密码进行加密
                    _password = hex_md5(_password);

                    //发送数据进行验证
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
                                //设置过期时间 //默认7天免登录
                                let d = new Date();
                                d.setDate(d.getDate()+7);

                                //向后端发送请求 保存用户登陆状态
                                $.ajax({
                                    url:'../api/userLoginStatus.php',
                                    data:{username:_username,status:'online'},
                                    success(data){
                                        if(data=='success'){
                                            alert('登陆成功');

                                            $.ajax({
                                                url:'../api/userCar.php',
                                                data:{
                                                    username:_username,
                                                    type:'get',
                                                },
                                                success(data){
                                                    console.log(data)
                                                    // 生成cookie 用来保存登陆状态
                                                    Cookie.set('loginStatus','online',d,'/');

                                                    // //生成cookie 用来保存用户名字
                                                    Cookie.set('username',_username,d,'/');

                                                    //生成cookie 用来保存用户的购物车信息
                                                    Cookie.set('goodsData',data,'','/');
                                                    //默认跳转到首页
                                                    location.href="../index.html";

                                                }
                                            })
                                            
                                        }else{
                                            alert('登陆失败')
                                        }
                                    }
                                })
                            }
                        }
                    })

                })

            })
        })(jQuery);  

      
    })
})

