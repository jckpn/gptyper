var defaults = {
    'darkmode': 'false', // true, false
    'focusmode': 'scroll', // scroll, true, false
    'numberedhs': 'false', // true, false, sub
    'suggestions': 'fast', // fast, slow, keyboard, off
    'hidefeedback': 'true', // true, false
    'contentType': 'general', // general, lectures, poetry, creative, formal
}

let loadingScreenDelay = 200; // loading screen on file open, settings change, etc.

// for (const [key, value] of Object.entries(defaults)) {
//     if (window.localStorage.getItem(key) == undefined) {
//         window.localStorage.setItem(key, value);
//     }
// }

applySettings();    // apply all settings on renderer load
// might be worth keeping overlay until THIS is done
// rather than just set delay/page load


// TODO: make this more efficient/condenced, a lot of repeated code right now

// set styles and apply settings based on stored settings
function applySettings(loadingText) {
    let hasLoadingScreen = loadingText != '';
    if (hasLoadingScreen) { // use '' to skip loading overlay
        $('.loading-text').text(loadingText);
        $('.loading-overlay').addClass('loading-overlay-active');

        setTimeout(function () {
            $('.loading-overlay').removeClass('loading-overlay-active');
        }, loadingScreenDelay);
    }

    setTimeout(function () {
        // dark mode
        if (window.localStorage.getItem('darkmode') === 'true') {
            $('html').attr('data-theme', 'dark');
            $('.option-darkmode-status').html('Dark');
        } else
            if (window.localStorage.getItem('darkmode') === 'false') {
                $('html').attr('data-theme', 'light');
                $('.option-darkmode-status').html('Light');
            } else {
                // alert('darkmode value is ' + window.localStorage.getItem('darkmode') + ', setting to default');
                window.localStorage.setItem('darkmode', defaults['darkmode']);
                applySettings();
            }

        // focus mode
        if (window.localStorage.getItem('focusmode') === 'scroll') {
            $('.ql-editor').removeClass('editor-remove-top-padding');
            window.toolbarHidden = false;

            $('.option-focusmode-status').html('Auto');
        } else
            if (window.localStorage.getItem('focusmode') === 'true') {
                $('.ql-editor').addClass('editor-remove-top-padding');
                window.toolbarHidden = true;

                $('.option-focusmode-status').html('Always');
            } else
                if (window.localStorage.getItem('focusmode') === 'false') {
                    $('.ql-editor').removeClass('editor-remove-top-padding');
                    window.toolbarHidden = false;

                    $('.option-focusmode-status').html('Never');
                } else {
                    // alert('focusmode value is ' + window.localStorage.getItem('focusmode') + ', setting to default');
                    window.localStorage.setItem('focusmode', defaults['focusmode']);
                    applySettings();
                }

        // numbered headings
        if (window.localStorage.getItem('numberedhs') === 'true') { // default is false
            $('body').addClass('numberedhs-enabled');
            $('body').removeClass('numberedhs-noh1');
            $('.option-numberedhs-status').html('All');
        } else if (window.localStorage.getItem('numberedhs') === 'false') {
            $('body').removeClass('numberedhs-enabled numberedhs-noh1');
            $('.option-numberedhs-status').html('None');
        } else if (window.localStorage.getItem('numberedhs') === 'sub') {
            $('body').addClass('numberedhs-enabled numberedhs-noh1');
            $('.option-numberedhs-status').html('Sub');
        } else {
            // alert('numberedhs value is ' + window.localStorage.getItem('numberedhs') + ', setting to default');
            window.localStorage.setItem('numberedhs', defaults['numberedhs']);
            // applySettings();
        }

        // suggestions
        if (window.localStorage.getItem('suggestions') === 'fast') {
            $('.option-suggestions-status').html('Auto');
            $('.gpt-button img').attr('src', 'assets/icons/gpt-explain.png');
        } else if (window.localStorage.getItem('suggestions') === 'slow') {
            $('.option-suggestions-status').html('Delayed');
            $('.gpt-button img').attr('src', 'assets/icons/gpt-explain.png');
        } else if (window.localStorage.getItem('suggestions') === 'keyboard') {
            $('.option-suggestions-status').html('Tab Key');
            $('.gpt-button img').attr('src', 'assets/icons/gpt-explain.png');
            // $('.options-suggestions-delay-status').hide();
        } else if (window.localStorage.getItem('suggestions') === 'off') {
            $('.option-suggestions-status').html('Disabled');
            // $('.options-suggestions-delay-status').hide();
            // change icon to show disabled
            $('.gpt-button img').attr('src', 'assets/icons/gpt-explain-disabled.png');
        } else {
            // alert('suggestions value is ' + window.localStorage.getItem('suggestions') + ', setting to default');
            window.localStorage.setItem('suggestions', defaults['suggestions']);
            applySettings();
        }

        // suggestion content tailoring
        if (window.localStorage.getItem('contentType') === 'general') {
            $('.option-contenttype-status').html('General');
        } else if (window.localStorage.getItem('contentType') === 'lectures') {
            $('.option-contenttype-status').html('Lectures');
        } else if (window.localStorage.getItem('contentType') === 'poetry') {
            $('.option-contenttype-status').html('Poetry');
        } else if (window.localStorage.getItem('contentType') === 'creative') {
            $('.option-contenttype-status').html('Creative');
        } else if (window.localStorage.getItem('contentType') === 'formal') {
            $('.option-contenttype-status').html('Formal');
        } else {
            // alert('contentType value is ' + window.localStorage.getItem('contentType') + ', setting to default');
            window.localStorage.setItem('contentType', defaults['contentType']);
            applySettings();
        }

        // feedback
        if (window.localStorage.getItem('hidefeedback') === 'true') {
            $('.feedback-button').hide();
        } else if (window.localStorage.getItem('hidefeedback') === 'false') {
            $('.feedback-button').show();
        } else {
            // alert('hidefeedback value is ' + window.localStorage.getItem('hidefeedback') + ', setting to default');
            window.localStorage.setItem('hidefeedback', defaults['hidefeedback']);
            applySettings();
        }

    }, loadingScreenDelay * hasLoadingScreen);

}

