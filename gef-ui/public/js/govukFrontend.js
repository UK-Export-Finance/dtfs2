let DTFS_GEF;
!(function () {
  var t = {
    d(e, n) {
      for (const o in n) t.o(n, o) && !t.o(e, o) && Object.defineProperty(e, o, { enumerable: !0, get: n[o] });
    },
    o(t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    },
    r(t) {
      typeof Symbol !== 'undefined' && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(t, '__esModule', { value: !0 });
    },
  };
  const e = {};
  function n(t, e) {
    if (window.NodeList.prototype.forEach) return t.forEach(e);
    for (let n = 0; n < t.length; n++) e.call(window, t[n], n, t);
  }
  function o() {
    for (
      var t = function (t) {
          const e = {};
          const n = function (t, o) {
            for (const i in t)
              if (Object.prototype.hasOwnProperty.call(t, i)) {
                const r = t[i];
                const s = o ? `${o}.${i}` : i;
                typeof r === 'object' ? n(r, s) : (e[s] = r);
              }
          };
          return n(t), e;
        },
        e = {},
        n = 0;
      n < arguments.length;
      n++
    ) {
      const o = t(arguments[n]);
      for (const i in o) Object.prototype.hasOwnProperty.call(o, i) && (e[i] = o[i]);
    }
    return e;
  }
  function i(t, e) {
    if (!t || typeof t !== 'object') throw new Error('Provide a `configObject` of type "object".');
    if (!e || typeof e !== 'string') throw new Error('Provide a `namespace` of type "string" to filter the `configObject` by.');
    const n = {};
    for (const o in t) {
      const i = o.split('.');
      if (Object.prototype.hasOwnProperty.call(t, o) && i[0] === e) i.length > 1 && i.shift(), (n[i.join('.')] = t[o]);
    }
    return n;
  }
  function r(t) {
    if (typeof t !== 'string') return t;
    const e = t.trim();
    return e === 'true' || (e !== 'false' && (e.length > 0 && isFinite(Number(e)) ? Number(e) : t));
  }
  function s(t) {
    const e = {};
    for (const n in t) e[n] = r(t[n]);
    return e;
  }
  function a(t, e) {
    (this.translations = t || {}), (this.locale = (e && e.locale) || document.documentElement.lang || 'en');
  }
  t.r(e),
    t.d(e, {
      default() {
        return H;
      },
    }),
    function (t) {
      let e;
      let n;
      let o;
      let i;
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
        (o = 'Getters & setters cannot be defined on this javascript engine'),
        (i = 'A property cannot both have accessors and be writable or have a value'),
        (Object.defineProperty = function (t, r, s) {
          if (e && (t === window || t === document || t === Element.prototype || t instanceof Element)) return e(t, r, s);
          if (t === null || !(t instanceof Object || typeof t === 'object')) throw new TypeError('Object.defineProperty called on non-object');
          if (!(s instanceof Object)) throw new TypeError('Property description must be an object');
          const a = String(r);
          const l = 'value' in s || 'writable' in s;
          const c = 'get' in s && typeof s.get;
          const u = 'set' in s && typeof s.set;
          if (c) {
            if (c !== 'function') throw new TypeError('Getter must be a function');
            if (!n) throw new TypeError(o);
            if (l) throw new TypeError(i);
            Object.__defineGetter__.call(t, a, s.get);
          } else t[a] = s.value;
          if (u) {
            if (u !== 'function') throw new TypeError('Setter must be a function');
            if (!n) throw new TypeError(o);
            if (l) throw new TypeError(i);
            Object.__defineSetter__.call(t, a, s.set);
          }
          return 'value' in s && (t[a] = s.value), t;
        }));
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
    function (t) {
      'Document' in this ||
        (typeof WorkerGlobalScope === 'undefined' &&
          typeof importScripts !== 'function' &&
          (this.HTMLDocument
            ? (this.Document = this.HTMLDocument)
            : ((this.Document = this.HTMLDocument = document.constructor = new Function('return function Document() {}')()),
              (this.Document.prototype = document))));
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
    function (t) {
      ('Element' in this && 'HTMLElement' in this) ||
        (function () {
          if (!window.Element || window.HTMLElement) {
            window.Element = window.HTMLElement = new Function('return function Element() {}')();
            var t;
            const e = document.appendChild(document.createElement('body'));
            const n = e.appendChild(document.createElement('iframe')).contentWindow.document;
            const o = (Element.prototype = n.appendChild(n.createElement('*')));
            const i = {};
            var r = function (t, e) {
              let n;
              let o;
              let s;
              const a = t.childNodes || [];
              let l = -1;
              if (t.nodeType === 1 && t.constructor !== Element) for (n in ((t.constructor = Element), i)) (o = i[n]), (t[n] = o);
              for (; (s = e && a[++l]); ) r(s, e);
              return t;
            };
            const s = document.getElementsByTagName('*');
            const a = document.createElement;
            var l = 100;
            o.attachEvent('onpropertychange', (t) => {
              for (var e, n = t.propertyName, r = !i.hasOwnProperty(n), a = o[n], l = i[n], c = -1; (e = s[++c]); )
                e.nodeType === 1 && (r || e[n] === l) && (e[n] = a);
              i[n] = a;
            }),
              (o.constructor = Element),
              o.hasAttribute ||
                (o.hasAttribute = function (t) {
                  return this.getAttribute(t) !== null;
                }),
              c() || ((document.onreadystatechange = c), (t = setInterval(c, 25))),
              (document.createElement = function (t) {
                const e = a(String(t).toLowerCase());
                return r(e);
              }),
              document.removeChild(e);
          } else window.HTMLElement = window.Element;
          function c() {
            return (
              l-- || clearTimeout(t),
              !(!document.body || document.body.prototype || !/(complete|interactive)/.test(document.readyState)) &&
                (r(document, !0), t && document.body.prototype && clearTimeout(t), !!document.body.prototype)
            );
          }
        })();
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
    function (t) {
      (function () {
        if (!document.documentElement.dataset) return !1;
        const t = document.createElement('div');
        return t.setAttribute('data-a-b', 'c'), t.dataset && t.dataset.aB == 'c';
      })() ||
        Object.defineProperty(Element.prototype, 'dataset', {
          get() {
            for (var t = this.attributes, e = {}, n = 0; n < t.length; n++) {
              const o = t[n];
              if (o && o.name && /^data-\w[.\w-]*$/.test(o.name)) {
                const i = o.name;
                const r = o.value;
                const s = i.substr(5).replace(/-./g, (t) => t.charAt(1).toUpperCase());
                '__defineGetter__' in Object.prototype && '__defineSetter__' in Object.prototype
                  ? Object.defineProperty(e, s, {
                      enumerable: !0,
                      get: function () {
                        return this.value;
                      }.bind({ value: r || '' }),
                      set: function (t, e) {
                        void 0 !== e ? this.setAttribute(t, e) : this.removeAttribute(t);
                      }.bind(this, i),
                    })
                  : (e[s] = r);
              }
            }
            return e;
          },
        });
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
    function (t) {
      'trim' in String.prototype ||
        (String.prototype.trim = function () {
          return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        });
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
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
        t.replace(/%{(.\S+)}/g, (t, o) => {
          if (Object.prototype.hasOwnProperty.call(e, o)) {
            const i = e[o];
            return !1 === i || (typeof i !== 'number' && typeof i !== 'string') ? '' : typeof i === 'number' ? (n ? n.format(i) : i.toString()) : i;
          }
          throw new Error(`i18n: no data found to replace ${t} placeholder in string`);
        })
      );
    }),
    (a.prototype.hasIntlPluralRulesSupport = function () {
      return Boolean(window.Intl && 'PluralRules' in window.Intl && Intl.PluralRules.supportedLocalesOf(this.locale).length);
    }),
    (a.prototype.hasIntlNumberFormatSupport = function () {
      return Boolean(window.Intl && 'NumberFormat' in window.Intl && Intl.NumberFormat.supportedLocalesOf(this.locale).length);
    }),
    (a.prototype.getPluralSuffix = function (t, e) {
      if (((e = Number(e)), !isFinite(e))) return 'other';
      let n;
      if (
        `${t}.${(n = this.hasIntlPluralRulesSupport() ? new Intl.PluralRules(this.locale).select(e) : this.selectPluralFormUsingFallbackRules(e))}` in
        this.translations
      )
        return n;
      if (`${t}.other` in this.translations)
        return (
          console && 'warn' in console && console.warn(`i18n: Missing plural form ".${n}" for "${this.locale}" locale. Falling back to ".other".`), 'other'
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
          for (let o = a.pluralRulesMap[n], i = 0; i < o.length; i++) if (o[i] === t || o[i] === e) return n;
    }),
    (a.pluralRulesMap = {
      arabic: ['ar'],
      chinese: ['my', 'zh', 'id', 'ja', 'jv', 'ko', 'ms', 'th', 'vi'],
      french: ['hy', 'bn', 'fr', 'gu', 'hi', 'fa', 'pa', 'zu'],
      german: ['af', 'sq', 'az', 'eu', 'bg', 'ca', 'da', 'nl', 'en', 'et', 'fi', 'ka', 'de', 'el', 'hu', 'lb', 'no', 'so', 'sw', 'sv', 'ta', 'te', 'tr', 'ur'],
      irish: ['ga'],
      russian: ['ru', 'uk'],
      scottish: ['gd'],
      spanish: ['pt-PT', 'it', 'es'],
      welsh: ['cy'],
    }),
    (a.pluralRules = {
      arabic(t) {
        return t === 0 ? 'zero' : t === 1 ? 'one' : t === 2 ? 'two' : t % 100 >= 3 && t % 100 <= 10 ? 'few' : t % 100 >= 11 && t % 100 <= 99 ? 'many' : 'other';
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
        return t === 1 || t === 11 ? 'one' : t === 2 || t === 12 ? 'two' : (t >= 3 && t <= 10) || (t >= 13 && t <= 19) ? 'few' : 'other';
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
      ('DOMTokenList' in this && (!('classList' in (e = document.createElement('x'))) || (!e.classList.toggle('x', !1) && !e.className))) ||
        (function (e) {
          let n;
          ('DOMTokenList' in e &&
            e.DOMTokenList &&
            (!document.createElementNS ||
              !document.createElementNS('http://www.w3.org/2000/svg', 'svg') ||
              document.createElementNS('http://www.w3.org/2000/svg', 'svg').classList instanceof DOMTokenList)) ||
            (e.DOMTokenList = (function () {
              let e = !0;
              const n = function (t, n, o, i) {
                Object.defineProperty ? Object.defineProperty(t, n, { configurable: !1 === e || !!i, get: o }) : t.__defineGetter__(n, o);
              };
              try {
                n({}, 'support');
              } catch (t) {
                e = !1;
              }
              return function (e, o) {
                const i = this;
                let r = [];
                let s = {};
                let a = 0;
                let l = 0;
                const c = function (t) {
                  n(i, t, () => (d(), r[t]), !1);
                };
                const u = function () {
                  if (a >= l) for (; l < a; ++l) c(l);
                };
                var d = function () {
                  let t;
                  let n;
                  const i = arguments;
                  const l = /\s+/;
                  if (i.length)
                    for (n = 0; n < i.length; ++n)
                      if (l.test(i[n]))
                        throw (((t = new SyntaxError(`String "${i[n]}" contains an invalid character`)).code = 5), (t.name = 'InvalidCharacterError'), t);
                  for (
                    (r = typeof e[o] === 'object' ? `${e[o].baseVal}`.replace(/^\s+|\s+$/g, '').split(l) : `${e[o]}`.replace(/^\s+|\s+$/g, '').split(l))[0] ===
                      '' && (r = []),
                      s = {},
                      n = 0;
                    n < r.length;
                    ++n
                  )
                    s[r[n]] = !0;
                  (a = r.length), u();
                };
                return (
                  d(),
                  n(i, 'length', () => (d(), a)),
                  (i.toLocaleString = i.toString =
                    function () {
                      return d(), r.join(' ');
                    }),
                  (i.item = function (t) {
                    return d(), r[t];
                  }),
                  (i.contains = function (t) {
                    return d(), !!s[t];
                  }),
                  (i.add = function () {
                    d.apply(i, (t = arguments));
                    for (var t, n, l = 0, c = t.length; l < c; ++l) s[(n = t[l])] || (r.push(n), (s[n] = !0));
                    a !== r.length && ((a = r.length >>> 0), typeof e[o] === 'object' ? (e[o].baseVal = r.join(' ')) : (e[o] = r.join(' ')), u());
                  }),
                  (i.remove = function () {
                    d.apply(i, (t = arguments));
                    for (var t, n = {}, l = 0, c = []; l < t.length; ++l) (n[t[l]] = !0), delete s[t[l]];
                    for (l = 0; l < r.length; ++l) n[r[l]] || c.push(r[l]);
                    (r = c), (a = c.length >>> 0), typeof e[o] === 'object' ? (e[o].baseVal = r.join(' ')) : (e[o] = r.join(' ')), u();
                  }),
                  (i.toggle = function (e, n) {
                    return d.apply(i, [e]), t !== n ? (n ? (i.add(e), !0) : (i.remove(e), !1)) : s[e] ? (i.remove(e), !1) : (i.add(e), !0);
                  }),
                  i
                );
              };
            })()),
            'classList' in (n = document.createElement('span')) &&
              (n.classList.toggle('x', !1),
              n.classList.contains('x') &&
                (n.classList.constructor.prototype.toggle = function (e) {
                  let n = arguments[1];
                  if (n === t) {
                    const o = !this.contains(e);
                    return this[o ? 'add' : 'remove'](e), o;
                  }
                  return this[(n = !!n) ? 'add' : 'remove'](e), n;
                })),
            (function () {
              const t = document.createElement('span');
              if ('classList' in t && (t.classList.add('a', 'b'), !t.classList.contains('b'))) {
                const e = t.classList.constructor.prototype.add;
                t.classList.constructor.prototype.add = function () {
                  for (let t = arguments, n = arguments.length, o = 0; o < n; o++) e.call(this, t[o]);
                };
              }
            })(),
            (function () {
              const t = document.createElement('span');
              if ('classList' in t && (t.classList.add('a'), t.classList.add('b'), t.classList.remove('a', 'b'), t.classList.contains('b'))) {
                const e = t.classList.constructor.prototype.remove;
                t.classList.constructor.prototype.remove = function () {
                  for (let t = arguments, n = arguments.length, o = 0; o < n; o++) e.call(this, t[o]);
                };
              }
            })();
        })(this);
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
    function (t) {
      let e;
      ('document' in this &&
        'classList' in document.documentElement &&
        'Element' in this &&
        'classList' in Element.prototype &&
        ((e = document.createElement('span')).classList.add('a', 'b'), e.classList.contains('b'))) ||
        (function (t) {
          let e = !0;
          const n = function (t, n, o, i) {
            Object.defineProperty ? Object.defineProperty(t, n, { configurable: !1 === e || !!i, get: o }) : t.__defineGetter__(n, o);
          };
          try {
            n({}, 'support');
          } catch (t) {
            e = !1;
          }
          const o = function (t, i, r) {
            n(
              t.prototype,
              i,
              function () {
                let t;
                const s = this;
                const a = `__defineGetter__DEFINE_PROPERTY${i}`;
                if (s[a]) return t;
                if (((s[a] = !0), !1 === e)) {
                  for (var l, c = o.mirror || document.createElement('div'), u = c.childNodes, d = u.length, h = 0; h < d; ++h)
                    if (u[h]._R === s) {
                      l = u[h];
                      break;
                    }
                  l || (l = c.appendChild(document.createElement('div'))), (t = DOMTokenList.call(l, s, r));
                } else t = new DOMTokenList(s, r);
                return n(s, i, () => t), delete s[a], t;
              },
              !0,
            );
          };
          o(t.Element, 'classList', 'className'),
            o(t.HTMLElement, 'classList', 'className'),
            o(t.HTMLLinkElement, 'relList', 'rel'),
            o(t.HTMLAnchorElement, 'relList', 'rel'),
            o(t.HTMLAreaElement, 'relList', 'rel');
        })(this);
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
    function (t) {
      ('document' in this && 'matches' in document.documentElement) ||
        (Element.prototype.matches =
          Element.prototype.webkitMatchesSelector ||
          Element.prototype.oMatchesSelector ||
          Element.prototype.msMatchesSelector ||
          Element.prototype.mozMatchesSelector ||
          function (t) {
            for (var e = this, n = (e.document || e.ownerDocument).querySelectorAll(t), o = 0; n[o] && n[o] !== e; ) ++o;
            return !!n[o];
          });
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
    function (t) {
      ('document' in this && 'closest' in document.documentElement) ||
        (Element.prototype.closest = function (t) {
          for (let e = this; e; ) {
            if (e.matches(t)) return e;
            e = 'SVGElement' in window && e instanceof SVGElement ? e.parentNode : e.parentElement;
          }
          return null;
        });
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
    function (t) {
      'Window' in this ||
        (typeof WorkerGlobalScope === 'undefined' &&
          typeof importScripts !== 'function' &&
          (function (t) {
            t.constructor ? (t.Window = t.constructor) : ((t.Window = t.constructor = new Function('return function Window() {}')()).prototype = this);
          })(this));
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
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
                let o;
                if ('createEvent' in document) {
                  o = document.createEvent('Event');
                  const i = !(!n || n.bubbles === t) && n.bubbles;
                  const r = !(!n || n.cancelable === t) && n.cancelable;
                  return o.initEvent(e, i, r), o;
                }
                return (
                  ((o = document.createEventObject()).type = e),
                  (o.bubbles = !(!n || n.bubbles === t) && n.bubbles),
                  (o.cancelable = !(!n || n.cancelable === t) && n.cancelable),
                  o
                );
              }),
              n && Object.defineProperty(window.Event, 'prototype', { configurable: !1, enumerable: !1, writable: !0, value: n }),
              'createEvent' in document ||
                ((window.addEventListener =
                  Window.prototype.addEventListener =
                  Document.prototype.addEventListener =
                  Element.prototype.addEventListener =
                    function () {
                      const t = this;
                      const n = arguments[0];
                      const i = arguments[1];
                      if (t === window && n in e)
                        throw new Error(
                          `In IE8 the event: ${n} is not available on the window object. Please see https://github.com/Financial-Times/polyfill-service/issues/317 for more information.`,
                        );
                      t._events || (t._events = {}),
                        t._events[n] ||
                          ((t._events[n] = function (e) {
                            let n;
                            const i = t._events[e.type].list;
                            const r = i.slice();
                            let s = -1;
                            const a = r.length;
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
                                  ((e.pageX = e.clientX + document.documentElement.scrollLeft), (e.pageY = e.clientY + document.documentElement.scrollTop));
                              ++s < a && !e.cancelImmediate;

                            )
                              s in r && o(i, (n = r[s])) !== -1 && typeof n === 'function' && n.call(t, e);
                          }),
                          (t._events[n].list = []),
                          t.attachEvent && t.attachEvent(`on${n}`, t._events[n])),
                        t._events[n].list.push(i);
                    }),
                (window.removeEventListener =
                  Window.prototype.removeEventListener =
                  Document.prototype.removeEventListener =
                  Element.prototype.removeEventListener =
                    function () {
                      let t;
                      const e = this;
                      const n = arguments[0];
                      const i = arguments[1];
                      e._events &&
                        e._events[n] &&
                        e._events[n].list &&
                        (t = o(e._events[n].list, i)) !== -1 &&
                        (e._events[n].list.splice(t, 1),
                        e._events[n].list.length || (e.detachEvent && e.detachEvent(`on${n}`, e._events[n]), delete e._events[n]));
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
                          const o = function (t) {
                            (t.cancelBubble = !0), (e || window).detachEvent(`on${n}`, o);
                          };
                          this.attachEvent(`on${n}`, o);
                        }
                        this.fireEvent(`on${n}`, t);
                      } catch (o) {
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
                document.attachEvent('onreadystatechange', () => {
                  document.readyState === 'complete' && document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: !0 }));
                }));
          }
          function o(t, e) {
            for (let n = -1, o = t.length; ++n < o; ) if (n in t && t[n] === e) return n;
            return -1;
          }
        })();
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
    function (t) {
      'bind' in Function.prototype ||
        Object.defineProperty(Function.prototype, 'bind', {
          value(t) {
            let e;
            const n = Array;
            const o = Object;
            const i = o.prototype;
            const r = n.prototype;
            const s = function () {};
            const a = i.toString;
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
            const u = r.slice;
            const d = r.concat;
            const h = r.push;
            const p = Math.max;
            const f = this;
            if (!e(f)) throw new TypeError(`Function.prototype.bind called on incompatible ${f}`);
            for (var m, v = u.call(arguments, 1), b = p(0, f.length - v.length), g = [], y = 0; y < b; y++) h.call(g, `$${y}`);
            return (
              (m = Function(
                'binder',
                `return function (${g.join(',')}){ return binder.apply(this, arguments); }`,
              )(function () {
                if (this instanceof m) {
                  const e = f.apply(this, d.call(v, u.call(arguments)));
                  return o(e) === e ? e : this;
                }
                return f.apply(t, d.call(v, u.call(arguments)));
              })),
              f.prototype && ((s.prototype = f.prototype), (m.prototype = new s()), (s.prototype = null)),
              m
            );
          },
        });
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {});
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
    (this.config = o(n, e || {}, s(t.dataset))),
      (this.i18n = new a(i(this.config, 'i18n'))),
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
    const r = this.$module.querySelectorAll(`.${this.sectionClass}`);
    if (!r.length) return this;
    (this.$sections = r),
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
      n(this.$sections, (e, n) => {
        const o = e.querySelector(`.${t.sectionHeaderClass}`);
        o &&
          (t.constructHeaderMarkup(o, n), t.setExpanded(t.isExpanded(e), e), o.addEventListener('click', t.onSectionToggle.bind(t, e)), t.setInitialState(e));
      });
    }),
    (c.prototype.constructHeaderMarkup = function (t, e) {
      const n = t.querySelector(`.${this.sectionButtonClass}`);
      const o = t.querySelector(`.${this.sectionHeadingClass}`);
      const i = t.querySelector(`.${this.sectionSummaryClass}`);
      if (n && o) {
        const r = document.createElement('button');
        r.setAttribute('type', 'button'), r.setAttribute('aria-controls', `${this.$module.id}-content-${(e + 1).toString()}`);
        for (let s = 0; s < n.attributes.length; s++) {
          const a = n.attributes.item(s);
          a.nodeName !== 'id' && r.setAttribute(a.nodeName, a.nodeValue);
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
          r.appendChild(l),
          r.appendChild(this.getButtonPunctuationEl()),
          i)
        ) {
          const f = document.createElement('span');
          const m = document.createElement('span');
          m.classList.add(this.sectionSummaryFocusClass), f.appendChild(m);
          for (let v = 0, b = i.attributes.length; v < b; ++v) {
            const g = i.attributes.item(v).nodeName;
            const y = i.attributes.item(v).nodeValue;
            f.setAttribute(g, y);
          }
          (m.innerHTML = i.innerHTML), i.parentNode.replaceChild(f, i), r.appendChild(f), r.appendChild(this.getButtonPunctuationEl());
        }
        r.appendChild(u), o.removeChild(n), o.appendChild(r);
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
      const o = !this.checkIfAllSectionsOpen();
      n(e, (e) => {
        t.setExpanded(o, e), t.storeState(e);
      }),
        t.updateShowAllButton(o);
    }),
    (c.prototype.setExpanded = function (t, e) {
      const n = e.querySelector(`.${this.upChevronIconClass}`);
      const o = e.querySelector(`.${this.sectionShowHideTextClass}`);
      const i = e.querySelector(`.${this.sectionButtonClass}`);
      const r = e.querySelector(`.${this.sectionContentClass}`);
      if (n && o instanceof HTMLElement && i && r) {
        const s = t ? this.i18n.t('hideSection') : this.i18n.t('showSection');
        (o.innerText = s), i.setAttribute('aria-expanded', t.toString());
        const a = [];
        const l = e.querySelector(`.${this.sectionHeadingTextClass}`);
        l instanceof HTMLElement && a.push(l.innerText.trim());
        const c = e.querySelector(`.${this.sectionSummaryClass}`);
        c instanceof HTMLElement && a.push(c.innerText.trim());
        const u = t ? this.i18n.t('hideSectionAriaLabel') : this.i18n.t('showSectionAriaLabel');
        a.push(u),
          i.setAttribute('aria-label', a.join(' , ')),
          t
            ? (r.removeAttribute('hidden'), e.classList.add(this.sectionExpandedClass), n.classList.remove(this.downChevronIconClass))
            : (r.setAttribute('hidden', 'until-found'), e.classList.remove(this.sectionExpandedClass), n.classList.add(this.downChevronIconClass));
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
        t ? this.$showAllIcon.classList.remove(this.downChevronIconClass) : this.$showAllIcon.classList.add(this.downChevronIconClass);
    });
  var u = {
    checkForSessionStorage() {
      let t;
      const e = 'this is the test string';
      try {
        return window.sessionStorage.setItem(e, e), (t = window.sessionStorage.getItem(e) === e.toString()), window.sessionStorage.removeItem(e), t;
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
        const o = e.getAttribute('aria-expanded');
        n && o && window.sessionStorage.setItem(n, o);
      }
    }
  }),
    (c.prototype.setInitialState = function (t) {
      if (this.browserSupportsSessionStorage && this.config.rememberExpanded) {
        const e = t.querySelector(`.${this.sectionButtonClass}`);
        if (e) {
          const n = e.getAttribute('aria-controls');
          const o = n ? window.sessionStorage.getItem(n) : null;
          o !== null && this.setExpanded(o === 'true', t);
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
    this.config = o({ preventDoubleClick: !1 }, e || {}, s(t.dataset));
  }
  (h.prototype.init = function () {
    this.$module && (this.$module.addEventListener('keydown', this.handleKeyDown), this.$module.addEventListener('click', this.debounce.bind(this)));
  }),
    (h.prototype.handleKeyDown = function (t) {
      const e = t.target;
      t.keyCode === 32 && e instanceof HTMLElement && e.getAttribute('role') === 'button' && (t.preventDefault(), e.click());
    }),
    (h.prototype.debounce = function (t) {
      if (this.config.preventDoubleClick)
        return this.debounceFormSubmitTimer
          ? (t.preventDefault(), !1)
          : void (this.debounceFormSubmitTimer = setTimeout(() => {
              this.debounceFormSubmitTimer = null;
            }, 1e3));
    });
  const p = h;
  (function (t) {
    ('Date' in self && 'now' in self.Date && 'getTime' in self.Date.prototype) ||
      (Date.now = function () {
        return new Date().getTime();
      });
  }).call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {});
  const f = {
    charactersUnderLimit: { one: 'You have %{count} character remaining', other: 'You have %{count} characters remaining' },
    charactersAtLimit: 'You have 0 characters remaining',
    charactersOverLimit: { one: 'You have %{count} character too many', other: 'You have %{count} characters too many' },
    wordsUnderLimit: { one: 'You have %{count} word remaining', other: 'You have %{count} words remaining' },
    wordsAtLimit: 'You have 0 words remaining',
    wordsOverLimit: { one: 'You have %{count} word too many', other: 'You have %{count} words too many' },
    textareaDescription: { other: '' },
  };
  function m(t, e) {
    if (!(t instanceof HTMLElement)) return this;
    const n = t.querySelector('.govuk-js-character-count');
    if (!(n instanceof HTMLTextAreaElement || n instanceof HTMLInputElement)) return this;
    let r;
    let l;
    let c;
    const u = { threshold: 0, i18n: f };
    const d = s(t.dataset);
    let h = {};
    if (
      (('maxwords' in d || 'maxlength' in d) && (h = { maxlength: !1, maxwords: !1 }),
      (this.config = o(u, e || {}, h, d)),
      (this.i18n = new a(i(this.config, 'i18n'), { locale: ((r = t), (l = 'lang'), (c = r.closest(`[${l}]`)), c ? c.getAttribute(l) : null) })),
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
        e.innerText.match(/^\s*$/) && (e.innerText = this.i18n.t('textareaDescription', { count: this.maxLength })), t.insertAdjacentElement('afterend', e);
        const n = document.createElement('div');
        (n.className = 'govuk-character-count__sr-status govuk-visually-hidden'),
          n.setAttribute('aria-live', 'polite'),
          (this.$screenReaderCountMessage = n),
          e.insertAdjacentElement('afterend', n);
        const o = document.createElement('div');
        (o.className = e.className),
          o.classList.add('govuk-character-count__status'),
          o.setAttribute('aria-hidden', 'true'),
          (this.$visibleCountMessage = o),
          e.insertAdjacentElement('afterend', o),
          e.classList.add('govuk-visually-hidden'),
          t.removeAttribute('maxlength'),
          this.bindChangeEvents(),
          window.addEventListener('onpageshow' in window ? 'pageshow' : 'DOMContentLoaded', this.updateCountMessage.bind(this)),
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
      this.valueChecker = setInterval(() => {
        (!this.lastInputTimestamp || Date.now() - 500 >= this.lastInputTimestamp) && this.updateIfValueChanged();
      }, 1e3);
    }),
    (m.prototype.handleBlur = function () {
      clearInterval(this.valueChecker);
    }),
    (m.prototype.updateIfValueChanged = function () {
      this.$textarea.value !== this.lastInputValue && ((this.lastInputValue = this.$textarea.value), this.updateCountMessage());
    }),
    (m.prototype.updateCountMessage = function () {
      this.updateVisibleCountMessage(), this.updateScreenReaderCountMessage();
    }),
    (m.prototype.updateVisibleCountMessage = function () {
      const t = this.$textarea;
      const e = this.$visibleCountMessage;
      const n = this.maxLength - this.count(t.value);
      this.isOverThreshold() ? e.classList.remove('govuk-character-count__message--disabled') : e.classList.add('govuk-character-count__message--disabled'),
        n < 0
          ? (t.classList.add('govuk-textarea--error'), e.classList.remove('govuk-hint'), e.classList.add('govuk-error-message'))
          : (t.classList.remove('govuk-textarea--error'), e.classList.remove('govuk-error-message'), e.classList.add('govuk-hint')),
        (e.innerText = this.getCountMessage());
    }),
    (m.prototype.updateScreenReaderCountMessage = function () {
      const t = this.$screenReaderCountMessage;
      this.isOverThreshold() ? t.removeAttribute('aria-hidden') : t.setAttribute('aria-hidden', 'true'), (t.innerText = this.getCountMessage());
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
      n(this.$inputs, (t) => {
        const e = t.getAttribute('data-aria-controls');
        e && document.getElementById(e) && (t.setAttribute('aria-controls', e), t.removeAttribute('data-aria-controls'));
      }),
        window.addEventListener('onpageshow' in window ? 'pageshow' : 'DOMContentLoaded', this.syncAllConditionalReveals.bind(this)),
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
          const o = t.checked;
          t.setAttribute('aria-expanded', o.toString()), n.classList.toggle('govuk-checkboxes__conditional--hidden', !o);
        }
      }
    }),
    (b.prototype.unCheckAllInputsExcept = function (t) {
      const e = this;
      n(document.querySelectorAll(`input[type="checkbox"][name="${t.name}"]`), (n) => {
        t.form === n.form && n !== t && ((n.checked = !1), e.syncConditionalRevealWithInputState(n));
      });
    }),
    (b.prototype.unCheckExclusiveInputs = function (t) {
      const e = this;
      n(document.querySelectorAll(`input[data-behaviour="exclusive"][type="checkbox"][name="${t.name}"]`), (n) => {
        t.form === n.form && ((n.checked = !1), e.syncConditionalRevealWithInputState(n));
      });
    }),
    (b.prototype.handleClick = function (t) {
      const e = t.target;
      e instanceof HTMLInputElement &&
        e.type === 'checkbox' &&
        (e.getAttribute('aria-controls') && this.syncConditionalRevealWithInputState(e),
        e.checked && (e.getAttribute('data-behaviour') === 'exclusive' ? this.unCheckAllInputsExcept(e) : this.unCheckExclusiveInputs(e)));
    });
  const g = b;
  function y(t) {
    if (!(t instanceof HTMLElement)) return this;
    (this.$module = t), (this.$summary = null), (this.$content = null);
  }
  (y.prototype.init = function () {
    this.$module && (('HTMLDetailsElement' in window && this.$module instanceof HTMLDetailsElement) || this.polyfillDetails());
  }),
    (y.prototype.polyfillDetails = function () {
      let t;
      const e = this.$module;
      const n = (this.$summary = e.getElementsByTagName('summary').item(0));
      const o = (this.$content = e.getElementsByTagName('div').item(0));
      n &&
        o &&
        (o.id ||
          (o.id = `details-content-${
            ((t = new Date().getTime()),
            void 0 !== window.performance && typeof window.performance.now === 'function' && (t += window.performance.now()),
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (e) => {
              const n = (t + 16 * Math.random()) % 16 | 0;
              return (t = Math.floor(t / 16)), (e === 'x' ? n : (3 & n) | 8).toString(16);
            }))
          }`),
        e.setAttribute('role', 'group'),
        n.setAttribute('role', 'button'),
        n.setAttribute('aria-controls', o.id),
        (n.tabIndex = 0),
        this.$module.hasAttribute('open') ? n.setAttribute('aria-expanded', 'true') : (n.setAttribute('aria-expanded', 'false'), (o.style.display = 'none')),
        this.polyfillHandleInputs(this.polyfillSetAttributes.bind(this)));
    }),
    (y.prototype.polyfillSetAttributes = function () {
      return (
        this.$module.hasAttribute('open')
          ? (this.$module.removeAttribute('open'), this.$summary.setAttribute('aria-expanded', 'false'), (this.$content.style.display = 'none'))
          : (this.$module.setAttribute('open', 'open'), this.$summary.setAttribute('aria-expanded', 'true'), (this.$content.style.display = '')),
        !0
      );
    }),
    (y.prototype.polyfillHandleInputs = function (t) {
      this.$summary.addEventListener('keypress', (e) => {
        const n = e.target;
        (e.keyCode !== 13 && e.keyCode !== 32) ||
          (n instanceof HTMLElement && n.nodeName.toLowerCase() === 'summary' && (e.preventDefault(), n.click ? n.click() : t(e)));
      }),
        this.$summary.addEventListener('keyup', (t) => {
          const e = t.target;
          t.keyCode === 32 && e instanceof HTMLElement && e.nodeName.toLowerCase() === 'summary' && t.preventDefault();
        }),
        this.$summary.addEventListener('click', t);
    });
  const w = y;
  function E(t, e) {
    if (!(t instanceof HTMLElement)) return this;
    this.$module = t;
    this.config = o({ disableAutoFocus: !1 }, e || {}, s(t.dataset));
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
        t.addEventListener('blur', () => {
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
      const o = this.getAssociatedLegendOrLabel(n);
      return !!o && (o.scrollIntoView(), n.focus({ preventScroll: !0 }), !0);
    }),
    (E.prototype.getFragmentFromUrl = function (t) {
      if (t.indexOf('#') !== -1) return t.split('#').pop();
    }),
    (E.prototype.getAssociatedLegendOrLabel = function (t) {
      const e = t.closest('fieldset');
      if (e) {
        const n = e.getElementsByTagName('legend');
        if (n.length) {
          const o = n[0];
          if (t instanceof HTMLInputElement && (t.type === 'checkbox' || t.type === 'radio')) return o;
          const i = o.getBoundingClientRect().top;
          const r = t.getBoundingClientRect();
          if (r.height && window.innerHeight) if (r.top + r.height - i < window.innerHeight / 2) return o;
        }
      }
      return document.querySelector(`label[for='${t.getAttribute('id')}']`) || t.closest('label');
    });
  const L = E;
  function S(t) {
    if (!(t instanceof HTMLElement)) return this;
    (this.$module = t),
      (this.$menuButton = t.querySelector('.govuk-js-header-toggle')),
      (this.$menu = this.$menuButton && t.querySelector(`#${this.$menuButton.getAttribute('aria-controls')}`)),
      (this.menuIsOpen = !1),
      (this.mql = null);
  }
  (S.prototype.init = function () {
    this.$module &&
      this.$menuButton &&
      this.$menu &&
      ('matchMedia' in window
        ? ((this.mql = window.matchMedia('(min-width: 48.0625em)')),
          'addEventListener' in this.mql ? this.mql.addEventListener('change', this.syncState.bind(this)) : this.mql.addListener(this.syncState.bind(this)),
          this.syncState(),
          this.$menuButton.addEventListener('click', this.handleMenuButtonClick.bind(this)))
        : this.$menuButton.setAttribute('hidden', ''));
  }),
    (S.prototype.syncState = function () {
      this.mql.matches
        ? (this.$menu.removeAttribute('hidden'), this.$menuButton.setAttribute('hidden', ''))
        : (this.$menuButton.removeAttribute('hidden'),
          this.$menuButton.setAttribute('aria-expanded', this.menuIsOpen.toString()),
          this.menuIsOpen ? this.$menu.removeAttribute('hidden') : this.$menu.setAttribute('hidden', ''));
    }),
    (S.prototype.handleMenuButtonClick = function () {
      (this.menuIsOpen = !this.menuIsOpen), this.syncState();
    });
  const A = S;
  function k(t, e) {
    if (!(t instanceof HTMLElement)) return this;
    this.$module = t;
    this.config = o({ disableAutoFocus: !1 }, e || {}, s(t.dataset));
  }
  (k.prototype.init = function () {
    this.$module && this.setFocus();
  }),
    (k.prototype.setFocus = function () {
      const t = this.$module;
      this.config.disableAutoFocus ||
        (t.getAttribute('role') === 'alert' &&
          (t.getAttribute('tabindex') ||
            (t.setAttribute('tabindex', '-1'),
            t.addEventListener('blur', () => {
              t.removeAttribute('tabindex');
            })),
          t.focus()));
    });
  const C = k;
  function T(t) {
    if (!(t instanceof HTMLElement)) return this;
    const e = t.querySelectorAll('input[type="radio"]');
    if (!e.length) return this;
    (this.$module = t), (this.$inputs = e);
  }
  (T.prototype.init = function () {
    if (this.$module && this.$inputs) {
      const t = this.$module;
      n(this.$inputs, (t) => {
        const e = t.getAttribute('data-aria-controls');
        e && document.getElementById(e) && (t.setAttribute('aria-controls', e), t.removeAttribute('data-aria-controls'));
      }),
        window.addEventListener('onpageshow' in window ? 'pageshow' : 'DOMContentLoaded', this.syncAllConditionalReveals.bind(this)),
        this.syncAllConditionalReveals(),
        t.addEventListener('click', this.handleClick.bind(this));
    }
  }),
    (T.prototype.syncAllConditionalReveals = function () {
      n(this.$inputs, this.syncConditionalRevealWithInputState.bind(this));
    }),
    (T.prototype.syncConditionalRevealWithInputState = function (t) {
      const e = t.getAttribute('aria-controls');
      if (e) {
        const n = document.getElementById(e);
        if (n && n.classList.contains('govuk-radios__conditional')) {
          const o = t.checked;
          t.setAttribute('aria-expanded', o.toString()), n.classList.toggle('govuk-radios__conditional--hidden', !o);
        }
      }
    }),
    (T.prototype.handleClick = function (t) {
      const e = this;
      const o = t.target;
      if (o instanceof HTMLInputElement && o.type === 'radio') {
        const i = document.querySelectorAll('input[type="radio"][aria-controls]');
        const r = o.form;
        const s = o.name;
        n(i, (t) => {
          const n = t.form === r;
          t.name === s && n && e.syncConditionalRevealWithInputState(t);
        });
      }
    });
  const x = T;
  function _(t) {
    if (!(t instanceof HTMLAnchorElement)) return this;
    (this.$module = t), (this.$linkedElement = null), (this.linkedElementListener = !1);
  }
  (_.prototype.init = function () {
    if (this.$module) {
      const t = this.getLinkedElement();
      t && ((this.$linkedElement = t), this.$module.addEventListener('click', this.focusLinkedElement.bind(this)));
    }
  }),
    (_.prototype.getLinkedElement = function () {
      const t = this.getFragmentFromUrl();
      return t ? document.getElementById(t) : null;
    }),
    (_.prototype.focusLinkedElement = function () {
      const t = this.$linkedElement;
      t.getAttribute('tabindex') ||
        (t.setAttribute('tabindex', '-1'),
        t.classList.add('govuk-skip-link-focused-element'),
        this.linkedElementListener || (this.$linkedElement.addEventListener('blur', this.removeFocusProperties.bind(this)), (this.linkedElementListener = !0))),
        t.focus();
    }),
    (_.prototype.removeFocusProperties = function () {
      this.$linkedElement.removeAttribute('tabindex'), this.$linkedElement.classList.remove('govuk-skip-link-focused-element');
    }),
    (_.prototype.getFragmentFromUrl = function () {
      if (this.$module.hash) return this.$module.hash.split('#').pop();
    });
  const $ = _;
  function j(t) {
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
  }).call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
    function (t) {
      ('document' in this && 'previousElementSibling' in document.documentElement) ||
        Object.defineProperty(Element.prototype, 'previousElementSibling', {
          get() {
            for (var t = this.previousSibling; t && t.nodeType !== 1; ) t = t.previousSibling;
            return t;
          },
        });
    }.call((typeof window === 'object' && window) || (typeof self === 'object' && self) || (typeof global === 'object' && global) || {}),
    (j.prototype.init = function () {
      this.$module && this.$tabs && (typeof window.matchMedia === 'function' ? this.setupResponsiveChecks() : this.setup());
    }),
    (j.prototype.setupResponsiveChecks = function () {
      (this.mql = window.matchMedia('(min-width: 40.0625em)')), this.mql.addListener(this.checkMode.bind(this)), this.checkMode();
    }),
    (j.prototype.checkMode = function () {
      this.mql.matches ? this.setup() : this.teardown();
    }),
    (j.prototype.setup = function () {
      const t = this;
      const e = this.$module;
      const o = this.$tabs;
      const i = e.querySelector('.govuk-tabs__list');
      const r = e.querySelectorAll('.govuk-tabs__list-item');
      if (o && i && r) {
        i.setAttribute('role', 'tablist'),
          n(r, (t) => {
            t.setAttribute('role', 'presentation');
          }),
          n(o, (e) => {
            t.setAttributes(e), e.addEventListener('click', t.boundTabClick, !0), e.addEventListener('keydown', t.boundTabKeydown, !0), t.hideTab(e);
          });
        const s = this.getTab(window.location.hash) || this.$tabs[0];
        s && (this.showTab(s), window.addEventListener('hashchange', this.boundOnHashChange, !0));
      }
    }),
    (j.prototype.teardown = function () {
      const t = this;
      const e = this.$module;
      const o = this.$tabs;
      const i = e.querySelector('.govuk-tabs__list');
      const r = e.querySelectorAll('a.govuk-tabs__list-item');
      o &&
        i &&
        r &&
        (i.removeAttribute('role'),
        n(r, (t) => {
          t.removeAttribute('role');
        }),
        n(o, (e) => {
          e.removeEventListener('click', t.boundTabClick, !0), e.removeEventListener('keydown', t.boundTabKeydown, !0), t.unsetAttributes(e);
        }),
        window.removeEventListener('hashchange', this.boundOnHashChange, !0));
    }),
    (j.prototype.onHashChange = function () {
      const t = window.location.hash;
      const e = this.getTab(t);
      if (e)
        if (this.changingHash) this.changingHash = !1;
        else {
          const n = this.getCurrentTab();
          n && (this.hideTab(n), this.showTab(e), e.focus());
        }
    }),
    (j.prototype.hideTab = function (t) {
      this.unhighlightTab(t), this.hidePanel(t);
    }),
    (j.prototype.showTab = function (t) {
      this.highlightTab(t), this.showPanel(t);
    }),
    (j.prototype.getTab = function (t) {
      return this.$module.querySelector(`a.govuk-tabs__tab[href="${t}"]`);
    }),
    (j.prototype.setAttributes = function (t) {
      const e = this.getHref(t).slice(1);
      t.setAttribute('id', `tab_${e}`),
        t.setAttribute('role', 'tab'),
        t.setAttribute('aria-controls', e),
        t.setAttribute('aria-selected', 'false'),
        t.setAttribute('tabindex', '-1');
      const n = this.getPanel(t);
      n && (n.setAttribute('role', 'tabpanel'), n.setAttribute('aria-labelledby', t.id), n.classList.add(this.jsHiddenClass));
    }),
    (j.prototype.unsetAttributes = function (t) {
      t.removeAttribute('id'), t.removeAttribute('role'), t.removeAttribute('aria-controls'), t.removeAttribute('aria-selected'), t.removeAttribute('tabindex');
      const e = this.getPanel(t);
      e && (e.removeAttribute('role'), e.removeAttribute('aria-labelledby'), e.classList.remove(this.jsHiddenClass));
    }),
    (j.prototype.onTabClick = function (t) {
      const e = this.getCurrentTab();
      const n = t.currentTarget;
      e && n instanceof HTMLAnchorElement && (t.preventDefault(), this.hideTab(e), this.showTab(n), this.createHistoryEntry(n));
    }),
    (j.prototype.createHistoryEntry = function (t) {
      const e = this.getPanel(t);
      if (e) {
        const n = e.id;
        (e.id = ''), (this.changingHash = !0), (window.location.hash = this.getHref(t).slice(1)), (e.id = n);
      }
    }),
    (j.prototype.onTabKeydown = function (t) {
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
    (j.prototype.activateNextTab = function () {
      const t = this.getCurrentTab();
      if (t && t.parentElement) {
        const e = t.parentElement.nextElementSibling;
        if (e) {
          const n = e.querySelector('a.govuk-tabs__tab');
          n && (this.hideTab(t), this.showTab(n), n.focus(), this.createHistoryEntry(n));
        }
      }
    }),
    (j.prototype.activatePreviousTab = function () {
      const t = this.getCurrentTab();
      if (t && t.parentElement) {
        const e = t.parentElement.previousElementSibling;
        if (e) {
          const n = e.querySelector('a.govuk-tabs__tab');
          n && (this.hideTab(t), this.showTab(n), n.focus(), this.createHistoryEntry(n));
        }
      }
    }),
    (j.prototype.getPanel = function (t) {
      return this.$module.querySelector(this.getHref(t));
    }),
    (j.prototype.showPanel = function (t) {
      const e = this.getPanel(t);
      e && e.classList.remove(this.jsHiddenClass);
    }),
    (j.prototype.hidePanel = function (t) {
      const e = this.getPanel(t);
      e && e.classList.add(this.jsHiddenClass);
    }),
    (j.prototype.unhighlightTab = function (t) {
      t.parentElement &&
        (t.setAttribute('aria-selected', 'false'), t.parentElement.classList.remove('govuk-tabs__list-item--selected'), t.setAttribute('tabindex', '-1'));
    }),
    (j.prototype.highlightTab = function (t) {
      t.parentElement &&
        (t.setAttribute('aria-selected', 'true'), t.parentElement.classList.add('govuk-tabs__list-item--selected'), t.setAttribute('tabindex', '0'));
    }),
    (j.prototype.getCurrentTab = function () {
      return this.$module.querySelector('.govuk-tabs__list-item--selected a.govuk-tabs__tab');
    }),
    (j.prototype.getHref = function (t) {
      const e = t.getAttribute('href');
      return e.slice(e.indexOf('#'), e.length);
    });
  const M = j;
  var H = (function (t) {
    const e = (t = void 0 !== t ? t : {}).scope instanceof HTMLElement ? t.scope : document;
    n(e.querySelectorAll('[data-module="govuk-accordion"]'), (e) => {
      new d(e, t.accordion).init();
    }),
      n(e.querySelectorAll('[data-module="govuk-button"]'), (e) => {
        new p(e, t.button).init();
      }),
      n(e.querySelectorAll('[data-module="govuk-character-count"]'), (e) => {
        new v(e, t.characterCount).init();
      }),
      n(e.querySelectorAll('[data-module="govuk-checkboxes"]'), (t) => {
        new g(t).init();
      }),
      n(e.querySelectorAll('[data-module="govuk-details"]'), (t) => {
        new w(t).init();
      });
    const o = e.querySelector('[data-module="govuk-error-summary"]');
    o && new L(o, t.errorSummary).init();
    const i = e.querySelector('[data-module="govuk-header"]');
    i && new A(i).init(),
      n(e.querySelectorAll('[data-module="govuk-notification-banner"]'), (e) => {
        new C(e, t.notificationBanner).init();
      }),
      n(e.querySelectorAll('[data-module="govuk-radios"]'), (t) => {
        new x(t).init();
      });
    const r = e.querySelector('[data-module="govuk-skip-link"]');
    r && new $(r).init(),
      n(e.querySelectorAll('[data-module="govuk-tabs"]'), (t) => {
        new M(t).init();
      });
  })({ button: { preventDoubleClick: !0 } });
  (DTFS_GEF = void 0 === DTFS_GEF ? {} : DTFS_GEF).govukFrontend = e;
})();
// # sourceMappingURL=govukFrontend.js.map
