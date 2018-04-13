<?php
    
    //登陆验证
    
    require('connect.php');

    //获取接受的数据
    $username = isset($_GET['username']) ? $_GET['username'] : null;
    $password = isset($_GET['password']) ? $_GET['password'] : null;
    // 查找数据库判断用户名是否存在
    $sql = "select username from user where username='$username'";

    //得到查询结果集
    $res = $conn->query($sql);

    //判断是否存在用户
    if($res->num_rows>0){
        $sql = "select password from user where username = '$username' ";
        $content = $conn->query($sql);
        $res = $content->fetch_assoc();

        $res = $res['password'];

        // $password = md5($password);

        if($res == $password){
            echo 'success';
        }else{
            echo 'fail_psd';
        }


    }else{
        echo 'fail_user';
    }


    // 关闭数据库，避免资源浪费
    $conn->close();   
    
?>