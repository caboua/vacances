document.addEventListener("DOMContentLoaded", () => {
    return true;
  }

  function handleReservation(event) {
    if (event) event.preventDefault();

    if (!startDate || !endDate) {
      alert("Sélectionnez vos dates");
      return;
    }

    if (!isRangeAvailable(startDate, endDate)) {
      alert("❌ Dates indisponibles");
      return;
    }

    const nights = (endDate - startDate) / (1000 * 60 * 60 * 24);

    if (nights < 2) {
      alert("Minimum 2 nuits");
      return;
    }

    const nightPrice = getNightPrice(persons);
    const total = nightPrice * nights;

    const subject = encodeURIComponent("Réservation Villa CABOUA");

    const body = encodeURIComponent(`Bonjour,

Je souhaite réserver la Villa CABOUA.

Dates :
Du ${startDate.toLocaleDateString("fr-FR")}
au ${endDate.toLocaleDateString("fr-FR")}

Nombre de nuits : ${nights}

Nombre de personnes : ${persons}
Bébés de moins de 2 ans : ${babies}

Tarif :
${nights} nuit(s) x ${nightPrice} €

Total : ${total} €

Merci.`);

    window.location.href = `mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;
  }

  btn.addEventListener("click", handleReservation, { passive:false });

  let touched = false;

  btn.addEventListener("touchend", (e) => {
    if (touched) return;

    touched = true;
    handleReservation(e);

    setTimeout(() => {
      touched = false;
    }, 500);
  }, { passive:false });
});
