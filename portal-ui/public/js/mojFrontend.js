/*! For license information please see mojFrontend.js.LICENSE.txt */
let DTFS_PORTAL;
!(function () {
  const t = {
    167(t, e) {
      let n;
      let o;
      let i;
      (o = []),
        void 0 ===
          (i =
            typeof (n = function () {
              const t = {};
              function e(t, e) {
                if (!t) return this;
                const n = Object.freeze({
                  properties: {
                    excludedDates: { type: 'string' },
                    excludedDays: { type: 'string' },
                    leadingZeros: { type: 'string' },
                    maxDate: { type: 'string' },
                    minDate: { type: 'string' },
                    weekStartDay: { type: 'string' },
                  },
                });
                const o = { leadingZeros: !1, weekStartDay: 'monday' };
                (this.config = this.mergeConfigs(o, e, this.parseDataset(n, t.dataset))),
                  (this.dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
                  (this.monthLabels = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                  ]),
                  (this.currentDate = new Date()),
                  this.currentDate.setHours(0, 0, 0, 0),
                  (this.calendarDays = []),
                  (this.excludedDates = []),
                  (this.excludedDays = []),
                  (this.buttonClass = 'moj-datepicker__button'),
                  (this.selectedDayButtonClass = 'moj-datepicker__button--selected'),
                  (this.currentDayButtonClass = 'moj-datepicker__button--current'),
                  (this.todayButtonClass = 'moj-datepicker__button--today'),
                  (this.$module = t),
                  (this.$input = t.querySelector('.moj-js-datepicker-input'));
              }
              function n(t, e, n, o, i) {
                (this.index = e), (this.row = n), (this.column = o), (this.button = t), (this.picker = i), (this.date = new Date());
              }
              return (
                (t.removeAttributeValue = function (t, e, n) {
                  let o;
                  let i;
                  t.getAttribute(e) &&
                    (t.getAttribute(e) == n
                      ? t.removeAttribute(e)
                      : ((o = new RegExp(`(^|\\s)${n}(\\s|$)`)),
                        (i = t.getAttribute(e).match(o)) && i.length == 3 && t.setAttribute(e, t.getAttribute(e).replace(o, i[1] && i[2] ? ' ' : ''))));
                }),
                (t.addAttributeValue = function (t, e, n) {
                  t.getAttribute(e)
                    ? new RegExp(`(^|\\s)${n}(\\s|$)`).test(t.getAttribute(e)) || t.setAttribute(e, `${t.getAttribute(e)} ${n}`)
                    : t.setAttribute(e, n);
                }),
                (t.dragAndDropSupported = function () {
                  return void 0 !== document.createElement('div').ondrop;
                }),
                (t.formDataSupported = function () {
                  return typeof FormData === 'function';
                }),
                (t.fileApiSupported = function () {
                  const t = document.createElement('input');
                  return (t.type = 'file'), void 0 !== t.files;
                }),
                (t.nodeListForEach = function (t, e) {
                  if (window.NodeList.prototype.forEach) return t.forEach(e);
                  for (let n = 0; n < t.length; n++) e.call(window, t[n], n, t);
                }),
                (t.initAll = function (e) {
                  const n = void 0 !== (e = void 0 !== e ? e : {}).scope ? e.scope : document;
                  const o = n.querySelectorAll('[data-module="moj-add-another"]');
                  t.nodeListForEach(o, function (e) {
                    new t.AddAnother(e);
                  });
                  const i = n.querySelectorAll('[data-module="moj-multi-select"]');
                  t.nodeListForEach(i, function (e) {
                    new t.MultiSelect({
                      container: e.querySelector(e.getAttribute('data-multi-select-checkbox')),
                      checkboxes: e.querySelectorAll('tbody .govuk-checkboxes__input'),
                    });
                  });
                  const r = n.querySelectorAll('[data-module="moj-password-reveal"]');
                  t.nodeListForEach(r, function (e) {
                    new t.PasswordReveal(e);
                  });
                  const a = n.querySelectorAll('[data-module="moj-rich-text-editor"]');
                  t.nodeListForEach(a, function (e) {
                    const n = { textarea: $(e) };
                    const o = e.getAttribute('data-moj-rich-text-editor-toolbar');
                    if (o) {
                      const i = o.split(',');
                      for (const r in ((n.toolbar = {}), i)) n.toolbar[i[r]] = !0;
                    }
                    new t.RichTextEditor(n);
                  });
                  const s = n.querySelectorAll('[data-module="moj-search-toggle"]');
                  t.nodeListForEach(s, function (e) {
                    new t.SearchToggle({
                      toggleButton: { container: $(e.querySelector('.moj-search-toggle__toggle')), text: e.getAttribute('data-moj-search-toggle-text') },
                      search: { container: $(e.querySelector('.moj-search')) },
                    });
                  });
                  let l = n.querySelectorAll('[data-module="moj-sortable-table"]');
                  t.nodeListForEach(l, function (e) {
                    new t.SortableTable({ table: e });
                  }),
                    (l = n.querySelectorAll('[data-module="moj-sortable-table"]')),
                    t.nodeListForEach(l, function (e) {
                      new t.SortableTable({ table: e });
                    });
                  const u = document.querySelectorAll('[data-module="moj-date-picker"]');
                  t.nodeListForEach(u, function (e) {
                    new t.DatePicker(e, {}).init();
                  });
                  const c = n.querySelectorAll('[data-module="moj-button-menu"]');
                  t.nodeListForEach(c, function (e) {
                    new t.ButtonMenu(e, {}).init();
                  });
                }),
                (t.AddAnother = function (t) {
                  (this.container = $(t)),
                    this.container.data('moj-add-another-initialised') ||
                      (this.container.data('moj-add-another-initialised', !0),
                      this.container.on('click', '.moj-add-another__remove-button', $.proxy(this, 'onRemoveButtonClick')),
                      this.container.on('click', '.moj-add-another__add-button', $.proxy(this, 'onAddButtonClick')),
                      this.container.find('.moj-add-another__add-button, moj-add-another__remove-button').prop('type', 'button'));
                }),
                (t.AddAnother.prototype.onAddButtonClick = function (t) {
                  const e = this.getNewItem();
                  this.updateAttributes(this.getItems().length, e), this.resetItem(e);
                  const n = this.getItems().first();
                  this.hasRemoveButton(n) || this.createRemoveButton(n), this.getItems().last().after(e), e.find('input, textarea, select').first().focus();
                }),
                (t.AddAnother.prototype.hasRemoveButton = function (t) {
                  return t.find('.moj-add-another__remove-button').length;
                }),
                (t.AddAnother.prototype.getItems = function () {
                  return this.container.find('.moj-add-another__item');
                }),
                (t.AddAnother.prototype.getNewItem = function () {
                  const t = this.getItems().first().clone();
                  return this.hasRemoveButton(t) || this.createRemoveButton(t), t;
                }),
                (t.AddAnother.prototype.updateAttributes = function (t, e) {
                  e.find('[data-name]').each(function (n, o) {
                    const i = o.id;
                    (o.name = $(o)
                      .attr('data-name')
                      .replace(/%index%/, t)),
                      (o.id = $(o)
                        .attr('data-id')
                        .replace(/%index%/, t)),
                      (($(o).siblings('label')[0] || $(o).parents('label')[0] || e.find(`[for="${i}"]`)[0]).htmlFor = o.id);
                  });
                }),
                (t.AddAnother.prototype.createRemoveButton = function (t) {
                  t.append('<button type="button" class="govuk-button govuk-button--secondary moj-add-another__remove-button">Remove</button>');
                }),
                (t.AddAnother.prototype.resetItem = function (t) {
                  t.find('[data-name], [data-id]').each(function (t, e) {
                    e.type == 'checkbox' || e.type == 'radio' ? (e.checked = !1) : (e.value = '');
                  });
                }),
                (t.AddAnother.prototype.onRemoveButtonClick = function (t) {
                  $(t.currentTarget).parents('.moj-add-another__item').remove();
                  const e = this.getItems();
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
                (t.ButtonMenu = function (t, e = {}) {
                  if (!t) return this;
                  const n = Object.freeze({
                    properties: { buttonText: { type: 'string' }, buttonClasses: { type: 'string' }, alignMenu: { type: 'string' } },
                  });
                  const o = { buttonText: 'Actions', alignMenu: 'left', buttonClasses: '' };
                  (this.config = this.mergeConfigs(o, e, this.parseDataset(n, t.dataset))), (this.$module = t);
                }),
                (t.ButtonMenu.prototype.init = function () {
                  if (this.$module.children.length == 1) {
                    const t = this.$module.children[0];
                    t.classList.forEach((e) => {
                      e.startsWith('govuk-button-') && t.classList.remove(e), t.classList.remove('moj-button-menu__item');
                    }),
                      this.config.buttonClasses && t.classList.add(...this.config.buttonClasses.split(' '));
                  }
                  this.$module.children.length > 1 && this.initMenu();
                }),
                (t.ButtonMenu.prototype.initMenu = function () {
                  (this.$menu = this.createMenu()),
                    this.$module.insertAdjacentHTML('afterbegin', this.toggleTemplate()),
                    this.setupMenuItems(),
                    (this.$menuToggle = this.$module.querySelector(':scope > button')),
                    (this.items = this.$menu.querySelectorAll('a, button')),
                    this.$menuToggle.addEventListener('click', (t) => {
                      this.toggleMenu(t);
                    }),
                    this.$module.addEventListener('keydown', (t) => {
                      this.handleKeyDown(t);
                    }),
                    document.addEventListener('click', (t) => {
                      this.$module.contains(t.target) || this.closeMenu(!1);
                    });
                }),
                (t.ButtonMenu.prototype.createMenu = function () {
                  const t = document.createElement('ul');
                  for (
                    t.setAttribute('role', 'list'),
                      t.hidden = !0,
                      t.classList.add('moj-button-menu__wrapper'),
                      this.config.alignMenu == 'right' && t.classList.add('moj-button-menu__wrapper--right'),
                      this.$module.appendChild(t);
                    this.$module.firstChild !== t;

                  )
                    t.appendChild(this.$module.firstChild);
                  return t;
                }),
                (t.ButtonMenu.prototype.setupMenuItems = function () {
                  Array.from(this.$menu.children).forEach((t) => {
                    const e = document.createElement('li');
                    this.$menu.insertBefore(e, t),
                      e.appendChild(t),
                      t.setAttribute('tabindex', -1),
                      t.tagName == 'BUTTON' && t.setAttribute('type', 'button'),
                      t.classList.forEach((e) => {
                        e.startsWith('govuk-button') && t.classList.remove(e);
                      }),
                      t.addEventListener('click', (t) => {
                        setTimeout(() => {
                          this.closeMenu(!1);
                        }, 50);
                      });
                  });
                }),
                (t.ButtonMenu.prototype.toggleTemplate = function () {
                  return `\n    <button type="button" class="govuk-button moj-button-menu__toggle-button ${
                    this.config.buttonClasses || ''
                  }" aria-haspopup="true" aria-expanded="false">\n      <span>\n       ${
                    this.config.buttonText
                  }\n       <svg width="11" height="5" viewBox="0 0 11 5"  xmlns="http://www.w3.org/2000/svg">\n         <path d="M5.5 0L11 5L0 5L5.5 0Z" fill="currentColor"/>\n       </svg>\n      </span>\n    </button>`;
                }),
                (t.ButtonMenu.prototype.isOpen = function () {
                  return this.$menuToggle.getAttribute('aria-expanded') === 'true';
                }),
                (t.ButtonMenu.prototype.toggleMenu = function (t) {
                  t.preventDefault();
                  const e = t.detail == 0 ? 0 : -1;
                  this.isOpen() ? this.closeMenu() : this.openMenu(e);
                }),
                (t.ButtonMenu.prototype.openMenu = function (t = 0) {
                  (this.$menu.hidden = !1), this.$menuToggle.setAttribute('aria-expanded', 'true'), t !== -1 && this.focusItem(t);
                }),
                (t.ButtonMenu.prototype.closeMenu = function (t = !0) {
                  (this.$menu.hidden = !0), this.$menuToggle.setAttribute('aria-expanded', 'false'), t && this.$menuToggle.focus();
                }),
                (t.ButtonMenu.prototype.focusItem = function (t) {
                  t >= this.items.length && (t = 0), t < 0 && (t = this.items.length - 1), this.items.item(t)?.focus();
                }),
                (t.ButtonMenu.prototype.currentFocusIndex = function () {
                  const t = document.activeElement;
                  return Array.from(this.items).indexOf(t);
                }),
                (t.ButtonMenu.prototype.handleKeyDown = function (t) {
                  if (t.target == this.$menuToggle)
                    switch (t.key) {
                      case 'ArrowDown':
                        t.preventDefault(), this.openMenu();
                        break;
                      case 'ArrowUp':
                        t.preventDefault(), this.openMenu(this.items.length - 1);
                    }
                  if (this.$menu.contains(t.target) && this.isOpen())
                    switch (t.key) {
                      case 'ArrowDown':
                        t.preventDefault(), this.currentFocusIndex() !== -1 && this.focusItem(this.currentFocusIndex() + 1);
                        break;
                      case 'ArrowUp':
                        t.preventDefault(), this.currentFocusIndex() !== -1 && this.focusItem(this.currentFocusIndex() - 1);
                        break;
                      case 'Home':
                        t.preventDefault(), this.focusItem(0);
                        break;
                      case 'End':
                        t.preventDefault(), this.focusItem(this.items.length - 1);
                    }
                  t.key == 'Escape' && this.isOpen() && this.closeMenu(), t.key == 'Tab' && this.isOpen() && this.closeMenu(!1);
                }),
                (t.ButtonMenu.prototype.parseDataset = function (t, e) {
                  const n = {};
                  for (const [o, i] of Object.entries(t.properties)) o in e && e[o] && (n[o] = e[o]);
                  return n;
                }),
                (t.ButtonMenu.prototype.mergeConfigs = function (...t) {
                  const e = {};
                  for (const n of t)
                    for (const t of Object.keys(n)) {
                      const o = e[t];
                      const i = n[t];
                      e[t] = typeof o === 'object' && typeof i === 'object' ? this.mergeConfigs(o, i) : i;
                    }
                  return e;
                }),
                (e.prototype.init = function () {
                  this.$input &&
                    (this.$module.dataset.initialized || (this.setOptions(), this.initControls(), this.$module.setAttribute('data-initialized', 'true')));
                }),
                (e.prototype.initControls = function () {
                  (this.id = `datepicker-${this.$input.id}`), (this.$dialog = this.createDialog()), this.createCalendarHeaders();
                  const t = document.createElement('div');
                  const e = document.createElement('div');
                  t.classList.add('moj-datepicker__wrapper'),
                    e.classList.add('govuk-input__wrapper'),
                    this.$input.parentNode.insertBefore(t, this.$input),
                    t.appendChild(e),
                    e.appendChild(this.$input),
                    e.insertAdjacentHTML('beforeend', this.toggleTemplate()),
                    t.insertAdjacentElement('beforeend', this.$dialog),
                    (this.$calendarButton = this.$module.querySelector('.moj-js-datepicker-toggle')),
                    (this.$dialogTitle = this.$dialog.querySelector('.moj-js-datepicker-month-year')),
                    this.createCalendar(),
                    (this.$prevMonthButton = this.$dialog.querySelector('.moj-js-datepicker-prev-month')),
                    (this.$prevYearButton = this.$dialog.querySelector('.moj-js-datepicker-prev-year')),
                    (this.$nextMonthButton = this.$dialog.querySelector('.moj-js-datepicker-next-month')),
                    (this.$nextYearButton = this.$dialog.querySelector('.moj-js-datepicker-next-year')),
                    (this.$cancelButton = this.$dialog.querySelector('.moj-js-datepicker-cancel')),
                    (this.$okButton = this.$dialog.querySelector('.moj-js-datepicker-ok')),
                    this.$prevMonthButton.addEventListener('click', (t) => this.focusPreviousMonth(t, !1)),
                    this.$prevYearButton.addEventListener('click', (t) => this.focusPreviousYear(t, !1)),
                    this.$nextMonthButton.addEventListener('click', (t) => this.focusNextMonth(t, !1)),
                    this.$nextYearButton.addEventListener('click', (t) => this.focusNextYear(t, !1)),
                    this.$cancelButton.addEventListener('click', (t) => {
                      t.preventDefault(), this.closeDialog(t);
                    }),
                    this.$okButton.addEventListener('click', () => {
                      this.selectDate(this.currentDate);
                    });
                  const n = this.$dialog.querySelectorAll('button:not([disabled="true"])');
                  (this.$firstButtonInDialog = n[0]),
                    (this.$lastButtonInDialog = n[n.length - 1]),
                    this.$firstButtonInDialog.addEventListener('keydown', (t) => this.firstButtonKeydown(t)),
                    this.$lastButtonInDialog.addEventListener('keydown', (t) => this.lastButtonKeydown(t)),
                    this.$calendarButton.addEventListener('click', (t) => this.toggleDialog(t)),
                    this.$dialog.addEventListener('keydown', (t) => {
                      t.key == 'Escape' && (this.closeDialog(), t.preventDefault(), t.stopPropagation());
                    }),
                    document.body.addEventListener('mouseup', (t) => this.backgroundClick(t)),
                    this.updateCalendar();
                }),
                (e.prototype.createDialog = function () {
                  const t = `datepicker-title-${this.$input.id}`;
                  const e = document.createElement('div');
                  return (
                    (e.id = this.id),
                    e.setAttribute('class', 'moj-datepicker__dialog'),
                    e.setAttribute('role', 'dialog'),
                    e.setAttribute('aria-modal', 'true'),
                    e.setAttribute('aria-labelledby', t),
                    (e.innerHTML = this.dialogTemplate(t)),
                    (e.hidden = !0),
                    e
                  );
                }),
                (e.prototype.createCalendar = function () {
                  const t = this.$dialog.querySelector('tbody');
                  let e = 0;
                  for (let o = 0; o < 6; o++) {
                    const i = t.insertRow(o);
                    for (let t = 0; t < 7; t++) {
                      const r = document.createElement('td');
                      const a = document.createElement('button');
                      r.appendChild(a), i.appendChild(r);
                      const s = new n(a, e, o, t, this);
                      s.init(), this.calendarDays.push(s), e++;
                    }
                  }
                }),
                (e.prototype.toggleTemplate = function () {
                  return `<button class="moj-datepicker__toggle moj-js-datepicker-toggle" type="button" aria-haspopup="dialog" aria-controls="${this.id}" aria-expanded="false">\n            <span class="govuk-visually-hidden">Choose date</span>\n            <svg width="32" height="24" focusable="false" class="moj-datepicker-icon" aria-hidden="true" role="img" viewBox="0 0 22 22">\n              <path\n                fill="currentColor"\n                fill-rule="evenodd"\n                clip-rule="evenodd"\n                d="M16.1333 2.93333H5.86668V4.4C5.86668 5.21002 5.21003 5.86667 4.40002 5.86667C3.59 5.86667 2.93335 5.21002 2.93335 4.4V2.93333H2C0.895431 2.93333 0 3.82877 0 4.93334V19.2667C0 20.3712 0.89543 21.2667 2 21.2667H20C21.1046 21.2667 22 20.3712 22 19.2667V4.93333C22 3.82876 21.1046 2.93333 20 2.93333H19.0667V4.4C19.0667 5.21002 18.41 5.86667 17.6 5.86667C16.79 5.86667 16.1333 5.21002 16.1333 4.4V2.93333ZM20.5333 8.06667H1.46665V18.8C1.46665 19.3523 1.91436 19.8 2.46665 19.8H19.5333C20.0856 19.8 20.5333 19.3523 20.5333 18.8V8.06667Z"\n              ></path>\n              <rect x="3.66669" width="1.46667" height="5.13333" rx="0.733333" fill="currentColor"></rect>\n              <rect x="16.8667" width="1.46667" height="5.13333" rx="0.733333" fill="currentColor"></rect>\n            </svg>\n          </button>`;
                }),
                (e.prototype.dialogTemplate = function (t) {
                  return `<div class="moj-datepicker__dialog-header">\n            <div class="moj-datepicker__dialog-navbuttons">\n              <button class="moj-datepicker__button moj-js-datepicker-prev-year">\n                <span class="govuk-visually-hidden">Previous year</span>\n                <svg width="44" height="40" viewBox="0 0 44 40" fill="none" fill="none" focusable="false" aria-hidden="true" role="img">\n                  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.1643 20L28.9572 14.2071L27.5429 12.7929L20.3358 20L27.5429 27.2071L28.9572 25.7929L23.1643 20Z" fill="currentColor"/>\n                  <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1643 20L22.9572 14.2071L21.5429 12.7929L14.3358 20L21.5429 27.2071L22.9572 25.7929L17.1643 20Z" fill="currentColor"/>\n                </svg>\n              </button>\n\n              <button class="moj-datepicker__button moj-js-datepicker-prev-month">\n                <span class="govuk-visually-hidden">Previous month</span>\n                <svg width="44" height="40" viewBox="0 0 44 40" fill="none" focusable="false" aria-hidden="true" role="img">\n                  <path fill-rule="evenodd" clip-rule="evenodd" d="M20.5729 20L25.7865 14.2071L24.5137 12.7929L18.0273 20L24.5137 27.2071L25.7865 25.7929L20.5729 20Z" fill="currentColor"/>\n                </svg>\n              </button>\n            </div>\n\n            <h2 id="${t}" class="moj-datepicker__dialog-title moj-js-datepicker-month-year" aria-live="polite">June 2020</h2>\n\n            <div class="moj-datepicker__dialog-navbuttons">\n              <button class="moj-datepicker__button moj-js-datepicker-next-month">\n                <span class="govuk-visually-hidden">Next month</span>\n                <svg width="44" height="40" viewBox="0 0 44 40" fill="none"  focusable="false" aria-hidden="true" role="img">\n                  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.4271 20L18.2135 14.2071L19.4863 12.7929L25.9727 20L19.4863 27.2071L18.2135 25.7929L23.4271 20Z" fill="currentColor"/>\n                </svg>\n              </button>\n\n              <button class="moj-datepicker__button moj-js-datepicker-next-year">\n                <span class="govuk-visually-hidden">Next year</span>\n                <svg width="44" height="40" viewBox="0 0 44 40" fill="none" fill="none" focusable="false" aria-hidden="true" role="img">\n                  <path fill-rule="evenodd" clip-rule="evenodd" d="M20.8357 20L15.0428 14.2071L16.4571 12.7929L23.6642 20L16.4571 27.2071L15.0428 25.7929L20.8357 20Z" fill="currentColor"/>\n                  <path fill-rule="evenodd" clip-rule="evenodd" d="M26.8357 20L21.0428 14.2071L22.4571 12.7929L29.6642 20L22.4571 27.2071L21.0428 25.7929L26.8357 20Z" fill="currentColor"/>\n                </svg>\n              </button>\n            </div>\n          </div>\n\n          <table class="moj-datepicker__calendar moj-js-datepicker-grid" role="grid" aria-labelledby="${t}">\n            <thead>\n              <tr></tr>\n            </thead>\n\n            <tbody></tbody>\n          </table>\n\n          <div class="govuk-button-group">\n            <button type="button" class="govuk-button moj-js-datepicker-ok">Select</button>\n            <button type="button" class="govuk-button govuk-button--secondary moj-js-datepicker-cancel">Close</button>\n          </div>`;
                }),
                (e.prototype.createCalendarHeaders = function () {
                  this.dayLabels.forEach((t) => {
                    const e = `<th scope="col"><span aria-hidden="true">${t.substring(0, 3)}</span><span class="govuk-visually-hidden">${t}</span></th>`;
                    this.$dialog.querySelector('thead > tr').insertAdjacentHTML('beforeend', e);
                  });
                }),
                (e.prototype.leadingZeros = function (t, e = 2) {
                  let n = t.toString();
                  for (; n.length < e; ) n = `0${n}`;
                  return n;
                }),
                (e.prototype.setOptions = function () {
                  this.setMinAndMaxDatesOnCalendar(), this.setExcludedDates(), this.setExcludedDays(), this.setLeadingZeros(), this.setWeekStartDay();
                }),
                (e.prototype.setMinAndMaxDatesOnCalendar = function () {
                  this.config.minDate &&
                    ((this.minDate = this.formattedDateFromString(this.config.minDate, null)),
                    this.minDate && this.currentDate < this.minDate && (this.currentDate = this.minDate)),
                    this.config.maxDate &&
                      ((this.maxDate = this.formattedDateFromString(this.config.maxDate, null)),
                      this.maxDate && this.currentDate > this.maxDate && (this.currentDate = this.maxDate));
                }),
                (e.prototype.setExcludedDates = function () {
                  this.config.excludedDates &&
                    (this.excludedDates = this.config.excludedDates
                      .replace(/\s+/, ' ')
                      .split(' ')
                      .map((t) => {
                        if (!t.includes('-')) return this.formattedDateFromString(t, null);
                        {
                          const [e, n] = t.split('-').map((t) => this.formattedDateFromString(t, null));
                          if (e && n) {
                            const t = new Date(e.getTime());
                            const o = [];
                            for (; t <= n; ) o.push(new Date(t)), t.setDate(t.getDate() + 1);
                            return o;
                          }
                        }
                      })
                      .flat()
                      .filter((t) => t));
                }),
                (e.prototype.setExcludedDays = function () {
                  if (this.config.excludedDays) {
                    const t = this.dayLabels.map((t) => t.toLowerCase());
                    this.config.weekStartDay === 'monday' && t.unshift(t.pop()),
                      (this.excludedDays = this.config.excludedDays
                        .replace(/\s+/, ' ')
                        .toLowerCase()
                        .split(' ')
                        .map((e) => t.indexOf(e))
                        .filter((t) => t !== -1));
                  }
                }),
                (e.prototype.setLeadingZeros = function () {
                  if (typeof this.config.leadingZeros !== 'boolean') {
                    if (this.config.leadingZeros.toLowerCase() === 'true') return void (this.config.leadingZeros = !0);
                    if (this.config.leadingZeros.toLowerCase() === 'false') return void (this.config.leadingZeros = !1);
                  }
                }),
                (e.prototype.setWeekStartDay = function () {
                  const t = this.config.weekStartDay;
                  t?.toLowerCase() === 'sunday' && ((this.config.weekStartDay = 'sunday'), this.dayLabels.unshift(this.dayLabels.pop())),
                    t?.toLowerCase() === 'monday' && (this.config.weekStartDay = 'monday');
                }),
                (e.prototype.isExcludedDate = function (t) {
                  if (this.minDate && this.minDate > t) return !0;
                  if (this.maxDate && this.maxDate < t) return !0;
                  for (const e of this.excludedDates) if (t.toDateString() === e.toDateString()) return !0;
                  return !!this.excludedDays.includes(t.getDay());
                }),
                (e.prototype.formattedDateFromString = function (t, e = new Date()) {
                  let n = null;
                  const o = /(\d{1,2})([-/,. ])(\d{1,2})\2(\d{4})/;
                  if (!o.test(t)) return e;
                  const i = t.match(o);
                  const r = i[1];
                  const a = i[3];
                  const s = i[4];
                  return (n = new Date(`${s}-${a}-${r}`)), n instanceof Date && !isNaN(n) ? n : e;
                }),
                (e.prototype.formattedDateFromDate = function (t) {
                  return this.config.leadingZeros
                    ? `${this.leadingZeros(t.getDate())}/${this.leadingZeros(t.getMonth() + 1)}/${t.getFullYear()}`
                    : `${t.getDate()}/${t.getMonth() + 1}/${t.getFullYear()}`;
                }),
                (e.prototype.formattedDateHuman = function (t) {
                  return `${this.dayLabels[(t.getDay() + 6) % 7]} ${t.getDate()} ${this.monthLabels[t.getMonth()]} ${t.getFullYear()}`;
                }),
                (e.prototype.backgroundClick = function (t) {
                  !this.isOpen() ||
                    this.$dialog.contains(t.target) ||
                    this.$input.contains(t.target) ||
                    this.$calendarButton.contains(t.target) ||
                    (t.preventDefault(), this.closeDialog());
                }),
                (e.prototype.firstButtonKeydown = function (t) {
                  t.key === 'Tab' && t.shiftKey && (this.$lastButtonInDialog.focus(), t.preventDefault());
                }),
                (e.prototype.lastButtonKeydown = function (t) {
                  t.key !== 'Tab' || t.shiftKey || (this.$firstButtonInDialog.focus(), t.preventDefault());
                }),
                (e.prototype.updateCalendar = function () {
                  this.$dialogTitle.innerHTML = `${this.monthLabels[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
                  const t = this.currentDate;
                  const e = new Date(t.getFullYear(), t.getMonth(), 1);
                  let n;
                  (n = this.config.weekStartDay === 'monday' ? (e.getDay() === 0 ? 6 : e.getDay() - 1) : e.getDay()), e.setDate(e.getDate() - n);
                  const o = new Date(e);
                  for (let e = 0; e < this.calendarDays.length; e++) {
                    const n = o.getMonth() !== t.getMonth();
                    const i = this.isExcludedDate(o);
                    this.calendarDays[e].update(o, n, i), o.setDate(o.getDate() + 1);
                  }
                }),
                (e.prototype.setCurrentDate = function (t = !0) {
                  const { currentDate: e } = this;
                  if (
                    (this.calendarDays.forEach((n) => {
                      n.button.classList.add('moj-datepicker__button'),
                        n.button.classList.add('moj-datepicker__calendar-day'),
                        n.button.setAttribute('tabindex', -1),
                        n.button.classList.remove(this.selectedDayButtonClass);
                      const o = n.date;
                      o.setHours(0, 0, 0, 0);
                      const i = new Date();
                      i.setHours(0, 0, 0, 0),
                        o.getTime() === e.getTime() &&
                          t &&
                          (n.button.setAttribute('tabindex', 0), n.button.focus(), n.button.classList.add(this.selectedDayButtonClass)),
                        this.inputDate && o.getTime() === this.inputDate.getTime()
                          ? (n.button.classList.add(this.currentDayButtonClass), n.button.setAttribute('aria-current', 'date'))
                          : (n.button.classList.remove(this.currentDayButtonClass), n.button.removeAttribute('aria-current')),
                        o.getTime() === i.getTime() ? n.button.classList.add(this.todayButtonClass) : n.button.classList.remove(this.todayButtonClass);
                    }),
                    !t)
                  ) {
                    const t = this.calendarDays.filter((t) => window.getComputedStyle(t.button).display === 'block' && !t.button.disabled);
                    t[0].button.setAttribute('tabindex', 0), (this.currentDate = t[0].date);
                  }
                }),
                (e.prototype.selectDate = function (t) {
                  if (this.isExcludedDate(t)) return;
                  (this.$calendarButton.querySelector('span').innerText = `Choose date. Selected date is ${this.formattedDateHuman(t)}`),
                    (this.$input.value = this.formattedDateFromDate(t));
                  const e = new Event('change', { bubbles: !0, cancelable: !0 });
                  this.$input.dispatchEvent(e), this.closeDialog();
                }),
                (e.prototype.isOpen = function () {
                  return this.$dialog.classList.contains('moj-datepicker__dialog--open');
                }),
                (e.prototype.toggleDialog = function (t) {
                  t.preventDefault(), this.isOpen() ? this.closeDialog() : (this.setMinAndMaxDatesOnCalendar(), this.openDialog());
                }),
                (e.prototype.openDialog = function () {
                  (this.$dialog.hidden = !1),
                    this.$dialog.classList.add('moj-datepicker__dialog--open'),
                    this.$calendarButton.setAttribute('aria-expanded', 'true'),
                    this.$input.offsetWidth > this.$dialog.offsetWidth && (this.$dialog.style.right = '0px'),
                    (this.$dialog.style.top = `${this.$input.offsetHeight + 3}px`),
                    (this.inputDate = this.formattedDateFromString(this.$input.value)),
                    (this.currentDate = this.inputDate),
                    this.currentDate.setHours(0, 0, 0, 0),
                    this.updateCalendar(),
                    this.setCurrentDate();
                }),
                (e.prototype.closeDialog = function () {
                  (this.$dialog.hidden = !0),
                    this.$dialog.classList.remove('moj-datepicker__dialog--open'),
                    this.$calendarButton.setAttribute('aria-expanded', 'false'),
                    this.$calendarButton.focus();
                }),
                (e.prototype.goToDate = function (t, e) {
                  const n = this.currentDate;
                  (this.currentDate = t),
                    (n.getMonth() === this.currentDate.getMonth() && n.getFullYear() === this.currentDate.getFullYear()) || this.updateCalendar(),
                    this.setCurrentDate(e);
                }),
                (e.prototype.focusNextDay = function () {
                  const t = new Date(this.currentDate);
                  t.setDate(t.getDate() + 1), this.goToDate(t);
                }),
                (e.prototype.focusPreviousDay = function () {
                  const t = new Date(this.currentDate);
                  t.setDate(t.getDate() - 1), this.goToDate(t);
                }),
                (e.prototype.focusNextWeek = function () {
                  const t = new Date(this.currentDate);
                  t.setDate(t.getDate() + 7), this.goToDate(t);
                }),
                (e.prototype.focusPreviousWeek = function () {
                  const t = new Date(this.currentDate);
                  t.setDate(t.getDate() - 7), this.goToDate(t);
                }),
                (e.prototype.focusFirstDayOfWeek = function () {
                  const t = new Date(this.currentDate);
                  const e = this.config.weekStartDay == 'sunday' ? 0 : 1;
                  const n = t.getDay();
                  const o = n >= e ? n - e : 6 - n;
                  t.setDate(t.getDate() - o), t.setHours(0, 0, 0, 0), this.goToDate(t);
                }),
                (e.prototype.focusLastDayOfWeek = function () {
                  const t = new Date(this.currentDate);
                  const e = this.config.weekStartDay == 'sunday' ? 6 : 0;
                  const n = t.getDay();
                  const o = n <= e ? e - n : 7 - n;
                  t.setDate(t.getDate() + o), t.setHours(0, 0, 0, 0), this.goToDate(t);
                }),
                (e.prototype.focusNextMonth = function (t, e = !0) {
                  t.preventDefault();
                  const n = new Date(this.currentDate);
                  n.setMonth(n.getMonth() + 1, 1), this.goToDate(n, e);
                }),
                (e.prototype.focusPreviousMonth = function (t, e = !0) {
                  t.preventDefault();
                  const n = new Date(this.currentDate);
                  n.setMonth(n.getMonth() - 1, 1), this.goToDate(n, e);
                }),
                (e.prototype.focusNextYear = function (t, e = !0) {
                  t.preventDefault();
                  const n = new Date(this.currentDate);
                  n.setFullYear(n.getFullYear() + 1, n.getMonth(), 1), this.goToDate(n, e);
                }),
                (e.prototype.focusPreviousYear = function (t, e = !0) {
                  t.preventDefault();
                  const n = new Date(this.currentDate);
                  n.setFullYear(n.getFullYear() - 1, n.getMonth(), 1), this.goToDate(n, e);
                }),
                (e.prototype.parseDataset = function (t, e) {
                  const n = {};
                  for (const [o, i] of Object.entries(t.properties)) o in e && (n[o] = e[o]);
                  return n;
                }),
                (e.prototype.mergeConfigs = function (...t) {
                  const e = {};
                  for (const n of t)
                    for (const t of Object.keys(n)) {
                      const o = e[t];
                      const i = n[t];
                      e[t] = typeof o === 'object' && typeof i === 'object' ? this.mergeConfigs(o, i) : i;
                    }
                  return e;
                }),
                (n.prototype.init = function () {
                  this.button.addEventListener('keydown', this.keyPress.bind(this)), this.button.addEventListener('click', this.click.bind(this));
                }),
                (n.prototype.update = function (t, e, n) {
                  const o = t.getDate();
                  let i = this.picker.formattedDateHuman(t);
                  n ? (this.button.setAttribute('aria-disabled', !0), (i = `Excluded date, ${i}`)) : this.button.removeAttribute('aria-disabled'),
                    (this.button.style.display = e ? 'none' : 'block'),
                    (this.button.innerHTML = `<span class="govuk-visually-hidden">${i}</span><span aria-hidden="true">${o}</span>`),
                    (this.date = new Date(t));
                }),
                (n.prototype.click = function (t) {
                  this.picker.goToDate(this.date), this.picker.selectDate(this.date), t.stopPropagation(), t.preventDefault();
                }),
                (n.prototype.keyPress = function (t) {
                  let e = !0;
                  switch (t.key) {
                    case 'ArrowLeft':
                      this.picker.focusPreviousDay();
                      break;
                    case 'ArrowRight':
                      this.picker.focusNextDay();
                      break;
                    case 'ArrowUp':
                      this.picker.focusPreviousWeek();
                      break;
                    case 'ArrowDown':
                      this.picker.focusNextWeek();
                      break;
                    case 'Home':
                      this.picker.focusFirstDayOfWeek();
                      break;
                    case 'End':
                      this.picker.focusLastDayOfWeek();
                      break;
                    case 'PageUp':
                      t.shiftKey ? this.picker.focusPreviousYear(t) : this.picker.focusPreviousMonth(t);
                      break;
                    case 'PageDown':
                      t.shiftKey ? this.picker.focusNextYear(t) : this.picker.focusNextMonth(t);
                      break;
                    default:
                      e = !1;
                  }
                  e && (t.preventDefault(), t.stopPropagation());
                }),
                (t.DatePicker = e),
                (t.FilterToggleButton = function (t) {
                  (this.options = t),
                    (this.container = $(this.options.toggleButton.container)),
                    (this.filterContainer = $(this.options.filter.container)),
                    this.createToggleButton(),
                    this.setupResponsiveChecks(),
                    this.filterContainer.attr('tabindex', '-1'),
                    this.options.startHidden && this.hideMenu();
                }),
                (t.FilterToggleButton.prototype.setupResponsiveChecks = function () {
                  (this.mq = window.matchMedia(this.options.bigModeMediaQuery)), this.mq.addListener($.proxy(this, 'checkMode')), this.checkMode(this.mq);
                }),
                (t.FilterToggleButton.prototype.createToggleButton = function () {
                  (this.menuButton = $(
                    `<button class="govuk-button ${this.options.toggleButton.classes}" type="button" aria-haspopup="true" aria-expanded="false">${this.options.toggleButton.showText}</button>`,
                  )),
                    this.menuButton.on('click', $.proxy(this, 'onMenuButtonClick')),
                    this.container.append(this.menuButton);
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
                    ((this.closeButton = $(`<button class="moj-filter__close" type="button">${this.options.closeButton.text}</button>`)),
                    this.closeButton.on('click', $.proxy(this, 'onCloseClick')),
                    $(this.options.closeButton.container).append(this.closeButton));
                }),
                (t.FilterToggleButton.prototype.onCloseClick = function () {
                  this.hideMenu(), this.menuButton.focus();
                }),
                (t.FilterToggleButton.prototype.removeCloseButton = function () {
                  this.closeButton && (this.closeButton.remove(), (this.closeButton = null));
                }),
                (t.FilterToggleButton.prototype.hideMenu = function () {
                  this.menuButton.attr('aria-expanded', 'false'),
                    this.filterContainer.addClass('moj-js-hidden'),
                    this.menuButton.text(this.options.toggleButton.showText);
                }),
                (t.FilterToggleButton.prototype.showMenu = function () {
                  this.menuButton.attr('aria-expanded', 'true'),
                    this.filterContainer.removeClass('moj-js-hidden'),
                    this.menuButton.text(this.options.toggleButton.hideText);
                }),
                (t.FilterToggleButton.prototype.onMenuButtonClick = function () {
                  this.toggle();
                }),
                (t.FilterToggleButton.prototype.toggle = function () {
                  this.menuButton.attr('aria-expanded') == 'false' ? (this.showMenu(), this.filterContainer.focus()) : this.hideMenu();
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
                  document.title = `${this.errors.length} errors - ${document.title}`;
                }),
                (t.FormValidator.prototype.showSummary = function () {
                  this.summary.html(this.getSummaryHtml()),
                    this.summary.removeClass('moj-hidden'),
                    this.summary.attr('aria-labelledby', 'errorSummary-heading'),
                    this.summary.focus();
                }),
                (t.FormValidator.prototype.getSummaryHtml = function () {
                  let t = '<h2 id="error-summary-title" class="govuk-error-summary__title">There is a problem</h2>';
                  (t += '<div class="govuk-error-summary__body">'), (t += '<ul class="govuk-list govuk-error-summary__list">');
                  for (let e = 0, n = this.errors.length; e < n; e++) {
                    const o = this.errors[e];
                    (t += '<li>'), (t += `<a href="#${this.escapeHtml(o.fieldName)}">`), (t += this.escapeHtml(o.message)), (t += '</a>'), (t += '</li>');
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
                    this.validate() || (t.preventDefault(), this.updateTitle(), this.showSummary(), this.showInlineErrors());
                }),
                (t.FormValidator.prototype.showInlineErrors = function () {
                  for (let t = 0, e = this.errors.length; t < e; t++) this.showInlineError(this.errors[t]);
                }),
                (t.FormValidator.prototype.showInlineError = function (e) {
                  const n = `${e.fieldName}-error`;
                  const o = `<span class="govuk-error-message" id="${n}">${this.escapeHtml(e.message)}</span>`;
                  const i = $(`#${e.fieldName}`);
                  const r = i.parents('.govuk-form-group');
                  const a = r.find('label');
                  const s = r.find('legend');
                  const l = r.find('fieldset');
                  r.addClass('govuk-form-group--error'),
                    s.length
                      ? (s.after(o), r.attr('aria-invalid', 'true'), t.addAttributeValue(l[0], 'aria-describedby', n))
                      : (a.after(o), i.attr('aria-invalid', 'true'), t.addAttributeValue(i[0], 'aria-describedby', n));
                }),
                (t.FormValidator.prototype.removeInlineErrors = function () {
                  for (let t = 0; t < this.errors.length; t++) this.removeInlineError(this.errors[t]);
                }),
                (t.FormValidator.prototype.removeInlineError = function (e) {
                  const n = $(`#${e.fieldName}`).parents('.govuk-form-group');
                  n.find('.govuk-error-message').remove(), n.removeClass('govuk-form-group--error'), n.find('[aria-invalid]').attr('aria-invalid', 'false');
                  const o = `${e.fieldName}-error`;
                  t.removeAttributeValue(n.find('[aria-describedby]')[0], 'aria-describedby', o);
                }),
                (t.FormValidator.prototype.addValidator = function (t, e) {
                  this.validators.push({ fieldName: t, rules: e, field: this.form.elements[t] });
                }),
                (t.FormValidator.prototype.validate = function () {
                  this.errors = [];
                  let t;
                  let e;
                  let n = null;
                  let o = !0;
                  for (t = 0; t < this.validators.length; t++)
                    for (n = this.validators[t], e = 0; e < n.rules.length; e++) {
                      if (typeof (o = n.rules[e].method(n.field, n.rules[e].params)) === 'boolean' && !o) {
                        this.errors.push({ fieldName: n.fieldName, message: n.rules[e].message });
                        break;
                      }
                      if (typeof o === 'string') {
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
                      (this.container = $(this.params.container)),
                      this.container.addClass('moj-multi-file-upload--enhanced'),
                      (this.feedbackContainer = this.container.find('.moj-multi-file__uploaded-files')),
                      this.setupFileInput(),
                      this.setupDropzone(),
                      this.setupLabel(),
                      this.setupStatusBox(),
                      this.container.on('click', '.moj-multi-file-upload__delete', $.proxy(this, 'onFileDeleteClick'));
                  }),
                  (t.MultiFileUpload.prototype.setupDropzone = function () {
                    this.fileInput.wrap('<div class="moj-multi-file-upload__dropzone" />'),
                      (this.dropzone = this.container.find('.moj-multi-file-upload__dropzone')),
                      this.dropzone.on('dragover', $.proxy(this, 'onDragOver')),
                      this.dropzone.on('dragleave', $.proxy(this, 'onDragLeave')),
                      this.dropzone.on('drop', $.proxy(this, 'onDrop'));
                  }),
                  (t.MultiFileUpload.prototype.setupLabel = function () {
                    (this.label = $(
                      `<label for="${this.fileInput[0].id}" class="govuk-button govuk-button--secondary">${this.params.dropzoneButtonText}</label>`,
                    )),
                      this.dropzone.append(`<p class="govuk-body">${this.params.dropzoneHintText}</p>`),
                      this.dropzone.append(this.label);
                  }),
                  (t.MultiFileUpload.prototype.setupFileInput = function () {
                    (this.fileInput = this.container.find('.moj-multi-file-upload__input')),
                      this.fileInput.on('change', $.proxy(this, 'onFileChange')),
                      this.fileInput.on('focus', $.proxy(this, 'onFileFocus')),
                      this.fileInput.on('blur', $.proxy(this, 'onFileBlur'));
                  }),
                  (t.MultiFileUpload.prototype.setupStatusBox = function () {
                    (this.status = $('<div aria-live="polite" role="status" class="govuk-visually-hidden" />')), this.dropzone.append(this.status);
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
                    return `<span class="moj-multi-file-upload__success"> <svg class="moj-banner__icon" fill="currentColor" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" height="25" width="25"><path d="M25,6.2L8.7,23.2L0,14.1l4-4.2l4.7,4.9L21,2L25,6.2z"/></svg> ${t.messageHtml}</span>`;
                  }),
                  (t.MultiFileUpload.prototype.getErrorHtml = function (t) {
                    return `<span class="moj-multi-file-upload__error"> <svg class="moj-banner__icon" fill="currentColor" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" height="25" width="25"><path d="M13.6,15.4h-2.3v-4.5h2.3V15.4z M13.6,19.8h-2.3v-2.2h2.3V19.8z M0,23.2h25L12.5,2L0,23.2z"/></svg> ${t.message}</span>`;
                  }),
                  (t.MultiFileUpload.prototype.getFileRowHtml = function (t) {
                    let e = '';
                    return (
                      (e += '<div class="govuk-summary-list__row moj-multi-file-upload__row">'),
                      (e += '  <div class="govuk-summary-list__value moj-multi-file-upload__message">'),
                      (e += `<span class="moj-multi-file-upload__filename">${t.name}</span>`),
                      (e += '<span class="moj-multi-file-upload__progress">0%</span>'),
                      (e += '  </div>'),
                      (e += '  <div class="govuk-summary-list__actions moj-multi-file-upload__actions"></div>'),
                      (e += '</div>')
                    );
                  }),
                  (t.MultiFileUpload.prototype.getDeleteButtonHtml = function (t) {
                    let e = `<button class="moj-multi-file-upload__delete govuk-button govuk-button--secondary govuk-!-margin-bottom-0" type="button" name="delete" value="${t.filename}">`;
                    return (e += `Delete <span class="govuk-visually-hidden">${t.originalname}</span>`), (e += '</button>');
                  }),
                  (t.MultiFileUpload.prototype.uploadFile = function (t) {
                    this.params.uploadFileEntryHook(this, t);
                    const e = new FormData();
                    e.append('documents', t);
                    const n = $(this.getFileRowHtml(t));
                    this.feedbackContainer.find('.moj-multi-file-upload__list').append(n),
                      $.ajax({
                        url: this.params.uploadUrl,
                        type: 'post',
                        data: e,
                        processData: !1,
                        contentType: !1,
                        success: $.proxy(function (e) {
                          e.error
                            ? (n.find('.moj-multi-file-upload__message').html(this.getErrorHtml(e.error)), this.status.html(e.error.message))
                            : (n.find('.moj-multi-file-upload__message').html(this.getSuccessHtml(e.success)), this.status.html(e.success.messageText)),
                            n.find('.moj-multi-file-upload__actions').append(this.getDeleteButtonHtml(e.file)),
                            this.params.uploadFileExitHook(this, t, e);
                        }, this),
                        error: $.proxy(function (e, n, o) {
                          this.params.uploadFileErrorHook(this, t, e, n, o);
                        }, this),
                        xhr() {
                          const t = new XMLHttpRequest();
                          return (
                            t.upload.addEventListener(
                              'progress',
                              function (t) {
                                if (t.lengthComputable) {
                                  let e = t.loaded / t.total;
                                  (e = parseInt(100 * e, 10)), n.find('.moj-multi-file-upload__progress').text(` ${e}%`);
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
                    const e = $(t.currentTarget);
                    const n = {};
                    (n[e[0].name] = e[0].value),
                      $.ajax({
                        url: this.params.deleteUrl,
                        type: 'post',
                        dataType: 'json',
                        data: n,
                        success: $.proxy(function (t) {
                          t.error ||
                            (e.parents('.moj-multi-file-upload__row').remove(),
                            this.feedbackContainer.find('.moj-multi-file-upload__row').length === 0 && this.feedbackContainer.addClass('moj-hidden')),
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
                  let t = '';
                  return (
                    (t += '<div class="govuk-checkboxes__item govuk-checkboxes--small moj-multi-select__checkbox">'),
                    (t += '  <input type="checkbox" class="govuk-checkboxes__input" id="checkboxes-all">'),
                    (t += '  <label class="govuk-label govuk-checkboxes__label moj-multi-select__toggle-label" for="checkboxes-all">'),
                    (t += '    <span class="govuk-visually-hidden">Select all</span>'),
                    (t += '  </label>'),
                    (t += '</div>')
                  );
                }),
                (t.MultiSelect.prototype.onButtonClick = function (t) {
                  this.checked ? (this.uncheckAll(), (this.toggleButton[0].checked = !1)) : (this.checkAll(), (this.toggleButton[0].checked = !0));
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
                    ? this.checkboxes.filter(':checked').length === this.checkboxes.length && ((this.toggleButton[0].checked = !0), (this.checked = !0))
                    : ((this.toggleButton[0].checked = !1), (this.checked = !1));
                }),
                (t.PasswordReveal = function (t) {
                  this.el = t;
                  const e = $(this.el);
                  e.data('moj-password-reveal-initialised') ||
                    (e.data('moj-password-reveal-initialised', !0),
                    e.attr('spellcheck', 'false'),
                    e.wrap('<div class="moj-password-reveal"></div>'),
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
                  this.el.type === 'password'
                    ? ((this.el.type = 'text'), this.button.html('Hide <span class="govuk-visually-hidden">password</span>'))
                    : ((this.el.type = 'password'), this.button.html('Show <span class="govuk-visually-hidden">password</span>'));
                }),
                'contentEditable' in document.documentElement &&
                  ((t.RichTextEditor = function (t) {
                    (this.options = t),
                      (this.options.toolbar = this.options.toolbar || { bold: !1, italic: !1, underline: !1, bullets: !0, numbers: !0 }),
                      (this.textarea = this.options.textarea),
                      (this.container = $(this.textarea).parent()),
                      this.container.data('moj-rich-text-editor-initialised') ||
                        (this.container.data('moj-rich-text-editor-initialised', !0),
                        this.createToolbar(),
                        this.hideDefault(),
                        this.configureToolbar(),
                        (this.keys = { left: 37, right: 39, up: 38, down: 40 }),
                        this.container.on('click', '.moj-rich-text-editor__toolbar-button', $.proxy(this, 'onButtonClick')),
                        this.container.find('.moj-rich-text-editor__content').on('input', $.proxy(this, 'onEditorInput')),
                        this.container.find('label').on('click', $.proxy(this, 'onLabelClick')),
                        this.toolbar.on('keydown', $.proxy(this, 'onToolbarKeydown')));
                  }),
                  (t.RichTextEditor.prototype.onToolbarKeydown = function (t) {
                    let e;
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
                    let t = '';
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
                    return `${this.getToolbarHtml()}<div class="govuk-textarea moj-rich-text-editor__content" contenteditable="true" spellcheck="false"></div>`;
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
                  if (
                    ((this.options = t),
                    (this.container = $(this.options.search.container)),
                    (this.toggleButtonContainer = $(this.options.toggleButton.container)),
                    this.container.data('moj-search-toggle-initialised'))
                  )
                    return;
                  this.container.data('moj-search-toggle-initialised', !0);
                  const e =
                    '<svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="moj-search-toggle__button__icon"><path d="M7.433,12.5790048 C6.06762625,12.5808611 4.75763941,12.0392925 3.79217348,11.0738265 C2.82670755,10.1083606 2.28513891,8.79837375 2.28699522,7.433 C2.28513891,6.06762625 2.82670755,4.75763941 3.79217348,3.79217348 C4.75763941,2.82670755 6.06762625,2.28513891 7.433,2.28699522 C8.79837375,2.28513891 10.1083606,2.82670755 11.0738265,3.79217348 C12.0392925,4.75763941 12.5808611,6.06762625 12.5790048,7.433 C12.5808611,8.79837375 12.0392925,10.1083606 11.0738265,11.0738265 C10.1083606,12.0392925 8.79837375,12.5808611 7.433,12.5790048 L7.433,12.5790048 Z M14.293,12.579 L13.391,12.579 L13.071,12.269 C14.2300759,10.9245158 14.8671539,9.20813198 14.866,7.433 C14.866,3.32786745 11.5381325,-1.65045755e-15 7.433,-1.65045755e-15 C3.32786745,-1.65045755e-15 -1.65045755e-15,3.32786745 -1.65045755e-15,7.433 C-1.65045755e-15,11.5381325 3.32786745,14.866 7.433,14.866 C9.208604,14.8671159 10.9253982,14.2296624 12.27,13.07 L12.579,13.39 L12.579,14.294 L18.296,20 L20,18.296 L14.294,12.579 L14.293,12.579 Z"></path></svg>';
                  (this.toggleButton = $(
                    `<button class="moj-search-toggle__button" type="button" aria-haspopup="true" aria-expanded="false">${this.options.toggleButton.text}${e}</button>`,
                  )),
                    this.toggleButton.on('click', $.proxy(this, 'onToggleButtonClick')),
                    this.toggleButtonContainer.append(this.toggleButton),
                    $(document).on('click', this.onDocumentClick.bind(this)),
                    $(document).on('focusin', this.onDocumentClick.bind(this));
                }),
                (t.SearchToggle.prototype.showMenu = function () {
                  this.toggleButton.attr('aria-expanded', 'true'), this.container.removeClass('moj-js-hidden'), this.container.find('input').first().focus();
                }),
                (t.SearchToggle.prototype.hideMenu = function () {
                  this.container.addClass('moj-js-hidden'), this.toggleButton.attr('aria-expanded', 'false');
                }),
                (t.SearchToggle.prototype.onToggleButtonClick = function () {
                  this.toggleButton.attr('aria-expanded') == 'false' ? this.showMenu() : this.hideMenu();
                }),
                (t.SearchToggle.prototype.onDocumentClick = function (t) {
                  $.contains(this.toggleButtonContainer[0], t.target) || $.contains(this.container[0], t.target) || this.hideMenu();
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
                  for (var t, e = this.table.find('thead th'), n = 0; n < e.length; n++) (t = $(e[n])).attr('aria-sort') && this.createHeadingButton(t, n);
                }),
                (t.SortableTable.prototype.createHeadingButton = function (t, e) {
                  const n = t.text();
                  const o = $(`<button type="button" data-index="${e}">${n}</button>`);
                  t.text(''), t.append(o);
                }),
                (t.SortableTable.prototype.createStatusBox = function () {
                  (this.status = $('<div aria-live="polite" role="status" aria-atomic="true" class="govuk-visually-hidden" />')),
                    this.table.parent().append(this.status);
                }),
                (t.SortableTable.prototype.initialiseSortedColumn = function () {
                  const t = this.getTableRowsArray();
                  this.table
                    .find('th')
                    .filter('[aria-sort="ascending"], [aria-sort="descending"]')
                    .first()
                    .each((e, n) => {
                      const o = $(n).attr('aria-sort');
                      const i = $(n).find('button').attr('data-index');
                      const r = this.sort(t, i, o);
                      this.addRows(r);
                    });
                }),
                (t.SortableTable.prototype.onSortButtonClick = function (t) {
                  let e;
                  const n = t.currentTarget.getAttribute('data-index');
                  const o = $(t.currentTarget).parent().attr('aria-sort');
                  e = o === 'none' || o === 'descending' ? 'ascending' : 'descending';
                  const i = this.getTableRowsArray();
                  const r = this.sort(i, n, e);
                  this.addRows(r), this.removeButtonStates(), this.updateButtonState($(t.currentTarget), e);
                }),
                (t.SortableTable.prototype.updateButtonState = function (t, e) {
                  t.parent().attr('aria-sort', e);
                  let n = this.statusMessage;
                  (n = (n = n.replace(/%heading%/, t.text())).replace(/%direction%/, this[`${e}Text`])), this.status.text(n);
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
                    function (t, o) {
                      const i = $(t).find('td,th').eq(e);
                      const r = $(o).find('td,th').eq(e);
                      const a = n === 'ascending' ? this.getCellValue(i) : this.getCellValue(r);
                      const s = n === 'ascending' ? this.getCellValue(r) : this.getCellValue(i);
                      return typeof a === 'string' || typeof s === 'string' ? a.toString().localeCompare(s.toString()) : a - s;
                    }.bind(this),
                  );
                }),
                (t.SortableTable.prototype.getCellValue = function (t) {
                  const e = t.attr('data-sort-value') || t.html();
                  const n = parseFloat(e);
                  return isNaN(n) ? e : n;
                }),
                t
              );
            }) === 'function'
              ? n.apply(e, o)
              : n) || (t.exports = i);
    },
    692(t, e) {
      let n;
      !(function (e, n) {
        typeof t.exports === 'object'
          ? (t.exports = e.document
              ? n(e, !0)
              : function (t) {
                  if (!t.document) throw new Error('jQuery requires a window with a document');
                  return n(t);
                })
          : n(e);
      })(typeof window !== 'undefined' ? window : this, function (o, i) {
        let r = [];
        const a = Object.getPrototypeOf;
        const s = r.slice;
        const l = r.flat
          ? function (t) {
              return r.flat.call(t);
            }
          : function (t) {
              return r.concat.apply([], t);
            };
        const u = r.push;
        const c = r.indexOf;
        const d = {};
        const p = d.toString;
        const h = d.hasOwnProperty;
        const f = h.toString;
        const g = f.call(Object);
        const m = {};
        const y = function (t) {
          return typeof t === 'function' && typeof t.nodeType !== 'number' && typeof t.item !== 'function';
        };
        const v = function (t) {
          return t != null && t === t.window;
        };
        const b = o.document;
        const x = { type: !0, src: !0, nonce: !0, noModule: !0 };
        function k(t, e, n) {
          let o;
          let i;
          const r = (n = n || b).createElement('script');
          if (((r.text = t), e)) for (o in x) (i = e[o] || (e.getAttribute && e.getAttribute(o))) && r.setAttribute(o, i);
          n.head.appendChild(r).parentNode.removeChild(r);
        }
        function w(t) {
          return t == null ? `${t}` : typeof t === 'object' || typeof t === 'function' ? d[p.call(t)] || 'object' : typeof t;
        }
        const D = '3.7.1';
        const T = /HTML$/i;
        const C = function (t, e) {
          return new C.fn.init(t, e);
        };
        function j(t) {
          const e = !!t && 'length' in t && t.length;
          const n = w(t);
          return !y(t) && !v(t) && (n === 'array' || e === 0 || (typeof e === 'number' && e > 0 && e - 1 in t));
        }
        function S(t, e) {
          return t.nodeName && t.nodeName.toLowerCase() === e.toLowerCase();
        }
        (C.fn = C.prototype =
          {
            jquery: D,
            constructor: C,
            length: 0,
            toArray() {
              return s.call(this);
            },
            get(t) {
              return t == null ? s.call(this) : t < 0 ? this[t + this.length] : this[t];
            },
            pushStack(t) {
              const e = C.merge(this.constructor(), t);
              return (e.prevObject = this), e;
            },
            each(t) {
              return C.each(this, t);
            },
            map(t) {
              return this.pushStack(
                C.map(this, function (e, n) {
                  return t.call(e, n, e);
                }),
              );
            },
            slice() {
              return this.pushStack(s.apply(this, arguments));
            },
            first() {
              return this.eq(0);
            },
            last() {
              return this.eq(-1);
            },
            even() {
              return this.pushStack(
                C.grep(this, function (t, e) {
                  return (e + 1) % 2;
                }),
              );
            },
            odd() {
              return this.pushStack(
                C.grep(this, function (t, e) {
                  return e % 2;
                }),
              );
            },
            eq(t) {
              const e = this.length;
              const n = +t + (t < 0 ? e : 0);
              return this.pushStack(n >= 0 && n < e ? [this[n]] : []);
            },
            end() {
              return this.prevObject || this.constructor();
            },
            push: u,
            sort: r.sort,
            splice: r.splice,
          }),
          (C.extend = C.fn.extend =
            function () {
              let t;
              let e;
              let n;
              let o;
              let i;
              let r;
              let a = arguments[0] || {};
              let s = 1;
              const l = arguments.length;
              let u = !1;
              for (
                typeof a === 'boolean' && ((u = a), (a = arguments[s] || {}), s++), typeof a === 'object' || y(a) || (a = {}), s === l && ((a = this), s--);
                s < l;
                s++
              )
                if ((t = arguments[s]) != null)
                  for (e in t)
                    (o = t[e]),
                      e !== '__proto__' &&
                        a !== o &&
                        (u && o && (C.isPlainObject(o) || (i = Array.isArray(o)))
                          ? ((n = a[e]), (r = i && !Array.isArray(n) ? [] : i || C.isPlainObject(n) ? n : {}), (i = !1), (a[e] = C.extend(u, r, o)))
                          : void 0 !== o && (a[e] = o));
              return a;
            }),
          C.extend({
            expando: `jQuery${(D + Math.random()).replace(/\D/g, '')}`,
            isReady: !0,
            error(t) {
              throw new Error(t);
            },
            noop() {},
            isPlainObject(t) {
              let e;
              let n;
              return (
                !(!t || p.call(t) !== '[object Object]') &&
                (!(e = a(t)) || (typeof (n = h.call(e, 'constructor') && e.constructor) === 'function' && f.call(n) === g))
              );
            },
            isEmptyObject(t) {
              let e;
              for (e in t) return !1;
              return !0;
            },
            globalEval(t, e, n) {
              k(t, { nonce: e && e.nonce }, n);
            },
            each(t, e) {
              let n;
              let o = 0;
              if (j(t)) for (n = t.length; o < n && !1 !== e.call(t[o], o, t[o]); o++);
              else for (o in t) if (!1 === e.call(t[o], o, t[o])) break;
              return t;
            },
            text(t) {
              let e;
              let n = '';
              let o = 0;
              const i = t.nodeType;
              if (!i) for (; (e = t[o++]); ) n += C.text(e);
              return i === 1 || i === 11 ? t.textContent : i === 9 ? t.documentElement.textContent : i === 3 || i === 4 ? t.nodeValue : n;
            },
            makeArray(t, e) {
              const n = e || [];
              return t != null && (j(Object(t)) ? C.merge(n, typeof t === 'string' ? [t] : t) : u.call(n, t)), n;
            },
            inArray(t, e, n) {
              return e == null ? -1 : c.call(e, t, n);
            },
            isXMLDoc(t) {
              const e = t && t.namespaceURI;
              const n = t && (t.ownerDocument || t).documentElement;
              return !T.test(e || (n && n.nodeName) || 'HTML');
            },
            merge(t, e) {
              for (var n = +e.length, o = 0, i = t.length; o < n; o++) t[i++] = e[o];
              return (t.length = i), t;
            },
            grep(t, e, n) {
              for (var o = [], i = 0, r = t.length, a = !n; i < r; i++) !e(t[i], i) !== a && o.push(t[i]);
              return o;
            },
            map(t, e, n) {
              let o;
              let i;
              let r = 0;
              const a = [];
              if (j(t)) for (o = t.length; r < o; r++) (i = e(t[r], r, n)) != null && a.push(i);
              else for (r in t) (i = e(t[r], r, n)) != null && a.push(i);
              return l(a);
            },
            guid: 1,
            support: m,
          }),
          typeof Symbol === 'function' && (C.fn[Symbol.iterator] = r[Symbol.iterator]),
          C.each('Boolean Number String Function Array Date RegExp Object Error Symbol'.split(' '), function (t, e) {
            d[`[object ${e}]`] = e.toLowerCase();
          });
        const E = r.pop;
        const A = r.sort;
        const $ = r.splice;
        const L = '[\\x20\\t\\r\\n\\f]';
        const _ = new RegExp(`^${L}+|((?:^|[^\\\\])(?:\\\\.)*)${L}+$`, 'g');
        C.contains = function (t, e) {
          const n = e && e.parentNode;
          return t === n || !(!n || n.nodeType !== 1 || !(t.contains ? t.contains(n) : t.compareDocumentPosition && 16 & t.compareDocumentPosition(n)));
        };
        const M = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;
        function B(t, e) {
          return e ? (t === '\0' ? '�' : `${t.slice(0, -1)}\\${t.charCodeAt(t.length - 1).toString(16)} `) : `\\${t}`;
        }
        C.escapeSelector = function (t) {
          return `${t}`.replace(M, B);
        };
        const F = b;
        const H = u;
        !(function () {
          let t;
          let e;
          let n;
          let i;
          let a;
          let l;
          let u;
          let d;
          let p;
          let f;
          let g = H;
          const y = C.expando;
          let v = 0;
          let b = 0;
          const x = tt();
          const k = tt();
          const w = tt();
          const D = tt();
          let T = function (t, e) {
            return t === e && (a = !0), 0;
          };
          const j = 'checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped';
          const M = `(?:\\\\[\\da-fA-F]{1,6}${L}?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+`;
          const B = `\\[${L}*(${M})(?:${L}*([*^$|!~]?=)${L}*(?:'((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)"|(${M}))|)${L}*\\]`;
          const N = `:(${M})(?:\\((('((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|${B})*)|.*)\\)|)`;
          const q = new RegExp(`${L}+`, 'g');
          const O = new RegExp(`^${L}*,${L}*`);
          const R = new RegExp(`^${L}*([>+~]|${L})${L}*`);
          const P = new RegExp(`${L}|>`);
          const I = new RegExp(N);
          const W = new RegExp(`^${M}$`);
          const U = {
            ID: new RegExp(`^#(${M})`),
            CLASS: new RegExp(`^\\.(${M})`),
            TAG: new RegExp(`^(${M}|[*])`),
            ATTR: new RegExp(`^${B}`),
            PSEUDO: new RegExp(`^${N}`),
            CHILD: new RegExp(
              `^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(${L}*(even|odd|(([+-]|)(\\d*)n|)${L}*(?:([+-]|)${L}*(\\d+)|))${L}*\\)|)`,
              'i',
            ),
            bool: new RegExp(`^(?:${j})$`, 'i'),
            needsContext: new RegExp(`^${L}*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(${L}*((?:-\\d)?\\d*)${L}*\\)|)(?=[^-]|$)`, 'i'),
          };
          const V = /^(?:input|select|textarea|button)$/i;
          const z = /^h\d$/i;
          const Y = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
          const X = /[+~]/;
          const Z = new RegExp(`\\\\[\\da-fA-F]{1,6}${L}?|\\\\([^\\r\\n\\f])`, 'g');
          const K = function (t, e) {
            const n = `0x${t.slice(1)}` - 65536;
            return e || (n < 0 ? String.fromCharCode(n + 65536) : String.fromCharCode((n >> 10) | 55296, (1023 & n) | 56320));
          };
          const J = function () {
            lt();
          };
          const G = pt(
            function (t) {
              return !0 === t.disabled && S(t, 'fieldset');
            },
            { dir: 'parentNode', next: 'legend' },
          );
          try {
            g.apply((r = s.call(F.childNodes)), F.childNodes), r[F.childNodes.length].nodeType;
          } catch (t) {
            g = {
              apply(t, e) {
                H.apply(t, s.call(e));
              },
              call(t) {
                H.apply(t, s.call(arguments, 1));
              },
            };
          }
          function Q(t, e, n, o) {
            let i;
            let r;
            let a;
            let s;
            let u;
            let c;
            let h;
            let f = e && e.ownerDocument;
            const v = e ? e.nodeType : 9;
            if (((n = n || []), typeof t !== 'string' || !t || (v !== 1 && v !== 9 && v !== 11))) return n;
            if (!o && (lt(e), (e = e || l), d)) {
              if (v !== 11 && (u = Y.exec(t)))
                if ((i = u[1])) {
                  if (v === 9) {
                    if (!(a = e.getElementById(i))) return n;
                    if (a.id === i) return g.call(n, a), n;
                  } else if (f && (a = f.getElementById(i)) && Q.contains(e, a) && a.id === i) return g.call(n, a), n;
                } else {
                  if (u[2]) return g.apply(n, e.getElementsByTagName(t)), n;
                  if ((i = u[3]) && e.getElementsByClassName) return g.apply(n, e.getElementsByClassName(i)), n;
                }
              if (!(D[`${t} `] || (p && p.test(t)))) {
                if (((h = t), (f = e), v === 1 && (P.test(t) || R.test(t)))) {
                  for (
                    ((f = (X.test(t) && st(e.parentNode)) || e) == e && m.scope) ||
                      ((s = e.getAttribute('id')) ? (s = C.escapeSelector(s)) : e.setAttribute('id', (s = y))),
                      r = (c = ct(t)).length;
                    r--;

                  )
                    c[r] = `${s ? `#${s}` : ':scope'} ${dt(c[r])}`;
                  h = c.join(',');
                }
                try {
                  return g.apply(n, f.querySelectorAll(h)), n;
                } catch (e) {
                  D(t, !0);
                } finally {
                  s === y && e.removeAttribute('id');
                }
              }
            }
            return vt(t.replace(_, '$1'), e, n, o);
          }
          function tt() {
            const t = [];
            return function n(o, i) {
              return t.push(`${o} `) > e.cacheLength && delete n[t.shift()], (n[`${o} `] = i);
            };
          }
          function et(t) {
            return (t[y] = !0), t;
          }
          function nt(t) {
            let e = l.createElement('fieldset');
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
              return S(e, 'input') && e.type === t;
            };
          }
          function it(t) {
            return function (e) {
              return (S(e, 'input') || S(e, 'button')) && e.type === t;
            };
          }
          function rt(t) {
            return function (e) {
              return 'form' in e
                ? e.parentNode && !1 === e.disabled
                  ? 'label' in e
                    ? 'label' in e.parentNode
                      ? e.parentNode.disabled === t
                      : e.disabled === t
                    : e.isDisabled === t || (e.isDisabled !== !t && G(e) === t)
                  : e.disabled === t
                : 'label' in e && e.disabled === t;
            };
          }
          function at(t) {
            return et(function (e) {
              return (
                (e = +e),
                et(function (n, o) {
                  for (var i, r = t([], n.length, e), a = r.length; a--; ) n[(i = r[a])] && (n[i] = !(o[i] = n[i]));
                })
              );
            });
          }
          function st(t) {
            return t && void 0 !== t.getElementsByTagName && t;
          }
          function lt(t) {
            let n;
            const o = t ? t.ownerDocument || t : F;
            return o != l && o.nodeType === 9 && o.documentElement
              ? ((u = (l = o).documentElement),
                (d = !C.isXMLDoc(l)),
                (f = u.matches || u.webkitMatchesSelector || u.msMatchesSelector),
                u.msMatchesSelector && F != l && (n = l.defaultView) && n.top !== n && n.addEventListener('unload', J),
                (m.getById = nt(function (t) {
                  return (u.appendChild(t).id = C.expando), !l.getElementsByName || !l.getElementsByName(C.expando).length;
                })),
                (m.disconnectedMatch = nt(function (t) {
                  return f.call(t, '*');
                })),
                (m.scope = nt(function () {
                  return l.querySelectorAll(':scope');
                })),
                (m.cssHas = nt(function () {
                  try {
                    return l.querySelector(':has(*,:jqfake)'), !1;
                  } catch (t) {
                    return !0;
                  }
                })),
                m.getById
                  ? ((e.filter.ID = function (t) {
                      const e = t.replace(Z, K);
                      return function (t) {
                        return t.getAttribute('id') === e;
                      };
                    }),
                    (e.find.ID = function (t, e) {
                      if (void 0 !== e.getElementById && d) {
                        const n = e.getElementById(t);
                        return n ? [n] : [];
                      }
                    }))
                  : ((e.filter.ID = function (t) {
                      const e = t.replace(Z, K);
                      return function (t) {
                        const n = void 0 !== t.getAttributeNode && t.getAttributeNode('id');
                        return n && n.value === e;
                      };
                    }),
                    (e.find.ID = function (t, e) {
                      if (void 0 !== e.getElementById && d) {
                        let n;
                        let o;
                        let i;
                        let r = e.getElementById(t);
                        if (r) {
                          if ((n = r.getAttributeNode('id')) && n.value === t) return [r];
                          for (i = e.getElementsByName(t), o = 0; (r = i[o++]); ) if ((n = r.getAttributeNode('id')) && n.value === t) return [r];
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
                  let e;
                  (u.appendChild(
                    t,
                  ).innerHTML = `<a id='${y}' href='' disabled='disabled'></a><select id='${y}-\r\\' disabled='disabled'><option selected=''></option></select>`),
                    t.querySelectorAll('[selected]').length || p.push(`\\[${L}*(?:value|${j})`),
                    t.querySelectorAll(`[id~=${y}-]`).length || p.push('~='),
                    t.querySelectorAll(`a#${y}+*`).length || p.push('.#.+[+~]'),
                    t.querySelectorAll(':checked').length || p.push(':checked'),
                    (e = l.createElement('input')).setAttribute('type', 'hidden'),
                    t.appendChild(e).setAttribute('name', 'D'),
                    (u.appendChild(t).disabled = !0),
                    t.querySelectorAll(':disabled').length !== 2 && p.push(':enabled', ':disabled'),
                    (e = l.createElement('input')).setAttribute('name', ''),
                    t.appendChild(e),
                    t.querySelectorAll("[name='']").length || p.push(`\\[${L}*name${L}*=${L}*(?:''|"")`);
                }),
                m.cssHas || p.push(':has'),
                (p = p.length && new RegExp(p.join('|'))),
                (T = function (t, e) {
                  if (t === e) return (a = !0), 0;
                  let n = !t.compareDocumentPosition - !e.compareDocumentPosition;
                  return (
                    n ||
                    (1 & (n = (t.ownerDocument || t) == (e.ownerDocument || e) ? t.compareDocumentPosition(e) : 1) ||
                    (!m.sortDetached && e.compareDocumentPosition(t) === n)
                      ? t === l || (t.ownerDocument == F && Q.contains(F, t))
                        ? -1
                        : e === l || (e.ownerDocument == F && Q.contains(F, e))
                        ? 1
                        : i
                        ? c.call(i, t) - c.call(i, e)
                        : 0
                      : 4 & n
                      ? -1
                      : 1)
                  );
                }),
                l)
              : l;
          }
          for (t in ((Q.matches = function (t, e) {
            return Q(t, null, null, e);
          }),
          (Q.matchesSelector = function (t, e) {
            if ((lt(t), d && !D[`${e} `] && (!p || !p.test(e))))
              try {
                const n = f.call(t, e);
                if (n || m.disconnectedMatch || (t.document && t.document.nodeType !== 11)) return n;
              } catch (t) {
                D(e, !0);
              }
            return Q(e, l, null, [t]).length > 0;
          }),
          (Q.contains = function (t, e) {
            return (t.ownerDocument || t) != l && lt(t), C.contains(t, e);
          }),
          (Q.attr = function (t, n) {
            (t.ownerDocument || t) != l && lt(t);
            const o = e.attrHandle[n.toLowerCase()];
            const i = o && h.call(e.attrHandle, n.toLowerCase()) ? o(t, n, !d) : void 0;
            return void 0 !== i ? i : t.getAttribute(n);
          }),
          (Q.error = function (t) {
            throw new Error(`Syntax error, unrecognized expression: ${t}`);
          }),
          (C.uniqueSort = function (t) {
            let e;
            const n = [];
            let o = 0;
            let r = 0;
            if (((a = !m.sortStable), (i = !m.sortStable && s.call(t, 0)), A.call(t, T), a)) {
              for (; (e = t[r++]); ) e === t[r] && (o = n.push(r));
              for (; o--; ) $.call(t, n[o], 1);
            }
            return (i = null), t;
          }),
          (C.fn.uniqueSort = function () {
            return this.pushStack(C.uniqueSort(s.apply(this)));
          }),
          (e = C.expr =
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
                ATTR(t) {
                  return (t[1] = t[1].replace(Z, K)), (t[3] = (t[3] || t[4] || t[5] || '').replace(Z, K)), t[2] === '~=' && (t[3] = ` ${t[3]} `), t.slice(0, 4);
                },
                CHILD(t) {
                  return (
                    (t[1] = t[1].toLowerCase()),
                    t[1].slice(0, 3) === 'nth'
                      ? (t[3] || Q.error(t[0]),
                        (t[4] = +(t[4] ? t[5] + (t[6] || 1) : 2 * (t[3] === 'even' || t[3] === 'odd'))),
                        (t[5] = +(t[7] + t[8] || t[3] === 'odd')))
                      : t[3] && Q.error(t[0]),
                    t
                  );
                },
                PSEUDO(t) {
                  let e;
                  const n = !t[6] && t[2];
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
                TAG(t) {
                  const e = t.replace(Z, K).toLowerCase();
                  return t === '*'
                    ? function () {
                        return !0;
                      }
                    : function (t) {
                        return S(t, e);
                      };
                },
                CLASS(t) {
                  let e = x[`${t} `];
                  return (
                    e ||
                    ((e = new RegExp(`(^|${L})${t}(${L}|$)`)) &&
                      x(t, function (t) {
                        return e.test((typeof t.className === 'string' && t.className) || (void 0 !== t.getAttribute && t.getAttribute('class')) || '');
                      }))
                  );
                },
                ATTR(t, e, n) {
                  return function (o) {
                    let i = Q.attr(o, t);
                    return i == null
                      ? e === '!='
                      : !e ||
                          ((i += ''),
                          e === '='
                            ? i === n
                            : e === '!='
                            ? i !== n
                            : e === '^='
                            ? n && i.indexOf(n) === 0
                            : e === '*='
                            ? n && i.indexOf(n) > -1
                            : e === '$='
                            ? n && i.slice(-n.length) === n
                            : e === '~='
                            ? ` ${i.replace(q, ' ')} `.indexOf(n) > -1
                            : e === '|=' && (i === n || i.slice(0, n.length + 1) === `${n}-`));
                  };
                },
                CHILD(t, e, n, o, i) {
                  const r = t.slice(0, 3) !== 'nth';
                  const a = t.slice(-4) !== 'last';
                  const s = e === 'of-type';
                  return o === 1 && i === 0
                    ? function (t) {
                        return !!t.parentNode;
                      }
                    : function (e, n, l) {
                        let u;
                        let c;
                        let d;
                        let p;
                        let h;
                        let f = r !== a ? 'nextSibling' : 'previousSibling';
                        const g = e.parentNode;
                        const m = s && e.nodeName.toLowerCase();
                        const b = !l && !s;
                        let x = !1;
                        if (g) {
                          if (r) {
                            for (; f; ) {
                              for (d = e; (d = d[f]); ) if (s ? S(d, m) : d.nodeType === 1) return !1;
                              h = f = t === 'only' && !h && 'nextSibling';
                            }
                            return !0;
                          }
                          if (((h = [a ? g.firstChild : g.lastChild]), a && b)) {
                            for (
                              x = (p = (u = (c = g[y] || (g[y] = {}))[t] || [])[0] === v && u[1]) && u[2], d = p && g.childNodes[p];
                              (d = (++p && d && d[f]) || (x = p = 0) || h.pop());

                            )
                              if (d.nodeType === 1 && ++x && d === e) {
                                c[t] = [v, p, x];
                                break;
                              }
                          } else if ((b && (x = p = (u = (c = e[y] || (e[y] = {}))[t] || [])[0] === v && u[1]), !1 === x))
                            for (
                              ;
                              (d = (++p && d && d[f]) || (x = p = 0) || h.pop()) &&
                              (!(s ? S(d, m) : d.nodeType === 1) || !++x || (b && ((c = d[y] || (d[y] = {}))[t] = [v, x]), d !== e));

                            );
                          return (x -= i) === o || (x % o === 0 && x / o >= 0);
                        }
                      };
                },
                PSEUDO(t, n) {
                  let o;
                  const i = e.pseudos[t] || e.setFilters[t.toLowerCase()] || Q.error(`unsupported pseudo: ${t}`);
                  return i[y]
                    ? i(n)
                    : i.length > 1
                    ? ((o = [t, t, '', n]),
                      e.setFilters.hasOwnProperty(t.toLowerCase())
                        ? et(function (t, e) {
                            for (var o, r = i(t, n), a = r.length; a--; ) t[(o = c.call(t, r[a]))] = !(e[o] = r[a]);
                          })
                        : function (t) {
                            return i(t, 0, o);
                          })
                    : i;
                },
              },
              pseudos: {
                not: et(function (t) {
                  const e = [];
                  const n = [];
                  const o = yt(t.replace(_, '$1'));
                  return o[y]
                    ? et(function (t, e, n, i) {
                        for (var r, a = o(t, null, i, []), s = t.length; s--; ) (r = a[s]) && (t[s] = !(e[s] = r));
                      })
                    : function (t, i, r) {
                        return (e[0] = t), o(e, null, r, n), (e[0] = null), !n.pop();
                      };
                }),
                has: et(function (t) {
                  return function (e) {
                    return Q(t, e).length > 0;
                  };
                }),
                contains: et(function (t) {
                  return (
                    (t = t.replace(Z, K)),
                    function (e) {
                      return (e.textContent || C.text(e)).indexOf(t) > -1;
                    }
                  );
                }),
                lang: et(function (t) {
                  return (
                    W.test(t || '') || Q.error(`unsupported lang: ${t}`),
                    (t = t.replace(Z, K).toLowerCase()),
                    function (e) {
                      let n;
                      do {
                        if ((n = d ? e.lang : e.getAttribute('xml:lang') || e.getAttribute('lang')))
                          return (n = n.toLowerCase()) === t || n.indexOf(`${t}-`) === 0;
                      } while ((e = e.parentNode) && e.nodeType === 1);
                      return !1;
                    }
                  );
                }),
                target(t) {
                  const e = o.location && o.location.hash;
                  return e && e.slice(1) === t.id;
                },
                root(t) {
                  return t === u;
                },
                focus(t) {
                  return (
                    t ===
                      (function () {
                        try {
                          return l.activeElement;
                        } catch (t) {}
                      })() &&
                    l.hasFocus() &&
                    !!(t.type || t.href || ~t.tabIndex)
                  );
                },
                enabled: rt(!1),
                disabled: rt(!0),
                checked(t) {
                  return (S(t, 'input') && !!t.checked) || (S(t, 'option') && !!t.selected);
                },
                selected(t) {
                  return t.parentNode && t.parentNode.selectedIndex, !0 === t.selected;
                },
                empty(t) {
                  for (t = t.firstChild; t; t = t.nextSibling) if (t.nodeType < 6) return !1;
                  return !0;
                },
                parent(t) {
                  return !e.pseudos.empty(t);
                },
                header(t) {
                  return z.test(t.nodeName);
                },
                input(t) {
                  return V.test(t.nodeName);
                },
                button(t) {
                  return (S(t, 'input') && t.type === 'button') || S(t, 'button');
                },
                text(t) {
                  let e;
                  return S(t, 'input') && t.type === 'text' && ((e = t.getAttribute('type')) == null || e.toLowerCase() === 'text');
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
                  let o;
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
          for (t in { submit: !0, reset: !0 }) e.pseudos[t] = it(t);
          function ut() {}
          function ct(t, n) {
            let o;
            let i;
            let r;
            let a;
            let s;
            let l;
            let u;
            const c = k[`${t} `];
            if (c) return n ? 0 : c.slice(0);
            for (s = t, l = [], u = e.preFilter; s; ) {
              for (a in ((o && !(i = O.exec(s))) || (i && (s = s.slice(i[0].length) || s), l.push((r = []))),
              (o = !1),
              (i = R.exec(s)) && ((o = i.shift()), r.push({ value: o, type: i[0].replace(_, ' ') }), (s = s.slice(o.length))),
              e.filter))
                !(i = U[a].exec(s)) || (u[a] && !(i = u[a](i))) || ((o = i.shift()), r.push({ value: o, type: a, matches: i }), (s = s.slice(o.length)));
              if (!o) break;
            }
            return n ? s.length : s ? Q.error(t) : k(t, l).slice(0);
          }
          function dt(t) {
            for (var e = 0, n = t.length, o = ''; e < n; e++) o += t[e].value;
            return o;
          }
          function pt(t, e, n) {
            const o = e.dir;
            const i = e.next;
            const r = i || o;
            const a = n && r === 'parentNode';
            const s = b++;
            return e.first
              ? function (e, n, i) {
                  for (; (e = e[o]); ) if (e.nodeType === 1 || a) return t(e, n, i);
                  return !1;
                }
              : function (e, n, l) {
                  let u;
                  let c;
                  const d = [v, s];
                  if (l) {
                    for (; (e = e[o]); ) if ((e.nodeType === 1 || a) && t(e, n, l)) return !0;
                  } else
                    for (; (e = e[o]); )
                      if (e.nodeType === 1 || a)
                        if (((c = e[y] || (e[y] = {})), i && S(e, i))) e = e[o] || e;
                        else {
                          if ((u = c[r]) && u[0] === v && u[1] === s) return (d[2] = u[2]);
                          if (((c[r] = d), (d[2] = t(e, n, l)))) return !0;
                        }
                  return !1;
                };
          }
          function ht(t) {
            return t.length > 1
              ? function (e, n, o) {
                  for (let i = t.length; i--; ) if (!t[i](e, n, o)) return !1;
                  return !0;
                }
              : t[0];
          }
          function ft(t, e, n, o, i) {
            for (var r, a = [], s = 0, l = t.length, u = e != null; s < l; s++) (r = t[s]) && ((n && !n(r, o, i)) || (a.push(r), u && e.push(s)));
            return a;
          }
          function gt(t, e, n, o, i, r) {
            return (
              o && !o[y] && (o = gt(o)),
              i && !i[y] && (i = gt(i, r)),
              et(function (r, a, s, l) {
                let u;
                let d;
                let p;
                let h;
                const f = [];
                const m = [];
                const y = a.length;
                const v =
                  r ||
                  (function (t, e, n) {
                    for (let o = 0, i = e.length; o < i; o++) Q(t, e[o], n);
                    return n;
                  })(e || '*', s.nodeType ? [s] : s, []);
                const b = !t || (!r && e) ? v : ft(v, f, t, s, l);
                if ((n ? n(b, (h = i || (r ? t : y || o) ? [] : a), s, l) : (h = b), o))
                  for (u = ft(h, m), o(u, [], s, l), d = u.length; d--; ) (p = u[d]) && (h[m[d]] = !(b[m[d]] = p));
                if (r) {
                  if (i || t) {
                    if (i) {
                      for (u = [], d = h.length; d--; ) (p = h[d]) && u.push((b[d] = p));
                      i(null, (h = []), u, l);
                    }
                    for (d = h.length; d--; ) (p = h[d]) && (u = i ? c.call(r, p) : f[d]) > -1 && (r[u] = !(a[u] = p));
                  }
                } else (h = ft(h === a ? h.splice(y, h.length) : h)), i ? i(null, a, h, l) : g.apply(a, h);
              })
            );
          }
          function mt(t) {
            for (
              var o,
                i,
                r,
                a = t.length,
                s = e.relative[t[0].type],
                l = s || e.relative[' '],
                u = s ? 1 : 0,
                d = pt(
                  function (t) {
                    return t === o;
                  },
                  l,
                  !0,
                ),
                p = pt(
                  function (t) {
                    return c.call(o, t) > -1;
                  },
                  l,
                  !0,
                ),
                h = [
                  function (t, e, i) {
                    const r = (!s && (i || e != n)) || ((o = e).nodeType ? d(t, e, i) : p(t, e, i));
                    return (o = null), r;
                  },
                ];
              u < a;
              u++
            )
              if ((i = e.relative[t[u].type])) h = [pt(ht(h), i)];
              else {
                if ((i = e.filter[t[u].type].apply(null, t[u].matches))[y]) {
                  for (r = ++u; r < a && !e.relative[t[r].type]; r++);
                  return gt(
                    u > 1 && ht(h),
                    u > 1 && dt(t.slice(0, u - 1).concat({ value: t[u - 2].type === ' ' ? '*' : '' })).replace(_, '$1'),
                    i,
                    u < r && mt(t.slice(u, r)),
                    r < a && mt((t = t.slice(r))),
                    r < a && dt(t),
                  );
                }
                h.push(i);
              }
            return ht(h);
          }
          function yt(t, o) {
            let i;
            const r = [];
            const a = [];
            let s = w[`${t} `];
            if (!s) {
              for (o || (o = ct(t)), i = o.length; i--; ) (s = mt(o[i]))[y] ? r.push(s) : a.push(s);
              (s = w(
                t,
                (function (t, o) {
                  const i = o.length > 0;
                  const r = t.length > 0;
                  const a = function (a, s, u, c, p) {
                    let h;
                    let f;
                    let m;
                    let y = 0;
                    let b = '0';
                    const x = a && [];
                    let k = [];
                    const w = n;
                    const D = a || (r && e.find.TAG('*', p));
                    const T = (v += w == null ? 1 : Math.random() || 0.1);
                    const j = D.length;
                    for (p && (n = s == l || s || p); b !== j && (h = D[b]) != null; b++) {
                      if (r && h) {
                        for (f = 0, s || h.ownerDocument == l || (lt(h), (u = !d)); (m = t[f++]); )
                          if (m(h, s || l, u)) {
                            g.call(c, h);
                            break;
                          }
                        p && (v = T);
                      }
                      i && ((h = !m && h) && y--, a && x.push(h));
                    }
                    if (((y += b), i && b !== y)) {
                      for (f = 0; (m = o[f++]); ) m(x, k, s, u);
                      if (a) {
                        if (y > 0) for (; b--; ) x[b] || k[b] || (k[b] = E.call(c));
                        k = ft(k);
                      }
                      g.apply(c, k), p && !a && k.length > 0 && y + o.length > 1 && C.uniqueSort(c);
                    }
                    return p && ((v = T), (n = w)), x;
                  };
                  return i ? et(a) : a;
                })(a, r),
              )),
                (s.selector = t);
            }
            return s;
          }
          function vt(t, n, o, i) {
            let r;
            let a;
            let s;
            let l;
            let u;
            const c = typeof t === 'function' && t;
            const p = !i && ct((t = c.selector || t));
            if (((o = o || []), p.length === 1)) {
              if ((a = p[0] = p[0].slice(0)).length > 2 && (s = a[0]).type === 'ID' && n.nodeType === 9 && d && e.relative[a[1].type]) {
                if (!(n = (e.find.ID(s.matches[0].replace(Z, K), n) || [])[0])) return o;
                c && (n = n.parentNode), (t = t.slice(a.shift().value.length));
              }
              for (r = U.needsContext.test(t) ? 0 : a.length; r-- && ((s = a[r]), !e.relative[(l = s.type)]); )
                if ((u = e.find[l]) && (i = u(s.matches[0].replace(Z, K), (X.test(a[0].type) && st(n.parentNode)) || n))) {
                  if ((a.splice(r, 1), !(t = i.length && dt(a)))) return g.apply(o, i), o;
                  break;
                }
            }
            return (c || yt(t, p))(i, n, !d, o, !n || (X.test(t) && st(n.parentNode)) || n), o;
          }
          (ut.prototype = e.filters = e.pseudos),
            (e.setFilters = new ut()),
            (m.sortStable = y.split('').sort(T).join('') === y),
            lt(),
            (m.sortDetached = nt(function (t) {
              return 1 & t.compareDocumentPosition(l.createElement('fieldset'));
            })),
            (C.find = Q),
            (C.expr[':'] = C.expr.pseudos),
            (C.unique = C.uniqueSort),
            (Q.compile = yt),
            (Q.select = vt),
            (Q.setDocument = lt),
            (Q.tokenize = ct),
            (Q.escape = C.escapeSelector),
            (Q.getText = C.text),
            (Q.isXML = C.isXMLDoc),
            (Q.selectors = C.expr),
            (Q.support = C.support),
            (Q.uniqueSort = C.uniqueSort);
        })();
        const N = function (t, e, n) {
          for (var o = [], i = void 0 !== n; (t = t[e]) && t.nodeType !== 9; )
            if (t.nodeType === 1) {
              if (i && C(t).is(n)) break;
              o.push(t);
            }
          return o;
        };
        const q = function (t, e) {
          for (var n = []; t; t = t.nextSibling) t.nodeType === 1 && t !== e && n.push(t);
          return n;
        };
        const O = C.expr.match.needsContext;
        const R = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
        function P(t, e, n) {
          return y(e)
            ? C.grep(t, function (t, o) {
                return !!e.call(t, o, t) !== n;
              })
            : e.nodeType
            ? C.grep(t, function (t) {
                return (t === e) !== n;
              })
            : typeof e !== 'string'
            ? C.grep(t, function (t) {
                return c.call(e, t) > -1 !== n;
              })
            : C.filter(e, t, n);
        }
        (C.filter = function (t, e, n) {
          const o = e[0];
          return (
            n && (t = `:not(${t})`),
            e.length === 1 && o.nodeType === 1
              ? C.find.matchesSelector(o, t)
                ? [o]
                : []
              : C.find.matches(
                  t,
                  C.grep(e, function (t) {
                    return t.nodeType === 1;
                  }),
                )
          );
        }),
          C.fn.extend({
            find(t) {
              let e;
              let n;
              const o = this.length;
              const i = this;
              if (typeof t !== 'string')
                return this.pushStack(
                  C(t).filter(function () {
                    for (e = 0; e < o; e++) if (C.contains(i[e], this)) return !0;
                  }),
                );
              for (n = this.pushStack([]), e = 0; e < o; e++) C.find(t, i[e], n);
              return o > 1 ? C.uniqueSort(n) : n;
            },
            filter(t) {
              return this.pushStack(P(this, t || [], !1));
            },
            not(t) {
              return this.pushStack(P(this, t || [], !0));
            },
            is(t) {
              return !!P(this, typeof t === 'string' && O.test(t) ? C(t) : t || [], !1).length;
            },
          });
        let I;
        const W = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
        ((C.fn.init = function (t, e, n) {
          let o;
          let i;
          if (!t) return this;
          if (((n = n || I), typeof t === 'string')) {
            if (!(o = t[0] === '<' && t[t.length - 1] === '>' && t.length >= 3 ? [null, t, null] : W.exec(t)) || (!o[1] && e))
              return !e || e.jquery ? (e || n).find(t) : this.constructor(e).find(t);
            if (o[1]) {
              if (
                ((e = e instanceof C ? e[0] : e),
                C.merge(this, C.parseHTML(o[1], e && e.nodeType ? e.ownerDocument || e : b, !0)),
                R.test(o[1]) && C.isPlainObject(e))
              )
                for (o in e) y(this[o]) ? this[o](e[o]) : this.attr(o, e[o]);
              return this;
            }
            return (i = b.getElementById(o[2])) && ((this[0] = i), (this.length = 1)), this;
          }
          return t.nodeType ? ((this[0] = t), (this.length = 1), this) : y(t) ? (void 0 !== n.ready ? n.ready(t) : t(C)) : C.makeArray(t, this);
        }).prototype = C.fn),
          (I = C(b));
        const U = /^(?:parents|prev(?:Until|All))/;
        const V = { children: !0, contents: !0, next: !0, prev: !0 };
        function z(t, e) {
          for (; (t = t[e]) && t.nodeType !== 1; );
          return t;
        }
        C.fn.extend({
          has(t) {
            const e = C(t, this);
            const n = e.length;
            return this.filter(function () {
              for (let t = 0; t < n; t++) if (C.contains(this, e[t])) return !0;
            });
          },
          closest(t, e) {
            let n;
            let o = 0;
            const i = this.length;
            const r = [];
            const a = typeof t !== 'string' && C(t);
            if (!O.test(t))
              for (; o < i; o++)
                for (n = this[o]; n && n !== e; n = n.parentNode)
                  if (n.nodeType < 11 && (a ? a.index(n) > -1 : n.nodeType === 1 && C.find.matchesSelector(n, t))) {
                    r.push(n);
                    break;
                  }
            return this.pushStack(r.length > 1 ? C.uniqueSort(r) : r);
          },
          index(t) {
            return t
              ? typeof t === 'string'
                ? c.call(C(t), this[0])
                : c.call(this, t.jquery ? t[0] : t)
              : this[0] && this[0].parentNode
              ? this.first().prevAll().length
              : -1;
          },
          add(t, e) {
            return this.pushStack(C.uniqueSort(C.merge(this.get(), C(t, e))));
          },
          addBack(t) {
            return this.add(t == null ? this.prevObject : this.prevObject.filter(t));
          },
        }),
          C.each(
            {
              parent(t) {
                const e = t.parentNode;
                return e && e.nodeType !== 11 ? e : null;
              },
              parents(t) {
                return N(t, 'parentNode');
              },
              parentsUntil(t, e, n) {
                return N(t, 'parentNode', n);
              },
              next(t) {
                return z(t, 'nextSibling');
              },
              prev(t) {
                return z(t, 'previousSibling');
              },
              nextAll(t) {
                return N(t, 'nextSibling');
              },
              prevAll(t) {
                return N(t, 'previousSibling');
              },
              nextUntil(t, e, n) {
                return N(t, 'nextSibling', n);
              },
              prevUntil(t, e, n) {
                return N(t, 'previousSibling', n);
              },
              siblings(t) {
                return q((t.parentNode || {}).firstChild, t);
              },
              children(t) {
                return q(t.firstChild);
              },
              contents(t) {
                return t.contentDocument != null && a(t.contentDocument)
                  ? t.contentDocument
                  : (S(t, 'template') && (t = t.content || t), C.merge([], t.childNodes));
              },
            },
            function (t, e) {
              C.fn[t] = function (n, o) {
                let i = C.map(this, e, n);
                return (
                  t.slice(-5) !== 'Until' && (o = n),
                  o && typeof o === 'string' && (i = C.filter(o, i)),
                  this.length > 1 && (V[t] || C.uniqueSort(i), U.test(t) && i.reverse()),
                  this.pushStack(i)
                );
              };
            },
          );
        const Y = /[^\x20\t\r\n\f]+/g;
        function X(t) {
          return t;
        }
        function Z(t) {
          throw t;
        }
        function K(t, e, n, o) {
          let i;
          try {
            t && y((i = t.promise)) ? i.call(t).done(e).fail(n) : t && y((i = t.then)) ? i.call(t, e, n) : e.apply(void 0, [t].slice(o));
          } catch (t) {
            n.apply(void 0, [t]);
          }
        }
        (C.Callbacks = function (t) {
          t =
            typeof t === 'string'
              ? (function (t) {
                  const e = {};
                  return (
                    C.each(t.match(Y) || [], function (t, n) {
                      e[n] = !0;
                    }),
                    e
                  );
                })(t)
              : C.extend({}, t);
          let e;
          let n;
          let o;
          let i;
          let r = [];
          let a = [];
          let s = -1;
          const l = function () {
            for (i = i || t.once, o = e = !0; a.length; s = -1)
              for (n = a.shift(); ++s < r.length; ) !1 === r[s].apply(n[0], n[1]) && t.stopOnFalse && ((s = r.length), (n = !1));
            t.memory || (n = !1), (e = !1), i && (r = n ? [] : '');
          };
          var u = {
            add() {
              return (
                r &&
                  (n && !e && ((s = r.length - 1), a.push(n)),
                  (function e(n) {
                    C.each(n, function (n, o) {
                      y(o) ? (t.unique && u.has(o)) || r.push(o) : o && o.length && w(o) !== 'string' && e(o);
                    });
                  })(arguments),
                  n && !e && l()),
                this
              );
            },
            remove() {
              return (
                C.each(arguments, function (t, e) {
                  for (var n; (n = C.inArray(e, r, n)) > -1; ) r.splice(n, 1), n <= s && s--;
                }),
                this
              );
            },
            has(t) {
              return t ? C.inArray(t, r) > -1 : r.length > 0;
            },
            empty() {
              return r && (r = []), this;
            },
            disable() {
              return (i = a = []), (r = n = ''), this;
            },
            disabled() {
              return !r;
            },
            lock() {
              return (i = a = []), n || e || (r = n = ''), this;
            },
            locked() {
              return !!i;
            },
            fireWith(t, n) {
              return i || ((n = [t, (n = n || []).slice ? n.slice() : n]), a.push(n), e || l()), this;
            },
            fire() {
              return u.fireWith(this, arguments), this;
            },
            fired() {
              return !!o;
            },
          };
          return u;
        }),
          C.extend({
            Deferred(t) {
              const e = [
                ['notify', 'progress', C.Callbacks('memory'), C.Callbacks('memory'), 2],
                ['resolve', 'done', C.Callbacks('once memory'), C.Callbacks('once memory'), 0, 'resolved'],
                ['reject', 'fail', C.Callbacks('once memory'), C.Callbacks('once memory'), 1, 'rejected'],
              ];
              let n = 'pending';
              var i = {
                state() {
                  return n;
                },
                always() {
                  return r.done(arguments).fail(arguments), this;
                },
                catch(t) {
                  return i.then(null, t);
                },
                pipe() {
                  let t = arguments;
                  return C.Deferred(function (n) {
                    C.each(e, function (e, o) {
                      const i = y(t[o[4]]) && t[o[4]];
                      r[o[1]](function () {
                        const t = i && i.apply(this, arguments);
                        t && y(t.promise) ? t.promise().progress(n.notify).done(n.resolve).fail(n.reject) : n[`${o[0]}With`](this, i ? [t] : arguments);
                      });
                    }),
                      (t = null);
                  }).promise();
                },
                then(t, n, i) {
                  let r = 0;
                  function a(t, e, n, i) {
                    return function () {
                      let s = this;
                      let l = arguments;
                      const u = function () {
                        let o;
                        let u;
                        if (!(t < r)) {
                          if ((o = n.apply(s, l)) === e.promise()) throw new TypeError('Thenable self-resolution');
                          (u = o && (typeof o === 'object' || typeof o === 'function') && o.then),
                            y(u)
                              ? i
                                ? u.call(o, a(r, e, X, i), a(r, e, Z, i))
                                : (r++, u.call(o, a(r, e, X, i), a(r, e, Z, i), a(r, e, X, e.notifyWith)))
                              : (n !== X && ((s = void 0), (l = [o])), (i || e.resolveWith)(s, l));
                        }
                      };
                      var c = i
                        ? u
                        : function () {
                            try {
                              u();
                            } catch (o) {
                              C.Deferred.exceptionHook && C.Deferred.exceptionHook(o, c.error),
                                t + 1 >= r && (n !== Z && ((s = void 0), (l = [o])), e.rejectWith(s, l));
                            }
                          };
                      t
                        ? c()
                        : (C.Deferred.getErrorHook ? (c.error = C.Deferred.getErrorHook()) : C.Deferred.getStackHook && (c.error = C.Deferred.getStackHook()),
                          o.setTimeout(c));
                    };
                  }
                  return C.Deferred(function (o) {
                    e[0][3].add(a(0, o, y(i) ? i : X, o.notifyWith)), e[1][3].add(a(0, o, y(t) ? t : X)), e[2][3].add(a(0, o, y(n) ? n : Z));
                  }).promise();
                },
                promise(t) {
                  return t != null ? C.extend(t, i) : i;
                },
              };
              var r = {};
              return (
                C.each(e, function (t, o) {
                  const a = o[2];
                  const s = o[5];
                  (i[o[1]] = a.add),
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
                    (r[o[0]] = function () {
                      return r[`${o[0]}With`](this === r ? void 0 : this, arguments), this;
                    }),
                    (r[`${o[0]}With`] = a.fireWith);
                }),
                i.promise(r),
                t && t.call(r, r),
                r
              );
            },
            when(t) {
              let e = arguments.length;
              let n = e;
              const o = Array(n);
              const i = s.call(arguments);
              const r = C.Deferred();
              const a = function (t) {
                return function (n) {
                  (o[t] = this), (i[t] = arguments.length > 1 ? s.call(arguments) : n), --e || r.resolveWith(o, i);
                };
              };
              if (e <= 1 && (K(t, r.done(a(n)).resolve, r.reject, !e), r.state() === 'pending' || y(i[n] && i[n].then))) return r.then();
              for (; n--; ) K(i[n], a(n), r.reject);
              return r.promise();
            },
          });
        const J = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
        (C.Deferred.exceptionHook = function (t, e) {
          o.console && o.console.warn && t && J.test(t.name) && o.console.warn(`jQuery.Deferred exception: ${t.message}`, t.stack, e);
        }),
          (C.readyException = function (t) {
            o.setTimeout(function () {
              throw t;
            });
          });
        const G = C.Deferred();
        function Q() {
          b.removeEventListener('DOMContentLoaded', Q), o.removeEventListener('load', Q), C.ready();
        }
        (C.fn.ready = function (t) {
          return (
            G.then(t).catch(function (t) {
              C.readyException(t);
            }),
            this
          );
        }),
          C.extend({
            isReady: !1,
            readyWait: 1,
            ready(t) {
              (!0 === t ? --C.readyWait : C.isReady) || ((C.isReady = !0), (!0 !== t && --C.readyWait > 0) || G.resolveWith(b, [C]));
            },
          }),
          (C.ready.then = G.then),
          b.readyState === 'complete' || (b.readyState !== 'loading' && !b.documentElement.doScroll)
            ? o.setTimeout(C.ready)
            : (b.addEventListener('DOMContentLoaded', Q), o.addEventListener('load', Q));
        const tt = function (t, e, n, o, i, r, a) {
          let s = 0;
          const l = t.length;
          let u = n == null;
          if (w(n) === 'object') for (s in ((i = !0), n)) tt(t, e, s, n[s], !0, r, a);
          else if (
            void 0 !== o &&
            ((i = !0),
            y(o) || (a = !0),
            u &&
              (a
                ? (e.call(t, o), (e = null))
                : ((u = e),
                  (e = function (t, e, n) {
                    return u.call(C(t), n);
                  }))),
            e)
          )
            for (; s < l; s++) e(t[s], n, a ? o : o.call(t[s], s, e(t[s], n)));
          return i ? t : u ? e.call(t) : l ? e(t[0], n) : r;
        };
        const et = /^-ms-/;
        const nt = /-([a-z])/g;
        function ot(t, e) {
          return e.toUpperCase();
        }
        function it(t) {
          return t.replace(et, 'ms-').replace(nt, ot);
        }
        const rt = function (t) {
          return t.nodeType === 1 || t.nodeType === 9 || !+t.nodeType;
        };
        function at() {
          this.expando = C.expando + at.uid++;
        }
        (at.uid = 1),
          (at.prototype = {
            cache(t) {
              let e = t[this.expando];
              return e || ((e = {}), rt(t) && (t.nodeType ? (t[this.expando] = e) : Object.defineProperty(t, this.expando, { value: e, configurable: !0 }))), e;
            },
            set(t, e, n) {
              let o;
              const i = this.cache(t);
              if (typeof e === 'string') i[it(e)] = n;
              else for (o in e) i[it(o)] = e[o];
              return i;
            },
            get(t, e) {
              return void 0 === e ? this.cache(t) : t[this.expando] && t[this.expando][it(e)];
            },
            access(t, e, n) {
              return void 0 === e || (e && typeof e === 'string' && void 0 === n) ? this.get(t, e) : (this.set(t, e, n), void 0 !== n ? n : e);
            },
            remove(t, e) {
              let n;
              const o = t[this.expando];
              if (void 0 !== o) {
                if (void 0 !== e) {
                  n = (e = Array.isArray(e) ? e.map(it) : (e = it(e)) in o ? [e] : e.match(Y) || []).length;
                  for (; n--; ) delete o[e[n]];
                }
                (void 0 === e || C.isEmptyObject(o)) && (t.nodeType ? (t[this.expando] = void 0) : delete t[this.expando]);
              }
            },
            hasData(t) {
              const e = t[this.expando];
              return void 0 !== e && !C.isEmptyObject(e);
            },
          });
        const st = new at();
        const lt = new at();
        const ut = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;
        const ct = /[A-Z]/g;
        function dt(t, e, n) {
          let o;
          if (void 0 === n && t.nodeType === 1)
            if (((o = `data-${e.replace(ct, '-$&').toLowerCase()}`), typeof (n = t.getAttribute(o)) === 'string')) {
              try {
                n = (function (t) {
                  return t === 'true' || (t !== 'false' && (t === 'null' ? null : t === `${+t}` ? +t : ut.test(t) ? JSON.parse(t) : t));
                })(n);
              } catch (t) {}
              lt.set(t, e, n);
            } else n = void 0;
          return n;
        }
        C.extend({
          hasData(t) {
            return lt.hasData(t) || st.hasData(t);
          },
          data(t, e, n) {
            return lt.access(t, e, n);
          },
          removeData(t, e) {
            lt.remove(t, e);
          },
          _data(t, e, n) {
            return st.access(t, e, n);
          },
          _removeData(t, e) {
            st.remove(t, e);
          },
        }),
          C.fn.extend({
            data(t, e) {
              let n;
              let o;
              let i;
              const r = this[0];
              const a = r && r.attributes;
              if (void 0 === t) {
                if (this.length && ((i = lt.get(r)), r.nodeType === 1 && !st.get(r, 'hasDataAttrs'))) {
                  for (n = a.length; n--; ) a[n] && (o = a[n].name).indexOf('data-') === 0 && ((o = it(o.slice(5))), dt(r, o, i[o]));
                  st.set(r, 'hasDataAttrs', !0);
                }
                return i;
              }
              return typeof t === 'object'
                ? this.each(function () {
                    lt.set(this, t);
                  })
                : tt(
                    this,
                    function (e) {
                      let n;
                      if (r && void 0 === e) return void 0 !== (n = lt.get(r, t)) || void 0 !== (n = dt(r, t)) ? n : void 0;
                      this.each(function () {
                        lt.set(this, t, e);
                      });
                    },
                    null,
                    e,
                    arguments.length > 1,
                    null,
                    !0,
                  );
            },
            removeData(t) {
              return this.each(function () {
                lt.remove(this, t);
              });
            },
          }),
          C.extend({
            queue(t, e, n) {
              let o;
              if (t)
                return (
                  (e = `${e || 'fx'}queue`), (o = st.get(t, e)), n && (!o || Array.isArray(n) ? (o = st.access(t, e, C.makeArray(n))) : o.push(n)), o || []
                );
            },
            dequeue(t, e) {
              e = e || 'fx';
              const n = C.queue(t, e);
              let o = n.length;
              let i = n.shift();
              const r = C._queueHooks(t, e);
              i === 'inprogress' && ((i = n.shift()), o--),
                i &&
                  (e === 'fx' && n.unshift('inprogress'),
                  delete r.stop,
                  i.call(
                    t,
                    function () {
                      C.dequeue(t, e);
                    },
                    r,
                  )),
                !o && r && r.empty.fire();
            },
            _queueHooks(t, e) {
              const n = `${e}queueHooks`;
              return (
                st.get(t, n) ||
                st.access(t, n, {
                  empty: C.Callbacks('once memory').add(function () {
                    st.remove(t, [`${e}queue`, n]);
                  }),
                })
              );
            },
          }),
          C.fn.extend({
            queue(t, e) {
              let n = 2;
              return (
                typeof t !== 'string' && ((e = t), (t = 'fx'), n--),
                arguments.length < n
                  ? C.queue(this[0], t)
                  : void 0 === e
                  ? this
                  : this.each(function () {
                      const n = C.queue(this, t, e);
                      C._queueHooks(this, t), t === 'fx' && n[0] !== 'inprogress' && C.dequeue(this, t);
                    })
              );
            },
            dequeue(t) {
              return this.each(function () {
                C.dequeue(this, t);
              });
            },
            clearQueue(t) {
              return this.queue(t || 'fx', []);
            },
            promise(t, e) {
              let n;
              let o = 1;
              const i = C.Deferred();
              const r = this;
              let a = this.length;
              const s = function () {
                --o || i.resolveWith(r, [r]);
              };
              for (typeof t !== 'string' && ((e = t), (t = void 0)), t = t || 'fx'; a--; )
                (n = st.get(r[a], `${t}queueHooks`)) && n.empty && (o++, n.empty.add(s));
              return s(), i.promise(e);
            },
          });
        const pt = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
        const ht = new RegExp(`^(?:([+-])=|)(${pt})([a-z%]*)$`, 'i');
        const ft = ['Top', 'Right', 'Bottom', 'Left'];
        const gt = b.documentElement;
        let mt = function (t) {
          return C.contains(t.ownerDocument, t);
        };
        const yt = { composed: !0 };
        gt.getRootNode &&
          (mt = function (t) {
            return C.contains(t.ownerDocument, t) || t.getRootNode(yt) === t.ownerDocument;
          });
        const vt = function (t, e) {
          return (t = e || t).style.display === 'none' || (t.style.display === '' && mt(t) && C.css(t, 'display') === 'none');
        };
        function bt(t, e, n, o) {
          let i;
          let r;
          let a = 20;
          const s = o
            ? function () {
                return o.cur();
              }
            : function () {
                return C.css(t, e, '');
              };
          let l = s();
          let u = (n && n[3]) || (C.cssNumber[e] ? '' : 'px');
          let c = t.nodeType && (C.cssNumber[e] || (u !== 'px' && +l)) && ht.exec(C.css(t, e));
          if (c && c[3] !== u) {
            for (l /= 2, u = u || c[3], c = +l || 1; a--; ) C.style(t, e, c + u), (1 - r) * (1 - (r = s() / l || 0.5)) <= 0 && (a = 0), (c /= r);
            (c *= 2), C.style(t, e, c + u), (n = n || []);
          }
          return n && ((c = +c || +l || 0), (i = n[1] ? c + (n[1] + 1) * n[2] : +n[2]), o && ((o.unit = u), (o.start = c), (o.end = i))), i;
        }
        const xt = {};
        function kt(t) {
          let e;
          const n = t.ownerDocument;
          const o = t.nodeName;
          let i = xt[o];
          return (
            i ||
            ((e = n.body.appendChild(n.createElement(o))),
            (i = C.css(e, 'display')),
            e.parentNode.removeChild(e),
            i === 'none' && (i = 'block'),
            (xt[o] = i),
            i)
          );
        }
        function wt(t, e) {
          for (var n, o, i = [], r = 0, a = t.length; r < a; r++)
            (o = t[r]).style &&
              ((n = o.style.display),
              e
                ? (n === 'none' && ((i[r] = st.get(o, 'display') || null), i[r] || (o.style.display = '')), o.style.display === '' && vt(o) && (i[r] = kt(o)))
                : n !== 'none' && ((i[r] = 'none'), st.set(o, 'display', n)));
          for (r = 0; r < a; r++) i[r] != null && (t[r].style.display = i[r]);
          return t;
        }
        C.fn.extend({
          show() {
            return wt(this, !0);
          },
          hide() {
            return wt(this);
          },
          toggle(t) {
            return typeof t === 'boolean'
              ? t
                ? this.show()
                : this.hide()
              : this.each(function () {
                  vt(this) ? C(this).show() : C(this).hide();
                });
          },
        });
        let Dt;
        let Tt;
        const Ct = /^(?:checkbox|radio)$/i;
        const jt = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;
        const St = /^$|^module$|\/(?:java|ecma)script/i;
        (Dt = b.createDocumentFragment().appendChild(b.createElement('div'))),
          (Tt = b.createElement('input')).setAttribute('type', 'radio'),
          Tt.setAttribute('checked', 'checked'),
          Tt.setAttribute('name', 't'),
          Dt.appendChild(Tt),
          (m.checkClone = Dt.cloneNode(!0).cloneNode(!0).lastChild.checked),
          (Dt.innerHTML = '<textarea>x</textarea>'),
          (m.noCloneChecked = !!Dt.cloneNode(!0).lastChild.defaultValue),
          (Dt.innerHTML = '<option></option>'),
          (m.option = !!Dt.lastChild);
        const Et = {
          thead: [1, '<table>', '</table>'],
          col: [2, '<table><colgroup>', '</colgroup></table>'],
          tr: [2, '<table><tbody>', '</tbody></table>'],
          td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
          _default: [0, '', ''],
        };
        function At(t, e) {
          let n;
          return (
            (n = void 0 !== t.getElementsByTagName ? t.getElementsByTagName(e || '*') : void 0 !== t.querySelectorAll ? t.querySelectorAll(e || '*') : []),
            void 0 === e || (e && S(t, e)) ? C.merge([t], n) : n
          );
        }
        function $t(t, e) {
          for (let n = 0, o = t.length; n < o; n++) st.set(t[n], 'globalEval', !e || st.get(e[n], 'globalEval'));
        }
        (Et.tbody = Et.tfoot = Et.colgroup = Et.caption = Et.thead),
          (Et.th = Et.td),
          m.option || (Et.optgroup = Et.option = [1, "<select multiple='multiple'>", '</select>']);
        const Lt = /<|&#?\w+;/;
        function _t(t, e, n, o, i) {
          for (var r, a, s, l, u, c, d = e.createDocumentFragment(), p = [], h = 0, f = t.length; h < f; h++)
            if ((r = t[h]) || r === 0)
              if (w(r) === 'object') C.merge(p, r.nodeType ? [r] : r);
              else if (Lt.test(r)) {
                for (
                  a = a || d.appendChild(e.createElement('div')),
                    s = (jt.exec(r) || ['', ''])[1].toLowerCase(),
                    l = Et[s] || Et._default,
                    a.innerHTML = l[1] + C.htmlPrefilter(r) + l[2],
                    c = l[0];
                  c--;

                )
                  a = a.lastChild;
                C.merge(p, a.childNodes), ((a = d.firstChild).textContent = '');
              } else p.push(e.createTextNode(r));
          for (d.textContent = '', h = 0; (r = p[h++]); )
            if (o && C.inArray(r, o) > -1) i && i.push(r);
            else if (((u = mt(r)), (a = At(d.appendChild(r), 'script')), u && $t(a), n)) for (c = 0; (r = a[c++]); ) St.test(r.type || '') && n.push(r);
          return d;
        }
        const Mt = /^([^.]*)(?:\.(.+)|)/;
        function Bt() {
          return !0;
        }
        function Ft() {
          return !1;
        }
        function Ht(t, e, n, o, i, r) {
          let a;
          let s;
          if (typeof e === 'object') {
            for (s in (typeof n !== 'string' && ((o = o || n), (n = void 0)), e)) Ht(t, s, n, o, e[s], r);
            return t;
          }
          if (
            (o == null && i == null
              ? ((i = n), (o = n = void 0))
              : i == null && (typeof n === 'string' ? ((i = o), (o = void 0)) : ((i = o), (o = n), (n = void 0))),
            !1 === i)
          )
            i = Ft;
          else if (!i) return t;
          return (
            r === 1 &&
              ((a = i),
              (i = function (t) {
                return C().off(t), a.apply(this, arguments);
              }),
              (i.guid = a.guid || (a.guid = C.guid++))),
            t.each(function () {
              C.event.add(this, e, i, o, n);
            })
          );
        }
        function Nt(t, e, n) {
          n
            ? (st.set(t, e, !1),
              C.event.add(t, e, {
                namespace: !1,
                handler(t) {
                  let n;
                  let o = st.get(this, e);
                  if (1 & t.isTrigger && this[e]) {
                    if (o) (C.event.special[e] || {}).delegateType && t.stopPropagation();
                    else if (((o = s.call(arguments)), st.set(this, e, o), this[e](), (n = st.get(this, e)), st.set(this, e, !1), o !== n))
                      return t.stopImmediatePropagation(), t.preventDefault(), n;
                  } else o && (st.set(this, e, C.event.trigger(o[0], o.slice(1), this)), t.stopPropagation(), (t.isImmediatePropagationStopped = Bt));
                },
              }))
            : void 0 === st.get(t, e) && C.event.add(t, e, Bt);
        }
        (C.event = {
          global: {},
          add(t, e, n, o, i) {
            let r;
            let a;
            let s;
            let l;
            let u;
            let c;
            let d;
            let p;
            let h;
            let f;
            let g;
            const m = st.get(t);
            if (rt(t))
              for (
                n.handler && ((n = (r = n).handler), (i = r.selector)),
                  i && C.find.matchesSelector(gt, i),
                  n.guid || (n.guid = C.guid++),
                  (l = m.events) || (l = m.events = Object.create(null)),
                  (a = m.handle) ||
                    (a = m.handle =
                      function (e) {
                        return void 0 !== C && C.event.triggered !== e.type ? C.event.dispatch.apply(t, arguments) : void 0;
                      }),
                  u = (e = (e || '').match(Y) || ['']).length;
                u--;

              )
                (h = g = (s = Mt.exec(e[u]) || [])[1]),
                  (f = (s[2] || '').split('.').sort()),
                  h &&
                    ((d = C.event.special[h] || {}),
                    (h = (i ? d.delegateType : d.bindType) || h),
                    (d = C.event.special[h] || {}),
                    (c = C.extend(
                      {
                        type: h,
                        origType: g,
                        data: o,
                        handler: n,
                        guid: n.guid,
                        selector: i,
                        needsContext: i && C.expr.match.needsContext.test(i),
                        namespace: f.join('.'),
                      },
                      r,
                    )),
                    (p = l[h]) ||
                      (((p = l[h] = []).delegateCount = 0), (d.setup && !1 !== d.setup.call(t, o, f, a)) || (t.addEventListener && t.addEventListener(h, a))),
                    d.add && (d.add.call(t, c), c.handler.guid || (c.handler.guid = n.guid)),
                    i ? p.splice(p.delegateCount++, 0, c) : p.push(c),
                    (C.event.global[h] = !0));
          },
          remove(t, e, n, o, i) {
            let r;
            let a;
            let s;
            let l;
            let u;
            let c;
            let d;
            let p;
            let h;
            let f;
            let g;
            const m = st.hasData(t) && st.get(t);
            if (m && (l = m.events)) {
              for (u = (e = (e || '').match(Y) || ['']).length; u--; )
                if (((h = g = (s = Mt.exec(e[u]) || [])[1]), (f = (s[2] || '').split('.').sort()), h)) {
                  for (
                    d = C.event.special[h] || {},
                      p = l[(h = (o ? d.delegateType : d.bindType) || h)] || [],
                      s = s[2] && new RegExp(`(^|\\.)${f.join('\\.(?:.*\\.|)')}(\\.|$)`),
                      a = r = p.length;
                    r--;

                  )
                    (c = p[r]),
                      (!i && g !== c.origType) ||
                        (n && n.guid !== c.guid) ||
                        (s && !s.test(c.namespace)) ||
                        (o && o !== c.selector && (o !== '**' || !c.selector)) ||
                        (p.splice(r, 1), c.selector && p.delegateCount--, d.remove && d.remove.call(t, c));
                  a && !p.length && ((d.teardown && !1 !== d.teardown.call(t, f, m.handle)) || C.removeEvent(t, h, m.handle), delete l[h]);
                } else for (h in l) C.event.remove(t, h + e[u], n, o, !0);
              C.isEmptyObject(l) && st.remove(t, 'handle events');
            }
          },
          dispatch(t) {
            let e;
            let n;
            let o;
            let i;
            let r;
            let a;
            const s = new Array(arguments.length);
            const l = C.event.fix(t);
            const u = (st.get(this, 'events') || Object.create(null))[l.type] || [];
            const c = C.event.special[l.type] || {};
            for (s[0] = l, e = 1; e < arguments.length; e++) s[e] = arguments[e];
            if (((l.delegateTarget = this), !c.preDispatch || !1 !== c.preDispatch.call(this, l))) {
              for (a = C.event.handlers.call(this, l, u), e = 0; (i = a[e++]) && !l.isPropagationStopped(); )
                for (l.currentTarget = i.elem, n = 0; (r = i.handlers[n++]) && !l.isImmediatePropagationStopped(); )
                  (l.rnamespace && !1 !== r.namespace && !l.rnamespace.test(r.namespace)) ||
                    ((l.handleObj = r),
                    (l.data = r.data),
                    void 0 !== (o = ((C.event.special[r.origType] || {}).handle || r.handler).apply(i.elem, s)) &&
                      !1 === (l.result = o) &&
                      (l.preventDefault(), l.stopPropagation()));
              return c.postDispatch && c.postDispatch.call(this, l), l.result;
            }
          },
          handlers(t, e) {
            let n;
            let o;
            let i;
            let r;
            let a;
            const s = [];
            const l = e.delegateCount;
            let u = t.target;
            if (l && u.nodeType && !(t.type === 'click' && t.button >= 1))
              for (; u !== this; u = u.parentNode || this)
                if (u.nodeType === 1 && (t.type !== 'click' || !0 !== u.disabled)) {
                  for (r = [], a = {}, n = 0; n < l; n++)
                    void 0 === a[(i = `${(o = e[n]).selector} `)] && (a[i] = o.needsContext ? C(i, this).index(u) > -1 : C.find(i, this, null, [u]).length),
                      a[i] && r.push(o);
                  r.length && s.push({ elem: u, handlers: r });
                }
            return (u = this), l < e.length && s.push({ elem: u, handlers: e.slice(l) }), s;
          },
          addProp(t, e) {
            Object.defineProperty(C.Event.prototype, t, {
              enumerable: !0,
              configurable: !0,
              get: y(e)
                ? function () {
                    if (this.originalEvent) return e(this.originalEvent);
                  }
                : function () {
                    if (this.originalEvent) return this.originalEvent[t];
                  },
              set(e) {
                Object.defineProperty(this, t, { enumerable: !0, configurable: !0, writable: !0, value: e });
              },
            });
          },
          fix(t) {
            return t[C.expando] ? t : new C.Event(t);
          },
          special: {
            load: { noBubble: !0 },
            click: {
              setup(t) {
                const e = this || t;
                return Ct.test(e.type) && e.click && S(e, 'input') && Nt(e, 'click', !0), !1;
              },
              trigger(t) {
                const e = this || t;
                return Ct.test(e.type) && e.click && S(e, 'input') && Nt(e, 'click'), !0;
              },
              _default(t) {
                const e = t.target;
                return (Ct.test(e.type) && e.click && S(e, 'input') && st.get(e, 'click')) || S(e, 'a');
              },
            },
            beforeunload: {
              postDispatch(t) {
                void 0 !== t.result && t.originalEvent && (t.originalEvent.returnValue = t.result);
              },
            },
          },
        }),
          (C.removeEvent = function (t, e, n) {
            t.removeEventListener && t.removeEventListener(e, n);
          }),
          (C.Event = function (t, e) {
            if (!(this instanceof C.Event)) return new C.Event(t, e);
            t && t.type
              ? ((this.originalEvent = t),
                (this.type = t.type),
                (this.isDefaultPrevented = t.defaultPrevented || (void 0 === t.defaultPrevented && !1 === t.returnValue) ? Bt : Ft),
                (this.target = t.target && t.target.nodeType === 3 ? t.target.parentNode : t.target),
                (this.currentTarget = t.currentTarget),
                (this.relatedTarget = t.relatedTarget))
              : (this.type = t),
              e && C.extend(this, e),
              (this.timeStamp = (t && t.timeStamp) || Date.now()),
              (this[C.expando] = !0);
          }),
          (C.Event.prototype = {
            constructor: C.Event,
            isDefaultPrevented: Ft,
            isPropagationStopped: Ft,
            isImmediatePropagationStopped: Ft,
            isSimulated: !1,
            preventDefault() {
              const t = this.originalEvent;
              (this.isDefaultPrevented = Bt), t && !this.isSimulated && t.preventDefault();
            },
            stopPropagation() {
              const t = this.originalEvent;
              (this.isPropagationStopped = Bt), t && !this.isSimulated && t.stopPropagation();
            },
            stopImmediatePropagation() {
              const t = this.originalEvent;
              (this.isImmediatePropagationStopped = Bt), t && !this.isSimulated && t.stopImmediatePropagation(), this.stopPropagation();
            },
          }),
          C.each(
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
            C.event.addProp,
          ),
          C.each({ focus: 'focusin', blur: 'focusout' }, function (t, e) {
            function n(t) {
              if (b.documentMode) {
                const n = st.get(this, 'handle');
                const o = C.event.fix(t);
                (o.type = t.type === 'focusin' ? 'focus' : 'blur'), (o.isSimulated = !0), n(t), o.target === o.currentTarget && n(o);
              } else C.event.simulate(e, t.target, C.event.fix(t));
            }
            (C.event.special[t] = {
              setup() {
                let o;
                if ((Nt(this, t, !0), !b.documentMode)) return !1;
                (o = st.get(this, e)) || this.addEventListener(e, n), st.set(this, e, (o || 0) + 1);
              },
              trigger() {
                return Nt(this, t), !0;
              },
              teardown() {
                let t;
                if (!b.documentMode) return !1;
                (t = st.get(this, e) - 1) ? st.set(this, e, t) : (this.removeEventListener(e, n), st.remove(this, e));
              },
              _default(e) {
                return st.get(e.target, t);
              },
              delegateType: e,
            }),
              (C.event.special[e] = {
                setup() {
                  const o = this.ownerDocument || this.document || this;
                  const i = b.documentMode ? this : o;
                  const r = st.get(i, e);
                  r || (b.documentMode ? this.addEventListener(e, n) : o.addEventListener(t, n, !0)), st.set(i, e, (r || 0) + 1);
                },
                teardown() {
                  const o = this.ownerDocument || this.document || this;
                  const i = b.documentMode ? this : o;
                  const r = st.get(i, e) - 1;
                  r ? st.set(i, e, r) : (b.documentMode ? this.removeEventListener(e, n) : o.removeEventListener(t, n, !0), st.remove(i, e));
                },
              });
          }),
          C.each({ mouseenter: 'mouseover', mouseleave: 'mouseout', pointerenter: 'pointerover', pointerleave: 'pointerout' }, function (t, e) {
            C.event.special[t] = {
              delegateType: e,
              bindType: e,
              handle(t) {
                let n;
                const o = t.relatedTarget;
                const i = t.handleObj;
                return (o && (o === this || C.contains(this, o))) || ((t.type = i.origType), (n = i.handler.apply(this, arguments)), (t.type = e)), n;
              },
            };
          }),
          C.fn.extend({
            on(t, e, n, o) {
              return Ht(this, t, e, n, o);
            },
            one(t, e, n, o) {
              return Ht(this, t, e, n, o, 1);
            },
            off(t, e, n) {
              let o;
              let i;
              if (t && t.preventDefault && t.handleObj)
                return (o = t.handleObj), C(t.delegateTarget).off(o.namespace ? `${o.origType}.${o.namespace}` : o.origType, o.selector, o.handler), this;
              if (typeof t === 'object') {
                for (i in t) this.off(i, e, t[i]);
                return this;
              }
              return (
                (!1 !== e && typeof e !== 'function') || ((n = e), (e = void 0)),
                !1 === n && (n = Ft),
                this.each(function () {
                  C.event.remove(this, t, n, e);
                })
              );
            },
          });
        const qt = /<script|<style|<link/i;
        const Ot = /checked\s*(?:[^=]|=\s*.checked.)/i;
        const Rt = /^\s*<!\[CDATA\[|\]\]>\s*$/g;
        function Pt(t, e) {
          return (S(t, 'table') && S(e.nodeType !== 11 ? e : e.firstChild, 'tr') && C(t).children('tbody')[0]) || t;
        }
        function It(t) {
          return (t.type = `${t.getAttribute('type') !== null}/${t.type}`), t;
        }
        function Wt(t) {
          return (t.type || '').slice(0, 5) === 'true/' ? (t.type = t.type.slice(5)) : t.removeAttribute('type'), t;
        }
        function Ut(t, e) {
          let n;
          let o;
          let i;
          let r;
          let a;
          let s;
          if (e.nodeType === 1) {
            if (st.hasData(t) && (s = st.get(t).events))
              for (i in (st.remove(e, 'handle events'), s)) for (n = 0, o = s[i].length; n < o; n++) C.event.add(e, i, s[i][n]);
            lt.hasData(t) && ((r = lt.access(t)), (a = C.extend({}, r)), lt.set(e, a));
          }
        }
        function Vt(t, e) {
          const n = e.nodeName.toLowerCase();
          n === 'input' && Ct.test(t.type) ? (e.checked = t.checked) : (n !== 'input' && n !== 'textarea') || (e.defaultValue = t.defaultValue);
        }
        function zt(t, e, n, o) {
          e = l(e);
          let i;
          let r;
          let a;
          let s;
          let u;
          let c;
          let d = 0;
          const p = t.length;
          const h = p - 1;
          const f = e[0];
          const g = y(f);
          if (g || (p > 1 && typeof f === 'string' && !m.checkClone && Ot.test(f)))
            return t.each(function (i) {
              const r = t.eq(i);
              g && (e[0] = f.call(this, i, r.html())), zt(r, e, n, o);
            });
          if (p && ((r = (i = _t(e, t[0].ownerDocument, !1, t, o)).firstChild), i.childNodes.length === 1 && (i = r), r || o)) {
            for (s = (a = C.map(At(i, 'script'), It)).length; d < p; d++)
              (u = i), d !== h && ((u = C.clone(u, !0, !0)), s && C.merge(a, At(u, 'script'))), n.call(t[d], u, d);
            if (s)
              for (c = a[a.length - 1].ownerDocument, C.map(a, Wt), d = 0; d < s; d++)
                (u = a[d]),
                  St.test(u.type || '') &&
                    !st.access(u, 'globalEval') &&
                    C.contains(c, u) &&
                    (u.src && (u.type || '').toLowerCase() !== 'module'
                      ? C._evalUrl && !u.noModule && C._evalUrl(u.src, { nonce: u.nonce || u.getAttribute('nonce') }, c)
                      : k(u.textContent.replace(Rt, ''), u, c));
          }
          return t;
        }
        function Yt(t, e, n) {
          for (var o, i = e ? C.filter(e, t) : t, r = 0; (o = i[r]) != null; r++)
            n || o.nodeType !== 1 || C.cleanData(At(o)), o.parentNode && (n && mt(o) && $t(At(o, 'script')), o.parentNode.removeChild(o));
          return t;
        }
        C.extend({
          htmlPrefilter(t) {
            return t;
          },
          clone(t, e, n) {
            let o;
            let i;
            let r;
            let a;
            const s = t.cloneNode(!0);
            const l = mt(t);
            if (!(m.noCloneChecked || (t.nodeType !== 1 && t.nodeType !== 11) || C.isXMLDoc(t)))
              for (a = At(s), o = 0, i = (r = At(t)).length; o < i; o++) Vt(r[o], a[o]);
            if (e)
              if (n) for (r = r || At(t), a = a || At(s), o = 0, i = r.length; o < i; o++) Ut(r[o], a[o]);
              else Ut(t, s);
            return (a = At(s, 'script')).length > 0 && $t(a, !l && At(t, 'script')), s;
          },
          cleanData(t) {
            for (var e, n, o, i = C.event.special, r = 0; void 0 !== (n = t[r]); r++)
              if (rt(n)) {
                if ((e = n[st.expando])) {
                  if (e.events) for (o in e.events) i[o] ? C.event.remove(n, o) : C.removeEvent(n, o, e.handle);
                  n[st.expando] = void 0;
                }
                n[lt.expando] && (n[lt.expando] = void 0);
              }
          },
        }),
          C.fn.extend({
            detach(t) {
              return Yt(this, t, !0);
            },
            remove(t) {
              return Yt(this, t);
            },
            text(t) {
              return tt(
                this,
                function (t) {
                  return void 0 === t
                    ? C.text(this)
                    : this.empty().each(function () {
                        (this.nodeType !== 1 && this.nodeType !== 11 && this.nodeType !== 9) || (this.textContent = t);
                      });
                },
                null,
                t,
                arguments.length,
              );
            },
            append() {
              return zt(this, arguments, function (t) {
                (this.nodeType !== 1 && this.nodeType !== 11 && this.nodeType !== 9) || Pt(this, t).appendChild(t);
              });
            },
            prepend() {
              return zt(this, arguments, function (t) {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                  const e = Pt(this, t);
                  e.insertBefore(t, e.firstChild);
                }
              });
            },
            before() {
              return zt(this, arguments, function (t) {
                this.parentNode && this.parentNode.insertBefore(t, this);
              });
            },
            after() {
              return zt(this, arguments, function (t) {
                this.parentNode && this.parentNode.insertBefore(t, this.nextSibling);
              });
            },
            empty() {
              for (var t, e = 0; (t = this[e]) != null; e++) t.nodeType === 1 && (C.cleanData(At(t, !1)), (t.textContent = ''));
              return this;
            },
            clone(t, e) {
              return (
                (t = t != null && t),
                (e = e == null ? t : e),
                this.map(function () {
                  return C.clone(this, t, e);
                })
              );
            },
            html(t) {
              return tt(
                this,
                function (t) {
                  let e = this[0] || {};
                  let n = 0;
                  const o = this.length;
                  if (void 0 === t && e.nodeType === 1) return e.innerHTML;
                  if (typeof t === 'string' && !qt.test(t) && !Et[(jt.exec(t) || ['', ''])[1].toLowerCase()]) {
                    t = C.htmlPrefilter(t);
                    try {
                      for (; n < o; n++) (e = this[n] || {}).nodeType === 1 && (C.cleanData(At(e, !1)), (e.innerHTML = t));
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
            replaceWith() {
              const t = [];
              return zt(
                this,
                arguments,
                function (e) {
                  const n = this.parentNode;
                  C.inArray(this, t) < 0 && (C.cleanData(At(this)), n && n.replaceChild(e, this));
                },
                t,
              );
            },
          }),
          C.each({ appendTo: 'append', prependTo: 'prepend', insertBefore: 'before', insertAfter: 'after', replaceAll: 'replaceWith' }, function (t, e) {
            C.fn[t] = function (t) {
              for (var n, o = [], i = C(t), r = i.length - 1, a = 0; a <= r; a++) (n = a === r ? this : this.clone(!0)), C(i[a])[e](n), u.apply(o, n.get());
              return this.pushStack(o);
            };
          });
        const Xt = new RegExp(`^(${pt})(?!px)[a-z%]+$`, 'i');
        const Zt = /^--/;
        const Kt = function (t) {
          let e = t.ownerDocument.defaultView;
          return (e && e.opener) || (e = o), e.getComputedStyle(t);
        };
        const Jt = function (t, e, n) {
          let o;
          let i;
          const r = {};
          for (i in e) (r[i] = t.style[i]), (t.style[i] = e[i]);
          for (i in ((o = n.call(t)), e)) t.style[i] = r[i];
          return o;
        };
        const Gt = new RegExp(ft.join('|'), 'i');
        function Qt(t, e, n) {
          let o;
          let i;
          let r;
          let a;
          const s = Zt.test(e);
          const l = t.style;
          return (
            (n = n || Kt(t)) &&
              ((a = n.getPropertyValue(e) || n[e]),
              s && a && (a = a.replace(_, '$1') || void 0),
              a !== '' || mt(t) || (a = C.style(t, e)),
              !m.pixelBoxStyles() &&
                Xt.test(a) &&
                Gt.test(e) &&
                ((o = l.width),
                (i = l.minWidth),
                (r = l.maxWidth),
                (l.minWidth = l.maxWidth = l.width = a),
                (a = n.width),
                (l.width = o),
                (l.minWidth = i),
                (l.maxWidth = r))),
            void 0 !== a ? `${a}` : a
          );
        }
        function te(t, e) {
          return {
            get() {
              if (!t()) return (this.get = e).apply(this, arguments);
              delete this.get;
            },
          };
        }
        !(function () {
          function t() {
            if (c) {
              (u.style.cssText = 'position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0'),
                (c.style.cssText = 'position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%'),
                gt.appendChild(u).appendChild(c);
              const t = o.getComputedStyle(c);
              (n = t.top !== '1%'),
                (l = e(t.marginLeft) === 12),
                (c.style.right = '60%'),
                (a = e(t.right) === 36),
                (i = e(t.width) === 36),
                (c.style.position = 'absolute'),
                (r = e(c.offsetWidth / 3) === 12),
                gt.removeChild(u),
                (c = null);
            }
          }
          function e(t) {
            return Math.round(parseFloat(t));
          }
          let n;
          let i;
          let r;
          let a;
          let s;
          let l;
          var u = b.createElement('div');
          var c = b.createElement('div');
          c.style &&
            ((c.style.backgroundClip = 'content-box'),
            (c.cloneNode(!0).style.backgroundClip = ''),
            (m.clearCloneStyle = c.style.backgroundClip === 'content-box'),
            C.extend(m, {
              boxSizingReliable() {
                return t(), i;
              },
              pixelBoxStyles() {
                return t(), a;
              },
              pixelPosition() {
                return t(), n;
              },
              reliableMarginLeft() {
                return t(), l;
              },
              scrollboxSize() {
                return t(), r;
              },
              reliableTrDimensions() {
                let t;
                let e;
                let n;
                let i;
                return (
                  s == null &&
                    ((t = b.createElement('table')),
                    (e = b.createElement('tr')),
                    (n = b.createElement('div')),
                    (t.style.cssText = 'position:absolute;left:-11111px;border-collapse:separate'),
                    (e.style.cssText = 'box-sizing:content-box;border:1px solid'),
                    (e.style.height = '1px'),
                    (n.style.height = '9px'),
                    (n.style.display = 'block'),
                    gt.appendChild(t).appendChild(e).appendChild(n),
                    (i = o.getComputedStyle(e)),
                    (s = parseInt(i.height, 10) + parseInt(i.borderTopWidth, 10) + parseInt(i.borderBottomWidth, 10) === e.offsetHeight),
                    gt.removeChild(t)),
                  s
                );
              },
            }));
        })();
        const ee = ['Webkit', 'Moz', 'ms'];
        const ne = b.createElement('div').style;
        const oe = {};
        function ie(t) {
          const e = C.cssProps[t] || oe[t];
          return (
            e ||
            (t in ne
              ? t
              : (oe[t] =
                  (function (t) {
                    for (let e = t[0].toUpperCase() + t.slice(1), n = ee.length; n--; ) if ((t = ee[n] + e) in ne) return t;
                  })(t) || t))
          );
        }
        const re = /^(none|table(?!-c[ea]).+)/;
        const ae = { position: 'absolute', visibility: 'hidden', display: 'block' };
        const se = { letterSpacing: '0', fontWeight: '400' };
        function le(t, e, n) {
          const o = ht.exec(e);
          return o ? Math.max(0, o[2] - (n || 0)) + (o[3] || 'px') : e;
        }
        function ue(t, e, n, o, i, r) {
          let a = e === 'width' ? 1 : 0;
          let s = 0;
          let l = 0;
          let u = 0;
          if (n === (o ? 'border' : 'content')) return 0;
          for (; a < 4; a += 2)
            n === 'margin' && (u += C.css(t, n + ft[a], !0, i)),
              o
                ? (n === 'content' && (l -= C.css(t, `padding${ft[a]}`, !0, i)), n !== 'margin' && (l -= C.css(t, `border${ft[a]}Width`, !0, i)))
                : ((l += C.css(t, `padding${ft[a]}`, !0, i)),
                  n !== 'padding' ? (l += C.css(t, `border${ft[a]}Width`, !0, i)) : (s += C.css(t, `border${ft[a]}Width`, !0, i)));
          return !o && r >= 0 && (l += Math.max(0, Math.ceil(t[`offset${e[0].toUpperCase()}${e.slice(1)}`] - r - l - s - 0.5)) || 0), l + u;
        }
        function ce(t, e, n) {
          const o = Kt(t);
          let i = (!m.boxSizingReliable() || n) && C.css(t, 'boxSizing', !1, o) === 'border-box';
          let r = i;
          let a = Qt(t, e, o);
          const s = `offset${e[0].toUpperCase()}${e.slice(1)}`;
          if (Xt.test(a)) {
            if (!n) return a;
            a = 'auto';
          }
          return (
            ((!m.boxSizingReliable() && i) ||
              (!m.reliableTrDimensions() && S(t, 'tr')) ||
              a === 'auto' ||
              (!parseFloat(a) && C.css(t, 'display', !1, o) === 'inline')) &&
              t.getClientRects().length &&
              ((i = C.css(t, 'boxSizing', !1, o) === 'border-box'), (r = s in t) && (a = t[s])),
            `${(a = parseFloat(a) || 0) + ue(t, e, n || (i ? 'border' : 'content'), r, o, a)}px`
          );
        }
        function de(t, e, n, o, i) {
          return new de.prototype.init(t, e, n, o, i);
        }
        C.extend({
          cssHooks: {
            opacity: {
              get(t, e) {
                if (e) {
                  const n = Qt(t, 'opacity');
                  return n === '' ? '1' : n;
                }
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
          style(t, e, n, o) {
            if (t && t.nodeType !== 3 && t.nodeType !== 8 && t.style) {
              let i;
              let r;
              let a;
              const s = it(e);
              const l = Zt.test(e);
              const u = t.style;
              if ((l || (e = ie(s)), (a = C.cssHooks[e] || C.cssHooks[s]), void 0 === n)) return a && 'get' in a && void 0 !== (i = a.get(t, !1, o)) ? i : u[e];
              (r = typeof n) === 'string' && (i = ht.exec(n)) && i[1] && ((n = bt(t, e, i)), (r = 'number')),
                n != null &&
                  n == n &&
                  (r !== 'number' || l || (n += (i && i[3]) || (C.cssNumber[s] ? '' : 'px')),
                  m.clearCloneStyle || n !== '' || e.indexOf('background') !== 0 || (u[e] = 'inherit'),
                  (a && 'set' in a && void 0 === (n = a.set(t, n, o))) || (l ? u.setProperty(e, n) : (u[e] = n)));
            }
          },
          css(t, e, n, o) {
            let i;
            let r;
            let a;
            const s = it(e);
            return (
              Zt.test(e) || (e = ie(s)),
              (a = C.cssHooks[e] || C.cssHooks[s]) && 'get' in a && (i = a.get(t, !0, n)),
              void 0 === i && (i = Qt(t, e, o)),
              i === 'normal' && e in se && (i = se[e]),
              n === '' || n ? ((r = parseFloat(i)), !0 === n || isFinite(r) ? r || 0 : i) : i
            );
          },
        }),
          C.each(['height', 'width'], function (t, e) {
            C.cssHooks[e] = {
              get(t, n, o) {
                if (n)
                  return !re.test(C.css(t, 'display')) || (t.getClientRects().length && t.getBoundingClientRect().width)
                    ? ce(t, e, o)
                    : Jt(t, ae, function () {
                        return ce(t, e, o);
                      });
              },
              set(t, n, o) {
                let i;
                const r = Kt(t);
                const a = !m.scrollboxSize() && r.position === 'absolute';
                const s = (a || o) && C.css(t, 'boxSizing', !1, r) === 'border-box';
                let l = o ? ue(t, e, o, s, r) : 0;
                return (
                  s && a && (l -= Math.ceil(t[`offset${e[0].toUpperCase()}${e.slice(1)}`] - parseFloat(r[e]) - ue(t, e, 'border', !1, r) - 0.5)),
                  l && (i = ht.exec(n)) && (i[3] || 'px') !== 'px' && ((t.style[e] = n), (n = C.css(t, e))),
                  le(0, n, l)
                );
              },
            };
          }),
          (C.cssHooks.marginLeft = te(m.reliableMarginLeft, function (t, e) {
            if (e)
              return `${
                parseFloat(Qt(t, 'marginLeft')) ||
                t.getBoundingClientRect().left -
                  Jt(t, { marginLeft: 0 }, function () {
                    return t.getBoundingClientRect().left;
                  })
              }px`;
          })),
          C.each({ margin: '', padding: '', border: 'Width' }, function (t, e) {
            (C.cssHooks[t + e] = {
              expand(n) {
                for (var o = 0, i = {}, r = typeof n === 'string' ? n.split(' ') : [n]; o < 4; o++) i[t + ft[o] + e] = r[o] || r[o - 2] || r[0];
                return i;
              },
            }),
              t !== 'margin' && (C.cssHooks[t + e].set = le);
          }),
          C.fn.extend({
            css(t, e) {
              return tt(
                this,
                function (t, e, n) {
                  let o;
                  let i;
                  const r = {};
                  let a = 0;
                  if (Array.isArray(e)) {
                    for (o = Kt(t), i = e.length; a < i; a++) r[e[a]] = C.css(t, e[a], !1, o);
                    return r;
                  }
                  return void 0 !== n ? C.style(t, e, n) : C.css(t, e);
                },
                t,
                e,
                arguments.length > 1,
              );
            },
          }),
          (C.Tween = de),
          (de.prototype = {
            constructor: de,
            init(t, e, n, o, i, r) {
              (this.elem = t),
                (this.prop = n),
                (this.easing = i || C.easing._default),
                (this.options = e),
                (this.start = this.now = this.cur()),
                (this.end = o),
                (this.unit = r || (C.cssNumber[n] ? '' : 'px'));
            },
            cur() {
              const t = de.propHooks[this.prop];
              return t && t.get ? t.get(this) : de.propHooks._default.get(this);
            },
            run(t) {
              let e;
              const n = de.propHooks[this.prop];
              return (
                this.options.duration ? (this.pos = e = C.easing[this.easing](t, this.options.duration * t, 0, 1, this.options.duration)) : (this.pos = e = t),
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
              get(t) {
                let e;
                return t.elem.nodeType !== 1 || (t.elem[t.prop] != null && t.elem.style[t.prop] == null)
                  ? t.elem[t.prop]
                  : (e = C.css(t.elem, t.prop, '')) && e !== 'auto'
                  ? e
                  : 0;
              },
              set(t) {
                C.fx.step[t.prop]
                  ? C.fx.step[t.prop](t)
                  : t.elem.nodeType !== 1 || (!C.cssHooks[t.prop] && t.elem.style[ie(t.prop)] == null)
                  ? (t.elem[t.prop] = t.now)
                  : C.style(t.elem, t.prop, t.now + t.unit);
              },
            },
          }),
          (de.propHooks.scrollTop = de.propHooks.scrollLeft =
            {
              set(t) {
                t.elem.nodeType && t.elem.parentNode && (t.elem[t.prop] = t.now);
              },
            }),
          (C.easing = {
            linear(t) {
              return t;
            },
            swing(t) {
              return 0.5 - Math.cos(t * Math.PI) / 2;
            },
            _default: 'swing',
          }),
          (C.fx = de.prototype.init),
          (C.fx.step = {});
        let pe;
        let he;
        const fe = /^(?:toggle|show|hide)$/;
        const ge = /queueHooks$/;
        function me() {
          he && (!1 === b.hidden && o.requestAnimationFrame ? o.requestAnimationFrame(me) : o.setTimeout(me, C.fx.interval), C.fx.tick());
        }
        function ye() {
          return (
            o.setTimeout(function () {
              pe = void 0;
            }),
            (pe = Date.now())
          );
        }
        function ve(t, e) {
          let n;
          let o = 0;
          const i = { height: t };
          for (e = e ? 1 : 0; o < 4; o += 2 - e) i[`margin${(n = ft[o])}`] = i[`padding${n}`] = t;
          return e && (i.opacity = i.width = t), i;
        }
        function be(t, e, n) {
          for (var o, i = (xe.tweeners[e] || []).concat(xe.tweeners['*']), r = 0, a = i.length; r < a; r++) if ((o = i[r].call(n, e, t))) return o;
        }
        function xe(t, e, n) {
          let o;
          let i;
          let r = 0;
          const a = xe.prefilters.length;
          const s = C.Deferred().always(function () {
            delete l.elem;
          });
          var l = function () {
            if (i) return !1;
            for (var e = pe || ye(), n = Math.max(0, u.startTime + u.duration - e), o = 1 - (n / u.duration || 0), r = 0, a = u.tweens.length; r < a; r++)
              u.tweens[r].run(o);
            return s.notifyWith(t, [u, o, n]), o < 1 && a ? n : (a || s.notifyWith(t, [u, 1, 0]), s.resolveWith(t, [u]), !1);
          };
          var u = s.promise({
            elem: t,
            props: C.extend({}, e),
            opts: C.extend(!0, { specialEasing: {}, easing: C.easing._default }, n),
            originalProperties: e,
            originalOptions: n,
            startTime: pe || ye(),
            duration: n.duration,
            tweens: [],
            createTween(e, n) {
              const o = C.Tween(t, u.opts, e, n, u.opts.specialEasing[e] || u.opts.easing);
              return u.tweens.push(o), o;
            },
            stop(e) {
              let n = 0;
              const o = e ? u.tweens.length : 0;
              if (i) return this;
              for (i = !0; n < o; n++) u.tweens[n].run(1);
              return e ? (s.notifyWith(t, [u, 1, 0]), s.resolveWith(t, [u, e])) : s.rejectWith(t, [u, e]), this;
            },
          });
          const c = u.props;
          for (
            !(function (t, e) {
              let n;
              let o;
              let i;
              let r;
              let a;
              for (n in t)
                if (
                  ((i = e[(o = it(n))]),
                  (r = t[n]),
                  Array.isArray(r) && ((i = r[1]), (r = t[n] = r[0])),
                  n !== o && ((t[o] = r), delete t[n]),
                  (a = C.cssHooks[o]) && ('expand' in a))
                )
                  for (n in ((r = a.expand(r)), delete t[o], r)) (n in t) || ((t[n] = r[n]), (e[n] = i));
                else e[o] = i;
            })(c, u.opts.specialEasing);
            r < a;
            r++
          )
            if ((o = xe.prefilters[r].call(u, t, c, u.opts))) return y(o.stop) && (C._queueHooks(u.elem, u.opts.queue).stop = o.stop.bind(o)), o;
          return (
            C.map(c, be, u),
            y(u.opts.start) && u.opts.start.call(t, u),
            u.progress(u.opts.progress).done(u.opts.done, u.opts.complete).fail(u.opts.fail).always(u.opts.always),
            C.fx.timer(C.extend(l, { elem: t, anim: u, queue: u.opts.queue })),
            u
          );
        }
        (C.Animation = C.extend(xe, {
          tweeners: {
            '*': [
              function (t, e) {
                const n = this.createTween(t, e);
                return bt(n.elem, t, ht.exec(e), n), n;
              },
            ],
          },
          tweener(t, e) {
            y(t) ? ((e = t), (t = ['*'])) : (t = t.match(Y));
            for (var n, o = 0, i = t.length; o < i; o++) (n = t[o]), (xe.tweeners[n] = xe.tweeners[n] || []), xe.tweeners[n].unshift(e);
          },
          prefilters: [
            function (t, e, n) {
              let o;
              let i;
              let r;
              let a;
              let s;
              let l;
              let u;
              let c;
              const d = 'width' in e || 'height' in e;
              const p = this;
              const h = {};
              const f = t.style;
              let g = t.nodeType && vt(t);
              let m = st.get(t, 'fxshow');
              for (o in (n.queue ||
                ((a = C._queueHooks(t, 'fx')).unqueued == null &&
                  ((a.unqueued = 0),
                  (s = a.empty.fire),
                  (a.empty.fire = function () {
                    a.unqueued || s();
                  })),
                a.unqueued++,
                p.always(function () {
                  p.always(function () {
                    a.unqueued--, C.queue(t, 'fx').length || a.empty.fire();
                  });
                })),
              e))
                if (((i = e[o]), fe.test(i))) {
                  if ((delete e[o], (r = r || i === 'toggle'), i === (g ? 'hide' : 'show'))) {
                    if (i !== 'show' || !m || void 0 === m[o]) continue;
                    g = !0;
                  }
                  h[o] = (m && m[o]) || C.style(t, o);
                }
              if ((l = !C.isEmptyObject(e)) || !C.isEmptyObject(h))
                for (o in (d &&
                  t.nodeType === 1 &&
                  ((n.overflow = [f.overflow, f.overflowX, f.overflowY]),
                  (u = m && m.display) == null && (u = st.get(t, 'display')),
                  (c = C.css(t, 'display')) === 'none' && (u ? (c = u) : (wt([t], !0), (u = t.style.display || u), (c = C.css(t, 'display')), wt([t]))),
                  (c === 'inline' || (c === 'inline-block' && u != null)) &&
                    C.css(t, 'float') === 'none' &&
                    (l ||
                      (p.done(function () {
                        f.display = u;
                      }),
                      u == null && ((c = f.display), (u = c === 'none' ? '' : c))),
                    (f.display = 'inline-block'))),
                n.overflow &&
                  ((f.overflow = 'hidden'),
                  p.always(function () {
                    (f.overflow = n.overflow[0]), (f.overflowX = n.overflow[1]), (f.overflowY = n.overflow[2]);
                  })),
                (l = !1),
                h))
                  l ||
                    (m ? 'hidden' in m && (g = m.hidden) : (m = st.access(t, 'fxshow', { display: u })),
                    r && (m.hidden = !g),
                    g && wt([t], !0),
                    p.done(function () {
                      for (o in (g || wt([t]), st.remove(t, 'fxshow'), h)) C.style(t, o, h[o]);
                    })),
                    (l = be(g ? m[o] : 0, o, p)),
                    o in m || ((m[o] = l.start), g && ((l.end = l.start), (l.start = 0)));
            },
          ],
          prefilter(t, e) {
            e ? xe.prefilters.unshift(t) : xe.prefilters.push(t);
          },
        })),
          (C.speed = function (t, e, n) {
            const o =
              t && typeof t === 'object' ? C.extend({}, t) : { complete: n || (!n && e) || (y(t) && t), duration: t, easing: (n && e) || (e && !y(e) && e) };
            return (
              C.fx.off
                ? (o.duration = 0)
                : typeof o.duration !== 'number' && (o.duration in C.fx.speeds ? (o.duration = C.fx.speeds[o.duration]) : (o.duration = C.fx.speeds._default)),
              (o.queue != null && !0 !== o.queue) || (o.queue = 'fx'),
              (o.old = o.complete),
              (o.complete = function () {
                y(o.old) && o.old.call(this), o.queue && C.dequeue(this, o.queue);
              }),
              o
            );
          }),
          C.fn.extend({
            fadeTo(t, e, n, o) {
              return this.filter(vt).css('opacity', 0).show().end().animate({ opacity: e }, t, n, o);
            },
            animate(t, e, n, o) {
              const i = C.isEmptyObject(t);
              const r = C.speed(e, n, o);
              const a = function () {
                const e = xe(this, C.extend({}, t), r);
                (i || st.get(this, 'finish')) && e.stop(!0);
              };
              return (a.finish = a), i || !1 === r.queue ? this.each(a) : this.queue(r.queue, a);
            },
            stop(t, e, n) {
              const o = function (t) {
                const e = t.stop;
                delete t.stop, e(n);
              };
              return (
                typeof t !== 'string' && ((n = e), (e = t), (t = void 0)),
                e && this.queue(t || 'fx', []),
                this.each(function () {
                  let e = !0;
                  let i = t != null && `${t}queueHooks`;
                  const r = C.timers;
                  const a = st.get(this);
                  if (i) a[i] && a[i].stop && o(a[i]);
                  else for (i in a) a[i] && a[i].stop && ge.test(i) && o(a[i]);
                  for (i = r.length; i--; ) r[i].elem !== this || (t != null && r[i].queue !== t) || (r[i].anim.stop(n), (e = !1), r.splice(i, 1));
                  (!e && n) || C.dequeue(this, t);
                })
              );
            },
            finish(t) {
              return (
                !1 !== t && (t = t || 'fx'),
                this.each(function () {
                  let e;
                  const n = st.get(this);
                  const o = n[`${t}queue`];
                  const i = n[`${t}queueHooks`];
                  const r = C.timers;
                  const a = o ? o.length : 0;
                  for (n.finish = !0, C.queue(this, t, []), i && i.stop && i.stop.call(this, !0), e = r.length; e--; )
                    r[e].elem === this && r[e].queue === t && (r[e].anim.stop(!0), r.splice(e, 1));
                  for (e = 0; e < a; e++) o[e] && o[e].finish && o[e].finish.call(this);
                  delete n.finish;
                })
              );
            },
          }),
          C.each(['toggle', 'show', 'hide'], function (t, e) {
            const n = C.fn[e];
            C.fn[e] = function (t, o, i) {
              return t == null || typeof t === 'boolean' ? n.apply(this, arguments) : this.animate(ve(e, !0), t, o, i);
            };
          }),
          C.each(
            {
              slideDown: ve('show'),
              slideUp: ve('hide'),
              slideToggle: ve('toggle'),
              fadeIn: { opacity: 'show' },
              fadeOut: { opacity: 'hide' },
              fadeToggle: { opacity: 'toggle' },
            },
            function (t, e) {
              C.fn[t] = function (t, n, o) {
                return this.animate(e, t, n, o);
              };
            },
          ),
          (C.timers = []),
          (C.fx.tick = function () {
            let t;
            let e = 0;
            const n = C.timers;
            for (pe = Date.now(); e < n.length; e++) (t = n[e])() || n[e] !== t || n.splice(e--, 1);
            n.length || C.fx.stop(), (pe = void 0);
          }),
          (C.fx.timer = function (t) {
            C.timers.push(t), C.fx.start();
          }),
          (C.fx.interval = 13),
          (C.fx.start = function () {
            he || ((he = !0), me());
          }),
          (C.fx.stop = function () {
            he = null;
          }),
          (C.fx.speeds = { slow: 600, fast: 200, _default: 400 }),
          (C.fn.delay = function (t, e) {
            return (
              (t = (C.fx && C.fx.speeds[t]) || t),
              (e = e || 'fx'),
              this.queue(e, function (e, n) {
                const i = o.setTimeout(e, t);
                n.stop = function () {
                  o.clearTimeout(i);
                };
              })
            );
          }),
          (function () {
            let t = b.createElement('input');
            const e = b.createElement('select').appendChild(b.createElement('option'));
            (t.type = 'checkbox'),
              (m.checkOn = t.value !== ''),
              (m.optSelected = e.selected),
              ((t = b.createElement('input')).value = 't'),
              (t.type = 'radio'),
              (m.radioValue = t.value === 't');
          })();
        let ke;
        const we = C.expr.attrHandle;
        C.fn.extend({
          attr(t, e) {
            return tt(this, C.attr, t, e, arguments.length > 1);
          },
          removeAttr(t) {
            return this.each(function () {
              C.removeAttr(this, t);
            });
          },
        }),
          C.extend({
            attr(t, e, n) {
              let o;
              let i;
              const r = t.nodeType;
              if (r !== 3 && r !== 8 && r !== 2)
                return void 0 === t.getAttribute
                  ? C.prop(t, e, n)
                  : ((r === 1 && C.isXMLDoc(t)) || (i = C.attrHooks[e.toLowerCase()] || (C.expr.match.bool.test(e) ? ke : void 0)),
                    void 0 !== n
                      ? n === null
                        ? void C.removeAttr(t, e)
                        : i && 'set' in i && void 0 !== (o = i.set(t, n, e))
                        ? o
                        : (t.setAttribute(e, `${n}`), n)
                      : i && 'get' in i && (o = i.get(t, e)) !== null
                      ? o
                      : (o = C.find.attr(t, e)) == null
                      ? void 0
                      : o);
            },
            attrHooks: {
              type: {
                set(t, e) {
                  if (!m.radioValue && e === 'radio' && S(t, 'input')) {
                    const n = t.value;
                    return t.setAttribute('type', e), n && (t.value = n), e;
                  }
                },
              },
            },
            removeAttr(t, e) {
              let n;
              let o = 0;
              const i = e && e.match(Y);
              if (i && t.nodeType === 1) for (; (n = i[o++]); ) t.removeAttribute(n);
            },
          }),
          (ke = {
            set(t, e, n) {
              return !1 === e ? C.removeAttr(t, n) : t.setAttribute(n, n), n;
            },
          }),
          C.each(C.expr.match.bool.source.match(/\w+/g), function (t, e) {
            const n = we[e] || C.find.attr;
            we[e] = function (t, e, o) {
              let i;
              let r;
              const a = e.toLowerCase();
              return o || ((r = we[a]), (we[a] = i), (i = n(t, e, o) != null ? a : null), (we[a] = r)), i;
            };
          });
        const De = /^(?:input|select|textarea|button)$/i;
        const Te = /^(?:a|area)$/i;
        function Ce(t) {
          return (t.match(Y) || []).join(' ');
        }
        function je(t) {
          return (t.getAttribute && t.getAttribute('class')) || '';
        }
        function Se(t) {
          return Array.isArray(t) ? t : (typeof t === 'string' && t.match(Y)) || [];
        }
        C.fn.extend({
          prop(t, e) {
            return tt(this, C.prop, t, e, arguments.length > 1);
          },
          removeProp(t) {
            return this.each(function () {
              delete this[C.propFix[t] || t];
            });
          },
        }),
          C.extend({
            prop(t, e, n) {
              let o;
              let i;
              const r = t.nodeType;
              if (r !== 3 && r !== 8 && r !== 2)
                return (
                  (r === 1 && C.isXMLDoc(t)) || ((e = C.propFix[e] || e), (i = C.propHooks[e])),
                  void 0 !== n
                    ? i && 'set' in i && void 0 !== (o = i.set(t, n, e))
                      ? o
                      : (t[e] = n)
                    : i && 'get' in i && (o = i.get(t, e)) !== null
                    ? o
                    : t[e]
                );
            },
            propHooks: {
              tabIndex: {
                get(t) {
                  const e = C.find.attr(t, 'tabindex');
                  return e ? parseInt(e, 10) : De.test(t.nodeName) || (Te.test(t.nodeName) && t.href) ? 0 : -1;
                },
              },
            },
            propFix: { for: 'htmlFor', class: 'className' },
          }),
          m.optSelected ||
            (C.propHooks.selected = {
              get(t) {
                const e = t.parentNode;
                return e && e.parentNode && e.parentNode.selectedIndex, null;
              },
              set(t) {
                const e = t.parentNode;
                e && (e.selectedIndex, e.parentNode && e.parentNode.selectedIndex);
              },
            }),
          C.each(
            ['tabIndex', 'readOnly', 'maxLength', 'cellSpacing', 'cellPadding', 'rowSpan', 'colSpan', 'useMap', 'frameBorder', 'contentEditable'],
            function () {
              C.propFix[this.toLowerCase()] = this;
            },
          ),
          C.fn.extend({
            addClass(t) {
              let e;
              let n;
              let o;
              let i;
              let r;
              let a;
              return y(t)
                ? this.each(function (e) {
                    C(this).addClass(t.call(this, e, je(this)));
                  })
                : (e = Se(t)).length
                ? this.each(function () {
                    if (((o = je(this)), (n = this.nodeType === 1 && ` ${Ce(o)} `))) {
                      for (r = 0; r < e.length; r++) (i = e[r]), n.indexOf(` ${i} `) < 0 && (n += `${i} `);
                      (a = Ce(n)), o !== a && this.setAttribute('class', a);
                    }
                  })
                : this;
            },
            removeClass(t) {
              let e;
              let n;
              let o;
              let i;
              let r;
              let a;
              return y(t)
                ? this.each(function (e) {
                    C(this).removeClass(t.call(this, e, je(this)));
                  })
                : arguments.length
                ? (e = Se(t)).length
                  ? this.each(function () {
                      if (((o = je(this)), (n = this.nodeType === 1 && ` ${Ce(o)} `))) {
                        for (r = 0; r < e.length; r++) for (i = e[r]; n.indexOf(` ${i} `) > -1; ) n = n.replace(` ${i} `, ' ');
                        (a = Ce(n)), o !== a && this.setAttribute('class', a);
                      }
                    })
                  : this
                : this.attr('class', '');
            },
            toggleClass(t, e) {
              let n;
              let o;
              let i;
              let r;
              const a = typeof t;
              const s = a === 'string' || Array.isArray(t);
              return y(t)
                ? this.each(function (n) {
                    C(this).toggleClass(t.call(this, n, je(this), e), e);
                  })
                : typeof e === 'boolean' && s
                ? e
                  ? this.addClass(t)
                  : this.removeClass(t)
                : ((n = Se(t)),
                  this.each(function () {
                    if (s) for (r = C(this), i = 0; i < n.length; i++) (o = n[i]), r.hasClass(o) ? r.removeClass(o) : r.addClass(o);
                    else
                      (void 0 !== t && a !== 'boolean') ||
                        ((o = je(this)) && st.set(this, '__className__', o),
                        this.setAttribute && this.setAttribute('class', o || !1 === t ? '' : st.get(this, '__className__') || ''));
                  }));
            },
            hasClass(t) {
              let e;
              let n;
              let o = 0;
              for (e = ` ${t} `; (n = this[o++]); ) if (n.nodeType === 1 && ` ${Ce(je(n))} `.indexOf(e) > -1) return !0;
              return !1;
            },
          });
        const Ee = /\r/g;
        C.fn.extend({
          val(t) {
            let e;
            let n;
            let o;
            const i = this[0];
            return arguments.length
              ? ((o = y(t)),
                this.each(function (n) {
                  let i;
                  this.nodeType === 1 &&
                    ((i = o ? t.call(this, n, C(this).val()) : t) == null
                      ? (i = '')
                      : typeof i === 'number'
                      ? (i += '')
                      : Array.isArray(i) &&
                        (i = C.map(i, function (t) {
                          return t == null ? '' : `${t}`;
                        })),
                    ((e = C.valHooks[this.type] || C.valHooks[this.nodeName.toLowerCase()]) && 'set' in e && void 0 !== e.set(this, i, 'value')) ||
                      (this.value = i));
                }))
              : i
              ? (e = C.valHooks[i.type] || C.valHooks[i.nodeName.toLowerCase()]) && 'get' in e && void 0 !== (n = e.get(i, 'value'))
                ? n
                : typeof (n = i.value) === 'string'
                ? n.replace(Ee, '')
                : n == null
                ? ''
                : n
              : void 0;
          },
        }),
          C.extend({
            valHooks: {
              option: {
                get(t) {
                  const e = C.find.attr(t, 'value');
                  return e != null ? e : Ce(C.text(t));
                },
              },
              select: {
                get(t) {
                  let e;
                  let n;
                  let o;
                  const i = t.options;
                  const r = t.selectedIndex;
                  const a = t.type === 'select-one';
                  const s = a ? null : [];
                  const l = a ? r + 1 : i.length;
                  for (o = r < 0 ? l : a ? r : 0; o < l; o++)
                    if (((n = i[o]).selected || o === r) && !n.disabled && (!n.parentNode.disabled || !S(n.parentNode, 'optgroup'))) {
                      if (((e = C(n).val()), a)) return e;
                      s.push(e);
                    }
                  return s;
                },
                set(t, e) {
                  for (var n, o, i = t.options, r = C.makeArray(e), a = i.length; a--; )
                    ((o = i[a]).selected = C.inArray(C.valHooks.option.get(o), r) > -1) && (n = !0);
                  return n || (t.selectedIndex = -1), r;
                },
              },
            },
          }),
          C.each(['radio', 'checkbox'], function () {
            (C.valHooks[this] = {
              set(t, e) {
                if (Array.isArray(e)) return (t.checked = C.inArray(C(t).val(), e) > -1);
              },
            }),
              m.checkOn ||
                (C.valHooks[this].get = function (t) {
                  return t.getAttribute('value') === null ? 'on' : t.value;
                });
          });
        const Ae = o.location;
        const $e = { guid: Date.now() };
        const Le = /\?/;
        C.parseXML = function (t) {
          let e;
          let n;
          if (!t || typeof t !== 'string') return null;
          try {
            e = new o.DOMParser().parseFromString(t, 'text/xml');
          } catch (t) {}
          return (
            (n = e && e.getElementsByTagName('parsererror')[0]),
            (e && !n) ||
              C.error(
                `Invalid XML: ${
                  n
                    ? C.map(n.childNodes, function (t) {
                        return t.textContent;
                      }).join('\n')
                    : t
                }`,
              ),
            e
          );
        };
        const _e = /^(?:focusinfocus|focusoutblur)$/;
        const Me = function (t) {
          t.stopPropagation();
        };
        C.extend(C.event, {
          trigger(t, e, n, i) {
            let r;
            let a;
            let s;
            let l;
            let u;
            let c;
            let d;
            let p;
            const f = [n || b];
            let g = h.call(t, 'type') ? t.type : t;
            let m = h.call(t, 'namespace') ? t.namespace.split('.') : [];
            if (
              ((a = p = s = n = n || b),
              n.nodeType !== 3 &&
                n.nodeType !== 8 &&
                !_e.test(g + C.event.triggered) &&
                (g.indexOf('.') > -1 && ((m = g.split('.')), (g = m.shift()), m.sort()),
                (u = g.indexOf(':') < 0 && `on${g}`),
                ((t = t[C.expando] ? t : new C.Event(g, typeof t === 'object' && t)).isTrigger = i ? 2 : 3),
                (t.namespace = m.join('.')),
                (t.rnamespace = t.namespace ? new RegExp(`(^|\\.)${m.join('\\.(?:.*\\.|)')}(\\.|$)`) : null),
                (t.result = void 0),
                t.target || (t.target = n),
                (e = e == null ? [t] : C.makeArray(e, [t])),
                (d = C.event.special[g] || {}),
                i || !d.trigger || !1 !== d.trigger.apply(n, e)))
            ) {
              if (!i && !d.noBubble && !v(n)) {
                for (l = d.delegateType || g, _e.test(l + g) || (a = a.parentNode); a; a = a.parentNode) f.push(a), (s = a);
                s === (n.ownerDocument || b) && f.push(s.defaultView || s.parentWindow || o);
              }
              for (r = 0; (a = f[r++]) && !t.isPropagationStopped(); )
                (p = a),
                  (t.type = r > 1 ? l : d.bindType || g),
                  (c = (st.get(a, 'events') || Object.create(null))[t.type] && st.get(a, 'handle')) && c.apply(a, e),
                  (c = u && a[u]) && c.apply && rt(a) && ((t.result = c.apply(a, e)), !1 === t.result && t.preventDefault());
              return (
                (t.type = g),
                i ||
                  t.isDefaultPrevented() ||
                  (d._default && !1 !== d._default.apply(f.pop(), e)) ||
                  !rt(n) ||
                  (u &&
                    y(n[g]) &&
                    !v(n) &&
                    ((s = n[u]) && (n[u] = null),
                    (C.event.triggered = g),
                    t.isPropagationStopped() && p.addEventListener(g, Me),
                    n[g](),
                    t.isPropagationStopped() && p.removeEventListener(g, Me),
                    (C.event.triggered = void 0),
                    s && (n[u] = s))),
                t.result
              );
            }
          },
          simulate(t, e, n) {
            const o = C.extend(new C.Event(), n, { type: t, isSimulated: !0 });
            C.event.trigger(o, null, e);
          },
        }),
          C.fn.extend({
            trigger(t, e) {
              return this.each(function () {
                C.event.trigger(t, e, this);
              });
            },
            triggerHandler(t, e) {
              const n = this[0];
              if (n) return C.event.trigger(t, e, n, !0);
            },
          });
        const Be = /\[\]$/;
        const Fe = /\r?\n/g;
        const He = /^(?:submit|button|image|reset|file)$/i;
        const Ne = /^(?:input|select|textarea|keygen)/i;
        function qe(t, e, n, o) {
          let i;
          if (Array.isArray(e))
            C.each(e, function (e, i) {
              n || Be.test(t) ? o(t, i) : qe(`${t}[${typeof i === 'object' && i != null ? e : ''}]`, i, n, o);
            });
          else if (n || w(e) !== 'object') o(t, e);
          else for (i in e) qe(`${t}[${i}]`, e[i], n, o);
        }
        (C.param = function (t, e) {
          let n;
          const o = [];
          const i = function (t, e) {
            const n = y(e) ? e() : e;
            o[o.length] = `${encodeURIComponent(t)}=${encodeURIComponent(n == null ? '' : n)}`;
          };
          if (t == null) return '';
          if (Array.isArray(t) || (t.jquery && !C.isPlainObject(t)))
            C.each(t, function () {
              i(this.name, this.value);
            });
          else for (n in t) qe(n, t[n], e, i);
          return o.join('&');
        }),
          C.fn.extend({
            serialize() {
              return C.param(this.serializeArray());
            },
            serializeArray() {
              return this.map(function () {
                const t = C.prop(this, 'elements');
                return t ? C.makeArray(t) : this;
              })
                .filter(function () {
                  const t = this.type;
                  return this.name && !C(this).is(':disabled') && Ne.test(this.nodeName) && !He.test(t) && (this.checked || !Ct.test(t));
                })
                .map(function (t, e) {
                  const n = C(this).val();
                  return n == null
                    ? null
                    : Array.isArray(n)
                    ? C.map(n, function (t) {
                        return { name: e.name, value: t.replace(Fe, '\r\n') };
                      })
                    : { name: e.name, value: n.replace(Fe, '\r\n') };
                })
                .get();
            },
          });
        const Oe = /%20/g;
        const Re = /#.*$/;
        const Pe = /([?&])_=[^&]*/;
        const Ie = /^(.*?):[ \t]*([^\r\n]*)$/gm;
        const We = /^(?:GET|HEAD)$/;
        const Ue = /^\/\//;
        const Ve = {};
        const ze = {};
        const Ye = '*/'.concat('*');
        const Xe = b.createElement('a');
        function Ze(t) {
          return function (e, n) {
            typeof e !== 'string' && ((n = e), (e = '*'));
            let o;
            let i = 0;
            const r = e.toLowerCase().match(Y) || [];
            if (y(n)) for (; (o = r[i++]); ) o[0] === '+' ? ((o = o.slice(1) || '*'), (t[o] = t[o] || []).unshift(n)) : (t[o] = t[o] || []).push(n);
          };
        }
        function Ke(t, e, n, o) {
          const i = {};
          const r = t === ze;
          function a(s) {
            let l;
            return (
              (i[s] = !0),
              C.each(t[s] || [], function (t, s) {
                const u = s(e, n, o);
                return typeof u !== 'string' || r || i[u] ? (r ? !(l = u) : void 0) : (e.dataTypes.unshift(u), a(u), !1);
              }),
              l
            );
          }
          return a(e.dataTypes[0]) || (!i['*'] && a('*'));
        }
        function Je(t, e) {
          let n;
          let o;
          const i = C.ajaxSettings.flatOptions || {};
          for (n in e) void 0 !== e[n] && ((i[n] ? t : o || (o = {}))[n] = e[n]);
          return o && C.extend(!0, t, o), t;
        }
        (Xe.href = Ae.href),
          C.extend({
            active: 0,
            lastModified: {},
            etag: {},
            ajaxSettings: {
              url: Ae.href,
              type: 'GET',
              isLocal: /^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(Ae.protocol),
              global: !0,
              processData: !0,
              async: !0,
              contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
              accepts: { '*': Ye, text: 'text/plain', html: 'text/html', xml: 'application/xml, text/xml', json: 'application/json, text/javascript' },
              contents: { xml: /\bxml\b/, html: /\bhtml/, json: /\bjson\b/ },
              responseFields: { xml: 'responseXML', text: 'responseText', json: 'responseJSON' },
              converters: { '* text': String, 'text html': !0, 'text json': JSON.parse, 'text xml': C.parseXML },
              flatOptions: { url: !0, context: !0 },
            },
            ajaxSetup(t, e) {
              return e ? Je(Je(t, C.ajaxSettings), e) : Je(C.ajaxSettings, t);
            },
            ajaxPrefilter: Ze(Ve),
            ajaxTransport: Ze(ze),
            ajax(t, e) {
              typeof t === 'object' && ((e = t), (t = void 0)), (e = e || {});
              let n;
              let i;
              let r;
              let a;
              let s;
              let l;
              let u;
              let c;
              let d;
              let p;
              const h = C.ajaxSetup({}, e);
              const f = h.context || h;
              const g = h.context && (f.nodeType || f.jquery) ? C(f) : C.event;
              const m = C.Deferred();
              const y = C.Callbacks('once memory');
              let v = h.statusCode || {};
              const x = {};
              const k = {};
              let w = 'canceled';
              var D = {
                readyState: 0,
                getResponseHeader(t) {
                  let e;
                  if (u) {
                    if (!a) for (a = {}; (e = Ie.exec(r)); ) a[`${e[1].toLowerCase()} `] = (a[`${e[1].toLowerCase()} `] || []).concat(e[2]);
                    e = a[`${t.toLowerCase()} `];
                  }
                  return e == null ? null : e.join(', ');
                },
                getAllResponseHeaders() {
                  return u ? r : null;
                },
                setRequestHeader(t, e) {
                  return u == null && ((t = k[t.toLowerCase()] = k[t.toLowerCase()] || t), (x[t] = e)), this;
                },
                overrideMimeType(t) {
                  return u == null && (h.mimeType = t), this;
                },
                statusCode(t) {
                  let e;
                  if (t)
                    if (u) D.always(t[D.status]);
                    else for (e in t) v[e] = [v[e], t[e]];
                  return this;
                },
                abort(t) {
                  const e = t || w;
                  return n && n.abort(e), T(0, e), this;
                },
              };
              if (
                (m.promise(D),
                (h.url = `${t || h.url || Ae.href}`.replace(Ue, `${Ae.protocol}//`)),
                (h.type = e.method || e.type || h.method || h.type),
                (h.dataTypes = (h.dataType || '*').toLowerCase().match(Y) || ['']),
                h.crossDomain == null)
              ) {
                l = b.createElement('a');
                try {
                  (l.href = h.url), (l.href = l.href), (h.crossDomain = `${Xe.protocol}//${Xe.host}` != `${l.protocol}//${l.host}`);
                } catch (t) {
                  h.crossDomain = !0;
                }
              }
              if ((h.data && h.processData && typeof h.data !== 'string' && (h.data = C.param(h.data, h.traditional)), Ke(Ve, h, e, D), u)) return D;
              for (d in ((c = C.event && h.global) && C.active++ === 0 && C.event.trigger('ajaxStart'),
              (h.type = h.type.toUpperCase()),
              (h.hasContent = !We.test(h.type)),
              (i = h.url.replace(Re, '')),
              h.hasContent
                ? h.data && h.processData && (h.contentType || '').indexOf('application/x-www-form-urlencoded') === 0 && (h.data = h.data.replace(Oe, '+'))
                : ((p = h.url.slice(i.length)),
                  h.data && (h.processData || typeof h.data === 'string') && ((i += (Le.test(i) ? '&' : '?') + h.data), delete h.data),
                  !1 === h.cache && ((i = i.replace(Pe, '$1')), (p = `${Le.test(i) ? '&' : '?'}_=${$e.guid++}${p}`)),
                  (h.url = i + p)),
              h.ifModified &&
                (C.lastModified[i] && D.setRequestHeader('If-Modified-Since', C.lastModified[i]), C.etag[i] && D.setRequestHeader('If-None-Match', C.etag[i])),
              ((h.data && h.hasContent && !1 !== h.contentType) || e.contentType) && D.setRequestHeader('Content-Type', h.contentType),
              D.setRequestHeader(
                'Accept',
                h.dataTypes[0] && h.accepts[h.dataTypes[0]] ? h.accepts[h.dataTypes[0]] + (h.dataTypes[0] !== '*' ? `, ${Ye}; q=0.01` : '') : h.accepts['*'],
              ),
              h.headers))
                D.setRequestHeader(d, h.headers[d]);
              if (h.beforeSend && (!1 === h.beforeSend.call(f, D, h) || u)) return D.abort();
              if (((w = 'abort'), y.add(h.complete), D.done(h.success), D.fail(h.error), (n = Ke(ze, h, e, D)))) {
                if (((D.readyState = 1), c && g.trigger('ajaxSend', [D, h]), u)) return D;
                h.async &&
                  h.timeout > 0 &&
                  (s = o.setTimeout(function () {
                    D.abort('timeout');
                  }, h.timeout));
                try {
                  (u = !1), n.send(x, T);
                } catch (t) {
                  if (u) throw t;
                  T(-1, t);
                }
              } else T(-1, 'No Transport');
              function T(t, e, a, l) {
                let d;
                let p;
                let b;
                let x;
                let k;
                let w = e;
                u ||
                  ((u = !0),
                  s && o.clearTimeout(s),
                  (n = void 0),
                  (r = l || ''),
                  (D.readyState = t > 0 ? 4 : 0),
                  (d = (t >= 200 && t < 300) || t === 304),
                  a &&
                    (x = (function (t, e, n) {
                      for (var o, i, r, a, s = t.contents, l = t.dataTypes; l[0] === '*'; )
                        l.shift(), void 0 === o && (o = t.mimeType || e.getResponseHeader('Content-Type'));
                      if (o)
                        for (i in s)
                          if (s[i] && s[i].test(o)) {
                            l.unshift(i);
                            break;
                          }
                      if (l[0] in n) r = l[0];
                      else {
                        for (i in n) {
                          if (!l[0] || t.converters[`${i} ${l[0]}`]) {
                            r = i;
                            break;
                          }
                          a || (a = i);
                        }
                        r = r || a;
                      }
                      if (r) return r !== l[0] && l.unshift(r), n[r];
                    })(h, D, a)),
                  !d && C.inArray('script', h.dataTypes) > -1 && C.inArray('json', h.dataTypes) < 0 && (h.converters['text script'] = function () {}),
                  (x = (function (t, e, n, o) {
                    let i;
                    let r;
                    let a;
                    let s;
                    let l;
                    const u = {};
                    const c = t.dataTypes.slice();
                    if (c[1]) for (a in t.converters) u[a.toLowerCase()] = t.converters[a];
                    for (r = c.shift(); r; )
                      if (
                        (t.responseFields[r] && (n[t.responseFields[r]] = e),
                        !l && o && t.dataFilter && (e = t.dataFilter(e, t.dataType)),
                        (l = r),
                        (r = c.shift()))
                      )
                        if (r === '*') r = l;
                        else if (l !== '*' && l !== r) {
                          if (!(a = u[`${l} ${r}`] || u[`* ${r}`]))
                            for (i in u)
                              if ((s = i.split(' '))[1] === r && (a = u[`${l} ${s[0]}`] || u[`* ${s[0]}`])) {
                                !0 === a ? (a = u[i]) : !0 !== u[i] && ((r = s[0]), c.unshift(s[1]));
                                break;
                              }
                          if (!0 !== a)
                            if (a && t.throws) e = a(e);
                            else
                              try {
                                e = a(e);
                              } catch (t) {
                                return { state: 'parsererror', error: a ? t : `No conversion from ${l} to ${r}` };
                              }
                        }
                    return { state: 'success', data: e };
                  })(h, x, D, d)),
                  d
                    ? (h.ifModified &&
                        ((k = D.getResponseHeader('Last-Modified')) && (C.lastModified[i] = k), (k = D.getResponseHeader('etag')) && (C.etag[i] = k)),
                      t === 204 || h.type === 'HEAD'
                        ? (w = 'nocontent')
                        : t === 304
                        ? (w = 'notmodified')
                        : ((w = x.state), (p = x.data), (d = !(b = x.error))))
                    : ((b = w), (!t && w) || ((w = 'error'), t < 0 && (t = 0))),
                  (D.status = t),
                  (D.statusText = `${e || w}`),
                  d ? m.resolveWith(f, [p, w, D]) : m.rejectWith(f, [D, w, b]),
                  D.statusCode(v),
                  (v = void 0),
                  c && g.trigger(d ? 'ajaxSuccess' : 'ajaxError', [D, h, d ? p : b]),
                  y.fireWith(f, [D, w]),
                  c && (g.trigger('ajaxComplete', [D, h]), --C.active || C.event.trigger('ajaxStop')));
              }
              return D;
            },
            getJSON(t, e, n) {
              return C.get(t, e, n, 'json');
            },
            getScript(t, e) {
              return C.get(t, void 0, e, 'script');
            },
          }),
          C.each(['get', 'post'], function (t, e) {
            C[e] = function (t, n, o, i) {
              return (
                y(n) && ((i = i || o), (o = n), (n = void 0)), C.ajax(C.extend({ url: t, type: e, dataType: i, data: n, success: o }, C.isPlainObject(t) && t))
              );
            };
          }),
          C.ajaxPrefilter(function (t) {
            let e;
            for (e in t.headers) e.toLowerCase() === 'content-type' && (t.contentType = t.headers[e] || '');
          }),
          (C._evalUrl = function (t, e, n) {
            return C.ajax({
              url: t,
              type: 'GET',
              dataType: 'script',
              cache: !0,
              async: !1,
              global: !1,
              converters: { 'text script': function () {} },
              dataFilter(t) {
                C.globalEval(t, e, n);
              },
            });
          }),
          C.fn.extend({
            wrapAll(t) {
              let e;
              return (
                this[0] &&
                  (y(t) && (t = t.call(this[0])),
                  (e = C(t, this[0].ownerDocument).eq(0).clone(!0)),
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
            wrapInner(t) {
              return y(t)
                ? this.each(function (e) {
                    C(this).wrapInner(t.call(this, e));
                  })
                : this.each(function () {
                    const e = C(this);
                    const n = e.contents();
                    n.length ? n.wrapAll(t) : e.append(t);
                  });
            },
            wrap(t) {
              const e = y(t);
              return this.each(function (n) {
                C(this).wrapAll(e ? t.call(this, n) : t);
              });
            },
            unwrap(t) {
              return (
                this.parent(t)
                  .not('body')
                  .each(function () {
                    C(this).replaceWith(this.childNodes);
                  }),
                this
              );
            },
          }),
          (C.expr.pseudos.hidden = function (t) {
            return !C.expr.pseudos.visible(t);
          }),
          (C.expr.pseudos.visible = function (t) {
            return !!(t.offsetWidth || t.offsetHeight || t.getClientRects().length);
          }),
          (C.ajaxSettings.xhr = function () {
            try {
              return new o.XMLHttpRequest();
            } catch (t) {}
          });
        const Ge = { 0: 200, 1223: 204 };
        let Qe = C.ajaxSettings.xhr();
        (m.cors = !!Qe && 'withCredentials' in Qe),
          (m.ajax = Qe = !!Qe),
          C.ajaxTransport(function (t) {
            let e;
            let n;
            if (m.cors || (Qe && !t.crossDomain))
              return {
                send(i, r) {
                  let a;
                  const s = t.xhr();
                  if ((s.open(t.type, t.url, t.async, t.username, t.password), t.xhrFields)) for (a in t.xhrFields) s[a] = t.xhrFields[a];
                  for (a in (t.mimeType && s.overrideMimeType && s.overrideMimeType(t.mimeType),
                  t.crossDomain || i['X-Requested-With'] || (i['X-Requested-With'] = 'XMLHttpRequest'),
                  i))
                    s.setRequestHeader(a, i[a]);
                  (e = function (t) {
                    return function () {
                      e &&
                        ((e = n = s.onload = s.onerror = s.onabort = s.ontimeout = s.onreadystatechange = null),
                        t === 'abort'
                          ? s.abort()
                          : t === 'error'
                          ? typeof s.status !== 'number'
                            ? r(0, 'error')
                            : r(s.status, s.statusText)
                          : r(
                              Ge[s.status] || s.status,
                              s.statusText,
                              (s.responseType || 'text') !== 'text' || typeof s.responseText !== 'string' ? { binary: s.response } : { text: s.responseText },
                              s.getAllResponseHeaders(),
                            ));
                    };
                  }),
                    (s.onload = e()),
                    (n = s.onerror = s.ontimeout = e('error')),
                    void 0 !== s.onabort
                      ? (s.onabort = n)
                      : (s.onreadystatechange = function () {
                          s.readyState === 4 &&
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
                abort() {
                  e && e();
                },
              };
          }),
          C.ajaxPrefilter(function (t) {
            t.crossDomain && (t.contents.script = !1);
          }),
          C.ajaxSetup({
            accepts: { script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript' },
            contents: { script: /\b(?:java|ecma)script\b/ },
            converters: {
              'text script': function (t) {
                return C.globalEval(t), t;
              },
            },
          }),
          C.ajaxPrefilter('script', function (t) {
            void 0 === t.cache && (t.cache = !1), t.crossDomain && (t.type = 'GET');
          }),
          C.ajaxTransport('script', function (t) {
            let e;
            let n;
            if (t.crossDomain || t.scriptAttrs)
              return {
                send(o, i) {
                  (e = C('<script>')
                    .attr(t.scriptAttrs || {})
                    .prop({ charset: t.scriptCharset, src: t.url })
                    .on(
                      'load error',
                      (n = function (t) {
                        e.remove(), (n = null), t && i(t.type === 'error' ? 404 : 200, t.type);
                      }),
                    )),
                    b.head.appendChild(e[0]);
                },
                abort() {
                  n && n();
                },
              };
          });
        let tn;
        const en = [];
        const nn = /(=)\?(?=&|$)|\?\?/;
        C.ajaxSetup({
          jsonp: 'callback',
          jsonpCallback() {
            const t = en.pop() || `${C.expando}_${$e.guid++}`;
            return (this[t] = !0), t;
          },
        }),
          C.ajaxPrefilter('json jsonp', function (t, e, n) {
            let i;
            let r;
            let a;
            const s =
              !1 !== t.jsonp &&
              (nn.test(t.url)
                ? 'url'
                : typeof t.data === 'string' && (t.contentType || '').indexOf('application/x-www-form-urlencoded') === 0 && nn.test(t.data) && 'data');
            if (s || t.dataTypes[0] === 'jsonp')
              return (
                (i = t.jsonpCallback = y(t.jsonpCallback) ? t.jsonpCallback() : t.jsonpCallback),
                s ? (t[s] = t[s].replace(nn, `$1${i}`)) : !1 !== t.jsonp && (t.url += `${(Le.test(t.url) ? '&' : '?') + t.jsonp}=${i}`),
                (t.converters['script json'] = function () {
                  return a || C.error(`${i} was not called`), a[0];
                }),
                (t.dataTypes[0] = 'json'),
                (r = o[i]),
                (o[i] = function () {
                  a = arguments;
                }),
                n.always(function () {
                  void 0 === r ? C(o).removeProp(i) : (o[i] = r),
                    t[i] && ((t.jsonpCallback = e.jsonpCallback), en.push(i)),
                    a && y(r) && r(a[0]),
                    (a = r = void 0);
                }),
                'script'
              );
          }),
          (m.createHTMLDocument = (((tn = b.implementation.createHTMLDocument('').body).innerHTML = '<form></form><form></form>'), tn.childNodes.length === 2)),
          (C.parseHTML = function (t, e, n) {
            return typeof t !== 'string'
              ? []
              : (typeof e === 'boolean' && ((n = e), (e = !1)),
                e ||
                  (m.createHTMLDocument
                    ? (((o = (e = b.implementation.createHTMLDocument('')).createElement('base')).href = b.location.href), e.head.appendChild(o))
                    : (e = b)),
                (r = !n && []),
                (i = R.exec(t)) ? [e.createElement(i[1])] : ((i = _t([t], e, r)), r && r.length && C(r).remove(), C.merge([], i.childNodes)));
            let o;
            let i;
            let r;
          }),
          (C.fn.load = function (t, e, n) {
            let o;
            let i;
            let r;
            const a = this;
            const s = t.indexOf(' ');
            return (
              s > -1 && ((o = Ce(t.slice(s))), (t = t.slice(0, s))),
              y(e) ? ((n = e), (e = void 0)) : e && typeof e === 'object' && (i = 'POST'),
              a.length > 0 &&
                C.ajax({ url: t, type: i || 'GET', dataType: 'html', data: e })
                  .done(function (t) {
                    (r = arguments), a.html(o ? C('<div>').append(C.parseHTML(t)).find(o) : t);
                  })
                  .always(
                    n &&
                      function (t, e) {
                        a.each(function () {
                          n.apply(this, r || [t.responseText, e, t]);
                        });
                      },
                  ),
              this
            );
          }),
          (C.expr.pseudos.animated = function (t) {
            return C.grep(C.timers, function (e) {
              return t === e.elem;
            }).length;
          }),
          (C.offset = {
            setOffset(t, e, n) {
              let o;
              let i;
              let r;
              let a;
              let s;
              let l;
              const u = C.css(t, 'position');
              const c = C(t);
              const d = {};
              u === 'static' && (t.style.position = 'relative'),
                (s = c.offset()),
                (r = C.css(t, 'top')),
                (l = C.css(t, 'left')),
                (u === 'absolute' || u === 'fixed') && (r + l).indexOf('auto') > -1
                  ? ((a = (o = c.position()).top), (i = o.left))
                  : ((a = parseFloat(r) || 0), (i = parseFloat(l) || 0)),
                y(e) && (e = e.call(t, n, C.extend({}, s))),
                e.top != null && (d.top = e.top - s.top + a),
                e.left != null && (d.left = e.left - s.left + i),
                'using' in e ? e.using.call(t, d) : c.css(d);
            },
          }),
          C.fn.extend({
            offset(t) {
              if (arguments.length)
                return void 0 === t
                  ? this
                  : this.each(function (e) {
                      C.offset.setOffset(this, t, e);
                    });
              let e;
              let n;
              const o = this[0];
              return o
                ? o.getClientRects().length
                  ? ((e = o.getBoundingClientRect()), (n = o.ownerDocument.defaultView), { top: e.top + n.pageYOffset, left: e.left + n.pageXOffset })
                  : { top: 0, left: 0 }
                : void 0;
            },
            position() {
              if (this[0]) {
                let t;
                let e;
                let n;
                const o = this[0];
                let i = { top: 0, left: 0 };
                if (C.css(o, 'position') === 'fixed') e = o.getBoundingClientRect();
                else {
                  for (
                    e = this.offset(), n = o.ownerDocument, t = o.offsetParent || n.documentElement;
                    t && (t === n.body || t === n.documentElement) && C.css(t, 'position') === 'static';

                  )
                    t = t.parentNode;
                  t &&
                    t !== o &&
                    t.nodeType === 1 &&
                    (((i = C(t).offset()).top += C.css(t, 'borderTopWidth', !0)), (i.left += C.css(t, 'borderLeftWidth', !0)));
                }
                return { top: e.top - i.top - C.css(o, 'marginTop', !0), left: e.left - i.left - C.css(o, 'marginLeft', !0) };
              }
            },
            offsetParent() {
              return this.map(function () {
                for (var t = this.offsetParent; t && C.css(t, 'position') === 'static'; ) t = t.offsetParent;
                return t || gt;
              });
            },
          }),
          C.each({ scrollLeft: 'pageXOffset', scrollTop: 'pageYOffset' }, function (t, e) {
            const n = e === 'pageYOffset';
            C.fn[t] = function (o) {
              return tt(
                this,
                function (t, o, i) {
                  let r;
                  if ((v(t) ? (r = t) : t.nodeType === 9 && (r = t.defaultView), void 0 === i)) return r ? r[e] : t[o];
                  r ? r.scrollTo(n ? r.pageXOffset : i, n ? i : r.pageYOffset) : (t[o] = i);
                },
                t,
                o,
                arguments.length,
              );
            };
          }),
          C.each(['top', 'left'], function (t, e) {
            C.cssHooks[e] = te(m.pixelPosition, function (t, n) {
              if (n) return (n = Qt(t, e)), Xt.test(n) ? `${C(t).position()[e]}px` : n;
            });
          }),
          C.each({ Height: 'height', Width: 'width' }, function (t, e) {
            C.each({ padding: `inner${t}`, content: e, '': `outer${t}` }, function (n, o) {
              C.fn[o] = function (i, r) {
                const a = arguments.length && (n || typeof i !== 'boolean');
                const s = n || (!0 === i || !0 === r ? 'margin' : 'border');
                return tt(
                  this,
                  function (e, n, i) {
                    let r;
                    return v(e)
                      ? o.indexOf('outer') === 0
                        ? e[`inner${t}`]
                        : e.document.documentElement[`client${t}`]
                      : e.nodeType === 9
                      ? ((r = e.documentElement), Math.max(e.body[`scroll${t}`], r[`scroll${t}`], e.body[`offset${t}`], r[`offset${t}`], r[`client${t}`]))
                      : void 0 === i
                      ? C.css(e, n, s)
                      : C.style(e, n, i, s);
                  },
                  e,
                  a ? i : void 0,
                  a,
                );
              };
            });
          }),
          C.each(['ajaxStart', 'ajaxStop', 'ajaxComplete', 'ajaxError', 'ajaxSuccess', 'ajaxSend'], function (t, e) {
            C.fn[e] = function (t) {
              return this.on(e, t);
            };
          }),
          C.fn.extend({
            bind(t, e, n) {
              return this.on(t, null, e, n);
            },
            unbind(t, e) {
              return this.off(t, null, e);
            },
            delegate(t, e, n, o) {
              return this.on(e, t, n, o);
            },
            undelegate(t, e, n) {
              return arguments.length === 1 ? this.off(t, '**') : this.off(e, t || '**', n);
            },
            hover(t, e) {
              return this.on('mouseenter', t).on('mouseleave', e || t);
            },
          }),
          C.each(
            'blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu'.split(
              ' ',
            ),
            function (t, e) {
              C.fn[e] = function (t, n) {
                return arguments.length > 0 ? this.on(e, null, t, n) : this.trigger(e);
              };
            },
          );
        const on = /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;
        (C.proxy = function (t, e) {
          let n;
          let o;
          let i;
          if ((typeof e === 'string' && ((n = t[e]), (e = t), (t = n)), y(t)))
            return (
              (o = s.call(arguments, 2)),
              (i = function () {
                return t.apply(e || this, o.concat(s.call(arguments)));
              }),
              (i.guid = t.guid = t.guid || C.guid++),
              i
            );
        }),
          (C.holdReady = function (t) {
            t ? C.readyWait++ : C.ready(!0);
          }),
          (C.isArray = Array.isArray),
          (C.parseJSON = JSON.parse),
          (C.nodeName = S),
          (C.isFunction = y),
          (C.isWindow = v),
          (C.camelCase = it),
          (C.type = w),
          (C.now = Date.now),
          (C.isNumeric = function (t) {
            const e = C.type(t);
            return (e === 'number' || e === 'string') && !isNaN(t - parseFloat(t));
          }),
          (C.trim = function (t) {
            return t == null ? '' : `${t}`.replace(on, '$1');
          }),
          void 0 ===
            (n = function () {
              return C;
            }.apply(e, [])) || (t.exports = n);
        const rn = o.jQuery;
        const an = o.$;
        return (
          (C.noConflict = function (t) {
            return o.$ === C && (o.$ = an), t && o.jQuery === C && (o.jQuery = rn), C;
          }),
          void 0 === i && (o.jQuery = o.$ = C),
          C
        );
      });
    },
  };
  const e = {};
  function n(o) {
    const i = e[o];
    if (void 0 !== i) return i.exports;
    const r = (e[o] = { exports: {} });
    return t[o].call(r.exports, r, r.exports, n), r.exports;
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
      typeof Symbol !== 'undefined' && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(t, '__esModule', { value: !0 });
    });
  const o = {};
  !(function () {
    n.r(o);
    const t = n(692);
    const e = n.n(t);
    const i = n(167);
    const r = n.n(i);
    o.default = ((window.$ = e()), (0, i.initAll)(), void (window.MOJFrontend = r()));
  })(),
    ((DTFS_PORTAL = void 0 === DTFS_PORTAL ? {} : DTFS_PORTAL).mojFrontend = o);
})();
// # sourceMappingURL=mojFrontend.js.map
