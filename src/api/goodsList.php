<?php
    require('connect.php');//引入数据库连接接口模块

    $qty = isset($_GET['qty']) ? $_GET['qty'] : 20;//获取数量
    $page = isset($_GET['page']) ? $_GET['page'] : 1;//获取页码
    $type = isset($_GET['type']) ? $_GET['type'] : null;//用于判断排序的方式
    //获取搜索条件的参数
    $classify = isset($_GET['classify']) ? $_GET['classify'] : 'none';
    $brand = isset($_GET['brand']) ? $_GET['brand'] : 'none';
    $priceRang = isset($_GET['priceRang']) ? $_GET['priceRang'] : 'none';
    $priceRangMin = isset($_GET['priceRangMin']) ? $_GET['priceRangMin'] : 'none';
    $priceRangMax = isset($_GET['priceRangMax']) ? $_GET['priceRangMax'] : 'none';
    $size = isset($_GET['size']) ? $_GET['size'] : 'none';

    //价格排序//'update','lower','upper','new','sell'
    //编写sql语句
    if($brand==='全部'){
        if($priceRang ==='全部'){
            if($type === 'lower'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') order by youyouPrice ";
            }else if($type === 'upper'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') order by youyouPrice desc ";
            }else if($type === 'updata'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') order by saleTime ";
            }else if($type === 'new'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') order by saleTime desc";
            }else{
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify')";
            }
        }else{
            if($type === 'lower'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and youyouPrice between '$priceRangMin' and '$priceRangMax' order by youyouPrice ";
            }else if($type === 'upper'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and youyouPrice between '$priceRangMin' and '$priceRangMax' order by youyouPrice desc ";
            }else if($type === 'updata'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and youyouPrice between '$priceRangMin' and '$priceRangMax' order by saleTime ";
            }else if($type === 'new'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and youyouPrice between '$priceRangMin' and '$priceRangMax' order by saleTime desc";
            }else{
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and youyouPrice between '$priceRangMin' and '$priceRangMax'";
            }
        }
    }else{
        if($priceRang ==='全部'){
            if($type === 'lower'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and brand = '$brand' order by youyouPrice ";
            }else if($type === 'upper'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and brand = '$brand' order by youyouPrice desc ";
            }else if($type === 'updata'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and brand = '$brand' order by saleTime ";
            }else if($type === 'new'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and brand = '$brand' order by saleTime desc";
            }else{
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and brand = '$brand'";
            }
        }else{
            if($type === 'lower'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and youyouPrice between '$priceRangMin' and '$priceRangMax' order by youyouPrice ";
            }else if($type === 'upper'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and youyouPrice between '$priceRangMin' and '$priceRangMax' order by youyouPrice desc ";
            }else if($type === 'updata'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and youyouPrice between '$priceRangMin' and '$priceRangMax' order by saleTime ";
            }else if($type === 'new'){
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and youyouPrice between '$priceRangMin' and '$priceRangMax' order by saleTime desc";
            }else{
                $sql = "select * from goodsList where (classifyForhuman = '$classify' or classifyForshoe = '$classify') and youyouPrice between '$priceRangMin' and '$priceRangMax'";
            }
        }
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