import { startGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const leadForm = document.getElementById('leadForm');
    const playerFields = document.getElementById('playerFields');
    const adImage = document.getElementById('ad-image');
    localStorage.removeItem('players');
    localStorage.removeItem('gameId');
    let playerCount = 1;

    document.getElementById('addPlayerBtn').addEventListener('click', () => {
        if (playerCount < 5) {
            playerCount++;
            const newPlayer = document.createElement('div');
            newPlayer.classList.add('player-field');
            newPlayer.setAttribute('id', `playerField${playerCount}`);
            newPlayer.innerHTML = `
            <div class="d-flex align-items-center mb-3">
                <div class="flex-grow-1">
                    <label for="name${playerCount}">Player ${playerCount} Name</label>
                    <input type="text" id="name${playerCount}" class="form-control" required>
                </div>
                <button type="button" class="btn btn-link text-danger ms-2 removePlayerBtn">
                    <i class="fas fa-trash-alt"></i> <!-- Trash icon -->
                </button>
            </div>
            <div class="d-flex align-items-center mb-3">
                <div class="flex-grow-1">
                    <label for="email${playerCount}">Email</label>
                    <input type="email" id="email${playerCount}" class="form-control" required>
                </div>
                <div class="ms-2" style="width: 40px;"></div>
            </div>
            <div class="d-flex align-items-center mb-3">
                <div class="flex-grow-1">
                    <label for="phone${playerCount}">Phone</label>
                    <input type="tel" id="phone${playerCount}" class="form-control" required>
                </div>
                <div class="ms-2" style="width: 40px;"></div>
            </div>
            <hr>
        `;
                    playerFields.appendChild(newPlayer);

            // Add event listener to the new "Delete" button
            newPlayer.querySelector('.removePlayerBtn').addEventListener('click', function() {
                if (playerCount > 1) { // Ensure at least one player remains
                    playerFields.removeChild(newPlayer);
                    playerCount--;
                    updatePlayerLabels(); // Update player labels after deletion
                }
            });
        }
    });

    // Function to update player labels after deletion
    function updatePlayerLabels() {
        const playerFieldDivs = document.querySelectorAll('.player-field');
        playerFieldDivs.forEach((div, index) => {
            const playerNumber = index + 1;
            div.querySelector('label[for^="name"]').textContent = `Player ${playerNumber} Name`;
            div.querySelector('input[id^="name"]').setAttribute('id', `name${playerNumber}`);
            div.querySelector('label[for^="email"]').setAttribute('for', `email${playerNumber}`);
            div.querySelector('input[id^="email"]').setAttribute('id', `email${playerNumber}`);
            div.querySelector('label[for^="phone"]').setAttribute('for', `phone${playerNumber}`);
            div.querySelector('input[id^="phone"]').setAttribute('id', `phone${playerNumber}`);
        });
    }

    // Handle form submission
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const players = [];
        for (let i = 1; i <= playerCount; i++) {
            const name = document.getElementById(`name${i}`).value;
            const email = document.getElementById(`email${i}`).value;
            const phone = document.getElementById(`phone${i}`).value;
            const score = 0;
            players.push({ name, email, phone, score });
        }
        
        // Send player data to the backend
        fetch('https://triosdevelopers.com/~S.Pahangdar/Jeopardy/backend/saveUser.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ players })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Save the players array to localStorage
                localStorage.setItem('players', JSON.stringify(players));
                localStorage.setItem('gameId', data.gameId);
                document.getElementById('leadFormPage').classList.add('d-none');
                document.getElementById('gamePage').classList.remove('d-none');
                startGame();  // Initialize the game
            } else {
                alert('Error saving user information.');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // Function to change ads (optional)
    function changeAd() {
        const ads = ['./assets/ad1.png', './assets/ad2.png']; // Array of ad images
        let currentAdIndex = 0;
        setInterval(() => {
            currentAdIndex = (currentAdIndex + 1) % ads.length;
            adImage.src = ads[currentAdIndex];
        }, 5000); // Change ad every 5 seconds
    }

    // Start changing ads
    changeAd();

});
