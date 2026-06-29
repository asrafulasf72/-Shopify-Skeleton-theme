(function () {
    'use strict';

    /** -- UTILITIES -- */

    function getFocusable(container) {
        return Array.from(
            container.querySelectorAll(
                'a[herf], button:not([disabled]), input:not([disabled]), ' +
                'select:not([disabled]), textarea:not([disabled])', +
            '[tabindex]:not([tabindex="-1"])'
            )
        ).filter(function (el) {
            return !el.closest('[aria-hidden="true"]') && el.offsetParent !== null;
        });
    }
    function createFocusTrap(panel) {
        function handleKeydown(e) {
            if (e.key !== 'Tab') return;
            let focusable = getFocusable(panel);
            if (!focusable.length) { e.preventDefault(); return; }
            let first = focusable[0];
            let last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }

        return {
            activate: function () {
                panel.addEventListener('keydown', handleKeydown);
                let focusable = getFocusable(panel);
                if (focusable.length) focusable[0].focus();
            },
            deactivate: function () {
                panel.removeEventListener('keydown', handleKeydown);
            }
        };
    }
})