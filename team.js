// team.js

let teams = [];
let currentTeamIndex = -1;
let currentInning = 1;

// Load teams from localStorage on page load
window.onload = function() {
    const storedTeams = JSON.parse(localStorage.getItem('teams'));
    if (storedTeams) {
        teams = storedTeams;
        const storedIndex = localStorage.getItem('currentTeamIndex');
        if (storedIndex !== null) {
            currentTeamIndex = parseInt(storedIndex);
        }
        renderTeamDetails();
    }

    // Add event listener for Enter key to add player
    document.getElementById('player-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addPlayer();
        }
    });
}

// Save teams data to localStorage
function saveTeamsToLocalStorage() {
    localStorage.setItem('teams', JSON.stringify(teams));
}

// Render team details (name, players, assignments)
function renderTeamDetails() {
    if (currentTeamIndex > -1) {
        const team = teams[currentTeamIndex];
        document.getElementById('selected-team-name').innerText = team.name;
        renderPlayers();
        renderAssignments();
    }
}

// Navigate back to team selection page
function goBack() {
    localStorage.removeItem('currentTeamIndex');
    window.location.href = 'index.html';
}

// Add a player to the selected team
function addPlayer() {
    const playerName = document.getElementById('player-name').value;
    if (playerName && currentTeamIndex > -1) {
        teams[currentTeamIndex].players.push(playerName);
        saveTeamsToLocalStorage();
        document.getElementById('player-name').value = '';
        renderPlayers();
    }
}

// Remove a player from the selected team
function removePlayer(playerName) {
    if (currentTeamIndex > -1) {
        const team = teams[currentTeamIndex];
        team.players = team.players.filter(player => player !== playerName);
        saveTeamsToLocalStorage();
        renderPlayers();
    }
}

// Render list of players for the selected team
function renderPlayers() {
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '';
    if (currentTeamIndex > -1) {
        const team = teams[currentTeamIndex];
        team.players.forEach(player => {
            const li = document.createElement('li');
            li.innerText = player;
            const removeButton = document.createElement('button');
            removeButton.innerText = 'x';
            removeButton.className = 'remove-btn';
            removeButton.onclick = () => removePlayer(player);
            li.appendChild(removeButton);
            playerList.appendChild(li);
        });
    }
}

// Assign positions for all innings
function assignPositions() {
    if (currentTeamIndex > -1) {
        const team = teams[currentTeamIndex];
        const infieldPositions = ['Third Base', 'Short Stop', 'Second Base', 'First Base', 'Pitcher-1', 'Catcher', 'Pitcher-2'];
        const outfieldPositions = ['Left Field', 'Left Center Field', 'Right Center Field', 'Right Field'];
        const positions = [...infieldPositions, ...outfieldPositions];
        const totalPositions = positions.length;
        const totalInnings = 9;
        team.assignments = {};

        // Track which players have sat and how many times
        let playersWhoSat = {};
        team.players.forEach(player => playersWhoSat[player] = 0);

        // Function to shuffle array using Fisher-Yates algorithm
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // Assign positions for each inning
        for (let inning = 1; inning <= totalInnings; inning++) {
            const inningAssignments = [];
            const availablePlayers = [...team.players];
            const assignedPlayers = new Set();
            shuffleArray(availablePlayers);

            // Determine the number of players to sit
            const numPlayersToSit = Math.max(0, availablePlayers.length - totalPositions);

            // Ensure no player sits more than once until everyone has sat
            let sittingCandidates = availablePlayers.filter(player => playersWhoSat[player] === 0);
            if (sittingCandidates.length < numPlayersToSit) {
                sittingCandidates = availablePlayers; // If not enough candidates, reset the pool
            }
            shuffleArray(sittingCandidates);

            for (let i = 0; i < numPlayersToSit; i++) {
                const sittingPlayer = sittingCandidates.shift();
                playersWhoSat[sittingPlayer]++;
                assignedPlayers.add(sittingPlayer);
                inningAssignments.push({ position: 'Sitting', player: sittingPlayer });
                availablePlayers.splice(availablePlayers.indexOf(sittingPlayer), 1);
            }

            // Ensure players alternate between infield and outfield each inning
            const isEvenInning = inning % 2 === 0;
            const infieldCandidates = isEvenInning ? availablePlayers.slice(0, infieldPositions.length) : availablePlayers.slice(-infieldPositions.length);
            const outfieldCandidates = isEvenInning ? availablePlayers.slice(-outfieldPositions.length) : availablePlayers.slice(0, outfieldPositions.length);

            // Shuffle candidates to ensure fairness
            shuffleArray(infieldCandidates);
            shuffleArray(outfieldCandidates);

            // Assign infield positions
            infieldPositions.forEach(position => {
                if (infieldCandidates.length > 0) {
                    const player = infieldCandidates.shift();
                    assignedPlayers.add(player);
                    inningAssignments.push({ position, player });
                }
            });

            // Assign outfield positions
            outfieldPositions.forEach(position => {
                if (outfieldCandidates.length > 0) {
                    const player = outfieldCandidates.shift();
                    assignedPlayers.add(player);
                    inningAssignments.push({ position, player });
                }
            });

            // Ensure no duplicate assignments
            const allAssignedPlayers = Array.from(assignedPlayers);
            availablePlayers.forEach(player => {
                if (!assignedPlayers.has(player)) {
                    assignedPlayers.add(player);
                }
            });

            team.assignments[inning] = inningAssignments;
        }

        saveTeamsToLocalStorage();
        renderAssignments();
    }
}







// Render position assignments for the current inning
function renderAssignments() {
    if (currentTeamIndex > -1) {
        const team = teams[currentTeamIndex];
        const assignments = team.assignments[currentInning];
        const positions = [
            'left-field', 'left-center-field', 'right-center-field', 'right-field',
            'third-base', 'short-stop', 'second-base', 'first-base',
            'pitcher-1', 'catcher', 'pitcher-2'
        ];

        // Clear previous assignments
        positions.forEach(position => {
            const positionElement = document.getElementById(position);
            if (positionElement) {
                positionElement.innerHTML = position.split('-').join(' ').toUpperCase(); // Reset to position name
            }
        });

        const sittingList = document.getElementById('sitting-list');
        sittingList.innerHTML = '';

        // Assign players to positions
        assignments.forEach(assignment => {
            if (assignment.position === 'Sitting') {
                const li = document.createElement('li');
                li.innerText = assignment.player;
                sittingList.appendChild(li);
            } else {
                const positionId = assignment.position.toLowerCase().replace(/ /g, '-');
                const positionElement = document.getElementById(positionId);
                if (positionElement) {
                    positionElement.innerHTML = `${assignment.position}<br>${assignment.player}`;
                }
            }
        });

        document.getElementById('current-inning').innerText = `Inning ${currentInning}`;
    }
}

// Navigate to previous inning
function previousInning() {
    if (currentInning > 1) {
        currentInning--;
        renderAssignments();
    }
}

// Navigate to next inning
function nextInning() {
    if (currentInning < 9) {
        currentInning++;
        renderAssignments();
    }
}
