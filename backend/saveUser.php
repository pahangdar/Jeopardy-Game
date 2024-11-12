<?php
// Allow CORS in PHP files
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS requests before actual request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Send the headers for CORS preflight request and exit
    http_response_code(200); // Ensure 200 OK response for preflight
    exit();
}

header('Content-Type: application/json');
include 'config.php';

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Get the JSON data from the request
$data = json_decode(file_get_contents('php://input'), true);
$gameId = isset($data['gameId']) ? $data['gameId'] : null;
$players = isset($data['players']) ? $data['players'] : null;
if ($players === null) {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "players required"]);
    exit;
}

// Start transaction
$conn->begin_transaction();

try {
    if ($gameId) {
        // Update existing players' scores
        $stmt = $conn->prepare("UPDATE jeopardy_players SET score = ? WHERE game_id = ? AND name = ?");
        foreach ($players as $player) {
            $stmt->bind_param('iis', $player['score'], $gameId, $player['name']);
            $stmt->execute();
        }
        echo json_encode(['success' => true, 'message' => 'Scores updated', 'gameId' => $gameId]);
    } else {
        // Insert a new game into the games table
        $stmt = $conn->prepare("INSERT INTO jeopardy_games (game_date) VALUES (NOW())");
        $stmt->execute();
        $game_id = $conn->insert_id; // Get the newly created game's ID

        // Insert each player into the players table, linked to the new game
        $stmt = $conn->prepare("INSERT INTO jeopardy_players (game_id, name, email, phone, score) VALUES (?, ?, ?, ?, ?)");
        foreach ($players as $player) {
            $stmt->bind_param('isssi', $game_id, $player['name'], $player['email'], $player['phone'], $player['score']);
            $stmt->execute();
        }
        echo json_encode(['success' => true, 'gameId' => $game_id]);
    }
    // Commit transaction
    $conn->commit();

} catch (Exception $e) {
    // Rollback transaction in case of error
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

// Close connection
$conn->close();
?>