$('.settings-button').on('click', () => { openMenuBanner('settings'); });
$('.file-button').on('click', () => { openMenuBanner('file'); });
$('.gpt-button').on('click', () => {
    openMenuBanner('gpt');
});
$('.feedback-button').on('click', () => { openMenuBanner('feedback'); });

function openMenuBanner(menuName) { // can be `file`, `gpt` or `settings`
    let thisButtonClass = menuName + '-button';
    let thisMenuClass = menuName + '-menu-open';
    let isAlreadyOpen = $('.menus-container').hasClass(thisMenuClass);

    closeMenuBanner(); // close any other menu first
    if (!isAlreadyOpen) {
        $('.' + thisButtonClass).addClass('settings-button-active');
        $('.menus-container').addClass('overlay-active ' + thisMenuClass);
        $('.toolbar-bg').addClass('toolbar-bg-expanded');
    }
}

function closeMenuBanner() {
    $('.toolbar-extra').removeClass('settings-button-active');
    $('.menus-container').removeClass('overlay-active feedback-menu-open file-menu-open gpt-menu-open settings-menu-open');
    $('.toolbar-bg').removeClass('toolbar-bg-expanded');
}

$('.ql-editor').on('click', (e) => { closeMenuBanner(); });

$('.settings-menu-option-darkmode').on('click', () => {
    if (window.localStorage.getItem('darkmode') == 'false') {
        window.localStorage.setItem('darkmode', 'true');
    } else if (window.localStorage.getItem('darkmode') == 'true') {
        window.localStorage.setItem('darkmode', 'false');
    }
    applySettings(loadingText = 'Applying Settings');
});

