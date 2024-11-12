import { BASE_URL } from './config.js';

document.getElementById("downloadCSVButton").addEventListener("click", downloadCSV);

function downloadCSV() {
    fetch(`${BASE_URL}downloadGamesCSV.php`)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok.");
            return response.blob(); // Get the response as a Blob (binary data)
        })
        .then(blob => {
            // Create a temporary URL for the blob and trigger a download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "games_data.csv"; // Set the desired file name
            document.body.appendChild(a);
            a.click(); // Trigger the download
            a.remove();
            window.URL.revokeObjectURL(url); // Clean up the URL
        })
        .catch(error => console.error("Error downloading CSV:", error));
}

// Fetch and display games data
async function loadGames() {
    try {
        const response = await fetch(`${BASE_URL}getGames.php`);
        const data = await response.json();

        if (data.success) {
            displayGames(data.games);
        } else {
            document.getElementById('gamesList').innerHTML = '<p class="text-danger">Failed to load game data.</p>';
        }
    } catch (error) {
        console.error('Error fetching games:', error);
        document.getElementById('gamesList').innerHTML = '<p class="text-danger">Error loading data. Please try again later.</p>';
    }
}

// Display games and players
function displayGames(games) {
    const gamesList = document.getElementById('gamesList');
    gamesList.innerHTML = ''; // Clear any previous content

    games.forEach(game => {
        // Game header
        let gameHtml = `
            <div class="game-header">
                Game ID: ${game.game_id} | Date: ${new Date(game.game_date).toLocaleString()}
            </div>
            <div class="players-list">
        `;

        // Player rows
        game.players.forEach(player => {
            gameHtml += `
                <div class="player-row">
                    <span class="player-name">${player.name}</span> | 
                    <span class="player-email">${player.email}</span> | 
                    <span class="player-phone">${player.phone}</span> | 
                    <span class="player-score">Score: ${player.score}</span>
                </div>
            `;
        });

        gameHtml += '</div><hr>';
        gamesList.innerHTML += gameHtml;
    });
}

// Load games on page load
window.onload = loadGames;
