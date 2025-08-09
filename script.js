// Obsługa formularza meczu
document.getElementById('match-form').addEventListener('submit', function (e) {
  e.preventDefault();

  // Ustawianie tekstów
   document.getElementById('matchday').textContent = `${document.getElementById('matchday-input').value}. kolejka "B" Klasa`;
  document.getElementById('teamA').textContent = document.getElementById('teamA-input').value;
  document.getElementById('teamB').textContent = document.getElementById('teamB-input').value;

  const dateValue = document.getElementById('date-input').value;
  document.getElementById('date').textContent = formatPolishDate(dateValue);

  document.getElementById('time').textContent = document.getElementById('time-input').value;
  document.getElementById('location').textContent = document.getElementById('location-input').value;

  // Logo A – usuwanie tła
  const logoAFile = document.getElementById('logoA-input').files[0];
  if (logoAFile) {
    removeBackground(logoAFile)
      .then(url => {
        document.getElementById('logoA').src = url;
      })
      .catch(err => {
        console.error('Błąd usuwania tła z logo A:', err);
        alert('Nie udało się usunąć tła z logo A.');
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
        alert('Nie udało się usunąć tła z logo B.');
      });
  }
});

// Pobieranie plakatu jako PNG
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

// Funkcja usuwająca tło z obrazu przez API remove.bg
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

// Funkcja formatująca datę na polski zapis z dniem tygodnia
function formatPolishDate(dateStr) {
  const dni = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const miesiace = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
  ];

  const date = new Date(dateStr);
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
    matchdayBar.style.background = '#e4022e'; // czerwony
  } else if (type === 'puchar') {
    poster.style.backgroundImage = "url('assets/bg_puchar.png')";
    cornerLogo.src = 'assets/logo_puchar.jpg';
    matchdayBar.style.background = '#8cbe39'; // zielony
  }
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

// Obsługa przycisku "Wyczyść"
document.getElementById('reset-btn').addEventListener('click', () => {
  document.getElementById('match-form').reset();
  // Resetuj podgląd plakatu do wartości domyślnych
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

// Obsługa logo gospodarza i gości (podgląd przy wyborze pliku)
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
