<?php
    require('connect.php');//连接数据库

    //接收数据
    $username = isset($_GET['username']) ? $_GET['username'] : null;//用户名
    $goodId = isset($_GET['goodId']) ? $_GET['goodId'] : null;//商品id
    $qty = isset($_GET['qty']) ? $_GET['qty'] : null;//数量
    $size = isset($_GET['size']) ? $_GET['size'] : null;//鞋码
    $type = isset($_GET['type']) ? $_GET['type'] : null;//类型 add、unadd、del、get

    //编辑表名 加前缀user_
    $username = 'user_' . $username;

    if($type === 'add'){
        //编写sql语句
        $sql = "insert into $username(goodId,qty,size) value($goodId,$qty,$size)";

        //写入数据库
        $conn->query($sql);
    }else if($type === 'unadd'){
        //编写sql语句
        $sql = "update $username set qty = $qty where goodId = $goodId and size = $size";

        //写入数据库
        $conn->query($sql);
    }else if($type === 'del'){
        //编写sql语句
        $sql = "delete from $username where goodId = $goodId and size = $size";

        //执行操作
        $conn->query($sql);
    }else if($type === 'get'){
        //编写sql语句
        $sql = "select * from $username";

        //执行操作 获得查询结果集
        $res = $conn->query($sql);

        $res = $res->fetch_all(MYSQLI_ASSOC);//得到user_用户的购物车信息结果

        //遍历结果
        foreach($res as $value){
            // 获取对象id
            $id = $value['goodId'];

            //根据id编写sql语句
            $sql = "select * from goodslist where id = $id";

            //执行操作 获得查询结果集
            $search = $conn->query($sql);

            //得到当前商品信息结果
            $search = $search->fetch_all(MYSQLI_ASSOC);

            // 补充属性
            $search[0]['qty'] = $value['qty']*1;
            $search[0]['size'] = $value['size']*1;

            $array[] = $search[0];//往数组追加内容
        }

        echo json_encode($array,JSON_UNESCAPED_UNICODE);

    }

    // 关闭数据库，避免资源浪费
    $conn->close();   
    
?>