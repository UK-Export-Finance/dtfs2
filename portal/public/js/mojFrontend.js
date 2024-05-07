/*! For license information please see mojFrontend.js.LICENSE.txt */
let DTFS_PORTAL;
!(function () {
  const t = {
    167(t, e) {
      let n; var o; var r;
      (o = []),
        void 0 ===
          (r =
            'function' ===
            typeof (n = function () {
              var t = {
                removeAttributeValue: function (t, e, n) {
                  var o; var r;
                  t.getAttribute(e) &&
                    (t.getAttribute(e) == n
                      ? t.removeAttribute(e)
                      : ((o = new RegExp(`(^|\\s)${  n  }(\\s|$)`)),
                        (r = t.getAttribute(e).match(o)) &&
                          3 == r.length &&
                          t.setAttribute(e, t.getAttribute(e).replace(o, r[1] && r[2] ? ' ' : ''))));
                },
                addAttributeValue (t, e, n) {
                    t.getAttribute(e)
                      ? new RegExp('(^|\\s)' + n + '(\\s|$)').test(t.getAttribute(e)) ||
                        t.setAttribute(e, t.getAttribute(e) + ' ' + n)
                      : t.setAttribute(e, n);
                  },
                dragAndDropSupported () {
                    return void 0 !== document.createElement('div').ondrop;
                  },
                formDataSupported () {
                    return 'function' == typeof FormData;
                  },
                fileApiSupported: function () {
                  var t = document.createElement('input');
                  return (t.type = 'file'), void 0 !== t.files;
                },
                nodeListForEach: function (t, e) {
                  if (window.NodeList.prototype.forEach) return t.forEach(e);
                  for (let n = 0; n < t.length; n++) e.call(window, t[n], n, t);
                },
                initAll (e) {
                    var n = void 0 !== (e = void 0 !== e ? e : {}).scope ? e.scope : document,
                      o = n.querySelectorAll('[data-module="moj-add-another"]');
                    t.nodeListForEach(o, function (e) {
                      new t.AddAnother(e);
                    });
                    var r = n.querySelectorAll('[data-module="moj-multi-select"]');
                    t.nodeListForEach(r, function (e) {
                      new t.MultiSelect({
                        container: e.querySelector(e.getAttribute('data-multi-select-checkbox')),
                        checkboxes: e.querySelectorAll('tbody .govuk-checkboxes__input'),
                      });
                    });
                    var i = n.querySelectorAll('[data-module="moj-password-reveal"]');
                    t.nodeListForEach(i, function (e) {
                      new t.PasswordReveal(e);
                    });
                    var a = n.querySelectorAll('[data-module="moj-rich-text-editor"]');
                    t.nodeListForEach(a, function (e) {
                      var n = { textarea: $(e) },
                        o = e.getAttribute('data-moj-rich-text-editor-toolbar');
                      if (o) {
                        var r = o.split(',');
                        for (var i in ((n.toolbar = {}), r)) n.toolbar[r[i]] = !0;
                      }
                      new t.RichTextEditor(n);
                    });
                    var s = n.querySelectorAll('[data-module="moj-search-toggle"]');
                    t.nodeListForEach(s, function (e) {
                      new t.SearchToggle({
                        toggleButton: {
                          container: $(e.querySelector('.moj-search-toggle__toggle')),
                          text: e.getAttribute('data-moj-search-toggle-text'),
                        },
                        search: { container: $(e.querySelector('.moj-search')) },
                      });
                    });
                    var u = n.querySelectorAll('[data-module="moj-sortable-table"]');
                    t.nodeListForEach(u, function (e) {
                      new t.SortableTable({ table: e });
                    }),
                      (u = n.querySelectorAll('[data-module="moj-sortable-table"]')),
                      t.nodeListForEach(u, function (e) {
                        new t.SortableTable({ table: e });
                      });
                  },
                AddAnother (t) {
                    (this.container = $(t)),
                      this.container.data('moj-add-another-initialised') ||
                        (this.container.data('moj-add-another-initialised', !0),
                        this.container.on(
                          'click',
                          '.moj-add-another__remove-button',
                          $.proxy(this, 'onRemoveButtonClick'),
                        ),
                        this.container.on('click', '.moj-add-another__add-button', $.proxy(this, 'onAddButtonClick')),
                        this.container
                          .find('.moj-add-another__add-button, moj-add-another__remove-button')
                          .prop('type', 'button'));
                  },
              };
              return (
                (t.AddAnother.prototype.onAddButtonClick = function (t) {
                  var e = this.getNewItem();
                  this.updateAttributes(this.getItems().length, e), this.resetItem(e);
                  var n = this.getItems().first();
                  this.hasRemoveButton(n) || this.createRemoveButton(n),
                    this.getItems().last().after(e),
                    e.find('input, textarea, select').first().focus();
                }),
                (t.AddAnother.prototype.hasRemoveButton = function (t) {
                  return t.find('.moj-add-another__remove-button').length;
                }),
                (t.AddAnother.prototype.getItems = function () {
                  return this.container.find('.moj-add-another__item');
                }),
                (t.AddAnother.prototype.getNewItem = function () {
                  let t = this.getItems().first().clone();
                  return this.hasRemoveButton(t) || this.createRemoveButton(t), t;
                }),
                (t.AddAnother.prototype.updateAttributes = function (t, e) {
                  e.find('[data-name]').each(function (n, o) {
                    var r = o.id;
                    (o.name = $(o)
                      .attr('data-name')
                      .replace(/%index%/, t)),
                      (o.id = $(o)
                        .attr('data-id')
                        .replace(/%index%/, t)),
                      ((
                        $(o).siblings('label')[0] ||
                        $(o).parents('label')[0] ||
                        e.find(`[for="${  r  }"]`)[0]
                      ).htmlFor = o.id);
                  });
                }),
                (t.AddAnother.prototype.createRemoveButton = function (t) {
                  t.append(
                    '<button type="button" class="govuk-button govuk-button--secondary moj-add-another__remove-button">Remove</button>',
                  );
                }),
                (t.AddAnother.prototype.resetItem = function (t) {
                  t.find('[data-name], [data-id]').each(function (t, e) {
                    e.type == 'checkbox' || e.type == 'radio' ? (e.checked = !1) : (e.value = '');
                  });
                }),
                (t.AddAnother.prototype.onRemoveButtonClick = function (t) {
                  $(t.currentTarget).parents('.moj-add-another__item').remove();
                  var e = this.getItems();
                  e.length === 1 && e.find('.moj-add-another__remove-button').remove(),
                    e.each(
                      $.proxy(function (t, e) {
                        this.updateAttributes(t, $(e));
                      }, this),
                    ),
                    this.focusHeading();
                }),
                (t.AddAnother.prototype.focusHeading = function () {
                  this.container.find('.moj-add-another__heading').focus();
                }),
                (t.ButtonMenu = function (t) {
                  (this.container = t.container),
                    (this.menu = this.container.find('.moj-button-menu__wrapper')),
                    t.menuClasses && this.menu.addClass(t.menuClasses),
                    this.menu.attr('role', 'menu'),
                    (this.mq = t.mq),
                    (this.buttonText = t.buttonText),
                    (this.buttonClasses = t.buttonClasses || ''),
                    (this.keys = { esc: 27, up: 38, down: 40, tab: 9 }),
                    this.menu.on('keydown', '[role=menuitem]', $.proxy(this, 'onButtonKeydown')),
                    this.createToggleButton(),
                    this.setupResponsiveChecks(),
                    $(document).on('click', $.proxy(this, 'onDocumentClick'));
                }),
                (t.ButtonMenu.prototype.onDocumentClick = function (t) {
                  $.contains(this.container[0], t.target) || this.hideMenu();
                }),
                (t.ButtonMenu.prototype.createToggleButton = function () {
                  (this.menuButton = $(
                    `<button class="govuk-button moj-button-menu__toggle-button ${ 
                        this.buttonClasses 
                        }" type="button" aria-haspopup="true" aria-expanded="false">${ 
                        this.buttonText 
                        }</button>`,
                  )),
                    this.menuButton.on('click', $.proxy(this, 'onMenuButtonClick')),
                    this.menuButton.on('keydown', $.proxy(this, 'onMenuKeyDown'));
                }),
                (t.ButtonMenu.prototype.setupResponsiveChecks = function () {
                  (this.mql = window.matchMedia(this.mq)),
                    this.mql.addListener($.proxy(this, 'checkMode')),
                    this.checkMode(this.mql);
                }),
                (t.ButtonMenu.prototype.checkMode = function (t) {
                  t.matches ? this.enableBigMode() : this.enableSmallMode();
                }),
                (t.ButtonMenu.prototype.enableSmallMode = function () {
                  this.container.prepend(this.menuButton),
                    this.hideMenu(),
                    this.removeButtonClasses(),
                    this.menu.attr('role', 'menu'),
                    this.container.find('.moj-button-menu__item').attr('role', 'menuitem');
                }),
                (t.ButtonMenu.prototype.enableBigMode = function () {
                  this.menuButton.detach(),
                    this.showMenu(),
                    this.addButtonClasses(),
                    this.menu.removeAttr('role'),
                    this.container.find('.moj-button-menu__item').removeAttr('role');
                }),
                (t.ButtonMenu.prototype.removeButtonClasses = function () {
                  this.menu.find('.moj-button-menu__item').each(function (t, e) {
                    $(e).hasClass('govuk-button--secondary') &&
                      ($(e).attr('data-secondary', 'true'), $(e).removeClass('govuk-button--secondary')),
                      $(e).hasClass('govuk-button--warning') &&
                        ($(e).attr('data-warning', 'true'), $(e).removeClass('govuk-button--warning')),
                      $(e).removeClass('govuk-button');
                  });
                }),
                (t.ButtonMenu.prototype.addButtonClasses = function () {
                  this.menu.find('.moj-button-menu__item').each(function (t, e) {
                    $(e).attr('data-secondary') == 'true' && $(e).addClass('govuk-button--secondary'),
                      $(e).attr('data-warning') == 'true' && $(e).addClass('govuk-button--warning'),
                      $(e).addClass('govuk-button');
                  });
                }),
                (t.ButtonMenu.prototype.hideMenu = function () {
                  this.menuButton.attr('aria-expanded', 'false');
                }),
                (t.ButtonMenu.prototype.showMenu = function () {
                  this.menuButton.attr('aria-expanded', 'true');
                }),
                (t.ButtonMenu.prototype.onMenuButtonClick = function () {
                  this.toggle();
                }),
                (t.ButtonMenu.prototype.toggle = function () {
                  'false' == this.menuButton.attr('aria-expanded')
                    ? (this.showMenu(), this.menu.find('[role=menuitem]').first().focus())
                    : (this.hideMenu(), this.menuButton.focus());
                }),
                (t.ButtonMenu.prototype.onMenuKeyDown = function (t) {
                  t.keyCode === this.keys.down && this.toggle();
                }),
                (t.ButtonMenu.prototype.onButtonKeydown = function (t) {
                  switch (t.keyCode) {
                    case this.keys.up:
                      t.preventDefault(), this.focusPrevious(t.currentTarget);
                      break;
                    case this.keys.down:
                      t.preventDefault(), this.focusNext(t.currentTarget);
                      break;
                    case this.keys.esc:
                      this.mq.matches || (this.menuButton.focus(), this.hideMenu());
                      break;
                    case this.keys.tab:
                      this.mq.matches || this.hideMenu();
                  }
                }),
                (t.ButtonMenu.prototype.focusNext = function (t) {
                  var e = $(t).next();
                  e[0] ? e.focus() : this.container.find('[role=menuitem]').first().focus();
                }),
                (t.ButtonMenu.prototype.focusPrevious = function (t) {
                  var e = $(t).prev();
                  e[0] ? e.focus() : this.container.find('[role=menuitem]').last().focus();
                }),
                (t.FilterToggleButton = function (t) {
                  (this.options = t),
                    (this.container = this.options.toggleButton.container),
                    this.createToggleButton(),
                    this.setupResponsiveChecks(),
                    this.options.filter.container.attr('tabindex', '-1'),
                    this.options.startHidden && this.hideMenu();
                }),
                (t.FilterToggleButton.prototype.setupResponsiveChecks = function () {
                  (this.mq = window.matchMedia(this.options.bigModeMediaQuery)),
                    this.mq.addListener($.proxy(this, 'checkMode')),
                    this.checkMode(this.mq);
                }),
                (t.FilterToggleButton.prototype.createToggleButton = function () {
                  (this.menuButton = $(
                    `<button class="govuk-button ${ 
                        this.options.toggleButton.classes 
                        }" type="button" aria-haspopup="true" aria-expanded="false">${ 
                        this.options.toggleButton.showText 
                        }</button>`,
                  )),
                    this.menuButton.on('click', $.proxy(this, 'onMenuButtonClick')),
                    this.options.toggleButton.container.append(this.menuButton);
                }),
                (t.FilterToggleButton.prototype.checkMode = function (t) {
                  t.matches ? this.enableBigMode() : this.enableSmallMode();
                }),
                (t.FilterToggleButton.prototype.enableBigMode = function () {
                  this.showMenu(), this.removeCloseButton();
                }),
                (t.FilterToggleButton.prototype.enableSmallMode = function () {
                  this.hideMenu(), this.addCloseButton();
                }),
                (t.FilterToggleButton.prototype.addCloseButton = function () {
                  this.options.closeButton &&
                    ((this.closeButton = $(
                      '<button class="moj-filter__close" type="button">' + this.options.closeButton.text + '</button>',
                    )),
                    this.closeButton.on('click', $.proxy(this, 'onCloseClick')),
                    this.options.closeButton.container.append(this.closeButton));
                }),
                (t.FilterToggleButton.prototype.onCloseClick = function () {
                  this.hideMenu(), this.menuButton.focus();
                }),
                (t.FilterToggleButton.prototype.removeCloseButton = function () {
                  this.closeButton && (this.closeButton.remove(), (this.closeButton = null));
                }),
                (t.FilterToggleButton.prototype.hideMenu = function () {
                  this.menuButton.attr('aria-expanded', 'false'),
                    this.options.filter.container.addClass('moj-js-hidden'),
                    this.menuButton.text(this.options.toggleButton.showText);
                }),
                (t.FilterToggleButton.prototype.showMenu = function () {
                  this.menuButton.attr('aria-expanded', 'true'),
                    this.options.filter.container.removeClass('moj-js-hidden'),
                    this.menuButton.text(this.options.toggleButton.hideText);
                }),
                (t.FilterToggleButton.prototype.onMenuButtonClick = function () {
                  this.toggle();
                }),
                (t.FilterToggleButton.prototype.toggle = function () {
                  this.menuButton.attr('aria-expanded') == 'false'
                    ? (this.showMenu(), this.options.filter.container.focus())
                    : this.hideMenu();
                }),
                (t.FormValidator = function (t, e) {
                  (this.form = t),
                    (this.errors = []),
                    (this.validators = []),
                    $(this.form).on('submit', $.proxy(this, 'onSubmit')),
                    (this.summary = e && e.summary ? $(e.summary) : $('.govuk-error-summary')),
                    (this.originalTitle = document.title);
                }),
                (t.FormValidator.entityMap = {
                  '&': '&amp;',
                  '<': '&lt;',
                  '>': '&gt;',
                  '"': '&quot;',
                  "'": '&#39;',
                  '/': '&#x2F;',
                  '`': '&#x60;',
                  '=': '&#x3D;',
                }),
                (t.FormValidator.prototype.escapeHtml = function (e) {
                  return String(e).replace(/[&<>"'`=\/]/g, function (e) {
                    return t.FormValidator.entityMap[e];
                  });
                }),
                (t.FormValidator.prototype.resetTitle = function () {
                  document.title = this.originalTitle;
                }),
                (t.FormValidator.prototype.updateTitle = function () {
                  document.title = `${this.errors.length  } errors - ${  document.title}`;
                }),
                (t.FormValidator.prototype.showSummary = function () {
                  this.summary.html(this.getSummaryHtml()),
                    this.summary.removeClass('moj-hidden'),
                    this.summary.attr('aria-labelledby', 'errorSummary-heading'),
                    this.summary.focus();
                }),
                (t.FormValidator.prototype.getSummaryHtml = function () {
                  let t = '<h2 id="error-summary-title" class="govuk-error-summary__title">There is a problem</h2>';
                  (t += '<div class="govuk-error-summary__body">'),
                    (t += '<ul class="govuk-list govuk-error-summary__list">');
                  for (let e = 0, n = this.errors.length; e < n; e++) {
                    var o = this.errors[e];
                    (t += '<li>'),
                      (t += `<a href="#${  this.escapeHtml(o.fieldName)  }">`),
                      (t += this.escapeHtml(o.message)),
                      (t += '</a>'),
                      (t += '</li>');
                  }
                  return (t += '</ul>'), (t += '</div>');
                }),
                (t.FormValidator.prototype.hideSummary = function () {
                  this.summary.addClass('moj-hidden'), this.summary.removeAttr('aria-labelledby');
                }),
                (t.FormValidator.prototype.onSubmit = function (t) {
                  this.removeInlineErrors(),
                    this.hideSummary(),
                    this.resetTitle(),
                    this.validate() ||
                      (t.preventDefault(), this.updateTitle(), this.showSummary(), this.showInlineErrors());
                }),
                (t.FormValidator.prototype.showInlineErrors = function () {
                  for (let t = 0, e = this.errors.length; t < e; t++) this.showInlineError(this.errors[t]);
                }),
                (t.FormValidator.prototype.showInlineError = function (e) {
                  var n = `${e.fieldName  }-error`,
                    o = `<span class="govuk-error-message" id="${  n  }">${  this.escapeHtml(e.message)  }</span>`,
                    r = $(`#${  e.fieldName}`),
                    i = r.parents('.govuk-form-group'),
                    a = i.find('label'),
                    s = i.find('legend'),
                    u = i.find('fieldset');
                  i.addClass('govuk-form-group--error'),
                    s.length
                      ? (s.after(o), i.attr('aria-invalid', 'true'), t.addAttributeValue(u[0], 'aria-describedby', n))
                      : (a.after(o), r.attr('aria-invalid', 'true'), t.addAttributeValue(r[0], 'aria-describedby', n));
                }),
                (t.FormValidator.prototype.removeInlineErrors = function () {
                  for (let t = 0; t < this.errors.length; t++) this.removeInlineError(this.errors[t]);
                }),
                (t.FormValidator.prototype.removeInlineError = function (e) {
                  let n = $(`#${  e.fieldName}`).parents('.govuk-form-group');
                  n.find('.govuk-error-message').remove(),
                    n.removeClass('govuk-form-group--error'),
                    n.find('[aria-invalid]').attr('aria-invalid', 'false');
                  var o = `${e.fieldName  }-error`;
                  t.removeAttributeValue(n.find('[aria-describedby]')[0], 'aria-describedby', o);
                }),
                (t.FormValidator.prototype.addValidator = function (t, e) {
                  this.validators.push({ fieldName: t, rules: e, field: this.form.elements[t] });
                }),
                (t.FormValidator.prototype.validate = function () {
                  this.errors = [];
                  var t;
                      var e;
                      var n = null;
                      var o = !0;
                  for (t = 0; t < this.validators.length; t++)
                    for (n = this.validators[t], e = 0; e < n.rules.length; e++) {
                      if (typeof (o = n.rules[e].method(n.field, n.rules[e].params)) == 'boolean' && !o) {
                        this.errors.push({ fieldName: n.fieldName, message: n.rules[e].message });
                        break;
                      }
                      if (typeof o == 'string') {
                        this.errors.push({ fieldName: o, message: n.rules[e].message });
                        break;
                      }
                    }
                  return this.errors.length === 0;
                }),
                t.dragAndDropSupported() &&
                  t.formDataSupported() &&
                  t.fileApiSupported() &&
                  ((t.MultiFileUpload = function (t) {
                    (this.defaultParams = {
                      uploadFileEntryHook: $.noop,
                      uploadFileExitHook: $.noop,
                      uploadFileErrorHook: $.noop,
                      fileDeleteHook: $.noop,
                      uploadStatusText: 'Uploading files, please wait',
                      dropzoneHintText: 'Drag and drop files here or',
                      dropzoneButtonText: 'Choose files',
                    }),
                      (this.params = $.extend({}, this.defaultParams, t)),
                      this.params.container.addClass('moj-multi-file-upload--enhanced'),
                      (this.feedbackContainer = this.params.container.find('.moj-multi-file__uploaded-files')),
                      this.setupFileInput(),
                      this.setupDropzone(),
                      this.setupLabel(),
                      this.setupStatusBox(),
                      this.params.container.on(
                        'click',
                        '.moj-multi-file-upload__delete',
                        $.proxy(this, 'onFileDeleteClick'),
                      );
                  }),
                  (t.MultiFileUpload.prototype.setupDropzone = function () {
                    this.fileInput.wrap('<div class="moj-multi-file-upload__dropzone" />'),
                      (this.dropzone = this.params.container.find('.moj-multi-file-upload__dropzone')),
                      this.dropzone.on('dragover', $.proxy(this, 'onDragOver')),
                      this.dropzone.on('dragleave', $.proxy(this, 'onDragLeave')),
                      this.dropzone.on('drop', $.proxy(this, 'onDrop'));
                  }),
                  (t.MultiFileUpload.prototype.setupLabel = function () {
                    (this.label = $(
                      `<label for="${ 
                          this.fileInput[0].id 
                          }" class="govuk-button govuk-button--secondary">${ 
                          this.params.dropzoneButtonText 
                          }</label>`,
                    )),
                      this.dropzone.append(`<p class="govuk-body">${  this.params.dropzoneHintText  }</p>`),
                      this.dropzone.append(this.label);
                  }),
                  (t.MultiFileUpload.prototype.setupFileInput = function () {
                    (this.fileInput = this.params.container.find('.moj-multi-file-upload__input')),
                      this.fileInput.on('change', $.proxy(this, 'onFileChange')),
                      this.fileInput.on('focus', $.proxy(this, 'onFileFocus')),
                      this.fileInput.on('blur', $.proxy(this, 'onFileBlur'));
                  }),
                  (t.MultiFileUpload.prototype.setupStatusBox = function () {
                    (this.status = $('<div aria-live="polite" role="status" class="govuk-visually-hidden" />')),
                      this.dropzone.append(this.status);
                  }),
                  (t.MultiFileUpload.prototype.onDragOver = function (t) {
                    t.preventDefault(), this.dropzone.addClass('moj-multi-file-upload--dragover');
                  }),
                  (t.MultiFileUpload.prototype.onDragLeave = function () {
                    this.dropzone.removeClass('moj-multi-file-upload--dragover');
                  }),
                  (t.MultiFileUpload.prototype.onDrop = function (t) {
                    t.preventDefault(),
                      this.dropzone.removeClass('moj-multi-file-upload--dragover'),
                      this.feedbackContainer.removeClass('moj-hidden'),
                      this.status.html(this.params.uploadStatusText),
                      this.uploadFiles(t.originalEvent.dataTransfer.files);
                  }),
                  (t.MultiFileUpload.prototype.uploadFiles = function (t) {
                    for (let e = 0; e < t.length; e++) this.uploadFile(t[e]);
                  }),
                  (t.MultiFileUpload.prototype.onFileChange = function (t) {
                    this.feedbackContainer.removeClass('moj-hidden'),
                      this.status.html(this.params.uploadStatusText),
                      this.uploadFiles(t.currentTarget.files),
                      this.fileInput.replaceWith($(t.currentTarget).val('').clone(!0)),
                      this.setupFileInput(),
                      this.fileInput.focus();
                  }),
                  (t.MultiFileUpload.prototype.onFileFocus = function (t) {
                    this.label.addClass('moj-multi-file-upload--focused');
                  }),
                  (t.MultiFileUpload.prototype.onFileBlur = function (t) {
                    this.label.removeClass('moj-multi-file-upload--focused');
                  }),
                  (t.MultiFileUpload.prototype.getSuccessHtml = function (t) {
                    return (
                      `<span class="moj-multi-file-upload__success"> <svg class="moj-banner__icon" fill="currentColor" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" height="25" width="25"><path d="M25,6.2L8.7,23.2L0,14.1l4-4.2l4.7,4.9L21,2L25,6.2z"/></svg> ${ 
                        t.messageHtml 
                        }</span>`
                    );
                  }),
                  (t.MultiFileUpload.prototype.getErrorHtml = function (t) {
                    return (
                      `<span class="moj-multi-file-upload__error"> <svg class="moj-banner__icon" fill="currentColor" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" height="25" width="25"><path d="M13.6,15.4h-2.3v-4.5h2.3V15.4z M13.6,19.8h-2.3v-2.2h2.3V19.8z M0,23.2h25L12.5,2L0,23.2z"/></svg> ${ 
                        t.message 
                        }</span>`
                    );
                  }),
                  (t.MultiFileUpload.prototype.getFileRowHtml = function (t) {
                    let e = '';
                    return (
                      (e += '<div class="govuk-summary-list__row moj-multi-file-upload__row">'),
                      (e += '  <div class="govuk-summary-list__value moj-multi-file-upload__message">'),
                      (e += `<span class="moj-multi-file-upload__filename">${  t.name  }</span>`),
                      (e += '<span class="moj-multi-file-upload__progress">0%</span>'),
                      (e += '  </div>'),
                      (e += '  <div class="govuk-summary-list__actions moj-multi-file-upload__actions"></div>'),
                      (e += '</div>')
                    );
                  }),
                  (t.MultiFileUpload.prototype.getDeleteButtonHtml = function (t) {
                    var e =
                      `<button class="moj-multi-file-upload__delete govuk-button govuk-button--secondary govuk-!-margin-bottom-0" type="button" name="delete" value="${ 
                        t.filename 
                        }">`;
                    return (
                      (e += `Delete <span class="govuk-visually-hidden">${  t.originalname  }</span>`),
                      (e += '</button>')
                    );
                  }),
                  (t.MultiFileUpload.prototype.uploadFile = function (t) {
                    this.params.uploadFileEntryHook(this, t);
                    let e = new FormData();
                    e.append('documents', t);
                    let n = $(this.getFileRowHtml(t));
                    this.feedbackContainer.find('.moj-multi-file-upload__list').append(n),
                      $.ajax({
                        url: this.params.uploadUrl,
                        type: 'post',
                        data: e,
                        processData: !1,
                        contentType: !1,
                        success: $.proxy(function (e) {
                          e.error
                            ? (n.find('.moj-multi-file-upload__message').html(this.getErrorHtml(e.error)),
                              this.status.html(e.error.message))
                            : (n.find('.moj-multi-file-upload__message').html(this.getSuccessHtml(e.success)),
                              this.status.html(e.success.messageText)),
                            n.find('.moj-multi-file-upload__actions').append(this.getDeleteButtonHtml(e.file)),
                            this.params.uploadFileExitHook(this, t, e);
                        }, this),
                        error: $.proxy(function (e, n, o) {
                          this.params.uploadFileErrorHook(this, t, e, n, o);
                        }, this),
                        xhr () {
                            var t = new XMLHttpRequest();
                            return (
                              t.upload.addEventListener(
                                'progress',
                                function (t) {
                                  if (t.lengthComputable) {
                                    var e = t.loaded / t.total;
                                    (e = parseInt(100 * e, 10)),
                                      n.find('.moj-multi-file-upload__progress').text(' ' + e + '%');
                                  }
                                },
                                !1,
                              ),
                              t
                            );
                          },
                      });
                  }),
                  (t.MultiFileUpload.prototype.onFileDeleteClick = function (t) {
                    t.preventDefault();
                    let e = $(t.currentTarget);
                        var n = {};
                    (n[e[0].name] = e[0].value),
                      $.ajax({
                        url: this.params.deleteUrl,
                        type: 'post',
                        dataType: 'json',
                        data: n,
                        success: $.proxy(function (t) {
                          t.error ||
                            (e.parents('.moj-multi-file-upload__row').remove(),
                            this.feedbackContainer.find('.moj-multi-file-upload__row').length === 0 &&
                              this.feedbackContainer.addClass('moj-hidden')),
                            this.params.fileDeleteHook(this, t);
                        }, this),
                      });
                  })),
                (t.MultiSelect = function (t) {
                  (this.container = $(t.container)),
                    this.container.data('moj-multi-select-initialised') ||
                      (this.container.data('moj-multi-select-initialised', !0),
                      (this.toggle = $(this.getToggleHtml())),
                      (this.toggleButton = this.toggle.find('input')),
                      this.toggleButton.on('click', $.proxy(this, 'onButtonClick')),
                      this.container.append(this.toggle),
                      (this.checkboxes = $(t.checkboxes)),
                      this.checkboxes.on('click', $.proxy(this, 'onCheckboxClick')),
                      (this.checked = t.checked || !1));
                }),
                (t.MultiSelect.prototype.getToggleHtml = function () {
                  var t = '';
                  return (
                    (t += '<div class="govuk-checkboxes__item govuk-checkboxes--small moj-multi-select__checkbox">'),
                    (t += '  <input type="checkbox" class="govuk-checkboxes__input" id="checkboxes-all">'),
                    (t +=
                      '  <label class="govuk-label govuk-checkboxes__label moj-multi-select__toggle-label" for="checkboxes-all">'),
                    (t += '    <span class="govuk-visually-hidden">Select all</span>'),
                    (t += '  </label>'),
                    (t += '</div>')
                  );
                }),
                (t.MultiSelect.prototype.onButtonClick = function (t) {
                  this.checked
                    ? (this.uncheckAll(), (this.toggleButton[0].checked = !1))
                    : (this.checkAll(), (this.toggleButton[0].checked = !0));
                }),
                (t.MultiSelect.prototype.checkAll = function () {
                  this.checkboxes.each(
                    $.proxy(function (t, e) {
                      e.checked = !0;
                    }, this),
                  ),
                    (this.checked = !0);
                }),
                (t.MultiSelect.prototype.uncheckAll = function () {
                  this.checkboxes.each(
                    $.proxy(function (t, e) {
                      e.checked = !1;
                    }, this),
                  ),
                    (this.checked = !1);
                }),
                (t.MultiSelect.prototype.onCheckboxClick = function (t) {
                  t.target.checked
                    ? this.checkboxes.filter(':checked').length === this.checkboxes.length &&
                      ((this.toggleButton[0].checked = !0), (this.checked = !0))
                    : ((this.toggleButton[0].checked = !1), (this.checked = !1));
                }),
                (t.PasswordReveal = function (t) {
                  (this.el = t),
                    ($el = $(this.el)),
                    $el.data('moj-password-reveal-initialised') ||
                      ($el.data('moj-password-reveal-initialised', !0),
                      $el.attr('spellcheck', 'false'),
                      $el.wrap('<div class="moj-password-reveal"></div>'),
                      (this.container = $(this.el).parent()),
                      this.createButton());
                }),
                (t.PasswordReveal.prototype.createButton = function () {
                  (this.button = $(
                    '<button type="button" class="govuk-button govuk-button--secondary moj-password-reveal__button">Show <span class="govuk-visually-hidden">password</span></button>',
                  )),
                    this.container.append(this.button),
                    this.button.on('click', $.proxy(this, 'onButtonClick'));
                }),
                (t.PasswordReveal.prototype.onButtonClick = function () {
                  'password' === this.el.type
                    ? ((this.el.type = 'text'),
                      this.button.html('Hide <span class="govuk-visually-hidden">password</span>'))
                    : ((this.el.type = 'password'),
                      this.button.html('Show <span class="govuk-visually-hidden">password</span>'));
                }),
                'contentEditable' in document.documentElement &&
                  ((t.RichTextEditor = function (t) {
                    (this.options = t),
                      (this.options.toolbar = this.options.toolbar || {
                        bold: !1,
                        italic: !1,
                        underline: !1,
                        bullets: !0,
                        numbers: !0,
                      }),
                      (this.textarea = this.options.textarea),
                      (this.container = $(this.textarea).parent()),
                      this.container.data('moj-rich-text-editor-initialised') ||
                        (this.container.data('moj-rich-text-editor-initialised', !0),
                        this.createToolbar(),
                        this.hideDefault(),
                        this.configureToolbar(),
                        (this.keys = { left: 37, right: 39, up: 38, down: 40 }),
                        this.container.on(
                          'click',
                          '.moj-rich-text-editor__toolbar-button',
                          $.proxy(this, 'onButtonClick'),
                        ),
                        this.container
                          .find('.moj-rich-text-editor__content')
                          .on('input', $.proxy(this, 'onEditorInput')),
                        this.container.find('label').on('click', $.proxy(this, 'onLabelClick')),
                        this.toolbar.on('keydown', $.proxy(this, 'onToolbarKeydown')));
                  }),
                  (t.RichTextEditor.prototype.onToolbarKeydown = function (t) {
                    var e;
                    switch (t.keyCode) {
                      case this.keys.right:
                      case this.keys.down:
                        var n = (e = this.toolbar.find('button[tabindex=0]')).next('button');
                        n[0] && (n.focus(), e.attr('tabindex', '-1'), n.attr('tabindex', '0'));
                        break;
                      case this.keys.left:
                      case this.keys.up:
                        var o = (e = this.toolbar.find('button[tabindex=0]')).prev('button');
                        o[0] && (o.focus(), e.attr('tabindex', '-1'), o.attr('tabindex', '0'));
                    }
                  }),
                  (t.RichTextEditor.prototype.getToolbarHtml = function () {
                    var t = '';
                    return (
                      (t += '<div class="moj-rich-text-editor__toolbar" role="toolbar">'),
                      this.options.toolbar.bold &&
                        (t +=
                          '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--bold" type="button" data-command="bold"><span class="govuk-visually-hidden">Bold</span></button>'),
                      this.options.toolbar.italic &&
                        (t +=
                          '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--italic" type="button" data-command="italic"><span class="govuk-visually-hidden">Italic</span></button>'),
                      this.options.toolbar.underline &&
                        (t +=
                          '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--underline" type="button" data-command="underline"><span class="govuk-visually-hidden">Underline</span></button>'),
                      this.options.toolbar.bullets &&
                        (t +=
                          '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--unordered-list" type="button" data-command="insertUnorderedList"><span class="govuk-visually-hidden">Unordered list</span></button>'),
                      this.options.toolbar.numbers &&
                        (t +=
                          '<button class="moj-rich-text-editor__toolbar-button moj-rich-text-editor__toolbar-button--ordered-list" type="button" data-command="insertOrderedList"><span class="govuk-visually-hidden">Ordered list</span></button>'),
                      (t += '</div>')
                    );
                  }),
                  (t.RichTextEditor.prototype.getEnhancedHtml = function (t) {
                    return (
                      this.getToolbarHtml() +
                      '<div class="govuk-textarea moj-rich-text-editor__content" contenteditable="true" spellcheck="false"></div>'
                    );
                  }),
                  (t.RichTextEditor.prototype.hideDefault = function () {
                    (this.textarea = this.container.find('textarea')),
                      this.textarea.addClass('govuk-visually-hidden'),
                      this.textarea.attr('aria-hidden', !0),
                      this.textarea.attr('tabindex', '-1');
                  }),
                  (t.RichTextEditor.prototype.createToolbar = function () {
                    (this.toolbar = document.createElement('div')),
                      (this.toolbar.className = 'moj-rich-text-editor'),
                      (this.toolbar.innerHTML = this.getEnhancedHtml()),
                      this.container.append(this.toolbar),
                      (this.toolbar = this.container.find('.moj-rich-text-editor__toolbar')),
                      this.container.find('.moj-rich-text-editor__content').html(this.textarea.val());
                  }),
                  (t.RichTextEditor.prototype.configureToolbar = function () {
                    (this.buttons = this.container.find('.moj-rich-text-editor__toolbar-button')),
                      this.buttons.prop('tabindex', '-1'),
                      this.buttons.first().prop('tabindex', '0');
                  }),
                  (t.RichTextEditor.prototype.onButtonClick = function (t) {
                    document.execCommand($(t.currentTarget).data('command'), !1, null);
                  }),
                  (t.RichTextEditor.prototype.getContent = function () {
                    return this.container.find('.moj-rich-text-editor__content').html();
                  }),
                  (t.RichTextEditor.prototype.onEditorInput = function (t) {
                    this.updateTextarea();
                  }),
                  (t.RichTextEditor.prototype.updateTextarea = function () {
                    document.execCommand('defaultParagraphSeparator', !1, 'p'), this.textarea.val(this.getContent());
                  }),
                  (t.RichTextEditor.prototype.onLabelClick = function (t) {
                    t.preventDefault(), this.container.find('.moj-rich-text-editor__content').focus();
                  })),
                (t.SearchToggle = function (t) {
                  if (((this.options = t), this.options.search.container.data('moj-search-toggle-initialised'))) return;
                  this.options.search.container.data('moj-search-toggle-initialised', !0);
                  const e =
                    '<svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="moj-search-toggle__button__icon"><path d="M7.433,12.5790048 C6.06762625,12.5808611 4.75763941,12.0392925 3.79217348,11.0738265 C2.82670755,10.1083606 2.28513891,8.79837375 2.28699522,7.433 C2.28513891,6.06762625 2.82670755,4.75763941 3.79217348,3.79217348 C4.75763941,2.82670755 6.06762625,2.28513891 7.433,2.28699522 C8.79837375,2.28513891 10.1083606,2.82670755 11.0738265,3.79217348 C12.0392925,4.75763941 12.5808611,6.06762625 12.5790048,7.433 C12.5808611,8.79837375 12.0392925,10.1083606 11.0738265,11.0738265 C10.1083606,12.0392925 8.79837375,12.5808611 7.433,12.5790048 L7.433,12.5790048 Z M14.293,12.579 L13.391,12.579 L13.071,12.269 C14.2300759,10.9245158 14.8671539,9.20813198 14.866,7.433 C14.866,3.32786745 11.5381325,-1.65045755e-15 7.433,-1.65045755e-15 C3.32786745,-1.65045755e-15 -1.65045755e-15,3.32786745 -1.65045755e-15,7.433 C-1.65045755e-15,11.5381325 3.32786745,14.866 7.433,14.866 C9.208604,14.8671159 10.9253982,14.2296624 12.27,13.07 L12.579,13.39 L12.579,14.294 L18.296,20 L20,18.296 L14.294,12.579 L14.293,12.579 Z"></path></svg>';
                  (this.toggleButton = $(
                    `<button class="moj-search-toggle__button" type="button" aria-haspopup="true" aria-expanded="false">${ 
                        this.options.toggleButton.text 
                        }${e 
                        }</button>`,
                  )),
                    this.toggleButton.on('click', $.proxy(this, 'onToggleButtonClick')),
                    this.options.toggleButton.container.append(this.toggleButton);
                }),
                (t.SearchToggle.prototype.onToggleButtonClick = function () {
                  this.toggleButton.attr('aria-expanded') == 'false'
                    ? (this.toggleButton.attr('aria-expanded', 'true'),
                      this.options.search.container.removeClass('moj-js-hidden'),
                      this.options.search.container.find('input').first().focus())
                    : (this.options.search.container.addClass('moj-js-hidden'),
                      this.toggleButton.attr('aria-expanded', 'false'));
                }),
                (t.SortableTable = function (t) {
                  (this.table = $(t.table)),
                    this.table.data('moj-search-toggle-initialised') ||
                      (this.table.data('moj-search-toggle-initialised', !0),
                      this.setupOptions(t),
                      (this.body = this.table.find('tbody')),
                      this.createHeadingButtons(),
                      this.createStatusBox(),
                      this.initialiseSortedColumn(),
                      this.table.on('click', 'th button', $.proxy(this, 'onSortButtonClick')));
                }),
                (t.SortableTable.prototype.setupOptions = function (t) {
                  (t = t || {}),
                    (this.statusMessage = t.statusMessage || 'Sort by %heading% (%direction%)'),
                    (this.ascendingText = t.ascendingText || 'ascending'),
                    (this.descendingText = t.descendingText || 'descending');
                }),
                (t.SortableTable.prototype.createHeadingButtons = function () {
                  for (var t, e = this.table.find('thead th'), n = 0; n < e.length; n++)
                    (t = $(e[n])).attr('aria-sort') && this.createHeadingButton(t, n);
                }),
                (t.SortableTable.prototype.createHeadingButton = function (t, e) {
                  var n = t.text();
                      var o = $(`<button type="button" data-index="${  e  }">${  n  }</button>`);
                  t.text(''), t.append(o);
                }),
                (t.SortableTable.prototype.createStatusBox = function () {
                  (this.status = $(
                    '<div aria-live="polite" role="status" aria-atomic="true" class="govuk-visually-hidden" />',
                  )),
                    this.table.parent().append(this.status);
                }),
                (t.SortableTable.prototype.initialiseSortedColumn = function () {
                  var t = this.getTableRowsArray();
                  this.table
                    .find('th')
                    .filter('[aria-sort="ascending"], [aria-sort="descending"]')
                    .first()
                    .each((e, n) => {
                      let o = $(n).attr('aria-sort');
                          var r = $(n).find('button').attr('data-index');
                          var i = this.sort(t, r, o);
                      this.addRows(i);
                    });
                }),
                (t.SortableTable.prototype.onSortButtonClick = function (t) {
                  let e;
                      var n = t.currentTarget.getAttribute('data-index');
                      var o = $(t.currentTarget).parent().attr('aria-sort');
                  e = o === 'none' || o === 'descending' ? 'ascending' : 'descending';
                  var r = this.getTableRowsArray();
                      var i = this.sort(r, n, e);
                  this.addRows(i), this.removeButtonStates(), this.updateButtonState($(t.currentTarget), e);
                }),
                (t.SortableTable.prototype.updateButtonState = function (t, e) {
                  t.parent().attr('aria-sort', e);
                  var n = this.statusMessage;
                  (n = (n = n.replace(/%heading%/, t.text())).replace(/%direction%/, this[`${e  }Text`])),
                    this.status.text(n);
                }),
                (t.SortableTable.prototype.removeButtonStates = function () {
                  this.table.find('thead th').attr('aria-sort', 'none');
                }),
                (t.SortableTable.prototype.addRows = function (t) {
                  for (let e = 0; e < t.length; e++) this.body.append(t[e]);
                }),
                (t.SortableTable.prototype.getTableRowsArray = function () {
                  for (var t = [], e = this.body.find('tr'), n = 0; n < e.length; n++) t.push(e[n]);
                  return t;
                }),
                (t.SortableTable.prototype.sort = function (t, e, n) {
                  return t.sort(
                    $.proxy(function (t, o) {
                      var r = $(t).find('td,th').eq(e);
                          var i = $(o).find('td,th').eq(e);
                          var a = this.getCellValue(r);
                          var s = this.getCellValue(i);
                      return n === 'ascending' ? (a < s ? -1 : a > s ? 1 : 0) : s < a ? -1 : s > a ? 1 : 0;
                    }, this),
                  );
                }),
                (t.SortableTable.prototype.getCellValue = function (t) {
                  let e = t.attr('data-sort-value');
                  return (e = e || t.html()), $.isNumeric(e) && (e = parseInt(e, 10)), e;
                }),
                t
              );
            })
              ? n.apply(e, o)
              : n) || (t.exports = r);
    },
    692(t, e) {
      var n;
      !(function (e, n) {
        'use strict';

        'object' === typeof t.exports
          ? (t.exports = e.document
              ? n(e, !0)
              : function (t) {
                  if (!t.document) throw new Error('jQuery requires a window with a document');
                  return n(t);
                })
          : n(e);
      })(typeof window != 'undefined' ? window : this, function (o, r) {
        'use strict';

        var i = [];
            var a = Object.getPrototypeOf;
            var s = i.slice;
            var u = i.flat
              ? function (t) {
                  return i.flat.call(t);
                }
              : function (t) {
                  return i.concat.apply([], t);
                };
            var l = i.push;
            var c = i.indexOf;
            var d = {};
            var p = d.toString;
            var f = d.hasOwnProperty;
            var h = f.toString;
            var m = h.call(Object);
            var g = {};
            var v = function (t) {
              return 'function' == typeof t && 'number' != typeof t.nodeType && 'function' != typeof t.item;
            };
            var y = function (t) {
              return null != t && t === t.window;
            };
            var b = o.document;
            var x = { type: !0, src: !0, nonce: !0, noModule: !0 };
        function w(t, e, n) {
          let o;
              var r;
              var i = (n = n || b).createElement('script');
          if (((i.text = t), e))
            for (o in x) (r = e[o] || (e.getAttribute && e.getAttribute(o))) && i.setAttribute(o, r);
          n.head.appendChild(i).parentNode.removeChild(i);
        }
        function k(t) {
          return t == null
            ? `${t  }`
            : typeof t == 'object' || typeof t == 'function'
            ? d[p.call(t)] || 'object'
            : typeof t;
        }
        var T = '3.7.1';
            var C = /HTML$/i;
            var j = function (t, e) {
            return new j.fn.init(t, e);
          };
        function S(t) {
          let e = !!t && 'length' in t && t.length;
              var n = k(t);
          return !v(t) && !y(t) && (n === 'array' || e === 0 || (typeof e == 'number' && e > 0 && e - 1 in t));
        }
        function A(t, e) {
          return t.nodeName && t.nodeName.toLowerCase() === e.toLowerCase();
        }
        (j.fn = j.prototype =
          {
            jquery: T,
            constructor: j,
            length: 0,
            toArray: function () {
              return s.call(this);
            },
            get: function (t) {
              return t == null ? s.call(this) : t < 0 ? this[t + this.length] : this[t];
            },
            pushStack: function (t) {
              let e = j.merge(this.constructor(), t);
              return (e.prevObject = this), e;
            },
            each (t) {
                return j.each(this, t);
              },
            map (t) {
                return this.pushStack(
                  j.map(this, function (e, n) {
                    return t.call(e, n, e);
                  }),
                );
              },
            slice: function () {
              return this.pushStack(s.apply(this, arguments));
            },
            first: function () {
              return this.eq(0);
            },
            last: function () {
              return this.eq(-1);
            },
            even: function () {
              return this.pushStack(
                j.grep(this, function (t, e) {
                  return (e + 1) % 2;
                }),
              );
            },
            odd () {
                return this.pushStack(
                  j.grep(this, function (t, e) {
                    return e % 2;
                  }),
                );
              },
            eq: function (t) {
              let e = this.length;
                  var n = +t + (t < 0 ? e : 0);
              return this.pushStack(n >= 0 && n < e ? [this[n]] : []);
            },
            end () {
                return this.prevObject || this.constructor();
              },
            push: l,
            sort: i.sort,
            splice: i.splice,
          }),
          (j.extend = j.fn.extend =
            function () {
              let t;
                  var e;
                  var n;
                  var o;
                  var r;
                  var i;
                  var a = arguments[0] || {};
                  var s = 1;
                  var u = arguments.length;
                  var l = !1;
              for (
                typeof a == 'boolean' && ((l = a), (a = arguments[s] || {}), s++),
                  'object' === typeof a || v(a) || (a = {}),
                  s === u && ((a = this), s--);
                s < u;
                s++
              )
                if ((t = arguments[s]) != null)
                  for (e in t)
                    (o = t[e]),
                      e !== '__proto__' &&
                        a !== o &&
                        (l && o && (j.isPlainObject(o) || (r = Array.isArray(o)))
                          ? ((n = a[e]),
                            (i = r && !Array.isArray(n) ? [] : r || j.isPlainObject(n) ? n : {}),
                            (r = !1),
                            (a[e] = j.extend(l, i, o)))
                          : void 0 !== o && (a[e] = o));
              return a;
            }),
          j.extend({
            expando: `jQuery${  (T + Math.random()).replace(/\D/g, '')}`,
            isReady: !0,
            error (t) {
                throw new Error(t);
              },
            noop () {},
            isPlainObject: function (t) {
              var e; var n;
              return (
                !(!t || p.call(t) !== '[object Object]') &&
                (!(e = a(t)) ||
                  (typeof (n = f.call(e, 'constructor') && e.constructor) == 'function' && h.call(n) === m))
              );
            },
            isEmptyObject (t) {
                var e;
                for (e in t) return !1;
                return !0;
              },
            globalEval: function (t, e, n) {
              w(t, { nonce: e && e.nonce }, n);
            },
            each: function (t, e) {
              var n;
                  var o = 0;
              if (S(t)) for (n = t.length; o < n && !1 !== e.call(t[o], o, t[o]); o++);
              else for (o in t) if (!1 === e.call(t[o], o, t[o])) break;
              return t;
            },
            text (t) {
                var e,
                  n = '',
                  o = 0,
                  r = t.nodeType;
                if (!r) for (; (e = t[o++]); ) n += j.text(e);
                return 1 === r || 11 === r
                  ? t.textContent
                  : 9 === r
                  ? t.documentElement.textContent
                  : 3 === r || 4 === r
                  ? t.nodeValue
                  : n;
              },
            makeArray (t, e) {
                var n = e || [];
                return null != t && (S(Object(t)) ? j.merge(n, 'string' == typeof t ? [t] : t) : l.call(n, t)), n;
              },
            inArray: function (t, e, n) {
              return e == null ? -1 : c.call(e, t, n);
            },
            isXMLDoc: function (t) {
              let e = t && t.namespaceURI;
                  var n = t && (t.ownerDocument || t).documentElement;
              return !C.test(e || (n && n.nodeName) || 'HTML');
            },
            merge (t, e) {
                for (var n = +e.length, o = 0, r = t.length; o < n; o++) t[r++] = e[o];
                return (t.length = r), t;
              },
            grep: function (t, e, n) {
              for (var o = [], r = 0, i = t.length, a = !n; r < i; r++) !e(t[r], r) !== a && o.push(t[r]);
              return o;
            },
            map (t, e, n) {
                var o,
                  r,
                  i = 0,
                  a = [];
                if (S(t)) for (o = t.length; i < o; i++) null != (r = e(t[i], i, n)) && a.push(r);
                else for (i in t) null != (r = e(t[i], i, n)) && a.push(r);
                return u(a);
              },
            guid: 1,
            support: g,
          }),
          typeof Symbol == 'function' && (j.fn[Symbol.iterator] = i[Symbol.iterator]),
          j.each('Boolean Number String Function Array Date RegExp Object Error Symbol'.split(' '), function (t, e) {
            d[`[object ${  e  }]`] = e.toLowerCase();
          });
        var E = i.pop;
            var _ = i.sort;
            var B = i.splice;
            var D = '[\\x20\\t\\r\\n\\f]';
            var M = new RegExp(`^${  D  }+|((?:^|[^\\\\])(?:\\\\.)*)${  D  }+$`, 'g');
        j.contains = function (t, e) {
          var n = e && e.parentNode;
          return (
            t === n ||
            !(
              !n ||
              n.nodeType !== 1 ||
              !(t.contains ? t.contains(n) : t.compareDocumentPosition && 16 & t.compareDocumentPosition(n))
            )
          );
        };
        let $ = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;
        function F(t, e) {
          return e
            ? t === '\0'
              ? '�'
              : `${t.slice(0, -1)  }\\${  t.charCodeAt(t.length - 1).toString(16)  } `
            : `\\${  t}`;
        }
        j.escapeSelector = function (t) {
          return (`${t  }`).replace($, F);
        };
        let L = b;
            var N = l;
        !(function () {
          var t;
              var e;
              var n;
              var r;
              var a;
              var u;
              var l;
              var d;
              var p;
              var h;
              var m = N;
              var v = j.expando;
              var y = 0;
              var b = 0;
              var x = tt();
              var w = tt();
              var k = tt();
              var T = tt();
              var C = function (t, e) {
                return t === e && (a = !0), 0;
              };
              var S =
                'checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped';
              var $ = '(?:\\\\[\\da-fA-F]{1,6}' + D + '?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+';
              var F =
                '\\[' +
                D +
                '*(' +
                $ +
                ')(?:' +
                D +
                '*([*^$|!~]?=)' +
                D +
                '*(?:\'((?:\\\\.|[^\\\\\'])*)\'|"((?:\\\\.|[^\\\\"])*)"|(' +
                $ +
                '))|)' +
                D +
                '*\\]';
              var H =
                ':(' +
                $ +
                ')(?:\\(((\'((?:\\\\.|[^\\\\\'])*)\'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|' +
                F +
                ')*)|.*)\\)|)';
              var q = new RegExp(D + '+', 'g');
              var R = new RegExp('^' + D + '*,' + D + '*');
              var O = new RegExp('^' + D + '*([>+~]|' + D + ')' + D + '*');
              var P = new RegExp(D + '|>');
              var I = new RegExp(H);
              var W = new RegExp('^' + $ + '$');
              var U = {
                ID: new RegExp('^#(' + $ + ')'),
                CLASS: new RegExp('^\\.(' + $ + ')'),
                TAG: new RegExp('^(' + $ + '|[*])'),
                ATTR: new RegExp('^' + F),
                PSEUDO: new RegExp('^' + H),
                CHILD: new RegExp(
                  '^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(' +
                    D +
                    '*(even|odd|(([+-]|)(\\d*)n|)' +
                    D +
                    '*(?:([+-]|)' +
                    D +
                    '*(\\d+)|))' +
                    D +
                    '*\\)|)',
                  'i',
                ),
                bool: new RegExp('^(?:' + S + ')$', 'i'),
                needsContext: new RegExp(
                  '^' +
                    D +
                    '*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(' +
                    D +
                    '*((?:-\\d)?\\d*)' +
                    D +
                    '*\\)|)(?=[^-]|$)',
                  'i',
                ),
              };
              var z = /^(?:input|select|textarea|button)$/i;
              var V = /^h\d$/i;
              var X = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
              var G = /[+~]/;
              var K = new RegExp('\\\\[\\da-fA-F]{1,6}' + D + '?|\\\\([^\\r\\n\\f])', 'g');
              var Y = function (t, e) {
                var n = '0x' + t.slice(1) - 65536;
                return (
                  e ||
                  (n < 0 ? String.fromCharCode(n + 65536) : String.fromCharCode((n >> 10) | 55296, (1023 & n) | 56320))
                );
              };
              var Q = function () {
                ut();
              };
              var J = pt(
              function (t) {
                return !0 === t.disabled && A(t, 'fieldset');
              },
              { dir: 'parentNode', next: 'legend' },
            );
          try {
            m.apply((i = s.call(L.childNodes)), L.childNodes), i[L.childNodes.length].nodeType;
          } catch (t) {
            m = {
              apply: function (t, e) {
                N.apply(t, s.call(e));
              },
              call: function (t) {
                N.apply(t, s.call(arguments, 1));
              },
            };
          }
          function Z(t, e, n, o) {
            var r;
                var i;
                var a;
                var s;
                var l;
                var c;
                var f;
                var h = e && e.ownerDocument;
                var y = e ? e.nodeType : 9;
            if (((n = n || []), typeof t != 'string' || !t || (y !== 1 && y !== 9 && y !== 11))) return n;
            if (!o && (ut(e), (e = e || u), d)) {
              if (y !== 11 && (l = X.exec(t)))
                if ((r = l[1])) {
                  if (y === 9) {
                    if (!(a = e.getElementById(r))) return n;
                    if (a.id === r) return m.call(n, a), n;
                  } else if (h && (a = h.getElementById(r)) && Z.contains(e, a) && a.id === r) return m.call(n, a), n;
                } else {
                  if (l[2]) return m.apply(n, e.getElementsByTagName(t)), n;
                  if ((r = l[3]) && e.getElementsByClassName) return m.apply(n, e.getElementsByClassName(r)), n;
                }
              if (!(T[`${t  } `] || (p && p.test(t)))) {
                if (((f = t), (h = e), y === 1 && (P.test(t) || O.test(t)))) {
                  for (
                    ((h = (G.test(t) && st(e.parentNode)) || e) == e && g.scope) ||
                      ((s = e.getAttribute('id')) ? (s = j.escapeSelector(s)) : e.setAttribute('id', (s = v))),
                      i = (c = ct(t)).length;
                    i--;

                  )
                    c[i] = `${s ? '#' + s : ':scope'  } ${  dt(c[i])}`;
                  f = c.join(',');
                }
                try {
                  return m.apply(n, h.querySelectorAll(f)), n;
                } catch (e) {
                  T(t, !0);
                } finally {
                  s === v && e.removeAttribute('id');
                }
              }
            }
            return yt(t.replace(M, '$1'), e, n, o);
          }
          function tt() {
            let t = [];
            return function n(o, r) {
              return t.push(`${o  } `) > e.cacheLength && delete n[t.shift()], (n[`${o  } `] = r);
            };
          }
          function et(t) {
            return (t[v] = !0), t;
          }
          function nt(t) {
            let e = u.createElement('fieldset');
            try {
              return !!t(e);
            } catch (t) {
              return !1;
            } finally {
              e.parentNode && e.parentNode.removeChild(e), (e = null);
            }
          }
          function ot(t) {
            return function (e) {
              return A(e, 'input') && e.type === t;
            };
          }
          function rt(t) {
            return function (e) {
              return (A(e, 'input') || A(e, 'button')) && e.type === t;
            };
          }
          function it(t) {
            return function (e) {
              return 'form' in e
                ? e.parentNode && !1 === e.disabled
                  ? 'label' in e
                    ? 'label' in e.parentNode
                      ? e.parentNode.disabled === t
                      : e.disabled === t
                    : e.isDisabled === t || (e.isDisabled !== !t && J(e) === t)
                  : e.disabled === t
                : 'label' in e && e.disabled === t;
            };
          }
          function at(t) {
            return et(function (e) {
              return (
                (e = +e),
                et(function (n, o) {
                  for (var r, i = t([], n.length, e), a = i.length; a--; ) n[(r = i[a])] && (n[r] = !(o[r] = n[r]));
                })
              );
            });
          }
          function st(t) {
            return t && void 0 !== t.getElementsByTagName && t;
          }
          function ut(t) {
            var n;
                var o = t ? t.ownerDocument || t : L;
            return o != u && o.nodeType === 9 && o.documentElement
              ? ((l = (u = o).documentElement),
                (d = !j.isXMLDoc(u)),
                (h = l.matches || l.webkitMatchesSelector || l.msMatchesSelector),
                l.msMatchesSelector && L != u && (n = u.defaultView) && n.top !== n && n.addEventListener('unload', Q),
                (g.getById = nt(function (t) {
                  return (
                    (l.appendChild(t).id = j.expando), !u.getElementsByName || !u.getElementsByName(j.expando).length
                  );
                })),
                (g.disconnectedMatch = nt(function (t) {
                  return h.call(t, '*');
                })),
                (g.scope = nt(function () {
                  return u.querySelectorAll(':scope');
                })),
                (g.cssHas = nt(function () {
                  try {
                    return u.querySelector(':has(*,:jqfake)'), !1;
                  } catch (t) {
                    return !0;
                  }
                })),
                g.getById
                  ? ((e.filter.ID = function (t) {
                      var e = t.replace(K, Y);
                      return function (t) {
                        return t.getAttribute('id') === e;
                      };
                    }),
                    (e.find.ID = function (t, e) {
                      if (void 0 !== e.getElementById && d) {
                        var n = e.getElementById(t);
                        return n ? [n] : [];
                      }
                    }))
                  : ((e.filter.ID = function (t) {
                      var e = t.replace(K, Y);
                      return function (t) {
                        var n = void 0 !== t.getAttributeNode && t.getAttributeNode('id');
                        return n && n.value === e;
                      };
                    }),
                    (e.find.ID = function (t, e) {
                      if (void 0 !== e.getElementById && d) {
                        var n;
                            var o;
                            var r;
                            var i = e.getElementById(t);
                        if (i) {
                          if ((n = i.getAttributeNode('id')) && n.value === t) return [i];
                          for (r = e.getElementsByName(t), o = 0; (i = r[o++]); )
                            if ((n = i.getAttributeNode('id')) && n.value === t) return [i];
                        }
                        return [];
                      }
                    })),
                (e.find.TAG = function (t, e) {
                  return void 0 !== e.getElementsByTagName ? e.getElementsByTagName(t) : e.querySelectorAll(t);
                }),
                (e.find.CLASS = function (t, e) {
                  if (void 0 !== e.getElementsByClassName && d) return e.getElementsByClassName(t);
                }),
                (p = []),
                nt(function (t) {
                  var e;
                  (l.appendChild(t).innerHTML =
                    "<a id='" +
                    v +
                    "' href='' disabled='disabled'></a><select id='" +
                    v +
                    "-\r\\' disabled='disabled'><option selected=''></option></select>"),
                    t.querySelectorAll('[selected]').length || p.push(`\\[${  D  }*(?:value|${  S  })`),
                    t.querySelectorAll(`[id~=${  v  }-]`).length || p.push('~='),
                    t.querySelectorAll(`a#${  v  }+*`).length || p.push('.#.+[+~]'),
                    t.querySelectorAll(':checked').length || p.push(':checked'),
                    (e = u.createElement('input')).setAttribute('type', 'hidden'),
                    t.appendChild(e).setAttribute('name', 'D'),
                    (l.appendChild(t).disabled = !0),
                    t.querySelectorAll(':disabled').length !== 2 && p.push(':enabled', ':disabled'),
                    (e = u.createElement('input')).setAttribute('name', ''),
                    t.appendChild(e),
                    t.querySelectorAll("[name='']").length ||
                      p.push(`\\[${  D  }*name${  D  }*=${  D  }*(?:''|"")`);
                }),
                g.cssHas || p.push(':has'),
                (p = p.length && new RegExp(p.join('|'))),
                (C = function (t, e) {
                  if (t === e) return (a = !0), 0;
                  let n = !t.compareDocumentPosition - !e.compareDocumentPosition;
                  return (
                    n ||
                    (1 & (n = (t.ownerDocument || t) == (e.ownerDocument || e) ? t.compareDocumentPosition(e) : 1) ||
                    (!g.sortDetached && e.compareDocumentPosition(t) === n)
                      ? t === u || (t.ownerDocument == L && Z.contains(L, t))
                        ? -1
                        : e === u || (e.ownerDocument == L && Z.contains(L, e))
                        ? 1
                        : r
                        ? c.call(r, t) - c.call(r, e)
                        : 0
                      : 4 & n
                      ? -1
                      : 1)
                  );
                }),
                u)
              : u;
          }
          for (t in ((Z.matches = function (t, e) {
            return Z(t, null, null, e);
          }),
          (Z.matchesSelector = function (t, e) {
            if ((ut(t), d && !T[`${e  } `] && (!p || !p.test(e))))
              try {
                let n = h.call(t, e);
                if (n || g.disconnectedMatch || (t.document && t.document.nodeType !== 11)) return n;
              } catch (t) {
                T(e, !0);
              }
            return Z(e, u, null, [t]).length > 0;
          }),
          (Z.contains = function (t, e) {
            return (t.ownerDocument || t) != u && ut(t), j.contains(t, e);
          }),
          (Z.attr = function (t, n) {
            (t.ownerDocument || t) != u && ut(t);
            let o = e.attrHandle[n.toLowerCase()];
                var r = o && f.call(e.attrHandle, n.toLowerCase()) ? o(t, n, !d) : void 0;
            return void 0 !== r ? r : t.getAttribute(n);
          }),
          (Z.error = function (t) {
            throw new Error(`Syntax error, unrecognized expression: ${  t}`);
          }),
          (j.uniqueSort = function (t) {
            var e;
                var n = [];
                var o = 0;
                var i = 0;
            if (((a = !g.sortStable), (r = !g.sortStable && s.call(t, 0)), _.call(t, C), a)) {
              for (; (e = t[i++]); ) e === t[i] && (o = n.push(i));
              for (; o--; ) B.call(t, n[o], 1);
            }
            return (r = null), t;
          }),
          (j.fn.uniqueSort = function () {
            return this.pushStack(j.uniqueSort(s.apply(this)));
          }),
          (e = j.expr =
            {
              cacheLength: 50,
              createPseudo: et,
              match: U,
              attrHandle: {},
              find: {},
              relative: {
                '>': { dir: 'parentNode', first: !0 },
                ' ': { dir: 'parentNode' },
                '+': { dir: 'previousSibling', first: !0 },
                '~': { dir: 'previousSibling' },
              },
              preFilter: {
                ATTR: function (t) {
                  return (
                    (t[1] = t[1].replace(K, Y)),
                    (t[3] = (t[3] || t[4] || t[5] || '').replace(K, Y)),
                    '~=' === t[2] && (t[3] = ` ${  t[3]  } `),
                    t.slice(0, 4)
                  );
                },
                CHILD (t) {
                    return (
                      (t[1] = t[1].toLowerCase()),
                      'nth' === t[1].slice(0, 3)
                        ? (t[3] || Z.error(t[0]),
                          (t[4] = +(t[4] ? t[5] + (t[6] || 1) : 2 * ('even' === t[3] || 'odd' === t[3]))),
                          (t[5] = +(t[7] + t[8] || 'odd' === t[3])))
                        : t[3] && Z.error(t[0]),
                      t
                    );
                  },
                PSEUDO (t) {
                    var e,
                      n = !t[6] && t[2];
                    return U.CHILD.test(t[0])
                      ? null
                      : (t[3]
                          ? (t[2] = t[4] || t[5] || '')
                          : n &&
                            I.test(n) &&
                            (e = ct(n, !0)) &&
                            (e = n.indexOf(')', n.length - e) - n.length) &&
                            ((t[0] = t[0].slice(0, e)), (t[2] = n.slice(0, e))),
                        t.slice(0, 3));
                  },
              },
              filter: {
                TAG (t) {
                    var e = t.replace(K, Y).toLowerCase();
                    return '*' === t
                      ? function () {
                          return !0;
                        }
                      : function (t) {
                          return A(t, e);
                        };
                  },
                CLASS (t) {
                    var e = x[t + ' '];
                    return (
                      e ||
                      ((e = new RegExp('(^|' + D + ')' + t + '(' + D + '|$)')) &&
                        x(t, function (t) {
                          return e.test(
                            ('string' == typeof t.className && t.className) ||
                              (void 0 !== t.getAttribute && t.getAttribute('class')) ||
                              '',
                          );
                        }))
                    );
                  },
                ATTR: function (t, e, n) {
                  return function (o) {
                    var r = Z.attr(o, t);
                    return r == null
                      ? e === '!='
                      : !e ||
                          ((r += ''),
                          '=' === e
                            ? r === n
                            : e === '!='
                            ? r !== n
                            : e === '^='
                            ? n && r.indexOf(n) === 0
                            : e === '*='
                            ? n && r.indexOf(n) > -1
                            : e === '$='
                            ? n && r.slice(-n.length) === n
                            : e === '~='
                            ? (` ${  r.replace(q, ' ')  } `).indexOf(n) > -1
                            : e === '|=' && (r === n || r.slice(0, n.length + 1) === `${n  }-`));
                  };
                },
                CHILD (t, e, n, o, r) {
                    var i = 'nth' !== t.slice(0, 3),
                      a = 'last' !== t.slice(-4),
                      s = 'of-type' === e;
                    return 1 === o && 0 === r
                      ? function (t) {
                          return !!t.parentNode;
                        }
                      : function (e, n, u) {
                          var l,
                            c,
                            d,
                            p,
                            f,
                            h = i !== a ? 'nextSibling' : 'previousSibling',
                            m = e.parentNode,
                            g = s && e.nodeName.toLowerCase(),
                            b = !u && !s,
                            x = !1;
                          if (m) {
                            if (i) {
                              for (; h; ) {
                                for (d = e; (d = d[h]); ) if (s ? A(d, g) : 1 === d.nodeType) return !1;
                                f = h = 'only' === t && !f && 'nextSibling';
                              }
                              return !0;
                            }
                            if (((f = [a ? m.firstChild : m.lastChild]), a && b)) {
                              for (
                                x = (p = (l = (c = m[v] || (m[v] = {}))[t] || [])[0] === y && l[1]) && l[2],
                                  d = p && m.childNodes[p];
                                (d = (++p && d && d[h]) || (x = p = 0) || f.pop());

                              )
                                if (1 === d.nodeType && ++x && d === e) {
                                  c[t] = [y, p, x];
                                  break;
                                }
                            } else if (
                              (b && (x = p = (l = (c = e[v] || (e[v] = {}))[t] || [])[0] === y && l[1]), !1 === x)
                            )
                              for (
                                ;
                                (d = (++p && d && d[h]) || (x = p = 0) || f.pop()) &&
                                (!(s ? A(d, g) : 1 === d.nodeType) ||
                                  !++x ||
                                  (b && ((c = d[v] || (d[v] = {}))[t] = [y, x]), d !== e));

                              );
                            return (x -= r) === o || (x % o == 0 && x / o >= 0);
                          }
                        };
                  },
                PSEUDO (t, n) {
                    var o,
                      r = e.pseudos[t] || e.setFilters[t.toLowerCase()] || Z.error('unsupported pseudo: ' + t);
                    return r[v]
                      ? r(n)
                      : r.length > 1
                      ? ((o = [t, t, '', n]),
                        e.setFilters.hasOwnProperty(t.toLowerCase())
                          ? et(function (t, e) {
                              for (var o, i = r(t, n), a = i.length; a--; ) t[(o = c.call(t, i[a]))] = !(e[o] = i[a]);
                            })
                          : function (t) {
                              return r(t, 0, o);
                            })
                      : r;
                  },
              },
              pseudos: {
                not: et(function (t) {
                  var e = [];
                      var n = [];
                      var o = vt(t.replace(M, '$1'));
                  return o[v]
                    ? et(function (t, e, n, r) {
                        for (var i, a = o(t, null, r, []), s = t.length; s--; ) (i = a[s]) && (t[s] = !(e[s] = i));
                      })
                    : function (t, r, i) {
                        return (e[0] = t), o(e, null, i, n), (e[0] = null), !n.pop();
                      };
                }),
                has: et(function (t) {
                  return function (e) {
                    return Z(t, e).length > 0;
                  };
                }),
                contains: et(function (t) {
                  return (
                    (t = t.replace(K, Y)),
                    function (e) {
                      return (e.textContent || j.text(e)).indexOf(t) > -1;
                    }
                  );
                }),
                lang: et(function (t) {
                  return (
                    W.test(t || '') || Z.error(`unsupported lang: ${  t}`),
                    (t = t.replace(K, Y).toLowerCase()),
                    function (e) {
                      let n;
                      do {
                        if ((n = d ? e.lang : e.getAttribute('xml:lang') || e.getAttribute('lang')))
                          return (n = n.toLowerCase()) === t || n.indexOf(t + '-') === 0;
                      } while ((e = e.parentNode) && e.nodeType === 1);
                      return !1;
                    }
                  );
                }),
                target (t) {
                    var e = o.location && o.location.hash;
                    return e && e.slice(1) === t.id;
                  },
                root (t) {
                    return t === l;
                  },
                focus (t) {
                    return (
                      t ===
                        (function () {
                          try {
                            return u.activeElement;
                          } catch (t) {}
                        })() &&
                      u.hasFocus() &&
                      !!(t.type || t.href || ~t.tabIndex)
                    );
                  },
                enabled: it(!1),
                disabled: it(!0),
                checked (t) {
                    return (A(t, 'input') && !!t.checked) || (A(t, 'option') && !!t.selected);
                  },
                selected (t) {
                    return t.parentNode && t.parentNode.selectedIndex, !0 === t.selected;
                  },
                empty (t) {
                    for (t = t.firstChild; t; t = t.nextSibling) if (t.nodeType < 6) return !1;
                    return !0;
                  },
                parent: function (t) {
                  return !e.pseudos.empty(t);
                },
                header (t) {
                    return V.test(t.nodeName);
                  },
                input (t) {
                    return z.test(t.nodeName);
                  },
                button (t) {
                    return (A(t, 'input') && 'button' === t.type) || A(t, 'button');
                  },
                text (t) {
                    var e;
                    return (
                      A(t, 'input') &&
                      'text' === t.type &&
                      (null == (e = t.getAttribute('type')) || 'text' === e.toLowerCase())
                    );
                  },
                first: at(function () {
                  return [0];
                }),
                last: at(function (t, e) {
                  return [e - 1];
                }),
                eq: at(function (t, e, n) {
                  return [n < 0 ? n + e : n];
                }),
                even: at(function (t, e) {
                  for (let n = 0; n < e; n += 2) t.push(n);
                  return t;
                }),
                odd: at(function (t, e) {
                  for (let n = 1; n < e; n += 2) t.push(n);
                  return t;
                }),
                lt: at(function (t, e, n) {
                  var o;
                  for (o = n < 0 ? n + e : n > e ? e : n; --o >= 0; ) t.push(o);
                  return t;
                }),
                gt: at(function (t, e, n) {
                  for (let o = n < 0 ? n + e : n; ++o < e; ) t.push(o);
                  return t;
                }),
              },
            }),
          (e.pseudos.nth = e.pseudos.eq),
          { radio: !0, checkbox: !0, file: !0, password: !0, image: !0 }))
            e.pseudos[t] = ot(t);
          for (t in { submit: !0, reset: !0 }) e.pseudos[t] = rt(t);
          function lt() {}
          function ct(t, n) {
            var o;
                var r;
                var i;
                var a;
                var s;
                var u;
                var l;
                var c = w[`${t  } `];
            if (c) return n ? 0 : c.slice(0);
            for (s = t, u = [], l = e.preFilter; s; ) {
              for (a in ((o && !(r = R.exec(s))) || (r && (s = s.slice(r[0].length) || s), u.push((i = []))),
              (o = !1),
              (r = O.exec(s)) &&
                ((o = r.shift()), i.push({ value: o, type: r[0].replace(M, ' ') }), (s = s.slice(o.length))),
              e.filter))
                !(r = U[a].exec(s)) ||
                  (l[a] && !(r = l[a](r))) ||
                  ((o = r.shift()), i.push({ value: o, type: a, matches: r }), (s = s.slice(o.length)));
              if (!o) break;
            }
            return n ? s.length : s ? Z.error(t) : w(t, u).slice(0);
          }
          function dt(t) {
            for (var e = 0, n = t.length, o = ''; e < n; e++) o += t[e].value;
            return o;
          }
          function pt(t, e, n) {
            var o = e.dir;
                var r = e.next;
                var i = r || o;
                var a = n && 'parentNode' === i;
                var s = b++;
            return e.first
              ? function (e, n, r) {
                  for (; (e = e[o]); ) if (e.nodeType === 1 || a) return t(e, n, r);
                  return !1;
                }
              : function (e, n, u) {
                  var l;
                      var c;
                      var d = [y, s];
                  if (u) {
                    for (; (e = e[o]); ) if ((e.nodeType === 1 || a) && t(e, n, u)) return !0;
                  } else
                    for (; (e = e[o]); )
                      if (e.nodeType === 1 || a)
                        if (((c = e[v] || (e[v] = {})), r && A(e, r))) e = e[o] || e;
                        else {
                          if ((l = c[i]) && l[0] === y && l[1] === s) return (d[2] = l[2]);
                          if (((c[i] = d), (d[2] = t(e, n, u)))) return !0;
                        }
                  return !1;
                };
          }
          function ft(t) {
            return t.length > 1
              ? function (e, n, o) {
                  for (let r = t.length; r--; ) if (!t[r](e, n, o)) return !1;
                  return !0;
                }
              : t[0];
          }
          function ht(t, e, n, o, r) {
            for (var i, a = [], s = 0, u = t.length, l = e != null; s < u; s++)
              (i = t[s]) && ((n && !n(i, o, r)) || (a.push(i), l && e.push(s)));
            return a;
          }
          function mt(t, e, n, o, r, i) {
            return (
              o && !o[v] && (o = mt(o)),
              r && !r[v] && (r = mt(r, i)),
              et(function (i, a, s, u) {
                var l;
                    var d;
                    var p;
                    var f;
                    var h = [];
                    var g = [];
                    var v = a.length;
                    var y =
                      i ||
                      (function (t, e, n) {
                        for (var o = 0, r = e.length; o < r; o++) Z(t, e[o], n);
                        return n;
                      })(e || '*', s.nodeType ? [s] : s, []);
                    var b = !t || (!i && e) ? y : ht(y, h, t, s, u);
                if ((n ? n(b, (f = r || (i ? t : v || o) ? [] : a), s, u) : (f = b), o))
                  for (l = ht(f, g), o(l, [], s, u), d = l.length; d--; ) (p = l[d]) && (f[g[d]] = !(b[g[d]] = p));
                if (i) {
                  if (r || t) {
                    if (r) {
                      for (l = [], d = f.length; d--; ) (p = f[d]) && l.push((b[d] = p));
                      r(null, (f = []), l, u);
                    }
                    for (d = f.length; d--; ) (p = f[d]) && (l = r ? c.call(i, p) : h[d]) > -1 && (i[l] = !(a[l] = p));
                  }
                } else (f = ht(f === a ? f.splice(v, f.length) : f)), r ? r(null, a, f, u) : m.apply(a, f);
              })
            );
          }
          function gt(t) {
            for (
              var o,
                r,
                i,
                a = t.length,
                s = e.relative[t[0].type],
                u = s || e.relative[' '],
                l = s ? 1 : 0,
                d = pt(
                  function (t) {
                    return t === o;
                  },
                  u,
                  !0,
                ),
                p = pt(
                  function (t) {
                    return c.call(o, t) > -1;
                  },
                  u,
                  !0,
                ),
                f = [
                  function (t, e, r) {
                    let i = (!s && (r || e != n)) || ((o = e).nodeType ? d(t, e, r) : p(t, e, r));
                    return (o = null), i;
                  },
                ];
              l < a;
              l++
            )
              if ((r = e.relative[t[l].type])) f = [pt(ft(f), r)];
              else {
                if ((r = e.filter[t[l].type].apply(null, t[l].matches))[v]) {
                  for (i = ++l; i < a && !e.relative[t[i].type]; i++);
                  return mt(
                    l > 1 && ft(f),
                    l > 1 && dt(t.slice(0, l - 1).concat({ value: t[l - 2].type === ' ' ? '*' : '' })).replace(M, '$1'),
                    r,
                    l < i && gt(t.slice(l, i)),
                    i < a && gt((t = t.slice(i))),
                    i < a && dt(t),
                  );
                }
                f.push(r);
              }
            return ft(f);
          }
          function vt(t, o) {
            var r;
                var i = [];
                var a = [];
                var s = k[`${t  } `];
            if (!s) {
              for (o || (o = ct(t)), r = o.length; r--; ) (s = gt(o[r]))[v] ? i.push(s) : a.push(s);
              (s = k(
                t,
                (function (t, o) {
                  var r = o.length > 0;
                      var i = t.length > 0;
                      var a = function (a, s, l, c, p) {
                      var f;
                          var h;
                          var g;
                          var v = 0;
                          var b = '0';
                          var x = a && [];
                          var w = [];
                          var k = n;
                          var T = a || (i && e.find.TAG('*', p));
                          var C = (y += null == k ? 1 : Math.random() || 0.1);
                          var S = T.length;
                      for (p && (n = s == u || s || p); b !== S && (f = T[b]) != null; b++) {
                        if (i && f) {
                          for (h = 0, s || f.ownerDocument == u || (ut(f), (l = !d)); (g = t[h++]); )
                            if (g(f, s || u, l)) {
                              m.call(c, f);
                              break;
                            }
                          p && (y = C);
                        }
                        r && ((f = !g && f) && v--, a && x.push(f));
                      }
                      if (((v += b), r && b !== v)) {
                        for (h = 0; (g = o[h++]); ) g(x, w, s, l);
                        if (a) {
                          if (v > 0) for (; b--; ) x[b] || w[b] || (w[b] = E.call(c));
                          w = ht(w);
                        }
                        m.apply(c, w), p && !a && w.length > 0 && v + o.length > 1 && j.uniqueSort(c);
                      }
                      return p && ((y = C), (n = k)), x;
                    };
                  return r ? et(a) : a;
                })(a, i),
              )),
                (s.selector = t);
            }
            return s;
          }
          function yt(t, n, o, r) {
            var i;
                var a;
                var s;
                var u;
                var l;
                var c = 'function' == typeof t && t;
                var p = !r && ct((t = c.selector || t));
            if (((o = o || []), p.length === 1)) {
              if (
                (a = p[0] = p[0].slice(0)).length > 2 &&
                'ID' === (s = a[0]).type &&
                9 === n.nodeType &&
                d &&
                e.relative[a[1].type]
              ) {
                if (!(n = (e.find.ID(s.matches[0].replace(K, Y), n) || [])[0])) return o;
                c && (n = n.parentNode), (t = t.slice(a.shift().value.length));
              }
              for (i = U.needsContext.test(t) ? 0 : a.length; i-- && ((s = a[i]), !e.relative[(u = s.type)]); )
                if (
                  (l = e.find[u]) &&
                  (r = l(s.matches[0].replace(K, Y), (G.test(a[0].type) && st(n.parentNode)) || n))
                ) {
                  if ((a.splice(i, 1), !(t = r.length && dt(a)))) return m.apply(o, r), o;
                  break;
                }
            }
            return (c || vt(t, p))(r, n, !d, o, !n || (G.test(t) && st(n.parentNode)) || n), o;
          }
          (lt.prototype = e.filters = e.pseudos),
            (e.setFilters = new lt()),
            (g.sortStable = v.split('').sort(C).join('') === v),
            ut(),
            (g.sortDetached = nt(function (t) {
              return 1 & t.compareDocumentPosition(u.createElement('fieldset'));
            })),
            (j.find = Z),
            (j.expr[':'] = j.expr.pseudos),
            (j.unique = j.uniqueSort),
            (Z.compile = vt),
            (Z.select = yt),
            (Z.setDocument = ut),
            (Z.tokenize = ct),
            (Z.escape = j.escapeSelector),
            (Z.getText = j.text),
            (Z.isXML = j.isXMLDoc),
            (Z.selectors = j.expr),
            (Z.support = j.support),
            (Z.uniqueSort = j.uniqueSort);
        })();
        var H = function (t, e, n) {
            for (var o = [], r = void 0 !== n; (t = t[e]) && t.nodeType !== 9; )
              if (t.nodeType === 1) {
                if (r && j(t).is(n)) break;
                o.push(t);
              }
            return o;
          };
            var q = function (t, e) {
              for (var n = []; t; t = t.nextSibling) 1 === t.nodeType && t !== e && n.push(t);
              return n;
            };
            var R = j.expr.match.needsContext;
            var O = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
        function P(t, e, n) {
          return v(e)
            ? j.grep(t, function (t, o) {
                return !!e.call(t, o, t) !== n;
              })
            : e.nodeType
            ? j.grep(t, function (t) {
                return (t === e) !== n;
              })
            : typeof e != 'string'
            ? j.grep(t, function (t) {
                return c.call(e, t) > -1 !== n;
              })
            : j.filter(e, t, n);
        }
        (j.filter = function (t, e, n) {
          var o = e[0];
          return (
            n && (t = `:not(${  t  })`),
            1 === e.length && o.nodeType === 1
              ? j.find.matchesSelector(o, t)
                ? [o]
                : []
              : j.find.matches(
                  t,
                  j.grep(e, function (t) {
                    return t.nodeType === 1;
                  }),
                )
          );
        }),
          j.fn.extend({
            find: function (t) {
              var e;
                  var n;
                  var o = this.length;
                  var r = this;
              if (typeof t != 'string')
                return this.pushStack(
                  j(t).filter(function () {
                    for (e = 0; e < o; e++) if (j.contains(r[e], this)) return !0;
                  }),
                );
              for (n = this.pushStack([]), e = 0; e < o; e++) j.find(t, r[e], n);
              return o > 1 ? j.uniqueSort(n) : n;
            },
            filter: function (t) {
              return this.pushStack(P(this, t || [], !1));
            },
            not: function (t) {
              return this.pushStack(P(this, t || [], !0));
            },
            is: function (t) {
              return !!P(this, typeof t == 'string' && R.test(t) ? j(t) : t || [], !1).length;
            },
          });
        let I;
            var W = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
        ((j.fn.init = function (t, e, n) {
          var o; var r;
          if (!t) return this;
          if (((n = n || I), typeof t == 'string')) {
            if (
              !(o = t[0] === '<' && t[t.length - 1] === '>' && t.length >= 3 ? [null, t, null] : W.exec(t)) ||
              (!o[1] && e)
            )
              return !e || e.jquery ? (e || n).find(t) : this.constructor(e).find(t);
            if (o[1]) {
              if (
                ((e = e instanceof j ? e[0] : e),
                j.merge(this, j.parseHTML(o[1], e && e.nodeType ? e.ownerDocument || e : b, !0)),
                O.test(o[1]) && j.isPlainObject(e))
              )
                for (o in e) v(this[o]) ? this[o](e[o]) : this.attr(o, e[o]);
              return this;
            }
            return (r = b.getElementById(o[2])) && ((this[0] = r), (this.length = 1)), this;
          }
          return t.nodeType
            ? ((this[0] = t), (this.length = 1), this)
            : v(t)
            ? void 0 !== n.ready
              ? n.ready(t)
              : t(j)
            : j.makeArray(t, this);
        }).prototype = j.fn),
          (I = j(b));
        let U = /^(?:parents|prev(?:Until|All))/;
            var z = { children: !0, contents: !0, next: !0, prev: !0 };
        function V(t, e) {
          for (; (t = t[e]) && t.nodeType !== 1; );
          return t;
        }
        j.fn.extend({
          has (t) {
              var e = j(t, this),
                n = e.length;
              return this.filter(function () {
                for (var t = 0; t < n; t++) if (j.contains(this, e[t])) return !0;
              });
            },
          closest: function (t, e) {
            var n;
                var o = 0;
                var r = this.length;
                var i = [];
                var a = typeof t != 'string' && j(t);
            if (!R.test(t))
              for (; o < r; o++)
                for (n = this[o]; n && n !== e; n = n.parentNode)
                  if (n.nodeType < 11 && (a ? a.index(n) > -1 : n.nodeType === 1 && j.find.matchesSelector(n, t))) {
                    i.push(n);
                    break;
                  }
            return this.pushStack(i.length > 1 ? j.uniqueSort(i) : i);
          },
          index (t) {
              return t
                ? 'string' == typeof t
                  ? c.call(j(t), this[0])
                  : c.call(this, t.jquery ? t[0] : t)
                : this[0] && this[0].parentNode
                ? this.first().prevAll().length
                : -1;
            },
          add (t, e) {
              return this.pushStack(j.uniqueSort(j.merge(this.get(), j(t, e))));
            },
          addBack (t) {
              return this.add(null == t ? this.prevObject : this.prevObject.filter(t));
            },
        }),
          j.each(
            {
              parent (t) {
                  var e = t.parentNode;
                  return e && 11 !== e.nodeType ? e : null;
                },
              parents: function (t) {
                return H(t, 'parentNode');
              },
              parentsUntil: function (t, e, n) {
                return H(t, 'parentNode', n);
              },
              next: function (t) {
                return V(t, 'nextSibling');
              },
              prev: function (t) {
                return V(t, 'previousSibling');
              },
              nextAll: function (t) {
                return H(t, 'nextSibling');
              },
              prevAll (t) {
                  return H(t, 'previousSibling');
                },
              nextUntil (t, e, n) {
                  return H(t, 'nextSibling', n);
                },
              prevUntil (t, e, n) {
                  return H(t, 'previousSibling', n);
                },
              siblings (t) {
                  return q((t.parentNode || {}).firstChild, t);
                },
              children (t) {
                  return q(t.firstChild);
                },
              contents (t) {
                  return null != t.contentDocument && a(t.contentDocument)
                    ? t.contentDocument
                    : (A(t, 'template') && (t = t.content || t), j.merge([], t.childNodes));
                },
            },
            function (t, e) {
              j.fn[t] = function (n, o) {
                let r = j.map(this, e, n);
                return (
                  'Until' !== t.slice(-5) && (o = n),
                  o && typeof o == 'string' && (r = j.filter(o, r)),
                  this.length > 1 && (z[t] || j.uniqueSort(r), U.test(t) && r.reverse()),
                  this.pushStack(r)
                );
              };
            },
          );
        let X = /[^\x20\t\r\n\f]+/g;
        function G(t) {
          return t;
        }
        function K(t) {
          throw t;
        }
        function Y(t, e, n, o) {
          var r;
          try {
            t && v((r = t.promise))
              ? r.call(t).done(e).fail(n)
              : t && v((r = t.then))
              ? r.call(t, e, n)
              : e.apply(void 0, [t].slice(o));
          } catch (t) {
            n.apply(void 0, [t]);
          }
        }
        (j.Callbacks = function (t) {
          t =
            'string' === typeof t
              ? (function (t) {
                  let e = {};
                  return (
                    j.each(t.match(X) || [], function (t, n) {
                      e[n] = !0;
                    }),
                    e
                  );
                })(t)
              : j.extend({}, t);
          var e;
              var n;
              var o;
              var r;
              var i = [];
              var a = [];
              var s = -1;
              var u = function () {
                for (r = r || t.once, o = e = !0; a.length; s = -1)
                  for (n = a.shift(); ++s < i.length; )
                    !1 === i[s].apply(n[0], n[1]) && t.stopOnFalse && ((s = i.length), (n = !1));
                t.memory || (n = !1), (e = !1), r && (i = n ? [] : '');
              };
              var l = {
              add () {
                  return (
                    i &&
                      (n && !e && ((s = i.length - 1), a.push(n)),
                      (function e(n) {
                        j.each(n, function (n, o) {
                          v(o) ? (t.unique && l.has(o)) || i.push(o) : o && o.length && 'string' !== k(o) && e(o);
                        });
                      })(arguments),
                      n && !e && u()),
                    this
                  );
                },
              remove () {
                  return (
                    j.each(arguments, function (t, e) {
                      for (var n; (n = j.inArray(e, i, n)) > -1; ) i.splice(n, 1), n <= s && s--;
                    }),
                    this
                  );
                },
              has: function (t) {
                return t ? j.inArray(t, i) > -1 : i.length > 0;
              },
              empty: function () {
                return i && (i = []), this;
              },
              disable: function () {
                return (r = a = []), (i = n = ''), this;
              },
              disabled: function () {
                return !i;
              },
              lock: function () {
                return (r = a = []), n || e || (i = n = ''), this;
              },
              locked () {
                  return !!r;
                },
              fireWith (t, n) {
                  return r || ((n = [t, (n = n || []).slice ? n.slice() : n]), a.push(n), e || u()), this;
                },
              fire () {
                  return l.fireWith(this, arguments), this;
                },
              fired () {
                  return !!o;
                },
            };
          return l;
        }),
          j.extend({
            Deferred (t) {
                var e = [
                    ['notify', 'progress', j.Callbacks('memory'), j.Callbacks('memory'), 2],
                    ['resolve', 'done', j.Callbacks('once memory'), j.Callbacks('once memory'), 0, 'resolved'],
                    ['reject', 'fail', j.Callbacks('once memory'), j.Callbacks('once memory'), 1, 'rejected'],
                  ],
                  n = 'pending',
                  r = {
                    state: function () {
                      return n;
                    },
                    always: function () {
                      return i.done(arguments).fail(arguments), this;
                    },
                    catch: function (t) {
                      return r.then(null, t);
                    },
                    pipe: function () {
                      var t = arguments;
                      return j
                        .Deferred(function (n) {
                          j.each(e, function (e, o) {
                            var r = v(t[o[4]]) && t[o[4]];
                            i[o[1]](function () {
                              var t = r && r.apply(this, arguments);
                              t && v(t.promise)
                                ? t.promise().progress(n.notify).done(n.resolve).fail(n.reject)
                                : n[o[0] + 'With'](this, r ? [t] : arguments);
                            });
                          }),
                            (t = null);
                        })
                        .promise();
                    },
                    then: function (t, n, r) {
                      var i = 0;
                      function a(t, e, n, r) {
                        return function () {
                          var s = this,
                            u = arguments,
                            l = function () {
                              var o, l;
                              if (!(t < i)) {
                                if ((o = n.apply(s, u)) === e.promise())
                                  throw new TypeError('Thenable self-resolution');
                                (l = o && ('object' == typeof o || 'function' == typeof o) && o.then),
                                  v(l)
                                    ? r
                                      ? l.call(o, a(i, e, G, r), a(i, e, K, r))
                                      : (i++, l.call(o, a(i, e, G, r), a(i, e, K, r), a(i, e, G, e.notifyWith)))
                                    : (n !== G && ((s = void 0), (u = [o])), (r || e.resolveWith)(s, u));
                              }
                            },
                            c = r
                              ? l
                              : function () {
                                  try {
                                    l();
                                  } catch (o) {
                                    j.Deferred.exceptionHook && j.Deferred.exceptionHook(o, c.error),
                                      t + 1 >= i && (n !== K && ((s = void 0), (u = [o])), e.rejectWith(s, u));
                                  }
                                };
                          t
                            ? c()
                            : (j.Deferred.getErrorHook
                                ? (c.error = j.Deferred.getErrorHook())
                                : j.Deferred.getStackHook && (c.error = j.Deferred.getStackHook()),
                              o.setTimeout(c));
                        };
                      }
                      return j
                        .Deferred(function (o) {
                          e[0][3].add(a(0, o, v(r) ? r : G, o.notifyWith)),
                            e[1][3].add(a(0, o, v(t) ? t : G)),
                            e[2][3].add(a(0, o, v(n) ? n : K));
                        })
                        .promise();
                    },
                    promise: function (t) {
                      return null != t ? j.extend(t, r) : r;
                    },
                  },
                  i = {};
                return (
                  j.each(e, function (t, o) {
                    var a = o[2],
                      s = o[5];
                    (r[o[1]] = a.add),
                      s &&
                        a.add(
                          function () {
                            n = s;
                          },
                          e[3 - t][2].disable,
                          e[3 - t][3].disable,
                          e[0][2].lock,
                          e[0][3].lock,
                        ),
                      a.add(o[3].fire),
                      (i[o[0]] = function () {
                        return i[o[0] + 'With'](this === i ? void 0 : this, arguments), this;
                      }),
                      (i[o[0] + 'With'] = a.fireWith);
                  }),
                  r.promise(i),
                  t && t.call(i, i),
                  i
                );
              },
            when (t) {
                var e = arguments.length,
                  n = e,
                  o = Array(n),
                  r = s.call(arguments),
                  i = j.Deferred(),
                  a = function (t) {
                    return function (n) {
                      (o[t] = this), (r[t] = arguments.length > 1 ? s.call(arguments) : n), --e || i.resolveWith(o, r);
                    };
                  };
                if (
                  e <= 1 &&
                  (Y(t, i.done(a(n)).resolve, i.reject, !e), 'pending' === i.state() || v(r[n] && r[n].then))
                )
                  return i.then();
                for (; n--; ) Y(r[n], a(n), i.reject);
                return i.promise();
              },
          });
        var Q = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
        (j.Deferred.exceptionHook = function (t, e) {
          o.console &&
            o.console.warn &&
            t &&
            Q.test(t.name) &&
            o.console.warn(`jQuery.Deferred exception: ${  t.message}`, t.stack, e);
        }),
          (j.readyException = function (t) {
            o.setTimeout(function () {
              throw t;
            });
          });
        let J = j.Deferred();
        function Z() {
          b.removeEventListener('DOMContentLoaded', Z), o.removeEventListener('load', Z), j.ready();
        }
        (j.fn.ready = function (t) {
          return (
            J.then(t).catch(function (t) {
              j.readyException(t);
            }),
            this
          );
        }),
          j.extend({
            isReady: !1,
            readyWait: 1,
            ready: function (t) {
              (!0 === t ? --j.readyWait : j.isReady) ||
                ((j.isReady = !0), (!0 !== t && --j.readyWait > 0) || J.resolveWith(b, [j]));
            },
          }),
          (j.ready.then = J.then),
          b.readyState === 'complete' || (b.readyState !== 'loading' && !b.documentElement.doScroll)
            ? o.setTimeout(j.ready)
            : (b.addEventListener('DOMContentLoaded', Z), o.addEventListener('load', Z));
        let tt = function (t, e, n, o, r, i, a) {
            var s = 0;
                var u = t.length;
                var l = n == null;
            if (k(n) === 'object') for (s in ((r = !0), n)) tt(t, e, s, n[s], !0, i, a);
            else if (
              void 0 !== o &&
              ((r = !0),
              v(o) || (a = !0),
              l &&
                (a
                  ? (e.call(t, o), (e = null))
                  : ((l = e),
                    (e = function (t, e, n) {
                      return l.call(j(t), n);
                    }))),
              e)
            )
              for (; s < u; s++) e(t[s], n, a ? o : o.call(t[s], s, e(t[s], n)));
            return r ? t : l ? e.call(t) : u ? e(t[0], n) : i;
          };
            var et = /^-ms-/;
            var nt = /-([a-z])/g;
        function ot(t, e) {
          return e.toUpperCase();
        }
        function rt(t) {
          return t.replace(et, 'ms-').replace(nt, ot);
        }
        var it = function (t) {
          return t.nodeType === 1 || t.nodeType === 9 || !+t.nodeType;
        };
        function at() {
          this.expando = j.expando + at.uid++;
        }
        (at.uid = 1),
          (at.prototype = {
            cache: function (t) {
              var e = t[this.expando];
              return (
                e ||
                  ((e = {}),
                  it(t) &&
                    (t.nodeType
                      ? (t[this.expando] = e)
                      : Object.defineProperty(t, this.expando, { value: e, configurable: !0 }))),
                e
              );
            },
            set (t, e, n) {
                var o,
                  r = this.cache(t);
                if ('string' == typeof e) r[rt(e)] = n;
                else for (o in e) r[rt(o)] = e[o];
                return r;
              },
            get (t, e) {
                return void 0 === e ? this.cache(t) : t[this.expando] && t[this.expando][rt(e)];
              },
            access (t, e, n) {
                return void 0 === e || (e && 'string' == typeof e && void 0 === n)
                  ? this.get(t, e)
                  : (this.set(t, e, n), void 0 !== n ? n : e);
              },
            remove: function (t, e) {
              var n;
                  var o = t[this.expando];
              if (void 0 !== o) {
                if (void 0 !== e) {
                  n = (e = Array.isArray(e) ? e.map(rt) : (e = rt(e)) in o ? [e] : e.match(X) || []).length;
                  for (; n--; ) delete o[e[n]];
                }
                (void 0 === e || j.isEmptyObject(o)) &&
                  (t.nodeType ? (t[this.expando] = void 0) : delete t[this.expando]);
              }
            },
            hasData (t) {
                var e = t[this.expando];
                return void 0 !== e && !j.isEmptyObject(e);
              },
          });
        var st = new at();
            var ut = new at();
            var lt = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;
            var ct = /[A-Z]/g;
        function dt(t, e, n) {
          let o;
          if (void 0 === n && t.nodeType === 1)
            if (((o = `data-${  e.replace(ct, '-$&').toLowerCase()}`), typeof (n = t.getAttribute(o)) == 'string')) {
              try {
                n = (function (t) {
                  return (
                    t === 'true' ||
                    (t !== 'false' && (t === 'null' ? null : t === `${+t  }` ? +t : lt.test(t) ? JSON.parse(t) : t))
                  );
                })(n);
              } catch (t) {}
              ut.set(t, e, n);
            } else n = void 0;
          return n;
        }
        j.extend({
          hasData (t) {
              return ut.hasData(t) || st.hasData(t);
            },
          data (t, e, n) {
              return ut.access(t, e, n);
            },
          removeData (t, e) {
              ut.remove(t, e);
            },
          _data (t, e, n) {
              return st.access(t, e, n);
            },
          _removeData (t, e) {
              st.remove(t, e);
            },
        }),
          j.fn.extend({
            data: function (t, e) {
              var n;
                  var o;
                  var r;
                  var i = this[0];
                  var a = i && i.attributes;
              if (void 0 === t) {
                if (this.length && ((r = ut.get(i)), i.nodeType === 1 && !st.get(i, 'hasDataAttrs'))) {
                  for (n = a.length; n--; )
                    a[n] && (o = a[n].name).indexOf('data-') === 0 && ((o = rt(o.slice(5))), dt(i, o, r[o]));
                  st.set(i, 'hasDataAttrs', !0);
                }
                return r;
              }
              return typeof t == 'object'
                ? this.each(function () {
                    ut.set(this, t);
                  })
                : tt(
                    this,
                    function (e) {
                      let n;
                      if (i && void 0 === e)
                        return void 0 !== (n = ut.get(i, t)) || void 0 !== (n = dt(i, t)) ? n : void 0;
                      this.each(function () {
                        ut.set(this, t, e);
                      });
                    },
                    null,
                    e,
                    arguments.length > 1,
                    null,
                    !0,
                  );
            },
            removeData (t) {
                return this.each(function () {
                  ut.remove(this, t);
                });
              },
          }),
          j.extend({
            queue (t, e, n) {
                var o;
                if (t)
                  return (
                    (e = (e || 'fx') + 'queue'),
                    (o = st.get(t, e)),
                    n && (!o || Array.isArray(n) ? (o = st.access(t, e, j.makeArray(n))) : o.push(n)),
                    o || []
                  );
              },
            dequeue (t, e) {
                e = e || 'fx';
                var n = j.queue(t, e),
                  o = n.length,
                  r = n.shift(),
                  i = j._queueHooks(t, e);
                'inprogress' === r && ((r = n.shift()), o--),
                  r &&
                    ('fx' === e && n.unshift('inprogress'),
                    delete i.stop,
                    r.call(
                      t,
                      function () {
                        j.dequeue(t, e);
                      },
                      i,
                    )),
                  !o && i && i.empty.fire();
              },
            _queueHooks: function (t, e) {
              let n = `${e  }queueHooks`;
              return (
                st.get(t, n) ||
                st.access(t, n, {
                  empty: j.Callbacks('once memory').add(function () {
                    st.remove(t, [`${e  }queue`, n]);
                  }),
                })
              );
            },
          }),
          j.fn.extend({
            queue (t, e) {
                var n = 2;
                return (
                  'string' != typeof t && ((e = t), (t = 'fx'), n--),
                  arguments.length < n
                    ? j.queue(this[0], t)
                    : void 0 === e
                    ? this
                    : this.each(function () {
                        var n = j.queue(this, t, e);
                        j._queueHooks(this, t), 'fx' === t && 'inprogress' !== n[0] && j.dequeue(this, t);
                      })
                );
              },
            dequeue (t) {
                return this.each(function () {
                  j.dequeue(this, t);
                });
              },
            clearQueue: function (t) {
              return this.queue(t || 'fx', []);
            },
            promise (t, e) {
                var n,
                  o = 1,
                  r = j.Deferred(),
                  i = this,
                  a = this.length,
                  s = function () {
                    --o || r.resolveWith(i, [i]);
                  };
                for ('string' != typeof t && ((e = t), (t = void 0)), t = t || 'fx'; a--; )
                  (n = st.get(i[a], t + 'queueHooks')) && n.empty && (o++, n.empty.add(s));
                return s(), r.promise(e);
              },
          });
        var pt = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
            var ft = new RegExp('^(?:([+-])=|)(' + pt + ')([a-z%]*)$', 'i');
            var ht = ['Top', 'Right', 'Bottom', 'Left'];
            var mt = b.documentElement;
            var gt = function (t) {
              return j.contains(t.ownerDocument, t);
            };
            var vt = { composed: !0 };
        mt.getRootNode &&
          (gt = function (t) {
            return j.contains(t.ownerDocument, t) || t.getRootNode(vt) === t.ownerDocument;
          });
        let yt = function (t, e) {
          return (
            'none' === (t = e || t).style.display || (t.style.display === '' && gt(t) && j.css(t, 'display') === 'none')
          );
        };
        function bt(t, e, n, o) {
          let r;
              var i;
              var a = 20;
              var s = o
                ? function () {
                    return o.cur();
                  }
                : function () {
                    return j.css(t, e, '');
                  };
              var u = s();
              var l = (n && n[3]) || (j.cssNumber[e] ? '' : 'px');
              var c = t.nodeType && (j.cssNumber[e] || (l !== 'px' && +u)) && ft.exec(j.css(t, e));
          if (c && c[3] !== l) {
            for (u /= 2, l = l || c[3], c = +u || 1; a--; )
              j.style(t, e, c + l), (1 - i) * (1 - (i = s() / u || 0.5)) <= 0 && (a = 0), (c /= i);
            (c *= 2), j.style(t, e, c + l), (n = n || []);
          }
          return (
            n &&
              ((c = +c || +u || 0),
              (r = n[1] ? c + (n[1] + 1) * n[2] : +n[2]),
              o && ((o.unit = l), (o.start = c), (o.end = r))),
            r
          );
        }
        let xt = {};
        function wt(t) {
          var e;
              var n = t.ownerDocument;
              var o = t.nodeName;
              var r = xt[o];
          return (
            r ||
            ((e = n.body.appendChild(n.createElement(o))),
            (r = j.css(e, 'display')),
            e.parentNode.removeChild(e),
            'none' === r && (r = 'block'),
            (xt[o] = r),
            r)
          );
        }
        function kt(t, e) {
          for (var n, o, r = [], i = 0, a = t.length; i < a; i++)
            (o = t[i]).style &&
              ((n = o.style.display),
              e
                ? (n === 'none' && ((r[i] = st.get(o, 'display') || null), r[i] || (o.style.display = '')),
                  '' === o.style.display && yt(o) && (r[i] = wt(o)))
                : n !== 'none' && ((r[i] = 'none'), st.set(o, 'display', n)));
          for (i = 0; i < a; i++) r[i] != null && (t[i].style.display = r[i]);
          return t;
        }
        j.fn.extend({
          show: function () {
            return kt(this, !0);
          },
          hide: function () {
            return kt(this);
          },
          toggle: function (t) {
            return typeof t == 'boolean'
              ? t
                ? this.show()
                : this.hide()
              : this.each(function () {
                  yt(this) ? j(this).show() : j(this).hide();
                });
          },
        });
        var Tt;
            var Ct;
            var jt = /^(?:checkbox|radio)$/i;
            var St = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;
            var At = /^$|^module$|\/(?:java|ecma)script/i;
        (Tt = b.createDocumentFragment().appendChild(b.createElement('div'))),
          (Ct = b.createElement('input')).setAttribute('type', 'radio'),
          Ct.setAttribute('checked', 'checked'),
          Ct.setAttribute('name', 't'),
          Tt.appendChild(Ct),
          (g.checkClone = Tt.cloneNode(!0).cloneNode(!0).lastChild.checked),
          (Tt.innerHTML = '<textarea>x</textarea>'),
          (g.noCloneChecked = !!Tt.cloneNode(!0).lastChild.defaultValue),
          (Tt.innerHTML = '<option></option>'),
          (g.option = !!Tt.lastChild);
        var Et = {
          thead: [1, '<table>', '</table>'],
          col: [2, '<table><colgroup>', '</colgroup></table>'],
          tr: [2, '<table><tbody>', '</tbody></table>'],
          td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
          _default: [0, '', ''],
        };
        function _t(t, e) {
          var n;
          return (
            (n =
              void 0 !== t.getElementsByTagName
                ? t.getElementsByTagName(e || '*')
                : void 0 !== t.querySelectorAll
                ? t.querySelectorAll(e || '*')
                : []),
            void 0 === e || (e && A(t, e)) ? j.merge([t], n) : n
          );
        }
        function Bt(t, e) {
          for (let n = 0, o = t.length; n < o; n++) st.set(t[n], 'globalEval', !e || st.get(e[n], 'globalEval'));
        }
        (Et.tbody = Et.tfoot = Et.colgroup = Et.caption = Et.thead),
          (Et.th = Et.td),
          g.option || (Et.optgroup = Et.option = [1, "<select multiple='multiple'>", '</select>']);
        var Dt = /<|&#?\w+;/;
        function Mt(t, e, n, o, r) {
          for (var i, a, s, u, l, c, d = e.createDocumentFragment(), p = [], f = 0, h = t.length; f < h; f++)
            if ((i = t[f]) || i === 0)
              if (k(i) === 'object') j.merge(p, i.nodeType ? [i] : i);
              else if (Dt.test(i)) {
                for (
                  a = a || d.appendChild(e.createElement('div')),
                    s = (St.exec(i) || ['', ''])[1].toLowerCase(),
                    u = Et[s] || Et._default,
                    a.innerHTML = u[1] + j.htmlPrefilter(i) + u[2],
                    c = u[0];
                  c--;

                )
                  a = a.lastChild;
                j.merge(p, a.childNodes), ((a = d.firstChild).textContent = '');
              } else p.push(e.createTextNode(i));
          for (d.textContent = '', f = 0; (i = p[f++]); )
            if (o && j.inArray(i, o) > -1) r && r.push(i);
            else if (((l = gt(i)), (a = _t(d.appendChild(i), 'script')), l && Bt(a), n))
              for (c = 0; (i = a[c++]); ) At.test(i.type || '') && n.push(i);
          return d;
        }
        var $t = /^([^.]*)(?:\.(.+)|)/;
        function Ft() {
          return !0;
        }
        function Lt() {
          return !1;
        }
        function Nt(t, e, n, o, r, i) {
          let a; var s;
          if (typeof e == 'object') {
            for (s in (typeof n != 'string' && ((o = o || n), (n = void 0)), e)) Nt(t, s, n, o, e[s], i);
            return t;
          }
          if (
            (o == null && r == null
              ? ((r = n), (o = n = void 0))
              : r == null && (typeof n == 'string' ? ((r = o), (o = void 0)) : ((r = o), (o = n), (n = void 0))),
            !1 === r)
          )
            r = Lt;
          else if (!r) return t;
          return (
            i === 1 &&
              ((a = r),
              (r = function (t) {
                return j().off(t), a.apply(this, arguments);
              }),
              (r.guid = a.guid || (a.guid = j.guid++))),
            t.each(function () {
              j.event.add(this, e, r, o, n);
            })
          );
        }
        function Ht(t, e, n) {
          n
            ? (st.set(t, e, !1),
              j.event.add(t, e, {
                namespace: !1,
                handler (t) {
                    var n,
                      o = st.get(this, e);
                    if (1 & t.isTrigger && this[e]) {
                      if (o) (j.event.special[e] || {}).delegateType && t.stopPropagation();
                      else if (
                        ((o = s.call(arguments)),
                        st.set(this, e, o),
                        this[e](),
                        (n = st.get(this, e)),
                        st.set(this, e, !1),
                        o !== n)
                      )
                        return t.stopImmediatePropagation(), t.preventDefault(), n;
                    } else
                      o &&
                        (st.set(this, e, j.event.trigger(o[0], o.slice(1), this)),
                        t.stopPropagation(),
                        (t.isImmediatePropagationStopped = Ft));
                  },
              }))
            : void 0 === st.get(t, e) && j.event.add(t, e, Ft);
        }
        (j.event = {
          global: {},
          add: function (t, e, n, o, r) {
            var i;
                var a;
                var s;
                var u;
                var l;
                var c;
                var d;
                var p;
                var f;
                var h;
                var m;
                var g = st.get(t);
            if (it(t))
              for (
                n.handler && ((n = (i = n).handler), (r = i.selector)),
                  r && j.find.matchesSelector(mt, r),
                  n.guid || (n.guid = j.guid++),
                  (u = g.events) || (u = g.events = Object.create(null)),
                  (a = g.handle) ||
                    (a = g.handle =
                      function (e) {
                        return void 0 !== j && j.event.triggered !== e.type
                          ? j.event.dispatch.apply(t, arguments)
                          : void 0;
                      }),
                  l = (e = (e || '').match(X) || ['']).length;
                l--;

              )
                (f = m = (s = $t.exec(e[l]) || [])[1]),
                  (h = (s[2] || '').split('.').sort()),
                  f &&
                    ((d = j.event.special[f] || {}),
                    (f = (r ? d.delegateType : d.bindType) || f),
                    (d = j.event.special[f] || {}),
                    (c = j.extend(
                      {
                        type: f,
                        origType: m,
                        data: o,
                        handler: n,
                        guid: n.guid,
                        selector: r,
                        needsContext: r && j.expr.match.needsContext.test(r),
                        namespace: h.join('.'),
                      },
                      i,
                    )),
                    (p = u[f]) ||
                      (((p = u[f] = []).delegateCount = 0),
                      (d.setup && !1 !== d.setup.call(t, o, h, a)) || (t.addEventListener && t.addEventListener(f, a))),
                    d.add && (d.add.call(t, c), c.handler.guid || (c.handler.guid = n.guid)),
                    r ? p.splice(p.delegateCount++, 0, c) : p.push(c),
                    (j.event.global[f] = !0));
          },
          remove: function (t, e, n, o, r) {
            var i;
                var a;
                var s;
                var u;
                var l;
                var c;
                var d;
                var p;
                var f;
                var h;
                var m;
                var g = st.hasData(t) && st.get(t);
            if (g && (u = g.events)) {
              for (l = (e = (e || '').match(X) || ['']).length; l--; )
                if (((f = m = (s = $t.exec(e[l]) || [])[1]), (h = (s[2] || '').split('.').sort()), f)) {
                  for (
                    d = j.event.special[f] || {},
                      p = u[(f = (o ? d.delegateType : d.bindType) || f)] || [],
                      s = s[2] && new RegExp(`(^|\\.)${  h.join('\\.(?:.*\\.|)')  }(\\.|$)`),
                      a = i = p.length;
                    i--;

                  )
                    (c = p[i]),
                      (!r && m !== c.origType) ||
                        (n && n.guid !== c.guid) ||
                        (s && !s.test(c.namespace)) ||
                        (o && o !== c.selector && (o !== '**' || !c.selector)) ||
                        (p.splice(i, 1), c.selector && p.delegateCount--, d.remove && d.remove.call(t, c));
                  a &&
                    !p.length &&
                    ((d.teardown && !1 !== d.teardown.call(t, h, g.handle)) || j.removeEvent(t, f, g.handle),
                    delete u[f]);
                } else for (f in u) j.event.remove(t, f + e[l], n, o, !0);
              j.isEmptyObject(u) && st.remove(t, 'handle events');
            }
          },
          dispatch (t) {
              var e,
                n,
                o,
                r,
                i,
                a,
                s = new Array(arguments.length),
                u = j.event.fix(t),
                l = (st.get(this, 'events') || Object.create(null))[u.type] || [],
                c = j.event.special[u.type] || {};
              for (s[0] = u, e = 1; e < arguments.length; e++) s[e] = arguments[e];
              if (((u.delegateTarget = this), !c.preDispatch || !1 !== c.preDispatch.call(this, u))) {
                for (a = j.event.handlers.call(this, u, l), e = 0; (r = a[e++]) && !u.isPropagationStopped(); )
                  for (u.currentTarget = r.elem, n = 0; (i = r.handlers[n++]) && !u.isImmediatePropagationStopped(); )
                    (u.rnamespace && !1 !== i.namespace && !u.rnamespace.test(i.namespace)) ||
                      ((u.handleObj = i),
                      (u.data = i.data),
                      void 0 !== (o = ((j.event.special[i.origType] || {}).handle || i.handler).apply(r.elem, s)) &&
                        !1 === (u.result = o) &&
                        (u.preventDefault(), u.stopPropagation()));
                return c.postDispatch && c.postDispatch.call(this, u), u.result;
              }
            },
          handlers (t, e) {
              var n,
                o,
                r,
                i,
                a,
                s = [],
                u = e.delegateCount,
                l = t.target;
              if (u && l.nodeType && !('click' === t.type && t.button >= 1))
                for (; l !== this; l = l.parentNode || this)
                  if (1 === l.nodeType && ('click' !== t.type || !0 !== l.disabled)) {
                    for (i = [], a = {}, n = 0; n < u; n++)
                      void 0 === a[(r = (o = e[n]).selector + ' ')] &&
                        (a[r] = o.needsContext ? j(r, this).index(l) > -1 : j.find(r, this, null, [l]).length),
                        a[r] && i.push(o);
                    i.length && s.push({ elem: l, handlers: i });
                  }
              return (l = this), u < e.length && s.push({ elem: l, handlers: e.slice(u) }), s;
            },
          addProp (t, e) {
              Object.defineProperty(j.Event.prototype, t, {
                enumerable: !0,
                configurable: !0,
                get: v(e)
                  ? function () {
                      if (this.originalEvent) return e(this.originalEvent);
                    }
                  : function () {
                      if (this.originalEvent) return this.originalEvent[t];
                    },
                set: function (e) {
                  Object.defineProperty(this, t, { enumerable: !0, configurable: !0, writable: !0, value: e });
                },
              });
            },
          fix (t) {
              return t[j.expando] ? t : new j.Event(t);
            },
          special: {
            load: { noBubble: !0 },
            click: {
              setup (t) {
                  var e = this || t;
                  return jt.test(e.type) && e.click && A(e, 'input') && Ht(e, 'click', !0), !1;
                },
              trigger (t) {
                  var e = this || t;
                  return jt.test(e.type) && e.click && A(e, 'input') && Ht(e, 'click'), !0;
                },
              _default (t) {
                  var e = t.target;
                  return (jt.test(e.type) && e.click && A(e, 'input') && st.get(e, 'click')) || A(e, 'a');
                },
            },
            beforeunload: {
              postDispatch (t) {
                  void 0 !== t.result && t.originalEvent && (t.originalEvent.returnValue = t.result);
                },
            },
          },
        }),
          (j.removeEvent = function (t, e, n) {
            t.removeEventListener && t.removeEventListener(e, n);
          }),
          (j.Event = function (t, e) {
            if (!(this instanceof j.Event)) return new j.Event(t, e);
            t && t.type
              ? ((this.originalEvent = t),
                (this.type = t.type),
                (this.isDefaultPrevented =
                  t.defaultPrevented || (void 0 === t.defaultPrevented && !1 === t.returnValue) ? Ft : Lt),
                (this.target = t.target && t.target.nodeType === 3 ? t.target.parentNode : t.target),
                (this.currentTarget = t.currentTarget),
                (this.relatedTarget = t.relatedTarget))
              : (this.type = t),
              e && j.extend(this, e),
              (this.timeStamp = (t && t.timeStamp) || Date.now()),
              (this[j.expando] = !0);
          }),
          (j.Event.prototype = {
            constructor: j.Event,
            isDefaultPrevented: Lt,
            isPropagationStopped: Lt,
            isImmediatePropagationStopped: Lt,
            isSimulated: !1,
            preventDefault () {
                var t = this.originalEvent;
                (this.isDefaultPrevented = Ft), t && !this.isSimulated && t.preventDefault();
              },
            stopPropagation: function () {
              var t = this.originalEvent;
              (this.isPropagationStopped = Ft), t && !this.isSimulated && t.stopPropagation();
            },
            stopImmediatePropagation () {
                var t = this.originalEvent;
                (this.isImmediatePropagationStopped = Ft),
                  t && !this.isSimulated && t.stopImmediatePropagation(),
                  this.stopPropagation();
              },
          }),
          j.each(
            {
              altKey: !0,
              bubbles: !0,
              cancelable: !0,
              changedTouches: !0,
              ctrlKey: !0,
              detail: !0,
              eventPhase: !0,
              metaKey: !0,
              pageX: !0,
              pageY: !0,
              shiftKey: !0,
              view: !0,
              char: !0,
              code: !0,
              charCode: !0,
              key: !0,
              keyCode: !0,
              button: !0,
              buttons: !0,
              clientX: !0,
              clientY: !0,
              offsetX: !0,
              offsetY: !0,
              pointerId: !0,
              pointerType: !0,
              screenX: !0,
              screenY: !0,
              targetTouches: !0,
              toElement: !0,
              touches: !0,
              which: !0,
            },
            j.event.addProp,
          ),
          j.each({ focus: 'focusin', blur: 'focusout' }, function (t, e) {
            function n(t) {
              if (b.documentMode) {
                let n = st.get(this, 'handle');
                    var o = j.event.fix(t);
                (o.type = t.type === 'focusin' ? 'focus' : 'blur'),
                  (o.isSimulated = !0),
                  n(t),
                  o.target === o.currentTarget && n(o);
              } else j.event.simulate(e, t.target, j.event.fix(t));
            }
            (j.event.special[t] = {
              setup: function () {
                var o;
                if ((Ht(this, t, !0), !b.documentMode)) return !1;
                (o = st.get(this, e)) || this.addEventListener(e, n), st.set(this, e, (o || 0) + 1);
              },
              trigger () {
                  return Ht(this, t), !0;
                },
              teardown () {
                  var t;
                  if (!b.documentMode) return !1;
                  (t = st.get(this, e) - 1) ? st.set(this, e, t) : (this.removeEventListener(e, n), st.remove(this, e));
                },
              _default (e) {
                  return st.get(e.target, t);
                },
              delegateType: e,
            }),
              (j.event.special[e] = {
                setup: function () {
                  let o = this.ownerDocument || this.document || this;
                      var r = b.documentMode ? this : o;
                      var i = st.get(r, e);
                  i || (b.documentMode ? this.addEventListener(e, n) : o.addEventListener(t, n, !0)),
                    st.set(r, e, (i || 0) + 1);
                },
                teardown () {
                    var o = this.ownerDocument || this.document || this,
                      r = b.documentMode ? this : o,
                      i = st.get(r, e) - 1;
                    i
                      ? st.set(r, e, i)
                      : (b.documentMode ? this.removeEventListener(e, n) : o.removeEventListener(t, n, !0),
                        st.remove(r, e));
                  },
              });
          }),
          j.each(
            {
              mouseenter: 'mouseover',
              mouseleave: 'mouseout',
              pointerenter: 'pointerover',
              pointerleave: 'pointerout',
            },
            function (t, e) {
              j.event.special[t] = {
                delegateType: e,
                bindType: e,
                handle (t) {
                    var n,
                      o = t.relatedTarget,
                      r = t.handleObj;
                    return (
                      (o && (o === this || j.contains(this, o))) ||
                        ((t.type = r.origType), (n = r.handler.apply(this, arguments)), (t.type = e)),
                      n
                    );
                  },
              };
            },
          ),
          j.fn.extend({
            on (t, e, n, o) {
                return Nt(this, t, e, n, o);
              },
            one (t, e, n, o) {
                return Nt(this, t, e, n, o, 1);
              },
            off (t, e, n) {
                var o, r;
                if (t && t.preventDefault && t.handleObj)
                  return (
                    (o = t.handleObj),
                    j(t.delegateTarget).off(
                      o.namespace ? o.origType + '.' + o.namespace : o.origType,
                      o.selector,
                      o.handler,
                    ),
                    this
                  );
                if ('object' == typeof t) {
                  for (r in t) this.off(r, e, t[r]);
                  return this;
                }
                return (
                  (!1 !== e && 'function' != typeof e) || ((n = e), (e = void 0)),
                  !1 === n && (n = Lt),
                  this.each(function () {
                    j.event.remove(this, t, n, e);
                  })
                );
              },
          });
        var qt = /<script|<style|<link/i;
            var Rt = /checked\s*(?:[^=]|=\s*.checked.)/i;
            var Ot = /^\s*<!\[CDATA\[|\]\]>\s*$/g;
        function Pt(t, e) {
          return (A(t, 'table') && A(e.nodeType !== 11 ? e : e.firstChild, 'tr') && j(t).children('tbody')[0]) || t;
        }
        function It(t) {
          return (t.type = `${null !== t.getAttribute('type')  }/${  t.type}`), t;
        }
        function Wt(t) {
          return (t.type || '').slice(0, 5) === 'true/' ? (t.type = t.type.slice(5)) : t.removeAttribute('type'), t;
        }
        function Ut(t, e) {
          var n; var o; var r; var i; var a; var s;
          if (e.nodeType === 1) {
            if (st.hasData(t) && (s = st.get(t).events))
              for (r in (st.remove(e, 'handle events'), s))
                for (n = 0, o = s[r].length; n < o; n++) j.event.add(e, r, s[r][n]);
            ut.hasData(t) && ((i = ut.access(t)), (a = j.extend({}, i)), ut.set(e, a));
          }
        }
        function zt(t, e) {
          let n = e.nodeName.toLowerCase();
          'input' === n && jt.test(t.type)
            ? (e.checked = t.checked)
            : (n !== 'input' && n !== 'textarea') || (e.defaultValue = t.defaultValue);
        }
        function Vt(t, e, n, o) {
          e = u(e);
          var r;
              var i;
              var a;
              var s;
              var l;
              var c;
              var d = 0;
              var p = t.length;
              var f = p - 1;
              var h = e[0];
              var m = v(h);
          if (m || (p > 1 && typeof h == 'string' && !g.checkClone && Rt.test(h)))
            return t.each(function (r) {
              var i = t.eq(r);
              m && (e[0] = h.call(this, r, i.html())), Vt(i, e, n, o);
            });
          if (
            p &&
            ((i = (r = Mt(e, t[0].ownerDocument, !1, t, o)).firstChild), r.childNodes.length === 1 && (r = i), i || o)
          ) {
            for (s = (a = j.map(_t(r, 'script'), It)).length; d < p; d++)
              (l = r), d !== f && ((l = j.clone(l, !0, !0)), s && j.merge(a, _t(l, 'script'))), n.call(t[d], l, d);
            if (s)
              for (c = a[a.length - 1].ownerDocument, j.map(a, Wt), d = 0; d < s; d++)
                (l = a[d]),
                  At.test(l.type || '') &&
                    !st.access(l, 'globalEval') &&
                    j.contains(c, l) &&
                    (l.src && (l.type || '').toLowerCase() !== 'module'
                      ? j._evalUrl && !l.noModule && j._evalUrl(l.src, { nonce: l.nonce || l.getAttribute('nonce') }, c)
                      : w(l.textContent.replace(Ot, ''), l, c));
          }
          return t;
        }
        function Xt(t, e, n) {
          for (var o, r = e ? j.filter(e, t) : t, i = 0; (o = r[i]) != null; i++)
            n || o.nodeType !== 1 || j.cleanData(_t(o)),
              o.parentNode && (n && gt(o) && Bt(_t(o, 'script')), o.parentNode.removeChild(o));
          return t;
        }
        j.extend({
          htmlPrefilter (t) {
              return t;
            },
          clone (t, e, n) {
              var o,
                r,
                i,
                a,
                s = t.cloneNode(!0),
                u = gt(t);
              if (!(g.noCloneChecked || (1 !== t.nodeType && 11 !== t.nodeType) || j.isXMLDoc(t)))
                for (a = _t(s), o = 0, r = (i = _t(t)).length; o < r; o++) zt(i[o], a[o]);
              if (e)
                if (n) for (i = i || _t(t), a = a || _t(s), o = 0, r = i.length; o < r; o++) Ut(i[o], a[o]);
                else Ut(t, s);
              return (a = _t(s, 'script')).length > 0 && Bt(a, !u && _t(t, 'script')), s;
            },
          cleanData (t) {
              for (var e, n, o, r = j.event.special, i = 0; void 0 !== (n = t[i]); i++)
                if (it(n)) {
                  if ((e = n[st.expando])) {
                    if (e.events) for (o in e.events) r[o] ? j.event.remove(n, o) : j.removeEvent(n, o, e.handle);
                    n[st.expando] = void 0;
                  }
                  n[ut.expando] && (n[ut.expando] = void 0);
                }
            },
        }),
          j.fn.extend({
            detach (t) {
                return Xt(this, t, !0);
              },
            remove (t) {
                return Xt(this, t);
              },
            text: function (t) {
              return tt(
                this,
                function (t) {
                  return void 0 === t
                    ? j.text(this)
                    : this.empty().each(function () {
                        (1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType) || (this.textContent = t);
                      });
                },
                null,
                t,
                arguments.length,
              );
            },
            append () {
                return Vt(this, arguments, function (t) {
                  (1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType) || Pt(this, t).appendChild(t);
                });
              },
            prepend () {
                return Vt(this, arguments, function (t) {
                  if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var e = Pt(this, t);
                    e.insertBefore(t, e.firstChild);
                  }
                });
              },
            before: function () {
              return Vt(this, arguments, function (t) {
                this.parentNode && this.parentNode.insertBefore(t, this);
              });
            },
            after: function () {
              return Vt(this, arguments, function (t) {
                this.parentNode && this.parentNode.insertBefore(t, this.nextSibling);
              });
            },
            empty () {
                for (var t, e = 0; null != (t = this[e]); e++)
                  1 === t.nodeType && (j.cleanData(_t(t, !1)), (t.textContent = ''));
                return this;
              },
            clone (t, e) {
                return (
                  (t = null != t && t),
                  (e = null == e ? t : e),
                  this.map(function () {
                    return j.clone(this, t, e);
                  })
                );
              },
            html (t) {
                return tt(
                  this,
                  function (t) {
                    var e = this[0] || {},
                      n = 0,
                      o = this.length;
                    if (void 0 === t && 1 === e.nodeType) return e.innerHTML;
                    if ('string' == typeof t && !qt.test(t) && !Et[(St.exec(t) || ['', ''])[1].toLowerCase()]) {
                      t = j.htmlPrefilter(t);
                      try {
                        for (; n < o; n++)
                          1 === (e = this[n] || {}).nodeType && (j.cleanData(_t(e, !1)), (e.innerHTML = t));
                        e = 0;
                      } catch (t) {}
                    }
                    e && this.empty().append(t);
                  },
                  null,
                  t,
                  arguments.length,
                );
              },
            replaceWith () {
                var t = [];
                return Vt(
                  this,
                  arguments,
                  function (e) {
                    var n = this.parentNode;
                    j.inArray(this, t) < 0 && (j.cleanData(_t(this)), n && n.replaceChild(e, this));
                  },
                  t,
                );
              },
          }),
          j.each(
            {
              appendTo: 'append',
              prependTo: 'prepend',
              insertBefore: 'before',
              insertAfter: 'after',
              replaceAll: 'replaceWith',
            },
            function (t, e) {
              j.fn[t] = function (t) {
                for (var n, o = [], r = j(t), i = r.length - 1, a = 0; a <= i; a++)
                  (n = a === i ? this : this.clone(!0)), j(r[a])[e](n), l.apply(o, n.get());
                return this.pushStack(o);
              };
            },
          );
        let Gt = new RegExp(`^(${  pt  })(?!px)[a-z%]+$`, 'i');
            var Kt = /^--/;
            var Yt = function (t) {
              var e = t.ownerDocument.defaultView;
              return (e && e.opener) || (e = o), e.getComputedStyle(t);
            };
            var Qt = function (t, e, n) {
              var o,
                r,
                i = {};
              for (r in e) (i[r] = t.style[r]), (t.style[r] = e[r]);
              for (r in ((o = n.call(t)), e)) t.style[r] = i[r];
              return o;
            };
            var Jt = new RegExp(ht.join('|'), 'i');
        function Zt(t, e, n) {
          var o;
              var r;
              var i;
              var a;
              var s = Kt.test(e);
              var u = t.style;
          return (
            (n = n || Yt(t)) &&
              ((a = n.getPropertyValue(e) || n[e]),
              s && a && (a = a.replace(M, '$1') || void 0),
              '' !== a || gt(t) || (a = j.style(t, e)),
              !g.pixelBoxStyles() &&
                Gt.test(a) &&
                Jt.test(e) &&
                ((o = u.width),
                (r = u.minWidth),
                (i = u.maxWidth),
                (u.minWidth = u.maxWidth = u.width = a),
                (a = n.width),
                (u.width = o),
                (u.minWidth = r),
                (u.maxWidth = i))),
            void 0 !== a ? `${a  }` : a
          );
        }
        function te(t, e) {
          return {
            get: function () {
              if (!t()) return (this.get = e).apply(this, arguments);
              delete this.get;
            },
          };
        }
        !(function () {
          function t() {
            if (c) {
              (l.style.cssText = 'position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0'),
                (c.style.cssText =
                  'position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%'),
                mt.appendChild(l).appendChild(c);
              let t = o.getComputedStyle(c);
              (n = t.top !== '1%'),
                (u = e(t.marginLeft) === 12),
                (c.style.right = '60%'),
                (a = e(t.right) === 36),
                (r = e(t.width) === 36),
                (c.style.position = 'absolute'),
                (i = e(c.offsetWidth / 3) === 12),
                mt.removeChild(l),
                (c = null);
            }
          }
          function e(t) {
            return Math.round(parseFloat(t));
          }
          var n;
              var r;
              var i;
              var a;
              var s;
              var u;
              var l = b.createElement('div');
              var c = b.createElement('div');
          c.style &&
            ((c.style.backgroundClip = 'content-box'),
            (c.cloneNode(!0).style.backgroundClip = ''),
            (g.clearCloneStyle = c.style.backgroundClip === 'content-box'),
            j.extend(g, {
              boxSizingReliable () {
                  return t(), r;
                },
              pixelBoxStyles: function () {
                return t(), a;
              },
              pixelPosition: function () {
                return t(), n;
              },
              reliableMarginLeft: function () {
                return t(), u;
              },
              scrollboxSize: function () {
                return t(), i;
              },
              reliableTrDimensions: function () {
                var t; var e; var n; var r;
                return (
                  null == s &&
                    ((t = b.createElement('table')),
                    (e = b.createElement('tr')),
                    (n = b.createElement('div')),
                    (t.style.cssText = 'position:absolute;left:-11111px;border-collapse:separate'),
                    (e.style.cssText = 'box-sizing:content-box;border:1px solid'),
                    (e.style.height = '1px'),
                    (n.style.height = '9px'),
                    (n.style.display = 'block'),
                    mt.appendChild(t).appendChild(e).appendChild(n),
                    (r = o.getComputedStyle(e)),
                    (s =
                      parseInt(r.height, 10) + parseInt(r.borderTopWidth, 10) + parseInt(r.borderBottomWidth, 10) ===
                      e.offsetHeight),
                    mt.removeChild(t)),
                  s
                );
              },
            }));
        })();
        var ee = ['Webkit', 'Moz', 'ms'];
            var ne = b.createElement('div').style;
            var oe = {};
        function re(t) {
          let e = j.cssProps[t] || oe[t];
          return (
            e ||
            (t in ne
              ? t
              : (oe[t] =
                  (function (t) {
                    for (let e = t[0].toUpperCase() + t.slice(1), n = ee.length; n--; )
                      if ((t = ee[n] + e) in ne) return t;
                  })(t) || t))
          );
        }
        let ie = /^(none|table(?!-c[ea]).+)/;
            var ae = { position: 'absolute', visibility: 'hidden', display: 'block' };
            var se = { letterSpacing: '0', fontWeight: '400' };
        function ue(t, e, n) {
          var o = ft.exec(e);
          return o ? Math.max(0, o[2] - (n || 0)) + (o[3] || 'px') : e;
        }
        function le(t, e, n, o, r, i) {
          var a = e === 'width' ? 1 : 0;
              var s = 0;
              var u = 0;
              var l = 0;
          if (n === (o ? 'border' : 'content')) return 0;
          for (; a < 4; a += 2)
            n === 'margin' && (l += j.css(t, n + ht[a], !0, r)),
              o
                ? (n === 'content' && (u -= j.css(t, `padding${  ht[a]}`, !0, r)),
                  n !== 'margin' && (u -= j.css(t, `border${  ht[a]  }Width`, !0, r)))
                : ((u += j.css(t, `padding${  ht[a]}`, !0, r)),
                  n !== 'padding'
                    ? (u += j.css(t, `border${  ht[a]  }Width`, !0, r))
                    : (s += j.css(t, `border${  ht[a]  }Width`, !0, r)));
          return (
            !o &&
              i >= 0 &&
              (u += Math.max(0, Math.ceil(t[`offset${  e[0].toUpperCase()  }${e.slice(1)}`] - i - u - s - 0.5)) || 0),
            u + l
          );
        }
        function ce(t, e, n) {
          var o = Yt(t);
              var r = (!g.boxSizingReliable() || n) && 'border-box' === j.css(t, 'boxSizing', !1, o);
              var i = r;
              var a = Zt(t, e, o);
              var s = `offset${  e[0].toUpperCase()  }${e.slice(1)}`;
          if (Gt.test(a)) {
            if (!n) return a;
            a = 'auto';
          }
          return (
            ((!g.boxSizingReliable() && r) ||
              (!g.reliableTrDimensions() && A(t, 'tr')) ||
              a === 'auto' ||
              (!parseFloat(a) && j.css(t, 'display', !1, o) === 'inline')) &&
              t.getClientRects().length &&
              ((r = j.css(t, 'boxSizing', !1, o) === 'border-box'), (i = s in t) && (a = t[s])),
            (a = parseFloat(a) || 0) + le(t, e, n || (r ? 'border' : 'content'), i, o, a) + 'px'
          );
        }
        function de(t, e, n, o, r) {
          return new de.prototype.init(t, e, n, o, r);
        }
        j.extend({
          cssHooks: {
            opacity: {
              get (t, e) {
                  if (e) {
                    var n = Zt(t, 'opacity');
                    return '' === n ? '1' : n;
                  }
                },
              },
            },
          },
          cssNumber: {
            animationIterationCount: !0,
            aspectRatio: !0,
            borderImageSlice: !0,
            columnCount: !0,
            flexGrow: !0,
            flexShrink: !0,
            fontWeight: !0,
            gridArea: !0,
            gridColumn: !0,
            gridColumnEnd: !0,
            gridColumnStart: !0,
            gridRow: !0,
            gridRowEnd: !0,
            gridRowStart: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            scale: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0,
            fillOpacity: !0,
            floodOpacity: !0,
            stopOpacity: !0,
            strokeMiterlimit: !0,
            strokeOpacity: !0,
          },
          cssProps: {},
          style: function (t, e, n, o) {
            if (t && t.nodeType !== 3 && t.nodeType !== 8 && t.style) {
              var r;
                  var i;
                  var a;
                  var s = rt(e);
                  var u = Kt.test(e);
                  var l = t.style;
              if ((u || (e = re(s)), (a = j.cssHooks[e] || j.cssHooks[s]), void 0 === n))
                return a && 'get' in a && void 0 !== (r = a.get(t, !1, o)) ? r : l[e];
              (i = typeof n) === 'string' && (r = ft.exec(n)) && r[1] && ((n = bt(t, e, r)), (i = 'number')),
                n != null &&
                  n == n &&
                  (i !== 'number' || u || (n += (r && r[3]) || (j.cssNumber[s] ? '' : 'px')),
                  g.clearCloneStyle || n !== '' || e.indexOf('background') !== 0 || (l[e] = 'inherit'),
                  (a && 'set' in a && void 0 === (n = a.set(t, n, o))) || (u ? l.setProperty(e, n) : (l[e] = n)));
            }
          },
          css (t, e, n, o) {
              var r,
                i,
                a,
                s = rt(e);
              return (
                Kt.test(e) || (e = re(s)),
                (a = j.cssHooks[e] || j.cssHooks[s]) && 'get' in a && (r = a.get(t, !0, n)),
                void 0 === r && (r = Zt(t, e, o)),
                'normal' === r && e in se && (r = se[e]),
                '' === n || n ? ((i = parseFloat(r)), !0 === n || isFinite(i) ? i || 0 : r) : r
              );
            },
        }),
          j.each(['height', 'width'], function (t, e) {
            j.cssHooks[e] = {
              get (t, n, o) {
                  if (n)
                    return !ie.test(j.css(t, 'display')) ||
                      (t.getClientRects().length && t.getBoundingClientRect().width)
                      ? ce(t, e, o)
                      : Qt(t, ae, function () {
                          return ce(t, e, o);
                        });
                },
              set (t, n, o) {
                  var r,
                    i = Yt(t),
                    a = !g.scrollboxSize() && 'absolute' === i.position,
                    s = (a || o) && 'border-box' === j.css(t, 'boxSizing', !1, i),
                    u = o ? le(t, e, o, s, i) : 0;
                  return (
                    s &&
                      a &&
                      (u -= Math.ceil(
                        t['offset' + e[0].toUpperCase() + e.slice(1)] -
                          parseFloat(i[e]) -
                          le(t, e, 'border', !1, i) -
                          0.5,
                      )),
                    u && (r = ft.exec(n)) && 'px' !== (r[3] || 'px') && ((t.style[e] = n), (n = j.css(t, e))),
                    ue(0, n, u)
                  );
                },
            };
          }),
          (j.cssHooks.marginLeft = te(g.reliableMarginLeft, function (t, e) {
            if (e)
              return (
                `${parseFloat(Zt(t, 'marginLeft')) ||
                    t.getBoundingClientRect().left -
                      Qt(t, { marginLeft: 0 }, function () {
                        return t.getBoundingClientRect().left;
                      })  }px`
              );
          })),
          j.each({ margin: '', padding: '', border: 'Width' }, function (t, e) {
            (j.cssHooks[t + e] = {
              expand: function (n) {
                for (var o = 0, r = {}, i = typeof n == 'string' ? n.split(' ') : [n]; o < 4; o++)
                  r[t + ht[o] + e] = i[o] || i[o - 2] || i[0];
                return r;
              },
            }),
              'margin' !== t && (j.cssHooks[t + e].set = ue);
          }),
          j.fn.extend({
            css: function (t, e) {
              return tt(
                this,
                function (t, e, n) {
                  var o;
                      var r;
                      var i = {};
                      var a = 0;
                  if (Array.isArray(e)) {
                    for (o = Yt(t), r = e.length; a < r; a++) i[e[a]] = j.css(t, e[a], !1, o);
                    return i;
                  }
                  return void 0 !== n ? j.style(t, e, n) : j.css(t, e);
                },
                t,
                e,
                arguments.length > 1,
              );
            },
          }),
          (j.Tween = de),
          (de.prototype = {
            constructor: de,
            init: function (t, e, n, o, r, i) {
              (this.elem = t),
                (this.prop = n),
                (this.easing = r || j.easing._default),
                (this.options = e),
                (this.start = this.now = this.cur()),
                (this.end = o),
                (this.unit = i || (j.cssNumber[n] ? '' : 'px'));
            },
            cur: function () {
              let t = de.propHooks[this.prop];
              return t && t.get ? t.get(this) : de.propHooks._default.get(this);
            },
            run (t) {
                var e,
                  n = de.propHooks[this.prop];
                return (
                  this.options.duration
                    ? (this.pos = e = j.easing[this.easing](t, this.options.duration * t, 0, 1, this.options.duration))
                    : (this.pos = e = t),
                  (this.now = (this.end - this.start) * e + this.start),
                  this.options.step && this.options.step.call(this.elem, this.now, this),
                  n && n.set ? n.set(this) : de.propHooks._default.set(this),
                  this
                );
              },
          }),
          (de.prototype.init.prototype = de.prototype),
          (de.propHooks = {
            _default: {
              get (t) {
                  var e;
                  return 1 !== t.elem.nodeType || (null != t.elem[t.prop] && null == t.elem.style[t.prop])
                    ? t.elem[t.prop]
                    : (e = j.css(t.elem, t.prop, '')) && 'auto' !== e
                    ? e
                    : 0;
                },
              set (t) {
                  j.fx.step[t.prop]
                    ? j.fx.step[t.prop](t)
                    : 1 !== t.elem.nodeType || (!j.cssHooks[t.prop] && null == t.elem.style[re(t.prop)])
                    ? (t.elem[t.prop] = t.now)
                    : j.style(t.elem, t.prop, t.now + t.unit);
                },
            },
          }),
          (de.propHooks.scrollTop = de.propHooks.scrollLeft =
            {
              set: function (t) {
                t.elem.nodeType && t.elem.parentNode && (t.elem[t.prop] = t.now);
              },
            }),
          (j.easing = {
            linear (t) {
                return t;
              },
            swing (t) {
                return 0.5 - Math.cos(t * Math.PI) / 2;
              },
            _default: 'swing',
          }),
          (j.fx = de.prototype.init),
          (j.fx.step = {});
        let pe;
            var fe;
            var he = /^(?:toggle|show|hide)$/;
            var me = /queueHooks$/;
        function ge() {
          fe &&
            (!1 === b.hidden && o.requestAnimationFrame ? o.requestAnimationFrame(ge) : o.setTimeout(ge, j.fx.interval),
            j.fx.tick());
        }
        function ve() {
          return (
            o.setTimeout(function () {
              pe = void 0;
            }),
            (pe = Date.now())
          );
        }
        function ye(t, e) {
          var n;
              var o = 0;
              var r = { height: t };
          for (e = e ? 1 : 0; o < 4; o += 2 - e) r[`margin${  n = ht[o]}`] = r[`padding${  n}`] = t;
          return e && (r.opacity = r.width = t), r;
        }
        function be(t, e, n) {
          for (var o, r = (xe.tweeners[e] || []).concat(xe.tweeners['*']), i = 0, a = r.length; i < a; i++)
            if ((o = r[i].call(n, e, t))) return o;
        }
        function xe(t, e, n) {
          var o;
              var r;
              var i = 0;
              var a = xe.prefilters.length;
              var s = j.Deferred().always(function () {
                delete u.elem;
              });
              var u = function () {
                if (r) return !1;
                for (
                  var e = pe || ve(),
                    n = Math.max(0, l.startTime + l.duration - e),
                    o = 1 - (n / l.duration || 0),
                    i = 0,
                    a = l.tweens.length;
                  i < a;
                  i++
                )
                  l.tweens[i].run(o);
                return (
                  s.notifyWith(t, [l, o, n]),
                  o < 1 && a ? n : (a || s.notifyWith(t, [l, 1, 0]), s.resolveWith(t, [l]), !1)
                );
              };
              var l = s.promise({
                elem: t,
                props: j.extend({}, e),
                opts: j.extend(!0, { specialEasing: {}, easing: j.easing._default }, n),
                originalProperties: e,
                originalOptions: n,
                startTime: pe || ve(),
                duration: n.duration,
                tweens: [],
                createTween: function (e, n) {
                  var o = j.Tween(t, l.opts, e, n, l.opts.specialEasing[e] || l.opts.easing);
                  return l.tweens.push(o), o;
                },
                stop: function (e) {
                  var n = 0,
                    o = e ? l.tweens.length : 0;
                  if (r) return this;
                  for (r = !0; n < o; n++) l.tweens[n].run(1);
                  return e ? (s.notifyWith(t, [l, 1, 0]), s.resolveWith(t, [l, e])) : s.rejectWith(t, [l, e]), this;
                },
              });
              var c = l.props;
          for (
            !(function (t, e) {
              var n; var o; var r; var i; var a;
              for (n in t)
                if (
                  ((r = e[(o = rt(n))]),
                  (i = t[n]),
                  Array.isArray(i) && ((r = i[1]), (i = t[n] = i[0])),
                  n !== o && ((t[o] = i), delete t[n]),
                  (a = j.cssHooks[o]) && ('expand' in a))
                )
                  for (n in ((i = a.expand(i)), delete t[o], i)) (n in t) || ((t[n] = i[n]), (e[n] = r));
                else e[o] = r;
            })(c, l.opts.specialEasing);
            i < a;
            i++
          )
            if ((o = xe.prefilters[i].call(l, t, c, l.opts)))
              return v(o.stop) && (j._queueHooks(l.elem, l.opts.queue).stop = o.stop.bind(o)), o;
          return (
            j.map(c, be, l),
            v(l.opts.start) && l.opts.start.call(t, l),
            l.progress(l.opts.progress).done(l.opts.done, l.opts.complete).fail(l.opts.fail).always(l.opts.always),
            j.fx.timer(j.extend(u, { elem: t, anim: l, queue: l.opts.queue })),
            l
          );
        }
        (j.Animation = j.extend(xe, {
          tweeners: {
            '*': [
              function (t, e) {
                let n = this.createTween(t, e);
                return bt(n.elem, t, ft.exec(e), n), n;
              },
            ],
          },
          tweener (t, e) {
              v(t) ? ((e = t), (t = ['*'])) : (t = t.match(X));
              for (var n, o = 0, r = t.length; o < r; o++)
                (n = t[o]), (xe.tweeners[n] = xe.tweeners[n] || []), xe.tweeners[n].unshift(e);
            },
          prefilters: [
            function (t, e, n) {
              var o;
                  var r;
                  var i;
                  var a;
                  var s;
                  var u;
                  var l;
                  var c;
                  var d = 'width' in e || 'height' in e;
                  var p = this;
                  var f = {};
                  var h = t.style;
                  var m = t.nodeType && yt(t);
                  var g = st.get(t, 'fxshow');
              for (o in (n.queue ||
                ((a = j._queueHooks(t, 'fx')).unqueued == null &&
                  ((a.unqueued = 0),
                  (s = a.empty.fire),
                  (a.empty.fire = function () {
                    a.unqueued || s();
                  })),
                a.unqueued++,
                p.always(function () {
                  p.always(function () {
                    a.unqueued--, j.queue(t, 'fx').length || a.empty.fire();
                  });
                })),
              e))
                if (((r = e[o]), he.test(r))) {
                  if ((delete e[o], (i = i || r === 'toggle'), r === (m ? 'hide' : 'show'))) {
                    if (r !== 'show' || !g || void 0 === g[o]) continue;
                    m = !0;
                  }
                  f[o] = (g && g[o]) || j.style(t, o);
                }
              if ((u = !j.isEmptyObject(e)) || !j.isEmptyObject(f))
                for (o in (d &&
                  t.nodeType === 1 &&
                  ((n.overflow = [h.overflow, h.overflowX, h.overflowY]),
                  (l = g && g.display) == null && (l = st.get(t, 'display')),
                  (c = j.css(t, 'display')) === 'none' &&
                    (l ? (c = l) : (kt([t], !0), (l = t.style.display || l), (c = j.css(t, 'display')), kt([t]))),
                  (c === 'inline' || (c === 'inline-block' && l != null)) &&
                    j.css(t, 'float') === 'none' &&
                    (u ||
                      (p.done(function () {
                        h.display = l;
                      }),
                      l == null && ((c = h.display), (l = c === 'none' ? '' : c))),
                    (h.display = 'inline-block'))),
                n.overflow &&
                  ((h.overflow = 'hidden'),
                  p.always(function () {
                    (h.overflow = n.overflow[0]), (h.overflowX = n.overflow[1]), (h.overflowY = n.overflow[2]);
                  })),
                (u = !1),
                f))
                  u ||
                    (g ? 'hidden' in g && (m = g.hidden) : (g = st.access(t, 'fxshow', { display: l })),
                    i && (g.hidden = !m),
                    m && kt([t], !0),
                    p.done(function () {
                      for (o in (m || kt([t]), st.remove(t, 'fxshow'), f)) j.style(t, o, f[o]);
                    })),
                    (u = be(m ? g[o] : 0, o, p)),
                    o in g || ((g[o] = u.start), m && ((u.end = u.start), (u.start = 0)));
            },
          ],
          prefilter (t, e) {
              e ? xe.prefilters.unshift(t) : xe.prefilters.push(t);
            },
        })),
          (j.speed = function (t, e, n) {
            var o =
              t && typeof t == 'object'
                ? j.extend({}, t)
                : { complete: n || (!n && e) || (v(t) && t), duration: t, easing: (n && e) || (e && !v(e) && e) };
            return (
              j.fx.off
                ? (o.duration = 0)
                : typeof o.duration != 'number' &&
                  (o.duration in j.fx.speeds
                    ? (o.duration = j.fx.speeds[o.duration])
                    : (o.duration = j.fx.speeds._default)),
              (o.queue != null && !0 !== o.queue) || (o.queue = 'fx'),
              (o.old = o.complete),
              (o.complete = function () {
                v(o.old) && o.old.call(this), o.queue && j.dequeue(this, o.queue);
              }),
              o
            );
          }),
          j.fn.extend({
            fadeTo (t, e, n, o) {
                return this.filter(yt).css('opacity', 0).show().end().animate({ opacity: e }, t, n, o);
              },
            animate (t, e, n, o) {
                var r = j.isEmptyObject(t),
                  i = j.speed(e, n, o),
                  a = function () {
                    var e = xe(this, j.extend({}, t), i);
                    (r || st.get(this, 'finish')) && e.stop(!0);
                  };
                return (a.finish = a), r || !1 === i.queue ? this.each(a) : this.queue(i.queue, a);
              },
            stop (t, e, n) {
                var o = function (t) {
                  var e = t.stop;
                  delete t.stop, e(n);
                };
                return (
                  'string' != typeof t && ((n = e), (e = t), (t = void 0)),
                  e && this.queue(t || 'fx', []),
                  this.each(function () {
                    var e = !0,
                      r = null != t && t + 'queueHooks',
                      i = j.timers,
                      a = st.get(this);
                    if (r) a[r] && a[r].stop && o(a[r]);
                    else for (r in a) a[r] && a[r].stop && me.test(r) && o(a[r]);
                    for (r = i.length; r--; )
                      i[r].elem !== this ||
                        (null != t && i[r].queue !== t) ||
                        (i[r].anim.stop(n), (e = !1), i.splice(r, 1));
                    (!e && n) || j.dequeue(this, t);
                  })
                );
              },
            finish (t) {
                return (
                  !1 !== t && (t = t || 'fx'),
                  this.each(function () {
                    var e,
                      n = st.get(this),
                      o = n[t + 'queue'],
                      r = n[t + 'queueHooks'],
                      i = j.timers,
                      a = o ? o.length : 0;
                    for (n.finish = !0, j.queue(this, t, []), r && r.stop && r.stop.call(this, !0), e = i.length; e--; )
                      i[e].elem === this && i[e].queue === t && (i[e].anim.stop(!0), i.splice(e, 1));
                    for (e = 0; e < a; e++) o[e] && o[e].finish && o[e].finish.call(this);
                    delete n.finish;
                  })
                );
              },
          }),
          j.each(['toggle', 'show', 'hide'], function (t, e) {
            var n = j.fn[e];
            j.fn[e] = function (t, o, r) {
              return t == null || typeof t == 'boolean' ? n.apply(this, arguments) : this.animate(ye(e, !0), t, o, r);
            };
          }),
          j.each(
            {
              slideDown: ye('show'),
              slideUp: ye('hide'),
              slideToggle: ye('toggle'),
              fadeIn: { opacity: 'show' },
              fadeOut: { opacity: 'hide' },
              fadeToggle: { opacity: 'toggle' },
            },
            function (t, e) {
              j.fn[t] = function (t, n, o) {
                return this.animate(e, t, n, o);
              };
            },
          ),
          (j.timers = []),
          (j.fx.tick = function () {
            let t;
                var e = 0;
                var n = j.timers;
            for (pe = Date.now(); e < n.length; e++) (t = n[e])() || n[e] !== t || n.splice(e--, 1);
            n.length || j.fx.stop(), (pe = void 0);
          }),
          (j.fx.timer = function (t) {
            j.timers.push(t), j.fx.start();
          }),
          (j.fx.interval = 13),
          (j.fx.start = function () {
            fe || ((fe = !0), ge());
          }),
          (j.fx.stop = function () {
            fe = null;
          }),
          (j.fx.speeds = { slow: 600, fast: 200, _default: 400 }),
          (j.fn.delay = function (t, e) {
            return (
              (t = (j.fx && j.fx.speeds[t]) || t),
              (e = e || 'fx'),
              this.queue(e, function (e, n) {
                var r = o.setTimeout(e, t);
                n.stop = function () {
                  o.clearTimeout(r);
                };
              })
            );
          }),
          (function () {
            let t = b.createElement('input');
                var e = b.createElement('select').appendChild(b.createElement('option'));
            (t.type = 'checkbox'),
              (g.checkOn = t.value !== ''),
              (g.optSelected = e.selected),
              ((t = b.createElement('input')).value = 't'),
              (t.type = 'radio'),
              (g.radioValue = t.value === 't');
          })();
        let we;
            var ke = j.expr.attrHandle;
        j.fn.extend({
          attr (t, e) {
              return tt(this, j.attr, t, e, arguments.length > 1);
            },
          removeAttr (t) {
              return this.each(function () {
                j.removeAttr(this, t);
              });
            },
        }),
          j.extend({
            attr: function (t, e, n) {
              var o;
                  var r;
                  var i = t.nodeType;
              if (i !== 3 && i !== 8 && i !== 2)
                return void 0 === t.getAttribute
                  ? j.prop(t, e, n)
                  : ((i === 1 && j.isXMLDoc(t)) ||
                      (r = j.attrHooks[e.toLowerCase()] || (j.expr.match.bool.test(e) ? we : void 0)),
                    void 0 !== n
                      ? n === null
                        ? void j.removeAttr(t, e)
                        : r && 'set' in r && void 0 !== (o = r.set(t, n, e))
                        ? o
                        : (t.setAttribute(e, `${n  }`), n)
                      : r && 'get' in r && (o = r.get(t, e)) !== null
                      ? o
                      : (o = j.find.attr(t, e)) == null
                      ? void 0
                      : o);
            },
            attrHooks: {
              type: {
                set: function (t, e) {
                  if (!g.radioValue && e === 'radio' && A(t, 'input')) {
                    var n = t.value;
                    return t.setAttribute('type', e), n && (t.value = n), e;
                  }
                },
              },
            },
            removeAttr (t, e) {
                var n,
                  o = 0,
                  r = e && e.match(X);
                if (r && 1 === t.nodeType) for (; (n = r[o++]); ) t.removeAttribute(n);
              },
          }),
          (we = {
            set (t, e, n) {
                return !1 === e ? j.removeAttr(t, n) : t.setAttribute(n, n), n;
              },
          }),
          j.each(j.expr.match.bool.source.match(/\w+/g), function (t, e) {
            var n = ke[e] || j.find.attr;
            ke[e] = function (t, e, o) {
              var r;
                  var i;
                  var a = e.toLowerCase();
              return o || ((i = ke[a]), (ke[a] = r), (r = n(t, e, o) != null ? a : null), (ke[a] = i)), r;
            };
          });
        var Te = /^(?:input|select|textarea|button)$/i;
            var Ce = /^(?:a|area)$/i;
        function je(t) {
          return (t.match(X) || []).join(' ');
        }
        function Se(t) {
          return (t.getAttribute && t.getAttribute('class')) || '';
        }
        function Ae(t) {
          return Array.isArray(t) ? t : (typeof t == 'string' && t.match(X)) || [];
        }
        j.fn.extend({
          prop: function (t, e) {
            return tt(this, j.prop, t, e, arguments.length > 1);
          },
          removeProp (t) {
              return this.each(function () {
                delete this[j.propFix[t] || t];
              });
            },
        }),
          j.extend({
            prop (t, e, n) {
                var o,
                  r,
                  i = t.nodeType;
                if (3 !== i && 8 !== i && 2 !== i)
                  return (
                    (1 === i && j.isXMLDoc(t)) || ((e = j.propFix[e] || e), (r = j.propHooks[e])),
                    void 0 !== n
                      ? r && 'set' in r && void 0 !== (o = r.set(t, n, e))
                        ? o
                        : (t[e] = n)
                      : r && 'get' in r && null !== (o = r.get(t, e))
                      ? o
                      : t[e]
                  );
              },
            propHooks: {
              tabIndex: {
                get: function (t) {
                  let e = j.find.attr(t, 'tabindex');
                  return e ? parseInt(e, 10) : Te.test(t.nodeName) || (Ce.test(t.nodeName) && t.href) ? 0 : -1;
                },
              },
            },
            propFix: { for: 'htmlFor', class: 'className' },
          }),
          g.optSelected ||
            (j.propHooks.selected = {
              get: function (t) {
                let e = t.parentNode;
                return e && e.parentNode && e.parentNode.selectedIndex, null;
              },
              set (t) {
                  var e = t.parentNode;
                  e && (e.selectedIndex, e.parentNode && e.parentNode.selectedIndex);
                },
            }),
          j.each(
            [
              'tabIndex',
              'readOnly',
              'maxLength',
              'cellSpacing',
              'cellPadding',
              'rowSpan',
              'colSpan',
              'useMap',
              'frameBorder',
              'contentEditable',
            ],
            function () {
              j.propFix[this.toLowerCase()] = this;
            },
          ),
          j.fn.extend({
            addClass (t) {
                var e, n, o, r, i, a;
                return v(t)
                  ? this.each(function (e) {
                      j(this).addClass(t.call(this, e, Se(this)));
                    })
                  : (e = Ae(t)).length
                  ? this.each(function () {
                      if (((o = Se(this)), (n = 1 === this.nodeType && ' ' + je(o) + ' '))) {
                        for (i = 0; i < e.length; i++) (r = e[i]), n.indexOf(' ' + r + ' ') < 0 && (n += r + ' ');
                        (a = je(n)), o !== a && this.setAttribute('class', a);
                      }
                    })
                  : this;
              },
            removeClass: function (t) {
              var e; var n; var o; var r; var i; var a;
              return v(t)
                ? this.each(function (e) {
                    j(this).removeClass(t.call(this, e, Se(this)));
                  })
                : arguments.length
                ? (e = Ae(t)).length
                  ? this.each(function () {
                      if (((o = Se(this)), (n = this.nodeType === 1 && ` ${  je(o)  } `))) {
                        for (i = 0; i < e.length; i++)
                          for (r = e[i]; n.indexOf(` ${  r  } `) > -1; ) n = n.replace(` ${  r  } `, ' ');
                        (a = je(n)), o !== a && this.setAttribute('class', a);
                      }
                    })
                  : this
                : this.attr('class', '');
            },
            toggleClass (t, e) {
                var n,
                  o,
                  r,
                  i,
                  a = typeof t,
                  s = 'string' === a || Array.isArray(t);
                return v(t)
                  ? this.each(function (n) {
                      j(this).toggleClass(t.call(this, n, Se(this), e), e);
                    })
                  : 'boolean' == typeof e && s
                  ? e
                    ? this.addClass(t)
                    : this.removeClass(t)
                  : ((n = Ae(t)),
                    this.each(function () {
                      if (s)
                        for (i = j(this), r = 0; r < n.length; r++)
                          (o = n[r]), i.hasClass(o) ? i.removeClass(o) : i.addClass(o);
                      else
                        (void 0 !== t && 'boolean' !== a) ||
                          ((o = Se(this)) && st.set(this, '__className__', o),
                          this.setAttribute &&
                            this.setAttribute('class', o || !1 === t ? '' : st.get(this, '__className__') || ''));
                    }));
              },
            hasClass (t) {
                var e,
                  n,
                  o = 0;
                for (e = ' ' + t + ' '; (n = this[o++]); )
                  if (1 === n.nodeType && (' ' + je(Se(n)) + ' ').indexOf(e) > -1) return !0;
                return !1;
              },
          });
        let Ee = /\r/g;
        j.fn.extend({
          val (t) {
              var e,
                n,
                o,
                r = this[0];
              return arguments.length
                ? ((o = v(t)),
                  this.each(function (n) {
                    var r;
                    1 === this.nodeType &&
                      (null == (r = o ? t.call(this, n, j(this).val()) : t)
                        ? (r = '')
                        : 'number' == typeof r
                        ? (r += '')
                        : Array.isArray(r) &&
                          (r = j.map(r, function (t) {
                            return null == t ? '' : t + '';
                          })),
                      ((e = j.valHooks[this.type] || j.valHooks[this.nodeName.toLowerCase()]) &&
                        'set' in e &&
                        void 0 !== e.set(this, r, 'value')) ||
                        (this.value = r));
                  }))
                : r
                ? (e = j.valHooks[r.type] || j.valHooks[r.nodeName.toLowerCase()]) &&
                  'get' in e &&
                  void 0 !== (n = e.get(r, 'value'))
                  ? n
                  : 'string' == typeof (n = r.value)
                  ? n.replace(Ee, '')
                  : null == n
                  ? ''
                  : n
                : void 0;
            },
        }),
          j.extend({
            valHooks: {
              option: {
                get: function (t) {
                  let e = j.find.attr(t, 'value');
                  return e != null ? e : je(j.text(t));
                },
              },
              select: {
                get: function (t) {
                  var e;
                      var n;
                      var o;
                      var r = t.options;
                      var i = t.selectedIndex;
                      var a = 'select-one' === t.type;
                      var s = a ? null : [];
                      var u = a ? i + 1 : r.length;
                  for (o = i < 0 ? u : a ? i : 0; o < u; o++)
                    if (
                      ((n = r[o]).selected || o === i) &&
                      !n.disabled &&
                      (!n.parentNode.disabled || !A(n.parentNode, 'optgroup'))
                    ) {
                      if (((e = j(n).val()), a)) return e;
                      s.push(e);
                    }
                  return s;
                },
                set: function (t, e) {
                  for (var n, o, r = t.options, i = j.makeArray(e), a = r.length; a--; )
                    ((o = r[a]).selected = j.inArray(j.valHooks.option.get(o), i) > -1) && (n = !0);
                  return n || (t.selectedIndex = -1), i;
                },
              },
            },
          }),
          j.each(['radio', 'checkbox'], function () {
            (j.valHooks[this] = {
              set: function (t, e) {
                if (Array.isArray(e)) return (t.checked = j.inArray(j(t).val(), e) > -1);
              },
            }),
              g.checkOn ||
                (j.valHooks[this].get = function (t) {
                  return t.getAttribute('value') === null ? 'on' : t.value;
                });
          });
        let _e = o.location;
            var Be = { guid: Date.now() };
            var De = /\?/;
        j.parseXML = function (t) {
          var e; var n;
          if (!t || typeof t != 'string') return null;
          try {
            e = new o.DOMParser().parseFromString(t, 'text/xml');
          } catch (t) {}
          return (
            (n = e && e.getElementsByTagName('parsererror')[0]),
            (e && !n) ||
              j.error(
                `Invalid XML: ${ 
                    n
                      ? j
                          .map(n.childNodes, function (t) {
                            return t.textContent;
                          })
                          .join('\n')
                      : t}`,
              ),
            e
          );
        };
        let Me = /^(?:focusinfocus|focusoutblur)$/;
            var $e = function (t) {
            t.stopPropagation();
          };
        j.extend(j.event, {
          trigger: function (t, e, n, r) {
            var i;
                var a;
                var s;
                var u;
                var l;
                var c;
                var d;
                var p;
                var h = [n || b];
                var m = f.call(t, 'type') ? t.type : t;
                var g = f.call(t, 'namespace') ? t.namespace.split('.') : [];
            if (
              ((a = p = s = n = n || b),
              3 !== n.nodeType &&
                n.nodeType !== 8 &&
                !Me.test(m + j.event.triggered) &&
                (m.indexOf('.') > -1 && ((g = m.split('.')), (m = g.shift()), g.sort()),
                (l = m.indexOf(':') < 0 && `on${  m}`),
                ((t = t[j.expando] ? t : new j.Event(m, typeof t == 'object' && t)).isTrigger = r ? 2 : 3),
                (t.namespace = g.join('.')),
                (t.rnamespace = t.namespace ? new RegExp(`(^|\\.)${  g.join('\\.(?:.*\\.|)')  }(\\.|$)`) : null),
                (t.result = void 0),
                t.target || (t.target = n),
                (e = e == null ? [t] : j.makeArray(e, [t])),
                (d = j.event.special[m] || {}),
                r || !d.trigger || !1 !== d.trigger.apply(n, e)))
            ) {
              if (!r && !d.noBubble && !y(n)) {
                for (u = d.delegateType || m, Me.test(u + m) || (a = a.parentNode); a; a = a.parentNode)
                  h.push(a), (s = a);
                s === (n.ownerDocument || b) && h.push(s.defaultView || s.parentWindow || o);
              }
              for (i = 0; (a = h[i++]) && !t.isPropagationStopped(); )
                (p = a),
                  (t.type = i > 1 ? u : d.bindType || m),
                  (c = (st.get(a, 'events') || Object.create(null))[t.type] && st.get(a, 'handle')) && c.apply(a, e),
                  (c = l && a[l]) &&
                    c.apply &&
                    it(a) &&
                    ((t.result = c.apply(a, e)), !1 === t.result && t.preventDefault());
              return (
                (t.type = m),
                r ||
                  t.isDefaultPrevented() ||
                  (d._default && !1 !== d._default.apply(h.pop(), e)) ||
                  !it(n) ||
                  (l &&
                    v(n[m]) &&
                    !y(n) &&
                    ((s = n[l]) && (n[l] = null),
                    (j.event.triggered = m),
                    t.isPropagationStopped() && p.addEventListener(m, $e),
                    n[m](),
                    t.isPropagationStopped() && p.removeEventListener(m, $e),
                    (j.event.triggered = void 0),
                    s && (n[l] = s))),
                t.result
              );
            }
          },
          simulate (t, e, n) {
              var o = j.extend(new j.Event(), n, { type: t, isSimulated: !0 });
              j.event.trigger(o, null, e);
            },
        }),
          j.fn.extend({
            trigger (t, e) {
                return this.each(function () {
                  j.event.trigger(t, e, this);
                });
              },
            triggerHandler: function (t, e) {
              var n = this[0];
              if (n) return j.event.trigger(t, e, n, !0);
            },
          });
        var Fe = /\[\]$/;
            var Le = /\r?\n/g;
            var Ne = /^(?:submit|button|image|reset|file)$/i;
            var He = /^(?:input|select|textarea|keygen)/i;
        function qe(t, e, n, o) {
          var r;
          if (Array.isArray(e))
            j.each(e, function (e, r) {
              n || Fe.test(t) ? o(t, r) : qe(`${t  }[${  'object' == typeof r && null != r ? e : ''  }]`, r, n, o);
            });
          else if (n || k(e) !== 'object') o(t, e);
          else for (r in e) qe(`${t  }[${  r  }]`, e[r], n, o);
        }
        (j.param = function (t, e) {
          let n;
              var o = [];
              var r = function (t, e) {
              var n = v(e) ? e() : e;
              o[o.length] = `${encodeURIComponent(t)  }=${  encodeURIComponent(null == n ? '' : n)}`;
            };
          if (t == null) return '';
          if (Array.isArray(t) || (t.jquery && !j.isPlainObject(t)))
            j.each(t, function () {
              r(this.name, this.value);
            });
          else for (n in t) qe(n, t[n], e, r);
          return o.join('&');
        }),
          j.fn.extend({
            serialize: function () {
              return j.param(this.serializeArray());
            },
            serializeArray: function () {
              return this.map(function () {
                let t = j.prop(this, 'elements');
                return t ? j.makeArray(t) : this;
              })
                .filter(function () {
                  var t = this.type;
                  return (
                    this.name &&
                    !j(this).is(':disabled') &&
                    He.test(this.nodeName) &&
                    !Ne.test(t) &&
                    (this.checked || !jt.test(t))
                  );
                })
                .map(function (t, e) {
                  var n = j(this).val();
                  return n == null
                    ? null
                    : Array.isArray(n)
                    ? j.map(n, function (t) {
                        return { name: e.name, value: t.replace(Le, '\r\n') };
                      })
                    : { name: e.name, value: n.replace(Le, '\r\n') };
                })
                .get();
            },
          });
        let Re = /%20/g;
            var Oe = /#.*$/;
            var Pe = /([?&])_=[^&]*/;
            var Ie = /^(.*?):[ \t]*([^\r\n]*)$/gm;
            var We = /^(?:GET|HEAD)$/;
            var Ue = /^\/\//;
            var ze = {};
            var Ve = {};
            var Xe = '*/'.concat('*');
            var Ge = b.createElement('a');
        function Ke(t) {
          return function (e, n) {
            'string' !== typeof e && ((n = e), (e = '*'));
            var o;
                var r = 0;
                var i = e.toLowerCase().match(X) || [];
            if (v(n))
              for (; (o = i[r++]); )
                '+' === o[0] ? ((o = o.slice(1) || '*'), (t[o] = t[o] || []).unshift(n)) : (t[o] = t[o] || []).push(n);
          };
        }
        function Ye(t, e, n, o) {
          var r = {};
              var i = t === Ve;
          function a(s) {
            var u;
            return (
              (r[s] = !0),
              j.each(t[s] || [], function (t, s) {
                let l = s(e, n, o);
                return 'string' != typeof l || i || r[l] ? (i ? !(u = l) : void 0) : (e.dataTypes.unshift(l), a(l), !1);
              }),
              u
            );
          }
          return a(e.dataTypes[0]) || (!r['*'] && a('*'));
        }
        function Qe(t, e) {
          var n;
              var o;
              var r = j.ajaxSettings.flatOptions || {};
          for (n in e) void 0 !== e[n] && ((r[n] ? t : o || (o = {}))[n] = e[n]);
          return o && j.extend(!0, t, o), t;
        }
        (Ge.href = _e.href),
          j.extend({
            active: 0,
            lastModified: {},
            etag: {},
            ajaxSettings: {
              url: _e.href,
              type: 'GET',
              isLocal: /^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(_e.protocol),
              global: !0,
              processData: !0,
              async: !0,
              contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
              accepts: {
                '*': Xe,
                text: 'text/plain',
                html: 'text/html',
                xml: 'application/xml, text/xml',
                json: 'application/json, text/javascript',
              },
              contents: { xml: /\bxml\b/, html: /\bhtml/, json: /\bjson\b/ },
              responseFields: { xml: 'responseXML', text: 'responseText', json: 'responseJSON' },
              converters: { '* text': String, 'text html': !0, 'text json': JSON.parse, 'text xml': j.parseXML },
              flatOptions: { url: !0, context: !0 },
            },
            ajaxSetup: function (t, e) {
              return e ? Qe(Qe(t, j.ajaxSettings), e) : Qe(j.ajaxSettings, t);
            },
            ajaxPrefilter: Ke(ze),
            ajaxTransport: Ke(Ve),
            ajax: function (t, e) {
              'object' === typeof t && ((e = t), (t = void 0)), (e = e || {});
              var n;
                  var r;
                  var i;
                  var a;
                  var s;
                  var u;
                  var l;
                  var c;
                  var d;
                  var p;
                  var f = j.ajaxSetup({}, e);
                  var h = f.context || f;
                  var m = f.context && (h.nodeType || h.jquery) ? j(h) : j.event;
                  var g = j.Deferred();
                  var v = j.Callbacks('once memory');
                  var y = f.statusCode || {};
                  var x = {};
                  var w = {};
                  var k = 'canceled';
                  var T = {
                  readyState: 0,
                  getResponseHeader (t) {
                      var e;
                      if (l) {
                        if (!a)
                          for (a = {}; (e = Ie.exec(i)); )
                            a[e[1].toLowerCase() + ' '] = (a[e[1].toLowerCase() + ' '] || []).concat(e[2]);
                        e = a[t.toLowerCase() + ' '];
                      }
                      return null == e ? null : e.join(', ');
                    },
                  getAllResponseHeaders: function () {
                    return l ? i : null;
                  },
                  setRequestHeader: function (t, e) {
                    return l == null && ((t = w[t.toLowerCase()] = w[t.toLowerCase()] || t), (x[t] = e)), this;
                  },
                  overrideMimeType: function (t) {
                    return l == null && (f.mimeType = t), this;
                  },
                  statusCode (t) {
                      var e;
                      if (t)
                        if (l) T.always(t[T.status]);
                        else for (e in t) y[e] = [y[e], t[e]];
                      return this;
                    },
                  abort (t) {
                      var e = t || k;
                      return n && n.abort(e), C(0, e), this;
                    },
                };
              if (
                (g.promise(T),
                (f.url = (`${t || f.url || _e.href  }`).replace(Ue, `${_e.protocol  }//`)),
                (f.type = e.method || e.type || f.method || f.type),
                (f.dataTypes = (f.dataType || '*').toLowerCase().match(X) || ['']),
                null == f.crossDomain)
              ) {
                u = b.createElement('a');
                try {
                  (u.href = f.url),
                    (u.href = u.href),
                    (f.crossDomain = `${Ge.protocol  }//${  Ge.host}` != `${u.protocol  }//${  u.host}`);
                } catch (t) {
                  f.crossDomain = !0;
                }
              }
              if (
                (f.data && f.processData && typeof f.data != 'string' && (f.data = j.param(f.data, f.traditional)),
                Ye(ze, f, e, T),
                l)
              )
                return T;
              for (d in ((c = j.event && f.global) && j.active++ == 0 && j.event.trigger('ajaxStart'),
              (f.type = f.type.toUpperCase()),
              (f.hasContent = !We.test(f.type)),
              (r = f.url.replace(Oe, '')),
              f.hasContent
                ? f.data &&
                  f.processData &&
                  (f.contentType || '').indexOf('application/x-www-form-urlencoded') === 0 &&
                  (f.data = f.data.replace(Re, '+'))
                : ((p = f.url.slice(r.length)),
                  f.data &&
                    (f.processData || typeof f.data == 'string') &&
                    ((r += (De.test(r) ? '&' : '?') + f.data), delete f.data),
                  !1 === f.cache && ((r = r.replace(Pe, '$1')), (p = `${De.test(r) ? '&' : '?'  }_=${  Be.guid++  }${p}`)),
                  (f.url = r + p)),
              f.ifModified &&
                (j.lastModified[r] && T.setRequestHeader('If-Modified-Since', j.lastModified[r]),
                j.etag[r] && T.setRequestHeader('If-None-Match', j.etag[r])),
              ((f.data && f.hasContent && !1 !== f.contentType) || e.contentType) &&
                T.setRequestHeader('Content-Type', f.contentType),
              T.setRequestHeader(
                'Accept',
                f.dataTypes[0] && f.accepts[f.dataTypes[0]]
                  ? f.accepts[f.dataTypes[0]] + (f.dataTypes[0] !== '*' ? `, ${  Xe  }; q=0.01` : '')
                  : f.accepts['*'],
              ),
              f.headers))
                T.setRequestHeader(d, f.headers[d]);
              if (f.beforeSend && (!1 === f.beforeSend.call(h, T, f) || l)) return T.abort();
              if (((k = 'abort'), v.add(f.complete), T.done(f.success), T.fail(f.error), (n = Ye(Ve, f, e, T)))) {
                if (((T.readyState = 1), c && m.trigger('ajaxSend', [T, f]), l)) return T;
                f.async &&
                  f.timeout > 0 &&
                  (s = o.setTimeout(function () {
                    T.abort('timeout');
                  }, f.timeout));
                try {
                  (l = !1), n.send(x, C);
                } catch (t) {
                  if (l) throw t;
                  C(-1, t);
                }
              } else C(-1, 'No Transport');
              function C(t, e, a, u) {
                var d;
                    var p;
                    var b;
                    var x;
                    var w;
                    var k = e;
                l ||
                  ((l = !0),
                  s && o.clearTimeout(s),
                  (n = void 0),
                  (i = u || ''),
                  (T.readyState = t > 0 ? 4 : 0),
                  (d = (t >= 200 && t < 300) || t === 304),
                  a &&
                    (x = (function (t, e, n) {
                      for (var o, r, i, a, s = t.contents, u = t.dataTypes; u[0] === '*'; )
                        u.shift(), void 0 === o && (o = t.mimeType || e.getResponseHeader('Content-Type'));
                      if (o)
                        for (r in s)
                          if (s[r] && s[r].test(o)) {
                            u.unshift(r);
                            break;
                          }
                      if (u[0] in n) i = u[0];
                      else {
                        for (r in n) {
                          if (!u[0] || t.converters[`${r  } ${  u[0]}`]) {
                            i = r;
                            break;
                          }
                          a || (a = r);
                        }
                        i = i || a;
                      }
                      if (i) return i !== u[0] && u.unshift(i), n[i];
                    })(f, T, a)),
                  !d &&
                    j.inArray('script', f.dataTypes) > -1 &&
                    j.inArray('json', f.dataTypes) < 0 &&
                    (f.converters['text script'] = function () {}),
                  (x = (function (t, e, n, o) {
                    var r;
                        var i;
                        var a;
                        var s;
                        var u;
                        var l = {};
                        var c = t.dataTypes.slice();
                    if (c[1]) for (a in t.converters) l[a.toLowerCase()] = t.converters[a];
                    for (i = c.shift(); i; )
                      if (
                        (t.responseFields[i] && (n[t.responseFields[i]] = e),
                        !u && o && t.dataFilter && (e = t.dataFilter(e, t.dataType)),
                        (u = i),
                        (i = c.shift()))
                      )
                        if (i === '*') i = u;
                        else if (u !== '*' && u !== i) {
                          if (!(a = l[`${u  } ${  i}`] || l[`* ${  i}`]))
                            for (r in l)
                              if ((s = r.split(' '))[1] === i && (a = l[`${u  } ${  s[0]}`] || l[`* ${  s[0]}`])) {
                                !0 === a ? (a = l[r]) : !0 !== l[r] && ((i = s[0]), c.unshift(s[1]));
                                break;
                              }
                          if (!0 !== a)
                            if (a && t.throws) e = a(e);
                            else
                              try {
                                e = a(e);
                              } catch (t) {
                                return {
                                  state: 'parsererror',
                                  error: a ? t : `No conversion from ${  u  } to ${  i}`,
                                };
                              }
                        }
                    return { state: 'success', data: e };
                  })(f, x, T, d)),
                  d
                    ? (f.ifModified &&
                        ((w = T.getResponseHeader('Last-Modified')) && (j.lastModified[r] = w),
                        (w = T.getResponseHeader('etag')) && (j.etag[r] = w)),
                      t === 204 || f.type === 'HEAD'
                        ? (k = 'nocontent')
                        : t === 304
                        ? (k = 'notmodified')
                        : ((k = x.state), (p = x.data), (d = !(b = x.error))))
                    : ((b = k), (!t && k) || ((k = 'error'), t < 0 && (t = 0))),
                  (T.status = t),
                  (T.statusText = `${e || k  }`),
                  d ? g.resolveWith(h, [p, k, T]) : g.rejectWith(h, [T, k, b]),
                  T.statusCode(y),
                  (y = void 0),
                  c && m.trigger(d ? 'ajaxSuccess' : 'ajaxError', [T, f, d ? p : b]),
                  v.fireWith(h, [T, k]),
                  c && (m.trigger('ajaxComplete', [T, f]), --j.active || j.event.trigger('ajaxStop')));
              }
              return T;
            },
            getJSON (t, e, n) {
                return j.get(t, e, n, 'json');
              },
            getScript: function (t, e) {
              return j.get(t, void 0, e, 'script');
            },
          }),
          j.each(['get', 'post'], function (t, e) {
            j[e] = function (t, n, o, r) {
              return (
                v(n) && ((r = r || o), (o = n), (n = void 0)),
                j.ajax(j.extend({ url: t, type: e, dataType: r, data: n, success: o }, j.isPlainObject(t) && t))
              );
            };
          }),
          j.ajaxPrefilter(function (t) {
            var e;
            for (e in t.headers) e.toLowerCase() === 'content-type' && (t.contentType = t.headers[e] || '');
          }),
          (j._evalUrl = function (t, e, n) {
            return j.ajax({
              url: t,
              type: 'GET',
              dataType: 'script',
              cache: !0,
              async: !1,
              global: !1,
              converters: { 'text script': function () {} },
              dataFilter: function (t) {
                j.globalEval(t, e, n);
              },
            });
          }),
          j.fn.extend({
            wrapAll (t) {
                var e;
                return (
                  this[0] &&
                    (v(t) && (t = t.call(this[0])),
                    (e = j(t, this[0].ownerDocument).eq(0).clone(!0)),
                    this[0].parentNode && e.insertBefore(this[0]),
                    e
                      .map(function () {
                        for (var t = this; t.firstElementChild; ) t = t.firstElementChild;
                        return t;
                      })
                      .append(this)),
                  this
                );
              },
            wrapInner: function (t) {
              return v(t)
                ? this.each(function (e) {
                    j(this).wrapInner(t.call(this, e));
                  })
                : this.each(function () {
                    var e = j(this);
                        var n = e.contents();
                    n.length ? n.wrapAll(t) : e.append(t);
                  });
            },
            wrap (t) {
                var e = v(t);
                return this.each(function (n) {
                  j(this).wrapAll(e ? t.call(this, n) : t);
                });
              },
            unwrap: function (t) {
              return (
                this.parent(t)
                  .not('body')
                  .each(function () {
                    j(this).replaceWith(this.childNodes);
                  }),
                this
              );
            },
          }),
          (j.expr.pseudos.hidden = function (t) {
            return !j.expr.pseudos.visible(t);
          }),
          (j.expr.pseudos.visible = function (t) {
            return !!(t.offsetWidth || t.offsetHeight || t.getClientRects().length);
          }),
          (j.ajaxSettings.xhr = function () {
            try {
              return new o.XMLHttpRequest();
            } catch (t) {}
          });
        let Je = { 0: 200, 1223: 204 };
            var Ze = j.ajaxSettings.xhr();
        (g.cors = !!Ze && 'withCredentials' in Ze),
          (g.ajax = Ze = !!Ze),
          j.ajaxTransport(function (t) {
            let e; var n;
            if (g.cors || (Ze && !t.crossDomain))
              return {
                send (r, i) {
                    var a,
                      s = t.xhr();
                    if ((s.open(t.type, t.url, t.async, t.username, t.password), t.xhrFields))
                      for (a in t.xhrFields) s[a] = t.xhrFields[a];
                    for (a in (t.mimeType && s.overrideMimeType && s.overrideMimeType(t.mimeType),
                    t.crossDomain || r['X-Requested-With'] || (r['X-Requested-With'] = 'XMLHttpRequest'),
                    r))
                      s.setRequestHeader(a, r[a]);
                    (e = function (t) {
                      return function () {
                        e &&
                          ((e = n = s.onload = s.onerror = s.onabort = s.ontimeout = s.onreadystatechange = null),
                          'abort' === t
                            ? s.abort()
                            : 'error' === t
                            ? 'number' != typeof s.status
                              ? i(0, 'error')
                              : i(s.status, s.statusText)
                            : i(
                                Je[s.status] || s.status,
                                s.statusText,
                                'text' !== (s.responseType || 'text') || 'string' != typeof s.responseText
                                  ? { binary: s.response }
                                  : { text: s.responseText },
                                s.getAllResponseHeaders(),
                              ));
                      };
                    }),
                      (s.onload = e()),
                      (n = s.onerror = s.ontimeout = e('error')),
                      void 0 !== s.onabort
                        ? (s.onabort = n)
                        : (s.onreadystatechange = function () {
                            4 === s.readyState &&
                              o.setTimeout(function () {
                                e && n();
                              });
                          }),
                      (e = e('abort'));
                    try {
                      s.send((t.hasContent && t.data) || null);
                    } catch (t) {
                      if (e) throw t;
                    }
                  },
                abort () {
                    e && e();
                  },
              };
          }),
          j.ajaxPrefilter(function (t) {
            t.crossDomain && (t.contents.script = !1);
          }),
          j.ajaxSetup({
            accepts: {
              script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript',
            },
            contents: { script: /\b(?:java|ecma)script\b/ },
            converters: {
              'text script': function (t) {
                return j.globalEval(t), t;
              },
            },
          }),
          j.ajaxPrefilter('script', function (t) {
            void 0 === t.cache && (t.cache = !1), t.crossDomain && (t.type = 'GET');
          }),
          j.ajaxTransport('script', function (t) {
            var e; var n;
            if (t.crossDomain || t.scriptAttrs)
              return {
                send (o, r) {
                    (e = j('<script>')
                      .attr(t.scriptAttrs || {})
                      .prop({ charset: t.scriptCharset, src: t.url })
                      .on(
                        'load error',
                        (n = function (t) {
                          e.remove(), (n = null), t && r('error' === t.type ? 404 : 200, t.type);
                        }),
                      )),
                      b.head.appendChild(e[0]);
                  },
                abort: function () {
                  n && n();
                },
              };
          });
        let tn;
            var en = [];
            var nn = /(=)\?(?=&|$)|\?\?/;
        j.ajaxSetup({
          jsonp: 'callback',
          jsonpCallback: function () {
            let t = en.pop() || `${j.expando  }_${  Be.guid++}`;
            return (this[t] = !0), t;
          },
        }),
          j.ajaxPrefilter('json jsonp', function (t, e, n) {
            var r;
                var i;
                var a;
                var s =
                !1 !== t.jsonp &&
                (nn.test(t.url)
                  ? 'url'
                  : typeof t.data == 'string' &&
                    0 === (t.contentType || '').indexOf('application/x-www-form-urlencoded') &&
                    nn.test(t.data) &&
                    'data');
            if (s || t.dataTypes[0] === 'jsonp')
              return (
                (r = t.jsonpCallback = v(t.jsonpCallback) ? t.jsonpCallback() : t.jsonpCallback),
                s
                  ? (t[s] = t[s].replace(nn, `$1${  r}`))
                  : !1 !== t.jsonp && (t.url += `${(De.test(t.url) ? '&' : '?') + t.jsonp  }=${  r}`),
                (t.converters['script json'] = function () {
                  return a || j.error(`${r  } was not called`), a[0];
                }),
                (t.dataTypes[0] = 'json'),
                (i = o[r]),
                (o[r] = function () {
                  a = arguments;
                }),
                n.always(function () {
                  void 0 === i ? j(o).removeProp(r) : (o[r] = i),
                    t[r] && ((t.jsonpCallback = e.jsonpCallback), en.push(r)),
                    a && v(i) && i(a[0]),
                    (a = i = void 0);
                }),
                'script'
              );
          }),
          (g.createHTMLDocument =
            (((tn = b.implementation.createHTMLDocument('').body).innerHTML = '<form></form><form></form>'),
            2 === tn.childNodes.length)),
          (j.parseHTML = function (t, e, n) {
            return typeof t != 'string'
              ? []
              : (typeof e == 'boolean' && ((n = e), (e = !1)),
                e ||
                  (g.createHTMLDocument
                    ? (((o = (e = b.implementation.createHTMLDocument('')).createElement('base')).href =
                        b.location.href),
                      e.head.appendChild(o))
                    : (e = b)),
                (i = !n && []),
                (r = O.exec(t))
                  ? [e.createElement(r[1])]
                  : ((r = Mt([t], e, i)), i && i.length && j(i).remove(), j.merge([], r.childNodes)));
            var o; var r; var i;
          }),
          (j.fn.load = function (t, e, n) {
            var o;
                var r;
                var i;
                var a = this;
                var s = t.indexOf(' ');
            return (
              s > -1 && ((o = je(t.slice(s))), (t = t.slice(0, s))),
              v(e) ? ((n = e), (e = void 0)) : e && typeof e == 'object' && (r = 'POST'),
              a.length > 0 &&
                j
                  .ajax({ url: t, type: r || 'GET', dataType: 'html', data: e })
                  .done(function (t) {
                    (i = arguments), a.html(o ? j('<div>').append(j.parseHTML(t)).find(o) : t);
                  })
                  .always(
                    n &&
                      function (t, e) {
                        a.each(function () {
                          n.apply(this, i || [t.responseText, e, t]);
                        });
                      },
                  ),
              this
            );
          }),
          (j.expr.pseudos.animated = function (t) {
            return j.grep(j.timers, function (e) {
              return t === e.elem;
            }).length;
          }),
          (j.offset = {
            setOffset (t, e, n) {
                var o,
                  r,
                  i,
                  a,
                  s,
                  u,
                  l = j.css(t, 'position'),
                  c = j(t),
                  d = {};
                'static' === l && (t.style.position = 'relative'),
                  (s = c.offset()),
                  (i = j.css(t, 'top')),
                  (u = j.css(t, 'left')),
                  ('absolute' === l || 'fixed' === l) && (i + u).indexOf('auto') > -1
                    ? ((a = (o = c.position()).top), (r = o.left))
                    : ((a = parseFloat(i) || 0), (r = parseFloat(u) || 0)),
                  v(e) && (e = e.call(t, n, j.extend({}, s))),
                  null != e.top && (d.top = e.top - s.top + a),
                  null != e.left && (d.left = e.left - s.left + r),
                  'using' in e ? e.using.call(t, d) : c.css(d);
              },
          }),
          j.fn.extend({
            offset: function (t) {
              if (arguments.length)
                return void 0 === t
                  ? this
                  : this.each(function (e) {
                      j.offset.setOffset(this, t, e);
                    });
              let e;
                  var n;
                  var o = this[0];
              return o
                ? o.getClientRects().length
                  ? ((e = o.getBoundingClientRect()),
                    (n = o.ownerDocument.defaultView),
                    { top: e.top + n.pageYOffset, left: e.left + n.pageXOffset })
                  : { top: 0, left: 0 }
                : void 0;
            },
            position () {
                if (this[0]) {
                  var t,
                    e,
                    n,
                    o = this[0],
                    r = { top: 0, left: 0 };
                  if ('fixed' === j.css(o, 'position')) e = o.getBoundingClientRect();
                  else {
                    for (
                      e = this.offset(), n = o.ownerDocument, t = o.offsetParent || n.documentElement;
                      t && (t === n.body || t === n.documentElement) && 'static' === j.css(t, 'position');

                    )
                      t = t.parentNode;
                    t &&
                      t !== o &&
                      1 === t.nodeType &&
                      (((r = j(t).offset()).top += j.css(t, 'borderTopWidth', !0)),
                      (r.left += j.css(t, 'borderLeftWidth', !0)));
                  }
                  return {
                    top: e.top - r.top - j.css(o, 'marginTop', !0),
                    left: e.left - r.left - j.css(o, 'marginLeft', !0),
                  };
                }
              },
            offsetParent () {
                return this.map(function () {
                  for (var t = this.offsetParent; t && 'static' === j.css(t, 'position'); ) t = t.offsetParent;
                  return t || mt;
                });
              },
          }),
          j.each({ scrollLeft: 'pageXOffset', scrollTop: 'pageYOffset' }, function (t, e) {
            var n = e === 'pageYOffset';
            j.fn[t] = function (o) {
              return tt(
                this,
                function (t, o, r) {
                  var i;
                  if ((y(t) ? (i = t) : 9 === t.nodeType && (i = t.defaultView), void 0 === r)) return i ? i[e] : t[o];
                  i ? i.scrollTo(n ? i.pageXOffset : r, n ? r : i.pageYOffset) : (t[o] = r);
                },
                t,
                o,
                arguments.length,
              );
            };
          }),
          j.each(['top', 'left'], function (t, e) {
            j.cssHooks[e] = te(g.pixelPosition, function (t, n) {
              if (n) return (n = Zt(t, e)), Gt.test(n) ? `${j(t).position()[e]  }px` : n;
            });
          }),
          j.each({ Height: 'height', Width: 'width' }, function (t, e) {
            j.each({ padding: `inner${  t}`, content: e, '': `outer${  t}` }, function (n, o) {
              j.fn[o] = function (r, i) {
                var a = arguments.length && (n || typeof r != 'boolean');
                    var s = n || (!0 === r || !0 === i ? 'margin' : 'border');
                return tt(
                  this,
                  function (e, n, r) {
                    let i;
                    return y(e)
                      ? o.indexOf('outer') === 0
                        ? e[`inner${  t}`]
                        : e.document.documentElement[`client${  t}`]
                      : e.nodeType === 9
                      ? ((i = e.documentElement),
                        Math.max(
                          e.body[`scroll${  t}`],
                          i[`scroll${  t}`],
                          e.body[`offset${  t}`],
                          i[`offset${  t}`],
                          i[`client${  t}`],
                        ))
                      : void 0 === r
                      ? j.css(e, n, s)
                      : j.style(e, n, r, s);
                  },
                  e,
                  a ? r : void 0,
                  a,
                );
              };
            });
          }),
          j.each(['ajaxStart', 'ajaxStop', 'ajaxComplete', 'ajaxError', 'ajaxSuccess', 'ajaxSend'], function (t, e) {
            j.fn[e] = function (t) {
              return this.on(e, t);
            };
          }),
          j.fn.extend({
            bind (t, e, n) {
                return this.on(t, null, e, n);
              },
            unbind (t, e) {
                return this.off(t, null, e);
              },
            delegate: function (t, e, n, o) {
              return this.on(e, t, n, o);
            },
            undelegate: function (t, e, n) {
              return arguments.length === 1 ? this.off(t, '**') : this.off(e, t || '**', n);
            },
            hover (t, e) {
                return this.on('mouseenter', t).on('mouseleave', e || t);
              },
          }),
          j.each(
            'blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu'.split(
              ' ',
            ),
            function (t, e) {
              j.fn[e] = function (t, n) {
                return arguments.length > 0 ? this.on(e, null, t, n) : this.trigger(e);
              };
            },
          );
        let on = /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;
        (j.proxy = function (t, e) {
          var n; var o; var r;
          if ((typeof e == 'string' && ((n = t[e]), (e = t), (t = n)), v(t)))
            return (
              (o = s.call(arguments, 2)),
              (r = function () {
                return t.apply(e || this, o.concat(s.call(arguments)));
              }),
              (r.guid = t.guid = t.guid || j.guid++),
              r
            );
        }),
          (j.holdReady = function (t) {
            t ? j.readyWait++ : j.ready(!0);
          }),
          (j.isArray = Array.isArray),
          (j.parseJSON = JSON.parse),
          (j.nodeName = A),
          (j.isFunction = v),
          (j.isWindow = y),
          (j.camelCase = rt),
          (j.type = k),
          (j.now = Date.now),
          (j.isNumeric = function (t) {
            var e = j.type(t);
            return (e === 'number' || e === 'string') && !isNaN(t - parseFloat(t));
          }),
          (j.trim = function (t) {
            return t == null ? '' : (`${t  }`).replace(on, '$1');
          }),
          void 0 ===
            (n = function () {
              return j;
            }.apply(e, [])) || (t.exports = n);
        let rn = o.jQuery;
            var an = o.$;
        return (
          (j.noConflict = function (t) {
            return o.$ === j && (o.$ = an), t && o.jQuery === j && (o.jQuery = rn), j;
          }),
          void 0 === r && (o.jQuery = o.$ = j),
          j
        );
      });
    },
  };
  const e = {};
  function n(o) {
    const r = e[o];
    if (void 0 !== r) return r.exports;
    const i = (e[o] = { exports: {} });
    return t[o].call(i.exports, i, i.exports, n), i.exports;
  }
  (n.n = function (t) {
    const e =
      t && t.__esModule
        ? function () {
            return t.default;
          }
        : function () {
            return t;
          };
    return n.d(e, { a: e }), e;
  }),
    (n.d = function (t, e) {
      for (const o in e) n.o(e, o) && !n.o(t, o) && Object.defineProperty(t, o, { enumerable: !0, get: e[o] });
    }),
    (n.o = function (t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    }),
    (n.r = function (t) {
      typeof Symbol !== 'undefined' &&
        Symbol.toStringTag &&
        Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(t, '__esModule', { value: !0 });
    });
  const o = {};
  !(function () {
    n.r(o);
    const t = n(692);
    let e = n.n(t);
    const r = n(167);
    const i = n.n(r);
    o.default = ((window.$ = e()), (0, r.initAll)(), void (window.MOJFrontend = i()));
  })(),
    ((DTFS_PORTAL = void 0 === DTFS_PORTAL ? {} : DTFS_PORTAL).mojFrontend = o);
})();
// # sourceMappingURL=mojFrontend.js.map
