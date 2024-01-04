var DTFS_PORTAL;
!(function () {
  'use strict';
  var t = {
      d: function (e, s) {
        for (var i in s) t.o(s, i) && !t.o(e, i) && Object.defineProperty(e, i, { enumerable: !0, get: s[i] });
      },
      o: function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
      },
      r: function (t) {
        'undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
          Object.defineProperty(t, '__esModule', { value: !0 });
      },
    },
    e = {};
  function s(t, e) {
    if (null == t) return {};
    var s,
      i,
      a = {},
      u = Object.keys(t);
    for (i = 0; i < u.length; i++) (s = u[i]), e.indexOf(s) >= 0 || (a[s] = t[s]);
    return a;
  }
  function i(t) {
    let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return new i.InputMask(t, e);
  }
  t.r(e),
    t.d(e, {
      default: function () {
        return q;
      },
    });
  class a {
    constructor(t) {
      Object.assign(this, { inserted: '', rawInserted: '', skip: !1, tailShift: 0 }, t);
    }
    aggregate(t) {
      return (this.rawInserted += t.rawInserted), (this.skip = this.skip || t.skip), (this.inserted += t.inserted), (this.tailShift += t.tailShift), this;
    }
    get offset() {
      return this.tailShift + this.inserted.length;
    }
  }
  function u(t) {
    return 'string' == typeof t || t instanceof String;
  }
  i.ChangeDetails = a;
  const n = 'NONE',
    r = 'LEFT',
    h = 'FORCE_LEFT',
    l = 'RIGHT',
    o = 'FORCE_RIGHT';
  function d(t) {
    return t.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }
  function p(t) {
    return Array.isArray(t) ? t : [t, new a()];
  }
  function c(t, e) {
    if (e === t) return !0;
    var s,
      i = Array.isArray(e),
      a = Array.isArray(t);
    if (i && a) {
      if (e.length != t.length) return !1;
      for (s = 0; s < e.length; s++) if (!c(e[s], t[s])) return !1;
      return !0;
    }
    if (i != a) return !1;
    if (e && t && 'object' == typeof e && 'object' == typeof t) {
      var u = e instanceof Date,
        n = t instanceof Date;
      if (u && n) return e.getTime() == t.getTime();
      if (u != n) return !1;
      var r = e instanceof RegExp,
        h = t instanceof RegExp;
      if (r && h) return e.toString() == t.toString();
      if (r != h) return !1;
      var l = Object.keys(e);
      for (s = 0; s < l.length; s++) if (!Object.prototype.hasOwnProperty.call(t, l[s])) return !1;
      for (s = 0; s < l.length; s++) if (!c(t[l[s]], e[l[s]])) return !1;
      return !0;
    }
    return !(!e || !t || 'function' != typeof e || 'function' != typeof t) && e.toString() === t.toString();
  }
  class g {
    constructor(t, e, s, i) {
      for (
        this.value = t, this.cursorPos = e, this.oldValue = s, this.oldSelection = i;
        this.value.slice(0, this.startChangePos) !== this.oldValue.slice(0, this.startChangePos);

      )
        --this.oldSelection.start;
    }
    get startChangePos() {
      return Math.min(this.cursorPos, this.oldSelection.start);
    }
    get insertedCount() {
      return this.cursorPos - this.startChangePos;
    }
    get inserted() {
      return this.value.substr(this.startChangePos, this.insertedCount);
    }
    get removedCount() {
      return Math.max(this.oldSelection.end - this.startChangePos || this.oldValue.length - this.value.length, 0);
    }
    get removed() {
      return this.oldValue.substr(this.startChangePos, this.removedCount);
    }
    get head() {
      return this.value.substring(0, this.startChangePos);
    }
    get tail() {
      return this.value.substring(this.startChangePos + this.insertedCount);
    }
    get removeDirection() {
      return !this.removedCount || this.insertedCount
        ? n
        : (this.oldSelection.end !== this.cursorPos && this.oldSelection.start !== this.cursorPos) || this.oldSelection.end !== this.oldSelection.start
        ? r
        : l;
    }
  }
  class k {
    constructor() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '',
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
        s = arguments.length > 2 ? arguments[2] : void 0;
      (this.value = t), (this.from = e), (this.stop = s);
    }
    toString() {
      return this.value;
    }
    extend(t) {
      this.value += String(t);
    }
    appendTo(t) {
      return t.append(this.toString(), { tail: !0 }).aggregate(t._appendPlaceholder());
    }
    get state() {
      return { value: this.value, from: this.from, stop: this.stop };
    }
    set state(t) {
      Object.assign(this, t);
    }
    unshift(t) {
      if (!this.value.length || (null != t && this.from >= t)) return '';
      const e = this.value[0];
      return (this.value = this.value.slice(1)), e;
    }
    shift() {
      if (!this.value.length) return '';
      const t = this.value[this.value.length - 1];
      return (this.value = this.value.slice(0, -1)), t;
    }
  }
  class f {
    constructor(t) {
      (this._value = ''), this._update(Object.assign({}, f.DEFAULTS, t)), (this.isInitialized = !0);
    }
    updateOptions(t) {
      Object.keys(t).length && this.withValueRefresh(this._update.bind(this, t));
    }
    _update(t) {
      Object.assign(this, t);
    }
    get state() {
      return { _value: this.value };
    }
    set state(t) {
      this._value = t._value;
    }
    reset() {
      this._value = '';
    }
    get value() {
      return this._value;
    }
    set value(t) {
      this.resolve(t);
    }
    resolve(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { input: !0 };
      return this.reset(), this.append(t, e, ''), this.doCommit(), this.value;
    }
    get unmaskedValue() {
      return this.value;
    }
    set unmaskedValue(t) {
      this.reset(), this.append(t, {}, ''), this.doCommit();
    }
    get typedValue() {
      return this.doParse(this.value);
    }
    set typedValue(t) {
      this.value = this.doFormat(t);
    }
    get rawInputValue() {
      return this.extractInput(0, this.value.length, { raw: !0 });
    }
    set rawInputValue(t) {
      this.reset(), this.append(t, { raw: !0 }, ''), this.doCommit();
    }
    get displayValue() {
      return this.value;
    }
    get isComplete() {
      return !0;
    }
    get isFilled() {
      return this.isComplete;
    }
    nearestInputPos(t, e) {
      return t;
    }
    totalInputPositions() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
      return Math.min(this.value.length, e - t);
    }
    extractInput() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
      return this.value.slice(t, e);
    }
    extractTail() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
      return new k(this.extractInput(t, e), t);
    }
    appendTail(t) {
      return u(t) && (t = new k(String(t))), t.appendTo(this);
    }
    _appendCharRaw(t) {
      return t ? ((this._value += t), new a({ inserted: t, rawInserted: t })) : new a();
    }
    _appendChar(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
        s = arguments.length > 2 ? arguments[2] : void 0;
      const i = this.state;
      let u;
      if ((([t, u] = p(this.doPrepare(t, e))), (u = u.aggregate(this._appendCharRaw(t, e))), u.inserted)) {
        let t,
          n = !1 !== this.doValidate(e);
        if (n && null != s) {
          const e = this.state;
          !0 === this.overwrite && ((t = s.state), s.unshift(this.value.length - u.tailShift));
          let i = this.appendTail(s);
          (n = i.rawInserted === s.toString()),
            (n && i.inserted) ||
              'shift' !== this.overwrite ||
              ((this.state = e), (t = s.state), s.shift(), (i = this.appendTail(s)), (n = i.rawInserted === s.toString())),
            n && i.inserted && (this.state = e);
        }
        n || ((u = new a()), (this.state = i), s && t && (s.state = t));
      }
      return u;
    }
    _appendPlaceholder() {
      return new a();
    }
    _appendEager() {
      return new a();
    }
    append(t, e, s) {
      if (!u(t)) throw new Error('value should be string');
      const i = new a(),
        n = u(s) ? new k(String(s)) : s;
      null != e && e.tail && (e._beforeTailState = this.state);
      for (let s = 0; s < t.length; ++s) {
        const a = this._appendChar(t[s], e, n);
        if (!a.rawInserted && !this.doSkipInvalid(t[s], e, n)) break;
        i.aggregate(a);
      }
      return (
        (!0 === this.eager || 'append' === this.eager) && null != e && e.input && t && i.aggregate(this._appendEager()),
        null != n && (i.tailShift += this.appendTail(n).tailShift),
        i
      );
    }
    remove() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
      return (this._value = this.value.slice(0, t) + this.value.slice(e)), new a();
    }
    withValueRefresh(t) {
      if (this._refreshing || !this.isInitialized) return t();
      this._refreshing = !0;
      const e = this.rawInputValue,
        s = this.value,
        i = t();
      return (
        (this.rawInputValue = e),
        this.value && this.value !== s && 0 === s.indexOf(this.value) && this.append(s.slice(this.value.length), {}, ''),
        delete this._refreshing,
        i
      );
    }
    runIsolated(t) {
      if (this._isolated || !this.isInitialized) return t(this);
      this._isolated = !0;
      const e = this.state,
        s = t(this);
      return (this.state = e), delete this._isolated, s;
    }
    doSkipInvalid(t) {
      return this.skipInvalid;
    }
    doPrepare(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      return this.prepare ? this.prepare(t, this, e) : t;
    }
    doValidate(t) {
      return (!this.validate || this.validate(this.value, this, t)) && (!this.parent || this.parent.doValidate(t));
    }
    doCommit() {
      this.commit && this.commit(this.value, this);
    }
    doFormat(t) {
      return this.format ? this.format(t, this) : t;
    }
    doParse(t) {
      return this.parse ? this.parse(t, this) : t;
    }
    splice(t, e, s, i) {
      let u = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : { input: !0 };
      const d = t + e,
        p = this.extractTail(d),
        c = !0 === this.eager || 'remove' === this.eager;
      let g;
      c &&
        ((i = (function (t) {
          switch (t) {
            case r:
              return h;
            case l:
              return o;
            default:
              return t;
          }
        })(i)),
        (g = this.extractInput(0, d, { raw: !0 })));
      let k = t;
      const f = new a();
      if (
        (i !== n && ((k = this.nearestInputPos(t, e > 1 && 0 !== t && !c ? n : i)), (f.tailShift = k - t)),
        f.aggregate(this.remove(k)),
        c && i !== n && g === this.rawInputValue)
      )
        if (i === h) {
          let t;
          for (; g === this.rawInputValue && (t = this.value.length); ) f.aggregate(new a({ tailShift: -1 })).aggregate(this.remove(t - 1));
        } else i === o && p.unshift();
      return f.aggregate(this.append(s, u, p));
    }
    maskEquals(t) {
      return this.mask === t;
    }
    typedValueEquals(t) {
      const e = this.typedValue;
      return t === e || (f.EMPTY_VALUES.includes(t) && f.EMPTY_VALUES.includes(e)) || this.doFormat(t) === this.doFormat(this.typedValue);
    }
  }
  function m(t) {
    if (null == t) throw new Error('mask property should be defined');
    return t instanceof RegExp
      ? i.MaskedRegExp
      : u(t)
      ? i.MaskedPattern
      : t instanceof Date || t === Date
      ? i.MaskedDate
      : t instanceof Number || 'number' == typeof t || t === Number
      ? i.MaskedNumber
      : Array.isArray(t) || t === Array
      ? i.MaskedDynamic
      : i.Masked && t.prototype instanceof i.Masked
      ? t
      : t instanceof i.Masked
      ? t.constructor
      : t instanceof Function
      ? i.MaskedFunction
      : (console.warn('Mask not found for mask', t), i.Masked);
  }
  function v(t) {
    if (i.Masked && t instanceof i.Masked) return t;
    const e = (t = Object.assign({}, t)).mask;
    if (i.Masked && e instanceof i.Masked) return e;
    const s = m(e);
    if (!s) throw new Error('Masked class is not found for provided mask, appropriate module needs to be import manually before creating mask.');
    return new s(t);
  }
  (f.DEFAULTS = { format: String, parse: (t) => t, skipInvalid: !0 }), (f.EMPTY_VALUES = [void 0, null, '']), (i.Masked = f), (i.createMask = v);
  const _ = ['parent', 'isOptional', 'placeholderChar', 'displayChar', 'lazy', 'eager'],
    A = {
      0: /\d/,
      a: /[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
      '*': /./,
    };
  class C {
    constructor(t) {
      const { parent: e, isOptional: i, placeholderChar: a, displayChar: u, lazy: n, eager: r } = t,
        h = s(t, _);
      (this.masked = v(h)), Object.assign(this, { parent: e, isOptional: i, placeholderChar: a, displayChar: u, lazy: n, eager: r });
    }
    reset() {
      (this.isFilled = !1), this.masked.reset();
    }
    remove() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
      return 0 === t && e >= 1 ? ((this.isFilled = !1), this.masked.remove(t, e)) : new a();
    }
    get value() {
      return this.masked.value || (this.isFilled && !this.isOptional ? this.placeholderChar : '');
    }
    get unmaskedValue() {
      return this.masked.unmaskedValue;
    }
    get displayValue() {
      return (this.masked.value && this.displayChar) || this.value;
    }
    get isComplete() {
      return Boolean(this.masked.value) || this.isOptional;
    }
    _appendChar(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      if (this.isFilled) return new a();
      const s = this.masked.state,
        i = this.masked._appendChar(t, e);
      return (
        i.inserted && !1 === this.doValidate(e) && ((i.inserted = i.rawInserted = ''), (this.masked.state = s)),
        i.inserted || this.isOptional || this.lazy || e.input || (i.inserted = this.placeholderChar),
        (i.skip = !i.inserted && !this.isOptional),
        (this.isFilled = Boolean(i.inserted)),
        i
      );
    }
    append() {
      return this.masked.append(...arguments);
    }
    _appendPlaceholder() {
      const t = new a();
      return this.isFilled || this.isOptional || ((this.isFilled = !0), (t.inserted = this.placeholderChar)), t;
    }
    _appendEager() {
      return new a();
    }
    extractTail() {
      return this.masked.extractTail(...arguments);
    }
    appendTail() {
      return this.masked.appendTail(...arguments);
    }
    extractInput() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length,
        s = arguments.length > 2 ? arguments[2] : void 0;
      return this.masked.extractInput(t, e, s);
    }
    nearestInputPos(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : n;
      const s = this.value.length,
        i = Math.min(Math.max(t, 0), s);
      switch (e) {
        case r:
        case h:
          return this.isComplete ? i : 0;
        case l:
        case o:
          return this.isComplete ? i : s;
        default:
          return i;
      }
    }
    totalInputPositions() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
      return this.value.slice(t, e).length;
    }
    doValidate() {
      return this.masked.doValidate(...arguments) && (!this.parent || this.parent.doValidate(...arguments));
    }
    doCommit() {
      this.masked.doCommit();
    }
    get state() {
      return { masked: this.masked.state, isFilled: this.isFilled };
    }
    set state(t) {
      (this.masked.state = t.masked), (this.isFilled = t.isFilled);
    }
  }
  class F {
    constructor(t) {
      Object.assign(this, t), (this._value = ''), (this.isFixed = !0);
    }
    get value() {
      return this._value;
    }
    get unmaskedValue() {
      return this.isUnmasking ? this.value : '';
    }
    get displayValue() {
      return this.value;
    }
    reset() {
      (this._isRawInput = !1), (this._value = '');
    }
    remove() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this._value.length;
      return (this._value = this._value.slice(0, t) + this._value.slice(e)), this._value || (this._isRawInput = !1), new a();
    }
    nearestInputPos(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : n;
      const s = this._value.length;
      switch (e) {
        case r:
        case h:
          return 0;
        default:
          return s;
      }
    }
    totalInputPositions() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this._value.length;
      return this._isRawInput ? e - t : 0;
    }
    extractInput() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this._value.length;
      return ((arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}).raw && this._isRawInput && this._value.slice(t, e)) || '';
    }
    get isComplete() {
      return !0;
    }
    get isFilled() {
      return Boolean(this._value);
    }
    _appendChar(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      const s = new a();
      if (this.isFilled) return s;
      const i = !0 === this.eager || 'append' === this.eager,
        u = this.char === t && (this.isUnmasking || e.input || e.raw) && (!e.raw || !i) && !e.tail;
      return u && (s.rawInserted = this.char), (this._value = s.inserted = this.char), (this._isRawInput = u && (e.raw || e.input)), s;
    }
    _appendEager() {
      return this._appendChar(this.char, { tail: !0 });
    }
    _appendPlaceholder() {
      const t = new a();
      return this.isFilled || (this._value = t.inserted = this.char), t;
    }
    extractTail() {
      return (arguments.length > 1 && void 0 !== arguments[1]) || this.value.length, new k('');
    }
    appendTail(t) {
      return u(t) && (t = new k(String(t))), t.appendTo(this);
    }
    append(t, e, s) {
      const i = this._appendChar(t[0], e);
      return null != s && (i.tailShift += this.appendTail(s).tailShift), i;
    }
    doCommit() {}
    get state() {
      return { _value: this._value, _isRawInput: this._isRawInput };
    }
    set state(t) {
      Object.assign(this, t);
    }
  }
  const E = ['chunks'];
  class b {
    constructor() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [],
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
      (this.chunks = t), (this.from = e);
    }
    toString() {
      return this.chunks.map(String).join('');
    }
    extend(t) {
      if (!String(t)) return;
      u(t) && (t = new k(String(t)));
      const e = this.chunks[this.chunks.length - 1],
        s = e && (e.stop === t.stop || null == t.stop) && t.from === e.from + e.toString().length;
      if (t instanceof k) s ? e.extend(t.toString()) : this.chunks.push(t);
      else if (t instanceof b) {
        if (null == t.stop) {
          let e;
          for (; t.chunks.length && null == t.chunks[0].stop; ) (e = t.chunks.shift()), (e.from += t.from), this.extend(e);
        }
        t.toString() && ((t.stop = t.blockIndex), this.chunks.push(t));
      }
    }
    appendTo(t) {
      if (!(t instanceof i.MaskedPattern)) {
        return new k(this.toString()).appendTo(t);
      }
      const e = new a();
      for (let s = 0; s < this.chunks.length && !e.skip; ++s) {
        const i = this.chunks[s],
          a = t._mapPosToBlock(t.value.length),
          u = i.stop;
        let n;
        if (null != u && (!a || a.index <= u)) {
          if (i instanceof b || t._stops.indexOf(u) >= 0) {
            const s = t._appendPlaceholder(u);
            e.aggregate(s);
          }
          n = i instanceof b && t._blocks[u];
        }
        if (n) {
          const s = n.appendTail(i);
          (s.skip = !1), e.aggregate(s), (t._value += s.inserted);
          const a = i.toString().slice(s.rawInserted.length);
          a && e.aggregate(t.append(a, { tail: !0 }));
        } else e.aggregate(t.append(i.toString(), { tail: !0 }));
      }
      return e;
    }
    get state() {
      return { chunks: this.chunks.map((t) => t.state), from: this.from, stop: this.stop, blockIndex: this.blockIndex };
    }
    set state(t) {
      const { chunks: e } = t,
        i = s(t, E);
      Object.assign(this, i),
        (this.chunks = e.map((t) => {
          const e = 'chunks' in t ? new b() : new k();
          return (e.state = t), e;
        }));
    }
    unshift(t) {
      if (!this.chunks.length || (null != t && this.from >= t)) return '';
      const e = null != t ? t - this.from : t;
      let s = 0;
      for (; s < this.chunks.length; ) {
        const t = this.chunks[s],
          i = t.unshift(e);
        if (t.toString()) {
          if (!i) break;
          ++s;
        } else this.chunks.splice(s, 1);
        if (i) return i;
      }
      return '';
    }
    shift() {
      if (!this.chunks.length) return '';
      let t = this.chunks.length - 1;
      for (; 0 <= t; ) {
        const e = this.chunks[t],
          s = e.shift();
        if (e.toString()) {
          if (!s) break;
          --t;
        } else this.chunks.splice(t, 1);
        if (s) return s;
      }
      return '';
    }
  }
  class S {
    constructor(t, e) {
      (this.masked = t), (this._log = []);
      const { offset: s, index: i } = t._mapPosToBlock(e) || (e < 0 ? { index: 0, offset: 0 } : { index: this.masked._blocks.length, offset: 0 });
      (this.offset = s), (this.index = i), (this.ok = !1);
    }
    get block() {
      return this.masked._blocks[this.index];
    }
    get pos() {
      return this.masked._blockStartPos(this.index) + this.offset;
    }
    get state() {
      return { index: this.index, offset: this.offset, ok: this.ok };
    }
    set state(t) {
      Object.assign(this, t);
    }
    pushState() {
      this._log.push(this.state);
    }
    popState() {
      const t = this._log.pop();
      return (this.state = t), t;
    }
    bindBlock() {
      this.block ||
        (this.index < 0 && ((this.index = 0), (this.offset = 0)),
        this.index >= this.masked._blocks.length && ((this.index = this.masked._blocks.length - 1), (this.offset = this.block.value.length)));
    }
    _pushLeft(t) {
      for (
        this.pushState(), this.bindBlock();
        0 <= this.index;
        --this.index, this.offset = (null === (e = this.block) || void 0 === e ? void 0 : e.value.length) || 0
      ) {
        var e;
        if (t()) return (this.ok = !0);
      }
      return (this.ok = !1);
    }
    _pushRight(t) {
      for (this.pushState(), this.bindBlock(); this.index < this.masked._blocks.length; ++this.index, this.offset = 0) if (t()) return (this.ok = !0);
      return (this.ok = !1);
    }
    pushLeftBeforeFilled() {
      return this._pushLeft(() => {
        if (!this.block.isFixed && this.block.value) return (this.offset = this.block.nearestInputPos(this.offset, h)), 0 !== this.offset || void 0;
      });
    }
    pushLeftBeforeInput() {
      return this._pushLeft(() => {
        if (!this.block.isFixed) return (this.offset = this.block.nearestInputPos(this.offset, r)), !0;
      });
    }
    pushLeftBeforeRequired() {
      return this._pushLeft(() => {
        if (!(this.block.isFixed || (this.block.isOptional && !this.block.value))) return (this.offset = this.block.nearestInputPos(this.offset, r)), !0;
      });
    }
    pushRightBeforeFilled() {
      return this._pushRight(() => {
        if (!this.block.isFixed && this.block.value)
          return (this.offset = this.block.nearestInputPos(this.offset, o)), this.offset !== this.block.value.length || void 0;
      });
    }
    pushRightBeforeInput() {
      return this._pushRight(() => {
        if (!this.block.isFixed) return (this.offset = this.block.nearestInputPos(this.offset, n)), !0;
      });
    }
    pushRightBeforeRequired() {
      return this._pushRight(() => {
        if (!(this.block.isFixed || (this.block.isOptional && !this.block.value))) return (this.offset = this.block.nearestInputPos(this.offset, n)), !0;
      });
    }
  }
  i.MaskedRegExp = class extends f {
    _update(t) {
      t.mask && (t.validate = (e) => e.search(t.mask) >= 0), super._update(t);
    }
  };
  const D = ['_blocks'];
  class B extends f {
    constructor() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      (t.definitions = Object.assign({}, A, t.definitions)), super(Object.assign({}, B.DEFAULTS, t));
    }
    _update() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      (t.definitions = Object.assign({}, this.definitions, t.definitions)), super._update(t), this._rebuildMask();
    }
    _rebuildMask() {
      const t = this.definitions;
      (this._blocks = []), (this._stops = []), (this._maskedBlocks = {});
      let e = this.mask;
      if (!e || !t) return;
      let s = !1,
        a = !1;
      for (let r = 0; r < e.length; ++r) {
        var u, n;
        if (this.blocks) {
          const t = e.slice(r),
            s = Object.keys(this.blocks).filter((e) => 0 === t.indexOf(e));
          s.sort((t, e) => e.length - t.length);
          const i = s[0];
          if (i) {
            const t = v(
              Object.assign(
                {
                  parent: this,
                  lazy: this.lazy,
                  eager: this.eager,
                  placeholderChar: this.placeholderChar,
                  displayChar: this.displayChar,
                  overwrite: this.overwrite,
                },
                this.blocks[i],
              ),
            );
            t && (this._blocks.push(t), this._maskedBlocks[i] || (this._maskedBlocks[i] = []), this._maskedBlocks[i].push(this._blocks.length - 1)),
              (r += i.length - 1);
            continue;
          }
        }
        let h = e[r],
          l = h in t;
        if (h === B.STOP_CHAR) {
          this._stops.push(this._blocks.length);
          continue;
        }
        if ('{' === h || '}' === h) {
          s = !s;
          continue;
        }
        if ('[' === h || ']' === h) {
          a = !a;
          continue;
        }
        if (h === B.ESCAPE_CHAR) {
          if ((++r, (h = e[r]), !h)) break;
          l = !1;
        }
        const o =
            null === (u = t[h]) || void 0 === u || !u.mask || (null === (n = t[h]) || void 0 === n ? void 0 : n.mask.prototype) instanceof i.Masked
              ? { mask: t[h] }
              : t[h],
          d = l
            ? new C(
                Object.assign(
                  { parent: this, isOptional: a, lazy: this.lazy, eager: this.eager, placeholderChar: this.placeholderChar, displayChar: this.displayChar },
                  o,
                ),
              )
            : new F({ char: h, eager: this.eager, isUnmasking: s });
        this._blocks.push(d);
      }
    }
    get state() {
      return Object.assign({}, super.state, { _blocks: this._blocks.map((t) => t.state) });
    }
    set state(t) {
      const { _blocks: e } = t,
        i = s(t, D);
      this._blocks.forEach((t, s) => (t.state = e[s])), (super.state = i);
    }
    reset() {
      super.reset(), this._blocks.forEach((t) => t.reset());
    }
    get isComplete() {
      return this._blocks.every((t) => t.isComplete);
    }
    get isFilled() {
      return this._blocks.every((t) => t.isFilled);
    }
    get isFixed() {
      return this._blocks.every((t) => t.isFixed);
    }
    get isOptional() {
      return this._blocks.every((t) => t.isOptional);
    }
    doCommit() {
      this._blocks.forEach((t) => t.doCommit()), super.doCommit();
    }
    get unmaskedValue() {
      return this._blocks.reduce((t, e) => t + e.unmaskedValue, '');
    }
    set unmaskedValue(t) {
      super.unmaskedValue = t;
    }
    get value() {
      return this._blocks.reduce((t, e) => t + e.value, '');
    }
    set value(t) {
      super.value = t;
    }
    get displayValue() {
      return this._blocks.reduce((t, e) => t + e.displayValue, '');
    }
    appendTail(t) {
      return super.appendTail(t).aggregate(this._appendPlaceholder());
    }
    _appendEager() {
      var t;
      const e = new a();
      let s = null === (t = this._mapPosToBlock(this.value.length)) || void 0 === t ? void 0 : t.index;
      if (null == s) return e;
      this._blocks[s].isFilled && ++s;
      for (let t = s; t < this._blocks.length; ++t) {
        const s = this._blocks[t]._appendEager();
        if (!s.inserted) break;
        e.aggregate(s);
      }
      return e;
    }
    _appendCharRaw(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      const s = this._mapPosToBlock(this.value.length),
        i = new a();
      if (!s) return i;
      for (let a = s.index; ; ++a) {
        var u, n;
        const s = this._blocks[a];
        if (!s) break;
        const r = s._appendChar(
            t,
            Object.assign({}, e, {
              _beforeTailState: null === (u = e._beforeTailState) || void 0 === u || null === (n = u._blocks) || void 0 === n ? void 0 : n[a],
            }),
          ),
          h = r.skip;
        if ((i.aggregate(r), h || r.rawInserted)) break;
      }
      return i;
    }
    extractTail() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
      const s = new b();
      return (
        t === e ||
          this._forEachBlocksInRange(t, e, (t, e, i, a) => {
            const u = t.extractTail(i, a);
            (u.stop = this._findStopBefore(e)), (u.from = this._blockStartPos(e)), u instanceof b && (u.blockIndex = e), s.extend(u);
          }),
        s
      );
    }
    extractInput() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length,
        s = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
      if (t === e) return '';
      let i = '';
      return (
        this._forEachBlocksInRange(t, e, (t, e, a, u) => {
          i += t.extractInput(a, u, s);
        }),
        i
      );
    }
    _findStopBefore(t) {
      let e;
      for (let s = 0; s < this._stops.length; ++s) {
        const i = this._stops[s];
        if (!(i <= t)) break;
        e = i;
      }
      return e;
    }
    _appendPlaceholder(t) {
      const e = new a();
      if (this.lazy && null == t) return e;
      const s = this._mapPosToBlock(this.value.length);
      if (!s) return e;
      const i = s.index,
        u = null != t ? t : this._blocks.length;
      return (
        this._blocks.slice(i, u).forEach((s) => {
          if (!s.lazy || null != t) {
            const t = null != s._blocks ? [s._blocks.length] : [],
              i = s._appendPlaceholder(...t);
            (this._value += i.inserted), e.aggregate(i);
          }
        }),
        e
      );
    }
    _mapPosToBlock(t) {
      let e = '';
      for (let s = 0; s < this._blocks.length; ++s) {
        const i = this._blocks[s],
          a = e.length;
        if (((e += i.value), t <= e.length)) return { index: s, offset: t - a };
      }
    }
    _blockStartPos(t) {
      return this._blocks.slice(0, t).reduce((t, e) => t + e.value.length, 0);
    }
    _forEachBlocksInRange(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length,
        s = arguments.length > 2 ? arguments[2] : void 0;
      const i = this._mapPosToBlock(t);
      if (i) {
        const t = this._mapPosToBlock(e),
          a = t && i.index === t.index,
          u = i.offset,
          n = t && a ? t.offset : this._blocks[i.index].value.length;
        if ((s(this._blocks[i.index], i.index, u, n), t && !a)) {
          for (let e = i.index + 1; e < t.index; ++e) s(this._blocks[e], e, 0, this._blocks[e].value.length);
          s(this._blocks[t.index], t.index, 0, t.offset);
        }
      }
    }
    remove() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
      const s = super.remove(t, e);
      return (
        this._forEachBlocksInRange(t, e, (t, e, i, a) => {
          s.aggregate(t.remove(i, a));
        }),
        s
      );
    }
    nearestInputPos(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : n;
      if (!this._blocks.length) return 0;
      const s = new S(this, t);
      if (e === n) return s.pushRightBeforeInput() ? s.pos : (s.popState(), s.pushLeftBeforeInput() ? s.pos : this.value.length);
      if (e === r || e === h) {
        if (e === r) {
          if ((s.pushRightBeforeFilled(), s.ok && s.pos === t)) return t;
          s.popState();
        }
        if ((s.pushLeftBeforeInput(), s.pushLeftBeforeRequired(), s.pushLeftBeforeFilled(), e === r)) {
          if ((s.pushRightBeforeInput(), s.pushRightBeforeRequired(), s.ok && s.pos <= t)) return s.pos;
          if ((s.popState(), s.ok && s.pos <= t)) return s.pos;
          s.popState();
        }
        return s.ok ? s.pos : e === h ? 0 : (s.popState(), s.ok ? s.pos : (s.popState(), s.ok ? s.pos : 0));
      }
      return e === l || e === o
        ? (s.pushRightBeforeInput(),
          s.pushRightBeforeRequired(),
          s.pushRightBeforeFilled()
            ? s.pos
            : e === o
            ? this.value.length
            : (s.popState(), s.ok ? s.pos : (s.popState(), s.ok ? s.pos : this.nearestInputPos(t, r))))
        : t;
    }
    totalInputPositions() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length,
        s = 0;
      return (
        this._forEachBlocksInRange(t, e, (t, e, i, a) => {
          s += t.totalInputPositions(i, a);
        }),
        s
      );
    }
    maskedBlock(t) {
      return this.maskedBlocks(t)[0];
    }
    maskedBlocks(t) {
      const e = this._maskedBlocks[t];
      return e ? e.map((t) => this._blocks[t]) : [];
    }
  }
  (B.DEFAULTS = { lazy: !0, placeholderChar: '_' }),
    (B.STOP_CHAR = '`'),
    (B.ESCAPE_CHAR = '\\'),
    (B.InputDefinition = C),
    (B.FixedDefinition = F),
    (i.MaskedPattern = B);
  class x extends B {
    get _matchFrom() {
      return this.maxLength - String(this.from).length;
    }
    _update(t) {
      t = Object.assign({ to: this.to || 0, from: this.from || 0, maxLength: this.maxLength || 0 }, t);
      let e = String(t.to).length;
      null != t.maxLength && (e = Math.max(e, t.maxLength)), (t.maxLength = e);
      const s = String(t.from).padStart(e, '0'),
        i = String(t.to).padStart(e, '0');
      let a = 0;
      for (; a < i.length && i[a] === s[a]; ) ++a;
      (t.mask = i.slice(0, a).replace(/0/g, '\\0') + '0'.repeat(e - a)), super._update(t);
    }
    get isComplete() {
      return super.isComplete && Boolean(this.value);
    }
    boundaries(t) {
      let e = '',
        s = '';
      const [, i, a] = t.match(/^(\D*)(\d*)(\D*)/) || [];
      return (
        a && ((e = '0'.repeat(i.length) + a), (s = '9'.repeat(i.length) + a)), (e = e.padEnd(this.maxLength, '0')), (s = s.padEnd(this.maxLength, '9')), [e, s]
      );
    }
    doPrepare(t) {
      let e,
        s = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      if ((([t, e] = p(super.doPrepare(t.replace(/\D/g, ''), s))), !this.autofix || !t)) return t;
      const i = String(this.from).padStart(this.maxLength, '0'),
        a = String(this.to).padStart(this.maxLength, '0');
      let u = this.value + t;
      if (u.length > this.maxLength) return '';
      const [n, r] = this.boundaries(u);
      return Number(r) < this.from
        ? i[u.length - 1]
        : Number(n) > this.to
        ? 'pad' === this.autofix && u.length < this.maxLength
          ? ['', e.aggregate(this.append(i[u.length - 1] + t, s))]
          : a[u.length - 1]
        : t;
    }
    doValidate() {
      const t = this.value;
      if (-1 === t.search(/[^0]/) && t.length <= this._matchFrom) return !0;
      const [e, s] = this.boundaries(t);
      return this.from <= Number(s) && Number(e) <= this.to && super.doValidate(...arguments);
    }
  }
  i.MaskedRange = x;
  class M extends B {
    constructor(t) {
      super(Object.assign({}, M.DEFAULTS, t));
    }
    _update(t) {
      t.mask === Date && delete t.mask, t.pattern && (t.mask = t.pattern);
      const e = t.blocks;
      (t.blocks = Object.assign({}, M.GET_DEFAULT_BLOCKS())),
        t.min && (t.blocks.Y.from = t.min.getFullYear()),
        t.max && (t.blocks.Y.to = t.max.getFullYear()),
        t.min &&
          t.max &&
          t.blocks.Y.from === t.blocks.Y.to &&
          ((t.blocks.m.from = t.min.getMonth() + 1),
          (t.blocks.m.to = t.max.getMonth() + 1),
          t.blocks.m.from === t.blocks.m.to && ((t.blocks.d.from = t.min.getDate()), (t.blocks.d.to = t.max.getDate()))),
        Object.assign(t.blocks, this.blocks, e),
        Object.keys(t.blocks).forEach((e) => {
          const s = t.blocks[e];
          !('autofix' in s) && 'autofix' in t && (s.autofix = t.autofix);
        }),
        super._update(t);
    }
    doValidate() {
      const t = this.date;
      return (
        super.doValidate(...arguments) &&
        (!this.isComplete || (this.isDateExist(this.value) && null != t && (null == this.min || this.min <= t) && (null == this.max || t <= this.max)))
      );
    }
    isDateExist(t) {
      return this.format(this.parse(t, this), this).indexOf(t) >= 0;
    }
    get date() {
      return this.typedValue;
    }
    set date(t) {
      this.typedValue = t;
    }
    get typedValue() {
      return this.isComplete ? super.typedValue : null;
    }
    set typedValue(t) {
      super.typedValue = t;
    }
    maskEquals(t) {
      return t === Date || super.maskEquals(t);
    }
  }
  (M.DEFAULTS = {
    pattern: 'd{.}`m{.}`Y',
    format: (t) => {
      if (!t) return '';
      return [String(t.getDate()).padStart(2, '0'), String(t.getMonth() + 1).padStart(2, '0'), t.getFullYear()].join('.');
    },
    parse: (t) => {
      const [e, s, i] = t.split('.');
      return new Date(i, s - 1, e);
    },
  }),
    (M.GET_DEFAULT_BLOCKS = () => ({
      d: { mask: x, from: 1, to: 31, maxLength: 2 },
      m: { mask: x, from: 1, to: 12, maxLength: 2 },
      Y: { mask: x, from: 1900, to: 9999 },
    })),
    (i.MaskedDate = M);
  class w {
    get selectionStart() {
      let t;
      try {
        t = this._unsafeSelectionStart;
      } catch (t) {}
      return null != t ? t : this.value.length;
    }
    get selectionEnd() {
      let t;
      try {
        t = this._unsafeSelectionEnd;
      } catch (t) {}
      return null != t ? t : this.value.length;
    }
    select(t, e) {
      if (null != t && null != e && (t !== this.selectionStart || e !== this.selectionEnd))
        try {
          this._unsafeSelect(t, e);
        } catch (t) {}
    }
    _unsafeSelect(t, e) {}
    get isActive() {
      return !1;
    }
    bindEvents(t) {}
    unbindEvents() {}
  }
  i.MaskElement = w;
  class y extends w {
    constructor(t) {
      super(), (this.input = t), (this._handlers = {});
    }
    get rootElement() {
      var t, e, s;
      return null !== (t = null === (e = (s = this.input).getRootNode) || void 0 === e ? void 0 : e.call(s)) && void 0 !== t ? t : document;
    }
    get isActive() {
      return this.input === this.rootElement.activeElement;
    }
    get _unsafeSelectionStart() {
      return this.input.selectionStart;
    }
    get _unsafeSelectionEnd() {
      return this.input.selectionEnd;
    }
    _unsafeSelect(t, e) {
      this.input.setSelectionRange(t, e);
    }
    get value() {
      return this.input.value;
    }
    set value(t) {
      this.input.value = t;
    }
    bindEvents(t) {
      Object.keys(t).forEach((e) => this._toggleEventHandler(y.EVENTS_MAP[e], t[e]));
    }
    unbindEvents() {
      Object.keys(this._handlers).forEach((t) => this._toggleEventHandler(t));
    }
    _toggleEventHandler(t, e) {
      this._handlers[t] && (this.input.removeEventListener(t, this._handlers[t]), delete this._handlers[t]),
        e && (this.input.addEventListener(t, e), (this._handlers[t] = e));
    }
  }
  (y.EVENTS_MAP = { selectionChange: 'keydown', input: 'input', drop: 'drop', click: 'click', focus: 'focus', commit: 'blur' }), (i.HTMLMaskElement = y);
  class I extends y {
    get _unsafeSelectionStart() {
      const t = this.rootElement,
        e = t.getSelection && t.getSelection(),
        s = e && e.anchorOffset,
        i = e && e.focusOffset;
      return null == i || null == s || s < i ? s : i;
    }
    get _unsafeSelectionEnd() {
      const t = this.rootElement,
        e = t.getSelection && t.getSelection(),
        s = e && e.anchorOffset,
        i = e && e.focusOffset;
      return null == i || null == s || s > i ? s : i;
    }
    _unsafeSelect(t, e) {
      if (!this.rootElement.createRange) return;
      const s = this.rootElement.createRange();
      s.setStart(this.input.firstChild || this.input, t), s.setEnd(this.input.lastChild || this.input, e);
      const i = this.rootElement,
        a = i.getSelection && i.getSelection();
      a && (a.removeAllRanges(), a.addRange(s));
    }
    get value() {
      return this.input.textContent;
    }
    set value(t) {
      this.input.textContent = t;
    }
  }
  i.HTMLContenteditableMaskElement = I;
  const V = ['mask'];
  i.InputMask = class {
    constructor(t, e) {
      (this.el = t instanceof w ? t : t.isContentEditable && 'INPUT' !== t.tagName && 'TEXTAREA' !== t.tagName ? new I(t) : new y(t)),
        (this.masked = v(e)),
        (this._listeners = {}),
        (this._value = ''),
        (this._unmaskedValue = ''),
        (this._saveSelection = this._saveSelection.bind(this)),
        (this._onInput = this._onInput.bind(this)),
        (this._onChange = this._onChange.bind(this)),
        (this._onDrop = this._onDrop.bind(this)),
        (this._onFocus = this._onFocus.bind(this)),
        (this._onClick = this._onClick.bind(this)),
        (this.alignCursor = this.alignCursor.bind(this)),
        (this.alignCursorFriendly = this.alignCursorFriendly.bind(this)),
        this._bindEvents(),
        this.updateValue(),
        this._onChange();
    }
    get mask() {
      return this.masked.mask;
    }
    maskEquals(t) {
      var e;
      return null == t || (null === (e = this.masked) || void 0 === e ? void 0 : e.maskEquals(t));
    }
    set mask(t) {
      if (this.maskEquals(t)) return;
      if (!(t instanceof i.Masked) && this.masked.constructor === m(t)) return void this.masked.updateOptions({ mask: t });
      const e = v({ mask: t });
      (e.unmaskedValue = this.masked.unmaskedValue), (this.masked = e);
    }
    get value() {
      return this._value;
    }
    set value(t) {
      this.value !== t && ((this.masked.value = t), this.updateControl(), this.alignCursor());
    }
    get unmaskedValue() {
      return this._unmaskedValue;
    }
    set unmaskedValue(t) {
      this.unmaskedValue !== t && ((this.masked.unmaskedValue = t), this.updateControl(), this.alignCursor());
    }
    get typedValue() {
      return this.masked.typedValue;
    }
    set typedValue(t) {
      this.masked.typedValueEquals(t) || ((this.masked.typedValue = t), this.updateControl(), this.alignCursor());
    }
    get displayValue() {
      return this.masked.displayValue;
    }
    _bindEvents() {
      this.el.bindEvents({
        selectionChange: this._saveSelection,
        input: this._onInput,
        drop: this._onDrop,
        click: this._onClick,
        focus: this._onFocus,
        commit: this._onChange,
      });
    }
    _unbindEvents() {
      this.el && this.el.unbindEvents();
    }
    _fireEvent(t) {
      for (var e = arguments.length, s = new Array(e > 1 ? e - 1 : 0), i = 1; i < e; i++) s[i - 1] = arguments[i];
      const a = this._listeners[t];
      a && a.forEach((t) => t(...s));
    }
    get selectionStart() {
      return this._cursorChanging ? this._changingCursorPos : this.el.selectionStart;
    }
    get cursorPos() {
      return this._cursorChanging ? this._changingCursorPos : this.el.selectionEnd;
    }
    set cursorPos(t) {
      this.el && this.el.isActive && (this.el.select(t, t), this._saveSelection());
    }
    _saveSelection() {
      this.displayValue !== this.el.value &&
        console.warn('Element value was changed outside of mask. Syncronize mask using `mask.updateValue()` to work properly.'),
        (this._selection = { start: this.selectionStart, end: this.cursorPos });
    }
    updateValue() {
      (this.masked.value = this.el.value), (this._value = this.masked.value);
    }
    updateControl() {
      const t = this.masked.unmaskedValue,
        e = this.masked.value,
        s = this.displayValue,
        i = this.unmaskedValue !== t || this.value !== e;
      (this._unmaskedValue = t), (this._value = e), this.el.value !== s && (this.el.value = s), i && this._fireChangeEvents();
    }
    updateOptions(t) {
      const { mask: e } = t,
        i = s(t, V),
        a = !this.maskEquals(e),
        u = !c(this.masked, i);
      a && (this.mask = e), u && this.masked.updateOptions(i), (a || u) && this.updateControl();
    }
    updateCursor(t) {
      null != t && ((this.cursorPos = t), this._delayUpdateCursor(t));
    }
    _delayUpdateCursor(t) {
      this._abortUpdateCursor(),
        (this._changingCursorPos = t),
        (this._cursorChanging = setTimeout(() => {
          this.el && ((this.cursorPos = this._changingCursorPos), this._abortUpdateCursor());
        }, 10));
    }
    _fireChangeEvents() {
      this._fireEvent('accept', this._inputEvent), this.masked.isComplete && this._fireEvent('complete', this._inputEvent);
    }
    _abortUpdateCursor() {
      this._cursorChanging && (clearTimeout(this._cursorChanging), delete this._cursorChanging);
    }
    alignCursor() {
      this.cursorPos = this.masked.nearestInputPos(this.masked.nearestInputPos(this.cursorPos, r));
    }
    alignCursorFriendly() {
      this.selectionStart === this.cursorPos && this.alignCursor();
    }
    on(t, e) {
      return this._listeners[t] || (this._listeners[t] = []), this._listeners[t].push(e), this;
    }
    off(t, e) {
      if (!this._listeners[t]) return this;
      if (!e) return delete this._listeners[t], this;
      const s = this._listeners[t].indexOf(e);
      return s >= 0 && this._listeners[t].splice(s, 1), this;
    }
    _onInput(t) {
      if (((this._inputEvent = t), this._abortUpdateCursor(), !this._selection)) return this.updateValue();
      const e = new g(this.el.value, this.cursorPos, this.displayValue, this._selection),
        s = this.masked.rawInputValue,
        i = this.masked.splice(e.startChangePos, e.removed.length, e.inserted, e.removeDirection, { input: !0, raw: !0 }).offset,
        a = s === this.masked.rawInputValue ? e.removeDirection : n;
      let u = this.masked.nearestInputPos(e.startChangePos + i, a);
      a !== n && (u = this.masked.nearestInputPos(u, n)), this.updateControl(), this.updateCursor(u), delete this._inputEvent;
    }
    _onChange() {
      this.displayValue !== this.el.value && this.updateValue(), this.masked.doCommit(), this.updateControl(), this._saveSelection();
    }
    _onDrop(t) {
      t.preventDefault(), t.stopPropagation();
    }
    _onFocus(t) {
      this.alignCursorFriendly();
    }
    _onClick(t) {
      this.alignCursorFriendly();
    }
    destroy() {
      this._unbindEvents(), (this._listeners.length = 0), delete this.el;
    }
  };
  i.MaskedEnum = class extends B {
    _update(t) {
      t.enum && (t.mask = '*'.repeat(t.enum[0].length)), super._update(t);
    }
    doValidate() {
      return this.enum.some((t) => t.indexOf(this.unmaskedValue) >= 0) && super.doValidate(...arguments);
    }
  };
  class T extends f {
    constructor(t) {
      super(Object.assign({}, T.DEFAULTS, t));
    }
    _update(t) {
      super._update(t), this._updateRegExps();
    }
    _updateRegExps() {
      let t = '^' + (this.allowNegative ? '[+|\\-]?' : ''),
        e = (this.scale ? '('.concat(d(this.radix), '\\d{0,').concat(this.scale, '})?') : '') + '$';
      (this._numberRegExp = new RegExp(t + '\\d*' + e)),
        (this._mapToRadixRegExp = new RegExp('['.concat(this.mapToRadix.map(d).join(''), ']'), 'g')),
        (this._thousandsSeparatorRegExp = new RegExp(d(this.thousandsSeparator), 'g'));
    }
    _removeThousandsSeparators(t) {
      return t.replace(this._thousandsSeparatorRegExp, '');
    }
    _insertThousandsSeparators(t) {
      const e = t.split(this.radix);
      return (e[0] = e[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator)), e.join(this.radix);
    }
    doPrepare(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      t = this._removeThousandsSeparators(
        this.scale && this.mapToRadix.length && ((e.input && e.raw) || (!e.input && !e.raw)) ? t.replace(this._mapToRadixRegExp, this.radix) : t,
      );
      const [s, i] = p(super.doPrepare(t, e));
      return t && !s && (i.skip = !0), [s, i];
    }
    _separatorsCount(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
        s = 0;
      for (let i = 0; i < t; ++i) this._value.indexOf(this.thousandsSeparator, i) === i && (++s, e && (t += this.thousandsSeparator.length));
      return s;
    }
    _separatorsCountFromSlice() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this._value;
      return this._separatorsCount(this._removeThousandsSeparators(t).length, !0);
    }
    extractInput() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length,
        s = arguments.length > 2 ? arguments[2] : void 0;
      return ([t, e] = this._adjustRangeWithSeparators(t, e)), this._removeThousandsSeparators(super.extractInput(t, e, s));
    }
    _appendCharRaw(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      if (!this.thousandsSeparator) return super._appendCharRaw(t, e);
      const s = e.tail && e._beforeTailState ? e._beforeTailState._value : this._value,
        i = this._separatorsCountFromSlice(s);
      this._value = this._removeThousandsSeparators(this.value);
      const a = super._appendCharRaw(t, e);
      this._value = this._insertThousandsSeparators(this._value);
      const u = e.tail && e._beforeTailState ? e._beforeTailState._value : this._value,
        n = this._separatorsCountFromSlice(u);
      return (a.tailShift += (n - i) * this.thousandsSeparator.length), (a.skip = !a.rawInserted && t === this.thousandsSeparator), a;
    }
    _findSeparatorAround(t) {
      if (this.thousandsSeparator) {
        const e = t - this.thousandsSeparator.length + 1,
          s = this.value.indexOf(this.thousandsSeparator, e);
        if (s <= t) return s;
      }
      return -1;
    }
    _adjustRangeWithSeparators(t, e) {
      const s = this._findSeparatorAround(t);
      s >= 0 && (t = s);
      const i = this._findSeparatorAround(e);
      return i >= 0 && (e = i + this.thousandsSeparator.length), [t, e];
    }
    remove() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
      [t, e] = this._adjustRangeWithSeparators(t, e);
      const s = this.value.slice(0, t),
        i = this.value.slice(e),
        u = this._separatorsCount(s.length);
      this._value = this._insertThousandsSeparators(this._removeThousandsSeparators(s + i));
      const n = this._separatorsCountFromSlice(s);
      return new a({ tailShift: (n - u) * this.thousandsSeparator.length });
    }
    nearestInputPos(t, e) {
      if (!this.thousandsSeparator) return t;
      switch (e) {
        case n:
        case r:
        case h: {
          const s = this._findSeparatorAround(t - 1);
          if (s >= 0) {
            const i = s + this.thousandsSeparator.length;
            if (t < i || this.value.length <= i || e === h) return s;
          }
          break;
        }
        case l:
        case o: {
          const e = this._findSeparatorAround(t);
          if (e >= 0) return e + this.thousandsSeparator.length;
        }
      }
      return t;
    }
    doValidate(t) {
      let e = Boolean(this._removeThousandsSeparators(this.value).match(this._numberRegExp));
      if (e) {
        const t = this.number;
        e = e && !isNaN(t) && (null == this.min || this.min >= 0 || this.min <= this.number) && (null == this.max || this.max <= 0 || this.number <= this.max);
      }
      return e && super.doValidate(t);
    }
    doCommit() {
      if (this.value) {
        const t = this.number;
        let e = t;
        null != this.min && (e = Math.max(e, this.min)), null != this.max && (e = Math.min(e, this.max)), e !== t && (this.unmaskedValue = this.doFormat(e));
        let s = this.value;
        this.normalizeZeros && (s = this._normalizeZeros(s)), this.padFractionalZeros && this.scale > 0 && (s = this._padFractionalZeros(s)), (this._value = s);
      }
      super.doCommit();
    }
    _normalizeZeros(t) {
      const e = this._removeThousandsSeparators(t).split(this.radix);
      return (
        (e[0] = e[0].replace(/^(\D*)(0*)(\d*)/, (t, e, s, i) => e + i)),
        t.length && !/\d$/.test(e[0]) && (e[0] = e[0] + '0'),
        e.length > 1 && ((e[1] = e[1].replace(/0*$/, '')), e[1].length || (e.length = 1)),
        this._insertThousandsSeparators(e.join(this.radix))
      );
    }
    _padFractionalZeros(t) {
      if (!t) return t;
      const e = t.split(this.radix);
      return e.length < 2 && e.push(''), (e[1] = e[1].padEnd(this.scale, '0')), e.join(this.radix);
    }
    doSkipInvalid(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
        s = arguments.length > 2 ? arguments[2] : void 0;
      const i = 0 === this.scale && t !== this.thousandsSeparator && (t === this.radix || t === T.UNMASKED_RADIX || this.mapToRadix.includes(t));
      return super.doSkipInvalid(t, e, s) && !i;
    }
    get unmaskedValue() {
      return this._removeThousandsSeparators(this._normalizeZeros(this.value)).replace(this.radix, T.UNMASKED_RADIX);
    }
    set unmaskedValue(t) {
      super.unmaskedValue = t;
    }
    get typedValue() {
      return this.doParse(this.unmaskedValue);
    }
    set typedValue(t) {
      this.rawInputValue = this.doFormat(t).replace(T.UNMASKED_RADIX, this.radix);
    }
    get number() {
      return this.typedValue;
    }
    set number(t) {
      this.typedValue = t;
    }
    get allowNegative() {
      return this.signed || (null != this.min && this.min < 0) || (null != this.max && this.max < 0);
    }
    typedValueEquals(t) {
      return (super.typedValueEquals(t) || (T.EMPTY_VALUES.includes(t) && T.EMPTY_VALUES.includes(this.typedValue))) && !(0 === t && '' === this.value);
    }
  }
  (T.UNMASKED_RADIX = '.'),
    (T.DEFAULTS = {
      radix: ',',
      thousandsSeparator: '',
      mapToRadix: [T.UNMASKED_RADIX],
      scale: 2,
      signed: !1,
      normalizeZeros: !0,
      padFractionalZeros: !1,
      parse: Number,
      format: (t) => t.toLocaleString('en-US', { useGrouping: !1, maximumFractionDigits: 20 }),
    }),
    (T.EMPTY_VALUES = [...f.EMPTY_VALUES, 0]),
    (i.MaskedNumber = T);
  i.MaskedFunction = class extends f {
    _update(t) {
      t.mask && (t.validate = t.mask), super._update(t);
    }
  };
  const P = ['compiledMasks', 'currentMaskRef', 'currentMask'],
    R = ['mask'];
  class O extends f {
    constructor(t) {
      super(Object.assign({}, O.DEFAULTS, t)), (this.currentMask = null);
    }
    _update(t) {
      super._update(t), 'mask' in t && (this.compiledMasks = Array.isArray(t.mask) ? t.mask.map((t) => v(t)) : []);
    }
    _appendCharRaw(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      const s = this._applyDispatch(t, e);
      return this.currentMask && s.aggregate(this.currentMask._appendChar(t, this.currentMaskFlags(e))), s;
    }
    _applyDispatch() {
      let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '',
        e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
        s = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : '';
      const i = e.tail && null != e._beforeTailState ? e._beforeTailState._value : this.value,
        u = this.rawInputValue,
        n = e.tail && null != e._beforeTailState ? e._beforeTailState._rawInputValue : u,
        r = u.slice(n.length),
        h = this.currentMask,
        l = new a(),
        o = null == h ? void 0 : h.state;
      if (((this.currentMask = this.doDispatch(t, Object.assign({}, e), s)), this.currentMask))
        if (this.currentMask !== h) {
          if ((this.currentMask.reset(), n)) {
            const t = this.currentMask.append(n, { raw: !0 });
            l.tailShift = t.inserted.length - i.length;
          }
          r && (l.tailShift += this.currentMask.append(r, { raw: !0, tail: !0 }).tailShift);
        } else this.currentMask.state = o;
      return l;
    }
    _appendPlaceholder() {
      const t = this._applyDispatch(...arguments);
      return this.currentMask && t.aggregate(this.currentMask._appendPlaceholder()), t;
    }
    _appendEager() {
      const t = this._applyDispatch(...arguments);
      return this.currentMask && t.aggregate(this.currentMask._appendEager()), t;
    }
    appendTail(t) {
      const e = new a();
      return t && e.aggregate(this._applyDispatch('', {}, t)), e.aggregate(this.currentMask ? this.currentMask.appendTail(t) : super.appendTail(t));
    }
    currentMaskFlags(t) {
      var e, s;
      return Object.assign({}, t, {
        _beforeTailState:
          ((null === (e = t._beforeTailState) || void 0 === e ? void 0 : e.currentMaskRef) === this.currentMask &&
            (null === (s = t._beforeTailState) || void 0 === s ? void 0 : s.currentMask)) ||
          t._beforeTailState,
      });
    }
    doDispatch(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
        s = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : '';
      return this.dispatch(t, this, e, s);
    }
    doValidate(t) {
      return super.doValidate(t) && (!this.currentMask || this.currentMask.doValidate(this.currentMaskFlags(t)));
    }
    doPrepare(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
        [s, i] = p(super.doPrepare(t, e));
      if (this.currentMask) {
        let t;
        ([s, t] = p(super.doPrepare(s, this.currentMaskFlags(e)))), (i = i.aggregate(t));
      }
      return [s, i];
    }
    reset() {
      var t;
      null === (t = this.currentMask) || void 0 === t || t.reset(), this.compiledMasks.forEach((t) => t.reset());
    }
    get value() {
      return this.currentMask ? this.currentMask.value : '';
    }
    set value(t) {
      super.value = t;
    }
    get unmaskedValue() {
      return this.currentMask ? this.currentMask.unmaskedValue : '';
    }
    set unmaskedValue(t) {
      super.unmaskedValue = t;
    }
    get typedValue() {
      return this.currentMask ? this.currentMask.typedValue : '';
    }
    set typedValue(t) {
      let e = String(t);
      this.currentMask && ((this.currentMask.typedValue = t), (e = this.currentMask.unmaskedValue)), (this.unmaskedValue = e);
    }
    get displayValue() {
      return this.currentMask ? this.currentMask.displayValue : '';
    }
    get isComplete() {
      var t;
      return Boolean(null === (t = this.currentMask) || void 0 === t ? void 0 : t.isComplete);
    }
    get isFilled() {
      var t;
      return Boolean(null === (t = this.currentMask) || void 0 === t ? void 0 : t.isFilled);
    }
    remove() {
      const t = new a();
      return this.currentMask && t.aggregate(this.currentMask.remove(...arguments)).aggregate(this._applyDispatch()), t;
    }
    get state() {
      var t;
      return Object.assign({}, super.state, {
        _rawInputValue: this.rawInputValue,
        compiledMasks: this.compiledMasks.map((t) => t.state),
        currentMaskRef: this.currentMask,
        currentMask: null === (t = this.currentMask) || void 0 === t ? void 0 : t.state,
      });
    }
    set state(t) {
      const { compiledMasks: e, currentMaskRef: i, currentMask: a } = t,
        u = s(t, P);
      this.compiledMasks.forEach((t, s) => (t.state = e[s])), null != i && ((this.currentMask = i), (this.currentMask.state = a)), (super.state = u);
    }
    extractInput() {
      return this.currentMask ? this.currentMask.extractInput(...arguments) : '';
    }
    extractTail() {
      return this.currentMask ? this.currentMask.extractTail(...arguments) : super.extractTail(...arguments);
    }
    doCommit() {
      this.currentMask && this.currentMask.doCommit(), super.doCommit();
    }
    nearestInputPos() {
      return this.currentMask ? this.currentMask.nearestInputPos(...arguments) : super.nearestInputPos(...arguments);
    }
    get overwrite() {
      return this.currentMask ? this.currentMask.overwrite : super.overwrite;
    }
    set overwrite(t) {
      console.warn('"overwrite" option is not available in dynamic mask, use this option in siblings');
    }
    get eager() {
      return this.currentMask ? this.currentMask.eager : super.eager;
    }
    set eager(t) {
      console.warn('"eager" option is not available in dynamic mask, use this option in siblings');
    }
    get skipInvalid() {
      return this.currentMask ? this.currentMask.skipInvalid : super.skipInvalid;
    }
    set skipInvalid(t) {
      (this.isInitialized || t !== f.DEFAULTS.skipInvalid) &&
        console.warn('"skipInvalid" option is not available in dynamic mask, use this option in siblings');
    }
    maskEquals(t) {
      return (
        Array.isArray(t) &&
        this.compiledMasks.every((e, i) => {
          if (!t[i]) return;
          const a = t[i],
            { mask: u } = a;
          return c(e, s(a, R)) && e.maskEquals(u);
        })
      );
    }
    typedValueEquals(t) {
      var e;
      return Boolean(null === (e = this.currentMask) || void 0 === e ? void 0 : e.typedValueEquals(t));
    }
  }
  (O.DEFAULTS = {
    dispatch: (t, e, s, i) => {
      if (!e.compiledMasks.length) return;
      const a = e.rawInputValue,
        u = e.compiledMasks.map((u, n) => {
          const r = e.currentMask === u,
            l = r ? u.value.length : u.nearestInputPos(u.value.length, h);
          return (
            u.rawInputValue !== a ? (u.reset(), u.append(a, { raw: !0 })) : r || u.remove(l),
            u.append(t, e.currentMaskFlags(s)),
            u.appendTail(i),
            { index: n, weight: u.rawInputValue.length, totalInputPositions: u.totalInputPositions(0, Math.max(l, u.nearestInputPos(u.value.length, h))) }
          );
        });
      return u.sort((t, e) => e.weight - t.weight || e.totalInputPositions - t.totalInputPositions), e.compiledMasks[u[0].index];
    },
  }),
    (i.MaskedDynamic = O);
  const L = { MASKED: 'value', UNMASKED: 'unmaskedValue', TYPED: 'typedValue' };
  function j(t) {
    let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : L.MASKED,
      s = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : L.MASKED;
    const i = v(t);
    return (t) => i.runIsolated((i) => ((i[e] = t), i[s]));
  }
  (i.PIPE_TYPE = L),
    (i.createPipe = j),
    (i.pipe = function (t) {
      for (var e = arguments.length, s = new Array(e > 1 ? e - 1 : 0), i = 1; i < e; i++) s[i - 1] = arguments[i];
      return j(...s)(t);
    });
  try {
    globalThis.IMask = i;
  } catch (t) {}
  var U = [{ maskname: 'currency', maskOptions: { mask: Number, signed: !1, radix: '.', thousandsSeparator: ',', padFractionalZeros: !0 } }],
    N = function () {
      U.forEach(function (t) {
        var e = t.maskname,
          s = t.maskOptions,
          a = "[data-mask='" + e + "']",
          u = document.querySelectorAll(a);
        Array.prototype.forEach.call(u, function (t) {
          if (t.innerText) {
            var e = i.createPipe(s);
            t.innerText = e(t.innerText);
          } else t.setAttribute('aria-live', 'assertive'), i(t, s);
        });
      });
    };
  N();
  var q = N;
  (DTFS_PORTAL = void 0 === DTFS_PORTAL ? {} : DTFS_PORTAL).maskedInputs = e;
})();
//# sourceMappingURL=maskedInputs.js.map
