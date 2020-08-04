(() => {
  const btn = document.getElementById('notification-on');
  btn.addEventListener('click', () => {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        new Notification('Ciao!');
      }
    });
  });
})();