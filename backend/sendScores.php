<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Allow CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS requests before actual request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if this is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the JSON data from the request
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['gameId']) || !isset($data['players'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid input']);
        exit();
    }

    $gameId = $data['gameId'];
    $players = $data['players'];

    // Email settings (adjust as per your server)
    $fromEmail = 'noreply@yourgame.com'; // Replace with your game email
    $subject = "Jeopardy Game #{$gameId} - Final Scores";

    // Loop through each player and send their score via email
    foreach ($players as $player) {
        $toEmail = $player['email'];
        $playerName = $player['name'];
        $playerScore = $player['score'];

        // Create the email message
        $message = "Dear $playerName,\n\n";
        $message .= "Thank you for playing Jeopardy! Here are your final scores:\n\n";
        $message .= "Player: $playerName\n";
        $message .= "Score: $playerScore\n\n";
        $message .= "We hope you had fun playing!\n";
        $message .= "Best regards,\nThe Jeopardy Team";

        // Send the email
        $headers = "From: $fromEmail";

        if (mail($toEmail, $subject, $message, $headers)) {
            // Email sent successfully
            continue;
        } else {
            // Error sending email to this player
            echo json_encode(['success' => false, 'message' => "Error sending email to $playerName"]);
            exit();
        }
    }

    // If all emails sent successfully, return success
    echo json_encode(['success' => true, 'message' => 'Scores sent to all players']);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
