// Obsługa formularza meczu
document.getElementById('match-form').addEventListener('submit', function (e) {
  e.preventDefault();

  // Ustawianie tekstów
  const matchdayValue = document.getElementById('matchday-input').value;
  const teamAValue = document.getElementById('teamA-input').value;
  const teamBValue = document.getElementById('teamB-input').value;

  document.getElementById('matchday').textContent = matchdayValue || '1. kolejka "B" Klasa';

  const teamAEl = document.getElementById('teamA');
  const teamBEl = document.getElementById('teamB');
  teamAEl.textContent = teamAValue || 'Drużyna A';
  teamAEl.setAttribute('title', teamAEl.textContent);
  teamBEl.textContent = teamBValue || 'Drużyna B';
  teamBEl.setAttribute('title', teamBEl.textContent);

  const dateValue = document.getElementById('date-input').value;
  document.getElementById('date').textContent = formatPolishDate(dateValue) || '2025-08-12';

  document.getElementById('time').textContent = document.getElementById('time-input').value || '18:00';
  document.getElementById('location').textContent = document.getElementById('location-input').value || 'Stadion Narodowy';

  // Logo A – usuwanie tła przez backend /api/remove-bg (jeśli dostępny)
  const logoAFile = document.getElementById('logoA-input').files[0];
  if (logoAFile) {
    removeBackground(logoAFile)
      .then(url => { document.getElementById('logoA').src = url; })
      .catch(err => { console.error('Błąd usuwania tła z logo A:', err); });
  }

  // Logo B – usuwanie tła
  const logoBFile = document.getElementById('logoB-input').files[0];
  if (logoBFile) {
    removeBackground(logoBFile)
      .then(url => { document.getElementById('logoB').src = url; })
      .catch(err => { console.error('Błąd usuwania tła z logo B:', err); });
  }
});

// Pobieranie plakatu jako PNG (2x skala dla lepszej ostrości)
document.getElementById('download-btn').addEventListener('click', () => {
  const poster = document.getElementById('poster');

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
  });
});

// Funkcja usuwania tła z obrazu przez API remove.bg (własny backend /api/remove-bg)
async function removeBackground(file) {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async function () {
      const base64 = reader.result.split(',')[1];

      try {
        const response = await fetch('/api/remove-bg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });

        if (!response.ok) {
          const errorText = await response.text();
          return reject(errorText);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        resolve(url);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject('Błąd odczytu pliku');
    reader.readAsDataURL(file);
  });
}

// Formatowanie daty na polski zapis z dniem tygodnia
function formatPolishDate(dateStr) {
  if (!dateStr) return '';
  const dni = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const miesiace = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
  ];

  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;

  const dzien = date.getDate();
  const miesiac = miesiace[date.getMonth()];
  const rok = date.getFullYear();
  const dzienTygodnia = dni[date.getDay()];

  return `${dzien} ${miesiac} ${rok} (${dzienTygodnia})`;
}

// Obsługa wyboru typu meczu (liga/puchar)
const matchTypeSelect = document.getElementById('match-type');
const poster = document.getElementById('poster');
const cornerLogo = document.getElementById('corner-logo');
const matchdayBar = document.getElementById('matchday-bar');

function updateMatchType() {
  const type = matchTypeSelect.value;

  if (type === 'liga') {
    poster.style.backgroundImage = "url('assets/bg_liga.png')";
    cornerLogo.src = 'assets/logo_liga.png';
  } else {
    poster.style.backgroundImage = "url('assets/bg_puchar.png')";
    cornerLogo.src = 'assets/logo_puchar-2.png';
  }

  // Jeden pasek: kolor przez zmienną CSS
  const barColor = (type === 'liga') ? '#e4022e' : '#8cbe39'; // czerwony / zielony
  matchdayBar.style.setProperty('--bar-color', barColor);
}

// Zmień tło i logo po zmianie wyboru
matchTypeSelect.addEventListener('change', updateMatchType);

// Ustaw domyślny typ meczu oraz datę i godzinę po załadowaniu strony
window.addEventListener('DOMContentLoaded', () => {
  updateMatchType();

  const dateInput = document.getElementById('date-input');
  const timeInput = document.getElementById('time-input');
  if (dateInput) {
    const today = new Date();
    dateInput.valueAsDate = today;
  }
  if (timeInput) {
    timeInput.value = "18:00";
  }
});

// Obsługa przycisku "Wyczyść" (wraca do wartości z makiety)
document.getElementById('reset-btn').addEventListener('click', () => {
  document.getElementById('match-form').reset();

  document.getElementById('matchday').textContent = '1. kolejka "B" Klasa';
  document.getElementById('teamA').textContent = 'Drużyna A';
  document.getElementById('teamA').setAttribute('title', 'Drużyna A');
  document.getElementById('teamB').textContent = 'Drużyna B';
  document.getElementById('teamB').setAttribute('title', 'Drużyna B');
  document.getElementById('logoA').src = '';
  document.getElementById('logoB').src = '';
  document.getElementById('date').textContent = '2025-08-12';
  document.getElementById('time').textContent = '18:00';
  document.getElementById('location').textContent = 'Stadion Narodowy';

  // Pola formularza
  const dateInput = document.getElementById('date-input');
  const timeInput = document.getElementById('time-input');
  if (dateInput) dateInput.valueAsDate = new Date();
  if (timeInput) timeInput.value = '18:00';

  matchTypeSelect.value = 'liga';
  updateMatchType();
});

// Podgląd logo po wyborze pliku (bez usuwania tła)
function handleLogoInput(inputId, imgId) {
  const input = document.getElementById(inputId);
  const img = document.getElementById(imgId);

  input.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) {
      img.src = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Wybrany plik nie jest obrazem!');
      this.value = '';
      img.src = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) { img.src = e.target.result; };
    reader.readAsDataURL(file);
  });
}

// Obsługa logo gospodarza i gości (podgląd)
handleLogoInput('logoA-input', 'logoA');
handleLogoInput('logoB-input', 'logoB');
