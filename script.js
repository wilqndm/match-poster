document.getElementById('match-form').addEventListener('submit', function (e) {
  e.preventDefault();

  document.getElementById('matchday').textContent = document.getElementById('matchday-input').value;
  document.getElementById('teamA').textContent = document.getElementById('teamA-input').value;
  document.getElementById('teamB').textContent = document.getElementById('teamB-input').value;

  const dateValue = document.getElementById('date-input').value;
  document.getElementById('date').textContent = formatPolishDate(dateValue);
  document.getElementById('time').textContent = document.getElementById('time-input').value;
  document.getElementById('location').textContent = document.getElementById('location-input').value;

  const logoAFile = document.getElementById('logoA-input').files[0];
  if (logoAFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('logoA').src = e.target.result;
    };
    reader.readAsDataURL(logoAFile);
  }

  const logoBFile = document.getElementById('logoB-input').files[0];
  if (logoBFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('logoB').src = e.target.result;
    };
    reader.readAsDataURL(logoBFile);
  }
});

document.getElementById('download-btn').addEventListener('click', () => {
  const poster = document.getElementById('poster');

  // zapamiętaj skalę
  const oldTransform = poster.style.transform;
  poster.style.transform = 'scale(1)';

  html2canvas(poster, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    scale: 2
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'match-poster.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    // przywróć podgląd 50%
    poster.style.transform = oldTransform;
  });
});

function formatPolishDate(dateStr) {
  const dni = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const miesiace = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
  ];

  const date = new Date(dateStr);
  if (isNaN(date)) return '';
  const dzien = date.getDate();
  const miesiac = miesiace[date.getMonth()];
  const rok = date.getFullYear();
  const dzienTygodnia = dni[date.getDay()];
  return `${dzien} ${miesiac} ${rok} (${dzienTygodnia})`;
}

const matchTypeSelect = document.getElementById('match-type');
const poster = document.getElementById('poster');
const cornerLogo = document.getElementById('corner-logo');
const matchdayBarShape = document.getElementById('matchday-bar-shape');

function updateMatchType() {
  const type = matchTypeSelect.value;
  if (type === 'liga') {
    poster.style.backgroundImage = "url('assets/bg_liga.png')";
    cornerLogo.src = 'assets/logo_liga.png';
    if (matchdayBarShape) matchdayBarShape.setAttribute('fill', '#e4022e');
  } else if (type === 'puchar') {
    poster.style.backgroundImage = "url('assets/bg_puchar.png')";
    cornerLogo.src = 'assets/logo_puchar-2.png';
    if (matchdayBarShape) matchdayBarShape.setAttribute('fill', '#8cbe39');
  }
}

matchTypeSelect.addEventListener('change', updateMatchType);

window.addEventListener('DOMContentLoaded', () => {
  updateMatchType();
  const dateInput = document.getElementById('date-input');
  const timeInput = document.getElementById('time-input');
  if (dateInput) {
    const today = new Date();
    dateInput.valueAsDate = today;
    const dateEl = document.getElementById('date');
    if (dateEl) dateEl.textContent = formatPolishDate(dateInput.value);
  }
  if (timeInput) {
    timeInput.value = '18:00';
    const timeEl = document.getElementById('time');
    if (timeEl) timeEl.textContent = timeInput.value;
  }
});

document.getElementById('reset-btn').addEventListener('click', () => {
  document.getElementById('match-form').reset();
  document.getElementById('matchday').textContent = '1. kolejka "B" Klasa';
  document.getElementById('teamA').textContent = 'Drużyna A';
  document.getElementById('teamB').textContent = 'Drużyna B';
  document.getElementById('logoA').src = '';
  document.getElementById('logoB').src = '';
  document.getElementById('date').textContent = '2025-08-12';
  document.getElementById('time').textContent = '18:00';
  document.getElementById('location').textContent = 'Stadion Narodowy';
  matchTypeSelect.value = 'liga';
  updateMatchType();
});
