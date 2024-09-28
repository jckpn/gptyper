 $(function() {
    // just focus editor in case it's not already
    window.quillEditor.focus();

    setTimeout(function() {
        $('.loading-overlay').removeClass('first-loading-overlay-active');
    }, 400);
});