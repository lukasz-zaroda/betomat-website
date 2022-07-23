import jQuery from 'jquery';
import 'bootstrap';

import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import '@ckeditor/ckeditor5-build-decoupled-document/build/translations/pl';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import WordCount from "@ckeditor/ckeditor5-word-count/src/wordcount";

import Betomat from "betomat-plugin-ckeditor5";

import {Bold, Italic, Strikethrough, Underline} from "@ckeditor/ckeditor5-basic-styles";
import {Alignment} from "@ckeditor/ckeditor5-alignment";

import './scss/style.scss';

import zaimkiDzierzawcze from './words/pl/zaimki/dzierzawcze.words';
import zaimkiNieokreslone from './words/pl/zaimki/nieokreslone.words';
import zaimkiOsobowe from './words/pl/zaimki/osobowe.words';
import zaimkiPrzeczace from './words/pl/zaimki/przeczace.words';
import zaimkiPytajace from './words/pl/zaimki/pytajace.words';

const CKEditorInspector = IS_DEV_MODE ? require('@ckeditor/ckeditor5-inspector') : null;

jQuery(document).ready(function () {
  DecoupledEditor
    .create(document.querySelector('.document-editor__editable'), {
      plugins: [Essentials, Paragraph, WordCount, Betomat, Bold, Italic, Underline, Strikethrough, Alignment],
      toolbar: ['betomat', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'alignment:left', 'alignment:right', 'alignment:center', 'alignment:justify'],
      language: 'pl',
      betomat: {
        wordGroups: [
          {
            type: 'zaimki-dzierzawcze',
            label: 'Zaimki dzierżawcze',
            words: zaimkiDzierzawcze,
          },
          {
            type: 'zaimki-osobowe',
            label: 'Zaimki osobowe',
            words: zaimkiOsobowe,
          },
          {
            type: 'zaimki-nieokreslone',
            label: 'Zaimki nieokreślone',
            words: zaimkiNieokreslone,
          },
          {
            type: 'zaimki-przeczace',
            label: 'Zaimki przeczące',
            words: zaimkiPrzeczace,
          },
          {
            type: 'zaimki-pytajace',
            label: 'Zaimki pytające',
            words: zaimkiPytajace,
          },
        ],
      }
    })
    .then(editor => {

      const toolbarContainer = document.querySelector('.document-editor__toolbar');
      toolbarContainer.appendChild(editor.ui.view.toolbar.element);
      window.editor = editor;

      // Attach inspector if available.
      if (CKEditorInspector) {
        CKEditorInspector.attach(editor);
      }

      /*
       * Statistics
       */
      const wordCountPlugin = editor.plugins.get('WordCount');
      const $characterCount = $('[data-character-count]');
      $characterCount.each((index, item) => {
        $(item).html(wordCountPlugin.characters);
        wordCountPlugin.on('change:characters', (evt, propertyName, newValue, oldValue) => {
          $(item).html(newValue);
        });
      });
      const $wordCount = $('[data-word-count]');
      $wordCount.each((index, item) => {
        $(item).html(wordCountPlugin.words);
        wordCountPlugin.on('change:words', (evt, propertyName, newValue, oldValue) => {
          $(item).html(newValue);
        });
      });


    })
    .catch(error => {
      console.error(error.stack);
    });

  // Enable bootstrap's tooltips.
  $(function () {
    $('[data-bs-toggle="tooltip"]').tooltip({
      container: 'body',
    })
  })

  setTimeout(function () {
      $('body').addClass('helpers-hidden');
  },3000);

});
