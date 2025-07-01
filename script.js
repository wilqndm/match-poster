document.getElementById('match-form').addEventListener('submit', function (e) {
  e.preventDefault();

  document.getElementById('matchday').textContent = `${document.getElementById('matchday-input').value}. kolejka "B" Klasa`;
  document.getElementById('teamA').textContent = document.getElementById('teamA-input').value;
  document.getElementById('teamB').textContent = document.getElementById('teamB-input').value;
  document.getElementById('date').textContent = document.getElementById('date-input').value;
  document.getElementById('time').textContent = document.getElementById('time-input').value;
  document.getElementById('location').textContent = document.getElementById('location-input').value;

  const logoAFile = document.getElementById('logoA-input').files[0];
  if (logoAFile) {
    const readerA = new FileReader();
    readerA.onload = function (e) {
      document.getElementById('logoA').src = e.target.result;
    };
    readerA.readAsDataURL(logoAFile);
  }

  const logoBFile = document.getElementById('logoB-input').files[0];
  if (logoBFile) {
    const readerB = new FileReader();
    readerB.onload = function (e) {
      document.getElementById('logoB').src = e.target.result;
    };
    readerB.readAsDataURL(logoBFile);
  }
});

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
async function removeBackground(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async function () {
      const base64 = reader.result.split(',')[1];

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 })
      });

      if (!response.ok) {
        reject('Błąd usuwania tła');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      resolve(url);
    };
    reader.readAsDataURL(file);
  });
}

