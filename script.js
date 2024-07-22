const roles5Players = ['Werewolf', 'Werewolf', 'Seer', 'Robber', 'Troublemaker', 'Mason', 'Mason', 'Villager', 'Minion', 'Hunter', 'Doppelganger', 'Drunk', 'Insomniac', 'Tanner'];
const roles8Players = ['Werewolf', 'Werewolf', 'Seer', 'Robber', 'Troublemaker', 'Mason', 'Mason', 'Villager', 'Minion', 'Hunter', 'Doppelganger', 'Drunk', 'Insomniac', 'Tanner'];

let roles = [];
let players = [];
let playerNames = [];
let currentRoleIndex = 0;
let currentPhase = 0;
let doppelgangerRole = null;

const phases = ['doppelganger', 'werewolves', 'minion', 'masons', 'seer', 'robber', 'troublemaker', 'drunk', 'insomniac'];
const phaseActions = {
    'doppelganger': doppelgangerAction,
    'werewolves': werewolvesAction,
    'minion': minionAction,
    'masons': masonsAction,
    'seer': seerAction,
    'robber': robberAction,
    'troublemaker': troublemakerAction,
    'drunk': drunkAction,
    'insomniac': insomniacAction
};

function generatePlayerInputs() {
    const playerCount = document.getElementById('player-count').value;
    const playerNamesDiv = document.getElementById('player-names');
    playerNamesDiv.innerHTML = ''; // Clear any existing inputs

    for (let i = 0; i < playerCount; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player-name-${i}`;
        input.className = 'player-name-input';
        input.placeholder = `Player ${i + 1} Name`;
        playerNamesDiv.appendChild(input);
    }
}

function startGame() {
    const playerCount = document.getElementById('player-count').value;
    roles = playerCount == 5 ? roles5Players : roles8Players;
    roles = shuffleArray(roles);
    players = roles.slice(0, playerCount);
    playerNames = Array.from({ length: playerCount }, (_, i) => document.getElementById(`player-name-${i}`).value || `Player ${i + 1}`);

    // Ensure there are not exactly one Mason in the game
    const masonCount = players.filter(role => role === 'Mason').length;
    if (masonCount === 1) {
        // Remove the single Mason
        players = players.filter(role => role !== 'Mason');
        // Add a random role from the remaining roles pool
        const remainingRoles = roles.filter(role => !players.includes(role));
        players.push(remainingRoles[Math.floor(Math.random() * remainingRoles.length)]);
        // Shuffle players again to ensure randomness
        players = shuffleArray(players);
    }

    document.getElementById('game-setup').style.display = 'none';
    document.getElementById('role-reveal').style.display = 'block';
    revealNextRole();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function revealNextRole() {
    if (currentRoleIndex < players.length) {
        document.getElementById('player-role-reveal').innerText = `${playerNames[currentRoleIndex]}, reveal your role.`;
        document.querySelector('#role-reveal button[onclick="revealRole()"]').style.display = 'block';
        document.querySelector('#role-reveal button[onclick="nextRole()"]').style.display = 'none';
    } else {
        document.getElementById('role-reveal').style.display = 'none';
        document.getElementById('game-board').style.display = 'block';
        nextPhase();
    }
}

function revealRole() {
    document.getElementById('player-role-reveal').innerText += ` Your role is: ${players[currentRoleIndex]}.`;
    document.querySelector('#role-reveal button[onclick="revealRole()"]').style.display = 'none';
    document.querySelector('#role-reveal button[onclick="nextRole()"]').style.display = 'block';
}

function nextRole() {
    currentRoleIndex++;
    revealNextRole();
}

function nextPhase() {
    if (currentPhase < phases.length) {
        const phase = phases[currentPhase];
        playSound(`${phase}_wake_up`, () => {
            if (phaseActions[phase]) {
                phaseActions[phase]();
            }
            setTimeout(() => {
                playSound(`${phase}_close_eyes`, () => {
                    currentPhase++;
                    setTimeout(nextPhase, 2000); // Delay before the next phase
                });
            }, 8000); // Delay for actions
        });
    } else {
        startDiscussion();
    }
}

function startDiscussion() {
    document.getElementById('game-board').style.display = 'none';
    document.getElementById('discussion-phase').style.display = 'block';
    playSound('everyone_wake_up', () => {
        startTimer(5 * 60);
    });
}

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const display = document.getElementById('timer');
    const interval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(interval);
            alert('Time\'s up! Time to vote.');
            startVoting();
        }
    }, 1000);
}

function playSound(sound, callback) {
    const audio = new Audio(`sounds/${sound}.mp3`);
    audio.play();
    audio.onended = callback;
}

function doppelgangerAction() {
    document.getElementById('night-phase-instructions').innerText = 'Doppelganger, wake up and choose a player to copy their role.';
    const actionsDiv = document.getElementById('actions');
    actionsDiv.innerHTML = '';
    const playerCount = players.length;
    const doppelgangerIndex = players.indexOf('Doppelganger');
    const DoppelgangerCount = players.filter(role => role === 'Doppelganger').length;
    if (DoppelgangerCount === 0){
        console.log("No doppel");
    } else {
    for (let i = 0; i < playerCount; i++) {
        if (i === doppelgangerIndex) continue; // Skip the Doppelganger themselves

        const button = document.createElement('button');
        button.innerText = `Copy ${playerNames[i]}'s role`;
        button.onclick = () => {
            doppelgangerRole = players[i];
            players[doppelgangerIndex] = doppelgangerRole;
            clearActions();
            if (phaseActions[doppelgangerRole.toLowerCase()]) {
                phaseActions[doppelgangerRole.toLowerCase()]();
            }
        };
        actionsDiv.appendChild(button);
    }
    
}
    
}

