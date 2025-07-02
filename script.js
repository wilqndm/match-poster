document.getElementById('match-form').addEventListener('submit', function (e) {
  e.preventDefault();

  updatePosterContent('preview');
  updatePosterContent('render');

  const logoAFile = document.getElementById('logoA-input').files[0];
  if (logoAFile) {
    removeBackground(logoAFile).then(url => {
      document.getElementById('logoA').src = url;
      document.getElementById('logoA-preview').src = url;
    }).catch(err => {
      console.error('Błąd usuwania tła z logo A:', err);
      alert('Nie udało się usunąć tła z logo A.');
    });
  }

  const logoBFile = document.getElementById('logoB-input').files[0];
  if (logoBFile) {
    removeBackground(logoBFile).then(url => {
      document.getElementById('logoB').src = url;
      document.getElementById('logoB-preview').src = url;
    }).catch(err => {
      console.error('Błąd usuwania tła z logo B:', err);
      alert('Nie udało się usunąć tła z logo B.');
    });
  }
});

document.getElementById('download-btn').addEventListener('click', () => {
  const poster = document.getElementById('poster-render');

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

function updatePosterContent(type) {
  const suffix = type === 'preview' ? '-preview' : '';

  const matchday = document.getElementById('matchday-input').value;
  const teamA = document.getElementById('teamA-input').value;
  const teamB = document.getElementById('teamB-input').value;
  const date = document.getElementById('date-input').value;
  const time = document.getElementById('time-input').value;
  const location = document.getElementById('location-input').value;

  document.getElementById(`matchday${suffix}`).textContent = `${matchday}. kolejka B Klasa`;
  document.getElementById(`teamA${suffix}`).textContent = teamA;
  document.getElementById(`teamB${suffix}`).textContent = teamB;
  document.getElementById(`date${suffix}`).textContent = formatPolishDate(date);
  document.getElementById(`time${suffix}`).textContent = time;
  document.getElementById(`location${suffix}`).textContent = location;
}

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
