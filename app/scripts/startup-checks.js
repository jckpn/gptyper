$(() => {
    let apiKey = window.localStorage.getItem('apiKey') || '';
    console.log('apiKey:', apiKey);
    if (apiKey == '') {
        // click 'set api key' button
        $('.gpt-menu-option-apikey').click();
    }
});