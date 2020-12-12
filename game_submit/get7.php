<?php
        $db = new SQLite3('./score.db');

        $sql = "SELECT * FROM score WHERE score > -1 ORDER BY score DESC LIMIT 1,1";
        $result = $db->query($sql);
        $row = $result->fetchArray();
        echo $row["username"].'----'.$row["score"].',';
?>

