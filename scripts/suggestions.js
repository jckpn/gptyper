import { getCompletion } from './get-completion.js';


const suggestionDelay = 1000;
var suggestionTimer = null;
var suggestionData = {
    status: 0, // 0: none/cancelled, 1: loading, 2: visible
    index: 0,
    text: '',
}

function loadSuggestion() {
    suggestionData.status = 1;

    suggestionData.index = window.quill.getSelection().index;
    showSuggestionDots();

    getCompletion(suggestionData.index).then((response) => {
        suggestionData.text = response;

        showSuggestion();
    });
}

function showSuggestion() {
    suggestionData.status = 2;
    hideSuggestionDots();

    window.quill.insertText(
        suggestionData.index,
        suggestionData.text,
        { color: '#ccc', italic: true, },
        'silent',
    );
}

function acceptSuggestion() {
    suggestionData.status = 0;

    window.quill.insertText(
        suggestionData.index,
        suggestionData.text,
        'silent',
    );
}


function cancelSuggestion() {
    suggestionData.status = 0;

    hideSuggestionDots();
    clearTimeout(suggestionTimer);
}


$(document).on('keydown', (keydownEvent) => {
    cancelSuggestion();

    suggestionTimer = setTimeout(loadSuggestion, suggestionDelay);
});


// SUGGESTION DOTS

export function showSuggestionDots() {
    // insert dots element at suggestion pos
    let cursorPos = window.quill.getBounds(suggestionData.index);
    let editorOffset = $('.ql-editor').offset();

    $('.suggestion-dots-container')
        .css({
            top: cursorPos.top + editorOffset.top - 30, // random offset?
            left: cursorPos.left + editorOffset.left - 27,
        });

    $('.suggestion-dots-container').addClass('visible');
}

export function hideSuggestionDots() {
    $('.suggestion-dots-container').removeClass('visible');
}

// listen for resize to reposition suggestion dots
$(window).resize(() => {
    if (suggestionData.status == 1) {
        showSuggestionDots();
    }
});