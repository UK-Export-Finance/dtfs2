let DTFS_GEF;
!(function () {
  var t = {
    d(e, n) {
      for (const i in n) t.o(n, i) && !t.o(e, i) && Object.defineProperty(e, i, { enumerable: !0, get: n[i] });
    },
    o(t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    },
    r(t) {
      typeof Symbol !== 'undefined' &&
        Symbol.toStringTag &&
        Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(t, '__esModule', { value: !0 });
    },
  };
  const e = {};
  function n(t, e) {
    if (window.NodeList.prototype.forEach) return t.forEach(e);
    for (let n = 0; n < t.length; n++) e.call(window, t[n], n, t);
  }
  function i() {
    for (
      var t = function (t) {
          const e = {};
          const n = function (t, i) {
            for (const o in t)
              if (Object.prototype.hasOwnProperty.call(t, o)) {
                const s = t[o];
                const r = i ? `${i}.${o}` : o;
                typeof s === 'object' ? n(s, r) : (e[r] = s);
              }
          };
          return n(t), e;
        },
        e = {},
        n = 0;
      n < arguments.length;
      n++
    ) {
      const i = t(arguments[n]);
      for (const o in i) Object.prototype.hasOwnProperty.call(i, o) && (e[o] = i[o]);
    }
    return e;
  }
  function o(t, e) {
    if (!t || typeof t !== 'object') throw new Error('Provide a `configObject` of type "object".');
    if (!e || typeof e !== 'string')
      throw new Error('Provide a `namespace` of type "string" to filter the `configObject` by.');
    const n = {};
    for (const i in t) {
      const o = i.split('.');
      if (Object.prototype.hasOwnProperty.call(t, i) && o[0] === e) o.length > 1 && o.shift(), (n[o.join('.')] = t[i]);
    }
    return n;
  }
  function s(t) {
    if (typeof t !== 'string') return t;
    const e = t.trim();
    return e === 'true' || (e !== 'false' && (e.length > 0 && isFinite(Number(e)) ? Number(e) : t));
  }
  function r(t) {
    const e = {};
    for (const n in t) e[n] = s(t[n]);
    return e;
  }
  function a(t, e) {
    (this.translations = t || {}), (this.locale = (e && e.locale) || document.documentElement.lang || 'en');
  }
  t.r(e),
    t.d(e, {
      default() {
        return F;
      },
    }),
    function (t) {
      let e;
      let n;
      let i;
      let o;
      ('defineProperty' in Object &&
        (function () {
          try {
            return Object.defineProperty({}, 'test', { value: 42 }), !0;
          } catch (t) {
            return !1;
          }
        })()) ||
        ((e = Object.defineProperty),
        (n = Object.prototype.hasOwnProperty('__defineGetter__')),
        (i = 'Getters & setters cannot be defined on this javascript engine'),
        (o = 'A property cannot both have accessors and be writable or have a value'),
        (Object.defineProperty = function (t, s, r) {
          if (e && (t === window || t === document || t === Element.prototype || t instanceof Element))
            return e(t, s, r);
          if (t === null || !(t instanceof Object || typeof t === 'object'))
            throw new TypeError('Object.defineProperty called on non-object');
          if (!(r instanceof Object)) throw new TypeError('Property description must be an object');
          const a = String(s);
          const l = 'value' in r || 'writable' in r;
          const c = 'get' in r && typeof r.get;
          const u = 'set' in r && typeof r.set;
          if (c) {
            if (c !== 'function') throw new TypeError('Getter must be a function');
            if (!n) throw new TypeError(i);
            if (l) throw new TypeError(o);
            Object.__defineGetter__.call(t, a, r.get);
          } else t[a] = r.value;
          if (u) {
            if (u !== 'function') throw new TypeError('Setter must be a function');
            if (!n) throw new TypeError(i);
            if (l) throw new TypeError(o);
            Object.__defineSetter__.call(t, a, r.set);
          }
          return 'value' in r && (t[a] = r.value), t;
        }));
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    ),
    function (t) {
      'Document' in this ||
        (typeof WorkerGlobalScope === 'undefined' &&
          typeof importScripts !== 'function' &&
          (this.HTMLDocument
            ? (this.Document = this.HTMLDocument)
            : ((this.Document =
                this.HTMLDocument =
                document.constructor =
                  new Function('return function Document() {}')()),
              (this.Document.prototype = document))));
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    ),
    function (t) {
      ('Element' in this && 'HTMLElement' in this) ||
        (function () {
          if (!window.Element || window.HTMLElement) {
            window.Element = window.HTMLElement = new Function('return function Element() {}')();
            var t;
            const e = document.appendChild(document.createElement('body'));
            const n = e.appendChild(document.createElement('iframe')).contentWindow.document;
            const i = (Element.prototype = n.appendChild(n.createElement('*')));
            const o = {};
            var s = function (t, e) {
              let n;
              let i;
              let r;
              const a = t.childNodes || [];
              let l = -1;
              if (t.nodeType === 1 && t.constructor !== Element)
                for (n in ((t.constructor = Element), o)) (i = o[n]), (t[n] = i);
              for (; (r = e && a[++l]); ) s(r, e);
              return t;
            };
            const r = document.getElementsByTagName('*');
            const a = document.createElement;
            var l = 100;
            i.attachEvent('onpropertychange', function (t) {
              for (var e, n = t.propertyName, s = !o.hasOwnProperty(n), a = i[n], l = o[n], c = -1; (e = r[++c]); )
                e.nodeType === 1 && (s || e[n] === l) && (e[n] = a);
              o[n] = a;
            }),
              (i.constructor = Element),
              i.hasAttribute ||
                (i.hasAttribute = function (t) {
                  return this.getAttribute(t) !== null;
                }),
              c() || ((document.onreadystatechange = c), (t = setInterval(c, 25))),
              (document.createElement = function (t) {
                const e = a(String(t).toLowerCase());
                return s(e);
              }),
              document.removeChild(e);
          } else window.HTMLElement = window.Element;
          function c() {
            return (
              l-- || clearTimeout(t),
              !(!document.body || document.body.prototype || !/(complete|interactive)/.test(document.readyState)) &&
                (s(document, !0), t && document.body.prototype && clearTimeout(t), !!document.body.prototype)
            );
          }
        })();
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    ),
    function (t) {
      (function () {
        if (!document.documentElement.dataset) return !1;
        const t = document.createElement('div');
        return t.setAttribute('data-a-b', 'c'), t.dataset && t.dataset.aB == 'c';
      })() ||
        Object.defineProperty(Element.prototype, 'dataset', {
          get() {
            for (var t = this.attributes, e = {}, n = 0; n < t.length; n++) {
              const i = t[n];
              if (i && i.name && /^data-\w[.\w-]*$/.test(i.name)) {
                const o = i.name;
                const s = i.value;
                const r = o.substr(5).replace(/-./g, function (t) {
                  return t.charAt(1).toUpperCase();
                });
                '__defineGetter__' in Object.prototype && '__defineSetter__' in Object.prototype
                  ? Object.defineProperty(e, r, {
                      enumerable: !0,
                      get: function () {
                        return this.value;
                      }.bind({ value: s || '' }),
                      set: function (t, e) {
                        void 0 !== e ? this.setAttribute(t, e) : this.removeAttribute(t);
                      }.bind(this, o),
                    })
                  : (e[r] = s);
              }
            }
            return e;
          },
        });
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    ),
    function (t) {
      'trim' in String.prototype ||
        (String.prototype.trim = function () {
          return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        });
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    ),
    (a.prototype.t = function (t, e) {
      if (!t) throw new Error('i18n: lookup key missing');
      e && typeof e.count === 'number' && (t = `${t}.${this.getPluralSuffix(t, e.count)}`);
      const n = this.translations[t];
      if (typeof n === 'string') {
        if (n.match(/%{(.\S+)}/)) {
          if (!e) throw new Error('i18n: cannot replace placeholders in string if no option data provided');
          return this.replacePlaceholders(n, e);
        }
        return n;
      }
      return t;
    }),
    (a.prototype.replacePlaceholders = function (t, e) {
      let n;
      return (
        this.hasIntlNumberFormatSupport() && (n = new Intl.NumberFormat(this.locale)),
        t.replace(/%{(.\S+)}/g, function (t, i) {
          if (Object.prototype.hasOwnProperty.call(e, i)) {
            const o = e[i];
            return !1 === o || (typeof o !== 'number' && typeof o !== 'string')
              ? ''
              : typeof o === 'number'
              ? n
                ? n.format(o)
                : o.toString()
              : o;
          }
          throw new Error(`i18n: no data found to replace ${t} placeholder in string`);
        })
      );
    }),
    (a.prototype.hasIntlPluralRulesSupport = function () {
      return Boolean(
        window.Intl && 'PluralRules' in window.Intl && Intl.PluralRules.supportedLocalesOf(this.locale).length,
      );
    }),
    (a.prototype.hasIntlNumberFormatSupport = function () {
      return Boolean(
        window.Intl && 'NumberFormat' in window.Intl && Intl.NumberFormat.supportedLocalesOf(this.locale).length,
      );
    }),
    (a.prototype.getPluralSuffix = function (t, e) {
      if (((e = Number(e)), !isFinite(e))) return 'other';
      let n;
      if (
        `${t}.${(n = this.hasIntlPluralRulesSupport()
          ? new Intl.PluralRules(this.locale).select(e)
          : this.selectPluralFormUsingFallbackRules(e))}` in this.translations
      )
        return n;
      if (`${t}.other` in this.translations)
        return (
          console &&
            'warn' in console &&
            console.warn(`i18n: Missing plural form ".${n}" for "${this.locale}" locale. Falling back to ".other".`),
          'other'
        );
      throw new Error(`i18n: Plural form ".other" is required for "${this.locale}" locale`);
    }),
    (a.prototype.selectPluralFormUsingFallbackRules = function (t) {
      t = Math.abs(Math.floor(t));
      const e = this.getPluralRulesForLocale();
      return e ? a.pluralRules[e](t) : 'other';
    }),
    (a.prototype.getPluralRulesForLocale = function () {
      const t = this.locale;
      const e = t.split('-')[0];
      for (const n in a.pluralRulesMap)
        if (Object.prototype.hasOwnProperty.call(a.pluralRulesMap, n))
          for (let i = a.pluralRulesMap[n], o = 0; o < i.length; o++) if (i[o] === t || i[o] === e) return n;
    }),
    (a.pluralRulesMap = {
      arabic: ['ar'],
      chinese: ['my', 'zh', 'id', 'ja', 'jv', 'ko', 'ms', 'th', 'vi'],
      french: ['hy', 'bn', 'fr', 'gu', 'hi', 'fa', 'pa', 'zu'],
      german: [
        'af',
        'sq',
        'az',
        'eu',
        'bg',
        'ca',
        'da',
        'nl',
        'en',
        'et',
        'fi',
        'ka',
        'de',
        'el',
        'hu',
        'lb',
        'no',
        'so',
        'sw',
        'sv',
        'ta',
        'te',
        'tr',
        'ur',
      ],
      irish: ['ga'],
      russian: ['ru', 'uk'],
      scottish: ['gd'],
      spanish: ['pt-PT', 'it', 'es'],
      welsh: ['cy'],
    }),
    (a.pluralRules = {
      arabic(t) {
        return t === 0
          ? 'zero'
          : t === 1
          ? 'one'
          : t === 2
          ? 'two'
          : t % 100 >= 3 && t % 100 <= 10
          ? 'few'
          : t % 100 >= 11 && t % 100 <= 99
          ? 'many'
          : 'other';
      },
      chinese() {
        return 'other';
      },
      french(t) {
        return t === 0 || t === 1 ? 'one' : 'other';
      },
      german(t) {
        return t === 1 ? 'one' : 'other';
      },
      irish(t) {
        return t === 1 ? 'one' : t === 2 ? 'two' : t >= 3 && t <= 6 ? 'few' : t >= 7 && t <= 10 ? 'many' : 'other';
      },
      russian(t) {
        const e = t % 100;
        const n = e % 10;
        return n === 1 && e !== 11
          ? 'one'
          : n >= 2 && n <= 4 && !(e >= 12 && e <= 14)
          ? 'few'
          : n === 0 || (n >= 5 && n <= 9) || (e >= 11 && e <= 14)
          ? 'many'
          : 'other';
      },
      scottish(t) {
        return t === 1 || t === 11
          ? 'one'
          : t === 2 || t === 12
          ? 'two'
          : (t >= 3 && t <= 10) || (t >= 13 && t <= 19)
          ? 'few'
          : 'other';
      },
      spanish(t) {
        return t === 1 ? 'one' : t % 1e6 == 0 && t !== 0 ? 'many' : 'other';
      },
      welsh(t) {
        return t === 0 ? 'zero' : t === 1 ? 'one' : t === 2 ? 'two' : t === 3 ? 'few' : t === 6 ? 'many' : 'other';
      },
    }),
    function (t) {
      let e;
      ('DOMTokenList' in this &&
        (!('classList' in (e = document.createElement('x'))) || (!e.classList.toggle('x', !1) && !e.className))) ||
        (function (e) {
          let n;
          ('DOMTokenList' in e &&
            e.DOMTokenList &&
            (!document.createElementNS ||
              !document.createElementNS('http://www.w3.org/2000/svg', 'svg') ||
              document.createElementNS('http://www.w3.org/2000/svg', 'svg').classList instanceof DOMTokenList)) ||
            (e.DOMTokenList = (function () {
              let e = !0;
              const n = function (t, n, i, o) {
                Object.defineProperty
                  ? Object.defineProperty(t, n, { configurable: !1 === e || !!o, get: i })
                  : t.__defineGetter__(n, i);
              };
              try {
                n({}, 'support');
              } catch (t) {
                e = !1;
              }
              return function (e, i) {
                const o = this;
                let s = [];
                let r = {};
                let a = 0;
                let l = 0;
                const c = function (t) {
                  n(
                    o,
                    t,
                    function () {
                      return d(), s[t];
                    },
                    !1,
                  );
                };
                const u = function () {
                  if (a >= l) for (; l < a; ++l) c(l);
                };
                var d = function () {
                  let t;
                  let n;
                  const o = arguments;
                  const l = /\s+/;
                  if (o.length)
                    for (n = 0; n < o.length; ++n)
                      if (l.test(o[n]))
                        throw (
                          (((t = new SyntaxError(`String "${o[n]}" contains an invalid character`)).code = 5),
                          (t.name = 'InvalidCharacterError'),
                          t)
                        );
                  for (
                    (s =
                      typeof e[i] === 'object'
                        ? `${e[i].baseVal}`.replace(/^\s+|\s+$/g, '').split(l)
                        : `${e[i]}`.replace(/^\s+|\s+$/g, '').split(l))[0] === '' && (s = []),
                      r = {},
                      n = 0;
                    n < s.length;
                    ++n
                  )
                    r[s[n]] = !0;
                  (a = s.length), u();
                };
                return (
                  d(),
                  n(o, 'length', function () {
                    return d(), a;
                  }),
                  (o.toLocaleString = o.toString =
                    function () {
                      return d(), s.join(' ');
                    }),
                  (o.item = function (t) {
                    return d(), s[t];
                  }),
                  (o.contains = function (t) {
                    return d(), !!r[t];
                  }),
                  (o.add = function () {
                    d.apply(o, (t = arguments));
                    for (var t, n, l = 0, c = t.length; l < c; ++l) r[(n = t[l])] || (s.push(n), (r[n] = !0));
                    a !== s.length &&
                      ((a = s.length >>> 0),
                      typeof e[i] === 'object' ? (e[i].baseVal = s.join(' ')) : (e[i] = s.join(' ')),
                      u());
                  }),
                  (o.remove = function () {
                    d.apply(o, (t = arguments));
                    for (var t, n = {}, l = 0, c = []; l < t.length; ++l) (n[t[l]] = !0), delete r[t[l]];
                    for (l = 0; l < s.length; ++l) n[s[l]] || c.push(s[l]);
                    (s = c),
                      (a = c.length >>> 0),
                      typeof e[i] === 'object' ? (e[i].baseVal = s.join(' ')) : (e[i] = s.join(' ')),
                      u();
                  }),
                  (o.toggle = function (e, n) {
                    return (
                      d.apply(o, [e]),
                      t !== n ? (n ? (o.add(e), !0) : (o.remove(e), !1)) : r[e] ? (o.remove(e), !1) : (o.add(e), !0)
                    );
                  }),
                  o
                );
              };
            })()),
            'classList' in (n = document.createElement('span')) &&
              (n.classList.toggle('x', !1),
              n.classList.contains('x') &&
                (n.classList.constructor.prototype.toggle = function (e) {
                  let n = arguments[1];
                  if (n === t) {
                    const i = !this.contains(e);
                    return this[i ? 'add' : 'remove'](e), i;
                  }
                  return this[(n = !!n) ? 'add' : 'remove'](e), n;
                })),
            (function () {
              const t = document.createElement('span');
              if ('classList' in t && (t.classList.add('a', 'b'), !t.classList.contains('b'))) {
                const e = t.classList.constructor.prototype.add;
                t.classList.constructor.prototype.add = function () {
                  for (let t = arguments, n = arguments.length, i = 0; i < n; i++) e.call(this, t[i]);
                };
              }
            })(),
            (function () {
              const t = document.createElement('span');
              if (
                'classList' in t &&
                (t.classList.add('a'), t.classList.add('b'), t.classList.remove('a', 'b'), t.classList.contains('b'))
              ) {
                const e = t.classList.constructor.prototype.remove;
                t.classList.constructor.prototype.remove = function () {
                  for (let t = arguments, n = arguments.length, i = 0; i < n; i++) e.call(this, t[i]);
                };
              }
            })();
        })(this);
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    ),
    function (t) {
      let e;
      ('document' in this &&
        'classList' in document.documentElement &&
        'Element' in this &&
        'classList' in Element.prototype &&
        ((e = document.createElement('span')).classList.add('a', 'b'), e.classList.contains('b'))) ||
        (function (t) {
          let e = !0;
          const n = function (t, n, i, o) {
            Object.defineProperty
              ? Object.defineProperty(t, n, { configurable: !1 === e || !!o, get: i })
              : t.__defineGetter__(n, i);
          };
          try {
            n({}, 'support');
          } catch (t) {
            e = !1;
          }
          const i = function (t, o, s) {
            n(
              t.prototype,
              o,
              function () {
                let t;
                const r = this;
                const a = `__defineGetter__DEFINE_PROPERTY${o}`;
                if (r[a]) return t;
                if (((r[a] = !0), !1 === e)) {
                  for (
                    var l, c = i.mirror || document.createElement('div'), u = c.childNodes, d = u.length, h = 0;
                    h < d;
                    ++h
                  )
                    if (u[h]._R === r) {
                      l = u[h];
                      break;
                    }
                  l || (l = c.appendChild(document.createElement('div'))), (t = DOMTokenList.call(l, r, s));
                } else t = new DOMTokenList(r, s);
                return (
                  n(r, o, function () {
                    return t;
                  }),
                  delete r[a],
                  t
                );
              },
              !0,
            );
          };
          i(t.Element, 'classList', 'className'),
            i(t.HTMLElement, 'classList', 'className'),
            i(t.HTMLLinkElement, 'relList', 'rel'),
            i(t.HTMLAnchorElement, 'relList', 'rel'),
            i(t.HTMLAreaElement, 'relList', 'rel');
        })(this);
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    ),
    function (t) {
      ('document' in this && 'matches' in document.documentElement) ||
        (Element.prototype.matches =
          Element.prototype.webkitMatchesSelector ||
          Element.prototype.oMatchesSelector ||
          Element.prototype.msMatchesSelector ||
          Element.prototype.mozMatchesSelector ||
          function (t) {
            for (var e = this, n = (e.document || e.ownerDocument).querySelectorAll(t), i = 0; n[i] && n[i] !== e; )
              ++i;
            return !!n[i];
          });
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    ),
    function (t) {
      ('document' in this && 'closest' in document.documentElement) ||
        (Element.prototype.closest = function (t) {
          for (let e = this; e; ) {
            if (e.matches(t)) return e;
            e = 'SVGElement' in window && e instanceof SVGElement ? e.parentNode : e.parentElement;
          }
          return null;
        });
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    ),
    function (t) {
      'Window' in this ||
        (typeof WorkerGlobalScope === 'undefined' &&
          typeof importScripts !== 'function' &&
          (function (t) {
            t.constructor
              ? (t.Window = t.constructor)
              : ((t.Window = t.constructor = new Function('return function Window() {}')()).prototype = this);
          })(this));
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    ),
    function (t) {
      (function (t) {
        if (!('Event' in t)) return !1;
        if (typeof t.Event === 'function') return !0;
        try {
          return new Event('click'), !0;
        } catch (t) {
          return !1;
        }
      })(this) ||
        (function () {
          const e = {
            click: 1,
            dblclick: 1,
            keyup: 1,
            keypress: 1,
            keydown: 1,
            mousedown: 1,
            mouseup: 1,
            mousemove: 1,
            mouseover: 1,
            mouseenter: 1,
            mouseleave: 1,
            mouseout: 1,
            storage: 1,
            storagecommit: 1,
            textinput: 1,
          };
          if (typeof document !== 'undefined' && typeof window !== 'undefined') {
            const n = (window.Event && window.Event.prototype) || null;
            (window.Event = Window.prototype.Event =
              function (e, n) {
                if (!e) throw new Error('Not enough arguments');
                let i;
                if ('createEvent' in document) {
                  i = document.createEvent('Event');
                  const o = !(!n || n.bubbles === t) && n.bubbles;
                  const s = !(!n || n.cancelable === t) && n.cancelable;
                  return i.initEvent(e, o, s), i;
                }
                return (
                  ((i = document.createEventObject()).type = e),
                  (i.bubbles = !(!n || n.bubbles === t) && n.bubbles),
                  (i.cancelable = !(!n || n.cancelable === t) && n.cancelable),
                  i
                );
              }),
              n &&
                Object.defineProperty(window.Event, 'prototype', {
                  configurable: !1,
                  enumerable: !1,
                  writable: !0,
                  value: n,
                }),
              'createEvent' in document ||
                ((window.addEventListener =
                  Window.prototype.addEventListener =
                  Document.prototype.addEventListener =
                  Element.prototype.addEventListener =
                    function () {
                      const t = this;
                      const n = arguments[0];
                      const o = arguments[1];
                      if (t === window && n in e)
                        throw new Error(
                          `In IE8 the event: ${n} is not available on the window object. Please see https://github.com/Financial-Times/polyfill-service/issues/317 for more information.`,
                        );
                      t._events || (t._events = {}),
                        t._events[n] ||
                          ((t._events[n] = function (e) {
                            let n;
                            const o = t._events[e.type].list;
                            const s = o.slice();
                            let r = -1;
                            const a = s.length;
                            for (
                              e.preventDefault = function () {
                                !1 !== e.cancelable && (e.returnValue = !1);
                              },
                                e.stopPropagation = function () {
                                  e.cancelBubble = !0;
                                },
                                e.stopImmediatePropagation = function () {
                                  (e.cancelBubble = !0), (e.cancelImmediate = !0);
                                },
                                e.currentTarget = t,
                                e.relatedTarget = e.fromElement || null,
                                e.target = e.target || e.srcElement || t,
                                e.timeStamp = new Date().getTime(),
                                e.clientX &&
                                  ((e.pageX = e.clientX + document.documentElement.scrollLeft),
                                  (e.pageY = e.clientY + document.documentElement.scrollTop));
                              ++r < a && !e.cancelImmediate;

                            )
                              r in s && i(o, (n = s[r])) !== -1 && typeof n === 'function' && n.call(t, e);
                          }),
                          (t._events[n].list = []),
                          t.attachEvent && t.attachEvent(`on${n}`, t._events[n])),
                        t._events[n].list.push(o);
                    }),
                (window.removeEventListener =
                  Window.prototype.removeEventListener =
                  Document.prototype.removeEventListener =
                  Element.prototype.removeEventListener =
                    function () {
                      let t;
                      const e = this;
                      const n = arguments[0];
                      const o = arguments[1];
                      e._events &&
                        e._events[n] &&
                        e._events[n].list &&
                        (t = i(e._events[n].list, o)) !== -1 &&
                        (e._events[n].list.splice(t, 1),
                        e._events[n].list.length ||
                          (e.detachEvent && e.detachEvent(`on${n}`, e._events[n]), delete e._events[n]));
                    }),
                (window.dispatchEvent =
                  Window.prototype.dispatchEvent =
                  Document.prototype.dispatchEvent =
                  Element.prototype.dispatchEvent =
                    function (t) {
                      if (!arguments.length) throw new Error('Not enough arguments');
                      if (!t || typeof t.type !== 'string') throw new Error('DOM Events Exception 0');
                      let e = this;
                      const n = t.type;
                      try {
                        if (!t.bubbles) {
                          t.cancelBubble = !0;
                          const i = function (t) {
                            (t.cancelBubble = !0), (e || window).detachEvent(`on${n}`, i);
                          };
                          this.attachEvent(`on${n}`, i);
                        }
                        this.fireEvent(`on${n}`, t);
                      } catch (i) {
                        t.target = e;
                        do {
                          (t.currentTarget = e),
                            '_events' in e && typeof e._events[n] === 'function' && e._events[n].call(e, t),
                            typeof e[`on${n}`] === 'function' && e[`on${n}`].call(e, t),
                            (e = e.nodeType === 9 ? e.parentWindow : e.parentNode);
                        } while (e && !t.cancelBubble);
                      }
                      return !0;
                    }),
                document.attachEvent('onreadystatechange', function () {
                  document.readyState === 'complete' &&
                    document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: !0 }));
                }));
          }
          function i(t, e) {
            for (let n = -1, i = t.length; ++n < i; ) if (n in t && t[n] === e) return n;
            return -1;
          }
        })();
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    ),
    function (t) {
      'bind' in Function.prototype ||
        Object.defineProperty(Function.prototype, 'bind', {
          value(t) {
            let e;
            const n = Array;
            const i = Object;
            const o = i.prototype;
            const s = n.prototype;
            const r = function () {};
            const a = o.toString;
            const l = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
            const c = Function.prototype.toString;
            e = function (t) {
              if (typeof t !== 'function') return !1;
              if (l)
                return (function (t) {
                  try {
                    return c.call(t), !0;
                  } catch (t) {
                    return !1;
                  }
                })(t);
              const e = a.call(t);
              return e === '[object Function]' || e === '[object GeneratorFunction]';
            };
            const u = s.slice;
            const d = s.concat;
            const h = s.push;
            const p = Math.max;
            const f = this;
            if (!e(f)) throw new TypeError(`Function.prototype.bind called on incompatible ${f}`);
            for (var m, v = u.call(arguments, 1), b = p(0, f.length - v.length), g = [], y = 0; y < b; y++)
              h.call(g, `$${y}`);
            return (
              (m = Function(
                'binder',
                `return function (${g.join(',')}){ return binder.apply(this, arguments); }`,
              )(function () {
                if (this instanceof m) {
                  const e = f.apply(this, d.call(v, u.call(arguments)));
                  return i(e) === e ? e : this;
                }
                return f.apply(t, d.call(v, u.call(arguments)));
              })),
              f.prototype && ((r.prototype = f.prototype), (m.prototype = new r()), (r.prototype = null)),
              m
            );
          },
        });
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    );
  const l = {
    hideAllSections: 'Hide all sections',
    hideSection: 'Hide',
    hideSectionAriaLabel: 'Hide this section',
    showAllSections: 'Show all sections',
    showSection: 'Show',
    showSectionAriaLabel: 'Show this section',
  };
  function c(t, e) {
    if (!(t instanceof HTMLElement)) return this;
    this.$module = t;
    const n = { i18n: l, rememberExpanded: !0 };
    (this.config = i(n, e || {}, r(t.dataset))),
      (this.i18n = new a(o(this.config, 'i18n'))),
      (this.controlsClass = 'govuk-accordion__controls'),
      (this.showAllClass = 'govuk-accordion__show-all'),
      (this.showAllTextClass = 'govuk-accordion__show-all-text'),
      (this.sectionClass = 'govuk-accordion__section'),
      (this.sectionExpandedClass = 'govuk-accordion__section--expanded'),
      (this.sectionButtonClass = 'govuk-accordion__section-button'),
      (this.sectionHeaderClass = 'govuk-accordion__section-header'),
      (this.sectionHeadingClass = 'govuk-accordion__section-heading'),
      (this.sectionHeadingDividerClass = 'govuk-accordion__section-heading-divider'),
      (this.sectionHeadingTextClass = 'govuk-accordion__section-heading-text'),
      (this.sectionHeadingTextFocusClass = 'govuk-accordion__section-heading-text-focus'),
      (this.sectionShowHideToggleClass = 'govuk-accordion__section-toggle'),
      (this.sectionShowHideToggleFocusClass = 'govuk-accordion__section-toggle-focus'),
      (this.sectionShowHideTextClass = 'govuk-accordion__section-toggle-text'),
      (this.upChevronIconClass = 'govuk-accordion-nav__chevron'),
      (this.downChevronIconClass = 'govuk-accordion-nav__chevron--down'),
      (this.sectionSummaryClass = 'govuk-accordion__section-summary'),
      (this.sectionSummaryFocusClass = 'govuk-accordion__section-summary-focus'),
      (this.sectionContentClass = 'govuk-accordion__section-content');
    const s = this.$module.querySelectorAll(`.${this.sectionClass}`);
    if (!s.length) return this;
    (this.$sections = s),
      (this.browserSupportsSessionStorage = u.checkForSessionStorage()),
      (this.$showAllButton = null),
      (this.$showAllIcon = null),
      (this.$showAllText = null);
  }
  (c.prototype.init = function () {
    if (this.$module && this.$sections) {
      this.initControls(), this.initSectionHeaders();
      const t = this.checkIfAllSectionsOpen();
      this.updateShowAllButton(t);
    }
  }),
    (c.prototype.initControls = function () {
      (this.$showAllButton = document.createElement('button')),
        this.$showAllButton.setAttribute('type', 'button'),
        this.$showAllButton.setAttribute('class', this.showAllClass),
        this.$showAllButton.setAttribute('aria-expanded', 'false'),
        (this.$showAllIcon = document.createElement('span')),
        this.$showAllIcon.classList.add(this.upChevronIconClass),
        this.$showAllButton.appendChild(this.$showAllIcon);
      const t = document.createElement('div');
      t.setAttribute('class', this.controlsClass),
        t.appendChild(this.$showAllButton),
        this.$module.insertBefore(t, this.$module.firstChild),
        (this.$showAllText = document.createElement('span')),
        this.$showAllText.classList.add(this.showAllTextClass),
        this.$showAllButton.appendChild(this.$showAllText),
        this.$showAllButton.addEventListener('click', this.onShowOrHideAllToggle.bind(this)),
        'onbeforematch' in document && document.addEventListener('beforematch', this.onBeforeMatch.bind(this));
    }),
    (c.prototype.initSectionHeaders = function () {
      const t = this;
      n(this.$sections, function (e, n) {
        const i = e.querySelector(`.${t.sectionHeaderClass}`);
        i &&
          (t.constructHeaderMarkup(i, n),
          t.setExpanded(t.isExpanded(e), e),
          i.addEventListener('click', t.onSectionToggle.bind(t, e)),
          t.setInitialState(e));
      });
    }),
    (c.prototype.constructHeaderMarkup = function (t, e) {
      const n = t.querySelector(`.${this.sectionButtonClass}`);
      const i = t.querySelector(`.${this.sectionHeadingClass}`);
      const o = t.querySelector(`.${this.sectionSummaryClass}`);
      if (n && i) {
        const s = document.createElement('button');
        s.setAttribute('type', 'button'),
          s.setAttribute('aria-controls', `${this.$module.id}-content-${(e + 1).toString()}`);
        for (let r = 0; r < n.attributes.length; r++) {
          const a = n.attributes.item(r);
          a.nodeName !== 'id' && s.setAttribute(a.nodeName, a.nodeValue);
        }
        const l = document.createElement('span');
        l.classList.add(this.sectionHeadingTextClass), (l.id = n.id);
        const c = document.createElement('span');
        c.classList.add(this.sectionHeadingTextFocusClass), l.appendChild(c), (c.innerHTML = n.innerHTML);
        const u = document.createElement('span');
        u.classList.add(this.sectionShowHideToggleClass), u.setAttribute('data-nosnippet', '');
        const d = document.createElement('span');
        d.classList.add(this.sectionShowHideToggleFocusClass), u.appendChild(d);
        const h = document.createElement('span');
        const p = document.createElement('span');
        if (
          (p.classList.add(this.upChevronIconClass),
          d.appendChild(p),
          h.classList.add(this.sectionShowHideTextClass),
          d.appendChild(h),
          s.appendChild(l),
          s.appendChild(this.getButtonPunctuationEl()),
          o)
        ) {
          const f = document.createElement('span');
          const m = document.createElement('span');
          m.classList.add(this.sectionSummaryFocusClass), f.appendChild(m);
          for (let v = 0, b = o.attributes.length; v < b; ++v) {
            const g = o.attributes.item(v).nodeName;
            const y = o.attributes.item(v).nodeValue;
            f.setAttribute(g, y);
          }
          (m.innerHTML = o.innerHTML),
            o.parentNode.replaceChild(f, o),
            s.appendChild(f),
            s.appendChild(this.getButtonPunctuationEl());
        }
        s.appendChild(u), i.removeChild(n), i.appendChild(s);
      }
    }),
    (c.prototype.onBeforeMatch = function (t) {
      const e = t.target;
      if (e instanceof Element) {
        const n = e.closest(`.${this.sectionClass}`);
        n && this.setExpanded(!0, n);
      }
    }),
    (c.prototype.onSectionToggle = function (t) {
      const e = this.isExpanded(t);
      this.setExpanded(!e, t), this.storeState(t);
    }),
    (c.prototype.onShowOrHideAllToggle = function () {
      const t = this;
      const e = this.$sections;
      const i = !this.checkIfAllSectionsOpen();
      n(e, function (e) {
        t.setExpanded(i, e), t.storeState(e);
      }),
        t.updateShowAllButton(i);
    }),
    (c.prototype.setExpanded = function (t, e) {
      const n = e.querySelector(`.${this.upChevronIconClass}`);
      const i = e.querySelector(`.${this.sectionShowHideTextClass}`);
      const o = e.querySelector(`.${this.sectionButtonClass}`);
      const s = e.querySelector(`.${this.sectionContentClass}`);
      if (n && i instanceof HTMLElement && o && s) {
        const r = t ? this.i18n.t('hideSection') : this.i18n.t('showSection');
        (i.innerText = r), o.setAttribute('aria-expanded', t.toString());
        const a = [];
        const l = e.querySelector(`.${this.sectionHeadingTextClass}`);
        l instanceof HTMLElement && a.push(l.innerText.trim());
        const c = e.querySelector(`.${this.sectionSummaryClass}`);
        c instanceof HTMLElement && a.push(c.innerText.trim());
        const u = t ? this.i18n.t('hideSectionAriaLabel') : this.i18n.t('showSectionAriaLabel');
        a.push(u),
          o.setAttribute('aria-label', a.join(' , ')),
          t
            ? (s.removeAttribute('hidden'),
              e.classList.add(this.sectionExpandedClass),
              n.classList.remove(this.downChevronIconClass))
            : (s.setAttribute('hidden', 'until-found'),
              e.classList.remove(this.sectionExpandedClass),
              n.classList.add(this.downChevronIconClass));
        const d = this.checkIfAllSectionsOpen();
        this.updateShowAllButton(d);
      }
    }),
    (c.prototype.isExpanded = function (t) {
      return t.classList.contains(this.sectionExpandedClass);
    }),
    (c.prototype.checkIfAllSectionsOpen = function () {
      return this.$sections.length === this.$module.querySelectorAll(`.${this.sectionExpandedClass}`).length;
    }),
    (c.prototype.updateShowAllButton = function (t) {
      const e = t ? this.i18n.t('hideAllSections') : this.i18n.t('showAllSections');
      this.$showAllButton.setAttribute('aria-expanded', t.toString()),
        (this.$showAllText.innerText = e),
        t
          ? this.$showAllIcon.classList.remove(this.downChevronIconClass)
          : this.$showAllIcon.classList.add(this.downChevronIconClass);
    });
  var u = {
    checkForSessionStorage() {
      let t;
      const e = 'this is the test string';
      try {
        return (
          window.sessionStorage.setItem(e, e),
          (t = window.sessionStorage.getItem(e) === e.toString()),
          window.sessionStorage.removeItem(e),
          t
        );
      } catch (t) {
        return !1;
      }
    },
  };
  (c.prototype.storeState = function (t) {
    if (this.browserSupportsSessionStorage && this.config.rememberExpanded) {
      const e = t.querySelector(`.${this.sectionButtonClass}`);
      if (e) {
        const n = e.getAttribute('aria-controls');
        const i = e.getAttribute('aria-expanded');
        n && i && window.sessionStorage.setItem(n, i);
      }
    }
  }),
    (c.prototype.setInitialState = function (t) {
      if (this.browserSupportsSessionStorage && this.config.rememberExpanded) {
        const e = t.querySelector(`.${this.sectionButtonClass}`);
        if (e) {
          const n = e.getAttribute('aria-controls');
          const i = n ? window.sessionStorage.getItem(n) : null;
          i !== null && this.setExpanded(i === 'true', t);
        }
      }
    }),
    (c.prototype.getButtonPunctuationEl = function () {
      const t = document.createElement('span');
      return t.classList.add('govuk-visually-hidden', this.sectionHeadingDividerClass), (t.innerHTML = ', '), t;
    });
  const d = c;
  function h(t, e) {
    if (!(t instanceof HTMLElement)) return this;
    (this.$module = t), (this.debounceFormSubmitTimer = null);
    this.config = i({ preventDoubleClick: !1 }, e || {}, r(t.dataset));
  }
  (h.prototype.init = function () {
    this.$module &&
      (this.$module.addEventListener('keydown', this.handleKeyDown),
      this.$module.addEventListener('click', this.debounce.bind(this)));
  }),
    (h.prototype.handleKeyDown = function (t) {
      const e = t.target;
      t.keyCode === 32 &&
        e instanceof HTMLElement &&
        e.getAttribute('role') === 'button' &&
        (t.preventDefault(), e.click());
    }),
    (h.prototype.debounce = function (t) {
      if (this.config.preventDoubleClick)
        return this.debounceFormSubmitTimer
          ? (t.preventDefault(), !1)
          : void (this.debounceFormSubmitTimer = setTimeout(
              function () {
                this.debounceFormSubmitTimer = null;
              }.bind(this),
              1e3,
            ));
    });
  const p = h;
  (function (t) {
    ('Date' in self && 'now' in self.Date && 'getTime' in self.Date.prototype) ||
      (Date.now = function () {
        return new Date().getTime();
      });
  }).call(
    (typeof window === 'object' && window) ||
      (typeof self === 'object' && self) ||
      (typeof global === 'object' && global) ||
      {},
  );
  const f = {
    charactersUnderLimit: {
      one: 'You have %{count} character remaining',
      other: 'You have %{count} characters remaining',
    },
    charactersAtLimit: 'You have 0 characters remaining',
    charactersOverLimit: {
      one: 'You have %{count} character too many',
      other: 'You have %{count} characters too many',
    },
    wordsUnderLimit: { one: 'You have %{count} word remaining', other: 'You have %{count} words remaining' },
    wordsAtLimit: 'You have 0 words remaining',
    wordsOverLimit: { one: 'You have %{count} word too many', other: 'You have %{count} words too many' },
    textareaDescription: { other: '' },
  };
  function m(t, e) {
    if (!(t instanceof HTMLElement)) return this;
    const n = t.querySelector('.govuk-js-character-count');
    if (!(n instanceof HTMLTextAreaElement || n instanceof HTMLInputElement)) return this;
    let s;
    let l;
    let c;
    const u = { threshold: 0, i18n: f };
    const d = r(t.dataset);
    let h = {};
    if (
      (('maxwords' in d || 'maxlength' in d) && (h = { maxlength: !1, maxwords: !1 }),
      (this.config = i(u, e || {}, h, d)),
      (this.i18n = new a(o(this.config, 'i18n'), {
        locale: ((s = t), (l = 'lang'), (c = s.closest(`[${l}]`)), c ? c.getAttribute(l) : null),
      })),
      (this.maxLength = 1 / 0),
      'maxwords' in this.config && this.config.maxwords)
    )
      this.maxLength = this.config.maxwords;
    else {
      if (!('maxlength' in this.config) || !this.config.maxlength) return;
      this.maxLength = this.config.maxlength;
    }
    (this.$module = t),
      (this.$textarea = n),
      (this.$visibleCountMessage = null),
      (this.$screenReaderCountMessage = null),
      (this.lastInputTimestamp = null),
      (this.lastInputValue = ''),
      (this.valueChecker = null);
  }
  (m.prototype.init = function () {
    if (this.$module && this.$textarea) {
      const t = this.$textarea;
      const e = document.getElementById(`${t.id}-info`);
      if (e) {
        e.innerText.match(/^\s*$/) && (e.innerText = this.i18n.t('textareaDescription', { count: this.maxLength })),
          t.insertAdjacentElement('afterend', e);
        const n = document.createElement('div');
        (n.className = 'govuk-character-count__sr-status govuk-visually-hidden'),
          n.setAttribute('aria-live', 'polite'),
          (this.$screenReaderCountMessage = n),
          e.insertAdjacentElement('afterend', n);
        const i = document.createElement('div');
        (i.className = e.className),
          i.classList.add('govuk-character-count__status'),
          i.setAttribute('aria-hidden', 'true'),
          (this.$visibleCountMessage = i),
          e.insertAdjacentElement('afterend', i),
          e.classList.add('govuk-visually-hidden'),
          t.removeAttribute('maxlength'),
          this.bindChangeEvents(),
          window.addEventListener(
            'onpageshow' in window ? 'pageshow' : 'DOMContentLoaded',
            this.updateCountMessage.bind(this),
          ),
          this.updateCountMessage();
      }
    }
  }),
    (m.prototype.bindChangeEvents = function () {
      const t = this.$textarea;
      t.addEventListener('keyup', this.handleKeyUp.bind(this)),
        t.addEventListener('focus', this.handleFocus.bind(this)),
        t.addEventListener('blur', this.handleBlur.bind(this));
    }),
    (m.prototype.handleKeyUp = function () {
      this.updateVisibleCountMessage(), (this.lastInputTimestamp = Date.now());
    }),
    (m.prototype.handleFocus = function () {
      this.valueChecker = setInterval(
        function () {
          (!this.lastInputTimestamp || Date.now() - 500 >= this.lastInputTimestamp) && this.updateIfValueChanged();
        }.bind(this),
        1e3,
      );
    }),
    (m.prototype.handleBlur = function () {
      clearInterval(this.valueChecker);
    }),
    (m.prototype.updateIfValueChanged = function () {
      this.$textarea.value !== this.lastInputValue &&
        ((this.lastInputValue = this.$textarea.value), this.updateCountMessage());
    }),
    (m.prototype.updateCountMessage = function () {
      this.updateVisibleCountMessage(), this.updateScreenReaderCountMessage();
    }),
    (m.prototype.updateVisibleCountMessage = function () {
      const t = this.$textarea;
      const e = this.$visibleCountMessage;
      const n = this.maxLength - this.count(t.value);
      this.isOverThreshold()
        ? e.classList.remove('govuk-character-count__message--disabled')
        : e.classList.add('govuk-character-count__message--disabled'),
        n < 0
          ? (t.classList.add('govuk-textarea--error'),
            e.classList.remove('govuk-hint'),
            e.classList.add('govuk-error-message'))
          : (t.classList.remove('govuk-textarea--error'),
            e.classList.remove('govuk-error-message'),
            e.classList.add('govuk-hint')),
        (e.innerText = this.getCountMessage());
    }),
    (m.prototype.updateScreenReaderCountMessage = function () {
      const t = this.$screenReaderCountMessage;
      this.isOverThreshold() ? t.removeAttribute('aria-hidden') : t.setAttribute('aria-hidden', 'true'),
        (t.innerText = this.getCountMessage());
    }),
    (m.prototype.count = function (t) {
      return 'maxwords' in this.config && this.config.maxwords ? (t.match(/\S+/g) || []).length : t.length;
    }),
    (m.prototype.getCountMessage = function () {
      const t = this.maxLength - this.count(this.$textarea.value);
      const e = 'maxwords' in this.config && this.config.maxwords ? 'words' : 'characters';
      return this.formatCountMessage(t, e);
    }),
    (m.prototype.formatCountMessage = function (t, e) {
      if (t === 0) return this.i18n.t(`${e}AtLimit`);
      const n = t < 0 ? 'OverLimit' : 'UnderLimit';
      return this.i18n.t(e + n, { count: Math.abs(t) });
    }),
    (m.prototype.isOverThreshold = function () {
      if (!this.config.threshold) return !0;
      const t = this.$textarea;
      const e = this.count(t.value);
      return (this.maxLength * this.config.threshold) / 100 <= e;
    });
  const v = m;
  function b(t) {
    if (!(t instanceof HTMLElement)) return this;
    const e = t.querySelectorAll('input[type="checkbox"]');
    if (!e.length) return this;
    (this.$module = t), (this.$inputs = e);
  }
  (b.prototype.init = function () {
    if (this.$module && this.$inputs) {
      const t = this.$module;
      n(this.$inputs, function (t) {
        const e = t.getAttribute('data-aria-controls');
        e &&
          document.getElementById(e) &&
          (t.setAttribute('aria-controls', e), t.removeAttribute('data-aria-controls'));
      }),
        window.addEventListener(
          'onpageshow' in window ? 'pageshow' : 'DOMContentLoaded',
          this.syncAllConditionalReveals.bind(this),
        ),
        this.syncAllConditionalReveals(),
        t.addEventListener('click', this.handleClick.bind(this));
    }
  }),
    (b.prototype.syncAllConditionalReveals = function () {
      n(this.$inputs, this.syncConditionalRevealWithInputState.bind(this));
    }),
    (b.prototype.syncConditionalRevealWithInputState = function (t) {
      const e = t.getAttribute('aria-controls');
      if (e) {
        const n = document.getElementById(e);
        if (n && n.classList.contains('govuk-checkboxes__conditional')) {
          const i = t.checked;
          t.setAttribute('aria-expanded', i.toString()),
            n.classList.toggle('govuk-checkboxes__conditional--hidden', !i);
        }
      }
    }),
    (b.prototype.unCheckAllInputsExcept = function (t) {
      const e = this;
      n(document.querySelectorAll(`input[type="checkbox"][name="${t.name}"]`), function (n) {
        t.form === n.form && n !== t && ((n.checked = !1), e.syncConditionalRevealWithInputState(n));
      });
    }),
    (b.prototype.unCheckExclusiveInputs = function (t) {
      const e = this;
      n(
        document.querySelectorAll(`input[data-behaviour="exclusive"][type="checkbox"][name="${t.name}"]`),
        function (n) {
          t.form === n.form && ((n.checked = !1), e.syncConditionalRevealWithInputState(n));
        },
      );
    }),
    (b.prototype.handleClick = function (t) {
      const e = t.target;
      e instanceof HTMLInputElement &&
        e.type === 'checkbox' &&
        (e.getAttribute('aria-controls') && this.syncConditionalRevealWithInputState(e),
        e.checked &&
          (e.getAttribute('data-behaviour') === 'exclusive'
            ? this.unCheckAllInputsExcept(e)
            : this.unCheckExclusiveInputs(e)));
    });
  const g = b;
  function y(t) {
    if (!(t instanceof HTMLElement)) return this;
    (this.$module = t), (this.$summary = null), (this.$content = null);
  }
  (y.prototype.init = function () {
    this.$module &&
      (('HTMLDetailsElement' in window && this.$module instanceof HTMLDetailsElement) || this.polyfillDetails());
  }),
    (y.prototype.polyfillDetails = function () {
      let t;
      const e = this.$module;
      const n = (this.$summary = e.getElementsByTagName('summary').item(0));
      const i = (this.$content = e.getElementsByTagName('div').item(0));
      n &&
        i &&
        (i.id ||
          (i.id = `details-content-${
            ((t = new Date().getTime()),
            void 0 !== window.performance &&
              typeof window.performance.now === 'function' &&
              (t += window.performance.now()),
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (e) {
              const n = (t + 16 * Math.random()) % 16 | 0;
              return (t = Math.floor(t / 16)), (e === 'x' ? n : (3 & n) | 8).toString(16);
            }))
          }`),
        e.setAttribute('role', 'group'),
        n.setAttribute('role', 'button'),
        n.setAttribute('aria-controls', i.id),
        (n.tabIndex = 0),
        this.$module.hasAttribute('open')
          ? n.setAttribute('aria-expanded', 'true')
          : (n.setAttribute('aria-expanded', 'false'), (i.style.display = 'none')),
        this.polyfillHandleInputs(this.polyfillSetAttributes.bind(this)));
    }),
    (y.prototype.polyfillSetAttributes = function () {
      return (
        this.$module.hasAttribute('open')
          ? (this.$module.removeAttribute('open'),
            this.$summary.setAttribute('aria-expanded', 'false'),
            (this.$content.style.display = 'none'))
          : (this.$module.setAttribute('open', 'open'),
            this.$summary.setAttribute('aria-expanded', 'true'),
            (this.$content.style.display = '')),
        !0
      );
    }),
    (y.prototype.polyfillHandleInputs = function (t) {
      this.$summary.addEventListener('keypress', function (e) {
        const n = e.target;
        (e.keyCode !== 13 && e.keyCode !== 32) ||
          (n instanceof HTMLElement &&
            n.nodeName.toLowerCase() === 'summary' &&
            (e.preventDefault(), n.click ? n.click() : t(e)));
      }),
        this.$summary.addEventListener('keyup', function (t) {
          const e = t.target;
          t.keyCode === 32 && e instanceof HTMLElement && e.nodeName.toLowerCase() === 'summary' && t.preventDefault();
        }),
        this.$summary.addEventListener('click', t);
    });
  const w = y;
  function E(t, e) {
    if (!(t instanceof HTMLElement)) return this;
    this.$module = t;
    this.config = i({ disableAutoFocus: !1 }, e || {}, r(t.dataset));
  }
  (E.prototype.init = function () {
    if (this.$module) {
      const t = this.$module;
      this.setFocus(), t.addEventListener('click', this.handleClick.bind(this));
    }
  }),
    (E.prototype.setFocus = function () {
      const t = this.$module;
      this.config.disableAutoFocus ||
        (t.setAttribute('tabindex', '-1'),
        t.addEventListener('blur', function () {
          t.removeAttribute('tabindex');
        }),
        t.focus());
    }),
    (E.prototype.handleClick = function (t) {
      const e = t.target;
      this.focusTarget(e) && t.preventDefault();
    }),
    (E.prototype.focusTarget = function (t) {
      if (!(t instanceof HTMLAnchorElement)) return !1;
      const e = this.getFragmentFromUrl(t.href);
      if (!e) return !1;
      const n = document.getElementById(e);
      if (!n) return !1;
      const i = this.getAssociatedLegendOrLabel(n);
      return !!i && (i.scrollIntoView(), n.focus({ preventScroll: !0 }), !0);
    }),
    (E.prototype.getFragmentFromUrl = function (t) {
      if (t.indexOf('#') !== -1) return t.split('#').pop();
    }),
    (E.prototype.getAssociatedLegendOrLabel = function (t) {
      const e = t.closest('fieldset');
      if (e) {
        const n = e.getElementsByTagName('legend');
        if (n.length) {
          const i = n[0];
          if (t instanceof HTMLInputElement && (t.type === 'checkbox' || t.type === 'radio')) return i;
          const o = i.getBoundingClientRect().top;
          const s = t.getBoundingClientRect();
          if (s.height && window.innerHeight) if (s.top + s.height - o < window.innerHeight / 2) return i;
        }
      }
      return document.querySelector(`label[for='${t.getAttribute('id')}']`) || t.closest('label');
    });
  const k = E;
  const S = {
    activated: 'Loading.',
    timedOut: 'Exit this page expired.',
    pressTwoMoreTimes: 'Shift, press 2 more times to exit.',
    pressOneMoreTime: 'Shift, press 1 more time to exit.',
  };
  function T(t, e) {
    const n = { i18n: S };
    if (!(t instanceof HTMLElement)) return this;
    const s = t.querySelector('.govuk-exit-this-page__button');
    if (!(s instanceof HTMLElement)) return this;
    (this.config = i(n, e || {}, r(t.dataset))),
      (this.i18n = new a(o(this.config, 'i18n'))),
      (this.$module = t),
      (this.$button = s),
      (this.$skiplinkButton = document.querySelector('.govuk-js-exit-this-page-skiplink')),
      (this.$updateSpan = null),
      (this.$indicatorContainer = null),
      (this.$overlay = null),
      (this.keypressCounter = 0),
      (this.lastKeyWasModified = !1),
      (this.timeoutTime = 5e3),
      (this.keypressTimeoutId = null),
      (this.timeoutMessageId = null);
  }
  (T.prototype.initUpdateSpan = function () {
    (this.$updateSpan = document.createElement('span')),
      this.$updateSpan.setAttribute('role', 'status'),
      (this.$updateSpan.className = 'govuk-visually-hidden'),
      this.$module.appendChild(this.$updateSpan);
  }),
    (T.prototype.initButtonClickHandler = function () {
      this.$button.addEventListener('click', this.handleClick.bind(this)),
        this.$skiplinkButton && this.$skiplinkButton.addEventListener('click', this.handleClick.bind(this));
    }),
    (T.prototype.buildIndicator = function () {
      (this.$indicatorContainer = document.createElement('div')),
        (this.$indicatorContainer.className = 'govuk-exit-this-page__indicator'),
        this.$indicatorContainer.setAttribute('aria-hidden', 'true');
      for (let t = 0; t < 3; t++) {
        const e = document.createElement('div');
        (e.className = 'govuk-exit-this-page__indicator-light'), this.$indicatorContainer.appendChild(e);
      }
      this.$button.appendChild(this.$indicatorContainer);
    }),
    (T.prototype.updateIndicator = function () {
      this.keypressCounter > 0
        ? this.$indicatorContainer.classList.add('govuk-exit-this-page__indicator--visible')
        : this.$indicatorContainer.classList.remove('govuk-exit-this-page__indicator--visible'),
        n(
          this.$indicatorContainer.querySelectorAll('.govuk-exit-this-page__indicator-light'),
          function (t, e) {
            t.classList.toggle('govuk-exit-this-page__indicator-light--on', e < this.keypressCounter);
          }.bind(this),
        );
    }),
    (T.prototype.exitPage = function () {
      (this.$updateSpan.innerText = ''),
        document.body.classList.add('govuk-exit-this-page-hide-content'),
        (this.$overlay = document.createElement('div')),
        (this.$overlay.className = 'govuk-exit-this-page-overlay'),
        this.$overlay.setAttribute('role', 'alert'),
        document.body.appendChild(this.$overlay),
        (this.$overlay.innerText = this.i18n.t('activated')),
        (window.location.href = this.$button.getAttribute('href'));
    }),
    (T.prototype.handleClick = function (t) {
      t.preventDefault(), this.exitPage();
    }),
    (T.prototype.handleKeypress = function (t) {
      (t.key !== 'Shift' && t.keyCode !== 16 && t.which !== 16) || this.lastKeyWasModified
        ? this.keypressTimeoutId !== null && this.resetKeypressTimer()
        : ((this.keypressCounter += 1),
          this.updateIndicator(),
          this.timeoutMessageId !== null && (clearTimeout(this.timeoutMessageId), (this.timeoutMessageId = null)),
          this.keypressCounter >= 3
            ? ((this.keypressCounter = 0),
              this.keypressTimeoutId !== null &&
                (clearTimeout(this.keypressTimeoutId), (this.keypressTimeoutId = null)),
              this.exitPage())
            : this.keypressCounter === 1
            ? (this.$updateSpan.innerText = this.i18n.t('pressTwoMoreTimes'))
            : (this.$updateSpan.innerText = this.i18n.t('pressOneMoreTime')),
          this.setKeypressTimer()),
        (this.lastKeyWasModified = t.shiftKey);
    }),
    (T.prototype.setKeypressTimer = function () {
      clearTimeout(this.keypressTimeoutId),
        (this.keypressTimeoutId = setTimeout(this.resetKeypressTimer.bind(this), this.timeoutTime));
    }),
    (T.prototype.resetKeypressTimer = function () {
      clearTimeout(this.keypressTimeoutId),
        (this.keypressTimeoutId = null),
        (this.keypressCounter = 0),
        (this.$updateSpan.innerText = this.i18n.t('timedOut')),
        (this.timeoutMessageId = setTimeout(
          function () {
            this.$updateSpan.innerText = '';
          }.bind(this),
          this.timeoutTime,
        )),
        this.updateIndicator();
    }),
    (T.prototype.resetPage = function () {
      document.body.classList.remove('govuk-exit-this-page-hide-content'),
        this.$overlay && (this.$overlay.remove(), (this.$overlay = null)),
        this.$updateSpan.setAttribute('role', 'status'),
        (this.$updateSpan.innerText = ''),
        this.updateIndicator(),
        this.keypressTimeoutId && clearTimeout(this.keypressTimeoutId),
        this.timeoutMessageId && clearTimeout(this.timeoutMessageId);
    }),
    (T.prototype.init = function () {
      this.buildIndicator(),
        this.initUpdateSpan(),
        this.initButtonClickHandler(),
        'govukFrontendExitThisPageKeypress' in document.body.dataset ||
          (document.addEventListener('keyup', this.handleKeypress.bind(this), !0),
          (document.body.dataset.govukFrontendExitThisPageKeypress = 'true')),
        window.addEventListener('onpageshow' in window ? 'pageshow' : 'DOMContentLoaded', this.resetPage.bind(this));
    });
  const L = T;
  function C(t) {
    if (!(t instanceof HTMLElement)) return this;
    (this.$module = t),
      (this.$menuButton = t.querySelector('.govuk-js-header-toggle')),
      (this.$menu = this.$menuButton && t.querySelector(`#${this.$menuButton.getAttribute('aria-controls')}`)),
      (this.menuIsOpen = !1),
      (this.mql = null);
  }
  (C.prototype.init = function () {
    this.$module &&
      this.$menuButton &&
      this.$menu &&
      ('matchMedia' in window
        ? ((this.mql = window.matchMedia('(min-width: 48.0625em)')),
          'addEventListener' in this.mql
            ? this.mql.addEventListener('change', this.syncState.bind(this))
            : this.mql.addListener(this.syncState.bind(this)),
          this.syncState(),
          this.$menuButton.addEventListener('click', this.handleMenuButtonClick.bind(this)))
        : this.$menuButton.setAttribute('hidden', ''));
  }),
    (C.prototype.syncState = function () {
      this.mql.matches
        ? (this.$menu.removeAttribute('hidden'), this.$menuButton.setAttribute('hidden', ''))
        : (this.$menuButton.removeAttribute('hidden'),
          this.$menuButton.setAttribute('aria-expanded', this.menuIsOpen.toString()),
          this.menuIsOpen ? this.$menu.removeAttribute('hidden') : this.$menu.setAttribute('hidden', ''));
    }),
    (C.prototype.handleMenuButtonClick = function () {
      (this.menuIsOpen = !this.menuIsOpen), this.syncState();
    });
  const x = C;
  function A(t, e) {
    if (!(t instanceof HTMLElement)) return this;
    this.$module = t;
    this.config = i({ disableAutoFocus: !1 }, e || {}, r(t.dataset));
  }
  (A.prototype.init = function () {
    this.$module && this.setFocus();
  }),
    (A.prototype.setFocus = function () {
      const t = this.$module;
      this.config.disableAutoFocus ||
        (t.getAttribute('role') === 'alert' &&
          (t.getAttribute('tabindex') ||
            (t.setAttribute('tabindex', '-1'),
            t.addEventListener('blur', function () {
              t.removeAttribute('tabindex');
            })),
          t.focus()));
    });
  const $ = A;
  function _(t) {
    if (!(t instanceof HTMLElement)) return this;
    const e = t.querySelectorAll('input[type="radio"]');
    if (!e.length) return this;
    (this.$module = t), (this.$inputs = e);
  }
  (_.prototype.init = function () {
    if (this.$module && this.$inputs) {
      const t = this.$module;
      n(this.$inputs, function (t) {
        const e = t.getAttribute('data-aria-controls');
        e &&
          document.getElementById(e) &&
          (t.setAttribute('aria-controls', e), t.removeAttribute('data-aria-controls'));
      }),
        window.addEventListener(
          'onpageshow' in window ? 'pageshow' : 'DOMContentLoaded',
          this.syncAllConditionalReveals.bind(this),
        ),
        this.syncAllConditionalReveals(),
        t.addEventListener('click', this.handleClick.bind(this));
    }
  }),
    (_.prototype.syncAllConditionalReveals = function () {
      n(this.$inputs, this.syncConditionalRevealWithInputState.bind(this));
    }),
    (_.prototype.syncConditionalRevealWithInputState = function (t) {
      const e = t.getAttribute('aria-controls');
      if (e) {
        const n = document.getElementById(e);
        if (n && n.classList.contains('govuk-radios__conditional')) {
          const i = t.checked;
          t.setAttribute('aria-expanded', i.toString()), n.classList.toggle('govuk-radios__conditional--hidden', !i);
        }
      }
    }),
    (_.prototype.handleClick = function (t) {
      const e = this;
      const i = t.target;
      if (i instanceof HTMLInputElement && i.type === 'radio') {
        const o = document.querySelectorAll('input[type="radio"][aria-controls]');
        const s = i.form;
        const r = i.name;
        n(o, function (t) {
          const n = t.form === s;
          t.name === r && n && e.syncConditionalRevealWithInputState(t);
        });
      }
    });
  const M = _;
  function j(t) {
    if (!(t instanceof HTMLAnchorElement)) return this;
    (this.$module = t), (this.$linkedElement = null), (this.linkedElementListener = !1);
  }
  (j.prototype.init = function () {
    if (this.$module) {
      const t = this.getLinkedElement();
      t && ((this.$linkedElement = t), this.$module.addEventListener('click', this.focusLinkedElement.bind(this)));
    }
  }),
    (j.prototype.getLinkedElement = function () {
      const t = this.getFragmentFromUrl();
      return t ? document.getElementById(t) : null;
    }),
    (j.prototype.focusLinkedElement = function () {
      const t = this.$linkedElement;
      t.getAttribute('tabindex') ||
        (t.setAttribute('tabindex', '-1'),
        t.classList.add('govuk-skip-link-focused-element'),
        this.linkedElementListener ||
          (this.$linkedElement.addEventListener('blur', this.removeFocusProperties.bind(this)),
          (this.linkedElementListener = !0))),
        t.focus();
    }),
    (j.prototype.removeFocusProperties = function () {
      this.$linkedElement.removeAttribute('tabindex'),
        this.$linkedElement.classList.remove('govuk-skip-link-focused-element');
    }),
    (j.prototype.getFragmentFromUrl = function () {
      if (this.$module.hash) return this.$module.hash.split('#').pop();
    });
  const I = j;
  function H(t) {
    if (!(t instanceof HTMLElement)) return this;
    const e = t.querySelectorAll('a.govuk-tabs__tab');
    if (!e.length) return this;
    (this.$module = t),
      (this.$tabs = e),
      (this.keys = { left: 37, right: 39, up: 38, down: 40 }),
      (this.jsHiddenClass = 'govuk-tabs__panel--hidden'),
      (this.boundTabClick = this.onTabClick.bind(this)),
      (this.boundTabKeydown = this.onTabKeydown.bind(this)),
      (this.boundOnHashChange = this.onHashChange.bind(this)),
      (this.changingHash = !1);
  }
  (function (t) {
    ('document' in this && 'nextElementSibling' in document.documentElement) ||
      Object.defineProperty(Element.prototype, 'nextElementSibling', {
        get() {
          for (var t = this.nextSibling; t && t.nodeType !== 1; ) t = t.nextSibling;
          return t;
        },
      });
  }).call(
    (typeof window === 'object' && window) ||
      (typeof self === 'object' && self) ||
      (typeof global === 'object' && global) ||
      {},
  ),
    function (t) {
      ('document' in this && 'previousElementSibling' in document.documentElement) ||
        Object.defineProperty(Element.prototype, 'previousElementSibling', {
          get() {
            for (var t = this.previousSibling; t && t.nodeType !== 1; ) t = t.previousSibling;
            return t;
          },
        });
    }.call(
      (typeof window === 'object' && window) ||
        (typeof self === 'object' && self) ||
        (typeof global === 'object' && global) ||
        {},
    ),
    (H.prototype.init = function () {
      this.$module &&
        this.$tabs &&
        (typeof window.matchMedia === 'function' ? this.setupResponsiveChecks() : this.setup());
    }),
    (H.prototype.setupResponsiveChecks = function () {
      (this.mql = window.matchMedia('(min-width: 40.0625em)')),
        this.mql.addListener(this.checkMode.bind(this)),
        this.checkMode();
    }),
    (H.prototype.checkMode = function () {
      this.mql.matches ? this.setup() : this.teardown();
    }),
    (H.prototype.setup = function () {
      const t = this;
      const e = this.$module;
      const i = this.$tabs;
      const o = e.querySelector('.govuk-tabs__list');
      const s = e.querySelectorAll('.govuk-tabs__list-item');
      if (i && o && s) {
        o.setAttribute('role', 'tablist'),
          n(s, function (t) {
            t.setAttribute('role', 'presentation');
          }),
          n(i, function (e) {
            t.setAttributes(e),
              e.addEventListener('click', t.boundTabClick, !0),
              e.addEventListener('keydown', t.boundTabKeydown, !0),
              t.hideTab(e);
          });
        const r = this.getTab(window.location.hash) || this.$tabs[0];
        r && (this.showTab(r), window.addEventListener('hashchange', this.boundOnHashChange, !0));
      }
    }),
    (H.prototype.teardown = function () {
      const t = this;
      const e = this.$module;
      const i = this.$tabs;
      const o = e.querySelector('.govuk-tabs__list');
      const s = e.querySelectorAll('a.govuk-tabs__list-item');
      i &&
        o &&
        s &&
        (o.removeAttribute('role'),
        n(s, function (t) {
          t.removeAttribute('role');
        }),
        n(i, function (e) {
          e.removeEventListener('click', t.boundTabClick, !0),
            e.removeEventListener('keydown', t.boundTabKeydown, !0),
            t.unsetAttributes(e);
        }),
        window.removeEventListener('hashchange', this.boundOnHashChange, !0));
    }),
    (H.prototype.onHashChange = function () {
      const t = window.location.hash;
      const e = this.getTab(t);
      if (e)
        if (this.changingHash) this.changingHash = !1;
        else {
          const n = this.getCurrentTab();
          n && (this.hideTab(n), this.showTab(e), e.focus());
        }
    }),
    (H.prototype.hideTab = function (t) {
      this.unhighlightTab(t), this.hidePanel(t);
    }),
    (H.prototype.showTab = function (t) {
      this.highlightTab(t), this.showPanel(t);
    }),
    (H.prototype.getTab = function (t) {
      return this.$module.querySelector(`a.govuk-tabs__tab[href="${t}"]`);
    }),
    (H.prototype.setAttributes = function (t) {
      const e = this.getHref(t).slice(1);
      t.setAttribute('id', `tab_${e}`),
        t.setAttribute('role', 'tab'),
        t.setAttribute('aria-controls', e),
        t.setAttribute('aria-selected', 'false'),
        t.setAttribute('tabindex', '-1');
      const n = this.getPanel(t);
      n &&
        (n.setAttribute('role', 'tabpanel'),
        n.setAttribute('aria-labelledby', t.id),
        n.classList.add(this.jsHiddenClass));
    }),
    (H.prototype.unsetAttributes = function (t) {
      t.removeAttribute('id'),
        t.removeAttribute('role'),
        t.removeAttribute('aria-controls'),
        t.removeAttribute('aria-selected'),
        t.removeAttribute('tabindex');
      const e = this.getPanel(t);
      e && (e.removeAttribute('role'), e.removeAttribute('aria-labelledby'), e.classList.remove(this.jsHiddenClass));
    }),
    (H.prototype.onTabClick = function (t) {
      const e = this.getCurrentTab();
      const n = t.currentTarget;
      e &&
        n instanceof HTMLAnchorElement &&
        (t.preventDefault(), this.hideTab(e), this.showTab(n), this.createHistoryEntry(n));
    }),
    (H.prototype.createHistoryEntry = function (t) {
      const e = this.getPanel(t);
      if (e) {
        const n = e.id;
        (e.id = ''), (this.changingHash = !0), (window.location.hash = this.getHref(t).slice(1)), (e.id = n);
      }
    }),
    (H.prototype.onTabKeydown = function (t) {
      switch (t.keyCode) {
        case this.keys.left:
        case this.keys.up:
          this.activatePreviousTab(), t.preventDefault();
          break;
        case this.keys.right:
        case this.keys.down:
          this.activateNextTab(), t.preventDefault();
      }
    }),
    (H.prototype.activateNextTab = function () {
      const t = this.getCurrentTab();
      if (t && t.parentElement) {
        const e = t.parentElement.nextElementSibling;
        if (e) {
          const n = e.querySelector('a.govuk-tabs__tab');
          n && (this.hideTab(t), this.showTab(n), n.focus(), this.createHistoryEntry(n));
        }
      }
    }),
    (H.prototype.activatePreviousTab = function () {
      const t = this.getCurrentTab();
      if (t && t.parentElement) {
        const e = t.parentElement.previousElementSibling;
        if (e) {
          const n = e.querySelector('a.govuk-tabs__tab');
          n && (this.hideTab(t), this.showTab(n), n.focus(), this.createHistoryEntry(n));
        }
      }
    }),
    (H.prototype.getPanel = function (t) {
      return this.$module.querySelector(this.getHref(t));
    }),
    (H.prototype.showPanel = function (t) {
      const e = this.getPanel(t);
      e && e.classList.remove(this.jsHiddenClass);
    }),
    (H.prototype.hidePanel = function (t) {
      const e = this.getPanel(t);
      e && e.classList.add(this.jsHiddenClass);
    }),
    (H.prototype.unhighlightTab = function (t) {
      t.parentElement &&
        (t.setAttribute('aria-selected', 'false'),
        t.parentElement.classList.remove('govuk-tabs__list-item--selected'),
        t.setAttribute('tabindex', '-1'));
    }),
    (H.prototype.highlightTab = function (t) {
      t.parentElement &&
        (t.setAttribute('aria-selected', 'true'),
        t.parentElement.classList.add('govuk-tabs__list-item--selected'),
        t.setAttribute('tabindex', '0'));
    }),
    (H.prototype.getCurrentTab = function () {
      return this.$module.querySelector('.govuk-tabs__list-item--selected a.govuk-tabs__tab');
    }),
    (H.prototype.getHref = function (t) {
      const e = t.getAttribute('href');
      return e.slice(e.indexOf('#'), e.length);
    });
  const O = H;
  var F = (function (t) {
    const e = (t = void 0 !== t ? t : {}).scope instanceof HTMLElement ? t.scope : document;
    n(e.querySelectorAll('[data-module="govuk-accordion"]'), function (e) {
      new d(e, t.accordion).init();
    }),
      n(e.querySelectorAll('[data-module="govuk-button"]'), function (e) {
        new p(e, t.button).init();
      }),
      n(e.querySelectorAll('[data-module="govuk-character-count"]'), function (e) {
        new v(e, t.characterCount).init();
      }),
      n(e.querySelectorAll('[data-module="govuk-checkboxes"]'), function (t) {
        new g(t).init();
      }),
      n(e.querySelectorAll('[data-module="govuk-details"]'), function (t) {
        new w(t).init();
      });
    const i = e.querySelector('[data-module="govuk-error-summary"]');
    i && new k(i, t.errorSummary).init(),
      n(e.querySelectorAll('[data-module="govuk-exit-this-page"]'), function (e) {
        new L(e, t.exitThisPage).init();
      });
    const o = e.querySelector('[data-module="govuk-header"]');
    o && new x(o).init(),
      n(e.querySelectorAll('[data-module="govuk-notification-banner"]'), function (e) {
        new $(e, t.notificationBanner).init();
      }),
      n(e.querySelectorAll('[data-module="govuk-radios"]'), function (t) {
        new M(t).init();
      });
    const s = e.querySelector('[data-module="govuk-skip-link"]');
    s && new I(s).init(),
      n(e.querySelectorAll('[data-module="govuk-tabs"]'), function (t) {
        new O(t).init();
      });
  })({ button: { preventDoubleClick: !0 } });
  (DTFS_GEF = void 0 === DTFS_GEF ? {} : DTFS_GEF).govukFrontend = e;
})();
// # sourceMappingURL=govukFrontend.js.map
