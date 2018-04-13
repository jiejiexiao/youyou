<?php
    require('connect.php');

    //接收数据
    $username = isset($_GET['username']) ? $_GET['username'] : null ;
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    //编写sql语句
    $sql = "update user set loginStatus = '$status' where username = '$username'";

    if($conn->query($sql)){
        echo 'success';
    }else{
        echo 'fail';
    }

?>