// index.js

let teams = [];
let currentTeamIndex = -1;

// Load teams from localStorage on page load
window.onload = function() {
    const storedTeams = JSON.parse(localStorage.getItem('teams'));
    if (storedTeams) {
        teams = storedTeams;
        renderTeams();
    }

    // Add event listener for Enter key to add team
    document.getElementById('team-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            createTeam();
        }
    });
}

function saveTeamsToLocalStorage() {
    localStorage.setItem('teams', JSON.stringify(teams));
}

function createTeam() {
    const teamName = document.getElementById('team-name').value;
    if (teamName) {
        teams.push({ name: teamName, players: [], assignments: [] });
        saveTeamsToLocalStorage();
        document.getElementById('team-name').value = '';
        renderTeams();
    }
}

function selectTeam(index) {
    currentTeamIndex = index;
    localStorage.setItem('currentTeamIndex', index); // Store current team index in localStorage
    window.location.href = 'team.html'; // Navigate to team.html
}

function removeTeam(index) {
    teams.splice(index, 1);
    saveTeamsToLocalStorage();
    renderTeams();
}

function renderTeams() {
    const teamList = document.getElementById('team-list');
    teamList.innerHTML = '';
    teams.forEach((team, index) => {
        const li = document.createElement('li');
        li.innerText = team.name;
        li.onclick = () => selectTeam(index);

        const removeButton = document.createElement('button');
        removeButton.innerText = 'x';
        removeButton.className = 'remove-btn';
        removeButton.onclick = (e) => {
            e.stopPropagation();
            removeTeam(index);
        };

        li.appendChild(removeButton);
        teamList.appendChild(li);
    });
}
