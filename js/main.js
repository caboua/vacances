document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bookingForm");
  const result = document.getElementById("bookingResult");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const persons = document.getElementById("persons").value;
    const babies = document.getElementById("babies").value;

    if (!startDate || !endDate || !persons) {
      result.textContent = "Merci de remplir toutes les informations.";
      return;
    }

    const message =
      `Bonjour, je souhaite réserver la Villa Caboua du ${startDate} au ${endDate} pour ${persons} personne(s) et ${babies} bébé(s).`;

    const encodedMessage = encodeURIComponent(message);

    result.innerHTML = `
      Votre demande est prête. 
      <br><br>
      <a class="btn-primary" href="mailto:villa.caboua@gmail.com?subject=Demande de réservation Villa Caboua&body=${encodedMessage}">
        Envoyer la demande par email
      </a>
    `;
  });
});
