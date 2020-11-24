(async () => {
  const mainEl = document.getElementsByTagName('main')[0];
  try {
    const garbageResponse = await window.fetch('/.netlify/functions/garbage')
      .then((res) => res.json());
    const { items, date } = garbageResponse;
    mainEl.innerHTML = `
      <p>Domani (giorno ${date}) ritirano:
        <ul>
          ${items.map((i) => `<li>${i}</li>`)}
        </ul>
      </p>
    `;
  } catch (e) {
    mainEl.innerHTML = `
      <p>Errore! ${e}</p>
    `;
  }
})();
