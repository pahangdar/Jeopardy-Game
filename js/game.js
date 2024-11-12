import { BASE_URL } from './config.js';
// Import the jeopardyData
import { jeopardyData } from './jeopardyData.js';

let players = [];
let gameId = '';
let teamNumber = 0;
let currentTeam = 0;
let isGameStarted = false;
let SelectedCell = null;
let lastPoint = 0;
// Create the modal instance once when the page loads
const questionModalElement = document.getElementById('questionModal');
const questionModal = new bootstrap.Modal(questionModalElement);
const gameOverModalElement = document.getElementById('gameOverModal');
const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'));
// Initialize the toast element
const answerToast = new bootstrap.Toast(document.getElementById('answerToast'));


// Function to start the game (updated to handle player data)
export function startGame() {
    players = JSON.parse(localStorage.getItem('players')) || [];
    gameId = localStorage.getItem('gameId') || '';
    teamNumber = players.length;  // Team number equals the number of players
    currentTeam = 0;

    document.getElementById('gameId').innerText = `Game ID #${gameId}`
    // Show the game grid and buttons
    document.getElementById('leadFormPage').classList.add('d-none');
    document.getElementById('menuPage').classList.add('d-none');
    document.getElementById('gamePage').classList.remove('d-none');
    document.getElementById('menueButton').classList.remove('d-none');
    document.getElementById('startButton').innerText = 'ReStart';
    document.getElementById('cancelButton').classList.remove('d-none');

    const scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = '';  // Clear previous scoreboard
    
    // Generate the scoreboard for each team
    for (let i = 0; i < teamNumber; i++) {
        const teamScore = document.createElement('div');
        teamScore.className = 'team-score';
        teamScore.id = `teamScoreDiv${i}`;
        teamScore.innerHTML = `<h4>${players[i].name} (Team ${i + 1})</h4><p id="teamScore${i}">Score: 0</p>`;
        scoreboard.appendChild(teamScore);
    }
    document.getElementById(`teamScoreDiv0`).classList.add('team-selected');

    isGameStarted = true;
    generateQuestionGrid();
}

export function returnToGame() {
    document.getElementById('menuPage').classList.add('d-none');
    document.getElementById('gamePage').classList.remove('d-none');
    document.getElementById('menueButton').classList.remove('d-none');
}
window.returnToGame = returnToGame;

export function showMenue() {
    document.getElementById('menuPage').classList.remove('d-none');
    document.getElementById('gamePage').classList.add('d-none');
    document.getElementById('menueButton').classList.add('d-none');
}
window.showMenue = showMenue;

// Dynamically generate the question grid and categories
function generateQuestionGrid() {
    const categoryRow = document.getElementById('categoryRow');
    const questionGrid = document.getElementById('questionGrid');

    // Clear the existing grid
    categoryRow.innerHTML = '';
    questionGrid.innerHTML = '';

    let categoryCount = 0;
    jeopardyData.forEach(category => {
        categoryCount++;
    });
    const columnWidth = 100 / categoryCount;

    // Create category headers
    jeopardyData.forEach(category => {
        const categoryHeader = document.createElement('th');
        categoryHeader.innerText = category.category;
        categoryHeader.style.width = `${columnWidth}%`;
        categoryRow.appendChild(categoryHeader);
    });

    // Create rows of questions based on point values
    const maxQuestions = Math.max(...jeopardyData.map(cat => cat.questions.length));
    for (let i = 0; i < maxQuestions; i++) {
        const row = document.createElement('tr');
        jeopardyData.forEach(category => {
            const cell = document.createElement('td');
            if (category.questions[i]) {  // Ensure the question exists
                const question = category.questions[i];
                cell.innerText = `${question.points}`;
                cell.classList.add('question-cell');

                // Add onClick event to the cell
                cell.addEventListener('click', () => handleQuestionClick(category.category, question, cell));

                row.appendChild(cell);
            } else {
                // Add empty cell if no question exists for this row
                const emptyCell = document.createElement('td');
                row.appendChild(emptyCell);
            }
        });
        questionGrid.appendChild(row);
    }
}

// Handle question click event
function handleQuestionClick(category, question, cell) {
    cell.classList.add('question-disabled');
    SelectedCell = cell;
    lastPoint = -1;

    // Display the question and options in the modal
    let optionsHtml = '';
    question.options.forEach((option, index) => {
        optionsHtml += `
            <div class="form-check">
                <input class="form-check-input" type="radio" name="answer" value="${option}" id="option${index}">
                <label class="form-check-label" for="option${index}">
                    ${option}
                </label>
            </div>`;
    });

    // Update the modal's title and body content
    document.getElementById('questionModalLabel').innerText = `${question.points} Points ${category} Question for Team ${currentTeam + 1}`;
    document.getElementById('questionBody').innerHTML = `
        <p>${question.question}</p>
        <form id="answerForm">
            ${optionsHtml}
        </form>
    `;

    // Set up the submit button to check the answer
    document.getElementById('submitAnswerButton').onclick = function () {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (selectedOption) {
            checkAnswer(selectedOption.value, question.answer, question.points);
        } else {
            showToast(`${players[currentTeam].name } (Team ${currentTeam + 1})`, 'Please select an answer!');
        }
    };

    questionModal.show();  // Show the modal
}


