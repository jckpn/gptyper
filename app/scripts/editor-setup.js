const icons = Quill.import('ui/icons');
// const { htmlEditButton } = require("quill-html-edit-button");

// var Image = Quill.import('formats/image');
// Image.className = 'editor-img';
// Quill.register(Image, true);
// Quill.register('modules/htmlEditButton', htmlEditButton);

// for custom icons with CSS since the H3 was missing
icons.bold = 'B';
icons.italic = 'I';
icons.underline = 'U';
icons.header[1] = 'H';
icons.header[2] = 'H';
icons.header[3] = 'H';

const quillEditor = new Quill('#editor', {
    modules: {
        toolbar: [
            [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
            ['bold', 'italic', 'underline'],
            // [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ align: '' }, { align: 'center' }], //, { align: 'justify' }]
            // ['image'],
        ],
        imageResize: {
            modules: ['Resize', 'DisplaySize'],
            displayStyles: {
                backgroundColor: 'transparent',
                border: 'none',
            },
        },
        keyboard: {
          bindings: {
            tab: {
              key: 9,
              handler: null,
                // handled in gpt-suggest.js
            },
          }
        }
    },
    theme: 'snow',
});

quillEditor.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
    delta.ops = delta.ops.map(op => {
      return {
        insert: op.insert
      }
    })
    return delta
  })

window.quillEditor = quillEditor; // make global for other scripts