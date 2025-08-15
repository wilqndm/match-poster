// Obsługa formularza meczu
document.getElementById('match-form').addEventListener('submit', function (e) {
  e.preventDefault();

  // Ustawianie tekstów
  const matchdayValue = document.getElementById('matchday-input').value;
  const teamAValue = document.getElementById('teamA-input').value;
  const teamBValue = document.getElementById('teamB-input').value;

  document.getElementById('matchday').textContent = matchdayValue || '1. kolejka "B" Klasa';

  document.getElementById('teamA').textContent = teamAValue || 'Drużyna A';
  document.getElementById('teamA').setAttribute('title', document.getElementById('teamA').textContent);

  document.getElementById('teamB').textContent = teamBValue || 'Drużyna B';
  document.getElementById('teamB').setAttribute('title', document.getElementById('teamB').textContent);

  const dateValue = document.getElementById('date-input').value;
  document.getElementById('date').textContent = formatPolishDate(dateValue);

  document.getElementById('time').textContent = document.getElementById('time-input').value || '18:00';
  document.getElementById('location').textContent = document.getElementById('location-input').value || 'Stadion Narodowy';

  // Logo A – usuwanie tła przez backend /api/remove-bg (jeśli działa),
  // w razie błędu, pozostanie podgląd z "handleLogoInput".
  const logoAFile = document.getElementById('logoA-input').files[0];
  if (logoAFile) {
    removeBackground(logoAFile)
      .then(url => {
        document.getElementById('logoA').src = url;
      })
      .catch(err => {
        console.error('Błąd usuwania tła z logo A:', err);
        // alert opcjonalny, ale nie psujemy podglądu:
        // alert('Nie udało się usunąć tła z logo A.');
      });
  }

  // Logo B – usuwanie tła
  const logoBFile = document.getElementById('logoB-input').files[0];
  if (logoBFile) {
    removeBackground(logoBFile)
      .then(url => {
        document.getElementById('logoB').src = url;
      })
      .catch(err => {
        console.error('Błąd usuwania tła z logo B:', err);
        // alert('Nie udało się usunąć tła z logo B.');
      });
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

// Formatowanie daty na polski zapis z dniem tygodnia (odporne na puste i strefy)
function formatPolishDate(dateStr) {
  if (!dateStr) return '';
  const dni = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const miesiace = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
  ];

  // wymuś północ lokalną by uniknąć przesunięć
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
  } else if (type === 'puchar') {
    poster.style.backgroundImage = "url('assets/bg_puchar.png')";
    cornerLogo.src = 'assets/logo_puchar-2.png';
  }

  // Zmiana koloru paska (SVG polygon fill):
  const polygon = matchdayBar?.querySelector('polygon');
  const barColor = (type === 'liga') ? '#e4022e' : '#8cbe39'; // czerwony / zielony
  if (polygon) polygon.setAttribute('fill', barColor);
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
    // Od razu pokaż sformatowaną datę w podglądzie
    document.getElementById('date').textContent = formatPolishDate(today.toISOString().slice(0, 10));
  }

  if (timeInput) {
    timeInput.value = "18:00";
  }
});

// Obsługa przycisku "Wyczyść"
document.getElementById('reset-btn').addEventListener('click', () => {
  const form = document.getElementById('match-form');
  form.reset();

  // Reset podglądu do rozsądnych wartości
  document.getElementById('matchday').textContent = '1. kolejka "B" Klasa';
  document.getElementById('teamA').textContent = 'Drużyna A';
  document.getElementById('teamA').setAttribute('title', 'Drużyna A');
  document.getElementById('teamB').textContent = 'Drużyna B';
  document.getElementById('teamB').setAttribute('title', 'Drużyna B');
  document.getElementById('logoA').src = '';
  document.getElementById('logoB').src = '';

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  document.getElementById('date').textContent = formatPolishDate(todayISO);
  document.getElementById('time').textContent = '18:00';
  document.getElementById('location').textContent = 'Stadion Narodowy';

  // Ustaw również pola formularza na domyślne
  const dateInput = document.getElementById('date-input');
  const timeInput = document.getElementById('time-input');
  if (dateInput) dateInput.valueAsDate = today;
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
    reader.onload = function (e) {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Obsługa logo gospodarza i gości (podgląd)
handleLogoInput('logoA-input', 'logoA');
handleLogoInput('logoB-input', 'logoB');
