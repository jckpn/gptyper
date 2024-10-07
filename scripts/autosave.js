autosaveInterval = 5000;

function saveQuillContents() {
    var delta = window.quill.getContents();
    var contents = JSON.stringify(delta);
    localStorage.setItem('savedContents', contents);
}

var autosave = setInterval(saveQuillContents, autosaveInterval);
