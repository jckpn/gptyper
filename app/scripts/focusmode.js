// that way single class controls hiding behaviour
// also - make text start with the margin always since toolbar will only hide on scroll
// with 'auto'
// add an 'always' option to always hide it unless mouse hover (just permanently assign class)

window.toolbarHidden = false; // refers to the toolbar's state, not if it's visible

// check for mouse move near toolbar when hidden
$(document).on('mousemove', function(e) {
    if ($('.menus-container').hasClass('overlay-active')) return; // ignore if a toolbar menu open
    if (!window.toolbarHidden) return;

    if (e.clientY < 50) {
        $('body').removeClass('toolbar-hidden');
    } else {
        $('body').addClass('toolbar-hidden');
    }
});

// check for scroll
$('.ql-editor').on('scroll', function(e) {
    checkIfTextObscured(e);
});

// since scroll can occur from typing
$('.ql-editor').on('keydown', function(e) {

    if (window.localStorage.getItem('focusmode') == 'keydown') {
        $('body').addClass('toolbar-hidden');
        window.toolbarHidden = true;
    } else {
        checkIfTextObscured(e);
    }
});

function checkIfTextObscured(e) {
    if (window.localStorage.getItem('focusmode') !== 'scroll') return;
    // if ($(window).width() >= 830 || $(window).height() >= 750) return;

    if (e.target.scrollTop > 40) { //  text under toolbar
        $('body').addClass('toolbar-hidden');
        window.toolbarHidden = true;
    } else {
        $('body').removeClass('toolbar-hidden');
        window.toolbarHidden = false;
    }
}