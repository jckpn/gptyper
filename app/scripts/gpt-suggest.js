var currentSuggestion = {
    enabled: true,
    canShowSuggestion: false,
    rateLimited: false,
    index: 0, // cursor index
    text: ""
};

let typingTimer;
let waitTime = 1000;

// cancel suggestion if user clicked on text outside of suggestion
window.quillEditor.on('selection-change', () => {
    if ($('.ql-editor a').length == 0) {
        clearTimeout(typingTimer);
        currentSuggestion.canShowSuggestion = false;
    } else {
        let newIndex = window.quillEditor.getSelection().index;
        let suggestionRange = currentSuggestion.index + currentSuggestion.text.length;
        if (newIndex < currentSuggestion.index || newIndex > suggestionRange)
            cancelSuggestion();
    }
});

$('.toolbar-bg, .toolbar-extra, .ql-editor').on('click', () => { cancelSuggestion(); });
$('.ql-editor').on('click', () => { cancelSuggestion(); });

$(document).on('keydown', (e) => {
    if (!currentSuggestion.enabled) return;

    if (e.keyCode == 9) { // tab key
        e.preventDefault(); // default is to change focus, since we disabled tab in editor-setup.js

        if (currentSuggestion.text != ""
            && currentSuggestion.canShowSuggestion) {
            insertSuggestion();
        } else if (window.localStorage.getItem('suggestions') == 'keyboard') {
            // tab to force generate suggestion
            generateSuggestion();
        } else {
            // just insert tab key
            // window.quillEditor.insertText(
            //     window.quillEditor.getSelection().index,
            //     '\t',
            //     source = 'silent');

            cancelSuggestion();
        }

    } else if (e.keyCode != 9) { // not tab key
        cancelSuggestion(); // cancel suggestion since typing something else

        if (window.localStorage.getItem('suggestions') === 'fast'
            || window.localStorage.getItem('suggestions') === 'slow') {

            // AUTO SUGGESTIONS
            clearTimeout(typingTimer); // new keydown -> still typing -> reset timer
            currentSuggestion.canShowSuggestion = false;

            typingTimer = setTimeout(() => {
                if (currentSuggestion.rateLimited) {
                    console.log('GPT DEBUG: rate limited - cancelling');
                    return;
                }

                // check next character a) doesn't exist or b) new line
                // if so can proceed with suggestion at end of line
                // (don't want to auto-suggest in middle of a line/paragraph)
                let text = window.quillEditor.getText();
                let index = window.quillEditor.getSelection().index;
                let nextChar = text[index];
                let lastChar = text[index - 1];

                if (nextChar == '\n' || nextChar == '' || nextChar == undefined) {
                    //&& (lastChar != '\n')) && lastChar == ' ')) {
                    console.log('GPT DEBUG: calling for suggestion - cursor at end of line');
                    generateSuggestion();
                } else {
                    console.log('GPT DEBUG: not calling for suggestion');
                }

            }, waitTime);
        }
    }
});

