const poster = document.getElementById('poster');
const cornerLogo = document.getElementById('corner-logo');
const matchdayBarShape = document.getElementById('matchday-bar-shape');

const matchTypeSelect = document.getElementById('match-type');
const matchdayInput = document.getElementById('matchday-input');
const teamAInput = document.getElementById('teamA-input');
const teamBInput = document.getElementById('teamB-input');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const locationInput = document.getElementById('location-input');
const logoAInput = document.getElementById('logoA-input');
const logoBInput = document.getElementById('logoB-input');

const matchday = document.getElementById('matchday');
const teamA = document.getElementById('teamA');
const teamB = document.getElementById('teamB');
const date = document.getElementById('date');
const time = document.getElementById('time');
const locationEl = document.getElementById('location');
const logoA = document.getElementById('logoA');
const logoB = document.getElementById('logoB');

function updateMatchType() {
  const type = matchTypeSelect.value;
  if (type === 'liga') {
    poster.style.backgroundImage = "url('assets/bg_liga.png')";
    cornerLogo.src = 'assets/logo_liga.png';
    matchdayBarShape.style.fill = '#e4022e';
  } else if (type === 'puchar') {
    poster.style.backgroundImage = "url('assets/bg_puchar.png')";
    cornerLogo.src = 'assets/logo_puchar-2.png';
    matchdayBarShape.style.fill = '#8cbe39';
  }
}

matchTypeSelect.addEventListener('change', updateMatchType);

document.getElementById('match-form').addEventListener('submit', e => {
  e.preventDefault();
  matchday.textContent = matchdayInput.value;
  teamA.textContent = teamAInput.value;
  teamB.textContent = teamBInput.value;
  date.textContent = dateInput.value;
  time.textContent = timeInput.value;
  locationEl.textContent = locationInput.value;
});

logoAInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) logoA.src = URL.createObjectURL(file);
});

logoBInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) logoB.src = URL.createObjectURL(file);
});

document.getElementById('download-btn').addEventListener('click', () => {
  poster.style.transform = 'scale(1)'; // pełna skala do zapisu
  html2canvas(poster, {
    backgroundColor: null,
    useCORS: true,
    scale: 1
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'plakat.png';
    link.href = canvas.toDataURL();
    link.click();
    poster.style.transform = 'scale(0.5)'; // powrót do podglądu
  });
});

document.getElementById('reset-btn').addEventListener('click', () => {
  document.getElementById('match-form').reset();
  updateMatchType();
});

updateMatchType();