function werewolvesAction() {
    const werewolves = players.reduce((acc, role, index) => role === 'Werewolf' ? acc.concat(playerNames[index]) : acc, []);
    document.getElementById('night-phase-instructions').innerText = `Werewolves, wake up and see each other.`;
}

function minionAction() {
    const werewolves = players.reduce((acc, role, index) => role === 'Werewolf' ? acc.concat(playerNames[index]) : acc, []);
    const minion = players.indexOf('Minion') !== -1 ? playerNames[players.indexOf('Minion')] : null;
    if (minion) {
        document.getElementById('night-phase-instructions').innerText = `Minion, wake up and see the Werewolves: ${werewolves.join(' and ')}.`;
    }
}

function masonsAction() {
    const masons = players.reduce((acc, role, index) => role === 'Mason' ? acc.concat(playerNames[index]) : acc, []);
    document.getElementById('night-phase-instructions').innerText = `Masons, wake up and see each other.`;
}

function seerAction() {
    document.getElementById('night-phase-instructions').innerText = 'Seer, wake up and choose a player to see their role or look at two center roles.';
    const actionsDiv = document.getElementById('actions');
    actionsDiv.innerHTML = '';
    const playerCount = players.length;

    for (let i = 0; i < playerCount; i++) {
        const button = document.createElement('button');
        button.innerText = `Look at ${playerNames[i]}'s role`;
        button.onclick = () => {
            alert(`${playerNames[i]}'s role is: ${players[i]}`);
            clearActions();
        };
        actionsDiv.appendChild(button);
    }

    const centerButton = document.createElement('button');
    centerButton.innerText = 'Look at two center roles';
    centerButton.onclick = () => {
        alert(`Center roles are: ${roles[playerCount]} and ${roles[playerCount + 1]}`);
        clearActions();
    };
    actionsDiv.appendChild(centerButton);
}

