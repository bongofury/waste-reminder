(async () => {
  const mainEl = document.getElementsByTagName('main')[0];
  try {
    const garbageResponse = await window.fetch('/.netlify/functions/garbage')
      .then((res) => res.json());
    const { items, date } = garbageResponse;
    mainEl.innerHTML = items.length
      ? `<p>Domani (giorno ${date}) ritirano:
          <ul>
            ${(items.map((i) => `<li>${i}</li>`)).join('')}
          </ul>
        </p>`
      : `<p>Domani (giorno ${date}) non si ritira la spazzatura</p>`;
  } catch (e) {
    mainEl.innerHTML = `
      <p>Errore! ${e}</p>
    `;
  }
})();
