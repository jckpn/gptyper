// TODO: USE NATIVE MENUS INSTEAD

// *** CHECK FOR KEYBOARD SHORTCUTS ***
// $(document).on("keydown", function(e){
//     // ctrl/cmd shortcuts
//     if (e.ctrlKey || e.metaKey) {
//         // check for cmd/ctrl + 1/2/3
//         if (e.which === 49) { // 1
//             toggleHeader(1);
//         } else if (e.which === 50) { // 2
//             toggleHeader(2);
//         } else if (e.which === 51) { // 3
//             toggleHeader(3);
//         }

//         // check for ctrl+s, ctrl+o, ctrl+n
//         if (e.which === 83) { // s
//             e.preventDefault();
//             //  \/\/ this is from file-manage.js
//             handleMenuOptionSave(window.currentWorkingFilePath);
//                                         // ^ if null this opens dialog
//         }
//         if (e.which === 79) { // o
//             e.preventDefault();
//             handleMenuOptionOpen();
//         }
//         if (e.which === 78) { // n
//             e.preventDefault();
//             handleMenuOptionNew();
//         }
//     }

//     // not a shortcut, but if editor is empty and backspace pressed,
//     // remove all stylings (header/bold/etc)
//     if (e.which === 8) { // backspace
//         if (window.quillEditor.getLength() === 1) {
//             window.quillEditor.format('header', false);
//             window.quillEditor.format('bold', false);
//             window.quillEditor.format('italic', false);
//             window.quillEditor.format('underline', false);
//             window.quillEditor.format('header', false);
//         }
//     }
// });

// function toggleHeader(headerNumber) {
//     let format = window.quillEditor.getFormat();
//     if (format.header === headerNumber) {
//         window.quillEditor.format('header', false);
//     } else {
//         window.quillEditor.format('header', headerNumber);
//     }
// }