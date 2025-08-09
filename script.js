document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("match-form");
  const posterWrapper = document.querySelector(".poster-wrapper");
  const poster = document.getElementById("poster");
  const downloadBtn = document.getElementById("download-btn");
  const resetBtn = document.getElementById("reset-btn");

  let bgImage = new Image();

  // Wczytaj tło i ustaw rozmiar plakatu
  bgImage.src = "assets/bg.jpg"; // ścieżka do pliku tła
  bgImage.onload = () => {
    poster.style.width = bgImage.naturalWidth + "px";
    poster.style.height = bgImage.naturalHeight + "px";
    poster.style.backgroundImage = `url(${bgImage.src})`;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    document.getElementById("matchday").textContent =
      document.getElementById("matchday-input").value;

    document.getElementById("teamA").textContent =
      document.getElementById("teamA-input").value;

    document.getElementById("teamB").textContent =
      document.getElementById("teamB-input").value;

    document.getElementById("date").textContent =
      document.getElementById("date-input").value;

    document.getElementById("time").textContent =
      document.getElementById("time-input").value;

    document.getElementById("location").textContent =
      document.getElementById("location-input").value;

    const logoAInput = document.getElementById("logoA-input");
    if (logoAInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) =>
        (document.getElementById("logoA").src = e.target.result);
      reader.readAsDataURL(logoAInput.files[0]);
    }

    const logoBInput = document.getElementById("logoB-input");
    if (logoBInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) =>
        (document.getElementById("logoB").src = e.target.result);
      reader.readAsDataURL(logoBInput.files[0]);
    }
  });

  downloadBtn.addEventListener("click", () => {
    posterWrapper.style.transform = "scale(1)";

    html2canvas(poster, {
      backgroundColor: null,
      scale: 1,
      useCORS: true
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "plakat.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      posterWrapper.style.transform = "scale(0.5)";
    });
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
  });
});
