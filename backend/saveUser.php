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
$players = isset($data['players']) ? $data['players'] : null;
if ($players === null) {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "players required"]);
    exit;
}

//echo json_encode($players);

// Start transaction
$conn->begin_transaction();

try {
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

    // Commit transaction
    $conn->commit();
    echo json_encode(['success' => true, 'gameId' => $game_id]);

} catch (Exception $e) {
    // Rollback transaction in case of error
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

// Close connection
$conn->close();
?>