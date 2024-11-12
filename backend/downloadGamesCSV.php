<?php
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="jeopardy_games_data.csv"');

include 'config.php';

// Prepare query to get games and their players with scores
$query = "
    SELECT g.id as game_id, g.game_date, p.name, p.email, p.phone, p.score
    FROM jeopardy_games AS g
    LEFT JOIN jeopardy_players AS p ON g.id = p.game_id
    ORDER BY g.game_date DESC, p.score DESC
";

$result = $conn->query($query);

// Output CSV headers
echo "Game ID,Game Date,Player Name,Player Email,Player Phone,Player Score\n";

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "{$row['game_id']},";
        echo "{$row['game_date']},";
        echo "\"{$row['name']}\",";
        echo "\"{$row['email']}\",";
        echo "{$row['phone']},";
        echo "{$row['score']}\n";
    }
}

$conn->close();
?>
