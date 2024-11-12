<?php
// Allow CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

header('Content-Type: application/json');
include 'config.php';

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Prepare query to get games and their players with scores
$query = "
    SELECT g.id as game_id, g.game_date, p.name, p.email, p.phone, p.score
    FROM jeopardy_games AS g
    LEFT JOIN jeopardy_players AS p ON g.id = p.game_id
    ORDER BY g.game_date DESC, p.score DESC
";

$result = $conn->query($query);

$games = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $game_id = $row['game_id'];
        
        // Organize data by game_id
        if (!isset($games[$game_id])) {
            $games[$game_id] = [
                'game_id' => $game_id,
                'game_date' => $row['game_date'],
                'players' => []
            ];
        }
        
        // Add player info to the game
        $games[$game_id]['players'][] = [
            'name' => $row['name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'score' => $row['score']
        ];
    }
}

echo json_encode(['success' => true, 'games' => array_values($games)]);
$conn->close();
?>