// Add event listener to handle modal closing
questionModalElement.addEventListener('hidden.bs.modal', function () {
    document.getElementById(`teamScoreDiv${currentTeam}`).classList.remove('team-selected');
    if (SelectedCell) {
        let badgeType = '';
        if (lastPoint === -1) {
            badgeType = 'bg-secondary';
        } else if (lastPoint === 0) {
            badgeType = 'bg-danger';
        } else {
            badgeType = 'bg-success';
        }
        SelectedCell.innerHTML = SelectedCell.innerText + '<span class="rounded-pill top-20 start-20 translate-middle badge ' + badgeType + `">${currentTeam + 1}</span>`;
    }
    if (lastPoint === -1) {
        showToast(`${players[currentTeam].name } (Team ${currentTeam + 1})`, 'You missed this question!');
    }
    currentTeam = (currentTeam + 1) % teamNumber;
    document.getElementById(`teamScoreDiv${currentTeam}`).classList.add('team-selected');
    checkGameOver();
});

// Function to show toast
function showToast(title, message, time = 'Just now') {
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMessage').textContent = message;
    //document.getElementById('toastTime').textContent = time;
    answerToast.show();
}

// Function to check if the selected answer is correct
function checkAnswer(selectedAnswer, correctAnswer, points) {
    if (selectedAnswer && selectedAnswer === correctAnswer) {
        showToast('Correct!', `Well done ${players[currentTeam].name } (Team ${currentTeam + 1}), you got the correct answer!`);
        lastPoint = points;
    } else {
        showToast('Incorrect!', `Sorry ${players[currentTeam].name } (Team ${currentTeam + 1}), that is not the correct answer.`);
        lastPoint = 0;
    }
    updateScore(lastPoint);
    questionModal.hide();  // Close the modal
}

// Update score and handle end of game (updated to trigger score email)
function updateScore(points) {
    players[currentTeam].score += points;
    document.getElementById(`teamScore${currentTeam}`).innerText = `Score: ${players[currentTeam].score}`;
}

function checkGameOver() {
    const allQuestionsAnswered = [...document.querySelectorAll('.question-cell')]
        .every(cell => cell.classList.contains('question-disabled'));

    if (allQuestionsAnswered) {
        // update players' score
        const payload = {
            gameId: gameId,
            players: players
        };
        fetch(`${BASE_URL}saveUser.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Game ID ${data.gameId} updated successfully.`);
            } else {
                console.error('Error updating game:', data.error);
            }
        })
        .catch(error => console.error('Error:', error));

        // Create a string for the score list
        let scoresHtml = `<h5 class="text-center">Score${teamNumber === 1 ? '' : 's'}</h5>`;
        let sortedPlayers = players;
        sortedPlayers.sort((a, b) => b.score - a.score);
        let maxScore = sortedPlayers[0].score;
        sortedPlayers.forEach((player, index) => {
            const isWinner = player.score === maxScore; // Check if this player is the winner
            scoresHtml += '<div class="d-flex justify-content-between">'
            scoresHtml += `<div class="player-score${isWinner ? ' text-success' : ''}">#${index + 1}</div>`;
            scoresHtml += `<div class="player-score${isWinner ? ' text-success' : ''}">${player.name}</div>`;
            scoresHtml += `<div class="player-score${isWinner ? ' text-success' : ''}">${player.score}</div>`;
            scoresHtml += '</div>'
        });

        // Populate the modal with the scores
        const scoresList = document.getElementById('scoresList');
        scoresList.innerHTML = scoresHtml;

        // Show the modal
        gameOverModal.show();
    }
}

// Add event listener for the send scores button
document.getElementById('sendScoresButton').onclick = function() {
    const payload = {
        gameId: gameId,
        players: players
    };
    // Send final scores to the backend to email to players
    fetch(`${BASE_URL}sendScores.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('', 'Scores have been emailed successfully!');
            gameOverModal.hide();
        } else {
            showToast('Error sending final scores.', data.message);
        }
    })
    .catch(error => console.error('Error:', error));
};

gameOverModalElement.addEventListener('hidden.bs.modal', function () {
    location.reload();
});