$('.settings-menu-option-focusmode').on('click', () => {
    console.log(window.localStorage.getItem('focusmode'));
    if (window.localStorage.getItem('focusmode') == 'scroll') {
        window.localStorage.setItem('focusmode', 'true');
    } else if (window.localStorage.getItem('focusmode') == 'true') {
        window.localStorage.setItem('focusmode', 'false');
    } else if (window.localStorage.getItem('focusmode') == 'false') {
        window.localStorage.setItem('focusmode', 'scroll');
    }
    applySettings(loadingText = 'Applying Settings');
});

$('.settings-menu-option-numberedhs').on('click', () => {
    if (window.localStorage.getItem('numberedhs') == 'true') {
        window.localStorage.setItem('numberedhs', 'sub');
    } else if (window.localStorage.getItem('numberedhs') == 'sub') {
        window.localStorage.setItem('numberedhs', 'false');
    } else if (window.localStorage.getItem('numberedhs') == 'false') {
        window.localStorage.setItem('numberedhs', 'true');
    }
    applySettings(loadingText = 'Applying Settings');
});

$('.gpt-menu-option-suggestions').on('click', () => {
    if (window.limitReached) return;

    // can be auto, keyboard, or off
    if (window.localStorage.getItem('suggestions') == 'fast') {
        //     window.localStorage.setItem('suggestions', 'slow');
        // } else if (window.localStorage.getItem('suggestions') == 'slow') {
        window.localStorage.setItem('suggestions', 'keyboard');
        // $('.gpt-menu-option-contenttype').show();
    } else if (window.localStorage.getItem('suggestions') == 'keyboard') {
        window.localStorage.setItem('suggestions', 'off');
        // $('.gpt-menu-option-contenttype').hide();
    } else if (window.localStorage.getItem('suggestions') == 'off') {
        window.localStorage.setItem('suggestions', 'fast');
        // $('.gpt-menu-option-contenttype').show();
    }
    applySettings(loadingText = 'Applying Settings');
});

$('.gpt-menu-option-contenttype').on('click', () => {
    if (window.limitReached) return;

    // can be general, lectures, poetry, creative
    if (window.localStorage.getItem('contentType') == 'general') {
        window.localStorage.setItem('contentType', 'lectures');
    } else if (window.localStorage.getItem('contentType') == 'lectures') {
        //     window.localStorage.setItem('contentType', 'poetry');
        // } else if (window.localStorage.getItem('contentType') == 'poetry') {
        window.localStorage.setItem('contentType', 'creative');
    } else if (window.localStorage.getItem('contentType') == 'creative') {
        window.localStorage.setItem('contentType', 'formal');
    } else if (window.localStorage.getItem('contentType') == 'formal') {
        window.localStorage.setItem('contentType', 'general');
    }
    applySettings(loadingText = 'Applying Settings');
});

$('.settings-menu-option-update').on('click', () => {
    window.api.openUrl('https://cavinotes.com');
    setTimeout(function () { closeMenuBanner(); }, 300);
    // the slight hang will indicate something's loading
});

$('.feedback-menu-option-email').on('click', () => {
    window.api.openUrl('mailto:chat@jckpn.me');
    setTimeout(function () { closeMenuBanner(); }, 300);
});

$('.feedback-menu-option-hide').on('click', () => {
    closeMenuBanner();
    window.localStorage.setItem('hidefeedback', 'true');
    applySettings(loadingText = 'Applying Settings');
});

$('.gpt-menu-option-upgrade').on('click', () => {
    window.api.openUrl('https://cavinotes.com');
    setTimeout(function () { closeMenuBanner(); }, 300);
});

$('.gpt-menu-option-apikey').on('click', async () => {
    closeMenuBanner();
    let currentKey = window.localStorage.getItem('apiKey') || '';
    let newKey = await prompt('Enter your API key:', currentKey);
    if (newKey !== null && newKey !== currentKey) {
        window.localStorage.setItem('apiKey', newKey);
        alert('API key set! You may need to refresh the page for changes to take effect.');
    }
});