function robberAction() {
    document.getElementById('night-phase-instructions').innerText = 'Robber, wake up and choose a player to swap roles with and then look at your new role.';
    const actionsDiv = document.getElementById('actions');
    actionsDiv.innerHTML = '';
    const robberIndex = players.indexOf('Robber');

    for (let i = 0; i < players.length; i++) {
        if (i === robberIndex) continue; // Skip the Robber themselves

        const button = document.createElement('button');
        button.innerText = `Swap with ${playerNames[i]}`;
        button.onclick = () => {
            [players[robberIndex], players[i]] = [players[i], players[robberIndex]];
            alert(`You are now: ${players[robberIndex]}`);
            clearActions();
        };
        actionsDiv.appendChild(button);
    }
}

function troublemakerAction() {
    document.getElementById('night-phase-instructions').innerText = 'Troublemaker, wake up and choose two players to swap roles.';
    const actionsDiv = document.getElementById('actions');
    actionsDiv.innerHTML = '';
    const troublemakerIndex = players.indexOf('Troublemaker');

    for (let i = 0; i < players.length; i++) {
        if (i === troublemakerIndex) continue; // Skip the Troublemaker themselves

        const button1 = document.createElement('button');
        button1.innerText = `First player: ${playerNames[i]}`;
        button1.onclick = () => {
            const firstIndex = i;
            actionsDiv.innerHTML = ''; // Clear the first set of buttons

            for (let j = 0; j < players.length; j++) {
                if (j === troublemakerIndex || j === firstIndex) continue; // Skip the Troublemaker and the first chosen player

                const button2 = document.createElement('button');
                button2.innerText = `Second player: ${playerNames[j]}`;
                button2.onclick = () => {
                    [players[firstIndex], players[j]] = [players[j], players[firstIndex]];
                    alert(`Swapped roles of ${playerNames[firstIndex]} and ${playerNames[j]}`);
                    clearActions();
                };
                actionsDiv.appendChild(button2);
            }
        };
        actionsDiv.appendChild(button1);
    }
}

function drunkAction() {
    document.getElementById('night-phase-instructions').innerText = 'Drunk, wake up and swap your role with a random center role.';
    const drunkIndex = players.indexOf('Drunk');
    const playerCount = players.length;
    const centerRoleIndex = playerCount + Math.floor(Math.random() * (roles.length - playerCount));

    [players[drunkIndex], roles[centerRoleIndex]] = [roles[centerRoleIndex], players[drunkIndex]];
}

function insomniacAction() {
    const insomniacIndex = players.indexOf('Insomniac');
    document.getElementById('night-phase-instructions').innerText = `Insominac, wake up and look at your role.`;
    setTimeout(() => {
        alert(`You are now: ${players[insomniacIndex]}`);
    }, 1000);
}

function clearActions() {
    document.getElementById('actions').innerHTML = '';
}

function startVoting() {
    const votingDiv = document.getElementById('voting');
    votingDiv.innerHTML = '';

    players.forEach((player, index) => {
        const button = document.createElement('button');
        button.innerText = `Vote to eliminate ${playerNames[index]}`;
        button.onclick = () => {
            votes[playerNames[index]] = (votes[playerNames[index]] || 0) + 1;
            button.disabled = true;
        };
        votingDiv.appendChild(button);
    });

    const endVotingButton = document.createElement('button');
    endVotingButton.innerText = 'End Voting';
    endVotingButton.onclick = endVoting;
    votingDiv.appendChild(endVotingButton);
}

function endVoting() {
    const maxVotes = Math.max(...Object.values(votes));
    const eliminatedPlayers = Object.keys(votes).filter(player => votes[player] === maxVotes);

    if (eliminatedPlayers.length === 1) {
        alert(`Player eliminated: ${eliminatedPlayers[0]}`);
    } else {
        alert(`Tie! Players eliminated: ${eliminatedPlayers.join(', ')}`);
    }

    document.getElementById('discussion-phase').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').innerText = 'Game over! See console for details.';
    console.log('Final roles:', players);
}

document.getElementById('start-button').onclick = startGame;
document.getElementById('player-count').onchange = generatePlayerInputs;
