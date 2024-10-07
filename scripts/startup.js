// init quill
window.quill = new Quill('#quill-editor', {
    modules: {
        toolbar: "#quill-toolbar",
    },
    theme: 'snow'
});

// load content if found from previous session, otherwise load default note
let contents = localStorage.getItem('savedContents');
if (contents !== null) {
    window.quill.setContents(JSON.parse(contents));
} else {
    window.quill.setText('Start typing here...');
}