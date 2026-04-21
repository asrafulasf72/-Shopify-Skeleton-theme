  document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.learning-lab');

    sections.forEach((sectionRoot) => {
      const dialog = sectionRoot.querySelector('.learning-lab__dialog');
      const openButton = sectionRoot.querySelector('[data-learning-lab-open-dialog]');
      const closeButton = sectionRoot.querySelector('[data-learning-lab-close-dialog]');
      const supportsViewTransitions = typeof document.startViewTransition === 'function';

      if (!dialog || !openButton || !closeButton) return;

      const openDialog = () => {
        if (dialog.open) return;

        const show = () => {
          dialog.showModal();
          const title = dialog.querySelector('.learning-lab__dialog-title');
          if (title) title.focus();
        };

        if (supportsViewTransitions) {
          document.startViewTransition(show);
        } else {
          show();
        }
      };

      const closeDialog = () => {
        if (!dialog.open) return;

        const close = () => {
          dialog.close();
          openButton.focus();
        };

        if (supportsViewTransitions) {
          document.startViewTransition(close);
        } else {
          close();
        }
      };

      openButton.addEventListener('click', openDialog);

      openButton.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDialog();
        }
      });

      closeButton.addEventListener('click', (event) => {
        event.preventDefault();
        closeDialog();
      });

      dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeDialog();
      });

      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
          closeDialog();
        }
      });

      dialog.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          closeDialog();
        }
      });
    });
  });