async function generateSuggestion() {
    // if (!window.connectionSuccess) return;

    currentSuggestion.index = window.quillEditor.getSelection().index;
    // to check for cursor change later

    let contextWordLimit = 30; // words (1 word ~= 0.75 tokens)
    let minContextChars = 2; // chars

    let editorText = window.quillEditor.getText().slice(0, currentSuggestion.index);
    editorText = editorText.replace(/\n/g, ' '); // remove newlines from str
    let contextWords = editorText.split(' ');

    if (editorText.length < minContextChars) {
        console.log('GPT DEBUG: cancelled prediction - not enough context');
        return;
    }

    let contextStr = contextWords.length > contextWordLimit
        ? contextWords.slice(contextWords.length - contextWordLimit).join(' ')
        : contextWords.join(' ');

    // show loading dots where cursor is
    let cursorPos = window.quillEditor.getBounds(currentSuggestion.index);
    $('.gpt-loading-dots')
        .css({
            top: cursorPos.top,
            left: cursorPos.left
        })
        .addClass('gpt-loading-dots-visible');
    currentSuggestion.canShowSuggestion = true;

    console.log('GPT DEBUG: sending API request');
    apiKey = window.localStorage.getItem('apiKey');
    let gptResponse = runSuggestionGPT(contextStr, apiKey);

    gptResponse.then(function (result) {
        // see if first part is 'Error:'
        if (result.slice(0, 6) == 'Error:') {
            $('.gpt-button img').attr('src', 'assets/icons/gpt-explain-error.png');
        } else {
            $('.gpt-button img').attr('src', 'assets/icons/gpt-explain.png');
        }

        console.log('GPT DEBUG: API response received: ' + result);
        if (currentSuggestion.canShowSuggestion) {
            $('.gpt-loading-dots').removeClass('gpt-loading-dots-visible');

            if (currentSuggestion.index != window.quillEditor.getSelection().index) {
                // user has changed where they're typing, cancel suggestion
                cancelSuggestion();
                return;
            };

            // add space to start if needed
            // let lastChar = contextStr[contextStr.length - 1];
            // if (lastChar != ' '
            //     && lastChar != '\n'
            //     && lastChar != undefined
            //     && lastChar != "'"
            //     && lastChar != '"'
            //     && lastChar != '('
            //     && lastChar != ')') {
            //     result = ' ' + result;
            // }

            currentSuggestion.text = result;

            if ($('.ql-editor a').length == 0) {
                window.quillEditor.insertText(
                    currentSuggestion.index,
                    currentSuggestion.text,
                    'link',
                    source = 'silent',
                )

                // setTimeout(function() {
                window.quillEditor.setSelection(currentSuggestion.index);
                $('.ql-editor a').addClass('suggestion-visible');

                $('.ql-editor a').on('click', (e) => {
                    e.preventDefault();
                    insertSuggestion();
                });
                // }, 0);
            }


        } else {
            console.log('GPT DEBUG: cancelling - canShowSuggestion is false or result is empty');
            cancelSuggestion();
        }
    });
}

function insertSuggestion() {
    if ($('.ql-editor a').length == 0) return;
    if (currentSuggestion.text == "") return;
    if (currentSuggestion.text.slice(0, 6) == 'Error:') {
        cancelSuggestion();
        return;
    }

    $('.ql-editor a').remove(); // needed or clicking it doesn't work

    window.quillEditor.insertText(
        currentSuggestion.index,
        currentSuggestion.text,
        source = 'silent');
    window.quillEditor.setSelection(
        currentSuggestion.index + currentSuggestion.text.length,
        source = 'silent');
    window.quillEditor.focus();

    cancelSuggestion();
}

function cancelSuggestion() {
    // remove loading dots in case they aren't already
    $('.gpt-loading-dots').removeClass('gpt-loading-dots-visible');

    if ($('.ql-editor a').length == 0) return;

    $('.ql-editor a').removeClass('suggestion-visible');
    setTimeout(function () { // let animation finish before removing
        $('.ql-editor a').remove();
    }, 200);

    clearTimeout(typingTimer);
    currentSuggestion.canShowSuggestion = false;
    currentSuggestion.text = "";
}


// call openai api from preload.js

// TODO: properly cancel the function on typing
// 1. so error can't show for a request made earlier and
// 2. reduced api calls
// 3. timeout cancel if no response after 10 seconds

async function runSuggestionGPT(prompt, apiKey) {
    // remove trailing space if present as it messes up the suggestion
    // if (prompt[prompt.length - 1] === ' ') {
    //     prompt = prompt.slice(0, -1);
    // }

    // let contentType = window.localStorage.getItem('contentType');
    if (!apiKey) {
        return "Error: API key not set";
    }

    const url = 'https://api.openai.com/v1/chat/completions';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const body = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "You complete the user's sentences. Do not engage in conversation."
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Fish and"
                    }
                ]
            },
            {
                "role": "assistant",
                "content": [
                    {
                        "type": "text",
                        "text": "chips"
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "The capital of France"
                    }
                ]
            },
            {
                "role": "assistant",
                "content": [
                    {
                        "type": "text",
                        "text": "is Paris"
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt,
                    }
                ]
            },],
        "temperature": 1,
        "max_tokens": 10,
        "top_p": 0.95,
        "frequency_penalty": 0,
        "presence_penalty": 0,
        "response_format": {
            "type": "text"
        }
    };

    // model="gpt-3.5-turbo-instruct",
    // prompt="",
    // temperature=1,
    // max_tokens=2048,
    // top_p=1,
    // frequency_penalty=0,
    // presence_penalty=0

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            return data.choices[0].message.content;
        } else {
            console.error("Error:", data);
            return `Error: ${data.error.message}`;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        return `Fetch error: ${error.message}`;
    }
}