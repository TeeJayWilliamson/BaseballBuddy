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
        const infieldPositions = ['Third Base', 'Short Stop', 'Second Base', 'First Base', 'Pitcher', 'Catcher'];
        const outfieldPositions = ['Left Field', 'Center Field', 'Right Field'];
        const totalInfieldPositions = infieldPositions.length;
        const totalOutfieldPositions = outfieldPositions.length;
        const additionalInfielders = parseInt(document.getElementById('additional-infielders').value);
        const additionalOutfielders = parseInt(document.getElementById('additional-outfielders').value);
        const totalPositions = totalInfieldPositions + totalOutfieldPositions + additionalInfielders + additionalOutfielders;
        const totalInnings = 9;
        team.assignments = {};

        // Show/Hide additional infield/outfield position boxes
        for (let i = 1; i <= 3; i++) {
            document.getElementById(`additional-infield-${i}`).classList.toggle('hidden', i > additionalInfielders);
            document.getElementById(`additional-outfield-${i}`).classList.toggle('hidden', i > additionalOutfielders);
        }

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
            }

            // Alternate between infield and outfield for remaining players
            let infieldIndex = 0;
            let outfieldIndex = 0;
            let additionalInfieldIndex = 1;
            let additionalOutfieldIndex = 1;

            for (const player of availablePlayers) {
                if (!assignedPlayers.has(player)) {
                    if (inning % 2 === 1) { // Odd innings: infield first
                        if (infieldIndex < totalInfieldPositions) {
                            inningAssignments.push({ position: infieldPositions[infieldIndex], player });
                            infieldIndex++;
                        } else if (additionalInfieldIndex <= additionalInfielders) {
                            inningAssignments.push({ position: `Additional Infield ${additionalInfieldIndex}`, player });
                            additionalInfieldIndex++;
                        } else if (outfieldIndex < totalOutfieldPositions) {
                            inningAssignments.push({ position: outfieldPositions[outfieldIndex], player });
                            outfieldIndex++;
                        } else if (additionalOutfieldIndex <= additionalOutfielders) {
                            inningAssignments.push({ position: `Additional Outfield ${additionalOutfieldIndex}`, player });
                            additionalOutfieldIndex++;
                        }
                    } else { // Even innings: outfield first
                        if (outfieldIndex < totalOutfieldPositions) {
                            inningAssignments.push({ position: outfieldPositions[outfieldIndex], player });
                            outfieldIndex++;
                        } else if (additionalOutfieldIndex <= additionalOutfielders) {
                            inningAssignments.push({ position: `Additional Outfield ${additionalOutfieldIndex}`, player });
                            additionalOutfieldIndex++;
                        } else if (infieldIndex < totalInfieldPositions) {
                            inningAssignments.push({ position: infieldPositions[infieldIndex], player });
                            infieldIndex++;
                        } else if (additionalInfieldIndex <= additionalInfielders) {
                            inningAssignments.push({ position: `Additional Infield ${additionalInfieldIndex}`, player });
                            additionalInfieldIndex++;
                        }
                    }
                    assignedPlayers.add(player);
                }
            }

            team.assignments[inning] = inningAssignments;
        }

        saveTeamsToLocalStorage();
        renderAssignments();
    }
}

// Render position assignments for the current inning
function renderAssignments() {
    if (currentTeamIndex > -1 && teams[currentTeamIndex].assignments) {
        const assignments = teams[currentTeamIndex].assignments[currentInning] || [];
        const positionElements = document.getElementsByClassName('position-box');

        // Clear previous assignments
        Array.from(positionElements).forEach(el => el.innerText = el.id.replace(/-/g, ' ').toUpperCase());

        // Display current assignments
        assignments.forEach(assignment => {
            const positionBox = document.getElementById(assignment.position.toLowerCase().replace(/ /g, '-'));
            if (positionBox) {
                positionBox.innerText = `${assignment.position.toUpperCase()}: ${assignment.player}`;
            }
        });

        // Render sitting players
        const sittingList = document.getElementById('sitting-list');
        sittingList.innerHTML = '';
        assignments.filter(a => a.position === 'Sitting').forEach(a => {
            const li = document.createElement('li');
            li.innerText = a.player;
            sittingList.appendChild(li);
        });
    }

    document.getElementById('current-inning').innerText = `Inning ${currentInning}`;
}

// Navigate to the previous inning
function previousInning() {
    if (currentInning > 1) {
        currentInning--;
        renderAssignments();
    }
}

// Navigate to the next inning
function nextInning() {
    if (currentInning < 9) {
        currentInning++;
        renderAssignments();
    }
}
