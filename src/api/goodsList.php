<?php
    require('connect.php');//引入数据库连接接口模块

    $qty = isset($_GET['qty']) ? $_GET['qty'] : 20;//获取数量
    $page = isset($_GET['page']) ? $_GET['page'] : 1;//获取页码
    $type = isset($_GET['type']) ? $_GET['type'] : null;
    $sql;
    //判断是否价格排序//'update','lower','upper','new','sell'
    //编写sql语句
    if($type === 'lower'){
        $sql = "select * from goodsList order by youyouPrice ";
    }else if($type === 'upper'){
        $sql = "select * from goodsList order by youyouPrice desc ";
    }else if($type === 'updata'){
        $sql = "select * from goodsList order by saleTime ";
    }else if($type === 'new'){
        $sql = "select * from goodsList order by saleTime desc";
    }else{
        $sql = "select * from goodsList";
    }

    $result = $conn->query($sql);//得到查询结果集

    $res = $result->fetch_all(MYSQLI_ASSOC);//得到数据
    //将信息编写成关联数组
    $response =array(
        'counts'=>count($res),
        'data'=>array_slice($res,($page-1)*$qty,$qty)
    );

    echo json_encode($response,JSON_UNESCAPED_UNICODE);





?>