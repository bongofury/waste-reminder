(async () => {
  const mainEl = document.getElementsByTagName('main')[0];
  try {
    const garbageResponse = await window.fetch('/.netlify/functions/garbage')
      .then((res) => res.json());
    const { items, date } = garbageResponse;

    const currentDate = (new Date()).getDate();
    const responseDate = parseInt(date.slice(-2), 10);

    const isToday = currentDate === responseDate;

    const time = isToday ? 'Oggi' : 'Domani';

    const content = `
      <p>${time} ${items.length
    ? `si ritira:
          <ul>
            ${(items.map((i) => `<li class="${i}">${i}</li>`)).join('')}
          </ul>
        `
    : 'non si ritira la spazzatura'
  }
      </p>
    `;

    mainEl.innerHTML = content;
  } catch (e) {
    mainEl.innerHTML = `
      <p>Errore! ${e}</p>
    `;
  }
})();
