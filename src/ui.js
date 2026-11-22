
export function showMessage(message) {
  const oldMessage = document.querySelector('.game-toast');

  if (oldMessage) {
    oldMessage.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'game-toast';
  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');

    setTimeout(() => toast.remove(), 250);
  }, 2500);
}

export function createButton(text, onClick) {
  const button = document.createElement('button');

  button.type = 'button';
  button.textContent = text;
  button.addEventListener('click', onClick);

  return button;
}

export function openDialog(title, description) {
  const dialog = document.createElement('div');
  dialog.className = 'game-dialog';

  const panel = document.createElement('div');
  panel.className = 'game-dialog-panel';

  const heading = document.createElement('h2');
  heading.textContent = title;

  const paragraph = document.createElement('p');
  paragraph.textContent = description;

  const close = createButton('닫기', () => dialog.remove());

  panel.append(heading, paragraph, close);
  dialog.appendChild(panel);

  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      dialog.remove();
    }
  });

  document.body.appendChild(dialog);

  return dialog;
}
