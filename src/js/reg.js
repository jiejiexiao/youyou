
require(['config'],function(){
    require(["jquery","common","md5"],function(){

        ;(function($){
            $(function($){
                //获取页面元素
                let $username = $('#username');
                let $password = $('#password');
                let $email = $('#email');
                let $passwordSure = $('#passwordSure');
                let $psdStrong = $('.psdStrong');
                let $vCodeInput = $('#vCode');
                let $vCodeShow = $vCodeInput.prev();
                let $selected = $('#selected');
                let $btn = $('#btn');
                let $spanPsd = $psdStrong.children();//密码强度
                //用户名验证
                $username.on('focus',function(){

                    $username.css('border-color','blue');
                    $username.next().text('*').removeClass('active');
                }).on('blur',function(){

                    $username.css('border-color','#B3B3B3')
                    //获取输入的内容
                    let _username = $username.val().trim();console.log(_username)
                    //进行判断
                    if(_username.length<3){
                        $username.next().text('用户名不能少于3个字');
                    }else if(!/^[a-z\d]{3,18}$/i.test(_username)){
                        $username.next().text('用户名只能是字母和数字组合，3~18个字');
                    }else{
                        $.ajax({
                            url:'../api/reg.php',
                            data:{username:_username},
                            success(data){
                                if(data=='success'){
                                    $username.next().text('用户名合法').addClass('active');
                                }else{
                                    $username.next().text('用户名已经存在');
                                }
                            }
                        })
                    }
                });

                //邮箱验证
                $email.on('focus',function(){

                    $email.css('border-color','blue');
                    $email.next().text('*').removeClass('active');
                }).on('blur',function(){
                    $email.css('border-color','#B3B3B3')
                    //获取输入的内容
                    let _email = $email.val().trim();

                    if(/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(_email)){
                        $email.next().text('邮箱合法').addClass('active');
                    }else{
                        $email.next().text('邮箱不合法');
                    }
                });

                //密码验证
                $password.on('focus',function(){
                    $password.css('border-color','blue');
                    $password.next().text('*').removeClass('active');
                }).on('blur',function(){
                    $password.css('border-color','#B3B3B3');
                    //获取输入的内容
                    let _password = $password.val().trim();

                    if(_password.length < 6){
                        $password.next().text('请输入6位及以上密码');
                        $spanPsd.removeClass('activePsd');
                    }else{
                        if(/^[a-z0-9_-]{6,18}$/.test(_password)){
                            $password.next().text('密码合法').addClass('active');
                        }else{
                            $password.next().text('密码不合法');
                            $spanPsd.removeClass('activePsd');

                        }
                        
                    }
                })
                 //密码强度检验
                .on('keyup',function(){

                    let _password = $password.val().trim();

                    if(_password.length < 6){
                        return;
                    }else{
                        let _psw = _password.toUpperCase();
                        let hasNumber = false;
                        let hasLetter = false;
                        let hasSign = false;

                        for(var i=0;i<_psw.length;i++){
                            if(!isNaN(_psw[i])){
                                hasNumber = true;
                            }else{
                                if(_psw.charCodeAt(i)>=65 && _psw.charCodeAt(i)<=90){
                                    hasLetter = true;
                                }else{
                                    hasSign = true;
                                }
                            }
                        }

                        
                        $spanPsd.removeClass('activePsd');

                        if(hasSign && (hasLetter || hasNumber)){
                            $spanPsd.addClass('activePsd');
                        }else if(hasLetter && hasNumber){
                            $spanPsd.last().siblings().addClass('activePsd');
                        }else if(hasSign || hasLetter || hasNumber){
                            $spanPsd.first().addClass('activePsd');
                        }else{
                            $spanPsd.removeClass('activePsd');
                        }
                    }
                });
                
                //确认密码验证
                $passwordSure.on('focus',function(){
                    $passwordSure.css('border-color','blue');
                    $passwordSure.next().text('*').removeClass('active');
                }).on('blur',function(){
                    if(!$password.next().hasClass('active'))return;

                    let _password = $password.val().trim();
                    let _passwordSure = $passwordSure.val().trim();

                    if(_password == _passwordSure){
                        $passwordSure.next().text('密码确认成功').addClass('active');
                    }else{
                        $passwordSure.next().text('密码确认错误');
                    }

                });

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


                //验证所有信息是否正确发送到数据库
                $btn.on('click',function(){

                    if(!$username.next().hasClass('active')){
                        $username.next().text('请填写用户名');
                        return;
                    }

                    if(!$password.next().hasClass('active')){
                        $password.next().text('请填写密码');
                        return;
                    }

                    if(!$email.next().hasClass('active')){
                        $email.next().text('请填写邮箱');
                        return;
                    }

                    if(!$passwordSure.next().hasClass('active')){
                        $passwordSure.next().text('请确认密码');
                        return;
                    }

                    if(!$vCodeInput.next().hasClass('active')){
                        $vCodeInput.next().text('请填写验证码');
                        return;
                    }

                    if(!$selected.prop('checked')){
                        alert('请勾选同意框');
                        return;
                    }

                    //所有条件匹配将信息发送数据库保存
                    let _username = $username.val().trim();
                    let _email = $email.val().trim();
                    let _password = $password.val().trim();

                    //对密码进行加密
                    _password = hex_md5(_password);

                    //发送数据
                    $.ajax({
                        url:'../api/reg.php',
                        data:{
                            password:_password,
                            username:_username,
                            email:_email,
                            type:'reg'
                        },
                        success(data){
                            if(data == 'success'){
                                alert('注册成功');
                                //设置过期时间 //默认7天免登录
                                let d = new Date();
                                d.setDate(d.getDate()+7);

                                //生成cookie 用来保存登陆状态
                                Cookie.set('loginStatus',_username,d,'/');

                                //默认跳转到首页
                                location.href = '../index.html';

                            }
                        }
                    })
                    

                })

                
                

            })
        })(jQuery); 

      
    })
})