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

function generateMatchDescription(data) {
  const { teamA, teamB, date, time, location } = data;

  const slogans = [
    'Wszyscy na stadion!',
    'Nie przegap tego starcia!',
    'To będzie mecz pełen emocji!',
    'Liczymy na Wasz doping!',
    'Czas na piłkarskie widowisko!'
  ];

  const slogan = slogans[Math.floor(Math.random() * slogans.length)];

  return `Już ${date} o ${time} na ${location} zmierzą się ${teamA} i ${teamB}. ${slogan}`;
}

