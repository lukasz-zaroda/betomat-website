import jQuery from 'jquery';
import lodash from "lodash-es";
import { Popover, Tooltip } from 'bootstrap';
import "bootstrap-icons/font/bootstrap-icons.css";

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
import zaimkiPytajne from './words/pl/zaimki/pytajne.words';
import siekoza from './words/pl/zaimki/siekoza.words';
import byloza from './words/pl/zaimki/byloza.words';
import miecioza from './words/pl/miec.words';

const CKEditorInspector = IS_DEV_MODE ? require('@ckeditor/ckeditor5-inspector') : null;

function getEditorBackupData() {
  return localStorage.getItem('editorDataBackup')
}

function setEditorBackupData(data) {
  return localStorage.setItem('editorDataBackup', data)
}

jQuery(document).ready(function () {

  /*
   * Initialize Bootstrap's popovers.
   */
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  const popovers = popoverTriggerList.map(function (popoverTriggerEl) {
    return new Popover(popoverTriggerEl, {
      sanitize: false,
    });
  });

  for (let popover of popovers) {
    $(popover._element).on('mouseenter', function () {
      popover.show();
    })

    $('body').on('click', function () {
      for (let popover of popovers) {
        popover.hide();
      }
    })
  }

  /*
   * Initialize tooltips.
   */

  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new Tooltip(tooltipTriggerEl)
  });

  /*
   * Handle settings.
   */

  const settingUpdateEventName = 'bw:setting:update';

  function getSetting(name) {
    return JSON.parse(localStorage.getItem('bwSetting:' + name)) ?? null;
  }

  function setSettingAutosave(name, value) {
    localStorage.setItem('bwSetting:' + name, JSON.stringify(value));
    $(document).trigger(settingUpdateEventName, [name, value]);
  }

  const autosaveSettingName = 'autosave';

  const $autosaveSetting = $('#settingAutosave');

  const autosaveSettingValue = getSetting(autosaveSettingName);
  console.log(autosaveSettingValue);
  $autosaveSetting.prop('checked', autosaveSettingValue);

  $autosaveSetting.on('change', function() {
    const $input = $(this);
    setSettingAutosave(autosaveSettingName, $input.is(':checked'))
  });

  // Set backed up data.
  const editableElement = document.getElementById('editor-editable');
  editableElement.innerHTML = getEditorBackupData();

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
            type: 'zaimki-pytajne',
            label: 'Zaimki pytajne',
            words: zaimkiPytajne,
          },
          {
            type: 'siekoza',
            label: 'Siękoza',
            words: siekoza,
          },
          {
            type: 'byloza',
            label: 'Byłoza',
            words: byloza,
          },
          {
            type: 'miecioza',
            label: 'Mieć (Miecioza?)',
            words: miecioza,
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

      // Autosave

      const autosaveCallback = lodash.throttle((evt) => {setTimeout(() => {setEditorBackupData(editor.getData())}, 10000)}, 10000);
      if (getSetting(autosaveSettingName)) {
        editor.model.document.on('change:data', autosaveCallback);
      }
      $(document).on(settingUpdateEventName, function (e, name, value) {
        if (name === autosaveSettingName) {
          if (value) {
            editor.model.document.on('change:data', autosaveCallback);
          } else {
            editor.model.document.off('change:data', autosaveCallback);
          }
        }
      });

      // Save on exiting the website.
      $(window).on('beforeunload', function (e) {
        setEditorBackupData(editor.getData());
      });

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

});
