document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("match-form");
  const poster = document.getElementById("poster");

  const matchday = document.getElementById("matchday");
  const teamA = document.getElementById("teamA");
  const teamB = document.getElementById("teamB");
  const logoA = document.getElementById("logoA");
  const logoB = document.getElementById("logoB");
  const dateEl = document.getElementById("date");
  const timeEl = document.getElementById("time");
  const locationEl = document.getElementById("location");
  const cornerLogo = document.getElementById("corner-logo");

  const matchTypeSelect = document.getElementById("match-type");
  const downloadBtn = document.getElementById("download-btn");
  const resetBtn = document.getElementById("reset-btn");

  // Zmiana tła wg typu meczu
  matchTypeSelect.addEventListener("change", () => {
    updateBackground();
  });

  function updateBackground() {
    const type = matchTypeSelect.value;
    poster.style.backgroundImage = `url(assets/bg_${type}.png)`;
    cornerLogo.src = `assets/logo_${type}.png`;
  }
  updateBackground();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    matchday.textContent = document.getElementById("matchday-input").value;
    teamA.textContent = document.getElementById("teamA-input").value;
    teamB.textContent = document.getElementById("teamB-input").value;
    dateEl.textContent = document.getElementById("date-input").value;
    timeEl.textContent = document.getElementById("time-input").value;
    locationEl.textContent = document.getElementById("location-input").value;

    const fileA = document.getElementById("logoA-input").files[0];
    if (fileA) {
      const reader = new FileReader();
      reader.onload = () => (logoA.src = reader.result);
      reader.readAsDataURL(fileA);
    }

    const fileB = document.getElementById("logoB-input").files[0];
    if (fileB) {
      const reader = new FileReader();
      reader.onload = () => (logoB.src = reader.result);
      reader.readAsDataURL(fileB);
    }
  });

  downloadBtn.addEventListener("click", () => {
    const scaleBackup = document.querySelector(".poster-wrapper").style.transform;
    document.querySelector(".poster-wrapper").style.transform = "scale(1)";

    html2canvas(poster, {
      scale: 1,
      width: poster.offsetWidth,
      height: poster.offsetHeight
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "plakat.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      document.querySelector(".poster-wrapper").style.transform = scaleBackup;
    });
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    matchday.textContent = '1. kolejka "B" Klasa';
    teamA.textContent = "Drużyna A";
    teamB.textContent = "Drużyna B";
    logoA.src = "";
    logoB.src = "";
    dateEl.textContent = "2025-08-12";
    timeEl.textContent = "18:00";
    locationEl.textContent = "Stadion Narodowy";
    updateBackground();
  });
});
