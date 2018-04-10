<?php
    require('connect.php');

    $sql = "select * from goodsList";

    $result = $conn->query($sql);

    $res = $result->fetch_all(MYSQLI_ASSOC);

    $res = json_encode($res,JSON_UNESCAPED_UNICODE);

    echo $res;
?>