(function (){
    'use strict';

    /** -- UTILITIES -- */

    function getFocusable(container){
        return Array.from(
            container.querySelectorAll(
                'a[herf], button:not([disabled]), input:not([disabled]), ' + 
                'select:not([disabled]), textarea:not([disabled])', +
                '[tabindex]:not([tabindex="-1"])'
            )
        ).filter(function (el){
            return !el.closest('[aria-hidden="true"]') && el.offsetParent !== null;
        });
    }
})