window.currentWorkingFilePath = null;
var unsavedChanges = false;
window.api.setUnsavedChanges(unsavedChanges); // for close dialog

let loadingOverlayDur = 500;
let newNoteTitle = 'GPTyper v0.1.0';

$(function() { document.title = newNoteTitle; });

window.quillEditor.on('text-change', function(delta, oldDelta, source) {
    unsavedChanges = true;
    window.api.setUnsavedChanges(unsavedChanges);

    // add unsaved changes indicator to title
    if (window.currentWorkingFilePath == null) {
        document.title = newNoteTitle + '*';
    } else {
        let fileName = window.currentWorkingFilePath.split('\\').pop().split('/').pop();
        document.title = 'GPTyper — ' + fileName + '*';
    }
});

$(function() {
    toggleSaveButton();
    
    if (window.localStorage.getItem('seenAbout') !== 'true') {
        openAbout();
        window.localStorage.setItem('seenAbout', 'true');
    }
});

$('.file-menu-option-new').on('click', async function() { handleMenuOptionNew(); });
async function handleMenuOptionNew() {
    if (await checkForUnsavedChanges()) {
        // just reload the window:
        window.api.reloadWindow();
    }
}

$('.file-menu-option-open').on('click', async function() { handleMenuOptionOpen(); });
async function handleMenuOptionOpen() {
    if (await checkForUnsavedChanges()) {
        setTimeout(function() { closeMenuBanner(); }, 300);
        handleOpenFile(null); // no path -> open file dialog
    }
}

$('.file-menu-option-saveas').on('click', () => { handleMenuOptionSave(null); });
$('.file-menu-option-saveagain').on('click', () => {
    handleMenuOptionSave(window.currentWorkingFilePath); });
function handleMenuOptionSave(path) {
    if (path === 'assets/about.cav') return;
    // don't want user editing about page in case they need that info later etc

    setTimeout(function() { closeMenuBanner(); }, 300);
    handleSaveFile(path); // re-save current file
                 // ^ if this is null, it'll open the save dialog
}

$('.settings-menu-option-about').on('click', async function() {
    if (await checkForUnsavedChanges()) {
        openAbout();
        closeMenuBanner();
    }
});

async function handleOpenFile(filePath) {
    if (filePath === null) {
        let {contentsJsonStr, filePath} = await window.api.openFile(); // get contents as str
        if (filePath === null) return; // user cancelled open

        $('.loading-text').text('Opening File');
        $('.loading-overlay').addClass('loading-overlay-active');
        setTimeout(function() {
            $('.loading-overlay').removeClass('loading-overlay-active');
        }, loadingOverlayDur);
    
        setTimeout(function() {
            let contentsJsonRaw;

            // if file is .txt, convert to json for quill
            if (filePath.endsWith('.cav')) {
                contentsJsonRaw = JSON.parse(contentsJsonStr);
            } else {
                contentsJsonRaw = {
                    ops: [
                        { insert: contentsJsonStr }
                    ]
                };
            }
            
            window.quillEditor.setContents(contentsJsonRaw);
    
            window.currentWorkingFilePath = filePath;
            let fileName = filePath.split('\\').pop().split('/').pop();
            document.title = 'GPTyper — ' + fileName; // set window title
    
            toggleSaveButton();
            unsavedChanges = false;
            window.api.setUnsavedChanges(unsavedChanges);
        }, 200); // wait for loading screen fadein before changing contents
    } else {
        let contentsJsonStr = await window.api.openFileDirect(filePath); // get contents as str

        $('.loading-text').text('Opening File');
        $('.loading-overlay').addClass('loading-overlay-active');
        setTimeout(function() {
            $('.loading-overlay').removeClass('loading-overlay-active');
        }, loadingOverlayDur);

        setTimeout(async function() {
            let contentsJsonRaw = JSON.parse(contentsJsonStr);
            
            window.quillEditor.setContents(contentsJsonRaw);

            window.currentWorkingFilePath = filePath;
            let fileName = filePath.split('\\').pop().split('/').pop();
            document.title = 'GPTyper — ' + fileName; // set window title

            toggleSaveButton();
            unsavedChanges = false;
            window.api.setUnsavedChanges(unsavedChanges);
        }, 200);
    }
}

async function openAbout() {
    let aboutPath = 'assets/about.cav';
    await handleOpenFile(aboutPath);
}
async function openApiKeyFile() {
    let apikeyPath = 'assets/apikey.cav';
    await handleOpenFile(apikeyPath);
}

async function handleSaveFile(savePath) {
    $('.ql-editor a').remove(); // don't want AI suggestions in saved file
                                // it's also cancelled by clicking save but put this
                                // here for keyboard shortcuts etc
    let contentsJsonRaw = window.quillEditor.getContents(); // quill json
    let contentsJsonStr = JSON.stringify(contentsJsonRaw); // json -> str to save

    if (savePath === null) { // save as
        savePath = await window.api.saveFile(contentsJsonStr);
        window.currentWorkingFilePath = savePath;
    } else { // save to current working path
        savePath = window.currentWorkingFilePath;
        await window.api.saveFileDirect(savePath, contentsJsonStr);
    }

    let fileName = savePath.split('\\').pop().split('/').pop();
    document.title = 'GPTyper — ' + fileName; // set window title

    // show 'loading screen' even though already saved at this point,
    // just to assure user that it's saved
    $('.loading-text').text('Saving File');
    $('.loading-overlay').addClass('loading-overlay-active');
    setTimeout(function() {
        $('.loading-overlay').removeClass('loading-overlay-active');
    }, loadingOverlayDur);

    toggleSaveButton();
    unsavedChanges = false;
    window.api.setUnsavedChanges(unsavedChanges);
}

function toggleSaveButton() {
    if (window.currentWorkingFilePath === null) {
        $('.file-menu-option-saveas').text('Save...');
        $('.file-menu-option-saveagain').hide();
    } else {
        $('.file-menu-option-saveas').text('Save As...');
        $('.file-menu-option-saveagain').show();
    }
}

async function checkForUnsavedChanges() {
    if (!unsavedChanges) return true; // continue as no unsaved changes

    // if unsaved changes, check with user

    let dialogResponse = await window.api.showMessageBox({
        type: 'question',
        buttons: ['No', 'Yes'],
        title: 'Unsaved Changes',
        message: 'Save current file first?'
    });

    if (dialogResponse.response === 1) { // yes
        await handleMenuOptionSave(window.currentWorkingFilePath);
    }

    return true;
}