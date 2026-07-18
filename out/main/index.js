"use strict";
const require$$1 = require("electron");
const path$6 = require("path");
require("url");
const axios = require("axios");
const fs$4 = require("fs");
const ps4PkgInfo = require("@njzy/ps4-pkg-info");
const require$$2$1 = require("crypto");
const require$$5 = require("assert");
const require$$2 = require("events");
const require$$1$1 = require("os");
const require$$0$1 = require("constants");
const require$$0$2 = require("stream");
const require$$4 = require("util");
const isDevelopment$1 = process.env.NODE_ENV !== "production";
const helper = {
  installDevtools(window2) {
    window2.webContents.on("did-frame-finish-load", () => {
      require("vue-devtools").install();
      window2.webContents.openDevTools();
    });
    window2.webContents.on("devtools-opened", () => {
      window2.focus();
      setImmediate(() => {
        window2.focus();
      });
    });
  },
  setDevtools(window2) {
    if (isDevelopment$1) {
      this.installDevtools(window2);
    }
  },
  setWindowLoadURL(window2, to = "/") {
    window2.webContents.setUserAgent("StoreHAX");
    if (isDevelopment$1 && process.env["ELECTRON_RENDERER_URL"]) {
      window2.loadURL(process.env["ELECTRON_RENDERER_URL"] + "/#" + to);
    } else {
      window2.loadURL("file://" + path$6.join(__dirname, "../renderer/index.html") + "#" + to);
    }
  },
  setErrorHandler(window2) {
    window2.onerror = (error, url, line) => {
      console.log(error, url, line);
      alert("Window Error" + error);
    };
    window2.webContents.on("did-fail-load", (event, errorCode, errorDescription, validateURL, isMainFrame, frameProcessId, frameRoutingId) => {
      console.log(event, errorCode, errorDescription, validateURL, isMainFrame, frameProcessId, frameRoutingId);
      alert("loading failed" + errorDescription);
    });
  },
  createBaseWindow(args = {}) {
    let params = {
      minHeight: 900,
      minWidth: 600,
      height: 600,
      width: 900,
      // frame: false,
      title: "PS4 Remote Package Sender v2",
      icon: require$$1.nativeImage.createFromDataURL(this.getAppIconPath()),
      // titleBarStyle: 'hiddenInset',
      webPreferences: {
        allowRunningInsecureContent: true,
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      }
    };
    if (args.width)
      params.minWidth = args.width;
    if (args.height)
      params.minHeight = args.height;
    return new require$$1.BrowserWindow({ ...params, ...args });
  },
  createWindowInstance(to = "/", args = {}, debug2 = false) {
    const window2 = this.createBaseWindow(args);
    if (debug2)
      this.setDevtools(window2);
    this.setWindowLoadURL(window2, to);
    this.setErrorHandler(window2);
    return window2;
  },
  autocloseAfterDownload(window2) {
    window2.webContents.on("new-window", (event, url) => {
      console.log("Open New Window with autoclose after download");
      event.preventDefault();
      var win = new require$$1.BrowserWindow({
        show: true,
        frame: false,
        icon: require$$1.nativeImage.createFromDataURL(this.getAppIconPath()),
        webPreferences: {
          allowRunningInsecureContent: false,
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true,
          webviewTag: true
        }
      });
      win.webContents.setUserAgent("StoreHAX");
      win.once("ready-to-show", () => win.show());
      win.loadURL(url);
      console.log("Set New Window url to ", url);
      win.webContents.session.on("will-download", (event2, item, webContents) => {
        item.once("done", (event3, state2) => {
          console.log("Item download state ", state2);
          win.destroy();
        });
      });
    });
    window2.webContents.on("did-attach-webview", (event, webContents) => {
      console.log("attached new webview");
    });
  },
  getIconPath() {
    return path$6.join(isDevelopment$1 ? process.cwd() : process.resourcesPath, "static", "assets/ps_icon_white.png");
  },
  getAppIconPath() {
    return path$6.join(isDevelopment$1 ? process.cwd() : process.resourcesPath, "static", "assets/ps_icon_white.icns");
  }
};
const links = {
  github_repo: "https://github.com/Gkiokan/ps4-remote-pkg-sender",
  // sender的原版仓库
  report_issue: "https://github.com/Gkiokan/ps4-remote-pkg-sender/issues",
  troubleshoot: "https://github.com/Gkiokan/ps4-remote-pkg-sender/blob/master/Troubleshoot.md",
  changelog: "https://github.com/Gkiokan/ps4-remote-pkg-sender/blob/master/Changelog.md"
};
function showProcessingCenter$1() {
  windows.main.show();
  windows.main.webContents.send("main-route", "home");
}
function showServerList$1() {
  windows.main.show();
  windows.main.webContents.send("main-route", "server");
}
const application = {
  label: "Application",
  submenu: [
    { label: "Open PS4 Remote PKG Installer", click: () => windows.main.show() },
    { label: "Open Server", click: () => windows.server.show() },
    { label: "Separator", type: "separator" },
    // { label: 'Install new PKG' },
    { label: "Show Processing Center", click: () => showProcessingCenter$1() },
    { label: "Show Server listed PKGs", click: () => showServerList$1() },
    { label: "Separator", type: "separator" },
    { label: "PS4 API Logs", click: () => windows.ps4.show() },
    { label: "Separator", type: "separator" },
    {
      label: "Quit",
      accelerator: "Command+Q",
      click: () => {
        require$$1.app.quit();
      }
    }
  ]
};
const edit = {
  label: "Edit",
  submenu: [
    {
      label: "Undo",
      accelerator: "CmdOrCtrl+Z",
      selector: "undo:"
    },
    {
      label: "Redo",
      accelerator: "Shift+CmdOrCtrl+Z",
      selector: "redo:"
    },
    {
      type: "separator"
    },
    {
      label: "Cut",
      accelerator: "CmdOrCtrl+X",
      selector: "cut:"
    },
    {
      label: "Copy",
      accelerator: "CmdOrCtrl+C",
      selector: "copy:"
    },
    {
      label: "Paste",
      accelerator: "CmdOrCtrl+V",
      selector: "paste:"
    },
    {
      label: "Select All",
      accelerator: "CmdOrCtrl+A",
      selector: "selectAll:"
    }
  ]
};
const help = {
  label: "Help",
  submenu: [
    {
      label: "Info",
      click: () => {
        windows.info.show();
      }
    },
    { label: "Separator", type: "separator" },
    {
      label: "Changelog",
      click: () => {
        require$$1.shell.openExternal(links.changelog);
      }
    },
    {
      label: "Troubleshooting Guide",
      click: () => {
        require$$1.shell.openExternal(links.troubleshoot);
      }
    },
    { label: "Separator", type: "separator" },
    {
      label: "GitHub",
      click: () => {
        require$$1.shell.openExternal(links.github_repo);
      }
    },
    {
      label: "Report an Issue",
      click: () => {
        require$$1.shell.openExternal(links.report_issue);
      }
    }
  ]
};
const template = [
  application,
  edit,
  help
];
const menu = {
  template,
  createMenu() {
    require$$1.Menu.setApplicationMenu(require$$1.Menu.buildFromTemplate(template));
  }
};
let tray;
function showProcessingCenter() {
  windows.main.show();
  windows.main.webContents.send("main-route", "home");
}
function showServerList() {
  windows.main.show();
  windows.main.webContents.send("main-route", "server");
}
const tray$1 = {
  tray,
  createTray() {
    const iconURL = helper.getIconPath();
    require$$1.nativeImage.createFromPath(iconURL);
    tray = new require$$1.Tray(iconURL);
    const contextMenu = require$$1.Menu.buildFromTemplate([
      { label: "Open PS4 Remote PKG Installer", click: () => windows.main.show() },
      { label: "Open Server", click: () => windows.server.show() },
      { label: "Separator", type: "separator" },
      // { label: 'Install new PKG' },
      { label: "Show Processing Center", click: () => showProcessingCenter() },
      { label: "Show Server listed PKGs", click: () => showServerList() },
      { label: "Separator", type: "separator" },
      { label: "PS4 API Logs", click: () => windows.ps4.show() },
      { label: "Separator", type: "separator" },
      { label: "Info", click: () => windows.info.show() },
      { label: "Separator", type: "separator" },
      { label: "Quit Application", click: () => {
        require$$1.app.quit();
      } }
    ]);
    tray.setContextMenu(contextMenu);
  }
};
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
  if (typeof f == "function") {
    var a = function a2() {
      if (this instanceof a2) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var vue_runtime_common = { exports: {} };
var vue_runtime_common_prod = { exports: {} };
var hasRequiredVue_runtime_common_prod;
function requireVue_runtime_common_prod() {
  if (hasRequiredVue_runtime_common_prod) return vue_runtime_common_prod.exports;
  hasRequiredVue_runtime_common_prod = 1;
  /*!
   * Vue.js v2.7.16
   * (c) 2014-2023 Evan You
   * Released under the MIT License.
   */
  /*!
   * Vue.js v2.7.16
   * (c) 2014-2023 Evan You
   * Released under the MIT License.
   */
  const t = Object.freeze({}), e = Array.isArray;
  function n(t3) {
    return null == t3;
  }
  function o2(t3) {
    return null != t3;
  }
  function r(t3) {
    return true === t3;
  }
  function s(t3) {
    return "string" == typeof t3 || "number" == typeof t3 || "symbol" == typeof t3 || "boolean" == typeof t3;
  }
  function i(t3) {
    return "function" == typeof t3;
  }
  function c(t3) {
    return null !== t3 && "object" == typeof t3;
  }
  const a = Object.prototype.toString;
  function l(t3) {
    return "[object Object]" === a.call(t3);
  }
  function u(t3) {
    const e2 = parseFloat(String(t3));
    return e2 >= 0 && Math.floor(e2) === e2 && isFinite(t3);
  }
  function f(t3) {
    return o2(t3) && "function" == typeof t3.then && "function" == typeof t3.catch;
  }
  function d(t3) {
    return null == t3 ? "" : Array.isArray(t3) || l(t3) && t3.toString === a ? JSON.stringify(t3, p, 2) : String(t3);
  }
  function p(t3, e2) {
    return e2 && e2.__v_isRef ? e2.value : e2;
  }
  function h2(t3) {
    const e2 = parseFloat(t3);
    return isNaN(e2) ? t3 : e2;
  }
  function m(t3, e2) {
    const n2 = /* @__PURE__ */ Object.create(null), o22 = t3.split(",");
    for (let t4 = 0; t4 < o22.length; t4++) n2[o22[t4]] = true;
    return e2 ? (t4) => n2[t4.toLowerCase()] : (t4) => n2[t4];
  }
  const _ = m("key,ref,slot,slot-scope,is");
  function v(t3, e2) {
    const n2 = t3.length;
    if (n2) {
      if (e2 === t3[n2 - 1]) return void (t3.length = n2 - 1);
      const o22 = t3.indexOf(e2);
      if (o22 > -1) return t3.splice(o22, 1);
    }
  }
  const y = Object.prototype.hasOwnProperty;
  function g(t3, e2) {
    return y.call(t3, e2);
  }
  function b(t3) {
    const e2 = /* @__PURE__ */ Object.create(null);
    return function(n2) {
      return e2[n2] || (e2[n2] = t3(n2));
    };
  }
  const $ = /-(\w)/g, w = b((t3) => t3.replace($, (t4, e2) => e2 ? e2.toUpperCase() : "")), C = b((t3) => t3.charAt(0).toUpperCase() + t3.slice(1)), x = /\B([A-Z])/g, O = b((t3) => t3.replace(x, "-$1").toLowerCase());
  const k = Function.prototype.bind ? function(t3, e2) {
    return t3.bind(e2);
  } : function(t3, e2) {
    function n2(n3) {
      const o22 = arguments.length;
      return o22 ? o22 > 1 ? t3.apply(e2, arguments) : t3.call(e2, n3) : t3.call(e2);
    }
    return n2._length = t3.length, n2;
  };
  function S(t3, e2) {
    e2 = e2 || 0;
    let n2 = t3.length - e2;
    const o22 = new Array(n2);
    for (; n2--; ) o22[n2] = t3[n2 + e2];
    return o22;
  }
  function j(t3, e2) {
    for (const n2 in e2) t3[n2] = e2[n2];
    return t3;
  }
  function A(t3) {
    const e2 = {};
    for (let n2 = 0; n2 < t3.length; n2++) t3[n2] && j(e2, t3[n2]);
    return e2;
  }
  function T(t3, e2, n2) {
  }
  const E = (t3, e2, n2) => false, P = (t3) => t3;
  function I(t3, e2) {
    if (t3 === e2) return true;
    const n2 = c(t3), o22 = c(e2);
    if (!n2 || !o22) return !n2 && !o22 && String(t3) === String(e2);
    try {
      const n3 = Array.isArray(t3), o3 = Array.isArray(e2);
      if (n3 && o3) return t3.length === e2.length && t3.every((t4, n4) => I(t4, e2[n4]));
      if (t3 instanceof Date && e2 instanceof Date) return t3.getTime() === e2.getTime();
      if (n3 || o3) return false;
      {
        const n4 = Object.keys(t3), o4 = Object.keys(e2);
        return n4.length === o4.length && n4.every((n5) => I(t3[n5], e2[n5]));
      }
    } catch (t4) {
      return false;
    }
  }
  function D(t3, e2) {
    for (let n2 = 0; n2 < t3.length; n2++) if (I(t3[n2], e2)) return n2;
    return -1;
  }
  function N(t3) {
    let e2 = false;
    return function() {
      e2 || (e2 = true, t3.apply(this, arguments));
    };
  }
  function M(t3, e2) {
    return t3 === e2 ? 0 === t3 && 1 / t3 != 1 / e2 : t3 == t3 || e2 == e2;
  }
  const L = "data-server-rendered", R = ["component", "directive", "filter"], F = ["beforeCreate", "created", "beforeMount", "mounted", "beforeUpdate", "updated", "beforeDestroy", "destroyed", "activated", "deactivated", "errorCaptured", "serverPrefetch", "renderTracked", "renderTriggered"];
  var U = { optionMergeStrategies: /* @__PURE__ */ Object.create(null), silent: false, productionTip: false, devtools: false, performance: false, errorHandler: null, warnHandler: null, ignoredElements: [], keyCodes: /* @__PURE__ */ Object.create(null), isReservedTag: E, isReservedAttr: E, isUnknownElement: E, getTagNamespace: T, parsePlatformTagName: P, mustUseProp: E, async: true, _lifecycleHooks: F };
  function B(t3) {
    const e2 = (t3 + "").charCodeAt(0);
    return 36 === e2 || 95 === e2;
  }
  function V(t3, e2, n2, o22) {
    Object.defineProperty(t3, e2, { value: n2, enumerable: false, writable: true, configurable: true });
  }
  const z = new RegExp(`[^${/a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/.source}.$_\\d]`);
  const H = "__proto__" in {}, W = "undefined" != typeof window, K = W && window.navigator.userAgent.toLowerCase(), q = K && /msie|trident/.test(K), G = K && K.indexOf("msie 9.0") > 0, Z = K && K.indexOf("edge/") > 0;
  K && K.indexOf("android");
  const J = K && /iphone|ipad|ipod|ios/.test(K);
  const X = K && K.match(/firefox\/(\d+)/), Q = {}.watch;
  let Y, tt = false;
  if (W) try {
    const t3 = {};
    Object.defineProperty(t3, "passive", { get() {
      tt = true;
    } }), window.addEventListener("test-passive", null, t3);
  } catch (t3) {
  }
  const et = () => (void 0 === Y && (Y = !W && "undefined" != typeof commonjsGlobal && (commonjsGlobal.process && "server" === commonjsGlobal.process.env.VUE_ENV)), Y);
  function ot(t3) {
    return "function" == typeof t3 && /native code/.test(t3.toString());
  }
  const rt = "undefined" != typeof Symbol && ot(Symbol) && "undefined" != typeof Reflect && ot(Reflect.ownKeys);
  let st;
  st = "undefined" != typeof Set && ot(Set) ? Set : class {
    constructor() {
      this.set = /* @__PURE__ */ Object.create(null);
    }
    has(t3) {
      return true === this.set[t3];
    }
    add(t3) {
      this.set[t3] = true;
    }
    clear() {
      this.set = /* @__PURE__ */ Object.create(null);
    }
  };
  let it = null;
  function ct(t3 = null) {
    t3 || it && it._scope.off(), it = t3, t3 && t3._scope.on();
  }
  class at {
    constructor(t3, e2, n2, o22, r2, s2, i2, c2) {
      this.tag = t3, this.data = e2, this.children = n2, this.text = o22, this.elm = r2, this.ns = void 0, this.context = s2, this.fnContext = void 0, this.fnOptions = void 0, this.fnScopeId = void 0, this.key = e2 && e2.key, this.componentOptions = i2, this.componentInstance = void 0, this.parent = void 0, this.raw = false, this.isStatic = false, this.isRootInsert = true, this.isComment = false, this.isCloned = false, this.isOnce = false, this.asyncFactory = c2, this.asyncMeta = void 0, this.isAsyncPlaceholder = false;
    }
    get child() {
      return this.componentInstance;
    }
  }
  const lt = (t3 = "") => {
    const e2 = new at();
    return e2.text = t3, e2.isComment = true, e2;
  };
  function ut(t3) {
    return new at(void 0, void 0, void 0, String(t3));
  }
  function ft(t3) {
    const e2 = new at(t3.tag, t3.data, t3.children && t3.children.slice(), t3.text, t3.elm, t3.context, t3.componentOptions, t3.asyncFactory);
    return e2.ns = t3.ns, e2.isStatic = t3.isStatic, e2.key = t3.key, e2.isComment = t3.isComment, e2.fnContext = t3.fnContext, e2.fnOptions = t3.fnOptions, e2.fnScopeId = t3.fnScopeId, e2.asyncMeta = t3.asyncMeta, e2.isCloned = true, e2;
  }
  let dt = 0;
  const pt = [], ht = () => {
    for (let t3 = 0; t3 < pt.length; t3++) {
      const e2 = pt[t3];
      e2.subs = e2.subs.filter((t4) => t4), e2._pending = false;
    }
    pt.length = 0;
  };
  class mt {
    constructor() {
      this._pending = false, this.id = dt++, this.subs = [];
    }
    addSub(t3) {
      this.subs.push(t3);
    }
    removeSub(t3) {
      this.subs[this.subs.indexOf(t3)] = null, this._pending || (this._pending = true, pt.push(this));
    }
    depend(t3) {
      mt.target && mt.target.addDep(this);
    }
    notify(t3) {
      const e2 = this.subs.filter((t4) => t4);
      for (let t4 = 0, n2 = e2.length; t4 < n2; t4++) {
        e2[t4].update();
      }
    }
  }
  mt.target = null;
  const _t = [];
  function vt(t3) {
    _t.push(t3), mt.target = t3;
  }
  function yt() {
    _t.pop(), mt.target = _t[_t.length - 1];
  }
  const gt = Array.prototype, bt = Object.create(gt);
  ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(function(t3) {
    const e2 = gt[t3];
    V(bt, t3, function(...n2) {
      const o22 = e2.apply(this, n2), r2 = this.__ob__;
      let s2;
      switch (t3) {
        case "push":
        case "unshift":
          s2 = n2;
          break;
        case "splice":
          s2 = n2.slice(2);
      }
      return s2 && r2.observeArray(s2), r2.dep.notify(), o22;
    });
  });
  const $t = Object.getOwnPropertyNames(bt), wt = {};
  let Ct = true;
  function xt(t3) {
    Ct = t3;
  }
  const Ot = { notify: T, depend: T, addSub: T, removeSub: T };
  class kt {
    constructor(t3, n2 = false, o22 = false) {
      if (this.value = t3, this.shallow = n2, this.mock = o22, this.dep = o22 ? Ot : new mt(), this.vmCount = 0, V(t3, "__ob__", this), e(t3)) {
        if (!o22) if (H) t3.__proto__ = bt;
        else for (let e2 = 0, n3 = $t.length; e2 < n3; e2++) {
          const n4 = $t[e2];
          V(t3, n4, bt[n4]);
        }
        n2 || this.observeArray(t3);
      } else {
        const e2 = Object.keys(t3);
        for (let r2 = 0; r2 < e2.length; r2++) {
          jt(t3, e2[r2], wt, void 0, n2, o22);
        }
      }
    }
    observeArray(t3) {
      for (let e2 = 0, n2 = t3.length; e2 < n2; e2++) St(t3[e2], false, this.mock);
    }
  }
  function St(t3, n2, o22) {
    return t3 && g(t3, "__ob__") && t3.__ob__ instanceof kt ? t3.__ob__ : !Ct || !o22 && et() || !e(t3) && !l(t3) || !Object.isExtensible(t3) || t3.__v_skip || Rt(t3) || t3 instanceof at ? void 0 : new kt(t3, n2, o22);
  }
  function jt(t3, n2, o22, r2, s2, i2, c2 = false) {
    const a2 = new mt(), l2 = Object.getOwnPropertyDescriptor(t3, n2);
    if (l2 && false === l2.configurable) return;
    const u2 = l2 && l2.get, f2 = l2 && l2.set;
    u2 && !f2 || o22 !== wt && 2 !== arguments.length || (o22 = t3[n2]);
    let d2 = s2 ? o22 && o22.__ob__ : St(o22, false, i2);
    return Object.defineProperty(t3, n2, { enumerable: true, configurable: true, get: function() {
      const n3 = u2 ? u2.call(t3) : o22;
      return mt.target && (a2.depend(), d2 && (d2.dep.depend(), e(n3) && Et(n3))), Rt(n3) && !s2 ? n3.value : n3;
    }, set: function(e2) {
      const n3 = u2 ? u2.call(t3) : o22;
      if (M(n3, e2)) {
        if (f2) f2.call(t3, e2);
        else {
          if (u2) return;
          if (!s2 && Rt(n3) && !Rt(e2)) return void (n3.value = e2);
          o22 = e2;
        }
        d2 = s2 ? e2 && e2.__ob__ : St(e2, false, i2), a2.notify();
      }
    } }), a2;
  }
  function At(t3, n2, o22) {
    if (Mt(t3)) return;
    const r2 = t3.__ob__;
    return e(t3) && u(n2) ? (t3.length = Math.max(t3.length, n2), t3.splice(n2, 1, o22), r2 && !r2.shallow && r2.mock && St(o22, false, true), o22) : n2 in t3 && !(n2 in Object.prototype) ? (t3[n2] = o22, o22) : t3._isVue || r2 && r2.vmCount ? o22 : r2 ? (jt(r2.value, n2, o22, void 0, r2.shallow, r2.mock), r2.dep.notify(), o22) : (t3[n2] = o22, o22);
  }
  function Tt(t3, n2) {
    if (e(t3) && u(n2)) return void t3.splice(n2, 1);
    const o22 = t3.__ob__;
    t3._isVue || o22 && o22.vmCount || Mt(t3) || g(t3, n2) && (delete t3[n2], o22 && o22.dep.notify());
  }
  function Et(t3) {
    for (let n2, o22 = 0, r2 = t3.length; o22 < r2; o22++) n2 = t3[o22], n2 && n2.__ob__ && n2.__ob__.dep.depend(), e(n2) && Et(n2);
  }
  function Pt(t3) {
    return It(t3, true), V(t3, "__v_isShallow", true), t3;
  }
  function It(t3, e2) {
    Mt(t3) || St(t3, e2, et());
  }
  function Dt(t3) {
    return Mt(t3) ? Dt(t3.__v_raw) : !(!t3 || !t3.__ob__);
  }
  function Nt(t3) {
    return !(!t3 || !t3.__v_isShallow);
  }
  function Mt(t3) {
    return !(!t3 || !t3.__v_isReadonly);
  }
  const Lt = "__v_isRef";
  function Rt(t3) {
    return !(!t3 || true !== t3.__v_isRef);
  }
  function Ft(t3, e2) {
    if (Rt(t3)) return t3;
    const n2 = {};
    return V(n2, Lt, true), V(n2, "__v_isShallow", e2), V(n2, "dep", jt(n2, "value", t3, null, e2, et())), n2;
  }
  function Ut(t3, e2, n2) {
    Object.defineProperty(t3, n2, { enumerable: true, configurable: true, get: () => {
      const t4 = e2[n2];
      if (Rt(t4)) return t4.value;
      {
        const e3 = t4 && t4.__ob__;
        return e3 && e3.dep.depend(), t4;
      }
    }, set: (t4) => {
      const o22 = e2[n2];
      Rt(o22) && !Rt(t4) ? o22.value = t4 : e2[n2] = t4;
    } });
  }
  function Bt(t3, e2, n2) {
    const o22 = t3[e2];
    if (Rt(o22)) return o22;
    const r2 = { get value() {
      const o3 = t3[e2];
      return void 0 === o3 ? n2 : o3;
    }, set value(n3) {
      t3[e2] = n3;
    } };
    return V(r2, Lt, true), r2;
  }
  const Vt = "__v_rawToReadonly", zt = "__v_rawToShallowReadonly";
  function Ht(t3) {
    return Wt(t3, false);
  }
  function Wt(t3, e2) {
    if (!l(t3)) return t3;
    if (Mt(t3)) return t3;
    const n2 = e2 ? zt : Vt, o22 = t3[n2];
    if (o22) return o22;
    const r2 = Object.create(Object.getPrototypeOf(t3));
    V(t3, n2, r2), V(r2, "__v_isReadonly", true), V(r2, "__v_raw", t3), Rt(t3) && V(r2, Lt, true), (e2 || Nt(t3)) && V(r2, "__v_isShallow", true);
    const s2 = Object.keys(t3);
    for (let n3 = 0; n3 < s2.length; n3++) Kt(r2, t3, s2[n3], e2);
    return r2;
  }
  function Kt(t3, e2, n2, o22) {
    Object.defineProperty(t3, n2, { enumerable: true, configurable: true, get() {
      const t4 = e2[n2];
      return o22 || !l(t4) ? t4 : Ht(t4);
    }, set() {
    } });
  }
  const qt = "watcher", Gt = `${qt} callback`, Zt = `${qt} getter`, Jt = `${qt} cleanup`;
  function Xt(t3, e2) {
    return Yt(t3, null, { flush: "post" });
  }
  const Qt = {};
  function Yt(n2, o22, { immediate: r2, deep: s2, flush: c2 = "pre", onTrack: a2, onTrigger: l2 } = t) {
    const u2 = it, f2 = (t3, e2, n3 = null) => {
      const o3 = Ke(t3, null, n3, u2, e2);
      return s2 && o3 && o3.__ob__ && o3.__ob__.dep.depend(), o3;
    };
    let d2, p2, h22 = false, m2 = false;
    if (Rt(n2) ? (d2 = () => n2.value, h22 = Nt(n2)) : Dt(n2) ? (d2 = () => (n2.__ob__.dep.depend(), n2), s2 = true) : e(n2) ? (m2 = true, h22 = n2.some((t3) => Dt(t3) || Nt(t3)), d2 = () => n2.map((t3) => Rt(t3) ? t3.value : Dt(t3) ? (t3.__ob__.dep.depend(), yn(t3)) : i(t3) ? f2(t3, Zt) : void 0)) : d2 = i(n2) ? o22 ? () => f2(n2, Zt) : () => {
      if (!u2 || !u2._isDestroyed) return p2 && p2(), f2(n2, qt, [_2]);
    } : T, o22 && s2) {
      const t3 = d2;
      d2 = () => yn(t3());
    }
    let _2 = (t3) => {
      p2 = v2.onStop = () => {
        f2(t3, Jt);
      };
    };
    if (et()) return _2 = T, o22 ? r2 && f2(o22, Gt, [d2(), m2 ? [] : void 0, _2]) : d2(), T;
    const v2 = new wn(it, d2, T, { lazy: true });
    v2.noRecurse = !o22;
    let y2 = m2 ? [] : Qt;
    return v2.run = () => {
      if (v2.active) if (o22) {
        const t3 = v2.get();
        (s2 || h22 || (m2 ? t3.some((t4, e2) => M(t4, y2[e2])) : M(t3, y2))) && (p2 && p2(), f2(o22, Gt, [t3, y2 === Qt ? void 0 : y2, _2]), y2 = t3);
      } else v2.get();
    }, "sync" === c2 ? v2.update = v2.run : "post" === c2 ? (v2.post = true, v2.update = () => zn(v2)) : v2.update = () => {
      if (u2 && u2 === it && !u2._isMounted) {
        const t3 = u2._preWatchers || (u2._preWatchers = []);
        t3.indexOf(v2) < 0 && t3.push(v2);
      } else zn(v2);
    }, o22 ? r2 ? v2.run() : y2 = v2.get() : "post" === c2 && u2 ? u2.$once("hook:mounted", () => v2.get()) : v2.get(), () => {
      v2.teardown();
    };
  }
  let te;
  class ee {
    constructor(t3 = false) {
      this.detached = t3, this.active = true, this.effects = [], this.cleanups = [], this.parent = te, !t3 && te && (this.index = (te.scopes || (te.scopes = [])).push(this) - 1);
    }
    run(t3) {
      if (this.active) {
        const e2 = te;
        try {
          return te = this, t3();
        } finally {
          te = e2;
        }
      }
    }
    on() {
      te = this;
    }
    off() {
      te = this.parent;
    }
    stop(t3) {
      if (this.active) {
        let e2, n2;
        for (e2 = 0, n2 = this.effects.length; e2 < n2; e2++) this.effects[e2].teardown();
        for (e2 = 0, n2 = this.cleanups.length; e2 < n2; e2++) this.cleanups[e2]();
        if (this.scopes) for (e2 = 0, n2 = this.scopes.length; e2 < n2; e2++) this.scopes[e2].stop(true);
        if (!this.detached && this.parent && !t3) {
          const t4 = this.parent.scopes.pop();
          t4 && t4 !== this && (this.parent.scopes[this.index] = t4, t4.index = this.index);
        }
        this.parent = void 0, this.active = false;
      }
    }
  }
  function ne() {
    return te;
  }
  function oe(t3) {
    const e2 = t3._provided, n2 = t3.$parent && t3.$parent._provided;
    return n2 === e2 ? t3._provided = Object.create(n2) : e2;
  }
  const re = b((t3) => {
    const e2 = "&" === t3.charAt(0), n2 = "~" === (t3 = e2 ? t3.slice(1) : t3).charAt(0), o22 = "!" === (t3 = n2 ? t3.slice(1) : t3).charAt(0);
    return { name: t3 = o22 ? t3.slice(1) : t3, once: n2, capture: o22, passive: e2 };
  });
  function se(t3, n2) {
    function o22() {
      const t4 = o22.fns;
      if (!e(t4)) return Ke(t4, null, arguments, n2, "v-on handler");
      {
        const e2 = t4.slice();
        for (let t5 = 0; t5 < e2.length; t5++) Ke(e2[t5], null, arguments, n2, "v-on handler");
      }
    }
    return o22.fns = t3, o22;
  }
  function ie(t3, e2, o22, s2, i2, c2) {
    let a2, l2, u2, f2;
    for (a2 in t3) l2 = t3[a2], u2 = e2[a2], f2 = re(a2), n(l2) || (n(u2) ? (n(l2.fns) && (l2 = t3[a2] = se(l2, c2)), r(f2.once) && (l2 = t3[a2] = i2(f2.name, l2, f2.capture)), o22(f2.name, l2, f2.capture, f2.passive, f2.params)) : l2 !== u2 && (u2.fns = l2, t3[a2] = u2));
    for (a2 in e2) n(t3[a2]) && (f2 = re(a2), s2(f2.name, e2[a2], f2.capture));
  }
  function ce(t3, e2, s2) {
    let i2;
    t3 instanceof at && (t3 = t3.data.hook || (t3.data.hook = {}));
    const c2 = t3[e2];
    function a2() {
      s2.apply(this, arguments), v(i2.fns, a2);
    }
    n(c2) ? i2 = se([a2]) : o2(c2.fns) && r(c2.merged) ? (i2 = c2, i2.fns.push(a2)) : i2 = se([c2, a2]), i2.merged = true, t3[e2] = i2;
  }
  function ae(t3, e2, n2, r2, s2) {
    if (o2(e2)) {
      if (g(e2, n2)) return t3[n2] = e2[n2], s2 || delete e2[n2], true;
      if (g(e2, r2)) return t3[n2] = e2[r2], s2 || delete e2[r2], true;
    }
    return false;
  }
  function le(t3) {
    return s(t3) ? [ut(t3)] : e(t3) ? fe(t3) : void 0;
  }
  function ue(t3) {
    return o2(t3) && o2(t3.text) && false === t3.isComment;
  }
  function fe(t3, i2) {
    const c2 = [];
    let a2, l2, u2, f2;
    for (a2 = 0; a2 < t3.length; a2++) l2 = t3[a2], n(l2) || "boolean" == typeof l2 || (u2 = c2.length - 1, f2 = c2[u2], e(l2) ? l2.length > 0 && (l2 = fe(l2, `${i2 || ""}_${a2}`), ue(l2[0]) && ue(f2) && (c2[u2] = ut(f2.text + l2[0].text), l2.shift()), c2.push.apply(c2, l2)) : s(l2) ? ue(f2) ? c2[u2] = ut(f2.text + l2) : "" !== l2 && c2.push(ut(l2)) : ue(l2) && ue(f2) ? c2[u2] = ut(f2.text + l2.text) : (r(t3._isVList) && o2(l2.tag) && n(l2.key) && o2(i2) && (l2.key = `__vlist${i2}_${a2}__`), c2.push(l2)));
    return c2;
  }
  function de(t3, n2) {
    let r2, s2, i2, a2, l2 = null;
    if (e(t3) || "string" == typeof t3) for (l2 = new Array(t3.length), r2 = 0, s2 = t3.length; r2 < s2; r2++) l2[r2] = n2(t3[r2], r2);
    else if ("number" == typeof t3) for (l2 = new Array(t3), r2 = 0; r2 < t3; r2++) l2[r2] = n2(r2 + 1, r2);
    else if (c(t3)) if (rt && t3[Symbol.iterator]) {
      l2 = [];
      const e2 = t3[Symbol.iterator]();
      let o22 = e2.next();
      for (; !o22.done; ) l2.push(n2(o22.value, l2.length)), o22 = e2.next();
    } else for (i2 = Object.keys(t3), l2 = new Array(i2.length), r2 = 0, s2 = i2.length; r2 < s2; r2++) a2 = i2[r2], l2[r2] = n2(t3[a2], a2, r2);
    return o2(l2) || (l2 = []), l2._isVList = true, l2;
  }
  function pe(t3, e2, n2, o22) {
    const r2 = this.$scopedSlots[t3];
    let s2;
    r2 ? (n2 = n2 || {}, o22 && (n2 = j(j({}, o22), n2)), s2 = r2(n2) || (i(e2) ? e2() : e2)) : s2 = this.$slots[t3] || (i(e2) ? e2() : e2);
    const c2 = n2 && n2.slot;
    return c2 ? this.$createElement("template", { slot: c2 }, s2) : s2;
  }
  function he(t3) {
    return co(this.$options, "filters", t3) || P;
  }
  function me(t3, n2) {
    return e(t3) ? -1 === t3.indexOf(n2) : t3 !== n2;
  }
  function _e(t3, e2, n2, o22, r2) {
    const s2 = U.keyCodes[e2] || n2;
    return r2 && o22 && !U.keyCodes[e2] ? me(r2, o22) : s2 ? me(s2, t3) : o22 ? O(o22) !== e2 : void 0 === t3;
  }
  function ve(t3, n2, o22, r2, s2) {
    if (o22) {
      if (c(o22)) {
        let i2;
        e(o22) && (o22 = A(o22));
        for (const e2 in o22) {
          if ("class" === e2 || "style" === e2 || _(e2)) i2 = t3;
          else {
            const o3 = t3.attrs && t3.attrs.type;
            i2 = r2 || U.mustUseProp(n2, o3, e2) ? t3.domProps || (t3.domProps = {}) : t3.attrs || (t3.attrs = {});
          }
          const c2 = w(e2), a2 = O(e2);
          if (!(c2 in i2) && !(a2 in i2) && (i2[e2] = o22[e2], s2)) {
            (t3.on || (t3.on = {}))[`update:${e2}`] = function(t4) {
              o22[e2] = t4;
            };
          }
        }
      }
    }
    return t3;
  }
  function ye(t3, e2) {
    const n2 = this._staticTrees || (this._staticTrees = []);
    let o22 = n2[t3];
    return o22 && !e2 || (o22 = n2[t3] = this.$options.staticRenderFns[t3].call(this._renderProxy, this._c, this), be(o22, `__static__${t3}`, false)), o22;
  }
  function ge(t3, e2, n2) {
    return be(t3, `__once__${e2}${n2 ? `_${n2}` : ""}`, true), t3;
  }
  function be(t3, n2, o22) {
    if (e(t3)) for (let e2 = 0; e2 < t3.length; e2++) t3[e2] && "string" != typeof t3[e2] && $e(t3[e2], `${n2}_${e2}`, o22);
    else $e(t3, n2, o22);
  }
  function $e(t3, e2, n2) {
    t3.isStatic = true, t3.key = e2, t3.isOnce = n2;
  }
  function we(t3, e2) {
    if (e2) {
      if (l(e2)) {
        const n2 = t3.on = t3.on ? j({}, t3.on) : {};
        for (const t4 in e2) {
          const o22 = n2[t4], r2 = e2[t4];
          n2[t4] = o22 ? [].concat(o22, r2) : r2;
        }
      }
    }
    return t3;
  }
  function Ce(t3, n2, o22, r2) {
    n2 = n2 || { $stable: !o22 };
    for (let r3 = 0; r3 < t3.length; r3++) {
      const s2 = t3[r3];
      e(s2) ? Ce(s2, n2, o22) : s2 && (s2.proxy && (s2.fn.proxy = true), n2[s2.key] = s2.fn);
    }
    return r2 && (n2.$key = r2), n2;
  }
  function xe(t3, e2) {
    for (let n2 = 0; n2 < e2.length; n2 += 2) {
      const o22 = e2[n2];
      "string" == typeof o22 && o22 && (t3[e2[n2]] = e2[n2 + 1]);
    }
    return t3;
  }
  function Oe(t3, e2) {
    return "string" == typeof t3 ? e2 + t3 : t3;
  }
  function ke(t3) {
    t3._o = ge, t3._n = h2, t3._s = d, t3._l = de, t3._t = pe, t3._q = I, t3._i = D, t3._m = ye, t3._f = he, t3._k = _e, t3._b = ve, t3._v = ut, t3._e = lt, t3._u = Ce, t3._g = we, t3._d = xe, t3._p = Oe;
  }
  function Se(t3, e2) {
    if (!t3 || !t3.length) return {};
    const n2 = {};
    for (let o22 = 0, r2 = t3.length; o22 < r2; o22++) {
      const r3 = t3[o22], s2 = r3.data;
      if (s2 && s2.attrs && s2.attrs.slot && delete s2.attrs.slot, r3.context !== e2 && r3.fnContext !== e2 || !s2 || null == s2.slot) (n2.default || (n2.default = [])).push(r3);
      else {
        const t4 = s2.slot, e3 = n2[t4] || (n2[t4] = []);
        "template" === r3.tag ? e3.push.apply(e3, r3.children || []) : e3.push(r3);
      }
    }
    for (const t4 in n2) n2[t4].every(je) && delete n2[t4];
    return n2;
  }
  function je(t3) {
    return t3.isComment && !t3.asyncFactory || " " === t3.text;
  }
  function Ae(t3) {
    return t3.isComment && t3.asyncFactory;
  }
  function Te(e2, n2, o22, r2) {
    let s2;
    const i2 = Object.keys(o22).length > 0, c2 = n2 ? !!n2.$stable : !i2, a2 = n2 && n2.$key;
    if (n2) {
      if (n2._normalized) return n2._normalized;
      if (c2 && r2 && r2 !== t && a2 === r2.$key && !i2 && !r2.$hasNormal) return r2;
      s2 = {};
      for (const t3 in n2) n2[t3] && "$" !== t3[0] && (s2[t3] = Ee(e2, o22, t3, n2[t3]));
    } else s2 = {};
    for (const t3 in o22) t3 in s2 || (s2[t3] = Pe(o22, t3));
    return n2 && Object.isExtensible(n2) && (n2._normalized = s2), V(s2, "$stable", c2), V(s2, "$key", a2), V(s2, "$hasNormal", i2), s2;
  }
  function Ee(t3, n2, o22, r2) {
    const s2 = function() {
      const n3 = it;
      ct(t3);
      let o3 = arguments.length ? r2.apply(null, arguments) : r2({});
      o3 = o3 && "object" == typeof o3 && !e(o3) ? [o3] : le(o3);
      const s3 = o3 && o3[0];
      return ct(n3), o3 && (!s3 || 1 === o3.length && s3.isComment && !Ae(s3)) ? void 0 : o3;
    };
    return r2.proxy && Object.defineProperty(n2, o22, { get: s2, enumerable: true, configurable: true }), s2;
  }
  function Pe(t3, e2) {
    return () => t3[e2];
  }
  function Ie(e2) {
    return { get attrs() {
      if (!e2._attrsProxy) {
        const n2 = e2._attrsProxy = {};
        V(n2, "_v_attr_proxy", true), De(n2, e2.$attrs, t, e2, "$attrs");
      }
      return e2._attrsProxy;
    }, get listeners() {
      if (!e2._listenersProxy) {
        De(e2._listenersProxy = {}, e2.$listeners, t, e2, "$listeners");
      }
      return e2._listenersProxy;
    }, get slots() {
      return function(t3) {
        t3._slotsProxy || Me(t3._slotsProxy = {}, t3.$scopedSlots);
        return t3._slotsProxy;
      }(e2);
    }, emit: k(e2.$emit, e2), expose(t3) {
      t3 && Object.keys(t3).forEach((n2) => Ut(e2, t3, n2));
    } };
  }
  function De(t3, e2, n2, o22, r2) {
    let s2 = false;
    for (const i2 in e2) i2 in t3 ? e2[i2] !== n2[i2] && (s2 = true) : (s2 = true, Ne(t3, i2, o22, r2));
    for (const n3 in t3) n3 in e2 || (s2 = true, delete t3[n3]);
    return s2;
  }
  function Ne(t3, e2, n2, o22) {
    Object.defineProperty(t3, e2, { enumerable: true, configurable: true, get: () => n2[o22][e2] });
  }
  function Me(t3, e2) {
    for (const n2 in e2) t3[n2] = e2[n2];
    for (const n2 in t3) n2 in e2 || delete t3[n2];
  }
  function Le() {
    const t3 = it;
    return t3._setupContext || (t3._setupContext = Ie(t3));
  }
  let Re = null;
  function Fe(t3, e2) {
    return (t3.__esModule || rt && "Module" === t3[Symbol.toStringTag]) && (t3 = t3.default), c(t3) ? e2.extend(t3) : t3;
  }
  function Ue(t3) {
    if (e(t3)) for (let e2 = 0; e2 < t3.length; e2++) {
      const n2 = t3[e2];
      if (o2(n2) && (o2(n2.componentOptions) || Ae(n2))) return n2;
    }
  }
  const Be = 1, Ve = 2;
  function ze(t3, n2, a2, l2, u2, f2) {
    return (e(a2) || s(a2)) && (u2 = l2, l2 = a2, a2 = void 0), r(f2) && (u2 = Ve), function(t4, n3, r2, s2, a3) {
      if (o2(r2) && o2(r2.__ob__)) return lt();
      o2(r2) && o2(r2.is) && (n3 = r2.is);
      if (!n3) return lt();
      e(s2) && i(s2[0]) && ((r2 = r2 || {}).scopedSlots = { default: s2[0] }, s2.length = 0);
      a3 === Ve ? s2 = le(s2) : a3 === Be && (s2 = function(t5) {
        for (let n4 = 0; n4 < t5.length; n4++) if (e(t5[n4])) return Array.prototype.concat.apply([], t5);
        return t5;
      }(s2));
      let l3, u3;
      if ("string" == typeof n3) {
        let e2;
        u3 = t4.$vnode && t4.$vnode.ns || U.getTagNamespace(n3), l3 = r2 && r2.pre || !o2(e2 = co(t4.$options, "components", n3)) ? new at(n3, r2, s2, void 0, void 0, t4) : Xn(e2, r2, t4, s2, n3);
      } else l3 = Xn(n3, r2, t4, s2);
      return e(l3) ? l3 : o2(l3) ? (o2(u3) && He(l3, u3), o2(r2) && function(t5) {
        c(t5.style) && yn(t5.style);
        c(t5.class) && yn(t5.class);
      }(r2), l3) : lt();
    }(t3, n2, a2, l2, u2);
  }
  function He(t3, e2, s2) {
    if (t3.ns = e2, "foreignObject" === t3.tag && (e2 = void 0, s2 = true), o2(t3.children)) for (let i2 = 0, c2 = t3.children.length; i2 < c2; i2++) {
      const c3 = t3.children[i2];
      o2(c3.tag) && (n(c3.ns) || r(s2) && "svg" !== c3.tag) && He(c3, e2, s2);
    }
  }
  function We(t3, e2, n2) {
    vt();
    try {
      if (e2) {
        let o22 = e2;
        for (; o22 = o22.$parent; ) {
          const r2 = o22.$options.errorCaptured;
          if (r2) for (let s2 = 0; s2 < r2.length; s2++) try {
            if (false === r2[s2].call(o22, t3, e2, n2)) return;
          } catch (t4) {
            qe(t4, o22, "errorCaptured hook");
          }
        }
      }
      qe(t3, e2, n2);
    } finally {
      yt();
    }
  }
  function Ke(t3, e2, n2, o22, r2) {
    let s2;
    try {
      s2 = n2 ? t3.apply(e2, n2) : t3.call(e2), s2 && !s2._isVue && f(s2) && !s2._handled && (s2.catch((t4) => We(t4, o22, r2 + " (Promise/async)")), s2._handled = true);
    } catch (t4) {
      We(t4, o22, r2);
    }
    return s2;
  }
  function qe(t3, e2, n2) {
    Ge(t3);
  }
  function Ge(t3, e2, n2) {
    if (!W || "undefined" == typeof console) throw t3;
    console.error(t3);
  }
  let Ze = false;
  const Je = [];
  let Xe, Qe = false;
  function Ye() {
    Qe = false;
    const t3 = Je.slice(0);
    Je.length = 0;
    for (let e2 = 0; e2 < t3.length; e2++) t3[e2]();
  }
  if ("undefined" != typeof Promise && ot(Promise)) {
    const t3 = Promise.resolve();
    Xe = () => {
      t3.then(Ye), J && setTimeout(T);
    }, Ze = true;
  } else if (q || "undefined" == typeof MutationObserver || !ot(MutationObserver) && "[object MutationObserverConstructor]" !== MutationObserver.toString()) Xe = "undefined" != typeof setImmediate && ot(setImmediate) ? () => {
    setImmediate(Ye);
  } : () => {
    setTimeout(Ye, 0);
  };
  else {
    let t3 = 1;
    const e2 = new MutationObserver(Ye), n2 = document.createTextNode(String(t3));
    e2.observe(n2, { characterData: true }), Xe = () => {
      t3 = (t3 + 1) % 2, n2.data = String(t3);
    }, Ze = true;
  }
  function tn(t3, e2) {
    let n2;
    if (Je.push(() => {
      if (t3) try {
        t3.call(e2);
      } catch (t4) {
        We(t4, e2, "nextTick");
      }
      else n2 && n2(e2);
    }), Qe || (Qe = true, Xe()), !t3 && "undefined" != typeof Promise) return new Promise((t4) => {
      n2 = t4;
    });
  }
  function en(t3) {
    return (e2, n2 = it) => {
      if (n2) return function(t4, e3, n3) {
        const o22 = t4.$options;
        o22[e3] = oo(o22[e3], n3);
      }(n2, t3, e2);
    };
  }
  const nn = en("beforeMount"), on = en("mounted"), rn = en("beforeUpdate"), sn = en("updated"), cn = en("beforeDestroy"), an = en("destroyed"), ln = en("activated"), un = en("deactivated"), fn = en("serverPrefetch"), dn = en("renderTracked"), pn = en("renderTriggered"), hn = en("errorCaptured");
  const mn = "2.7.16";
  var _n = Object.freeze({ __proto__: null, version: mn, defineComponent: function(t3) {
    return t3;
  }, ref: function(t3) {
    return Ft(t3, false);
  }, shallowRef: function(t3) {
    return Ft(t3, true);
  }, isRef: Rt, toRef: Bt, toRefs: function(t3) {
    const n2 = e(t3) ? new Array(t3.length) : {};
    for (const e2 in t3) n2[e2] = Bt(t3, e2);
    return n2;
  }, unref: function(t3) {
    return Rt(t3) ? t3.value : t3;
  }, proxyRefs: function(t3) {
    if (Dt(t3)) return t3;
    const e2 = {}, n2 = Object.keys(t3);
    for (let o22 = 0; o22 < n2.length; o22++) Ut(e2, t3, n2[o22]);
    return e2;
  }, customRef: function(t3) {
    const e2 = new mt(), { get: n2, set: o22 } = t3(() => {
      e2.depend();
    }, () => {
      e2.notify();
    }), r2 = { get value() {
      return n2();
    }, set value(t4) {
      o22(t4);
    } };
    return V(r2, Lt, true), r2;
  }, triggerRef: function(t3) {
    t3.dep && t3.dep.notify();
  }, reactive: function(t3) {
    return It(t3, false), t3;
  }, isReactive: Dt, isReadonly: Mt, isShallow: Nt, isProxy: function(t3) {
    return Dt(t3) || Mt(t3);
  }, shallowReactive: Pt, markRaw: function(t3) {
    return Object.isExtensible(t3) && V(t3, "__v_skip", true), t3;
  }, toRaw: function t2(e2) {
    const n2 = e2 && e2.__v_raw;
    return n2 ? t2(n2) : e2;
  }, readonly: Ht, shallowReadonly: function(t3) {
    return Wt(t3, true);
  }, computed: function(t3, e2) {
    let n2, o22;
    const r2 = i(t3);
    r2 ? (n2 = t3, o22 = T) : (n2 = t3.get, o22 = t3.set);
    const s2 = et() ? null : new wn(it, n2, T, { lazy: true }), c2 = { effect: s2, get value() {
      return s2 ? (s2.dirty && s2.evaluate(), mt.target && s2.depend(), s2.value) : n2();
    }, set value(t4) {
      o22(t4);
    } };
    return V(c2, Lt, true), V(c2, "__v_isReadonly", r2), c2;
  }, watch: function(t3, e2, n2) {
    return Yt(t3, e2, n2);
  }, watchEffect: function(t3, e2) {
    return Yt(t3, null, e2);
  }, watchPostEffect: Xt, watchSyncEffect: function(t3, e2) {
    return Yt(t3, null, { flush: "sync" });
  }, EffectScope: ee, effectScope: function(t3) {
    return new ee(t3);
  }, onScopeDispose: function(t3) {
    te && te.cleanups.push(t3);
  }, getCurrentScope: ne, provide: function(t3, e2) {
    it && (oe(it)[t3] = e2);
  }, inject: function(t3, e2, n2 = false) {
    const o22 = it;
    if (o22) {
      const r2 = o22.$parent && o22.$parent._provided;
      if (r2 && t3 in r2) return r2[t3];
      if (arguments.length > 1) return n2 && i(e2) ? e2.call(o22) : e2;
    }
  }, h: function(t3, e2, n2) {
    return ze(it, t3, e2, n2, 2, true);
  }, getCurrentInstance: function() {
    return it && { proxy: it };
  }, useSlots: function() {
    return Le().slots;
  }, useAttrs: function() {
    return Le().attrs;
  }, useListeners: function() {
    return Le().listeners;
  }, mergeDefaults: function(t3, n2) {
    const o22 = e(t3) ? t3.reduce((t4, e2) => (t4[e2] = {}, t4), {}) : t3;
    for (const t4 in n2) {
      const r2 = o22[t4];
      r2 ? e(r2) || i(r2) ? o22[t4] = { type: r2, default: n2[t4] } : r2.default = n2[t4] : null === r2 && (o22[t4] = { default: n2[t4] });
    }
    return o22;
  }, nextTick: tn, set: At, del: Tt, useCssModule: function(e2 = "$style") {
    {
      if (!it) return t;
      const n2 = it[e2];
      return n2 || t;
    }
  }, useCssVars: function(t3) {
    if (!W) return;
    const e2 = it;
    e2 && Xt(() => {
      const n2 = e2.$el, o22 = t3(e2, e2._setupProxy);
      if (n2 && 1 === n2.nodeType) {
        const t4 = n2.style;
        for (const e3 in o22) t4.setProperty(`--${e3}`, o22[e3]);
      }
    });
  }, defineAsyncComponent: function(t3) {
    i(t3) && (t3 = { loader: t3 });
    const { loader: e2, loadingComponent: n2, errorComponent: o22, delay: r2 = 200, timeout: s2, suspensible: c2 = false, onError: a2 } = t3;
    let l2 = null, u2 = 0;
    const f2 = () => {
      let t4;
      return l2 || (t4 = l2 = e2().catch((t5) => {
        if (t5 = t5 instanceof Error ? t5 : new Error(String(t5)), a2) return new Promise((e3, n3) => {
          a2(t5, () => e3((u2++, l2 = null, f2())), () => n3(t5), u2 + 1);
        });
        throw t5;
      }).then((e3) => t4 !== l2 && l2 ? l2 : (e3 && (e3.__esModule || "Module" === e3[Symbol.toStringTag]) && (e3 = e3.default), e3)));
    };
    return () => ({ component: f2(), delay: r2, timeout: s2, error: o22, loading: n2 });
  }, onBeforeMount: nn, onMounted: on, onBeforeUpdate: rn, onUpdated: sn, onBeforeUnmount: cn, onUnmounted: an, onActivated: ln, onDeactivated: un, onServerPrefetch: fn, onRenderTracked: dn, onRenderTriggered: pn, onErrorCaptured: function(t3, e2 = it) {
    hn(t3, e2);
  } });
  const vn = new st();
  function yn(t3) {
    return gn(t3, vn), vn.clear(), t3;
  }
  function gn(t3, n2) {
    let o22, r2;
    const s2 = e(t3);
    if (!(!s2 && !c(t3) || t3.__v_skip || Object.isFrozen(t3) || t3 instanceof at)) {
      if (t3.__ob__) {
        const e2 = t3.__ob__.dep.id;
        if (n2.has(e2)) return;
        n2.add(e2);
      }
      if (s2) for (o22 = t3.length; o22--; ) gn(t3[o22], n2);
      else if (Rt(t3)) gn(t3.value, n2);
      else for (r2 = Object.keys(t3), o22 = r2.length; o22--; ) gn(t3[r2[o22]], n2);
    }
  }
  let bn, $n = 0;
  class wn {
    constructor(t3, e2, n2, o22, r2) {
      !function(t4, e3 = te) {
        e3 && e3.active && e3.effects.push(t4);
      }(this, te && !te._vm ? te : t3 ? t3._scope : void 0), (this.vm = t3) && r2 && (t3._watcher = this), o22 ? (this.deep = !!o22.deep, this.user = !!o22.user, this.lazy = !!o22.lazy, this.sync = !!o22.sync, this.before = o22.before) : this.deep = this.user = this.lazy = this.sync = false, this.cb = n2, this.id = ++$n, this.active = true, this.post = false, this.dirty = this.lazy, this.deps = [], this.newDeps = [], this.depIds = new st(), this.newDepIds = new st(), this.expression = "", i(e2) ? this.getter = e2 : (this.getter = function(t4) {
        if (z.test(t4)) return;
        const e3 = t4.split(".");
        return function(t5) {
          for (let n3 = 0; n3 < e3.length; n3++) {
            if (!t5) return;
            t5 = t5[e3[n3]];
          }
          return t5;
        };
      }(e2), this.getter || (this.getter = T)), this.value = this.lazy ? void 0 : this.get();
    }
    get() {
      let t3;
      vt(this);
      const e2 = this.vm;
      try {
        t3 = this.getter.call(e2, e2);
      } catch (t4) {
        if (!this.user) throw t4;
        We(t4, e2, `getter for watcher "${this.expression}"`);
      } finally {
        this.deep && yn(t3), yt(), this.cleanupDeps();
      }
      return t3;
    }
    addDep(t3) {
      const e2 = t3.id;
      this.newDepIds.has(e2) || (this.newDepIds.add(e2), this.newDeps.push(t3), this.depIds.has(e2) || t3.addSub(this));
    }
    cleanupDeps() {
      let t3 = this.deps.length;
      for (; t3--; ) {
        const e3 = this.deps[t3];
        this.newDepIds.has(e3.id) || e3.removeSub(this);
      }
      let e2 = this.depIds;
      this.depIds = this.newDepIds, this.newDepIds = e2, this.newDepIds.clear(), e2 = this.deps, this.deps = this.newDeps, this.newDeps = e2, this.newDeps.length = 0;
    }
    update() {
      this.lazy ? this.dirty = true : this.sync ? this.run() : zn(this);
    }
    run() {
      if (this.active) {
        const t3 = this.get();
        if (t3 !== this.value || c(t3) || this.deep) {
          const e2 = this.value;
          if (this.value = t3, this.user) {
            const n2 = `callback for watcher "${this.expression}"`;
            Ke(this.cb, this.vm, [t3, e2], this.vm, n2);
          } else this.cb.call(this.vm, t3, e2);
        }
      }
    }
    evaluate() {
      this.value = this.get(), this.dirty = false;
    }
    depend() {
      let t3 = this.deps.length;
      for (; t3--; ) this.deps[t3].depend();
    }
    teardown() {
      if (this.vm && !this.vm._isBeingDestroyed && v(this.vm._scope.effects, this), this.active) {
        let t3 = this.deps.length;
        for (; t3--; ) this.deps[t3].removeSub(this);
        this.active = false, this.onStop && this.onStop();
      }
    }
  }
  function Cn(t3, e2) {
    bn.$on(t3, e2);
  }
  function xn(t3, e2) {
    bn.$off(t3, e2);
  }
  function On(t3, e2) {
    const n2 = bn;
    return function o22() {
      null !== e2.apply(null, arguments) && n2.$off(t3, o22);
    };
  }
  function kn(t3, e2, n2) {
    bn = t3, ie(e2, n2 || {}, Cn, xn, On, t3), bn = void 0;
  }
  let Sn = null;
  function jn(t3) {
    const e2 = Sn;
    return Sn = t3, () => {
      Sn = e2;
    };
  }
  function An(t3) {
    for (; t3 && (t3 = t3.$parent); ) if (t3._inactive) return true;
    return false;
  }
  function Tn(t3, e2) {
    if (e2) {
      if (t3._directInactive = false, An(t3)) return;
    } else if (t3._directInactive) return;
    if (t3._inactive || null === t3._inactive) {
      t3._inactive = false;
      for (let e3 = 0; e3 < t3.$children.length; e3++) Tn(t3.$children[e3]);
      Pn(t3, "activated");
    }
  }
  function En(t3, e2) {
    if (!(e2 && (t3._directInactive = true, An(t3)) || t3._inactive)) {
      t3._inactive = true;
      for (let e3 = 0; e3 < t3.$children.length; e3++) En(t3.$children[e3]);
      Pn(t3, "deactivated");
    }
  }
  function Pn(t3, e2, n2, o22 = true) {
    vt();
    const r2 = it, s2 = ne();
    o22 && ct(t3);
    const i2 = t3.$options[e2], c2 = `${e2} hook`;
    if (i2) for (let e3 = 0, o3 = i2.length; e3 < o3; e3++) Ke(i2[e3], t3, null, t3, c2);
    t3._hasHookEvent && t3.$emit("hook:" + e2), o22 && (ct(r2), s2 && s2.on()), yt();
  }
  const In = [], Dn = [];
  let Nn = {}, Mn = false, Ln = false, Rn = 0;
  let Fn = 0, Un = Date.now;
  if (W && !q) {
    const t3 = window.performance;
    t3 && "function" == typeof t3.now && Un() > document.createEvent("Event").timeStamp && (Un = () => t3.now());
  }
  const Bn = (t3, e2) => {
    if (t3.post) {
      if (!e2.post) return 1;
    } else if (e2.post) return -1;
    return t3.id - e2.id;
  };
  function Vn() {
    let t3, e2;
    for (Fn = Un(), Ln = true, In.sort(Bn), Rn = 0; Rn < In.length; Rn++) t3 = In[Rn], t3.before && t3.before(), e2 = t3.id, Nn[e2] = null, t3.run();
    const n2 = Dn.slice(), o22 = In.slice();
    Rn = In.length = Dn.length = 0, Nn = {}, Mn = Ln = false, function(t4) {
      for (let e3 = 0; e3 < t4.length; e3++) t4[e3]._inactive = true, Tn(t4[e3], true);
    }(n2), function(t4) {
      let e3 = t4.length;
      for (; e3--; ) {
        const n3 = t4[e3], o3 = n3.vm;
        o3 && o3._watcher === n3 && o3._isMounted && !o3._isDestroyed && Pn(o3, "updated");
      }
    }(o22), ht();
  }
  function zn(t3) {
    const e2 = t3.id;
    if (null == Nn[e2] && (t3 !== mt.target || !t3.noRecurse)) {
      if (Nn[e2] = true, Ln) {
        let e3 = In.length - 1;
        for (; e3 > Rn && In[e3].id > t3.id; ) e3--;
        In.splice(e3 + 1, 0, t3);
      } else In.push(t3);
      Mn || (Mn = true, tn(Vn));
    }
  }
  function Hn(t3, e2) {
    if (t3) {
      const n2 = /* @__PURE__ */ Object.create(null), o22 = rt ? Reflect.ownKeys(t3) : Object.keys(t3);
      for (let r2 = 0; r2 < o22.length; r2++) {
        const s2 = o22[r2];
        if ("__ob__" === s2) continue;
        const c2 = t3[s2].from;
        if (c2 in e2._provided) n2[s2] = e2._provided[c2];
        else if ("default" in t3[s2]) {
          const o3 = t3[s2].default;
          n2[s2] = i(o3) ? o3.call(e2) : o3;
        }
      }
      return n2;
    }
  }
  function Wn(n2, o22, s2, i2, c2) {
    const a2 = c2.options;
    let l2;
    g(i2, "_uid") ? (l2 = Object.create(i2), l2._original = i2) : (l2 = i2, i2 = i2._original);
    const u2 = r(a2._compiled), f2 = !u2;
    this.data = n2, this.props = o22, this.children = s2, this.parent = i2, this.listeners = n2.on || t, this.injections = Hn(a2.inject, i2), this.slots = () => (this.$slots || Te(i2, n2.scopedSlots, this.$slots = Se(s2, i2)), this.$slots), Object.defineProperty(this, "scopedSlots", { enumerable: true, get() {
      return Te(i2, n2.scopedSlots, this.slots());
    } }), u2 && (this.$options = a2, this.$slots = this.slots(), this.$scopedSlots = Te(i2, n2.scopedSlots, this.$slots)), a2._scopeId ? this._c = (t3, n3, o3, r2) => {
      const s3 = ze(l2, t3, n3, o3, r2, f2);
      return s3 && !e(s3) && (s3.fnScopeId = a2._scopeId, s3.fnContext = i2), s3;
    } : this._c = (t3, e2, n3, o3) => ze(l2, t3, e2, n3, o3, f2);
  }
  function Kn(t3, e2, n2, o22, r2) {
    const s2 = ft(t3);
    return s2.fnContext = n2, s2.fnOptions = o22, e2.slot && ((s2.data || (s2.data = {})).slot = e2.slot), s2;
  }
  function qn(t3, e2) {
    for (const n2 in e2) t3[w(n2)] = e2[n2];
  }
  function Gn(t3) {
    return t3.name || t3.__name || t3._componentTag;
  }
  ke(Wn.prototype);
  const Zn = { init(t3, e2) {
    if (t3.componentInstance && !t3.componentInstance._isDestroyed && t3.data.keepAlive) {
      const e3 = t3;
      Zn.prepatch(e3, e3);
    } else {
      (t3.componentInstance = function(t4, e3) {
        const n2 = { _isComponent: true, _parentVnode: t4, parent: e3 }, r2 = t4.data.inlineTemplate;
        o2(r2) && (n2.render = r2.render, n2.staticRenderFns = r2.staticRenderFns);
        return new t4.componentOptions.Ctor(n2);
      }(t3, Sn)).$mount(e2 ? t3.elm : void 0, e2);
    }
  }, prepatch(e2, n2) {
    const o22 = n2.componentOptions;
    !function(e3, n3, o3, r2, s2) {
      const i2 = r2.data.scopedSlots, c2 = e3.$scopedSlots, a2 = !!(i2 && !i2.$stable || c2 !== t && !c2.$stable || i2 && e3.$scopedSlots.$key !== i2.$key || !i2 && e3.$scopedSlots.$key);
      let l2 = !!(s2 || e3.$options._renderChildren || a2);
      const u2 = e3.$vnode;
      e3.$options._parentVnode = r2, e3.$vnode = r2, e3._vnode && (e3._vnode.parent = r2), e3.$options._renderChildren = s2;
      const f2 = r2.data.attrs || t;
      e3._attrsProxy && De(e3._attrsProxy, f2, u2.data && u2.data.attrs || t, e3, "$attrs") && (l2 = true), e3.$attrs = f2, o3 = o3 || t;
      const d2 = e3.$options._parentListeners;
      if (e3._listenersProxy && De(e3._listenersProxy, o3, d2 || t, e3, "$listeners"), e3.$listeners = e3.$options._parentListeners = o3, kn(e3, o3, d2), n3 && e3.$options.props) {
        xt(false);
        const t3 = e3._props, o4 = e3.$options._propKeys || [];
        for (let r3 = 0; r3 < o4.length; r3++) {
          const s3 = o4[r3], i3 = e3.$options.props;
          t3[s3] = ao(s3, i3, n3, e3);
        }
        xt(true), e3.$options.propsData = n3;
      }
      l2 && (e3.$slots = Se(s2, r2.context), e3.$forceUpdate());
    }(n2.componentInstance = e2.componentInstance, o22.propsData, o22.listeners, n2, o22.children);
  }, insert(t3) {
    const { context: e2, componentInstance: n2 } = t3;
    var o22;
    n2._isMounted || (n2._isMounted = true, Pn(n2, "mounted")), t3.data.keepAlive && (e2._isMounted ? ((o22 = n2)._inactive = false, Dn.push(o22)) : Tn(n2, true));
  }, destroy(t3) {
    const { componentInstance: e2 } = t3;
    e2._isDestroyed || (t3.data.keepAlive ? En(e2, true) : e2.$destroy());
  } }, Jn = Object.keys(Zn);
  function Xn(s2, i2, a2, l2, u2) {
    if (n(s2)) return;
    const d2 = a2.$options._base;
    if (c(s2) && (s2 = d2.extend(s2)), "function" != typeof s2) return;
    let p2;
    if (n(s2.cid) && (p2 = s2, s2 = function(t3, e2) {
      if (r(t3.error) && o2(t3.errorComp)) return t3.errorComp;
      if (o2(t3.resolved)) return t3.resolved;
      const s3 = Re;
      if (s3 && o2(t3.owners) && -1 === t3.owners.indexOf(s3) && t3.owners.push(s3), r(t3.loading) && o2(t3.loadingComp)) return t3.loadingComp;
      if (s3 && !o2(t3.owners)) {
        const r2 = t3.owners = [s3];
        let i3 = true, a3 = null, l3 = null;
        s3.$on("hook:destroyed", () => v(r2, s3));
        const u3 = (t4) => {
          for (let t5 = 0, e3 = r2.length; t5 < e3; t5++) r2[t5].$forceUpdate();
          t4 && (r2.length = 0, null !== a3 && (clearTimeout(a3), a3 = null), null !== l3 && (clearTimeout(l3), l3 = null));
        }, d3 = N((n2) => {
          t3.resolved = Fe(n2, e2), i3 ? r2.length = 0 : u3(true);
        }), p3 = N((e3) => {
          o2(t3.errorComp) && (t3.error = true, u3(true));
        }), h3 = t3(d3, p3);
        return c(h3) && (f(h3) ? n(t3.resolved) && h3.then(d3, p3) : f(h3.component) && (h3.component.then(d3, p3), o2(h3.error) && (t3.errorComp = Fe(h3.error, e2)), o2(h3.loading) && (t3.loadingComp = Fe(h3.loading, e2), 0 === h3.delay ? t3.loading = true : a3 = setTimeout(() => {
          a3 = null, n(t3.resolved) && n(t3.error) && (t3.loading = true, u3(false));
        }, h3.delay || 200)), o2(h3.timeout) && (l3 = setTimeout(() => {
          l3 = null, n(t3.resolved) && p3(null);
        }, h3.timeout)))), i3 = false, t3.loading ? t3.loadingComp : t3.resolved;
      }
    }(p2, d2), void 0 === s2)) return function(t3, e2, n2, o22, r2) {
      const s3 = lt();
      return s3.asyncFactory = t3, s3.asyncMeta = { data: e2, context: n2, children: o22, tag: r2 }, s3;
    }(p2, i2, a2, l2, u2);
    i2 = i2 || {}, Co(s2), o2(i2.model) && function(t3, n2) {
      const r2 = t3.model && t3.model.prop || "value", s3 = t3.model && t3.model.event || "input";
      (n2.attrs || (n2.attrs = {}))[r2] = n2.model.value;
      const i3 = n2.on || (n2.on = {}), c2 = i3[s3], a3 = n2.model.callback;
      o2(c2) ? (e(c2) ? -1 === c2.indexOf(a3) : c2 !== a3) && (i3[s3] = [a3].concat(c2)) : i3[s3] = a3;
    }(s2.options, i2);
    const h22 = function(t3, e2, r2) {
      const s3 = e2.options.props;
      if (n(s3)) return;
      const i3 = {}, { attrs: c2, props: a3 } = t3;
      if (o2(c2) || o2(a3)) for (const t4 in s3) {
        const e3 = O(t4);
        ae(i3, a3, t4, e3, true) || ae(i3, c2, t4, e3, false);
      }
      return i3;
    }(i2, s2);
    if (r(s2.options.functional)) return function(n2, r2, s3, i3, c2) {
      const a3 = n2.options, l3 = {}, u3 = a3.props;
      if (o2(u3)) for (const e2 in u3) l3[e2] = ao(e2, u3, r2 || t);
      else o2(s3.attrs) && qn(l3, s3.attrs), o2(s3.props) && qn(l3, s3.props);
      const f2 = new Wn(s3, l3, c2, i3, n2), d3 = a3.render.call(null, f2._c, f2);
      if (d3 instanceof at) return Kn(d3, s3, f2.parent, a3);
      if (e(d3)) {
        const t3 = le(d3) || [], e2 = new Array(t3.length);
        for (let n3 = 0; n3 < t3.length; n3++) e2[n3] = Kn(t3[n3], s3, f2.parent, a3);
        return e2;
      }
    }(s2, h22, i2, a2, l2);
    const m2 = i2.on;
    if (i2.on = i2.nativeOn, r(s2.options.abstract)) {
      const t3 = i2.slot;
      i2 = {}, t3 && (i2.slot = t3);
    }
    !function(t3) {
      const e2 = t3.hook || (t3.hook = {});
      for (let t4 = 0; t4 < Jn.length; t4++) {
        const n2 = Jn[t4], o22 = e2[n2], r2 = Zn[n2];
        o22 === r2 || o22 && o22._merged || (e2[n2] = o22 ? Qn(r2, o22) : r2);
      }
    }(i2);
    const _2 = Gn(s2.options) || u2;
    return new at(`vue-component-${s2.cid}${_2 ? `-${_2}` : ""}`, i2, void 0, void 0, void 0, a2, { Ctor: s2, propsData: h22, listeners: m2, tag: u2, children: l2 }, p2);
  }
  function Qn(t3, e2) {
    const n2 = (n3, o22) => {
      t3(n3, o22), e2(n3, o22);
    };
    return n2._merged = true, n2;
  }
  let Yn = T;
  const to = U.optionMergeStrategies;
  function eo(t3, e2, n2 = true) {
    if (!e2) return t3;
    let o22, r2, s2;
    const i2 = rt ? Reflect.ownKeys(e2) : Object.keys(e2);
    for (let c2 = 0; c2 < i2.length; c2++) o22 = i2[c2], "__ob__" !== o22 && (r2 = t3[o22], s2 = e2[o22], n2 && g(t3, o22) ? r2 !== s2 && l(r2) && l(s2) && eo(r2, s2) : At(t3, o22, s2));
    return t3;
  }
  function no(t3, e2, n2) {
    return n2 ? function() {
      const o22 = i(e2) ? e2.call(n2, n2) : e2, r2 = i(t3) ? t3.call(n2, n2) : t3;
      return o22 ? eo(o22, r2) : r2;
    } : e2 ? t3 ? function() {
      return eo(i(e2) ? e2.call(this, this) : e2, i(t3) ? t3.call(this, this) : t3);
    } : e2 : t3;
  }
  function oo(t3, n2) {
    const o22 = n2 ? t3 ? t3.concat(n2) : e(n2) ? n2 : [n2] : t3;
    return o22 ? function(t4) {
      const e2 = [];
      for (let n3 = 0; n3 < t4.length; n3++) -1 === e2.indexOf(t4[n3]) && e2.push(t4[n3]);
      return e2;
    }(o22) : o22;
  }
  function ro(t3, e2, n2, o22) {
    const r2 = Object.create(t3 || null);
    return e2 ? j(r2, e2) : r2;
  }
  to.data = function(t3, e2, n2) {
    return n2 ? no(t3, e2, n2) : e2 && "function" != typeof e2 ? t3 : no(t3, e2);
  }, F.forEach((t3) => {
    to[t3] = oo;
  }), R.forEach(function(t3) {
    to[t3 + "s"] = ro;
  }), to.watch = function(t3, n2, o22, r2) {
    if (t3 === Q && (t3 = void 0), n2 === Q && (n2 = void 0), !n2) return Object.create(t3 || null);
    if (!t3) return n2;
    const s2 = {};
    j(s2, t3);
    for (const t4 in n2) {
      let o3 = s2[t4];
      const r3 = n2[t4];
      o3 && !e(o3) && (o3 = [o3]), s2[t4] = o3 ? o3.concat(r3) : e(r3) ? r3 : [r3];
    }
    return s2;
  }, to.props = to.methods = to.inject = to.computed = function(t3, e2, n2, o22) {
    if (!t3) return e2;
    const r2 = /* @__PURE__ */ Object.create(null);
    return j(r2, t3), e2 && j(r2, e2), r2;
  }, to.provide = function(t3, e2) {
    return t3 ? function() {
      const n2 = /* @__PURE__ */ Object.create(null);
      return eo(n2, i(t3) ? t3.call(this) : t3), e2 && eo(n2, i(e2) ? e2.call(this) : e2, false), n2;
    } : e2;
  };
  const so = function(t3, e2) {
    return void 0 === e2 ? t3 : e2;
  };
  function io(t3, n2, o22) {
    if (i(n2) && (n2 = n2.options), function(t4, n3) {
      const o3 = t4.props;
      if (!o3) return;
      const r3 = {};
      let s3, i2, c3;
      if (e(o3)) for (s3 = o3.length; s3--; ) i2 = o3[s3], "string" == typeof i2 && (c3 = w(i2), r3[c3] = { type: null });
      else if (l(o3)) for (const t5 in o3) i2 = o3[t5], c3 = w(t5), r3[c3] = l(i2) ? i2 : { type: i2 };
      t4.props = r3;
    }(n2), function(t4, n3) {
      const o3 = t4.inject;
      if (!o3) return;
      const r3 = t4.inject = {};
      if (e(o3)) for (let t5 = 0; t5 < o3.length; t5++) r3[o3[t5]] = { from: o3[t5] };
      else if (l(o3)) for (const t5 in o3) {
        const e2 = o3[t5];
        r3[t5] = l(e2) ? j({ from: t5 }, e2) : { from: e2 };
      }
    }(n2), function(t4) {
      const e2 = t4.directives;
      if (e2) for (const t5 in e2) {
        const n3 = e2[t5];
        i(n3) && (e2[t5] = { bind: n3, update: n3 });
      }
    }(n2), !n2._base && (n2.extends && (t3 = io(t3, n2.extends, o22)), n2.mixins)) for (let e2 = 0, r3 = n2.mixins.length; e2 < r3; e2++) t3 = io(t3, n2.mixins[e2], o22);
    const r2 = {};
    let s2;
    for (s2 in t3) c2(s2);
    for (s2 in n2) g(t3, s2) || c2(s2);
    function c2(e2) {
      const s3 = to[e2] || so;
      r2[e2] = s3(t3[e2], n2[e2], o22, e2);
    }
    return r2;
  }
  function co(t3, e2, n2, o22) {
    if ("string" != typeof n2) return;
    const r2 = t3[e2];
    if (g(r2, n2)) return r2[n2];
    const s2 = w(n2);
    if (g(r2, s2)) return r2[s2];
    const i2 = C(s2);
    if (g(r2, i2)) return r2[i2];
    return r2[n2] || r2[s2] || r2[i2];
  }
  function ao(t3, e2, n2, o22) {
    const r2 = e2[t3], s2 = !g(n2, t3);
    let c2 = n2[t3];
    const a2 = po(Boolean, r2.type);
    if (a2 > -1) {
      if (s2 && !g(r2, "default")) c2 = false;
      else if ("" === c2 || c2 === O(t3)) {
        const t4 = po(String, r2.type);
        (t4 < 0 || a2 < t4) && (c2 = true);
      }
    }
    if (void 0 === c2) {
      c2 = function(t4, e4, n3) {
        if (!g(e4, "default")) return;
        const o3 = e4.default;
        if (t4 && t4.$options.propsData && void 0 === t4.$options.propsData[n3] && void 0 !== t4._props[n3]) return t4._props[n3];
        return i(o3) && "Function" !== uo(e4.type) ? o3.call(t4) : o3;
      }(o22, r2, t3);
      const e3 = Ct;
      xt(true), St(c2), xt(e3);
    }
    return c2;
  }
  const lo = /^\s*function (\w+)/;
  function uo(t3) {
    const e2 = t3 && t3.toString().match(lo);
    return e2 ? e2[1] : "";
  }
  function fo(t3, e2) {
    return uo(t3) === uo(e2);
  }
  function po(t3, n2) {
    if (!e(n2)) return fo(n2, t3) ? 0 : -1;
    for (let e2 = 0, o22 = n2.length; e2 < o22; e2++) if (fo(n2[e2], t3)) return e2;
    return -1;
  }
  const ho = { enumerable: true, configurable: true, get: T, set: T };
  function mo(t3, e2, n2) {
    ho.get = function() {
      return this[e2][n2];
    }, ho.set = function(t4) {
      this[e2][n2] = t4;
    }, Object.defineProperty(t3, n2, ho);
  }
  function _o(t3) {
    const n2 = t3.$options;
    if (n2.props && function(t4, e2) {
      const n3 = t4.$options.propsData || {}, o22 = t4._props = Pt({}), r2 = t4.$options._propKeys = [], s2 = !t4.$parent;
      s2 || xt(false);
      for (const s3 in e2) {
        r2.push(s3);
        jt(o22, s3, ao(s3, e2, n3, t4), void 0, true), s3 in t4 || mo(t4, "_props", s3);
      }
      xt(true);
    }(t3, n2.props), function(t4) {
      const e2 = t4.$options, n3 = e2.setup;
      if (n3) {
        const o22 = t4._setupContext = Ie(t4);
        ct(t4), vt();
        const r2 = Ke(n3, null, [t4._props || Pt({}), o22], t4, "setup");
        if (yt(), ct(), i(r2)) e2.render = r2;
        else if (c(r2)) if (t4._setupState = r2, r2.__sfc) {
          const e3 = t4._setupProxy = {};
          for (const t5 in r2) "__sfc" !== t5 && Ut(e3, r2, t5);
        } else for (const e3 in r2) B(e3) || Ut(t4, r2, e3);
      }
    }(t3), n2.methods && function(t4, e2) {
      t4.$options.props;
      for (const n3 in e2) t4[n3] = "function" != typeof e2[n3] ? T : k(e2[n3], t4);
    }(t3, n2.methods), n2.data) !function(t4) {
      let e2 = t4.$options.data;
      e2 = t4._data = i(e2) ? function(t5, e3) {
        vt();
        try {
          return t5.call(e3, e3);
        } catch (t6) {
          return We(t6, e3, "data()"), {};
        } finally {
          yt();
        }
      }(e2, t4) : e2 || {}, l(e2) || (e2 = {});
      const n3 = Object.keys(e2), o22 = t4.$options.props;
      t4.$options.methods;
      let r2 = n3.length;
      for (; r2--; ) {
        const e3 = n3[r2];
        o22 && g(o22, e3) || B(e3) || mo(t4, "_data", e3);
      }
      const s2 = St(e2);
      s2 && s2.vmCount++;
    }(t3);
    else {
      const e2 = St(t3._data = {});
      e2 && e2.vmCount++;
    }
    n2.computed && function(t4, e2) {
      const n3 = t4._computedWatchers = /* @__PURE__ */ Object.create(null), o22 = et();
      for (const r2 in e2) {
        const s2 = e2[r2], c2 = i(s2) ? s2 : s2.get;
        o22 || (n3[r2] = new wn(t4, c2 || T, T, vo)), r2 in t4 || yo(t4, r2, s2);
      }
    }(t3, n2.computed), n2.watch && n2.watch !== Q && function(t4, n3) {
      for (const o22 in n3) {
        const r2 = n3[o22];
        if (e(r2)) for (let e2 = 0; e2 < r2.length; e2++) $o(t4, o22, r2[e2]);
        else $o(t4, o22, r2);
      }
    }(t3, n2.watch);
  }
  const vo = { lazy: true };
  function yo(t3, e2, n2) {
    const o22 = !et();
    i(n2) ? (ho.get = o22 ? go(e2) : bo(n2), ho.set = T) : (ho.get = n2.get ? o22 && false !== n2.cache ? go(e2) : bo(n2.get) : T, ho.set = n2.set || T), Object.defineProperty(t3, e2, ho);
  }
  function go(t3) {
    return function() {
      const e2 = this._computedWatchers && this._computedWatchers[t3];
      if (e2) return e2.dirty && e2.evaluate(), mt.target && e2.depend(), e2.value;
    };
  }
  function bo(t3) {
    return function() {
      return t3.call(this, this);
    };
  }
  function $o(t3, e2, n2, o22) {
    return l(n2) && (o22 = n2, n2 = n2.handler), "string" == typeof n2 && (n2 = t3[n2]), t3.$watch(e2, n2, o22);
  }
  let wo = 0;
  function Co(t3) {
    let e2 = t3.options;
    if (t3.super) {
      const n2 = Co(t3.super);
      if (n2 !== t3.superOptions) {
        t3.superOptions = n2;
        const o22 = function(t4) {
          let e3;
          const n3 = t4.options, o3 = t4.sealedOptions;
          for (const t5 in n3) n3[t5] !== o3[t5] && (e3 || (e3 = {}), e3[t5] = n3[t5]);
          return e3;
        }(t3);
        o22 && j(t3.extendOptions, o22), e2 = t3.options = io(n2, t3.extendOptions), e2.name && (e2.components[e2.name] = t3);
      }
    }
    return e2;
  }
  function xo(t3) {
    this._init(t3);
  }
  function Oo(t3) {
    t3.cid = 0;
    let e2 = 1;
    t3.extend = function(t4) {
      t4 = t4 || {};
      const n2 = this, o22 = n2.cid, r2 = t4._Ctor || (t4._Ctor = {});
      if (r2[o22]) return r2[o22];
      const s2 = Gn(t4) || Gn(n2.options), i2 = function(t5) {
        this._init(t5);
      };
      return (i2.prototype = Object.create(n2.prototype)).constructor = i2, i2.cid = e2++, i2.options = io(n2.options, t4), i2.super = n2, i2.options.props && function(t5) {
        const e3 = t5.options.props;
        for (const n3 in e3) mo(t5.prototype, "_props", n3);
      }(i2), i2.options.computed && function(t5) {
        const e3 = t5.options.computed;
        for (const n3 in e3) yo(t5.prototype, n3, e3[n3]);
      }(i2), i2.extend = n2.extend, i2.mixin = n2.mixin, i2.use = n2.use, R.forEach(function(t5) {
        i2[t5] = n2[t5];
      }), s2 && (i2.options.components[s2] = i2), i2.superOptions = n2.options, i2.extendOptions = t4, i2.sealedOptions = j({}, i2.options), r2[o22] = i2, i2;
    };
  }
  function ko(t3) {
    return t3 && (Gn(t3.Ctor.options) || t3.tag);
  }
  function So(t3, n2) {
    return e(t3) ? t3.indexOf(n2) > -1 : "string" == typeof t3 ? t3.split(",").indexOf(n2) > -1 : (o22 = t3, "[object RegExp]" === a.call(o22) && t3.test(n2));
    var o22;
  }
  function jo(t3, e2) {
    const { cache: n2, keys: o22, _vnode: r2, $vnode: s2 } = t3;
    for (const t4 in n2) {
      const s3 = n2[t4];
      if (s3) {
        const i2 = s3.name;
        i2 && !e2(i2) && Ao(n2, t4, o22, r2);
      }
    }
    s2.componentOptions.children = void 0;
  }
  function Ao(t3, e2, n2, o22) {
    const r2 = t3[e2];
    !r2 || o22 && r2.tag === o22.tag || r2.componentInstance.$destroy(), t3[e2] = null, v(n2, e2);
  }
  !function(e2) {
    e2.prototype._init = function(e3) {
      const n2 = this;
      n2._uid = wo++, n2._isVue = true, n2.__v_skip = true, n2._scope = new ee(true), n2._scope.parent = void 0, n2._scope._vm = true, e3 && e3._isComponent ? function(t3, e4) {
        const n3 = t3.$options = Object.create(t3.constructor.options), o22 = e4._parentVnode;
        n3.parent = e4.parent, n3._parentVnode = o22;
        const r2 = o22.componentOptions;
        n3.propsData = r2.propsData, n3._parentListeners = r2.listeners, n3._renderChildren = r2.children, n3._componentTag = r2.tag, e4.render && (n3.render = e4.render, n3.staticRenderFns = e4.staticRenderFns);
      }(n2, e3) : n2.$options = io(Co(n2.constructor), e3 || {}, n2), n2._renderProxy = n2, n2._self = n2, function(t3) {
        const e4 = t3.$options;
        let n3 = e4.parent;
        if (n3 && !e4.abstract) {
          for (; n3.$options.abstract && n3.$parent; ) n3 = n3.$parent;
          n3.$children.push(t3);
        }
        t3.$parent = n3, t3.$root = n3 ? n3.$root : t3, t3.$children = [], t3.$refs = {}, t3._provided = n3 ? n3._provided : /* @__PURE__ */ Object.create(null), t3._watcher = null, t3._inactive = null, t3._directInactive = false, t3._isMounted = false, t3._isDestroyed = false, t3._isBeingDestroyed = false;
      }(n2), function(t3) {
        t3._events = /* @__PURE__ */ Object.create(null), t3._hasHookEvent = false;
        const e4 = t3.$options._parentListeners;
        e4 && kn(t3, e4);
      }(n2), function(e4) {
        e4._vnode = null, e4._staticTrees = null;
        const n3 = e4.$options, o22 = e4.$vnode = n3._parentVnode, r2 = o22 && o22.context;
        e4.$slots = Se(n3._renderChildren, r2), e4.$scopedSlots = o22 ? Te(e4.$parent, o22.data.scopedSlots, e4.$slots) : t, e4._c = (t3, n4, o3, r3) => ze(e4, t3, n4, o3, r3, false), e4.$createElement = (t3, n4, o3, r3) => ze(e4, t3, n4, o3, r3, true);
        const s2 = o22 && o22.data;
        jt(e4, "$attrs", s2 && s2.attrs || t, null, true), jt(e4, "$listeners", n3._parentListeners || t, null, true);
      }(n2), Pn(n2, "beforeCreate", void 0, false), function(t3) {
        const e4 = Hn(t3.$options.inject, t3);
        e4 && (xt(false), Object.keys(e4).forEach((n3) => {
          jt(t3, n3, e4[n3]);
        }), xt(true));
      }(n2), _o(n2), function(t3) {
        const e4 = t3.$options.provide;
        if (e4) {
          const n3 = i(e4) ? e4.call(t3) : e4;
          if (!c(n3)) return;
          const o22 = oe(t3), r2 = rt ? Reflect.ownKeys(n3) : Object.keys(n3);
          for (let t4 = 0; t4 < r2.length; t4++) {
            const e5 = r2[t4];
            Object.defineProperty(o22, e5, Object.getOwnPropertyDescriptor(n3, e5));
          }
        }
      }(n2), Pn(n2, "created"), n2.$options.el && n2.$mount(n2.$options.el);
    };
  }(xo), function(t3) {
    const e2 = { get: function() {
      return this._data;
    } }, n2 = { get: function() {
      return this._props;
    } };
    Object.defineProperty(t3.prototype, "$data", e2), Object.defineProperty(t3.prototype, "$props", n2), t3.prototype.$set = At, t3.prototype.$delete = Tt, t3.prototype.$watch = function(t4, e3, n3) {
      const o22 = this;
      if (l(e3)) return $o(o22, t4, e3, n3);
      (n3 = n3 || {}).user = true;
      const r2 = new wn(o22, t4, e3, n3);
      if (n3.immediate) {
        const t5 = `callback for immediate watcher "${r2.expression}"`;
        vt(), Ke(e3, o22, [r2.value], o22, t5), yt();
      }
      return function() {
        r2.teardown();
      };
    };
  }(xo), function(t3) {
    const n2 = /^hook:/;
    t3.prototype.$on = function(t4, o22) {
      const r2 = this;
      if (e(t4)) for (let e2 = 0, n3 = t4.length; e2 < n3; e2++) r2.$on(t4[e2], o22);
      else (r2._events[t4] || (r2._events[t4] = [])).push(o22), n2.test(t4) && (r2._hasHookEvent = true);
      return r2;
    }, t3.prototype.$once = function(t4, e2) {
      const n3 = this;
      function o22() {
        n3.$off(t4, o22), e2.apply(n3, arguments);
      }
      return o22.fn = e2, n3.$on(t4, o22), n3;
    }, t3.prototype.$off = function(t4, n3) {
      const o22 = this;
      if (!arguments.length) return o22._events = /* @__PURE__ */ Object.create(null), o22;
      if (e(t4)) {
        for (let e2 = 0, r3 = t4.length; e2 < r3; e2++) o22.$off(t4[e2], n3);
        return o22;
      }
      const r2 = o22._events[t4];
      if (!r2) return o22;
      if (!n3) return o22._events[t4] = null, o22;
      let s2, i2 = r2.length;
      for (; i2--; ) if (s2 = r2[i2], s2 === n3 || s2.fn === n3) {
        r2.splice(i2, 1);
        break;
      }
      return o22;
    }, t3.prototype.$emit = function(t4) {
      const e2 = this;
      let n3 = e2._events[t4];
      if (n3) {
        n3 = n3.length > 1 ? S(n3) : n3;
        const o22 = S(arguments, 1), r2 = `event handler for "${t4}"`;
        for (let t5 = 0, s2 = n3.length; t5 < s2; t5++) Ke(n3[t5], e2, o22, e2, r2);
      }
      return e2;
    };
  }(xo), function(t3) {
    t3.prototype._update = function(t4, e2) {
      const n2 = this, o22 = n2.$el, r2 = n2._vnode, s2 = jn(n2);
      n2._vnode = t4, n2.$el = r2 ? n2.__patch__(r2, t4) : n2.__patch__(n2.$el, t4, e2, false), s2(), o22 && (o22.__vue__ = null), n2.$el && (n2.$el.__vue__ = n2);
      let i2 = n2;
      for (; i2 && i2.$vnode && i2.$parent && i2.$vnode === i2.$parent._vnode; ) i2.$parent.$el = i2.$el, i2 = i2.$parent;
    }, t3.prototype.$forceUpdate = function() {
      const t4 = this;
      t4._watcher && t4._watcher.update();
    }, t3.prototype.$destroy = function() {
      const t4 = this;
      if (t4._isBeingDestroyed) return;
      Pn(t4, "beforeDestroy"), t4._isBeingDestroyed = true;
      const e2 = t4.$parent;
      !e2 || e2._isBeingDestroyed || t4.$options.abstract || v(e2.$children, t4), t4._scope.stop(), t4._data.__ob__ && t4._data.__ob__.vmCount--, t4._isDestroyed = true, t4.__patch__(t4._vnode, null), Pn(t4, "destroyed"), t4.$off(), t4.$el && (t4.$el.__vue__ = null), t4.$vnode && (t4.$vnode.parent = null);
    };
  }(xo), function(t3) {
    ke(t3.prototype), t3.prototype.$nextTick = function(t4) {
      return tn(t4, this);
    }, t3.prototype._render = function() {
      const t4 = this, { render: n2, _parentVnode: o22 } = t4.$options;
      o22 && t4._isMounted && (t4.$scopedSlots = Te(t4.$parent, o22.data.scopedSlots, t4.$slots, t4.$scopedSlots), t4._slotsProxy && Me(t4._slotsProxy, t4.$scopedSlots)), t4.$vnode = o22;
      const r2 = it, s2 = Re;
      let i2;
      try {
        ct(t4), Re = t4, i2 = n2.call(t4._renderProxy, t4.$createElement);
      } catch (e2) {
        We(e2, t4, "render"), i2 = t4._vnode;
      } finally {
        Re = s2, ct(r2);
      }
      return e(i2) && 1 === i2.length && (i2 = i2[0]), i2 instanceof at || (i2 = lt()), i2.parent = o22, i2;
    };
  }(xo);
  const To = [String, RegExp, Array];
  var Eo = { KeepAlive: { name: "keep-alive", abstract: true, props: { include: To, exclude: To, max: [String, Number] }, methods: { cacheVNode() {
    const { cache: t3, keys: e2, vnodeToCache: n2, keyToCache: o22 } = this;
    if (n2) {
      const { tag: r2, componentInstance: s2, componentOptions: i2 } = n2;
      t3[o22] = { name: ko(i2), tag: r2, componentInstance: s2 }, e2.push(o22), this.max && e2.length > parseInt(this.max) && Ao(t3, e2[0], e2, this._vnode), this.vnodeToCache = null;
    }
  } }, created() {
    this.cache = /* @__PURE__ */ Object.create(null), this.keys = [];
  }, destroyed() {
    for (const t3 in this.cache) Ao(this.cache, t3, this.keys);
  }, mounted() {
    this.cacheVNode(), this.$watch("include", (t3) => {
      jo(this, (e2) => So(t3, e2));
    }), this.$watch("exclude", (t3) => {
      jo(this, (e2) => !So(t3, e2));
    });
  }, updated() {
    this.cacheVNode();
  }, render() {
    const t3 = this.$slots.default, e2 = Ue(t3), n2 = e2 && e2.componentOptions;
    if (n2) {
      const t4 = ko(n2), { include: o22, exclude: r2 } = this;
      if (o22 && (!t4 || !So(o22, t4)) || r2 && t4 && So(r2, t4)) return e2;
      const { cache: s2, keys: i2 } = this, c2 = null == e2.key ? n2.Ctor.cid + (n2.tag ? `::${n2.tag}` : "") : e2.key;
      s2[c2] ? (e2.componentInstance = s2[c2].componentInstance, v(i2, c2), i2.push(c2)) : (this.vnodeToCache = e2, this.keyToCache = c2), e2.data.keepAlive = true;
    }
    return e2 || t3 && t3[0];
  } } };
  !function(t3) {
    const e2 = { get: () => U };
    Object.defineProperty(t3, "config", e2), t3.util = { warn: Yn, extend: j, mergeOptions: io, defineReactive: jt }, t3.set = At, t3.delete = Tt, t3.nextTick = tn, t3.observable = (t4) => (St(t4), t4), t3.options = /* @__PURE__ */ Object.create(null), R.forEach((e3) => {
      t3.options[e3 + "s"] = /* @__PURE__ */ Object.create(null);
    }), t3.options._base = t3, j(t3.options.components, Eo), function(t4) {
      t4.use = function(t5) {
        const e3 = this._installedPlugins || (this._installedPlugins = []);
        if (e3.indexOf(t5) > -1) return this;
        const n2 = S(arguments, 1);
        return n2.unshift(this), i(t5.install) ? t5.install.apply(t5, n2) : i(t5) && t5.apply(null, n2), e3.push(t5), this;
      };
    }(t3), function(t4) {
      t4.mixin = function(t5) {
        return this.options = io(this.options, t5), this;
      };
    }(t3), Oo(t3), function(t4) {
      R.forEach((e3) => {
        t4[e3] = function(t5, n2) {
          return n2 ? ("component" === e3 && l(n2) && (n2.name = n2.name || t5, n2 = this.options._base.extend(n2)), "directive" === e3 && i(n2) && (n2 = { bind: n2, update: n2 }), this.options[e3 + "s"][t5] = n2, n2) : this.options[e3 + "s"][t5];
        };
      });
    }(t3);
  }(xo), Object.defineProperty(xo.prototype, "$isServer", { get: et }), Object.defineProperty(xo.prototype, "$ssrContext", { get() {
    return this.$vnode && this.$vnode.ssrContext;
  } }), Object.defineProperty(xo, "FunctionalRenderContext", { value: Wn }), xo.version = mn;
  const Po = m("style,class"), Io = m("input,textarea,option,select,progress"), Do = m("contenteditable,draggable,spellcheck"), No = m("events,caret,typing,plaintext-only"), Mo = (t3, e2) => Bo(e2) || "false" === e2 ? "false" : "contenteditable" === t3 && No(e2) ? e2 : "true", Lo = m("allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,defaultchecked,defaultmuted,defaultselected,defer,disabled,enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,truespeed,typemustmatch,visible"), Ro = "http://www.w3.org/1999/xlink", Fo = (t3) => ":" === t3.charAt(5) && "xlink" === t3.slice(0, 5), Uo = (t3) => Fo(t3) ? t3.slice(6, t3.length) : "", Bo = (t3) => null == t3 || false === t3;
  function Vo(t3) {
    let e2 = t3.data, n2 = t3, r2 = t3;
    for (; o2(r2.componentInstance); ) r2 = r2.componentInstance._vnode, r2 && r2.data && (e2 = zo(r2.data, e2));
    for (; o2(n2 = n2.parent); ) n2 && n2.data && (e2 = zo(e2, n2.data));
    return function(t4, e3) {
      if (o2(t4) || o2(e3)) return Ho(t4, Wo(e3));
      return "";
    }(e2.staticClass, e2.class);
  }
  function zo(t3, e2) {
    return { staticClass: Ho(t3.staticClass, e2.staticClass), class: o2(t3.class) ? [t3.class, e2.class] : e2.class };
  }
  function Ho(t3, e2) {
    return t3 ? e2 ? t3 + " " + e2 : t3 : e2 || "";
  }
  function Wo(t3) {
    return Array.isArray(t3) ? function(t4) {
      let e2, n2 = "";
      for (let r2 = 0, s2 = t4.length; r2 < s2; r2++) o2(e2 = Wo(t4[r2])) && "" !== e2 && (n2 && (n2 += " "), n2 += e2);
      return n2;
    }(t3) : c(t3) ? function(t4) {
      let e2 = "";
      for (const n2 in t4) t4[n2] && (e2 && (e2 += " "), e2 += n2);
      return e2;
    }(t3) : "string" == typeof t3 ? t3 : "";
  }
  const Ko = { svg: "http://www.w3.org/2000/svg", math: "http://www.w3.org/1998/Math/MathML" }, qo = m("html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,menuitem,summary,content,element,shadow,template,blockquote,iframe,tfoot"), Go = m("svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view", true), Zo = (t3) => qo(t3) || Go(t3);
  const Jo = /* @__PURE__ */ Object.create(null);
  const Xo = m("text,number,password,search,email,tel,url");
  var Qo = Object.freeze({ __proto__: null, createElement: function(t3, e2) {
    const n2 = document.createElement(t3);
    return "select" !== t3 || e2.data && e2.data.attrs && void 0 !== e2.data.attrs.multiple && n2.setAttribute("multiple", "multiple"), n2;
  }, createElementNS: function(t3, e2) {
    return document.createElementNS(Ko[t3], e2);
  }, createTextNode: function(t3) {
    return document.createTextNode(t3);
  }, createComment: function(t3) {
    return document.createComment(t3);
  }, insertBefore: function(t3, e2, n2) {
    t3.insertBefore(e2, n2);
  }, removeChild: function(t3, e2) {
    t3.removeChild(e2);
  }, appendChild: function(t3, e2) {
    t3.appendChild(e2);
  }, parentNode: function(t3) {
    return t3.parentNode;
  }, nextSibling: function(t3) {
    return t3.nextSibling;
  }, tagName: function(t3) {
    return t3.tagName;
  }, setTextContent: function(t3, e2) {
    t3.textContent = e2;
  }, setStyleScope: function(t3, e2) {
    t3.setAttribute(e2, "");
  } }), Yo = { create(t3, e2) {
    tr(e2);
  }, update(t3, e2) {
    t3.data.ref !== e2.data.ref && (tr(t3, true), tr(e2));
  }, destroy(t3) {
    tr(t3, true);
  } };
  function tr(t3, n2) {
    const r2 = t3.data.ref;
    if (!o2(r2)) return;
    const s2 = t3.context, c2 = t3.componentInstance || t3.elm, a2 = n2 ? null : c2, l2 = n2 ? void 0 : c2;
    if (i(r2)) return void Ke(r2, s2, [a2], s2, "template ref function");
    const u2 = t3.data.refInFor, f2 = "string" == typeof r2 || "number" == typeof r2, d2 = Rt(r2), p2 = s2.$refs;
    if (f2 || d2) {
      if (u2) {
        const t4 = f2 ? p2[r2] : r2.value;
        n2 ? e(t4) && v(t4, c2) : e(t4) ? t4.includes(c2) || t4.push(c2) : f2 ? (p2[r2] = [c2], er(s2, r2, p2[r2])) : r2.value = [c2];
      } else if (f2) {
        if (n2 && p2[r2] !== c2) return;
        p2[r2] = l2, er(s2, r2, a2);
      } else if (d2) {
        if (n2 && r2.value !== c2) return;
        r2.value = a2;
      }
    }
  }
  function er({ _setupState: t3 }, e2, n2) {
    t3 && g(t3, e2) && (Rt(t3[e2]) ? t3[e2].value = n2 : t3[e2] = n2);
  }
  const nr = new at("", {}, []), or = ["create", "activate", "update", "remove", "destroy"];
  function rr(t3, e2) {
    return t3.key === e2.key && t3.asyncFactory === e2.asyncFactory && (t3.tag === e2.tag && t3.isComment === e2.isComment && o2(t3.data) === o2(e2.data) && function(t4, e3) {
      if ("input" !== t4.tag) return true;
      let n2;
      const r2 = o2(n2 = t4.data) && o2(n2 = n2.attrs) && n2.type, s2 = o2(n2 = e3.data) && o2(n2 = n2.attrs) && n2.type;
      return r2 === s2 || Xo(r2) && Xo(s2);
    }(t3, e2) || r(t3.isAsyncPlaceholder) && n(e2.asyncFactory.error));
  }
  function sr(t3, e2, n2) {
    let r2, s2;
    const i2 = {};
    for (r2 = e2; r2 <= n2; ++r2) s2 = t3[r2].key, o2(s2) && (i2[s2] = r2);
    return i2;
  }
  var ir = { create: cr, update: cr, destroy: function(t3) {
    cr(t3, nr);
  } };
  function cr(t3, e2) {
    (t3.data.directives || e2.data.directives) && function(t4, e3) {
      const n2 = t4 === nr, o22 = e3 === nr, r2 = lr(t4.data.directives, t4.context), s2 = lr(e3.data.directives, e3.context), i2 = [], c2 = [];
      let a2, l2, u2;
      for (a2 in s2) l2 = r2[a2], u2 = s2[a2], l2 ? (u2.oldValue = l2.value, u2.oldArg = l2.arg, fr(u2, "update", e3, t4), u2.def && u2.def.componentUpdated && c2.push(u2)) : (fr(u2, "bind", e3, t4), u2.def && u2.def.inserted && i2.push(u2));
      if (i2.length) {
        const o3 = () => {
          for (let n3 = 0; n3 < i2.length; n3++) fr(i2[n3], "inserted", e3, t4);
        };
        n2 ? ce(e3, "insert", o3) : o3();
      }
      c2.length && ce(e3, "postpatch", () => {
        for (let n3 = 0; n3 < c2.length; n3++) fr(c2[n3], "componentUpdated", e3, t4);
      });
      if (!n2) for (a2 in r2) s2[a2] || fr(r2[a2], "unbind", t4, t4, o22);
    }(t3, e2);
  }
  const ar = /* @__PURE__ */ Object.create(null);
  function lr(t3, e2) {
    const n2 = /* @__PURE__ */ Object.create(null);
    if (!t3) return n2;
    let o22, r2;
    for (o22 = 0; o22 < t3.length; o22++) {
      if (r2 = t3[o22], r2.modifiers || (r2.modifiers = ar), n2[ur(r2)] = r2, e2._setupState && e2._setupState.__sfc) {
        const t4 = r2.def || co(e2, "_setupState", "v-" + r2.name);
        r2.def = "function" == typeof t4 ? { bind: t4, update: t4 } : t4;
      }
      r2.def = r2.def || co(e2.$options, "directives", r2.name);
    }
    return n2;
  }
  function ur(t3) {
    return t3.rawName || `${t3.name}.${Object.keys(t3.modifiers || {}).join(".")}`;
  }
  function fr(t3, e2, n2, o22, r2) {
    const s2 = t3.def && t3.def[e2];
    if (s2) try {
      s2(n2.elm, t3, n2, o22, r2);
    } catch (o3) {
      We(o3, n2.context, `directive ${t3.name} ${e2} hook`);
    }
  }
  var dr = [Yo, ir];
  function pr(t3, e2) {
    const s2 = e2.componentOptions;
    if (o2(s2) && false === s2.Ctor.options.inheritAttrs) return;
    if (n(t3.data.attrs) && n(e2.data.attrs)) return;
    let i2, c2, a2;
    const l2 = e2.elm, u2 = t3.data.attrs || {};
    let f2 = e2.data.attrs || {};
    for (i2 in (o2(f2.__ob__) || r(f2._v_attr_proxy)) && (f2 = e2.data.attrs = j({}, f2)), f2) c2 = f2[i2], a2 = u2[i2], a2 !== c2 && hr(l2, i2, c2, e2.data.pre);
    for (i2 in (q || Z) && f2.value !== u2.value && hr(l2, "value", f2.value), u2) n(f2[i2]) && (Fo(i2) ? l2.removeAttributeNS(Ro, Uo(i2)) : Do(i2) || l2.removeAttribute(i2));
  }
  function hr(t3, e2, n2, o22) {
    o22 || t3.tagName.indexOf("-") > -1 ? mr(t3, e2, n2) : Lo(e2) ? Bo(n2) ? t3.removeAttribute(e2) : (n2 = "allowfullscreen" === e2 && "EMBED" === t3.tagName ? "true" : e2, t3.setAttribute(e2, n2)) : Do(e2) ? t3.setAttribute(e2, Mo(e2, n2)) : Fo(e2) ? Bo(n2) ? t3.removeAttributeNS(Ro, Uo(e2)) : t3.setAttributeNS(Ro, e2, n2) : mr(t3, e2, n2);
  }
  function mr(t3, e2, n2) {
    if (Bo(n2)) t3.removeAttribute(e2);
    else {
      if (q && !G && "TEXTAREA" === t3.tagName && "placeholder" === e2 && "" !== n2 && !t3.__ieph) {
        const e3 = (n3) => {
          n3.stopImmediatePropagation(), t3.removeEventListener("input", e3);
        };
        t3.addEventListener("input", e3), t3.__ieph = true;
      }
      t3.setAttribute(e2, n2);
    }
  }
  var _r = { create: pr, update: pr };
  function vr(t3, e2) {
    const r2 = e2.elm, s2 = e2.data, i2 = t3.data;
    if (n(s2.staticClass) && n(s2.class) && (n(i2) || n(i2.staticClass) && n(i2.class))) return;
    let c2 = Vo(e2);
    const a2 = r2._transitionClasses;
    o2(a2) && (c2 = Ho(c2, Wo(a2))), c2 !== r2._prevClass && (r2.setAttribute("class", c2), r2._prevClass = c2);
  }
  var yr = { create: vr, update: vr };
  const gr = "__r", br = "__c";
  let $r;
  function wr(t3, e2, n2) {
    const o22 = $r;
    return function r2() {
      null !== e2.apply(null, arguments) && Or(t3, r2, n2, o22);
    };
  }
  const Cr = Ze && !(X && Number(X[1]) <= 53);
  function xr(t3, e2, n2, o22) {
    if (Cr) {
      const t4 = Fn, n3 = e2;
      e2 = n3._wrapper = function(e3) {
        if (e3.target === e3.currentTarget || e3.timeStamp >= t4 || e3.timeStamp <= 0 || e3.target.ownerDocument !== document) return n3.apply(this, arguments);
      };
    }
    $r.addEventListener(t3, e2, tt ? { capture: n2, passive: o22 } : n2);
  }
  function Or(t3, e2, n2, o22) {
    (o22 || $r).removeEventListener(t3, e2._wrapper || e2, n2);
  }
  function kr(t3, e2) {
    if (n(t3.data.on) && n(e2.data.on)) return;
    const r2 = e2.data.on || {}, s2 = t3.data.on || {};
    $r = e2.elm || t3.elm, function(t4) {
      if (o2(t4[gr])) {
        const e3 = q ? "change" : "input";
        t4[e3] = [].concat(t4[gr], t4[e3] || []), delete t4[gr];
      }
      o2(t4[br]) && (t4.change = [].concat(t4[br], t4.change || []), delete t4[br]);
    }(r2), ie(r2, s2, xr, Or, wr, e2.context), $r = void 0;
  }
  var Sr = { create: kr, update: kr, destroy: (t3) => kr(t3, nr) };
  let jr;
  function Ar(t3, e2) {
    if (n(t3.data.domProps) && n(e2.data.domProps)) return;
    let s2, i2;
    const c2 = e2.elm, a2 = t3.data.domProps || {};
    let l2 = e2.data.domProps || {};
    for (s2 in (o2(l2.__ob__) || r(l2._v_attr_proxy)) && (l2 = e2.data.domProps = j({}, l2)), a2) s2 in l2 || (c2[s2] = "");
    for (s2 in l2) {
      if (i2 = l2[s2], "textContent" === s2 || "innerHTML" === s2) {
        if (e2.children && (e2.children.length = 0), i2 === a2[s2]) continue;
        1 === c2.childNodes.length && c2.removeChild(c2.childNodes[0]);
      }
      if ("value" === s2 && "PROGRESS" !== c2.tagName) {
        c2._value = i2;
        const t4 = n(i2) ? "" : String(i2);
        Tr(c2, t4) && (c2.value = t4);
      } else if ("innerHTML" === s2 && Go(c2.tagName) && n(c2.innerHTML)) {
        jr = jr || document.createElement("div"), jr.innerHTML = `<svg>${i2}</svg>`;
        const t4 = jr.firstChild;
        for (; c2.firstChild; ) c2.removeChild(c2.firstChild);
        for (; t4.firstChild; ) c2.appendChild(t4.firstChild);
      } else if (i2 !== a2[s2]) try {
        c2[s2] = i2;
      } catch (t4) {
      }
    }
  }
  function Tr(t3, e2) {
    return !t3.composing && ("OPTION" === t3.tagName || function(t4, e3) {
      let n2 = true;
      try {
        n2 = document.activeElement !== t4;
      } catch (t5) {
      }
      return n2 && t4.value !== e3;
    }(t3, e2) || function(t4, e3) {
      const n2 = t4.value, r2 = t4._vModifiers;
      if (o2(r2)) {
        if (r2.number) return h2(n2) !== h2(e3);
        if (r2.trim) return n2.trim() !== e3.trim();
      }
      return n2 !== e3;
    }(t3, e2));
  }
  var Er = { create: Ar, update: Ar };
  const Pr = b(function(t3) {
    const e2 = {}, n2 = /:(.+)/;
    return t3.split(/;(?![^(]*\))/g).forEach(function(t4) {
      if (t4) {
        const o22 = t4.split(n2);
        o22.length > 1 && (e2[o22[0].trim()] = o22[1].trim());
      }
    }), e2;
  });
  function Ir(t3) {
    const e2 = Dr(t3.style);
    return t3.staticStyle ? j(t3.staticStyle, e2) : e2;
  }
  function Dr(t3) {
    return Array.isArray(t3) ? A(t3) : "string" == typeof t3 ? Pr(t3) : t3;
  }
  const Nr = /^--/, Mr = /\s*!important$/, Lr = (t3, e2, n2) => {
    if (Nr.test(e2)) t3.style.setProperty(e2, n2);
    else if (Mr.test(n2)) t3.style.setProperty(O(e2), n2.replace(Mr, ""), "important");
    else {
      const o22 = Ur(e2);
      if (Array.isArray(n2)) for (let e3 = 0, r2 = n2.length; e3 < r2; e3++) t3.style[o22] = n2[e3];
      else t3.style[o22] = n2;
    }
  }, Rr = ["Webkit", "Moz", "ms"];
  let Fr;
  const Ur = b(function(t3) {
    if (Fr = Fr || document.createElement("div").style, "filter" !== (t3 = w(t3)) && t3 in Fr) return t3;
    const e2 = t3.charAt(0).toUpperCase() + t3.slice(1);
    for (let t4 = 0; t4 < Rr.length; t4++) {
      const n2 = Rr[t4] + e2;
      if (n2 in Fr) return n2;
    }
  });
  function Br(t3, e2) {
    const r2 = e2.data, s2 = t3.data;
    if (n(r2.staticStyle) && n(r2.style) && n(s2.staticStyle) && n(s2.style)) return;
    let i2, c2;
    const a2 = e2.elm, l2 = s2.staticStyle, u2 = s2.normalizedStyle || s2.style || {}, f2 = l2 || u2, d2 = Dr(e2.data.style) || {};
    e2.data.normalizedStyle = o2(d2.__ob__) ? j({}, d2) : d2;
    const p2 = function(t4, e3) {
      const n2 = {};
      let o22;
      {
        let e4 = t4;
        for (; e4.componentInstance; ) e4 = e4.componentInstance._vnode, e4 && e4.data && (o22 = Ir(e4.data)) && j(n2, o22);
      }
      (o22 = Ir(t4.data)) && j(n2, o22);
      let r3 = t4;
      for (; r3 = r3.parent; ) r3.data && (o22 = Ir(r3.data)) && j(n2, o22);
      return n2;
    }(e2);
    for (c2 in f2) n(p2[c2]) && Lr(a2, c2, "");
    for (c2 in p2) i2 = p2[c2], Lr(a2, c2, null == i2 ? "" : i2);
  }
  var Vr = { create: Br, update: Br };
  const zr = /\s+/;
  function Hr(t3, e2) {
    if (e2 && (e2 = e2.trim())) if (t3.classList) e2.indexOf(" ") > -1 ? e2.split(zr).forEach((e3) => t3.classList.add(e3)) : t3.classList.add(e2);
    else {
      const n2 = ` ${t3.getAttribute("class") || ""} `;
      n2.indexOf(" " + e2 + " ") < 0 && t3.setAttribute("class", (n2 + e2).trim());
    }
  }
  function Wr(t3, e2) {
    if (e2 && (e2 = e2.trim())) if (t3.classList) e2.indexOf(" ") > -1 ? e2.split(zr).forEach((e3) => t3.classList.remove(e3)) : t3.classList.remove(e2), t3.classList.length || t3.removeAttribute("class");
    else {
      let n2 = ` ${t3.getAttribute("class") || ""} `;
      const o22 = " " + e2 + " ";
      for (; n2.indexOf(o22) >= 0; ) n2 = n2.replace(o22, " ");
      n2 = n2.trim(), n2 ? t3.setAttribute("class", n2) : t3.removeAttribute("class");
    }
  }
  function Kr(t3) {
    if (t3) {
      if ("object" == typeof t3) {
        const e2 = {};
        return false !== t3.css && j(e2, qr(t3.name || "v")), j(e2, t3), e2;
      }
      return "string" == typeof t3 ? qr(t3) : void 0;
    }
  }
  const qr = b((t3) => ({ enterClass: `${t3}-enter`, enterToClass: `${t3}-enter-to`, enterActiveClass: `${t3}-enter-active`, leaveClass: `${t3}-leave`, leaveToClass: `${t3}-leave-to`, leaveActiveClass: `${t3}-leave-active` })), Gr = W && !G, Zr = "transition", Jr = "animation";
  let Xr = "transition", Qr = "transitionend", Yr = "animation", ts = "animationend";
  Gr && (void 0 === window.ontransitionend && void 0 !== window.onwebkittransitionend && (Xr = "WebkitTransition", Qr = "webkitTransitionEnd"), void 0 === window.onanimationend && void 0 !== window.onwebkitanimationend && (Yr = "WebkitAnimation", ts = "webkitAnimationEnd"));
  const es2 = W ? window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout : (t3) => t3();
  function ns(t3) {
    es2(() => {
      es2(t3);
    });
  }
  function os2(t3, e2) {
    const n2 = t3._transitionClasses || (t3._transitionClasses = []);
    n2.indexOf(e2) < 0 && (n2.push(e2), Hr(t3, e2));
  }
  function rs(t3, e2) {
    t3._transitionClasses && v(t3._transitionClasses, e2), Wr(t3, e2);
  }
  function ss(t3, e2, n2) {
    const { type: o22, timeout: r2, propCount: s2 } = cs(t3, e2);
    if (!o22) return n2();
    const i2 = o22 === Zr ? Qr : ts;
    let c2 = 0;
    const a2 = () => {
      t3.removeEventListener(i2, l2), n2();
    }, l2 = (e3) => {
      e3.target === t3 && ++c2 >= s2 && a2();
    };
    setTimeout(() => {
      c2 < s2 && a2();
    }, r2 + 1), t3.addEventListener(i2, l2);
  }
  const is = /\b(transform|all)(,|$)/;
  function cs(t3, e2) {
    const n2 = window.getComputedStyle(t3), o22 = (n2[Xr + "Delay"] || "").split(", "), r2 = (n2[Xr + "Duration"] || "").split(", "), s2 = as(o22, r2), i2 = (n2[Yr + "Delay"] || "").split(", "), c2 = (n2[Yr + "Duration"] || "").split(", "), a2 = as(i2, c2);
    let l2, u2 = 0, f2 = 0;
    e2 === Zr ? s2 > 0 && (l2 = Zr, u2 = s2, f2 = r2.length) : e2 === Jr ? a2 > 0 && (l2 = Jr, u2 = a2, f2 = c2.length) : (u2 = Math.max(s2, a2), l2 = u2 > 0 ? s2 > a2 ? Zr : Jr : null, f2 = l2 ? l2 === Zr ? r2.length : c2.length : 0);
    return { type: l2, timeout: u2, propCount: f2, hasTransform: l2 === Zr && is.test(n2[Xr + "Property"]) };
  }
  function as(t3, e2) {
    for (; t3.length < e2.length; ) t3 = t3.concat(t3);
    return Math.max.apply(null, e2.map((e3, n2) => ls(e3) + ls(t3[n2])));
  }
  function ls(t3) {
    return 1e3 * Number(t3.slice(0, -1).replace(",", "."));
  }
  function us(t3, e2) {
    const r2 = t3.elm;
    o2(r2._leaveCb) && (r2._leaveCb.cancelled = true, r2._leaveCb());
    const s2 = Kr(t3.data.transition);
    if (n(s2)) return;
    if (o2(r2._enterCb) || 1 !== r2.nodeType) return;
    const { css: a2, type: l2, enterClass: u2, enterToClass: f2, enterActiveClass: d2, appearClass: p2, appearToClass: m2, appearActiveClass: _2, beforeEnter: v2, enter: y2, afterEnter: g2, enterCancelled: b2, beforeAppear: $2, appear: w2, afterAppear: C2, appearCancelled: x2, duration: O2 } = s2;
    let k2 = Sn, S2 = Sn.$vnode;
    for (; S2 && S2.parent; ) k2 = S2.context, S2 = S2.parent;
    const j2 = !k2._isMounted || !t3.isRootInsert;
    if (j2 && !w2 && "" !== w2) return;
    const A2 = j2 && p2 ? p2 : u2, T2 = j2 && _2 ? _2 : d2, E2 = j2 && m2 ? m2 : f2, P2 = j2 && $2 || v2, I2 = j2 && i(w2) ? w2 : y2, D2 = j2 && C2 || g2, M2 = j2 && x2 || b2, L2 = h2(c(O2) ? O2.enter : O2), R2 = false !== a2 && !G, F2 = ps(I2), U2 = r2._enterCb = N(() => {
      R2 && (rs(r2, E2), rs(r2, T2)), U2.cancelled ? (R2 && rs(r2, A2), M2 && M2(r2)) : D2 && D2(r2), r2._enterCb = null;
    });
    t3.data.show || ce(t3, "insert", () => {
      const e3 = r2.parentNode, n2 = e3 && e3._pending && e3._pending[t3.key];
      n2 && n2.tag === t3.tag && n2.elm._leaveCb && n2.elm._leaveCb(), I2 && I2(r2, U2);
    }), P2 && P2(r2), R2 && (os2(r2, A2), os2(r2, T2), ns(() => {
      rs(r2, A2), U2.cancelled || (os2(r2, E2), F2 || (ds(L2) ? setTimeout(U2, L2) : ss(r2, l2, U2)));
    })), t3.data.show && (e2 && e2(), I2 && I2(r2, U2)), R2 || F2 || U2();
  }
  function fs2(t3, e2) {
    const r2 = t3.elm;
    o2(r2._enterCb) && (r2._enterCb.cancelled = true, r2._enterCb());
    const s2 = Kr(t3.data.transition);
    if (n(s2) || 1 !== r2.nodeType) return e2();
    if (o2(r2._leaveCb)) return;
    const { css: i2, type: a2, leaveClass: l2, leaveToClass: u2, leaveActiveClass: f2, beforeLeave: d2, leave: p2, afterLeave: m2, leaveCancelled: _2, delayLeave: v2, duration: y2 } = s2, g2 = false !== i2 && !G, b2 = ps(p2), $2 = h2(c(y2) ? y2.leave : y2), w2 = r2._leaveCb = N(() => {
      r2.parentNode && r2.parentNode._pending && (r2.parentNode._pending[t3.key] = null), g2 && (rs(r2, u2), rs(r2, f2)), w2.cancelled ? (g2 && rs(r2, l2), _2 && _2(r2)) : (e2(), m2 && m2(r2)), r2._leaveCb = null;
    });
    function C2() {
      w2.cancelled || (!t3.data.show && r2.parentNode && ((r2.parentNode._pending || (r2.parentNode._pending = {}))[t3.key] = t3), d2 && d2(r2), g2 && (os2(r2, l2), os2(r2, f2), ns(() => {
        rs(r2, l2), w2.cancelled || (os2(r2, u2), b2 || (ds($2) ? setTimeout(w2, $2) : ss(r2, a2, w2)));
      })), p2 && p2(r2, w2), g2 || b2 || w2());
    }
    v2 ? v2(C2) : C2();
  }
  function ds(t3) {
    return "number" == typeof t3 && !isNaN(t3);
  }
  function ps(t3) {
    if (n(t3)) return false;
    const e2 = t3.fns;
    return o2(e2) ? ps(Array.isArray(e2) ? e2[0] : e2) : (t3._length || t3.length) > 1;
  }
  function hs(t3, e2) {
    true !== e2.data.show && us(e2);
  }
  const ms = function(t3) {
    let i2, c2;
    const a2 = {}, { modules: l2, nodeOps: u2 } = t3;
    for (i2 = 0; i2 < or.length; ++i2) for (a2[or[i2]] = [], c2 = 0; c2 < l2.length; ++c2) o2(l2[c2][or[i2]]) && a2[or[i2]].push(l2[c2][or[i2]]);
    function f2(t4) {
      const e2 = u2.parentNode(t4);
      o2(e2) && u2.removeChild(e2, t4);
    }
    function d2(t4, e2, n2, s2, i3, c3, l3) {
      if (o2(t4.elm) && o2(c3) && (t4 = c3[l3] = ft(t4)), t4.isRootInsert = !i3, function(t5, e3, n3, s3) {
        let i4 = t5.data;
        if (o2(i4)) {
          const c4 = o2(t5.componentInstance) && i4.keepAlive;
          if (o2(i4 = i4.hook) && o2(i4 = i4.init) && i4(t5, false), o2(t5.componentInstance)) return p2(t5, e3), h22(n3, t5.elm, s3), r(c4) && function(t6, e4, n4, r2) {
            let s4, i5 = t6;
            for (; i5.componentInstance; ) if (i5 = i5.componentInstance._vnode, o2(s4 = i5.data) && o2(s4 = s4.transition)) {
              for (s4 = 0; s4 < a2.activate.length; ++s4) a2.activate[s4](nr, i5);
              e4.push(i5);
              break;
            }
            h22(n4, t6.elm, r2);
          }(t5, e3, n3, s3), true;
        }
      }(t4, e2, n2, s2)) return;
      const f3 = t4.data, d3 = t4.children, m2 = t4.tag;
      o2(m2) ? (t4.elm = t4.ns ? u2.createElementNS(t4.ns, m2) : u2.createElement(m2, t4), g2(t4), _2(t4, d3, e2), o2(f3) && y2(t4, e2), h22(n2, t4.elm, s2)) : r(t4.isComment) ? (t4.elm = u2.createComment(t4.text), h22(n2, t4.elm, s2)) : (t4.elm = u2.createTextNode(t4.text), h22(n2, t4.elm, s2));
    }
    function p2(t4, e2) {
      o2(t4.data.pendingInsert) && (e2.push.apply(e2, t4.data.pendingInsert), t4.data.pendingInsert = null), t4.elm = t4.componentInstance.$el, v2(t4) ? (y2(t4, e2), g2(t4)) : (tr(t4), e2.push(t4));
    }
    function h22(t4, e2, n2) {
      o2(t4) && (o2(n2) ? u2.parentNode(n2) === t4 && u2.insertBefore(t4, e2, n2) : u2.appendChild(t4, e2));
    }
    function _2(t4, n2, o22) {
      if (e(n2)) for (let e2 = 0; e2 < n2.length; ++e2) d2(n2[e2], o22, t4.elm, null, true, n2, e2);
      else s(t4.text) && u2.appendChild(t4.elm, u2.createTextNode(String(t4.text)));
    }
    function v2(t4) {
      for (; t4.componentInstance; ) t4 = t4.componentInstance._vnode;
      return o2(t4.tag);
    }
    function y2(t4, e2) {
      for (let e3 = 0; e3 < a2.create.length; ++e3) a2.create[e3](nr, t4);
      i2 = t4.data.hook, o2(i2) && (o2(i2.create) && i2.create(nr, t4), o2(i2.insert) && e2.push(t4));
    }
    function g2(t4) {
      let e2;
      if (o2(e2 = t4.fnScopeId)) u2.setStyleScope(t4.elm, e2);
      else {
        let n2 = t4;
        for (; n2; ) o2(e2 = n2.context) && o2(e2 = e2.$options._scopeId) && u2.setStyleScope(t4.elm, e2), n2 = n2.parent;
      }
      o2(e2 = Sn) && e2 !== t4.context && e2 !== t4.fnContext && o2(e2 = e2.$options._scopeId) && u2.setStyleScope(t4.elm, e2);
    }
    function b2(t4, e2, n2, o22, r2, s2) {
      for (; o22 <= r2; ++o22) d2(n2[o22], s2, t4, e2, false, n2, o22);
    }
    function $2(t4) {
      let e2, n2;
      const r2 = t4.data;
      if (o2(r2)) for (o2(e2 = r2.hook) && o2(e2 = e2.destroy) && e2(t4), e2 = 0; e2 < a2.destroy.length; ++e2) a2.destroy[e2](t4);
      if (o2(e2 = t4.children)) for (n2 = 0; n2 < t4.children.length; ++n2) $2(t4.children[n2]);
    }
    function w2(t4, e2, n2) {
      for (; e2 <= n2; ++e2) {
        const n3 = t4[e2];
        o2(n3) && (o2(n3.tag) ? (C2(n3), $2(n3)) : f2(n3.elm));
      }
    }
    function C2(t4, e2) {
      if (o2(e2) || o2(t4.data)) {
        let n2;
        const r2 = a2.remove.length + 1;
        for (o2(e2) ? e2.listeners += r2 : e2 = function(t5, e3) {
          function n3() {
            0 == --n3.listeners && f2(t5);
          }
          return n3.listeners = e3, n3;
        }(t4.elm, r2), o2(n2 = t4.componentInstance) && o2(n2 = n2._vnode) && o2(n2.data) && C2(n2, e2), n2 = 0; n2 < a2.remove.length; ++n2) a2.remove[n2](t4, e2);
        o2(n2 = t4.data.hook) && o2(n2 = n2.remove) ? n2(t4, e2) : e2();
      } else f2(t4.elm);
    }
    function x2(t4, e2, n2, r2) {
      for (let s2 = n2; s2 < r2; s2++) {
        const n3 = e2[s2];
        if (o2(n3) && rr(t4, n3)) return s2;
      }
    }
    function O2(t4, e2, s2, i3, c3, l3) {
      if (t4 === e2) return;
      o2(e2.elm) && o2(i3) && (e2 = i3[c3] = ft(e2));
      const f3 = e2.elm = t4.elm;
      if (r(t4.isAsyncPlaceholder)) return void (o2(e2.asyncFactory.resolved) ? j2(t4.elm, e2, s2) : e2.isAsyncPlaceholder = true);
      if (r(e2.isStatic) && r(t4.isStatic) && e2.key === t4.key && (r(e2.isCloned) || r(e2.isOnce))) return void (e2.componentInstance = t4.componentInstance);
      let p3;
      const h3 = e2.data;
      o2(h3) && o2(p3 = h3.hook) && o2(p3 = p3.prepatch) && p3(t4, e2);
      const m2 = t4.children, _3 = e2.children;
      if (o2(h3) && v2(e2)) {
        for (p3 = 0; p3 < a2.update.length; ++p3) a2.update[p3](t4, e2);
        o2(p3 = h3.hook) && o2(p3 = p3.update) && p3(t4, e2);
      }
      n(e2.text) ? o2(m2) && o2(_3) ? m2 !== _3 && function(t5, e3, r2, s3, i4) {
        let c4, a3, l4, f4, p4 = 0, h4 = 0, m3 = e3.length - 1, _4 = e3[0], v3 = e3[m3], y3 = r2.length - 1, g3 = r2[0], $3 = r2[y3];
        const C3 = !i4;
        for (; p4 <= m3 && h4 <= y3; ) n(_4) ? _4 = e3[++p4] : n(v3) ? v3 = e3[--m3] : rr(_4, g3) ? (O2(_4, g3, s3, r2, h4), _4 = e3[++p4], g3 = r2[++h4]) : rr(v3, $3) ? (O2(v3, $3, s3, r2, y3), v3 = e3[--m3], $3 = r2[--y3]) : rr(_4, $3) ? (O2(_4, $3, s3, r2, y3), C3 && u2.insertBefore(t5, _4.elm, u2.nextSibling(v3.elm)), _4 = e3[++p4], $3 = r2[--y3]) : rr(v3, g3) ? (O2(v3, g3, s3, r2, h4), C3 && u2.insertBefore(t5, v3.elm, _4.elm), v3 = e3[--m3], g3 = r2[++h4]) : (n(c4) && (c4 = sr(e3, p4, m3)), a3 = o2(g3.key) ? c4[g3.key] : x2(g3, e3, p4, m3), n(a3) ? d2(g3, s3, t5, _4.elm, false, r2, h4) : (l4 = e3[a3], rr(l4, g3) ? (O2(l4, g3, s3, r2, h4), e3[a3] = void 0, C3 && u2.insertBefore(t5, l4.elm, _4.elm)) : d2(g3, s3, t5, _4.elm, false, r2, h4)), g3 = r2[++h4]);
        p4 > m3 ? (f4 = n(r2[y3 + 1]) ? null : r2[y3 + 1].elm, b2(t5, f4, r2, h4, y3, s3)) : h4 > y3 && w2(e3, p4, m3);
      }(f3, m2, _3, s2, l3) : o2(_3) ? (o2(t4.text) && u2.setTextContent(f3, ""), b2(f3, null, _3, 0, _3.length - 1, s2)) : o2(m2) ? w2(m2, 0, m2.length - 1) : o2(t4.text) && u2.setTextContent(f3, "") : t4.text !== e2.text && u2.setTextContent(f3, e2.text), o2(h3) && o2(p3 = h3.hook) && o2(p3 = p3.postpatch) && p3(t4, e2);
    }
    function k2(t4, e2, n2) {
      if (r(n2) && o2(t4.parent)) t4.parent.data.pendingInsert = e2;
      else for (let t5 = 0; t5 < e2.length; ++t5) e2[t5].data.hook.insert(e2[t5]);
    }
    const S2 = m("attrs,class,staticClass,staticStyle,key");
    function j2(t4, e2, n2, s2) {
      let i3;
      const { tag: c3, data: a3, children: l3 } = e2;
      if (s2 = s2 || a3 && a3.pre, e2.elm = t4, r(e2.isComment) && o2(e2.asyncFactory)) return e2.isAsyncPlaceholder = true, true;
      if (o2(a3) && (o2(i3 = a3.hook) && o2(i3 = i3.init) && i3(e2, true), o2(i3 = e2.componentInstance))) return p2(e2, n2), true;
      if (o2(c3)) {
        if (o2(l3)) if (t4.hasChildNodes()) if (o2(i3 = a3) && o2(i3 = i3.domProps) && o2(i3 = i3.innerHTML)) {
          if (i3 !== t4.innerHTML) return false;
        } else {
          let e3 = true, o22 = t4.firstChild;
          for (let t5 = 0; t5 < l3.length; t5++) {
            if (!o22 || !j2(o22, l3[t5], n2, s2)) {
              e3 = false;
              break;
            }
            o22 = o22.nextSibling;
          }
          if (!e3 || o22) return false;
        }
        else _2(e2, l3, n2);
        if (o2(a3)) {
          let t5 = false;
          for (const o22 in a3) if (!S2(o22)) {
            t5 = true, y2(e2, n2);
            break;
          }
          !t5 && a3.class && yn(a3.class);
        }
      } else t4.data !== e2.text && (t4.data = e2.text);
      return true;
    }
    return function(t4, e2, s2, i3) {
      if (n(e2)) return void (o2(t4) && $2(t4));
      let c3 = false;
      const l3 = [];
      if (n(t4)) c3 = true, d2(e2, l3);
      else {
        const n2 = o2(t4.nodeType);
        if (!n2 && rr(t4, e2)) O2(t4, e2, l3, null, null, i3);
        else {
          if (n2) {
            if (1 === t4.nodeType && t4.hasAttribute(L) && (t4.removeAttribute(L), s2 = true), r(s2) && j2(t4, e2, l3)) return k2(e2, l3, true), t4;
            f3 = t4, t4 = new at(u2.tagName(f3).toLowerCase(), {}, [], void 0, f3);
          }
          const i4 = t4.elm, c4 = u2.parentNode(i4);
          if (d2(e2, l3, i4._leaveCb ? null : c4, u2.nextSibling(i4)), o2(e2.parent)) {
            let t5 = e2.parent;
            const n3 = v2(e2);
            for (; t5; ) {
              for (let e3 = 0; e3 < a2.destroy.length; ++e3) a2.destroy[e3](t5);
              if (t5.elm = e2.elm, n3) {
                for (let e4 = 0; e4 < a2.create.length; ++e4) a2.create[e4](nr, t5);
                const e3 = t5.data.hook.insert;
                if (e3.merged) {
                  const t6 = e3.fns.slice(1);
                  for (let e4 = 0; e4 < t6.length; e4++) t6[e4]();
                }
              } else tr(t5);
              t5 = t5.parent;
            }
          }
          o2(c4) ? w2([t4], 0, 0) : o2(t4.tag) && $2(t4);
        }
      }
      var f3;
      return k2(e2, l3, c3), e2.elm;
    };
  }({ nodeOps: Qo, modules: [_r, yr, Sr, Er, Vr, W ? { create: hs, activate: hs, remove(t3, e2) {
    true !== t3.data.show ? fs2(t3, e2) : e2();
  } } : {}].concat(dr) });
  G && document.addEventListener("selectionchange", () => {
    const t3 = document.activeElement;
    t3 && t3.vmodel && Cs(t3, "input");
  });
  const _s = { inserted(t3, e2, n2, o22) {
    "select" === n2.tag ? (o22.elm && !o22.elm._vOptions ? ce(n2, "postpatch", () => {
      _s.componentUpdated(t3, e2, n2);
    }) : vs(t3, e2, n2.context), t3._vOptions = [].map.call(t3.options, bs)) : ("textarea" === n2.tag || Xo(t3.type)) && (t3._vModifiers = e2.modifiers, e2.modifiers.lazy || (t3.addEventListener("compositionstart", $s), t3.addEventListener("compositionend", ws), t3.addEventListener("change", ws), G && (t3.vmodel = true)));
  }, componentUpdated(t3, e2, n2) {
    if ("select" === n2.tag) {
      vs(t3, e2, n2.context);
      const o22 = t3._vOptions, r2 = t3._vOptions = [].map.call(t3.options, bs);
      if (r2.some((t4, e3) => !I(t4, o22[e3]))) {
        (t3.multiple ? e2.value.some((t4) => gs(t4, r2)) : e2.value !== e2.oldValue && gs(e2.value, r2)) && Cs(t3, "change");
      }
    }
  } };
  function vs(t3, e2, n2) {
    ys(t3, e2), (q || Z) && setTimeout(() => {
      ys(t3, e2);
    }, 0);
  }
  function ys(t3, e2, n2) {
    const o22 = e2.value, r2 = t3.multiple;
    if (r2 && !Array.isArray(o22)) return;
    let s2, i2;
    for (let e3 = 0, n3 = t3.options.length; e3 < n3; e3++) if (i2 = t3.options[e3], r2) s2 = D(o22, bs(i2)) > -1, i2.selected !== s2 && (i2.selected = s2);
    else if (I(bs(i2), o22)) return void (t3.selectedIndex !== e3 && (t3.selectedIndex = e3));
    r2 || (t3.selectedIndex = -1);
  }
  function gs(t3, e2) {
    return e2.every((e3) => !I(e3, t3));
  }
  function bs(t3) {
    return "_value" in t3 ? t3._value : t3.value;
  }
  function $s(t3) {
    t3.target.composing = true;
  }
  function ws(t3) {
    t3.target.composing && (t3.target.composing = false, Cs(t3.target, "input"));
  }
  function Cs(t3, e2) {
    const n2 = document.createEvent("HTMLEvents");
    n2.initEvent(e2, true, true), t3.dispatchEvent(n2);
  }
  function xs(t3) {
    return !t3.componentInstance || t3.data && t3.data.transition ? t3 : xs(t3.componentInstance._vnode);
  }
  var Os = { bind(t3, { value: e2 }, n2) {
    const o22 = (n2 = xs(n2)).data && n2.data.transition, r2 = t3.__vOriginalDisplay = "none" === t3.style.display ? "" : t3.style.display;
    e2 && o22 ? (n2.data.show = true, us(n2, () => {
      t3.style.display = r2;
    })) : t3.style.display = e2 ? r2 : "none";
  }, update(t3, { value: e2, oldValue: n2 }, o22) {
    if (!e2 == !n2) return;
    (o22 = xs(o22)).data && o22.data.transition ? (o22.data.show = true, e2 ? us(o22, () => {
      t3.style.display = t3.__vOriginalDisplay;
    }) : fs2(o22, () => {
      t3.style.display = "none";
    })) : t3.style.display = e2 ? t3.__vOriginalDisplay : "none";
  }, unbind(t3, e2, n2, o22, r2) {
    r2 || (t3.style.display = t3.__vOriginalDisplay);
  } }, ks = { model: _s, show: Os };
  const Ss = { name: String, appear: Boolean, css: Boolean, mode: String, type: String, enterClass: String, leaveClass: String, enterToClass: String, leaveToClass: String, enterActiveClass: String, leaveActiveClass: String, appearClass: String, appearActiveClass: String, appearToClass: String, duration: [Number, String, Object] };
  function js(t3) {
    const e2 = t3 && t3.componentOptions;
    return e2 && e2.Ctor.options.abstract ? js(Ue(e2.children)) : t3;
  }
  function As(t3) {
    const e2 = {}, n2 = t3.$options;
    for (const o3 in n2.propsData) e2[o3] = t3[o3];
    const o22 = n2._parentListeners;
    for (const t4 in o22) e2[w(t4)] = o22[t4];
    return e2;
  }
  function Ts(t3, e2) {
    if (/\d-keep-alive$/.test(e2.tag)) return t3("keep-alive", { props: e2.componentOptions.propsData });
  }
  const Es = (t3) => t3.tag || Ae(t3), Ps = (t3) => "show" === t3.name;
  var Is = { name: "transition", props: Ss, abstract: true, render(t3) {
    let e2 = this.$slots.default;
    if (!e2) return;
    if (e2 = e2.filter(Es), !e2.length) return;
    const n2 = this.mode, o22 = e2[0];
    if (function(t4) {
      for (; t4 = t4.parent; ) if (t4.data.transition) return true;
    }(this.$vnode)) return o22;
    const r2 = js(o22);
    if (!r2) return o22;
    if (this._leaving) return Ts(t3, o22);
    const i2 = `__transition-${this._uid}-`;
    r2.key = null == r2.key ? r2.isComment ? i2 + "comment" : i2 + r2.tag : s(r2.key) ? 0 === String(r2.key).indexOf(i2) ? r2.key : i2 + r2.key : r2.key;
    const c2 = (r2.data || (r2.data = {})).transition = As(this), a2 = this._vnode, l2 = js(a2);
    if (r2.data.directives && r2.data.directives.some(Ps) && (r2.data.show = true), l2 && l2.data && !function(t4, e3) {
      return e3.key === t4.key && e3.tag === t4.tag;
    }(r2, l2) && !Ae(l2) && (!l2.componentInstance || !l2.componentInstance._vnode.isComment)) {
      const e3 = l2.data.transition = j({}, c2);
      if ("out-in" === n2) return this._leaving = true, ce(e3, "afterLeave", () => {
        this._leaving = false, this.$forceUpdate();
      }), Ts(t3, o22);
      if ("in-out" === n2) {
        if (Ae(r2)) return a2;
        let t4;
        const n3 = () => {
          t4();
        };
        ce(c2, "afterEnter", n3), ce(c2, "enterCancelled", n3), ce(e3, "delayLeave", (e4) => {
          t4 = e4;
        });
      }
    }
    return o22;
  } };
  const Ds = j({ tag: String, moveClass: String }, Ss);
  delete Ds.mode;
  var Ns = { props: Ds, beforeMount() {
    const t3 = this._update;
    this._update = (e2, n2) => {
      const o22 = jn(this);
      this.__patch__(this._vnode, this.kept, false, true), this._vnode = this.kept, o22(), t3.call(this, e2, n2);
    };
  }, render(t3) {
    const e2 = this.tag || this.$vnode.data.tag || "span", n2 = /* @__PURE__ */ Object.create(null), o22 = this.prevChildren = this.children, r2 = this.$slots.default || [], s2 = this.children = [], i2 = As(this);
    for (let t4 = 0; t4 < r2.length; t4++) {
      const e3 = r2[t4];
      e3.tag && null != e3.key && 0 !== String(e3.key).indexOf("__vlist") && (s2.push(e3), n2[e3.key] = e3, (e3.data || (e3.data = {})).transition = i2);
    }
    if (o22) {
      const r3 = [], s3 = [];
      for (let t4 = 0; t4 < o22.length; t4++) {
        const e3 = o22[t4];
        e3.data.transition = i2, e3.data.pos = e3.elm.getBoundingClientRect(), n2[e3.key] ? r3.push(e3) : s3.push(e3);
      }
      this.kept = t3(e2, null, r3), this.removed = s3;
    }
    return t3(e2, null, s2);
  }, updated() {
    const t3 = this.prevChildren, e2 = this.moveClass || (this.name || "v") + "-move";
    t3.length && this.hasMove(t3[0].elm, e2) && (t3.forEach(Ms), t3.forEach(Ls), t3.forEach(Rs), this._reflow = document.body.offsetHeight, t3.forEach((t4) => {
      if (t4.data.moved) {
        const n2 = t4.elm, o22 = n2.style;
        os2(n2, e2), o22.transform = o22.WebkitTransform = o22.transitionDuration = "", n2.addEventListener(Qr, n2._moveCb = function t5(o3) {
          o3 && o3.target !== n2 || o3 && !/transform$/.test(o3.propertyName) || (n2.removeEventListener(Qr, t5), n2._moveCb = null, rs(n2, e2));
        });
      }
    }));
  }, methods: { hasMove(t3, e2) {
    if (!Gr) return false;
    if (this._hasMove) return this._hasMove;
    const n2 = t3.cloneNode();
    t3._transitionClasses && t3._transitionClasses.forEach((t4) => {
      Wr(n2, t4);
    }), Hr(n2, e2), n2.style.display = "none", this.$el.appendChild(n2);
    const o22 = cs(n2);
    return this.$el.removeChild(n2), this._hasMove = o22.hasTransform;
  } } };
  function Ms(t3) {
    t3.elm._moveCb && t3.elm._moveCb(), t3.elm._enterCb && t3.elm._enterCb();
  }
  function Ls(t3) {
    t3.data.newPos = t3.elm.getBoundingClientRect();
  }
  function Rs(t3) {
    const e2 = t3.data.pos, n2 = t3.data.newPos, o22 = e2.left - n2.left, r2 = e2.top - n2.top;
    if (o22 || r2) {
      t3.data.moved = true;
      const e3 = t3.elm.style;
      e3.transform = e3.WebkitTransform = `translate(${o22}px,${r2}px)`, e3.transitionDuration = "0s";
    }
  }
  var Fs = { Transition: Is, TransitionGroup: Ns };
  xo.config.mustUseProp = (t3, e2, n2) => "value" === n2 && Io(t3) && "button" !== e2 || "selected" === n2 && "option" === t3 || "checked" === n2 && "input" === t3 || "muted" === n2 && "video" === t3, xo.config.isReservedTag = Zo, xo.config.isReservedAttr = Po, xo.config.getTagNamespace = function(t3) {
    return Go(t3) ? "svg" : "math" === t3 ? "math" : void 0;
  }, xo.config.isUnknownElement = function(t3) {
    if (!W) return true;
    if (Zo(t3)) return false;
    if (t3 = t3.toLowerCase(), null != Jo[t3]) return Jo[t3];
    const e2 = document.createElement(t3);
    return t3.indexOf("-") > -1 ? Jo[t3] = e2.constructor === window.HTMLUnknownElement || e2.constructor === window.HTMLElement : Jo[t3] = /HTMLUnknownElement/.test(e2.toString());
  }, j(xo.options.directives, ks), j(xo.options.components, Fs), xo.prototype.__patch__ = W ? ms : T, xo.prototype.$mount = function(t3, e2) {
    return function(t4, e3, n2) {
      let o22;
      t4.$el = e3, t4.$options.render || (t4.$options.render = lt), Pn(t4, "beforeMount"), o22 = () => {
        t4._update(t4._render(), n2);
      }, new wn(t4, o22, T, { before() {
        t4._isMounted && !t4._isDestroyed && Pn(t4, "beforeUpdate");
      } }, true), n2 = false;
      const r2 = t4._preWatchers;
      if (r2) for (let t5 = 0; t5 < r2.length; t5++) r2[t5].run();
      return null == t4.$vnode && (t4._isMounted = true, Pn(t4, "mounted")), t4;
    }(this, t3 = t3 && W ? function(t4) {
      if ("string" == typeof t4) {
        return document.querySelector(t4) || document.createElement("div");
      }
      return t4;
    }(t3) : void 0, e2);
  }, W && setTimeout(() => {
  }, 0), j(xo, _n), vue_runtime_common_prod.exports = xo;
  return vue_runtime_common_prod.exports;
}
/*!
 * Vue.js v2.7.16
 * (c) 2014-2023 Evan You
 * Released under the MIT License.
 */
var vue_runtime_common_dev;
var hasRequiredVue_runtime_common_dev;
function requireVue_runtime_common_dev() {
  if (hasRequiredVue_runtime_common_dev) return vue_runtime_common_dev;
  hasRequiredVue_runtime_common_dev = 1;
  const emptyObject = Object.freeze({});
  const isArray = Array.isArray;
  function isUndef(v) {
    return v === void 0 || v === null;
  }
  function isDef(v) {
    return v !== void 0 && v !== null;
  }
  function isTrue(v) {
    return v === true;
  }
  function isFalse(v) {
    return v === false;
  }
  function isPrimitive(value) {
    return typeof value === "string" || typeof value === "number" || // $flow-disable-line
    typeof value === "symbol" || typeof value === "boolean";
  }
  function isFunction(value) {
    return typeof value === "function";
  }
  function isObject2(obj) {
    return obj !== null && typeof obj === "object";
  }
  const _toString = Object.prototype.toString;
  function toRawType(value) {
    return _toString.call(value).slice(8, -1);
  }
  function isPlainObject2(obj) {
    return _toString.call(obj) === "[object Object]";
  }
  function isRegExp(v) {
    return _toString.call(v) === "[object RegExp]";
  }
  function isValidArrayIndex(val) {
    const n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val);
  }
  function isPromise2(val) {
    return isDef(val) && typeof val.then === "function" && typeof val.catch === "function";
  }
  function toString(val) {
    return val == null ? "" : Array.isArray(val) || isPlainObject2(val) && val.toString === _toString ? JSON.stringify(val, replacer, 2) : String(val);
  }
  function replacer(_key, val) {
    if (val && val.__v_isRef) {
      return val.value;
    }
    return val;
  }
  function toNumber(val) {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
  }
  function makeMap(str, expectsLowerCase) {
    const map = /* @__PURE__ */ Object.create(null);
    const list = str.split(",");
    for (let i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase ? (val) => map[val.toLowerCase()] : (val) => map[val];
  }
  const isBuiltInTag = makeMap("slot,component", true);
  const isReservedAttribute = makeMap("key,ref,slot,slot-scope,is");
  function remove$2(arr, item) {
    const len = arr.length;
    if (len) {
      if (item === arr[len - 1]) {
        arr.length = len - 1;
        return;
      }
      const index3 = arr.indexOf(item);
      if (index3 > -1) {
        return arr.splice(index3, 1);
      }
    }
  }
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
  }
  function cached(fn) {
    const cache = /* @__PURE__ */ Object.create(null);
    return function cachedFn(str) {
      const hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  }
  const camelizeRE = /-(\w)/g;
  const camelize = cached((str) => {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
  });
  const capitalize = cached((str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });
  const hyphenateRE = /\B([A-Z])/g;
  const hyphenate = cached((str) => {
    return str.replace(hyphenateRE, "-$1").toLowerCase();
  });
  function polyfillBind(fn, ctx) {
    function boundFn(a) {
      const l = arguments.length;
      return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
    }
    boundFn._length = fn.length;
    return boundFn;
  }
  function nativeBind(fn, ctx) {
    return fn.bind(ctx);
  }
  const bind = Function.prototype.bind ? nativeBind : polyfillBind;
  function toArray(list, start) {
    start = start || 0;
    let i = list.length - start;
    const ret = new Array(i);
    while (i--) {
      ret[i] = list[i + start];
    }
    return ret;
  }
  function extend(to, _from) {
    for (const key in _from) {
      to[key] = _from[key];
    }
    return to;
  }
  function toObject(arr) {
    const res = {};
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]) {
        extend(res, arr[i]);
      }
    }
    return res;
  }
  function noop2(a, b, c) {
  }
  const no = (a, b, c) => false;
  const identity = (_) => _;
  function looseEqual(a, b) {
    if (a === b)
      return true;
    const isObjectA = isObject2(a);
    const isObjectB = isObject2(b);
    if (isObjectA && isObjectB) {
      try {
        const isArrayA = Array.isArray(a);
        const isArrayB = Array.isArray(b);
        if (isArrayA && isArrayB) {
          return a.length === b.length && a.every((e, i) => {
            return looseEqual(e, b[i]);
          });
        } else if (a instanceof Date && b instanceof Date) {
          return a.getTime() === b.getTime();
        } else if (!isArrayA && !isArrayB) {
          const keysA = Object.keys(a);
          const keysB = Object.keys(b);
          return keysA.length === keysB.length && keysA.every((key) => {
            return looseEqual(a[key], b[key]);
          });
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    } else if (!isObjectA && !isObjectB) {
      return String(a) === String(b);
    } else {
      return false;
    }
  }
  function looseIndexOf(arr, val) {
    for (let i = 0; i < arr.length; i++) {
      if (looseEqual(arr[i], val))
        return i;
    }
    return -1;
  }
  function once(fn) {
    let called = false;
    return function() {
      if (!called) {
        called = true;
        fn.apply(this, arguments);
      }
    };
  }
  function hasChanged(x, y) {
    if (x === y) {
      return x === 0 && 1 / x !== 1 / y;
    } else {
      return x === x || y === y;
    }
  }
  const SSR_ATTR = "data-server-rendered";
  const ASSET_TYPES = ["component", "directive", "filter"];
  const LIFECYCLE_HOOKS = [
    "beforeCreate",
    "created",
    "beforeMount",
    "mounted",
    "beforeUpdate",
    "updated",
    "beforeDestroy",
    "destroyed",
    "activated",
    "deactivated",
    "errorCaptured",
    "serverPrefetch",
    "renderTracked",
    "renderTriggered"
  ];
  var config = {
    /**
     * Option merge strategies (used in core/util/options)
     */
    // $flow-disable-line
    optionMergeStrategies: /* @__PURE__ */ Object.create(null),
    /**
     * Whether to suppress warnings.
     */
    silent: false,
    /**
     * Show production mode tip message on boot?
     */
    productionTip: true,
    /**
     * Whether to enable devtools
     */
    devtools: true,
    /**
     * Whether to record perf
     */
    performance: false,
    /**
     * Error handler for watcher errors
     */
    errorHandler: null,
    /**
     * Warn handler for watcher warns
     */
    warnHandler: null,
    /**
     * Ignore certain custom elements
     */
    ignoredElements: [],
    /**
     * Custom user key aliases for v-on
     */
    // $flow-disable-line
    keyCodes: /* @__PURE__ */ Object.create(null),
    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no,
    /**
     * Check if an attribute is reserved so that it cannot be used as a component
     * prop. This is platform-dependent and may be overwritten.
     */
    isReservedAttr: no,
    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: no,
    /**
     * Get the namespace of an element
     */
    getTagNamespace: noop2,
    /**
     * Parse the real tag name for the specific platform.
     */
    parsePlatformTagName: identity,
    /**
     * Check if an attribute must be bound using property, e.g. value
     * Platform-dependent.
     */
    mustUseProp: no,
    /**
     * Perform updates asynchronously. Intended to be used by Vue Test Utils
     * This will significantly reduce performance if set to false.
     */
    async: true,
    /**
     * Exposed for legacy reasons
     */
    _lifecycleHooks: LIFECYCLE_HOOKS
  };
  const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
  function isReserved(str) {
    const c = (str + "").charCodeAt(0);
    return c === 36 || c === 95;
  }
  function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
  const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`);
  function parsePath(path2) {
    if (bailRE.test(path2)) {
      return;
    }
    const segments = path2.split(".");
    return function(obj) {
      for (let i = 0; i < segments.length; i++) {
        if (!obj)
          return;
        obj = obj[segments[i]];
      }
      return obj;
    };
  }
  const hasProto = "__proto__" in {};
  const inBrowser = typeof window !== "undefined";
  const UA = inBrowser && window.navigator.userAgent.toLowerCase();
  const isIE = UA && /msie|trident/.test(UA);
  const isIE9 = UA && UA.indexOf("msie 9.0") > 0;
  const isEdge = UA && UA.indexOf("edge/") > 0;
  UA && UA.indexOf("android") > 0;
  const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
  const isFF = UA && UA.match(/firefox\/(\d+)/);
  const nativeWatch = {}.watch;
  let supportsPassive = false;
  if (inBrowser) {
    try {
      const opts = {};
      Object.defineProperty(opts, "passive", {
        get() {
          supportsPassive = true;
        }
      });
      window.addEventListener("test-passive", null, opts);
    } catch (e) {
    }
  }
  let _isServer;
  const isServerRendering = () => {
    if (_isServer === void 0) {
      if (!inBrowser && typeof commonjsGlobal !== "undefined") {
        _isServer = commonjsGlobal["process"] && commonjsGlobal["process"].env.VUE_ENV === "server";
      } else {
        _isServer = false;
      }
    }
    return _isServer;
  };
  const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
  function isNative(Ctor) {
    return typeof Ctor === "function" && /native code/.test(Ctor.toString());
  }
  const hasSymbol = typeof Symbol !== "undefined" && isNative(Symbol) && typeof Reflect !== "undefined" && isNative(Reflect.ownKeys);
  let _Set;
  if (typeof Set !== "undefined" && isNative(Set)) {
    _Set = Set;
  } else {
    _Set = class Set {
      constructor() {
        this.set = /* @__PURE__ */ Object.create(null);
      }
      has(key) {
        return this.set[key] === true;
      }
      add(key) {
        this.set[key] = true;
      }
      clear() {
        this.set = /* @__PURE__ */ Object.create(null);
      }
    };
  }
  let currentInstance = null;
  function getCurrentInstance2() {
    return currentInstance && { proxy: currentInstance };
  }
  function setCurrentInstance(vm = null) {
    if (!vm)
      currentInstance && currentInstance._scope.off();
    currentInstance = vm;
    vm && vm._scope.on();
  }
  class VNode {
    constructor(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
      this.tag = tag;
      this.data = data;
      this.children = children;
      this.text = text;
      this.elm = elm;
      this.ns = void 0;
      this.context = context;
      this.fnContext = void 0;
      this.fnOptions = void 0;
      this.fnScopeId = void 0;
      this.key = data && data.key;
      this.componentOptions = componentOptions;
      this.componentInstance = void 0;
      this.parent = void 0;
      this.raw = false;
      this.isStatic = false;
      this.isRootInsert = true;
      this.isComment = false;
      this.isCloned = false;
      this.isOnce = false;
      this.asyncFactory = asyncFactory;
      this.asyncMeta = void 0;
      this.isAsyncPlaceholder = false;
    }
    // DEPRECATED: alias for componentInstance for backwards compat.
    /* istanbul ignore next */
    get child() {
      return this.componentInstance;
    }
  }
  const createEmptyVNode = (text = "") => {
    const node = new VNode();
    node.text = text;
    node.isComment = true;
    return node;
  };
  function createTextVNode(val) {
    return new VNode(void 0, void 0, void 0, String(val));
  }
  function cloneVNode(vnode) {
    const cloned = new VNode(
      vnode.tag,
      vnode.data,
      // #7975
      // clone children array to avoid mutating original in case of cloning
      // a child.
      vnode.children && vnode.children.slice(),
      vnode.text,
      vnode.elm,
      vnode.context,
      vnode.componentOptions,
      vnode.asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.fnContext = vnode.fnContext;
    cloned.fnOptions = vnode.fnOptions;
    cloned.fnScopeId = vnode.fnScopeId;
    cloned.asyncMeta = vnode.asyncMeta;
    cloned.isCloned = true;
    return cloned;
  }
  let uid$2 = 0;
  const pendingCleanupDeps = [];
  const cleanupDeps = () => {
    for (let i = 0; i < pendingCleanupDeps.length; i++) {
      const dep = pendingCleanupDeps[i];
      dep.subs = dep.subs.filter((s) => s);
      dep._pending = false;
    }
    pendingCleanupDeps.length = 0;
  };
  class Dep {
    constructor() {
      this._pending = false;
      this.id = uid$2++;
      this.subs = [];
    }
    addSub(sub) {
      this.subs.push(sub);
    }
    removeSub(sub) {
      this.subs[this.subs.indexOf(sub)] = null;
      if (!this._pending) {
        this._pending = true;
        pendingCleanupDeps.push(this);
      }
    }
    depend(info) {
      if (Dep.target) {
        Dep.target.addDep(this);
        if (info && Dep.target.onTrack) {
          Dep.target.onTrack(Object.assign({ effect: Dep.target }, info));
        }
      }
    }
    notify(info) {
      const subs = this.subs.filter((s) => s);
      if (!config.async) {
        subs.sort((a, b) => a.id - b.id);
      }
      for (let i = 0, l = subs.length; i < l; i++) {
        const sub = subs[i];
        if (info) {
          sub.onTrigger && sub.onTrigger(Object.assign({ effect: subs[i] }, info));
        }
        sub.update();
      }
    }
  }
  Dep.target = null;
  const targetStack = [];
  function pushTarget(target3) {
    targetStack.push(target3);
    Dep.target = target3;
  }
  function popTarget() {
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
  }
  const arrayProto = Array.prototype;
  const arrayMethods = Object.create(arrayProto);
  const methodsToPatch = [
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "sort",
    "reverse"
  ];
  methodsToPatch.forEach(function(method) {
    const original = arrayProto[method];
    def(arrayMethods, method, function mutator(...args) {
      const result = original.apply(this, args);
      const ob = this.__ob__;
      let inserted;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;
        case "splice":
          inserted = args.slice(2);
          break;
      }
      if (inserted)
        ob.observeArray(inserted);
      {
        ob.dep.notify({
          type: "array mutation",
          target: this,
          key: method
        });
      }
      return result;
    });
  });
  const arrayKeys = Object.getOwnPropertyNames(arrayMethods);
  const NO_INITIAL_VALUE = {};
  let shouldObserve = true;
  function toggleObserving(value) {
    shouldObserve = value;
  }
  const mockDep = {
    notify: noop2,
    depend: noop2,
    addSub: noop2,
    removeSub: noop2
  };
  class Observer {
    constructor(value, shallow = false, mock = false) {
      this.value = value;
      this.shallow = shallow;
      this.mock = mock;
      this.dep = mock ? mockDep : new Dep();
      this.vmCount = 0;
      def(value, "__ob__", this);
      if (isArray(value)) {
        if (!mock) {
          if (hasProto) {
            value.__proto__ = arrayMethods;
          } else {
            for (let i = 0, l = arrayKeys.length; i < l; i++) {
              const key = arrayKeys[i];
              def(value, key, arrayMethods[key]);
            }
          }
        }
        if (!shallow) {
          this.observeArray(value);
        }
      } else {
        const keys = Object.keys(value);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          defineReactive(value, key, NO_INITIAL_VALUE, void 0, shallow, mock);
        }
      }
    }
    /**
     * Observe a list of Array items.
     */
    observeArray(value) {
      for (let i = 0, l = value.length; i < l; i++) {
        observe(value[i], false, this.mock);
      }
    }
  }
  function observe(value, shallow, ssrMockReactivity) {
    if (value && hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
      return value.__ob__;
    }
    if (shouldObserve && (ssrMockReactivity || !isServerRendering()) && (isArray(value) || isPlainObject2(value)) && Object.isExtensible(value) && !value.__v_skip && !isRef2(value) && !(value instanceof VNode)) {
      return new Observer(value, shallow, ssrMockReactivity);
    }
  }
  function defineReactive(obj, key, val, customSetter, shallow, mock, observeEvenIfShallow = false) {
    const dep = new Dep();
    const property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
      return;
    }
    const getter = property && property.get;
    const setter = property && property.set;
    if ((!getter || setter) && (val === NO_INITIAL_VALUE || arguments.length === 2)) {
      val = obj[key];
    }
    let childOb = shallow ? val && val.__ob__ : observe(val, false, mock);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        const value = getter ? getter.call(obj) : val;
        if (Dep.target) {
          {
            dep.depend({
              target: obj,
              type: "get",
              key
            });
          }
          if (childOb) {
            childOb.dep.depend();
            if (isArray(value)) {
              dependArray(value);
            }
          }
        }
        return isRef2(value) && !shallow ? value.value : value;
      },
      set: function reactiveSetter(newVal) {
        const value = getter ? getter.call(obj) : val;
        if (!hasChanged(value, newVal)) {
          return;
        }
        if (customSetter) {
          customSetter();
        }
        if (setter) {
          setter.call(obj, newVal);
        } else if (getter) {
          return;
        } else if (!shallow && isRef2(value) && !isRef2(newVal)) {
          value.value = newVal;
          return;
        } else {
          val = newVal;
        }
        childOb = shallow ? newVal && newVal.__ob__ : observe(newVal, false, mock);
        {
          dep.notify({
            type: "set",
            target: obj,
            key,
            newValue: newVal,
            oldValue: value
          });
        }
      }
    });
    return dep;
  }
  function set2(target3, key, val) {
    if (isUndef(target3) || isPrimitive(target3)) {
      warn(`Cannot set reactive property on undefined, null, or primitive value: ${target3}`);
    }
    if (isReadonly2(target3)) {
      warn(`Set operation on key "${key}" failed: target is readonly.`);
      return;
    }
    const ob = target3.__ob__;
    if (isArray(target3) && isValidArrayIndex(key)) {
      target3.length = Math.max(target3.length, key);
      target3.splice(key, 1, val);
      if (ob && !ob.shallow && ob.mock) {
        observe(val, false, true);
      }
      return val;
    }
    if (key in target3 && !(key in Object.prototype)) {
      target3[key] = val;
      return val;
    }
    if (target3._isVue || ob && ob.vmCount) {
      warn("Avoid adding reactive properties to a Vue instance or its root $data at runtime - declare it upfront in the data option.");
      return val;
    }
    if (!ob) {
      target3[key] = val;
      return val;
    }
    defineReactive(ob.value, key, val, void 0, ob.shallow, ob.mock);
    {
      ob.dep.notify({
        type: "add",
        target: target3,
        key,
        newValue: val,
        oldValue: void 0
      });
    }
    return val;
  }
  function del2(target3, key) {
    if (isUndef(target3) || isPrimitive(target3)) {
      warn(`Cannot delete reactive property on undefined, null, or primitive value: ${target3}`);
    }
    if (isArray(target3) && isValidArrayIndex(key)) {
      target3.splice(key, 1);
      return;
    }
    const ob = target3.__ob__;
    if (target3._isVue || ob && ob.vmCount) {
      warn("Avoid deleting properties on a Vue instance or its root $data - just set it to null.");
      return;
    }
    if (isReadonly2(target3)) {
      warn(`Delete operation on key "${key}" failed: target is readonly.`);
      return;
    }
    if (!hasOwn(target3, key)) {
      return;
    }
    delete target3[key];
    if (!ob) {
      return;
    }
    {
      ob.dep.notify({
        type: "delete",
        target: target3,
        key
      });
    }
  }
  function dependArray(value) {
    for (let e, i = 0, l = value.length; i < l; i++) {
      e = value[i];
      if (e && e.__ob__) {
        e.__ob__.dep.depend();
      }
      if (isArray(e)) {
        dependArray(e);
      }
    }
  }
  function reactive2(target3) {
    makeReactive(target3, false);
    return target3;
  }
  function shallowReactive2(target3) {
    makeReactive(target3, true);
    def(target3, "__v_isShallow", true);
    return target3;
  }
  function makeReactive(target3, shallow) {
    if (!isReadonly2(target3)) {
      {
        if (isArray(target3)) {
          warn(`Avoid using Array as root value for ${shallow ? `shallowReactive()` : `reactive()`} as it cannot be tracked in watch() or watchEffect(). Use ${shallow ? `shallowRef()` : `ref()`} instead. This is a Vue-2-only limitation.`);
        }
        const existingOb = target3 && target3.__ob__;
        if (existingOb && existingOb.shallow !== shallow) {
          warn(`Target is already a ${existingOb.shallow ? `` : `non-`}shallow reactive object, and cannot be converted to ${shallow ? `` : `non-`}shallow.`);
        }
      }
      const ob = observe(
        target3,
        shallow,
        isServerRendering()
        /* ssr mock reactivity */
      );
      if (!ob) {
        if (target3 == null || isPrimitive(target3)) {
          warn(`value cannot be made reactive: ${String(target3)}`);
        }
        if (isCollectionType(target3)) {
          warn(`Vue 2 does not support reactive collection types such as Map or Set.`);
        }
      }
    }
  }
  function isReactive2(value) {
    if (isReadonly2(value)) {
      return isReactive2(value[
        "__v_raw"
        /* ReactiveFlags.RAW */
      ]);
    }
    return !!(value && value.__ob__);
  }
  function isShallow2(value) {
    return !!(value && value.__v_isShallow);
  }
  function isReadonly2(value) {
    return !!(value && value.__v_isReadonly);
  }
  function isProxy2(value) {
    return isReactive2(value) || isReadonly2(value);
  }
  function toRaw2(observed) {
    const raw = observed && observed[
      "__v_raw"
      /* ReactiveFlags.RAW */
    ];
    return raw ? toRaw2(raw) : observed;
  }
  function markRaw2(value) {
    if (Object.isExtensible(value)) {
      def(value, "__v_skip", true);
    }
    return value;
  }
  function isCollectionType(value) {
    const type = toRawType(value);
    return type === "Map" || type === "WeakMap" || type === "Set" || type === "WeakSet";
  }
  const RefFlag = `__v_isRef`;
  function isRef2(r) {
    return !!(r && r.__v_isRef === true);
  }
  function ref$1(value) {
    return createRef(value, false);
  }
  function shallowRef2(value) {
    return createRef(value, true);
  }
  function createRef(rawValue, shallow) {
    if (isRef2(rawValue)) {
      return rawValue;
    }
    const ref3 = {};
    def(ref3, RefFlag, true);
    def(ref3, "__v_isShallow", shallow);
    def(ref3, "dep", defineReactive(ref3, "value", rawValue, null, shallow, isServerRendering()));
    return ref3;
  }
  function triggerRef2(ref3) {
    if (!ref3.dep) {
      warn(`received object is not a triggerable ref.`);
    }
    {
      ref3.dep && ref3.dep.notify({
        type: "set",
        target: ref3,
        key: "value"
      });
    }
  }
  function unref2(ref3) {
    return isRef2(ref3) ? ref3.value : ref3;
  }
  function proxyRefs2(objectWithRefs) {
    if (isReactive2(objectWithRefs)) {
      return objectWithRefs;
    }
    const proxy2 = {};
    const keys = Object.keys(objectWithRefs);
    for (let i = 0; i < keys.length; i++) {
      proxyWithRefUnwrap(proxy2, objectWithRefs, keys[i]);
    }
    return proxy2;
  }
  function proxyWithRefUnwrap(target3, source, key) {
    Object.defineProperty(target3, key, {
      enumerable: true,
      configurable: true,
      get: () => {
        const val = source[key];
        if (isRef2(val)) {
          return val.value;
        } else {
          const ob = val && val.__ob__;
          if (ob)
            ob.dep.depend();
          return val;
        }
      },
      set: (value) => {
        const oldValue = source[key];
        if (isRef2(oldValue) && !isRef2(value)) {
          oldValue.value = value;
        } else {
          source[key] = value;
        }
      }
    });
  }
  function customRef2(factory) {
    const dep = new Dep();
    const { get: get2, set: set3 } = factory(() => {
      {
        dep.depend({
          target: ref3,
          type: "get",
          key: "value"
        });
      }
    }, () => {
      {
        dep.notify({
          target: ref3,
          type: "set",
          key: "value"
        });
      }
    });
    const ref3 = {
      get value() {
        return get2();
      },
      set value(newVal) {
        set3(newVal);
      }
    };
    def(ref3, RefFlag, true);
    return ref3;
  }
  function toRefs2(object) {
    if (!isReactive2(object)) {
      warn(`toRefs() expects a reactive object but received a plain one.`);
    }
    const ret = isArray(object) ? new Array(object.length) : {};
    for (const key in object) {
      ret[key] = toRef2(object, key);
    }
    return ret;
  }
  function toRef2(object, key, defaultValue) {
    const val = object[key];
    if (isRef2(val)) {
      return val;
    }
    const ref3 = {
      get value() {
        const val2 = object[key];
        return val2 === void 0 ? defaultValue : val2;
      },
      set value(newVal) {
        object[key] = newVal;
      }
    };
    def(ref3, RefFlag, true);
    return ref3;
  }
  const rawToReadonlyFlag = `__v_rawToReadonly`;
  const rawToShallowReadonlyFlag = `__v_rawToShallowReadonly`;
  function readonly2(target3) {
    return createReadonly(target3, false);
  }
  function createReadonly(target3, shallow) {
    if (!isPlainObject2(target3)) {
      {
        if (isArray(target3)) {
          warn(`Vue 2 does not support readonly arrays.`);
        } else if (isCollectionType(target3)) {
          warn(`Vue 2 does not support readonly collection types such as Map or Set.`);
        } else {
          warn(`value cannot be made readonly: ${typeof target3}`);
        }
      }
      return target3;
    }
    if (!Object.isExtensible(target3)) {
      warn(`Vue 2 does not support creating readonly proxy for non-extensible object.`);
    }
    if (isReadonly2(target3)) {
      return target3;
    }
    const existingFlag = shallow ? rawToShallowReadonlyFlag : rawToReadonlyFlag;
    const existingProxy = target3[existingFlag];
    if (existingProxy) {
      return existingProxy;
    }
    const proxy2 = Object.create(Object.getPrototypeOf(target3));
    def(target3, existingFlag, proxy2);
    def(proxy2, "__v_isReadonly", true);
    def(proxy2, "__v_raw", target3);
    if (isRef2(target3)) {
      def(proxy2, RefFlag, true);
    }
    if (shallow || isShallow2(target3)) {
      def(proxy2, "__v_isShallow", true);
    }
    const keys = Object.keys(target3);
    for (let i = 0; i < keys.length; i++) {
      defineReadonlyProperty(proxy2, target3, keys[i], shallow);
    }
    return proxy2;
  }
  function defineReadonlyProperty(proxy2, target3, key, shallow) {
    Object.defineProperty(proxy2, key, {
      enumerable: true,
      configurable: true,
      get() {
        const val = target3[key];
        return shallow || !isPlainObject2(val) ? val : readonly2(val);
      },
      set() {
        warn(`Set operation on key "${key}" failed: target is readonly.`);
      }
    });
  }
  function shallowReadonly2(target3) {
    return createReadonly(target3, true);
  }
  function computed2(getterOrOptions, debugOptions) {
    let getter;
    let setter;
    const onlyGetter = isFunction(getterOrOptions);
    if (onlyGetter) {
      getter = getterOrOptions;
      setter = () => {
        warn("Write operation failed: computed value is readonly");
      };
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set;
    }
    const watcher = isServerRendering() ? null : new Watcher(currentInstance, getter, noop2, { lazy: true });
    if (watcher && debugOptions) {
      watcher.onTrack = debugOptions.onTrack;
      watcher.onTrigger = debugOptions.onTrigger;
    }
    const ref3 = {
      // some libs rely on the presence effect for checking computed refs
      // from normal refs, but the implementation doesn't matter
      effect: watcher,
      get value() {
        if (watcher) {
          if (watcher.dirty) {
            watcher.evaluate();
          }
          if (Dep.target) {
            if (Dep.target.onTrack) {
              Dep.target.onTrack({
                effect: Dep.target,
                target: ref3,
                type: "get",
                key: "value"
              });
            }
            watcher.depend();
          }
          return watcher.value;
        } else {
          return getter();
        }
      },
      set value(newVal) {
        setter(newVal);
      }
    };
    def(ref3, RefFlag, true);
    def(ref3, "__v_isReadonly", onlyGetter);
    return ref3;
  }
  const WATCHER = `watcher`;
  const WATCHER_CB = `${WATCHER} callback`;
  const WATCHER_GETTER = `${WATCHER} getter`;
  const WATCHER_CLEANUP = `${WATCHER} cleanup`;
  function watchEffect2(effect, options2) {
    return doWatch(effect, null, options2);
  }
  function watchPostEffect2(effect, options2) {
    return doWatch(effect, null, Object.assign(Object.assign({}, options2), { flush: "post" }));
  }
  function watchSyncEffect2(effect, options2) {
    return doWatch(effect, null, Object.assign(Object.assign({}, options2), { flush: "sync" }));
  }
  const INITIAL_WATCHER_VALUE = {};
  function watch3(source, cb, options2) {
    if (typeof cb !== "function") {
      warn(`\`watch(fn, options?)\` signature has been moved to a separate API. Use \`watchEffect(fn, options?)\` instead. \`watch\` now only supports \`watch(source, cb, options?) signature.`);
    }
    return doWatch(source, cb, options2);
  }
  function doWatch(source, cb, { immediate, deep, flush = "pre", onTrack, onTrigger } = emptyObject) {
    if (!cb) {
      if (immediate !== void 0) {
        warn(`watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.`);
      }
      if (deep !== void 0) {
        warn(`watch() "deep" option is only respected when using the watch(source, callback, options?) signature.`);
      }
    }
    const warnInvalidSource = (s) => {
      warn(`Invalid watch source: ${s}. A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`);
    };
    const instance = currentInstance;
    const call = (fn, type, args = null) => {
      const res = invokeWithErrorHandling(fn, null, args, instance, type);
      if (deep && res && res.__ob__)
        res.__ob__.dep.depend();
      return res;
    };
    let getter;
    let forceTrigger = false;
    let isMultiSource = false;
    if (isRef2(source)) {
      getter = () => source.value;
      forceTrigger = isShallow2(source);
    } else if (isReactive2(source)) {
      getter = () => {
        source.__ob__.dep.depend();
        return source;
      };
      deep = true;
    } else if (isArray(source)) {
      isMultiSource = true;
      forceTrigger = source.some((s) => isReactive2(s) || isShallow2(s));
      getter = () => source.map((s) => {
        if (isRef2(s)) {
          return s.value;
        } else if (isReactive2(s)) {
          s.__ob__.dep.depend();
          return traverse(s);
        } else if (isFunction(s)) {
          return call(s, WATCHER_GETTER);
        } else {
          warnInvalidSource(s);
        }
      });
    } else if (isFunction(source)) {
      if (cb) {
        getter = () => call(source, WATCHER_GETTER);
      } else {
        getter = () => {
          if (instance && instance._isDestroyed) {
            return;
          }
          if (cleanup) {
            cleanup();
          }
          return call(source, WATCHER, [onCleanup]);
        };
      }
    } else {
      getter = noop2;
      warnInvalidSource(source);
    }
    if (cb && deep) {
      const baseGetter = getter;
      getter = () => traverse(baseGetter());
    }
    let cleanup;
    let onCleanup = (fn) => {
      cleanup = watcher.onStop = () => {
        call(fn, WATCHER_CLEANUP);
      };
    };
    if (isServerRendering()) {
      onCleanup = noop2;
      if (!cb) {
        getter();
      } else if (immediate) {
        call(cb, WATCHER_CB, [
          getter(),
          isMultiSource ? [] : void 0,
          onCleanup
        ]);
      }
      return noop2;
    }
    const watcher = new Watcher(currentInstance, getter, noop2, {
      lazy: true
    });
    watcher.noRecurse = !cb;
    let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE;
    watcher.run = () => {
      if (!watcher.active) {
        return;
      }
      if (cb) {
        const newValue = watcher.get();
        if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
          if (cleanup) {
            cleanup();
          }
          call(cb, WATCHER_CB, [
            newValue,
            // pass undefined as the old value when it's changed for the first time
            oldValue === INITIAL_WATCHER_VALUE ? void 0 : oldValue,
            onCleanup
          ]);
          oldValue = newValue;
        }
      } else {
        watcher.get();
      }
    };
    if (flush === "sync") {
      watcher.update = watcher.run;
    } else if (flush === "post") {
      watcher.post = true;
      watcher.update = () => queueWatcher(watcher);
    } else {
      watcher.update = () => {
        if (instance && instance === currentInstance && !instance._isMounted) {
          const buffer = instance._preWatchers || (instance._preWatchers = []);
          if (buffer.indexOf(watcher) < 0)
            buffer.push(watcher);
        } else {
          queueWatcher(watcher);
        }
      };
    }
    {
      watcher.onTrack = onTrack;
      watcher.onTrigger = onTrigger;
    }
    if (cb) {
      if (immediate) {
        watcher.run();
      } else {
        oldValue = watcher.get();
      }
    } else if (flush === "post" && instance) {
      instance.$once("hook:mounted", () => watcher.get());
    } else {
      watcher.get();
    }
    return () => {
      watcher.teardown();
    };
  }
  let activeEffectScope;
  class EffectScope {
    constructor(detached = false) {
      this.detached = detached;
      this.active = true;
      this.effects = [];
      this.cleanups = [];
      this.parent = activeEffectScope;
      if (!detached && activeEffectScope) {
        this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
      }
    }
    run(fn) {
      if (this.active) {
        const currentEffectScope = activeEffectScope;
        try {
          activeEffectScope = this;
          return fn();
        } finally {
          activeEffectScope = currentEffectScope;
        }
      } else {
        warn(`cannot run an inactive effect scope.`);
      }
    }
    /**
     * This should only be called on non-detached scopes
     * @internal
     */
    on() {
      activeEffectScope = this;
    }
    /**
     * This should only be called on non-detached scopes
     * @internal
     */
    off() {
      activeEffectScope = this.parent;
    }
    stop(fromParent) {
      if (this.active) {
        let i, l;
        for (i = 0, l = this.effects.length; i < l; i++) {
          this.effects[i].teardown();
        }
        for (i = 0, l = this.cleanups.length; i < l; i++) {
          this.cleanups[i]();
        }
        if (this.scopes) {
          for (i = 0, l = this.scopes.length; i < l; i++) {
            this.scopes[i].stop(true);
          }
        }
        if (!this.detached && this.parent && !fromParent) {
          const last = this.parent.scopes.pop();
          if (last && last !== this) {
            this.parent.scopes[this.index] = last;
            last.index = this.index;
          }
        }
        this.parent = void 0;
        this.active = false;
      }
    }
  }
  function effectScope2(detached) {
    return new EffectScope(detached);
  }
  function recordEffectScope(effect, scope = activeEffectScope) {
    if (scope && scope.active) {
      scope.effects.push(effect);
    }
  }
  function getCurrentScope2() {
    return activeEffectScope;
  }
  function onScopeDispose2(fn) {
    if (activeEffectScope) {
      activeEffectScope.cleanups.push(fn);
    } else {
      warn(`onScopeDispose() is called when there is no active effect scope to be associated with.`);
    }
  }
  function provide2(key, value) {
    if (!currentInstance) {
      {
        warn(`provide() can only be used inside setup().`);
      }
    } else {
      resolveProvided(currentInstance)[key] = value;
    }
  }
  function resolveProvided(vm) {
    const existing = vm._provided;
    const parentProvides = vm.$parent && vm.$parent._provided;
    if (parentProvides === existing) {
      return vm._provided = Object.create(parentProvides);
    } else {
      return existing;
    }
  }
  function inject2(key, defaultValue, treatDefaultAsFactory = false) {
    const instance = currentInstance;
    if (instance) {
      const provides = instance.$parent && instance.$parent._provided;
      if (provides && key in provides) {
        return provides[key];
      } else if (arguments.length > 1) {
        return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance) : defaultValue;
      } else {
        warn(`injection "${String(key)}" not found.`);
      }
    } else {
      warn(`inject() can only be used inside setup() or functional components.`);
    }
  }
  const normalizeEvent = cached((name) => {
    const passive = name.charAt(0) === "&";
    name = passive ? name.slice(1) : name;
    const once2 = name.charAt(0) === "~";
    name = once2 ? name.slice(1) : name;
    const capture = name.charAt(0) === "!";
    name = capture ? name.slice(1) : name;
    return {
      name,
      once: once2,
      capture,
      passive
    };
  });
  function createFnInvoker(fns, vm) {
    function invoker() {
      const fns2 = invoker.fns;
      if (isArray(fns2)) {
        const cloned = fns2.slice();
        for (let i = 0; i < cloned.length; i++) {
          invokeWithErrorHandling(cloned[i], null, arguments, vm, `v-on handler`);
        }
      } else {
        return invokeWithErrorHandling(fns2, null, arguments, vm, `v-on handler`);
      }
    }
    invoker.fns = fns;
    return invoker;
  }
  function updateListeners(on, oldOn, add2, remove2, createOnceHandler2, vm) {
    let name, cur, old, event;
    for (name in on) {
      cur = on[name];
      old = oldOn[name];
      event = normalizeEvent(name);
      if (isUndef(cur)) {
        warn(`Invalid handler for event "${event.name}": got ` + String(cur), vm);
      } else if (isUndef(old)) {
        if (isUndef(cur.fns)) {
          cur = on[name] = createFnInvoker(cur, vm);
        }
        if (isTrue(event.once)) {
          cur = on[name] = createOnceHandler2(event.name, cur, event.capture);
        }
        add2(event.name, cur, event.capture, event.passive, event.params);
      } else if (cur !== old) {
        old.fns = cur;
        on[name] = old;
      }
    }
    for (name in oldOn) {
      if (isUndef(on[name])) {
        event = normalizeEvent(name);
        remove2(event.name, oldOn[name], event.capture);
      }
    }
  }
  function mergeVNodeHook(def2, hookKey, hook) {
    if (def2 instanceof VNode) {
      def2 = def2.data.hook || (def2.data.hook = {});
    }
    let invoker;
    const oldHook = def2[hookKey];
    function wrappedHook() {
      hook.apply(this, arguments);
      remove$2(invoker.fns, wrappedHook);
    }
    if (isUndef(oldHook)) {
      invoker = createFnInvoker([wrappedHook]);
    } else {
      if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
        invoker = oldHook;
        invoker.fns.push(wrappedHook);
      } else {
        invoker = createFnInvoker([oldHook, wrappedHook]);
      }
    }
    invoker.merged = true;
    def2[hookKey] = invoker;
  }
  function extractPropsFromVNodeData(data, Ctor, tag) {
    const propOptions = Ctor.options.props;
    if (isUndef(propOptions)) {
      return;
    }
    const res = {};
    const { attrs: attrs2, props: props2 } = data;
    if (isDef(attrs2) || isDef(props2)) {
      for (const key in propOptions) {
        const altKey = hyphenate(key);
        {
          const keyInLowerCase = key.toLowerCase();
          if (key !== keyInLowerCase && attrs2 && hasOwn(attrs2, keyInLowerCase)) {
            tip(`Prop "${keyInLowerCase}" is passed to component ${formatComponentName(
              // @ts-expect-error tag is string
              tag || Ctor
            )}, but the declared prop name is "${key}". Note that HTML attributes are case-insensitive and camelCased props need to use their kebab-case equivalents when using in-DOM templates. You should probably use "${altKey}" instead of "${key}".`);
          }
        }
        checkProp(res, props2, key, altKey, true) || checkProp(res, attrs2, key, altKey, false);
      }
    }
    return res;
  }
  function checkProp(res, hash, key, altKey, preserve) {
    if (isDef(hash)) {
      if (hasOwn(hash, key)) {
        res[key] = hash[key];
        if (!preserve) {
          delete hash[key];
        }
        return true;
      } else if (hasOwn(hash, altKey)) {
        res[key] = hash[altKey];
        if (!preserve) {
          delete hash[altKey];
        }
        return true;
      }
    }
    return false;
  }
  function simpleNormalizeChildren(children) {
    for (let i = 0; i < children.length; i++) {
      if (isArray(children[i])) {
        return Array.prototype.concat.apply([], children);
      }
    }
    return children;
  }
  function normalizeChildren(children) {
    return isPrimitive(children) ? [createTextVNode(children)] : isArray(children) ? normalizeArrayChildren(children) : void 0;
  }
  function isTextNode(node) {
    return isDef(node) && isDef(node.text) && isFalse(node.isComment);
  }
  function normalizeArrayChildren(children, nestedIndex) {
    const res = [];
    let i, c, lastIndex, last;
    for (i = 0; i < children.length; i++) {
      c = children[i];
      if (isUndef(c) || typeof c === "boolean")
        continue;
      lastIndex = res.length - 1;
      last = res[lastIndex];
      if (isArray(c)) {
        if (c.length > 0) {
          c = normalizeArrayChildren(c, `${nestedIndex || ""}_${i}`);
          if (isTextNode(c[0]) && isTextNode(last)) {
            res[lastIndex] = createTextVNode(last.text + c[0].text);
            c.shift();
          }
          res.push.apply(res, c);
        }
      } else if (isPrimitive(c)) {
        if (isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + c);
        } else if (c !== "") {
          res.push(createTextVNode(c));
        }
      } else {
        if (isTextNode(c) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + c.text);
        } else {
          if (isTrue(children._isVList) && isDef(c.tag) && isUndef(c.key) && isDef(nestedIndex)) {
            c.key = `__vlist${nestedIndex}_${i}__`;
          }
          res.push(c);
        }
      }
    }
    return res;
  }
  function renderList(val, render) {
    let ret = null, i, l, keys, key;
    if (isArray(val) || typeof val === "string") {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === "number") {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject2(val)) {
      if (hasSymbol && val[Symbol.iterator]) {
        ret = [];
        const iterator = val[Symbol.iterator]();
        let result = iterator.next();
        while (!result.done) {
          ret.push(render(result.value, ret.length));
          result = iterator.next();
        }
      } else {
        keys = Object.keys(val);
        ret = new Array(keys.length);
        for (i = 0, l = keys.length; i < l; i++) {
          key = keys[i];
          ret[i] = render(val[key], key, i);
        }
      }
    }
    if (!isDef(ret)) {
      ret = [];
    }
    ret._isVList = true;
    return ret;
  }
  function renderSlot(name, fallbackRender, props2, bindObject) {
    const scopedSlotFn = this.$scopedSlots[name];
    let nodes;
    if (scopedSlotFn) {
      props2 = props2 || {};
      if (bindObject) {
        if (!isObject2(bindObject)) {
          warn("slot v-bind without argument expects an Object", this);
        }
        props2 = extend(extend({}, bindObject), props2);
      }
      nodes = scopedSlotFn(props2) || (isFunction(fallbackRender) ? fallbackRender() : fallbackRender);
    } else {
      nodes = this.$slots[name] || (isFunction(fallbackRender) ? fallbackRender() : fallbackRender);
    }
    const target3 = props2 && props2.slot;
    if (target3) {
      return this.$createElement("template", { slot: target3 }, nodes);
    } else {
      return nodes;
    }
  }
  function resolveFilter(id) {
    return resolveAsset(this.$options, "filters", id, true) || identity;
  }
  function isKeyNotMatch(expect, actual) {
    if (isArray(expect)) {
      return expect.indexOf(actual) === -1;
    } else {
      return expect !== actual;
    }
  }
  function checkKeyCodes(eventKeyCode, key, builtInKeyCode, eventKeyName, builtInKeyName) {
    const mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
    if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
      return isKeyNotMatch(builtInKeyName, eventKeyName);
    } else if (mappedKeyCode) {
      return isKeyNotMatch(mappedKeyCode, eventKeyCode);
    } else if (eventKeyName) {
      return hyphenate(eventKeyName) !== key;
    }
    return eventKeyCode === void 0;
  }
  function bindObjectProps(data, tag, value, asProp, isSync) {
    if (value) {
      if (!isObject2(value)) {
        warn("v-bind without argument expects an Object or Array value", this);
      } else {
        if (isArray(value)) {
          value = toObject(value);
        }
        let hash;
        for (const key in value) {
          if (key === "class" || key === "style" || isReservedAttribute(key)) {
            hash = data;
          } else {
            const type = data.attrs && data.attrs.type;
            hash = asProp || config.mustUseProp(tag, type, key) ? data.domProps || (data.domProps = {}) : data.attrs || (data.attrs = {});
          }
          const camelizedKey = camelize(key);
          const hyphenatedKey = hyphenate(key);
          if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
            hash[key] = value[key];
            if (isSync) {
              const on = data.on || (data.on = {});
              on[`update:${key}`] = function($event) {
                value[key] = $event;
              };
            }
          }
        }
      }
    }
    return data;
  }
  function renderStatic(index3, isInFor) {
    const cached2 = this._staticTrees || (this._staticTrees = []);
    let tree = cached2[index3];
    if (tree && !isInFor) {
      return tree;
    }
    tree = cached2[index3] = this.$options.staticRenderFns[index3].call(
      this._renderProxy,
      this._c,
      this
      // for render fns generated for functional component templates
    );
    markStatic(tree, `__static__${index3}`, false);
    return tree;
  }
  function markOnce(tree, index3, key) {
    markStatic(tree, `__once__${index3}${key ? `_${key}` : ``}`, true);
    return tree;
  }
  function markStatic(tree, key, isOnce) {
    if (isArray(tree)) {
      for (let i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== "string") {
          markStaticNode(tree[i], `${key}_${i}`, isOnce);
        }
      }
    } else {
      markStaticNode(tree, key, isOnce);
    }
  }
  function markStaticNode(node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
  }
  function bindObjectListeners(data, value) {
    if (value) {
      if (!isPlainObject2(value)) {
        warn("v-on without argument expects an Object value", this);
      } else {
        const on = data.on = data.on ? extend({}, data.on) : {};
        for (const key in value) {
          const existing = on[key];
          const ours = value[key];
          on[key] = existing ? [].concat(existing, ours) : ours;
        }
      }
    }
    return data;
  }
  function resolveScopedSlots(fns, res, hasDynamicKeys, contentHashKey) {
    res = res || { $stable: !hasDynamicKeys };
    for (let i = 0; i < fns.length; i++) {
      const slot = fns[i];
      if (isArray(slot)) {
        resolveScopedSlots(slot, res, hasDynamicKeys);
      } else if (slot) {
        if (slot.proxy) {
          slot.fn.proxy = true;
        }
        res[slot.key] = slot.fn;
      }
    }
    if (contentHashKey) {
      res.$key = contentHashKey;
    }
    return res;
  }
  function bindDynamicKeys(baseObj, values) {
    for (let i = 0; i < values.length; i += 2) {
      const key = values[i];
      if (typeof key === "string" && key) {
        baseObj[values[i]] = values[i + 1];
      } else if (key !== "" && key !== null) {
        warn(`Invalid value for dynamic directive argument (expected string or null): ${key}`, this);
      }
    }
    return baseObj;
  }
  function prependModifier(value, symbol) {
    return typeof value === "string" ? symbol + value : value;
  }
  function installRenderHelpers(target3) {
    target3._o = markOnce;
    target3._n = toNumber;
    target3._s = toString;
    target3._l = renderList;
    target3._t = renderSlot;
    target3._q = looseEqual;
    target3._i = looseIndexOf;
    target3._m = renderStatic;
    target3._f = resolveFilter;
    target3._k = checkKeyCodes;
    target3._b = bindObjectProps;
    target3._v = createTextVNode;
    target3._e = createEmptyVNode;
    target3._u = resolveScopedSlots;
    target3._g = bindObjectListeners;
    target3._d = bindDynamicKeys;
    target3._p = prependModifier;
  }
  function resolveSlots(children, context) {
    if (!children || !children.length) {
      return {};
    }
    const slots = {};
    for (let i = 0, l = children.length; i < l; i++) {
      const child = children[i];
      const data = child.data;
      if (data && data.attrs && data.attrs.slot) {
        delete data.attrs.slot;
      }
      if ((child.context === context || child.fnContext === context) && data && data.slot != null) {
        const name = data.slot;
        const slot = slots[name] || (slots[name] = []);
        if (child.tag === "template") {
          slot.push.apply(slot, child.children || []);
        } else {
          slot.push(child);
        }
      } else {
        (slots.default || (slots.default = [])).push(child);
      }
    }
    for (const name in slots) {
      if (slots[name].every(isWhitespace)) {
        delete slots[name];
      }
    }
    return slots;
  }
  function isWhitespace(node) {
    return node.isComment && !node.asyncFactory || node.text === " ";
  }
  function isAsyncPlaceholder(node) {
    return node.isComment && node.asyncFactory;
  }
  function normalizeScopedSlots(ownerVm, scopedSlots, normalSlots, prevScopedSlots) {
    let res;
    const hasNormalSlots = Object.keys(normalSlots).length > 0;
    const isStable = scopedSlots ? !!scopedSlots.$stable : !hasNormalSlots;
    const key = scopedSlots && scopedSlots.$key;
    if (!scopedSlots) {
      res = {};
    } else if (scopedSlots._normalized) {
      return scopedSlots._normalized;
    } else if (isStable && prevScopedSlots && prevScopedSlots !== emptyObject && key === prevScopedSlots.$key && !hasNormalSlots && !prevScopedSlots.$hasNormal) {
      return prevScopedSlots;
    } else {
      res = {};
      for (const key2 in scopedSlots) {
        if (scopedSlots[key2] && key2[0] !== "$") {
          res[key2] = normalizeScopedSlot(ownerVm, normalSlots, key2, scopedSlots[key2]);
        }
      }
    }
    for (const key2 in normalSlots) {
      if (!(key2 in res)) {
        res[key2] = proxyNormalSlot(normalSlots, key2);
      }
    }
    if (scopedSlots && Object.isExtensible(scopedSlots)) {
      scopedSlots._normalized = res;
    }
    def(res, "$stable", isStable);
    def(res, "$key", key);
    def(res, "$hasNormal", hasNormalSlots);
    return res;
  }
  function normalizeScopedSlot(vm, normalSlots, key, fn) {
    const normalized = function() {
      const cur = currentInstance;
      setCurrentInstance(vm);
      let res = arguments.length ? fn.apply(null, arguments) : fn({});
      res = res && typeof res === "object" && !isArray(res) ? [res] : normalizeChildren(res);
      const vnode = res && res[0];
      setCurrentInstance(cur);
      return res && (!vnode || res.length === 1 && vnode.isComment && !isAsyncPlaceholder(vnode)) ? void 0 : res;
    };
    if (fn.proxy) {
      Object.defineProperty(normalSlots, key, {
        get: normalized,
        enumerable: true,
        configurable: true
      });
    }
    return normalized;
  }
  function proxyNormalSlot(slots, key) {
    return () => slots[key];
  }
  function initSetup(vm) {
    const options2 = vm.$options;
    const setup = options2.setup;
    if (setup) {
      const ctx = vm._setupContext = createSetupContext(vm);
      setCurrentInstance(vm);
      pushTarget();
      const setupResult = invokeWithErrorHandling(setup, null, [vm._props || shallowReactive2({}), ctx], vm, `setup`);
      popTarget();
      setCurrentInstance();
      if (isFunction(setupResult)) {
        options2.render = setupResult;
      } else if (isObject2(setupResult)) {
        if (setupResult instanceof VNode) {
          warn(`setup() should not return VNodes directly - return a render function instead.`);
        }
        vm._setupState = setupResult;
        if (!setupResult.__sfc) {
          for (const key in setupResult) {
            if (!isReserved(key)) {
              proxyWithRefUnwrap(vm, setupResult, key);
            } else {
              warn(`Avoid using variables that start with _ or $ in setup().`);
            }
          }
        } else {
          const proxy2 = vm._setupProxy = {};
          for (const key in setupResult) {
            if (key !== "__sfc") {
              proxyWithRefUnwrap(proxy2, setupResult, key);
            }
          }
        }
      } else if (setupResult !== void 0) {
        warn(`setup() should return an object. Received: ${setupResult === null ? "null" : typeof setupResult}`);
      }
    }
  }
  function createSetupContext(vm) {
    let exposeCalled = false;
    return {
      get attrs() {
        if (!vm._attrsProxy) {
          const proxy2 = vm._attrsProxy = {};
          def(proxy2, "_v_attr_proxy", true);
          syncSetupProxy(proxy2, vm.$attrs, emptyObject, vm, "$attrs");
        }
        return vm._attrsProxy;
      },
      get listeners() {
        if (!vm._listenersProxy) {
          const proxy2 = vm._listenersProxy = {};
          syncSetupProxy(proxy2, vm.$listeners, emptyObject, vm, "$listeners");
        }
        return vm._listenersProxy;
      },
      get slots() {
        return initSlotsProxy(vm);
      },
      emit: bind(vm.$emit, vm),
      expose(exposed) {
        {
          if (exposeCalled) {
            warn(`expose() should be called only once per setup().`, vm);
          }
          exposeCalled = true;
        }
        if (exposed) {
          Object.keys(exposed).forEach((key) => proxyWithRefUnwrap(vm, exposed, key));
        }
      }
    };
  }
  function syncSetupProxy(to, from, prev, instance, type) {
    let changed = false;
    for (const key in from) {
      if (!(key in to)) {
        changed = true;
        defineProxyAttr(to, key, instance, type);
      } else if (from[key] !== prev[key]) {
        changed = true;
      }
    }
    for (const key in to) {
      if (!(key in from)) {
        changed = true;
        delete to[key];
      }
    }
    return changed;
  }
  function defineProxyAttr(proxy2, key, instance, type) {
    Object.defineProperty(proxy2, key, {
      enumerable: true,
      configurable: true,
      get() {
        return instance[type][key];
      }
    });
  }
  function initSlotsProxy(vm) {
    if (!vm._slotsProxy) {
      syncSetupSlots(vm._slotsProxy = {}, vm.$scopedSlots);
    }
    return vm._slotsProxy;
  }
  function syncSetupSlots(to, from) {
    for (const key in from) {
      to[key] = from[key];
    }
    for (const key in to) {
      if (!(key in from)) {
        delete to[key];
      }
    }
  }
  function useSlots2() {
    return getContext().slots;
  }
  function useAttrs2() {
    return getContext().attrs;
  }
  function useListeners() {
    return getContext().listeners;
  }
  function getContext() {
    if (!currentInstance) {
      warn(`useContext() called without active instance.`);
    }
    const vm = currentInstance;
    return vm._setupContext || (vm._setupContext = createSetupContext(vm));
  }
  function mergeDefaults2(raw, defaults2) {
    const props2 = isArray(raw) ? raw.reduce((normalized, p) => (normalized[p] = {}, normalized), {}) : raw;
    for (const key in defaults2) {
      const opt = props2[key];
      if (opt) {
        if (isArray(opt) || isFunction(opt)) {
          props2[key] = { type: opt, default: defaults2[key] };
        } else {
          opt.default = defaults2[key];
        }
      } else if (opt === null) {
        props2[key] = { default: defaults2[key] };
      } else {
        warn(`props default key "${key}" has no corresponding declaration.`);
      }
    }
    return props2;
  }
  function initRender(vm) {
    vm._vnode = null;
    vm._staticTrees = null;
    const options2 = vm.$options;
    const parentVnode = vm.$vnode = options2._parentVnode;
    const renderContext = parentVnode && parentVnode.context;
    vm.$slots = resolveSlots(options2._renderChildren, renderContext);
    vm.$scopedSlots = parentVnode ? normalizeScopedSlots(vm.$parent, parentVnode.data.scopedSlots, vm.$slots) : emptyObject;
    vm._c = (a, b, c, d) => createElement$1(vm, a, b, c, d, false);
    vm.$createElement = (a, b, c, d) => createElement$1(vm, a, b, c, d, true);
    const parentData = parentVnode && parentVnode.data;
    {
      defineReactive(vm, "$attrs", parentData && parentData.attrs || emptyObject, () => {
        !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm);
      }, true);
      defineReactive(vm, "$listeners", options2._parentListeners || emptyObject, () => {
        !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm);
      }, true);
    }
  }
  let currentRenderingInstance = null;
  function renderMixin(Vue3) {
    installRenderHelpers(Vue3.prototype);
    Vue3.prototype.$nextTick = function(fn) {
      return nextTick2(fn, this);
    };
    Vue3.prototype._render = function() {
      const vm = this;
      const { render, _parentVnode } = vm.$options;
      if (_parentVnode && vm._isMounted) {
        vm.$scopedSlots = normalizeScopedSlots(vm.$parent, _parentVnode.data.scopedSlots, vm.$slots, vm.$scopedSlots);
        if (vm._slotsProxy) {
          syncSetupSlots(vm._slotsProxy, vm.$scopedSlots);
        }
      }
      vm.$vnode = _parentVnode;
      const prevInst = currentInstance;
      const prevRenderInst = currentRenderingInstance;
      let vnode;
      try {
        setCurrentInstance(vm);
        currentRenderingInstance = vm;
        vnode = render.call(vm._renderProxy, vm.$createElement);
      } catch (e) {
        handleError(e, vm, `render`);
        if (vm.$options.renderError) {
          try {
            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
          } catch (e2) {
            handleError(e2, vm, `renderError`);
            vnode = vm._vnode;
          }
        } else {
          vnode = vm._vnode;
        }
      } finally {
        currentRenderingInstance = prevRenderInst;
        setCurrentInstance(prevInst);
      }
      if (isArray(vnode) && vnode.length === 1) {
        vnode = vnode[0];
      }
      if (!(vnode instanceof VNode)) {
        if (isArray(vnode)) {
          warn("Multiple root nodes returned from render function. Render function should return a single root node.", vm);
        }
        vnode = createEmptyVNode();
      }
      vnode.parent = _parentVnode;
      return vnode;
    };
  }
  function ensureCtor(comp, base) {
    if (comp.__esModule || hasSymbol && comp[Symbol.toStringTag] === "Module") {
      comp = comp.default;
    }
    return isObject2(comp) ? base.extend(comp) : comp;
  }
  function createAsyncPlaceholder(factory, data, context, children, tag) {
    const node = createEmptyVNode();
    node.asyncFactory = factory;
    node.asyncMeta = { data, context, children, tag };
    return node;
  }
  function resolveAsyncComponent(factory, baseCtor) {
    if (isTrue(factory.error) && isDef(factory.errorComp)) {
      return factory.errorComp;
    }
    if (isDef(factory.resolved)) {
      return factory.resolved;
    }
    const owner = currentRenderingInstance;
    if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
      factory.owners.push(owner);
    }
    if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
      return factory.loadingComp;
    }
    if (owner && !isDef(factory.owners)) {
      const owners = factory.owners = [owner];
      let sync = true;
      let timerLoading = null;
      let timerTimeout = null;
      owner.$on("hook:destroyed", () => remove$2(owners, owner));
      const forceRender = (renderCompleted) => {
        for (let i = 0, l = owners.length; i < l; i++) {
          owners[i].$forceUpdate();
        }
        if (renderCompleted) {
          owners.length = 0;
          if (timerLoading !== null) {
            clearTimeout(timerLoading);
            timerLoading = null;
          }
          if (timerTimeout !== null) {
            clearTimeout(timerTimeout);
            timerTimeout = null;
          }
        }
      };
      const resolve2 = once((res2) => {
        factory.resolved = ensureCtor(res2, baseCtor);
        if (!sync) {
          forceRender(true);
        } else {
          owners.length = 0;
        }
      });
      const reject = once((reason) => {
        warn(`Failed to resolve async component: ${String(factory)}` + (reason ? `
Reason: ${reason}` : ""));
        if (isDef(factory.errorComp)) {
          factory.error = true;
          forceRender(true);
        }
      });
      const res = factory(resolve2, reject);
      if (isObject2(res)) {
        if (isPromise2(res)) {
          if (isUndef(factory.resolved)) {
            res.then(resolve2, reject);
          }
        } else if (isPromise2(res.component)) {
          res.component.then(resolve2, reject);
          if (isDef(res.error)) {
            factory.errorComp = ensureCtor(res.error, baseCtor);
          }
          if (isDef(res.loading)) {
            factory.loadingComp = ensureCtor(res.loading, baseCtor);
            if (res.delay === 0) {
              factory.loading = true;
            } else {
              timerLoading = setTimeout(() => {
                timerLoading = null;
                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                  factory.loading = true;
                  forceRender(false);
                }
              }, res.delay || 200);
            }
          }
          if (isDef(res.timeout)) {
            timerTimeout = setTimeout(() => {
              timerTimeout = null;
              if (isUndef(factory.resolved)) {
                reject(`timeout (${res.timeout}ms)`);
              }
            }, res.timeout);
          }
        }
      }
      sync = false;
      return factory.loading ? factory.loadingComp : factory.resolved;
    }
  }
  function getFirstComponentChild(children) {
    if (isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        const c = children[i];
        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c;
        }
      }
    }
  }
  const SIMPLE_NORMALIZE = 1;
  const ALWAYS_NORMALIZE = 2;
  function createElement$1(context, tag, data, children, normalizationType, alwaysNormalize) {
    if (isArray(data) || isPrimitive(data)) {
      normalizationType = children;
      children = data;
      data = void 0;
    }
    if (isTrue(alwaysNormalize)) {
      normalizationType = ALWAYS_NORMALIZE;
    }
    return _createElement(context, tag, data, children, normalizationType);
  }
  function _createElement(context, tag, data, children, normalizationType) {
    if (isDef(data) && isDef(data.__ob__)) {
      warn(`Avoid using observed data object as vnode data: ${JSON.stringify(data)}
Always create fresh vnode data objects in each render!`, context);
      return createEmptyVNode();
    }
    if (isDef(data) && isDef(data.is)) {
      tag = data.is;
    }
    if (!tag) {
      return createEmptyVNode();
    }
    if (isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
      warn("Avoid using non-primitive value as key, use string/number value instead.", context);
    }
    if (isArray(children) && isFunction(children[0])) {
      data = data || {};
      data.scopedSlots = { default: children[0] };
      children.length = 0;
    }
    if (normalizationType === ALWAYS_NORMALIZE) {
      children = normalizeChildren(children);
    } else if (normalizationType === SIMPLE_NORMALIZE) {
      children = simpleNormalizeChildren(children);
    }
    let vnode, ns;
    if (typeof tag === "string") {
      let Ctor;
      ns = context.$vnode && context.$vnode.ns || config.getTagNamespace(tag);
      if (config.isReservedTag(tag)) {
        if (isDef(data) && isDef(data.nativeOn) && data.tag !== "component") {
          warn(`The .native modifier for v-on is only valid on components but it was used on <${tag}>.`, context);
        }
        vnode = new VNode(config.parsePlatformTagName(tag), data, children, void 0, void 0, context);
      } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, "components", tag))) {
        vnode = createComponent(Ctor, data, context, children, tag);
      } else {
        vnode = new VNode(tag, data, children, void 0, void 0, context);
      }
    } else {
      vnode = createComponent(tag, data, context, children);
    }
    if (isArray(vnode)) {
      return vnode;
    } else if (isDef(vnode)) {
      if (isDef(ns))
        applyNS(vnode, ns);
      if (isDef(data))
        registerDeepBindings(data);
      return vnode;
    } else {
      return createEmptyVNode();
    }
  }
  function applyNS(vnode, ns, force) {
    vnode.ns = ns;
    if (vnode.tag === "foreignObject") {
      ns = void 0;
      force = true;
    }
    if (isDef(vnode.children)) {
      for (let i = 0, l = vnode.children.length; i < l; i++) {
        const child = vnode.children[i];
        if (isDef(child.tag) && (isUndef(child.ns) || isTrue(force) && child.tag !== "svg")) {
          applyNS(child, ns, force);
        }
      }
    }
  }
  function registerDeepBindings(data) {
    if (isObject2(data.style)) {
      traverse(data.style);
    }
    if (isObject2(data.class)) {
      traverse(data.class);
    }
  }
  function h2(type, props2, children) {
    if (!currentInstance) {
      warn(`globally imported h() can only be invoked when there is an active component instance, e.g. synchronously in a component's render or setup function.`);
    }
    return createElement$1(currentInstance, type, props2, children, 2, true);
  }
  function handleError(err, vm, info) {
    pushTarget();
    try {
      if (vm) {
        let cur = vm;
        while (cur = cur.$parent) {
          const hooks2 = cur.$options.errorCaptured;
          if (hooks2) {
            for (let i = 0; i < hooks2.length; i++) {
              try {
                const capture = hooks2[i].call(cur, err, vm, info) === false;
                if (capture)
                  return;
              } catch (e) {
                globalHandleError(e, cur, "errorCaptured hook");
              }
            }
          }
        }
      }
      globalHandleError(err, vm, info);
    } finally {
      popTarget();
    }
  }
  function invokeWithErrorHandling(handler, context, args, vm, info) {
    let res;
    try {
      res = args ? handler.apply(context, args) : handler.call(context);
      if (res && !res._isVue && isPromise2(res) && !res._handled) {
        res.catch((e) => handleError(e, vm, info + ` (Promise/async)`));
        res._handled = true;
      }
    } catch (e) {
      handleError(e, vm, info);
    }
    return res;
  }
  function globalHandleError(err, vm, info) {
    if (config.errorHandler) {
      try {
        return config.errorHandler.call(null, err, vm, info);
      } catch (e) {
        if (e !== err) {
          logError(e, null, "config.errorHandler");
        }
      }
    }
    logError(err, vm, info);
  }
  function logError(err, vm, info) {
    {
      warn(`Error in ${info}: "${err.toString()}"`, vm);
    }
    if (inBrowser && typeof console !== "undefined") {
      console.error(err);
    } else {
      throw err;
    }
  }
  let isUsingMicroTask = false;
  const callbacks = [];
  let pending = false;
  function flushCallbacks() {
    pending = false;
    const copies = callbacks.slice(0);
    callbacks.length = 0;
    for (let i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }
  let timerFunc;
  if (typeof Promise !== "undefined" && isNative(Promise)) {
    const p = Promise.resolve();
    timerFunc = () => {
      p.then(flushCallbacks);
      if (isIOS)
        setTimeout(noop2);
    };
    isUsingMicroTask = true;
  } else if (!isIE && typeof MutationObserver !== "undefined" && (isNative(MutationObserver) || // PhantomJS and iOS 7.x
  MutationObserver.toString() === "[object MutationObserverConstructor]")) {
    let counter = 1;
    const observer = new MutationObserver(flushCallbacks);
    const textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = () => {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
    isUsingMicroTask = true;
  } else if (typeof setImmediate !== "undefined" && isNative(setImmediate)) {
    timerFunc = () => {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = () => {
      setTimeout(flushCallbacks, 0);
    };
  }
  function nextTick2(cb, ctx) {
    let _resolve;
    callbacks.push(() => {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, "nextTick");
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    if (!pending) {
      pending = true;
      timerFunc();
    }
    if (!cb && typeof Promise !== "undefined") {
      return new Promise((resolve2) => {
        _resolve = resolve2;
      });
    }
  }
  function useCssModule2(name = "$style") {
    {
      if (!currentInstance) {
        warn(`useCssModule must be called inside setup()`);
        return emptyObject;
      }
      const mod = currentInstance[name];
      if (!mod) {
        warn(`Current instance does not have CSS module named "${name}".`);
        return emptyObject;
      }
      return mod;
    }
  }
  function useCssVars2(getter) {
    if (!inBrowser && true)
      return;
    const instance = currentInstance;
    if (!instance) {
      warn(`useCssVars is called without current active component instance.`);
      return;
    }
    watchPostEffect2(() => {
      const el = instance.$el;
      const vars = getter(instance, instance._setupProxy);
      if (el && el.nodeType === 1) {
        const style2 = el.style;
        for (const key in vars) {
          style2.setProperty(`--${key}`, vars[key]);
        }
      }
    });
  }
  function defineAsyncComponent2(source) {
    if (isFunction(source)) {
      source = { loader: source };
    }
    const {
      loader,
      loadingComponent,
      errorComponent,
      delay = 200,
      timeout,
      // undefined = never times out
      suspensible = false,
      // in Vue 3 default is true
      onError: userOnError
    } = source;
    if (suspensible) {
      warn(`The suspensible option for async components is not supported in Vue2. It is ignored.`);
    }
    let pendingRequest = null;
    let retries = 0;
    const retry2 = () => {
      retries++;
      pendingRequest = null;
      return load();
    };
    const load = () => {
      let thisRequest;
      return pendingRequest || (thisRequest = pendingRequest = loader().catch((err) => {
        err = err instanceof Error ? err : new Error(String(err));
        if (userOnError) {
          return new Promise((resolve2, reject) => {
            const userRetry = () => resolve2(retry2());
            const userFail = () => reject(err);
            userOnError(err, userRetry, userFail, retries + 1);
          });
        } else {
          throw err;
        }
      }).then((comp) => {
        if (thisRequest !== pendingRequest && pendingRequest) {
          return pendingRequest;
        }
        if (!comp) {
          warn(`Async component loader resolved to undefined. If you are using retry(), make sure to return its return value.`);
        }
        if (comp && (comp.__esModule || comp[Symbol.toStringTag] === "Module")) {
          comp = comp.default;
        }
        if (comp && !isObject2(comp) && !isFunction(comp)) {
          throw new Error(`Invalid async component load result: ${comp}`);
        }
        return comp;
      }));
    };
    return () => {
      const component = load();
      return {
        component,
        delay,
        timeout,
        error: errorComponent,
        loading: loadingComponent
      };
    };
  }
  function createLifeCycle(hookName) {
    return (fn, target3 = currentInstance) => {
      if (!target3) {
        warn(`${formatName(hookName)} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup().`);
        return;
      }
      return injectHook(target3, hookName, fn);
    };
  }
  function formatName(name) {
    if (name === "beforeDestroy") {
      name = "beforeUnmount";
    } else if (name === "destroyed") {
      name = "unmounted";
    }
    return `on${name[0].toUpperCase() + name.slice(1)}`;
  }
  function injectHook(instance, hookName, fn) {
    const options2 = instance.$options;
    options2[hookName] = mergeLifecycleHook(options2[hookName], fn);
  }
  const onBeforeMount2 = createLifeCycle("beforeMount");
  const onMounted2 = createLifeCycle("mounted");
  const onBeforeUpdate2 = createLifeCycle("beforeUpdate");
  const onUpdated2 = createLifeCycle("updated");
  const onBeforeUnmount2 = createLifeCycle("beforeDestroy");
  const onUnmounted2 = createLifeCycle("destroyed");
  const onActivated2 = createLifeCycle("activated");
  const onDeactivated2 = createLifeCycle("deactivated");
  const onServerPrefetch2 = createLifeCycle("serverPrefetch");
  const onRenderTracked2 = createLifeCycle("renderTracked");
  const onRenderTriggered2 = createLifeCycle("renderTriggered");
  const injectErrorCapturedHook = createLifeCycle("errorCaptured");
  function onErrorCaptured2(hook, target3 = currentInstance) {
    injectErrorCapturedHook(hook, target3);
  }
  const version2 = "2.7.16";
  function defineComponent2(options2) {
    return options2;
  }
  var vca = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    version: version2,
    defineComponent: defineComponent2,
    ref: ref$1,
    shallowRef: shallowRef2,
    isRef: isRef2,
    toRef: toRef2,
    toRefs: toRefs2,
    unref: unref2,
    proxyRefs: proxyRefs2,
    customRef: customRef2,
    triggerRef: triggerRef2,
    reactive: reactive2,
    isReactive: isReactive2,
    isReadonly: isReadonly2,
    isShallow: isShallow2,
    isProxy: isProxy2,
    shallowReactive: shallowReactive2,
    markRaw: markRaw2,
    toRaw: toRaw2,
    readonly: readonly2,
    shallowReadonly: shallowReadonly2,
    computed: computed2,
    watch: watch3,
    watchEffect: watchEffect2,
    watchPostEffect: watchPostEffect2,
    watchSyncEffect: watchSyncEffect2,
    EffectScope,
    effectScope: effectScope2,
    onScopeDispose: onScopeDispose2,
    getCurrentScope: getCurrentScope2,
    provide: provide2,
    inject: inject2,
    h: h2,
    getCurrentInstance: getCurrentInstance2,
    useSlots: useSlots2,
    useAttrs: useAttrs2,
    useListeners,
    mergeDefaults: mergeDefaults2,
    nextTick: nextTick2,
    set: set2,
    del: del2,
    useCssModule: useCssModule2,
    useCssVars: useCssVars2,
    defineAsyncComponent: defineAsyncComponent2,
    onBeforeMount: onBeforeMount2,
    onMounted: onMounted2,
    onBeforeUpdate: onBeforeUpdate2,
    onUpdated: onUpdated2,
    onBeforeUnmount: onBeforeUnmount2,
    onUnmounted: onUnmounted2,
    onActivated: onActivated2,
    onDeactivated: onDeactivated2,
    onServerPrefetch: onServerPrefetch2,
    onRenderTracked: onRenderTracked2,
    onRenderTriggered: onRenderTriggered2,
    onErrorCaptured: onErrorCaptured2
  });
  const seenObjects = new _Set();
  function traverse(val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
    return val;
  }
  function _traverse(val, seen) {
    let i, keys;
    const isA = isArray(val);
    if (!isA && !isObject2(val) || val.__v_skip || Object.isFrozen(val) || val instanceof VNode) {
      return;
    }
    if (val.__ob__) {
      const depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return;
      }
      seen.add(depId);
    }
    if (isA) {
      i = val.length;
      while (i--)
        _traverse(val[i], seen);
    } else if (isRef2(val)) {
      _traverse(val.value, seen);
    } else {
      keys = Object.keys(val);
      i = keys.length;
      while (i--)
        _traverse(val[keys[i]], seen);
    }
  }
  let uid$1 = 0;
  class Watcher {
    constructor(vm, expOrFn, cb, options2, isRenderWatcher) {
      recordEffectScope(
        this,
        // if the active effect scope is manually created (not a component scope),
        // prioritize it
        activeEffectScope && !activeEffectScope._vm ? activeEffectScope : vm ? vm._scope : void 0
      );
      if ((this.vm = vm) && isRenderWatcher) {
        vm._watcher = this;
      }
      if (options2) {
        this.deep = !!options2.deep;
        this.user = !!options2.user;
        this.lazy = !!options2.lazy;
        this.sync = !!options2.sync;
        this.before = options2.before;
        {
          this.onTrack = options2.onTrack;
          this.onTrigger = options2.onTrigger;
        }
      } else {
        this.deep = this.user = this.lazy = this.sync = false;
      }
      this.cb = cb;
      this.id = ++uid$1;
      this.active = true;
      this.post = false;
      this.dirty = this.lazy;
      this.deps = [];
      this.newDeps = [];
      this.depIds = new _Set();
      this.newDepIds = new _Set();
      this.expression = expOrFn.toString();
      if (isFunction(expOrFn)) {
        this.getter = expOrFn;
      } else {
        this.getter = parsePath(expOrFn);
        if (!this.getter) {
          this.getter = noop2;
          warn(`Failed watching path: "${expOrFn}" Watcher only accepts simple dot-delimited paths. For full control, use a function instead.`, vm);
        }
      }
      this.value = this.lazy ? void 0 : this.get();
    }
    /**
     * Evaluate the getter, and re-collect dependencies.
     */
    get() {
      pushTarget(this);
      let value;
      const vm = this.vm;
      try {
        value = this.getter.call(vm, vm);
      } catch (e) {
        if (this.user) {
          handleError(e, vm, `getter for watcher "${this.expression}"`);
        } else {
          throw e;
        }
      } finally {
        if (this.deep) {
          traverse(value);
        }
        popTarget();
        this.cleanupDeps();
      }
      return value;
    }
    /**
     * Add a dependency to this directive.
     */
    addDep(dep) {
      const id = dep.id;
      if (!this.newDepIds.has(id)) {
        this.newDepIds.add(id);
        this.newDeps.push(dep);
        if (!this.depIds.has(id)) {
          dep.addSub(this);
        }
      }
    }
    /**
     * Clean up for dependency collection.
     */
    cleanupDeps() {
      let i = this.deps.length;
      while (i--) {
        const dep = this.deps[i];
        if (!this.newDepIds.has(dep.id)) {
          dep.removeSub(this);
        }
      }
      let tmp = this.depIds;
      this.depIds = this.newDepIds;
      this.newDepIds = tmp;
      this.newDepIds.clear();
      tmp = this.deps;
      this.deps = this.newDeps;
      this.newDeps = tmp;
      this.newDeps.length = 0;
    }
    /**
     * Subscriber interface.
     * Will be called when a dependency changes.
     */
    update() {
      if (this.lazy) {
        this.dirty = true;
      } else if (this.sync) {
        this.run();
      } else {
        queueWatcher(this);
      }
    }
    /**
     * Scheduler job interface.
     * Will be called by the scheduler.
     */
    run() {
      if (this.active) {
        const value = this.get();
        if (value !== this.value || // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject2(value) || this.deep) {
          const oldValue = this.value;
          this.value = value;
          if (this.user) {
            const info = `callback for watcher "${this.expression}"`;
            invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info);
          } else {
            this.cb.call(this.vm, value, oldValue);
          }
        }
      }
    }
    /**
     * Evaluate the value of the watcher.
     * This only gets called for lazy watchers.
     */
    evaluate() {
      this.value = this.get();
      this.dirty = false;
    }
    /**
     * Depend on all deps collected by this watcher.
     */
    depend() {
      let i = this.deps.length;
      while (i--) {
        this.deps[i].depend();
      }
    }
    /**
     * Remove self from all dependencies' subscriber list.
     */
    teardown() {
      if (this.vm && !this.vm._isBeingDestroyed) {
        remove$2(this.vm._scope.effects, this);
      }
      if (this.active) {
        let i = this.deps.length;
        while (i--) {
          this.deps[i].removeSub(this);
        }
        this.active = false;
        if (this.onStop) {
          this.onStop();
        }
      }
    }
  }
  let mark;
  let measure;
  {
    const perf = inBrowser && window.performance;
    if (perf && // @ts-ignore
    perf.mark && // @ts-ignore
    perf.measure && // @ts-ignore
    perf.clearMarks && // @ts-ignore
    perf.clearMeasures) {
      mark = (tag) => perf.mark(tag);
      measure = (name, startTag, endTag) => {
        perf.measure(name, startTag, endTag);
        perf.clearMarks(startTag);
        perf.clearMarks(endTag);
      };
    }
  }
  function initEvents(vm) {
    vm._events = /* @__PURE__ */ Object.create(null);
    vm._hasHookEvent = false;
    const listeners = vm.$options._parentListeners;
    if (listeners) {
      updateComponentListeners(vm, listeners);
    }
  }
  let target$1;
  function add$1(event, fn) {
    target$1.$on(event, fn);
  }
  function remove$1(event, fn) {
    target$1.$off(event, fn);
  }
  function createOnceHandler$1(event, fn) {
    const _target = target$1;
    return function onceHandler() {
      const res = fn.apply(null, arguments);
      if (res !== null) {
        _target.$off(event, onceHandler);
      }
    };
  }
  function updateComponentListeners(vm, listeners, oldListeners) {
    target$1 = vm;
    updateListeners(listeners, oldListeners || {}, add$1, remove$1, createOnceHandler$1, vm);
    target$1 = void 0;
  }
  function eventsMixin(Vue3) {
    const hookRE = /^hook:/;
    Vue3.prototype.$on = function(event, fn) {
      const vm = this;
      if (isArray(event)) {
        for (let i = 0, l = event.length; i < l; i++) {
          vm.$on(event[i], fn);
        }
      } else {
        (vm._events[event] || (vm._events[event] = [])).push(fn);
        if (hookRE.test(event)) {
          vm._hasHookEvent = true;
        }
      }
      return vm;
    };
    Vue3.prototype.$once = function(event, fn) {
      const vm = this;
      function on() {
        vm.$off(event, on);
        fn.apply(vm, arguments);
      }
      on.fn = fn;
      vm.$on(event, on);
      return vm;
    };
    Vue3.prototype.$off = function(event, fn) {
      const vm = this;
      if (!arguments.length) {
        vm._events = /* @__PURE__ */ Object.create(null);
        return vm;
      }
      if (isArray(event)) {
        for (let i2 = 0, l = event.length; i2 < l; i2++) {
          vm.$off(event[i2], fn);
        }
        return vm;
      }
      const cbs = vm._events[event];
      if (!cbs) {
        return vm;
      }
      if (!fn) {
        vm._events[event] = null;
        return vm;
      }
      let cb;
      let i = cbs.length;
      while (i--) {
        cb = cbs[i];
        if (cb === fn || cb.fn === fn) {
          cbs.splice(i, 1);
          break;
        }
      }
      return vm;
    };
    Vue3.prototype.$emit = function(event) {
      const vm = this;
      {
        const lowerCaseEvent = event.toLowerCase();
        if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
          tip(`Event "${lowerCaseEvent}" is emitted in component ${formatComponentName(vm)} but the handler is registered for "${event}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${hyphenate(event)}" instead of "${event}".`);
        }
      }
      let cbs = vm._events[event];
      if (cbs) {
        cbs = cbs.length > 1 ? toArray(cbs) : cbs;
        const args = toArray(arguments, 1);
        const info = `event handler for "${event}"`;
        for (let i = 0, l = cbs.length; i < l; i++) {
          invokeWithErrorHandling(cbs[i], vm, args, vm, info);
        }
      }
      return vm;
    };
  }
  let activeInstance = null;
  let isUpdatingChildComponent = false;
  function setActiveInstance(vm) {
    const prevActiveInstance = activeInstance;
    activeInstance = vm;
    return () => {
      activeInstance = prevActiveInstance;
    };
  }
  function initLifecycle(vm) {
    const options2 = vm.$options;
    let parent = options2.parent;
    if (parent && !options2.abstract) {
      while (parent.$options.abstract && parent.$parent) {
        parent = parent.$parent;
      }
      parent.$children.push(vm);
    }
    vm.$parent = parent;
    vm.$root = parent ? parent.$root : vm;
    vm.$children = [];
    vm.$refs = {};
    vm._provided = parent ? parent._provided : /* @__PURE__ */ Object.create(null);
    vm._watcher = null;
    vm._inactive = null;
    vm._directInactive = false;
    vm._isMounted = false;
    vm._isDestroyed = false;
    vm._isBeingDestroyed = false;
  }
  function lifecycleMixin(Vue3) {
    Vue3.prototype._update = function(vnode, hydrating) {
      const vm = this;
      const prevEl = vm.$el;
      const prevVnode = vm._vnode;
      const restoreActiveInstance = setActiveInstance(vm);
      vm._vnode = vnode;
      if (!prevVnode) {
        vm.$el = vm.__patch__(
          vm.$el,
          vnode,
          hydrating,
          false
          /* removeOnly */
        );
      } else {
        vm.$el = vm.__patch__(prevVnode, vnode);
      }
      restoreActiveInstance();
      if (prevEl) {
        prevEl.__vue__ = null;
      }
      if (vm.$el) {
        vm.$el.__vue__ = vm;
      }
      let wrapper = vm;
      while (wrapper && wrapper.$vnode && wrapper.$parent && wrapper.$vnode === wrapper.$parent._vnode) {
        wrapper.$parent.$el = wrapper.$el;
        wrapper = wrapper.$parent;
      }
    };
    Vue3.prototype.$forceUpdate = function() {
      const vm = this;
      if (vm._watcher) {
        vm._watcher.update();
      }
    };
    Vue3.prototype.$destroy = function() {
      const vm = this;
      if (vm._isBeingDestroyed) {
        return;
      }
      callHook$1(vm, "beforeDestroy");
      vm._isBeingDestroyed = true;
      const parent = vm.$parent;
      if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
        remove$2(parent.$children, vm);
      }
      vm._scope.stop();
      if (vm._data.__ob__) {
        vm._data.__ob__.vmCount--;
      }
      vm._isDestroyed = true;
      vm.__patch__(vm._vnode, null);
      callHook$1(vm, "destroyed");
      vm.$off();
      if (vm.$el) {
        vm.$el.__vue__ = null;
      }
      if (vm.$vnode) {
        vm.$vnode.parent = null;
      }
    };
  }
  function mountComponent(vm, el, hydrating) {
    vm.$el = el;
    if (!vm.$options.render) {
      vm.$options.render = createEmptyVNode;
      {
        if (vm.$options.template && vm.$options.template.charAt(0) !== "#" || vm.$options.el || el) {
          warn("You are using the runtime-only build of Vue where the template compiler is not available. Either pre-compile the templates into render functions, or use the compiler-included build.", vm);
        } else {
          warn("Failed to mount component: template or render function not defined.", vm);
        }
      }
    }
    callHook$1(vm, "beforeMount");
    let updateComponent;
    if (config.performance && mark) {
      updateComponent = () => {
        const name = vm._name;
        const id = vm._uid;
        const startTag = `vue-perf-start:${id}`;
        const endTag = `vue-perf-end:${id}`;
        mark(startTag);
        const vnode = vm._render();
        mark(endTag);
        measure(`vue ${name} render`, startTag, endTag);
        mark(startTag);
        vm._update(vnode, hydrating);
        mark(endTag);
        measure(`vue ${name} patch`, startTag, endTag);
      };
    } else {
      updateComponent = () => {
        vm._update(vm._render(), hydrating);
      };
    }
    const watcherOptions = {
      before() {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook$1(vm, "beforeUpdate");
        }
      }
    };
    {
      watcherOptions.onTrack = (e) => callHook$1(vm, "renderTracked", [e]);
      watcherOptions.onTrigger = (e) => callHook$1(vm, "renderTriggered", [e]);
    }
    new Watcher(
      vm,
      updateComponent,
      noop2,
      watcherOptions,
      true
      /* isRenderWatcher */
    );
    hydrating = false;
    const preWatchers = vm._preWatchers;
    if (preWatchers) {
      for (let i = 0; i < preWatchers.length; i++) {
        preWatchers[i].run();
      }
    }
    if (vm.$vnode == null) {
      vm._isMounted = true;
      callHook$1(vm, "mounted");
    }
    return vm;
  }
  function updateChildComponent(vm, propsData, listeners, parentVnode, renderChildren) {
    {
      isUpdatingChildComponent = true;
    }
    const newScopedSlots = parentVnode.data.scopedSlots;
    const oldScopedSlots = vm.$scopedSlots;
    const hasDynamicScopedSlot = !!(newScopedSlots && !newScopedSlots.$stable || oldScopedSlots !== emptyObject && !oldScopedSlots.$stable || newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key || !newScopedSlots && vm.$scopedSlots.$key);
    let needsForceUpdate = !!(renderChildren || // has new static slots
    vm.$options._renderChildren || // has old static slots
    hasDynamicScopedSlot);
    const prevVNode = vm.$vnode;
    vm.$options._parentVnode = parentVnode;
    vm.$vnode = parentVnode;
    if (vm._vnode) {
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren;
    const attrs2 = parentVnode.data.attrs || emptyObject;
    if (vm._attrsProxy) {
      if (syncSetupProxy(vm._attrsProxy, attrs2, prevVNode.data && prevVNode.data.attrs || emptyObject, vm, "$attrs")) {
        needsForceUpdate = true;
      }
    }
    vm.$attrs = attrs2;
    listeners = listeners || emptyObject;
    const prevListeners = vm.$options._parentListeners;
    if (vm._listenersProxy) {
      syncSetupProxy(vm._listenersProxy, listeners, prevListeners || emptyObject, vm, "$listeners");
    }
    vm.$listeners = vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, prevListeners);
    if (propsData && vm.$options.props) {
      toggleObserving(false);
      const props2 = vm._props;
      const propKeys = vm.$options._propKeys || [];
      for (let i = 0; i < propKeys.length; i++) {
        const key = propKeys[i];
        const propOptions = vm.$options.props;
        props2[key] = validateProp(key, propOptions, propsData, vm);
      }
      toggleObserving(true);
      vm.$options.propsData = propsData;
    }
    if (needsForceUpdate) {
      vm.$slots = resolveSlots(renderChildren, parentVnode.context);
      vm.$forceUpdate();
    }
    {
      isUpdatingChildComponent = false;
    }
  }
  function isInInactiveTree(vm) {
    while (vm && (vm = vm.$parent)) {
      if (vm._inactive)
        return true;
    }
    return false;
  }
  function activateChildComponent(vm, direct) {
    if (direct) {
      vm._directInactive = false;
      if (isInInactiveTree(vm)) {
        return;
      }
    } else if (vm._directInactive) {
      return;
    }
    if (vm._inactive || vm._inactive === null) {
      vm._inactive = false;
      for (let i = 0; i < vm.$children.length; i++) {
        activateChildComponent(vm.$children[i]);
      }
      callHook$1(vm, "activated");
    }
  }
  function deactivateChildComponent(vm, direct) {
    if (direct) {
      vm._directInactive = true;
      if (isInInactiveTree(vm)) {
        return;
      }
    }
    if (!vm._inactive) {
      vm._inactive = true;
      for (let i = 0; i < vm.$children.length; i++) {
        deactivateChildComponent(vm.$children[i]);
      }
      callHook$1(vm, "deactivated");
    }
  }
  function callHook$1(vm, hook, args, setContext = true) {
    pushTarget();
    const prevInst = currentInstance;
    const prevScope = getCurrentScope2();
    setContext && setCurrentInstance(vm);
    const handlers = vm.$options[hook];
    const info = `${hook} hook`;
    if (handlers) {
      for (let i = 0, j = handlers.length; i < j; i++) {
        invokeWithErrorHandling(handlers[i], vm, args || null, vm, info);
      }
    }
    if (vm._hasHookEvent) {
      vm.$emit("hook:" + hook);
    }
    if (setContext) {
      setCurrentInstance(prevInst);
      prevScope && prevScope.on();
    }
    popTarget();
  }
  const MAX_UPDATE_COUNT = 100;
  const queue = [];
  const activatedChildren = [];
  let has = {};
  let circular = {};
  let waiting = false;
  let flushing = false;
  let index2 = 0;
  function resetSchedulerState() {
    index2 = queue.length = activatedChildren.length = 0;
    has = {};
    {
      circular = {};
    }
    waiting = flushing = false;
  }
  let currentFlushTimestamp = 0;
  let getNow = Date.now;
  if (inBrowser && !isIE) {
    const performance = window.performance;
    if (performance && typeof performance.now === "function" && getNow() > document.createEvent("Event").timeStamp) {
      getNow = () => performance.now();
    }
  }
  const sortCompareFn = (a, b) => {
    if (a.post) {
      if (!b.post)
        return 1;
    } else if (b.post) {
      return -1;
    }
    return a.id - b.id;
  };
  function flushSchedulerQueue() {
    currentFlushTimestamp = getNow();
    flushing = true;
    let watcher, id;
    queue.sort(sortCompareFn);
    for (index2 = 0; index2 < queue.length; index2++) {
      watcher = queue[index2];
      if (watcher.before) {
        watcher.before();
      }
      id = watcher.id;
      has[id] = null;
      watcher.run();
      if (has[id] != null) {
        circular[id] = (circular[id] || 0) + 1;
        if (circular[id] > MAX_UPDATE_COUNT) {
          warn("You may have an infinite update loop " + (watcher.user ? `in watcher with expression "${watcher.expression}"` : `in a component render function.`), watcher.vm);
          break;
        }
      }
    }
    const activatedQueue = activatedChildren.slice();
    const updatedQueue = queue.slice();
    resetSchedulerState();
    callActivatedHooks(activatedQueue);
    callUpdatedHooks(updatedQueue);
    cleanupDeps();
    if (devtools && config.devtools) {
      devtools.emit("flush");
    }
  }
  function callUpdatedHooks(queue2) {
    let i = queue2.length;
    while (i--) {
      const watcher = queue2[i];
      const vm = watcher.vm;
      if (vm && vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
        callHook$1(vm, "updated");
      }
    }
  }
  function queueActivatedComponent(vm) {
    vm._inactive = false;
    activatedChildren.push(vm);
  }
  function callActivatedHooks(queue2) {
    for (let i = 0; i < queue2.length; i++) {
      queue2[i]._inactive = true;
      activateChildComponent(
        queue2[i],
        true
        /* true */
      );
    }
  }
  function queueWatcher(watcher) {
    const id = watcher.id;
    if (has[id] != null) {
      return;
    }
    if (watcher === Dep.target && watcher.noRecurse) {
      return;
    }
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      let i = queue.length - 1;
      while (i > index2 && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    if (!waiting) {
      waiting = true;
      if (!config.async) {
        flushSchedulerQueue();
        return;
      }
      nextTick2(flushSchedulerQueue);
    }
  }
  function initProvide(vm) {
    const provideOption = vm.$options.provide;
    if (provideOption) {
      const provided = isFunction(provideOption) ? provideOption.call(vm) : provideOption;
      if (!isObject2(provided)) {
        return;
      }
      const source = resolveProvided(vm);
      const keys = hasSymbol ? Reflect.ownKeys(provided) : Object.keys(provided);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        Object.defineProperty(source, key, Object.getOwnPropertyDescriptor(provided, key));
      }
    }
  }
  function initInjections(vm) {
    const result = resolveInject(vm.$options.inject, vm);
    if (result) {
      toggleObserving(false);
      Object.keys(result).forEach((key) => {
        {
          defineReactive(vm, key, result[key], () => {
            warn(`Avoid mutating an injected value directly since the changes will be overwritten whenever the provided component re-renders. injection being mutated: "${key}"`, vm);
          });
        }
      });
      toggleObserving(true);
    }
  }
  function resolveInject(inject3, vm) {
    if (inject3) {
      const result = /* @__PURE__ */ Object.create(null);
      const keys = hasSymbol ? Reflect.ownKeys(inject3) : Object.keys(inject3);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key === "__ob__")
          continue;
        const provideKey = inject3[key].from;
        if (provideKey in vm._provided) {
          result[key] = vm._provided[provideKey];
        } else if ("default" in inject3[key]) {
          const provideDefault = inject3[key].default;
          result[key] = isFunction(provideDefault) ? provideDefault.call(vm) : provideDefault;
        } else {
          warn(`Injection "${key}" not found`, vm);
        }
      }
      return result;
    }
  }
  function FunctionalRenderContext(data, props2, children, parent, Ctor) {
    const options2 = Ctor.options;
    let contextVm;
    if (hasOwn(parent, "_uid")) {
      contextVm = Object.create(parent);
      contextVm._original = parent;
    } else {
      contextVm = parent;
      parent = parent._original;
    }
    const isCompiled = isTrue(options2._compiled);
    const needNormalization = !isCompiled;
    this.data = data;
    this.props = props2;
    this.children = children;
    this.parent = parent;
    this.listeners = data.on || emptyObject;
    this.injections = resolveInject(options2.inject, parent);
    this.slots = () => {
      if (!this.$slots) {
        normalizeScopedSlots(parent, data.scopedSlots, this.$slots = resolveSlots(children, parent));
      }
      return this.$slots;
    };
    Object.defineProperty(this, "scopedSlots", {
      enumerable: true,
      get() {
        return normalizeScopedSlots(parent, data.scopedSlots, this.slots());
      }
    });
    if (isCompiled) {
      this.$options = options2;
      this.$slots = this.slots();
      this.$scopedSlots = normalizeScopedSlots(parent, data.scopedSlots, this.$slots);
    }
    if (options2._scopeId) {
      this._c = (a, b, c, d) => {
        const vnode = createElement$1(contextVm, a, b, c, d, needNormalization);
        if (vnode && !isArray(vnode)) {
          vnode.fnScopeId = options2._scopeId;
          vnode.fnContext = parent;
        }
        return vnode;
      };
    } else {
      this._c = (a, b, c, d) => createElement$1(contextVm, a, b, c, d, needNormalization);
    }
  }
  installRenderHelpers(FunctionalRenderContext.prototype);
  function createFunctionalComponent(Ctor, propsData, data, contextVm, children) {
    const options2 = Ctor.options;
    const props2 = {};
    const propOptions = options2.props;
    if (isDef(propOptions)) {
      for (const key in propOptions) {
        props2[key] = validateProp(key, propOptions, propsData || emptyObject);
      }
    } else {
      if (isDef(data.attrs))
        mergeProps(props2, data.attrs);
      if (isDef(data.props))
        mergeProps(props2, data.props);
    }
    const renderContext = new FunctionalRenderContext(data, props2, children, contextVm, Ctor);
    const vnode = options2.render.call(null, renderContext._c, renderContext);
    if (vnode instanceof VNode) {
      return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options2, renderContext);
    } else if (isArray(vnode)) {
      const vnodes = normalizeChildren(vnode) || [];
      const res = new Array(vnodes.length);
      for (let i = 0; i < vnodes.length; i++) {
        res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options2, renderContext);
      }
      return res;
    }
  }
  function cloneAndMarkFunctionalResult(vnode, data, contextVm, options2, renderContext) {
    const clone2 = cloneVNode(vnode);
    clone2.fnContext = contextVm;
    clone2.fnOptions = options2;
    {
      (clone2.devtoolsMeta = clone2.devtoolsMeta || {}).renderContext = renderContext;
    }
    if (data.slot) {
      (clone2.data || (clone2.data = {})).slot = data.slot;
    }
    return clone2;
  }
  function mergeProps(to, from) {
    for (const key in from) {
      to[camelize(key)] = from[key];
    }
  }
  function getComponentName(options2) {
    return options2.name || options2.__name || options2._componentTag;
  }
  const componentVNodeHooks = {
    init(vnode, hydrating) {
      if (vnode.componentInstance && !vnode.componentInstance._isDestroyed && vnode.data.keepAlive) {
        const mountedNode = vnode;
        componentVNodeHooks.prepatch(mountedNode, mountedNode);
      } else {
        const child = vnode.componentInstance = createComponentInstanceForVnode(vnode, activeInstance);
        child.$mount(hydrating ? vnode.elm : void 0, hydrating);
      }
    },
    prepatch(oldVnode, vnode) {
      const options2 = vnode.componentOptions;
      const child = vnode.componentInstance = oldVnode.componentInstance;
      updateChildComponent(
        child,
        options2.propsData,
        // updated props
        options2.listeners,
        // updated listeners
        vnode,
        // new parent vnode
        options2.children
        // new children
      );
    },
    insert(vnode) {
      const { context, componentInstance } = vnode;
      if (!componentInstance._isMounted) {
        componentInstance._isMounted = true;
        callHook$1(componentInstance, "mounted");
      }
      if (vnode.data.keepAlive) {
        if (context._isMounted) {
          queueActivatedComponent(componentInstance);
        } else {
          activateChildComponent(
            componentInstance,
            true
            /* direct */
          );
        }
      }
    },
    destroy(vnode) {
      const { componentInstance } = vnode;
      if (!componentInstance._isDestroyed) {
        if (!vnode.data.keepAlive) {
          componentInstance.$destroy();
        } else {
          deactivateChildComponent(
            componentInstance,
            true
            /* direct */
          );
        }
      }
    }
  };
  const hooksToMerge = Object.keys(componentVNodeHooks);
  function createComponent(Ctor, data, context, children, tag) {
    if (isUndef(Ctor)) {
      return;
    }
    const baseCtor = context.$options._base;
    if (isObject2(Ctor)) {
      Ctor = baseCtor.extend(Ctor);
    }
    if (typeof Ctor !== "function") {
      {
        warn(`Invalid Component definition: ${String(Ctor)}`, context);
      }
      return;
    }
    let asyncFactory;
    if (isUndef(Ctor.cid)) {
      asyncFactory = Ctor;
      Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
      if (Ctor === void 0) {
        return createAsyncPlaceholder(asyncFactory, data, context, children, tag);
      }
    }
    data = data || {};
    resolveConstructorOptions(Ctor);
    if (isDef(data.model)) {
      transformModel(Ctor.options, data);
    }
    const propsData = extractPropsFromVNodeData(data, Ctor, tag);
    if (isTrue(Ctor.options.functional)) {
      return createFunctionalComponent(Ctor, propsData, data, context, children);
    }
    const listeners = data.on;
    data.on = data.nativeOn;
    if (isTrue(Ctor.options.abstract)) {
      const slot = data.slot;
      data = {};
      if (slot) {
        data.slot = slot;
      }
    }
    installComponentHooks(data);
    const name = getComponentName(Ctor.options) || tag;
    const vnode = new VNode(
      // @ts-expect-error
      `vue-component-${Ctor.cid}${name ? `-${name}` : ""}`,
      data,
      void 0,
      void 0,
      void 0,
      context,
      // @ts-expect-error
      { Ctor, propsData, listeners, tag, children },
      asyncFactory
    );
    return vnode;
  }
  function createComponentInstanceForVnode(vnode, parent) {
    const options2 = {
      _isComponent: true,
      _parentVnode: vnode,
      parent
    };
    const inlineTemplate = vnode.data.inlineTemplate;
    if (isDef(inlineTemplate)) {
      options2.render = inlineTemplate.render;
      options2.staticRenderFns = inlineTemplate.staticRenderFns;
    }
    return new vnode.componentOptions.Ctor(options2);
  }
  function installComponentHooks(data) {
    const hooks2 = data.hook || (data.hook = {});
    for (let i = 0; i < hooksToMerge.length; i++) {
      const key = hooksToMerge[i];
      const existing = hooks2[key];
      const toMerge = componentVNodeHooks[key];
      if (existing !== toMerge && !(existing && existing._merged)) {
        hooks2[key] = existing ? mergeHook(toMerge, existing) : toMerge;
      }
    }
  }
  function mergeHook(f1, f2) {
    const merged = (a, b) => {
      f1(a, b);
      f2(a, b);
    };
    merged._merged = true;
    return merged;
  }
  function transformModel(options2, data) {
    const prop = options2.model && options2.model.prop || "value";
    const event = options2.model && options2.model.event || "input";
    (data.attrs || (data.attrs = {}))[prop] = data.model.value;
    const on = data.on || (data.on = {});
    const existing = on[event];
    const callback = data.model.callback;
    if (isDef(existing)) {
      if (isArray(existing) ? existing.indexOf(callback) === -1 : existing !== callback) {
        on[event] = [callback].concat(existing);
      }
    } else {
      on[event] = callback;
    }
  }
  let warn = noop2;
  let tip = noop2;
  let generateComponentTrace;
  let formatComponentName;
  {
    const hasConsole = typeof console !== "undefined";
    const classifyRE = /(?:^|[-_])(\w)/g;
    const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
    warn = (msg, vm = currentInstance) => {
      const trace = vm ? generateComponentTrace(vm) : "";
      if (config.warnHandler) {
        config.warnHandler.call(null, msg, vm, trace);
      } else if (hasConsole && !config.silent) {
        console.error(`[Vue warn]: ${msg}${trace}`);
      }
    };
    tip = (msg, vm) => {
      if (hasConsole && !config.silent) {
        console.warn(`[Vue tip]: ${msg}` + (vm ? generateComponentTrace(vm) : ""));
      }
    };
    formatComponentName = (vm, includeFile) => {
      if (vm.$root === vm) {
        return "<Root>";
      }
      const options2 = isFunction(vm) && vm.cid != null ? vm.options : vm._isVue ? vm.$options || vm.constructor.options : vm;
      let name = getComponentName(options2);
      const file = options2.__file;
      if (!name && file) {
        const match = file.match(/([^/\\]+)\.vue$/);
        name = match && match[1];
      }
      return (name ? `<${classify(name)}>` : `<Anonymous>`) + (file && includeFile !== false ? ` at ${file}` : "");
    };
    const repeat2 = (str, n) => {
      let res = "";
      while (n) {
        if (n % 2 === 1)
          res += str;
        if (n > 1)
          str += str;
        n >>= 1;
      }
      return res;
    };
    generateComponentTrace = (vm) => {
      if (vm._isVue && vm.$parent) {
        const tree = [];
        let currentRecursiveSequence = 0;
        while (vm) {
          if (tree.length > 0) {
            const last = tree[tree.length - 1];
            if (last.constructor === vm.constructor) {
              currentRecursiveSequence++;
              vm = vm.$parent;
              continue;
            } else if (currentRecursiveSequence > 0) {
              tree[tree.length - 1] = [last, currentRecursiveSequence];
              currentRecursiveSequence = 0;
            }
          }
          tree.push(vm);
          vm = vm.$parent;
        }
        return "\n\nfound in\n\n" + tree.map((vm2, i) => `${i === 0 ? "---> " : repeat2(" ", 5 + i * 2)}${isArray(vm2) ? `${formatComponentName(vm2[0])}... (${vm2[1]} recursive calls)` : formatComponentName(vm2)}`).join("\n");
      } else {
        return `

(found in ${formatComponentName(vm)})`;
      }
    };
  }
  const strats = config.optionMergeStrategies;
  {
    strats.el = strats.propsData = function(parent, child, vm, key) {
      if (!vm) {
        warn(`option "${key}" can only be used during instance creation with the \`new\` keyword.`);
      }
      return defaultStrat(parent, child);
    };
  }
  function mergeData(to, from, recursive = true) {
    if (!from)
      return to;
    let key, toVal, fromVal;
    const keys = hasSymbol ? Reflect.ownKeys(from) : Object.keys(from);
    for (let i = 0; i < keys.length; i++) {
      key = keys[i];
      if (key === "__ob__")
        continue;
      toVal = to[key];
      fromVal = from[key];
      if (!recursive || !hasOwn(to, key)) {
        set2(to, key, fromVal);
      } else if (toVal !== fromVal && isPlainObject2(toVal) && isPlainObject2(fromVal)) {
        mergeData(toVal, fromVal);
      }
    }
    return to;
  }
  function mergeDataOrFn(parentVal, childVal, vm) {
    if (!vm) {
      if (!childVal) {
        return parentVal;
      }
      if (!parentVal) {
        return childVal;
      }
      return function mergedDataFn() {
        return mergeData(isFunction(childVal) ? childVal.call(this, this) : childVal, isFunction(parentVal) ? parentVal.call(this, this) : parentVal);
      };
    } else {
      return function mergedInstanceDataFn() {
        const instanceData = isFunction(childVal) ? childVal.call(vm, vm) : childVal;
        const defaultData = isFunction(parentVal) ? parentVal.call(vm, vm) : parentVal;
        if (instanceData) {
          return mergeData(instanceData, defaultData);
        } else {
          return defaultData;
        }
      };
    }
  }
  strats.data = function(parentVal, childVal, vm) {
    if (!vm) {
      if (childVal && typeof childVal !== "function") {
        warn('The "data" option should be a function that returns a per-instance value in component definitions.', vm);
        return parentVal;
      }
      return mergeDataOrFn(parentVal, childVal);
    }
    return mergeDataOrFn(parentVal, childVal, vm);
  };
  function mergeLifecycleHook(parentVal, childVal) {
    const res = childVal ? parentVal ? parentVal.concat(childVal) : isArray(childVal) ? childVal : [childVal] : parentVal;
    return res ? dedupeHooks(res) : res;
  }
  function dedupeHooks(hooks2) {
    const res = [];
    for (let i = 0; i < hooks2.length; i++) {
      if (res.indexOf(hooks2[i]) === -1) {
        res.push(hooks2[i]);
      }
    }
    return res;
  }
  LIFECYCLE_HOOKS.forEach((hook) => {
    strats[hook] = mergeLifecycleHook;
  });
  function mergeAssets(parentVal, childVal, vm, key) {
    const res = Object.create(parentVal || null);
    if (childVal) {
      assertObjectType(key, childVal, vm);
      return extend(res, childVal);
    } else {
      return res;
    }
  }
  ASSET_TYPES.forEach(function(type) {
    strats[type + "s"] = mergeAssets;
  });
  strats.watch = function(parentVal, childVal, vm, key) {
    if (parentVal === nativeWatch)
      parentVal = void 0;
    if (childVal === nativeWatch)
      childVal = void 0;
    if (!childVal)
      return Object.create(parentVal || null);
    {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal)
      return childVal;
    const ret = {};
    extend(ret, parentVal);
    for (const key2 in childVal) {
      let parent = ret[key2];
      const child = childVal[key2];
      if (parent && !isArray(parent)) {
        parent = [parent];
      }
      ret[key2] = parent ? parent.concat(child) : isArray(child) ? child : [child];
    }
    return ret;
  };
  strats.props = strats.methods = strats.inject = strats.computed = function(parentVal, childVal, vm, key) {
    if (childVal && true) {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal)
      return childVal;
    const ret = /* @__PURE__ */ Object.create(null);
    extend(ret, parentVal);
    if (childVal)
      extend(ret, childVal);
    return ret;
  };
  strats.provide = function(parentVal, childVal) {
    if (!parentVal)
      return childVal;
    return function() {
      const ret = /* @__PURE__ */ Object.create(null);
      mergeData(ret, isFunction(parentVal) ? parentVal.call(this) : parentVal);
      if (childVal) {
        mergeData(
          ret,
          isFunction(childVal) ? childVal.call(this) : childVal,
          false
          // non-recursive
        );
      }
      return ret;
    };
  };
  const defaultStrat = function(parentVal, childVal) {
    return childVal === void 0 ? parentVal : childVal;
  };
  function checkComponents(options2) {
    for (const key in options2.components) {
      validateComponentName(key);
    }
  }
  function validateComponentName(name) {
    if (!new RegExp(`^[a-zA-Z][\\-\\.0-9_${unicodeRegExp.source}]*$`).test(name)) {
      warn('Invalid component name: "' + name + '". Component names should conform to valid custom element name in html5 specification.');
    }
    if (isBuiltInTag(name) || config.isReservedTag(name)) {
      warn("Do not use built-in or reserved HTML elements as component id: " + name);
    }
  }
  function normalizeProps(options2, vm) {
    const props2 = options2.props;
    if (!props2)
      return;
    const res = {};
    let i, val, name;
    if (isArray(props2)) {
      i = props2.length;
      while (i--) {
        val = props2[i];
        if (typeof val === "string") {
          name = camelize(val);
          res[name] = { type: null };
        } else {
          warn("props must be strings when using array syntax.");
        }
      }
    } else if (isPlainObject2(props2)) {
      for (const key in props2) {
        val = props2[key];
        name = camelize(key);
        res[name] = isPlainObject2(val) ? val : { type: val };
      }
    } else {
      warn(`Invalid value for option "props": expected an Array or an Object, but got ${toRawType(props2)}.`, vm);
    }
    options2.props = res;
  }
  function normalizeInject(options2, vm) {
    const inject3 = options2.inject;
    if (!inject3)
      return;
    const normalized = options2.inject = {};
    if (isArray(inject3)) {
      for (let i = 0; i < inject3.length; i++) {
        normalized[inject3[i]] = { from: inject3[i] };
      }
    } else if (isPlainObject2(inject3)) {
      for (const key in inject3) {
        const val = inject3[key];
        normalized[key] = isPlainObject2(val) ? extend({ from: key }, val) : { from: val };
      }
    } else {
      warn(`Invalid value for option "inject": expected an Array or an Object, but got ${toRawType(inject3)}.`, vm);
    }
  }
  function normalizeDirectives$1(options2) {
    const dirs = options2.directives;
    if (dirs) {
      for (const key in dirs) {
        const def2 = dirs[key];
        if (isFunction(def2)) {
          dirs[key] = { bind: def2, update: def2 };
        }
      }
    }
  }
  function assertObjectType(name, value, vm) {
    if (!isPlainObject2(value)) {
      warn(`Invalid value for option "${name}": expected an Object, but got ${toRawType(value)}.`, vm);
    }
  }
  function mergeOptions(parent, child, vm) {
    {
      checkComponents(child);
    }
    if (isFunction(child)) {
      child = child.options;
    }
    normalizeProps(child, vm);
    normalizeInject(child, vm);
    normalizeDirectives$1(child);
    if (!child._base) {
      if (child.extends) {
        parent = mergeOptions(parent, child.extends, vm);
      }
      if (child.mixins) {
        for (let i = 0, l = child.mixins.length; i < l; i++) {
          parent = mergeOptions(parent, child.mixins[i], vm);
        }
      }
    }
    const options2 = {};
    let key;
    for (key in parent) {
      mergeField(key);
    }
    for (key in child) {
      if (!hasOwn(parent, key)) {
        mergeField(key);
      }
    }
    function mergeField(key2) {
      const strat = strats[key2] || defaultStrat;
      options2[key2] = strat(parent[key2], child[key2], vm, key2);
    }
    return options2;
  }
  function resolveAsset(options2, type, id, warnMissing) {
    if (typeof id !== "string") {
      return;
    }
    const assets = options2[type];
    if (hasOwn(assets, id))
      return assets[id];
    const camelizedId = camelize(id);
    if (hasOwn(assets, camelizedId))
      return assets[camelizedId];
    const PascalCaseId = capitalize(camelizedId);
    if (hasOwn(assets, PascalCaseId))
      return assets[PascalCaseId];
    const res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
    if (warnMissing && !res) {
      warn("Failed to resolve " + type.slice(0, -1) + ": " + id);
    }
    return res;
  }
  function validateProp(key, propOptions, propsData, vm) {
    const prop = propOptions[key];
    const absent = !hasOwn(propsData, key);
    let value = propsData[key];
    const booleanIndex = getTypeIndex(Boolean, prop.type);
    if (booleanIndex > -1) {
      if (absent && !hasOwn(prop, "default")) {
        value = false;
      } else if (value === "" || value === hyphenate(key)) {
        const stringIndex = getTypeIndex(String, prop.type);
        if (stringIndex < 0 || booleanIndex < stringIndex) {
          value = true;
        }
      }
    }
    if (value === void 0) {
      value = getPropDefaultValue(vm, prop, key);
      const prevShouldObserve = shouldObserve;
      toggleObserving(true);
      observe(value);
      toggleObserving(prevShouldObserve);
    }
    {
      assertProp(prop, key, value, vm, absent);
    }
    return value;
  }
  function getPropDefaultValue(vm, prop, key) {
    if (!hasOwn(prop, "default")) {
      return void 0;
    }
    const def2 = prop.default;
    if (isObject2(def2)) {
      warn('Invalid default value for prop "' + key + '": Props with type Object/Array must use a factory function to return the default value.', vm);
    }
    if (vm && vm.$options.propsData && vm.$options.propsData[key] === void 0 && vm._props[key] !== void 0) {
      return vm._props[key];
    }
    return isFunction(def2) && getType(prop.type) !== "Function" ? def2.call(vm) : def2;
  }
  function assertProp(prop, name, value, vm, absent) {
    if (prop.required && absent) {
      warn('Missing required prop: "' + name + '"', vm);
      return;
    }
    if (value == null && !prop.required) {
      return;
    }
    let type = prop.type;
    let valid = !type || type === true;
    const expectedTypes = [];
    if (type) {
      if (!isArray(type)) {
        type = [type];
      }
      for (let i = 0; i < type.length && !valid; i++) {
        const assertedType = assertType(value, type[i], vm);
        expectedTypes.push(assertedType.expectedType || "");
        valid = assertedType.valid;
      }
    }
    const haveExpectedTypes = expectedTypes.some((t) => t);
    if (!valid && haveExpectedTypes) {
      warn(getInvalidTypeMessage(name, value, expectedTypes), vm);
      return;
    }
    const validator = prop.validator;
    if (validator) {
      if (!validator(value)) {
        warn('Invalid prop: custom validator check failed for prop "' + name + '".', vm);
      }
    }
  }
  const simpleCheckRE = /^(String|Number|Boolean|Function|Symbol|BigInt)$/;
  function assertType(value, type, vm) {
    let valid;
    const expectedType = getType(type);
    if (simpleCheckRE.test(expectedType)) {
      const t = typeof value;
      valid = t === expectedType.toLowerCase();
      if (!valid && t === "object") {
        valid = value instanceof type;
      }
    } else if (expectedType === "Object") {
      valid = isPlainObject2(value);
    } else if (expectedType === "Array") {
      valid = isArray(value);
    } else {
      try {
        valid = value instanceof type;
      } catch (e) {
        warn('Invalid prop type: "' + String(type) + '" is not a constructor', vm);
        valid = false;
      }
    }
    return {
      valid,
      expectedType
    };
  }
  const functionTypeCheckRE = /^\s*function (\w+)/;
  function getType(fn) {
    const match = fn && fn.toString().match(functionTypeCheckRE);
    return match ? match[1] : "";
  }
  function isSameType(a, b) {
    return getType(a) === getType(b);
  }
  function getTypeIndex(type, expectedTypes) {
    if (!isArray(expectedTypes)) {
      return isSameType(expectedTypes, type) ? 0 : -1;
    }
    for (let i = 0, len = expectedTypes.length; i < len; i++) {
      if (isSameType(expectedTypes[i], type)) {
        return i;
      }
    }
    return -1;
  }
  function getInvalidTypeMessage(name, value, expectedTypes) {
    let message = `Invalid prop: type check failed for prop "${name}". Expected ${expectedTypes.map(capitalize).join(", ")}`;
    const expectedType = expectedTypes[0];
    const receivedType = toRawType(value);
    if (expectedTypes.length === 1 && isExplicable(expectedType) && isExplicable(typeof value) && !isBoolean(expectedType, receivedType)) {
      message += ` with value ${styleValue(value, expectedType)}`;
    }
    message += `, got ${receivedType} `;
    if (isExplicable(receivedType)) {
      message += `with value ${styleValue(value, receivedType)}.`;
    }
    return message;
  }
  function styleValue(value, type) {
    if (type === "String") {
      return `"${value}"`;
    } else if (type === "Number") {
      return `${Number(value)}`;
    } else {
      return `${value}`;
    }
  }
  const EXPLICABLE_TYPES = ["string", "number", "boolean"];
  function isExplicable(value) {
    return EXPLICABLE_TYPES.some((elem) => value.toLowerCase() === elem);
  }
  function isBoolean(...args) {
    return args.some((elem) => elem.toLowerCase() === "boolean");
  }
  let initProxy;
  {
    const allowedGlobals = makeMap(
      "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,require"
      // for Webpack/Browserify
    );
    const warnNonPresent = (target3, key) => {
      warn(`Property or method "${key}" is not defined on the instance but referenced during render. Make sure that this property is reactive, either in the data option, or for class-based components, by initializing the property. See: https://v2.vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.`, target3);
    };
    const warnReservedPrefix = (target3, key) => {
      warn(`Property "${key}" must be accessed with "$data.${key}" because properties starting with "$" or "_" are not proxied in the Vue instance to prevent conflicts with Vue internals. See: https://v2.vuejs.org/v2/api/#data`, target3);
    };
    const hasProxy = typeof Proxy !== "undefined" && isNative(Proxy);
    if (hasProxy) {
      const isBuiltInModifier = makeMap("stop,prevent,self,ctrl,shift,alt,meta,exact");
      config.keyCodes = new Proxy(config.keyCodes, {
        set(target3, key, value) {
          if (isBuiltInModifier(key)) {
            warn(`Avoid overwriting built-in modifier in config.keyCodes: .${key}`);
            return false;
          } else {
            target3[key] = value;
            return true;
          }
        }
      });
    }
    const hasHandler = {
      has(target3, key) {
        const has2 = key in target3;
        const isAllowed = allowedGlobals(key) || typeof key === "string" && key.charAt(0) === "_" && !(key in target3.$data);
        if (!has2 && !isAllowed) {
          if (key in target3.$data)
            warnReservedPrefix(target3, key);
          else
            warnNonPresent(target3, key);
        }
        return has2 || !isAllowed;
      }
    };
    const getHandler = {
      get(target3, key) {
        if (typeof key === "string" && !(key in target3)) {
          if (key in target3.$data)
            warnReservedPrefix(target3, key);
          else
            warnNonPresent(target3, key);
        }
        return target3[key];
      }
    };
    initProxy = function initProxy2(vm) {
      if (hasProxy) {
        const options2 = vm.$options;
        const handlers = options2.render && options2.render._withStripped ? getHandler : hasHandler;
        vm._renderProxy = new Proxy(vm, handlers);
      } else {
        vm._renderProxy = vm;
      }
    };
  }
  const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop2,
    set: noop2
  };
  function proxy(target3, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter() {
      return this[sourceKey][key];
    };
    sharedPropertyDefinition.set = function proxySetter(val) {
      this[sourceKey][key] = val;
    };
    Object.defineProperty(target3, key, sharedPropertyDefinition);
  }
  function initState(vm) {
    const opts = vm.$options;
    if (opts.props)
      initProps$1(vm, opts.props);
    initSetup(vm);
    if (opts.methods)
      initMethods(vm, opts.methods);
    if (opts.data) {
      initData(vm);
    } else {
      const ob = observe(vm._data = {});
      ob && ob.vmCount++;
    }
    if (opts.computed)
      initComputed$1(vm, opts.computed);
    if (opts.watch && opts.watch !== nativeWatch) {
      initWatch(vm, opts.watch);
    }
  }
  function initProps$1(vm, propsOptions) {
    const propsData = vm.$options.propsData || {};
    const props2 = vm._props = shallowReactive2({});
    const keys = vm.$options._propKeys = [];
    const isRoot = !vm.$parent;
    if (!isRoot) {
      toggleObserving(false);
    }
    for (const key in propsOptions) {
      keys.push(key);
      const value = validateProp(key, propsOptions, propsData, vm);
      {
        const hyphenatedKey = hyphenate(key);
        if (isReservedAttribute(hyphenatedKey) || config.isReservedAttr(hyphenatedKey)) {
          warn(`"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`, vm);
        }
        defineReactive(
          props2,
          key,
          value,
          () => {
            if (!isRoot && !isUpdatingChildComponent) {
              warn(`Avoid mutating a prop directly since the value will be overwritten whenever the parent component re-renders. Instead, use a data or computed property based on the prop's value. Prop being mutated: "${key}"`, vm);
            }
          },
          true
          /* shallow */
        );
      }
      if (!(key in vm)) {
        proxy(vm, `_props`, key);
      }
    }
    toggleObserving(true);
  }
  function initData(vm) {
    let data = vm.$options.data;
    data = vm._data = isFunction(data) ? getData(data, vm) : data || {};
    if (!isPlainObject2(data)) {
      data = {};
      warn("data functions should return an object:\nhttps://v2.vuejs.org/v2/guide/components.html#data-Must-Be-a-Function", vm);
    }
    const keys = Object.keys(data);
    const props2 = vm.$options.props;
    const methods = vm.$options.methods;
    let i = keys.length;
    while (i--) {
      const key = keys[i];
      {
        if (methods && hasOwn(methods, key)) {
          warn(`Method "${key}" has already been defined as a data property.`, vm);
        }
      }
      if (props2 && hasOwn(props2, key)) {
        warn(`The data property "${key}" is already declared as a prop. Use prop default value instead.`, vm);
      } else if (!isReserved(key)) {
        proxy(vm, `_data`, key);
      }
    }
    const ob = observe(data);
    ob && ob.vmCount++;
  }
  function getData(data, vm) {
    pushTarget();
    try {
      return data.call(vm, vm);
    } catch (e) {
      handleError(e, vm, `data()`);
      return {};
    } finally {
      popTarget();
    }
  }
  const computedWatcherOptions = { lazy: true };
  function initComputed$1(vm, computed3) {
    const watchers = vm._computedWatchers = /* @__PURE__ */ Object.create(null);
    const isSSR = isServerRendering();
    for (const key in computed3) {
      const userDef = computed3[key];
      const getter = isFunction(userDef) ? userDef : userDef.get;
      if (getter == null) {
        warn(`Getter is missing for computed property "${key}".`, vm);
      }
      if (!isSSR) {
        watchers[key] = new Watcher(vm, getter || noop2, noop2, computedWatcherOptions);
      }
      if (!(key in vm)) {
        defineComputed(vm, key, userDef);
      } else {
        if (key in vm.$data) {
          warn(`The computed property "${key}" is already defined in data.`, vm);
        } else if (vm.$options.props && key in vm.$options.props) {
          warn(`The computed property "${key}" is already defined as a prop.`, vm);
        } else if (vm.$options.methods && key in vm.$options.methods) {
          warn(`The computed property "${key}" is already defined as a method.`, vm);
        }
      }
    }
  }
  function defineComputed(target3, key, userDef) {
    const shouldCache = !isServerRendering();
    if (isFunction(userDef)) {
      sharedPropertyDefinition.get = shouldCache ? createComputedGetter(key) : createGetterInvoker(userDef);
      sharedPropertyDefinition.set = noop2;
    } else {
      sharedPropertyDefinition.get = userDef.get ? shouldCache && userDef.cache !== false ? createComputedGetter(key) : createGetterInvoker(userDef.get) : noop2;
      sharedPropertyDefinition.set = userDef.set || noop2;
    }
    if (sharedPropertyDefinition.set === noop2) {
      sharedPropertyDefinition.set = function() {
        warn(`Computed property "${key}" was assigned to but it has no setter.`, this);
      };
    }
    Object.defineProperty(target3, key, sharedPropertyDefinition);
  }
  function createComputedGetter(key) {
    return function computedGetter() {
      const watcher = this._computedWatchers && this._computedWatchers[key];
      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate();
        }
        if (Dep.target) {
          if (Dep.target.onTrack) {
            Dep.target.onTrack({
              effect: Dep.target,
              target: this,
              type: "get",
              key
            });
          }
          watcher.depend();
        }
        return watcher.value;
      }
    };
  }
  function createGetterInvoker(fn) {
    return function computedGetter() {
      return fn.call(this, this);
    };
  }
  function initMethods(vm, methods) {
    const props2 = vm.$options.props;
    for (const key in methods) {
      {
        if (typeof methods[key] !== "function") {
          warn(`Method "${key}" has type "${typeof methods[key]}" in the component definition. Did you reference the function correctly?`, vm);
        }
        if (props2 && hasOwn(props2, key)) {
          warn(`Method "${key}" has already been defined as a prop.`, vm);
        }
        if (key in vm && isReserved(key)) {
          warn(`Method "${key}" conflicts with an existing Vue instance method. Avoid defining component methods that start with _ or $.`);
        }
      }
      vm[key] = typeof methods[key] !== "function" ? noop2 : bind(methods[key], vm);
    }
  }
  function initWatch(vm, watch4) {
    for (const key in watch4) {
      const handler = watch4[key];
      if (isArray(handler)) {
        for (let i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }
  function createWatcher(vm, expOrFn, handler, options2) {
    if (isPlainObject2(handler)) {
      options2 = handler;
      handler = handler.handler;
    }
    if (typeof handler === "string") {
      handler = vm[handler];
    }
    return vm.$watch(expOrFn, handler, options2);
  }
  function stateMixin(Vue3) {
    const dataDef = {};
    dataDef.get = function() {
      return this._data;
    };
    const propsDef = {};
    propsDef.get = function() {
      return this._props;
    };
    {
      dataDef.set = function() {
        warn("Avoid replacing instance root $data. Use nested data properties instead.", this);
      };
      propsDef.set = function() {
        warn(`$props is readonly.`, this);
      };
    }
    Object.defineProperty(Vue3.prototype, "$data", dataDef);
    Object.defineProperty(Vue3.prototype, "$props", propsDef);
    Vue3.prototype.$set = set2;
    Vue3.prototype.$delete = del2;
    Vue3.prototype.$watch = function(expOrFn, cb, options2) {
      const vm = this;
      if (isPlainObject2(cb)) {
        return createWatcher(vm, expOrFn, cb, options2);
      }
      options2 = options2 || {};
      options2.user = true;
      const watcher = new Watcher(vm, expOrFn, cb, options2);
      if (options2.immediate) {
        const info = `callback for immediate watcher "${watcher.expression}"`;
        pushTarget();
        invokeWithErrorHandling(cb, vm, [watcher.value], vm, info);
        popTarget();
      }
      return function unwatchFn() {
        watcher.teardown();
      };
    };
  }
  let uid = 0;
  function initMixin$1(Vue3) {
    Vue3.prototype._init = function(options2) {
      const vm = this;
      vm._uid = uid++;
      let startTag, endTag;
      if (config.performance && mark) {
        startTag = `vue-perf-start:${vm._uid}`;
        endTag = `vue-perf-end:${vm._uid}`;
        mark(startTag);
      }
      vm._isVue = true;
      vm.__v_skip = true;
      vm._scope = new EffectScope(
        true
        /* detached */
      );
      vm._scope.parent = void 0;
      vm._scope._vm = true;
      if (options2 && options2._isComponent) {
        initInternalComponent(vm, options2);
      } else {
        vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options2 || {}, vm);
      }
      {
        initProxy(vm);
      }
      vm._self = vm;
      initLifecycle(vm);
      initEvents(vm);
      initRender(vm);
      callHook$1(
        vm,
        "beforeCreate",
        void 0,
        false
        /* setContext */
      );
      initInjections(vm);
      initState(vm);
      initProvide(vm);
      callHook$1(vm, "created");
      if (config.performance && mark) {
        vm._name = formatComponentName(vm, false);
        mark(endTag);
        measure(`vue ${vm._name} init`, startTag, endTag);
      }
      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };
  }
  function initInternalComponent(vm, options2) {
    const opts = vm.$options = Object.create(vm.constructor.options);
    const parentVnode = options2._parentVnode;
    opts.parent = options2.parent;
    opts._parentVnode = parentVnode;
    const vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;
    if (options2.render) {
      opts.render = options2.render;
      opts.staticRenderFns = options2.staticRenderFns;
    }
  }
  function resolveConstructorOptions(Ctor) {
    let options2 = Ctor.options;
    if (Ctor.super) {
      const superOptions = resolveConstructorOptions(Ctor.super);
      const cachedSuperOptions = Ctor.superOptions;
      if (superOptions !== cachedSuperOptions) {
        Ctor.superOptions = superOptions;
        const modifiedOptions = resolveModifiedOptions(Ctor);
        if (modifiedOptions) {
          extend(Ctor.extendOptions, modifiedOptions);
        }
        options2 = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
        if (options2.name) {
          options2.components[options2.name] = Ctor;
        }
      }
    }
    return options2;
  }
  function resolveModifiedOptions(Ctor) {
    let modified;
    const latest = Ctor.options;
    const sealed = Ctor.sealedOptions;
    for (const key in latest) {
      if (latest[key] !== sealed[key]) {
        if (!modified)
          modified = {};
        modified[key] = latest[key];
      }
    }
    return modified;
  }
  function Vue2(options2) {
    if (!(this instanceof Vue2)) {
      warn("Vue is a constructor and should be called with the `new` keyword");
    }
    this._init(options2);
  }
  initMixin$1(Vue2);
  stateMixin(Vue2);
  eventsMixin(Vue2);
  lifecycleMixin(Vue2);
  renderMixin(Vue2);
  function initUse(Vue3) {
    Vue3.use = function(plugin2) {
      const installedPlugins = this._installedPlugins || (this._installedPlugins = []);
      if (installedPlugins.indexOf(plugin2) > -1) {
        return this;
      }
      const args = toArray(arguments, 1);
      args.unshift(this);
      if (isFunction(plugin2.install)) {
        plugin2.install.apply(plugin2, args);
      } else if (isFunction(plugin2)) {
        plugin2.apply(null, args);
      }
      installedPlugins.push(plugin2);
      return this;
    };
  }
  function initMixin(Vue3) {
    Vue3.mixin = function(mixin) {
      this.options = mergeOptions(this.options, mixin);
      return this;
    };
  }
  function initExtend(Vue3) {
    Vue3.cid = 0;
    let cid = 1;
    Vue3.extend = function(extendOptions) {
      extendOptions = extendOptions || {};
      const Super = this;
      const SuperId = Super.cid;
      const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
      if (cachedCtors[SuperId]) {
        return cachedCtors[SuperId];
      }
      const name = getComponentName(extendOptions) || getComponentName(Super.options);
      if (name) {
        validateComponentName(name);
      }
      const Sub = function VueComponent(options2) {
        this._init(options2);
      };
      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.cid = cid++;
      Sub.options = mergeOptions(Super.options, extendOptions);
      Sub["super"] = Super;
      if (Sub.options.props) {
        initProps(Sub);
      }
      if (Sub.options.computed) {
        initComputed(Sub);
      }
      Sub.extend = Super.extend;
      Sub.mixin = Super.mixin;
      Sub.use = Super.use;
      ASSET_TYPES.forEach(function(type) {
        Sub[type] = Super[type];
      });
      if (name) {
        Sub.options.components[name] = Sub;
      }
      Sub.superOptions = Super.options;
      Sub.extendOptions = extendOptions;
      Sub.sealedOptions = extend({}, Sub.options);
      cachedCtors[SuperId] = Sub;
      return Sub;
    };
  }
  function initProps(Comp) {
    const props2 = Comp.options.props;
    for (const key in props2) {
      proxy(Comp.prototype, `_props`, key);
    }
  }
  function initComputed(Comp) {
    const computed3 = Comp.options.computed;
    for (const key in computed3) {
      defineComputed(Comp.prototype, key, computed3[key]);
    }
  }
  function initAssetRegisters(Vue3) {
    ASSET_TYPES.forEach((type) => {
      Vue3[type] = function(id, definition) {
        if (!definition) {
          return this.options[type + "s"][id];
        } else {
          if (type === "component") {
            validateComponentName(id);
          }
          if (type === "component" && isPlainObject2(definition)) {
            definition.name = definition.name || id;
            definition = this.options._base.extend(definition);
          }
          if (type === "directive" && isFunction(definition)) {
            definition = { bind: definition, update: definition };
          }
          this.options[type + "s"][id] = definition;
          return definition;
        }
      };
    });
  }
  function _getComponentName(opts) {
    return opts && (getComponentName(opts.Ctor.options) || opts.tag);
  }
  function matches(pattern, name) {
    if (isArray(pattern)) {
      return pattern.indexOf(name) > -1;
    } else if (typeof pattern === "string") {
      return pattern.split(",").indexOf(name) > -1;
    } else if (isRegExp(pattern)) {
      return pattern.test(name);
    }
    return false;
  }
  function pruneCache(keepAliveInstance, filter) {
    const { cache, keys, _vnode, $vnode } = keepAliveInstance;
    for (const key in cache) {
      const entry = cache[key];
      if (entry) {
        const name = entry.name;
        if (name && !filter(name)) {
          pruneCacheEntry(cache, key, keys, _vnode);
        }
      }
    }
    $vnode.componentOptions.children = void 0;
  }
  function pruneCacheEntry(cache, key, keys, current) {
    const entry = cache[key];
    if (entry && (!current || entry.tag !== current.tag)) {
      entry.componentInstance.$destroy();
    }
    cache[key] = null;
    remove$2(keys, key);
  }
  const patternTypes = [String, RegExp, Array];
  var KeepAlive = {
    name: "keep-alive",
    abstract: true,
    props: {
      include: patternTypes,
      exclude: patternTypes,
      max: [String, Number]
    },
    methods: {
      cacheVNode() {
        const { cache, keys, vnodeToCache, keyToCache } = this;
        if (vnodeToCache) {
          const { tag, componentInstance, componentOptions } = vnodeToCache;
          cache[keyToCache] = {
            name: _getComponentName(componentOptions),
            tag,
            componentInstance
          };
          keys.push(keyToCache);
          if (this.max && keys.length > parseInt(this.max)) {
            pruneCacheEntry(cache, keys[0], keys, this._vnode);
          }
          this.vnodeToCache = null;
        }
      }
    },
    created() {
      this.cache = /* @__PURE__ */ Object.create(null);
      this.keys = [];
    },
    destroyed() {
      for (const key in this.cache) {
        pruneCacheEntry(this.cache, key, this.keys);
      }
    },
    mounted() {
      this.cacheVNode();
      this.$watch("include", (val) => {
        pruneCache(this, (name) => matches(val, name));
      });
      this.$watch("exclude", (val) => {
        pruneCache(this, (name) => !matches(val, name));
      });
    },
    updated() {
      this.cacheVNode();
    },
    render() {
      const slot = this.$slots.default;
      const vnode = getFirstComponentChild(slot);
      const componentOptions = vnode && vnode.componentOptions;
      if (componentOptions) {
        const name = _getComponentName(componentOptions);
        const { include, exclude } = this;
        if (
          // not included
          include && (!name || !matches(include, name)) || // excluded
          exclude && name && matches(exclude, name)
        ) {
          return vnode;
        }
        const { cache, keys } = this;
        const key = vnode.key == null ? (
          // same constructor may get registered as different local components
          // so cid alone is not enough (#3269)
          componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : "")
        ) : vnode.key;
        if (cache[key]) {
          vnode.componentInstance = cache[key].componentInstance;
          remove$2(keys, key);
          keys.push(key);
        } else {
          this.vnodeToCache = vnode;
          this.keyToCache = key;
        }
        vnode.data.keepAlive = true;
      }
      return vnode || slot && slot[0];
    }
  };
  var builtInComponents = {
    KeepAlive
  };
  function initGlobalAPI(Vue3) {
    const configDef = {};
    configDef.get = () => config;
    {
      configDef.set = () => {
        warn("Do not replace the Vue.config object, set individual fields instead.");
      };
    }
    Object.defineProperty(Vue3, "config", configDef);
    Vue3.util = {
      warn,
      extend,
      mergeOptions,
      defineReactive
    };
    Vue3.set = set2;
    Vue3.delete = del2;
    Vue3.nextTick = nextTick2;
    Vue3.observable = (obj) => {
      observe(obj);
      return obj;
    };
    Vue3.options = /* @__PURE__ */ Object.create(null);
    ASSET_TYPES.forEach((type) => {
      Vue3.options[type + "s"] = /* @__PURE__ */ Object.create(null);
    });
    Vue3.options._base = Vue3;
    extend(Vue3.options.components, builtInComponents);
    initUse(Vue3);
    initMixin(Vue3);
    initExtend(Vue3);
    initAssetRegisters(Vue3);
  }
  initGlobalAPI(Vue2);
  Object.defineProperty(Vue2.prototype, "$isServer", {
    get: isServerRendering
  });
  Object.defineProperty(Vue2.prototype, "$ssrContext", {
    get() {
      return this.$vnode && this.$vnode.ssrContext;
    }
  });
  Object.defineProperty(Vue2, "FunctionalRenderContext", {
    value: FunctionalRenderContext
  });
  Vue2.version = version2;
  const isReservedAttr = makeMap("style,class");
  const acceptValue = makeMap("input,textarea,option,select,progress");
  const mustUseProp = (tag, type, attr) => {
    return attr === "value" && acceptValue(tag) && type !== "button" || attr === "selected" && tag === "option" || attr === "checked" && tag === "input" || attr === "muted" && tag === "video";
  };
  const isEnumeratedAttr = makeMap("contenteditable,draggable,spellcheck");
  const isValidContentEditableValue = makeMap("events,caret,typing,plaintext-only");
  const convertEnumeratedValue = (key, value) => {
    return isFalsyAttrValue(value) || value === "false" ? "false" : (
      // allow arbitrary string value for contenteditable
      key === "contenteditable" && isValidContentEditableValue(value) ? value : "true"
    );
  };
  const isBooleanAttr = makeMap("allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,defaultchecked,defaultmuted,defaultselected,defer,disabled,enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,truespeed,typemustmatch,visible");
  const xlinkNS = "http://www.w3.org/1999/xlink";
  const isXlink = (name) => {
    return name.charAt(5) === ":" && name.slice(0, 5) === "xlink";
  };
  const getXlinkProp = (name) => {
    return isXlink(name) ? name.slice(6, name.length) : "";
  };
  const isFalsyAttrValue = (val) => {
    return val == null || val === false;
  };
  function genClassForVnode(vnode) {
    let data = vnode.data;
    let parentNode2 = vnode;
    let childNode = vnode;
    while (isDef(childNode.componentInstance)) {
      childNode = childNode.componentInstance._vnode;
      if (childNode && childNode.data) {
        data = mergeClassData(childNode.data, data);
      }
    }
    while (isDef(parentNode2 = parentNode2.parent)) {
      if (parentNode2 && parentNode2.data) {
        data = mergeClassData(data, parentNode2.data);
      }
    }
    return renderClass(data.staticClass, data.class);
  }
  function mergeClassData(child, parent) {
    return {
      staticClass: concat(child.staticClass, parent.staticClass),
      class: isDef(child.class) ? [child.class, parent.class] : parent.class
    };
  }
  function renderClass(staticClass, dynamicClass) {
    if (isDef(staticClass) || isDef(dynamicClass)) {
      return concat(staticClass, stringifyClass(dynamicClass));
    }
    return "";
  }
  function concat(a, b) {
    return a ? b ? a + " " + b : a : b || "";
  }
  function stringifyClass(value) {
    if (Array.isArray(value)) {
      return stringifyArray(value);
    }
    if (isObject2(value)) {
      return stringifyObject(value);
    }
    if (typeof value === "string") {
      return value;
    }
    return "";
  }
  function stringifyArray(value) {
    let res = "";
    let stringified;
    for (let i = 0, l = value.length; i < l; i++) {
      if (isDef(stringified = stringifyClass(value[i])) && stringified !== "") {
        if (res)
          res += " ";
        res += stringified;
      }
    }
    return res;
  }
  function stringifyObject(value) {
    let res = "";
    for (const key in value) {
      if (value[key]) {
        if (res)
          res += " ";
        res += key;
      }
    }
    return res;
  }
  const namespaceMap = {
    svg: "http://www.w3.org/2000/svg",
    math: "http://www.w3.org/1998/Math/MathML"
  };
  const isHTMLTag = makeMap("html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,menuitem,summary,content,element,shadow,template,blockquote,iframe,tfoot");
  const isSVG = makeMap("svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view", true);
  const isReservedTag = (tag) => {
    return isHTMLTag(tag) || isSVG(tag);
  };
  function getTagNamespace(tag) {
    if (isSVG(tag)) {
      return "svg";
    }
    if (tag === "math") {
      return "math";
    }
  }
  const unknownElementCache = /* @__PURE__ */ Object.create(null);
  function isUnknownElement(tag) {
    if (!inBrowser) {
      return true;
    }
    if (isReservedTag(tag)) {
      return false;
    }
    tag = tag.toLowerCase();
    if (unknownElementCache[tag] != null) {
      return unknownElementCache[tag];
    }
    const el = document.createElement(tag);
    if (tag.indexOf("-") > -1) {
      return unknownElementCache[tag] = el.constructor === window.HTMLUnknownElement || el.constructor === window.HTMLElement;
    } else {
      return unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString());
    }
  }
  const isTextInputType = makeMap("text,number,password,search,email,tel,url");
  function query(el) {
    if (typeof el === "string") {
      const selected = document.querySelector(el);
      if (!selected) {
        warn("Cannot find element: " + el);
        return document.createElement("div");
      }
      return selected;
    } else {
      return el;
    }
  }
  function createElement(tagName2, vnode) {
    const elm = document.createElement(tagName2);
    if (tagName2 !== "select") {
      return elm;
    }
    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== void 0) {
      elm.setAttribute("multiple", "multiple");
    }
    return elm;
  }
  function createElementNS(namespace, tagName2) {
    return document.createElementNS(namespaceMap[namespace], tagName2);
  }
  function createTextNode(text) {
    return document.createTextNode(text);
  }
  function createComment(text) {
    return document.createComment(text);
  }
  function insertBefore(parentNode2, newNode, referenceNode) {
    parentNode2.insertBefore(newNode, referenceNode);
  }
  function removeChild2(node, child) {
    node.removeChild(child);
  }
  function appendChild(node, child) {
    node.appendChild(child);
  }
  function parentNode(node) {
    return node.parentNode;
  }
  function nextSibling(node) {
    return node.nextSibling;
  }
  function tagName(node) {
    return node.tagName;
  }
  function setTextContent(node, text) {
    node.textContent = text;
  }
  function setStyleScope(node, scopeId) {
    node.setAttribute(scopeId, "");
  }
  var nodeOps = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    createElement,
    createElementNS,
    createTextNode,
    createComment,
    insertBefore,
    removeChild: removeChild2,
    appendChild,
    parentNode,
    nextSibling,
    tagName,
    setTextContent,
    setStyleScope
  });
  var ref2 = {
    create(_, vnode) {
      registerRef(vnode);
    },
    update(oldVnode, vnode) {
      if (oldVnode.data.ref !== vnode.data.ref) {
        registerRef(oldVnode, true);
        registerRef(vnode);
      }
    },
    destroy(vnode) {
      registerRef(vnode, true);
    }
  };
  function registerRef(vnode, isRemoval) {
    const ref3 = vnode.data.ref;
    if (!isDef(ref3))
      return;
    const vm = vnode.context;
    const refValue = vnode.componentInstance || vnode.elm;
    const value = isRemoval ? null : refValue;
    const $refsValue = isRemoval ? void 0 : refValue;
    if (isFunction(ref3)) {
      invokeWithErrorHandling(ref3, vm, [value], vm, `template ref function`);
      return;
    }
    const isFor = vnode.data.refInFor;
    const _isString = typeof ref3 === "string" || typeof ref3 === "number";
    const _isRef = isRef2(ref3);
    const refs = vm.$refs;
    if (_isString || _isRef) {
      if (isFor) {
        const existing = _isString ? refs[ref3] : ref3.value;
        if (isRemoval) {
          isArray(existing) && remove$2(existing, refValue);
        } else {
          if (!isArray(existing)) {
            if (_isString) {
              refs[ref3] = [refValue];
              setSetupRef(vm, ref3, refs[ref3]);
            } else {
              ref3.value = [refValue];
            }
          } else if (!existing.includes(refValue)) {
            existing.push(refValue);
          }
        }
      } else if (_isString) {
        if (isRemoval && refs[ref3] !== refValue) {
          return;
        }
        refs[ref3] = $refsValue;
        setSetupRef(vm, ref3, value);
      } else if (_isRef) {
        if (isRemoval && ref3.value !== refValue) {
          return;
        }
        ref3.value = value;
      } else {
        warn(`Invalid template ref type: ${typeof ref3}`);
      }
    }
  }
  function setSetupRef({ _setupState }, key, val) {
    if (_setupState && hasOwn(_setupState, key)) {
      if (isRef2(_setupState[key])) {
        _setupState[key].value = val;
      } else {
        _setupState[key] = val;
      }
    }
  }
  const emptyNode = new VNode("", {}, []);
  const hooks = ["create", "activate", "update", "remove", "destroy"];
  function sameVnode(a, b) {
    return a.key === b.key && a.asyncFactory === b.asyncFactory && (a.tag === b.tag && a.isComment === b.isComment && isDef(a.data) === isDef(b.data) && sameInputType(a, b) || isTrue(a.isAsyncPlaceholder) && isUndef(b.asyncFactory.error));
  }
  function sameInputType(a, b) {
    if (a.tag !== "input")
      return true;
    let i;
    const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
    const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB);
  }
  function createKeyToOldIdx(children, beginIdx, endIdx) {
    let i, key;
    const map = {};
    for (i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key;
      if (isDef(key))
        map[key] = i;
    }
    return map;
  }
  function createPatchFunction(backend) {
    let i, j;
    const cbs = {};
    const { modules: modules3, nodeOps: nodeOps2 } = backend;
    for (i = 0; i < hooks.length; ++i) {
      cbs[hooks[i]] = [];
      for (j = 0; j < modules3.length; ++j) {
        if (isDef(modules3[j][hooks[i]])) {
          cbs[hooks[i]].push(modules3[j][hooks[i]]);
        }
      }
    }
    function emptyNodeAt(elm) {
      return new VNode(nodeOps2.tagName(elm).toLowerCase(), {}, [], void 0, elm);
    }
    function createRmCb(childElm, listeners) {
      function remove2() {
        if (--remove2.listeners === 0) {
          removeNode(childElm);
        }
      }
      remove2.listeners = listeners;
      return remove2;
    }
    function removeNode(el) {
      const parent = nodeOps2.parentNode(el);
      if (isDef(parent)) {
        nodeOps2.removeChild(parent, el);
      }
    }
    function isUnknownElement2(vnode, inVPre) {
      return !inVPre && !vnode.ns && !(config.ignoredElements.length && config.ignoredElements.some((ignore) => {
        return isRegExp(ignore) ? ignore.test(vnode.tag) : ignore === vnode.tag;
      })) && config.isUnknownElement(vnode.tag);
    }
    let creatingElmInVPre = 0;
    function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index3) {
      if (isDef(vnode.elm) && isDef(ownerArray)) {
        vnode = ownerArray[index3] = cloneVNode(vnode);
      }
      vnode.isRootInsert = !nested;
      if (createComponent2(vnode, insertedVnodeQueue, parentElm, refElm)) {
        return;
      }
      const data = vnode.data;
      const children = vnode.children;
      const tag = vnode.tag;
      if (isDef(tag)) {
        {
          if (data && data.pre) {
            creatingElmInVPre++;
          }
          if (isUnknownElement2(vnode, creatingElmInVPre)) {
            warn("Unknown custom element: <" + tag + '> - did you register the component correctly? For recursive components, make sure to provide the "name" option.', vnode.context);
          }
        }
        vnode.elm = vnode.ns ? nodeOps2.createElementNS(vnode.ns, tag) : nodeOps2.createElement(tag, vnode);
        setScope(vnode);
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm);
        if (data && data.pre) {
          creatingElmInVPre--;
        }
      } else if (isTrue(vnode.isComment)) {
        vnode.elm = nodeOps2.createComment(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      } else {
        vnode.elm = nodeOps2.createTextNode(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      }
    }
    function createComponent2(vnode, insertedVnodeQueue, parentElm, refElm) {
      let i2 = vnode.data;
      if (isDef(i2)) {
        const isReactivated = isDef(vnode.componentInstance) && i2.keepAlive;
        if (isDef(i2 = i2.hook) && isDef(i2 = i2.init)) {
          i2(
            vnode,
            false
            /* hydrating */
          );
        }
        if (isDef(vnode.componentInstance)) {
          initComponent(vnode, insertedVnodeQueue);
          insert(parentElm, vnode.elm, refElm);
          if (isTrue(isReactivated)) {
            reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
          }
          return true;
        }
      }
    }
    function initComponent(vnode, insertedVnodeQueue) {
      if (isDef(vnode.data.pendingInsert)) {
        insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
        vnode.data.pendingInsert = null;
      }
      vnode.elm = vnode.componentInstance.$el;
      if (isPatchable(vnode)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
        setScope(vnode);
      } else {
        registerRef(vnode);
        insertedVnodeQueue.push(vnode);
      }
    }
    function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
      let i2;
      let innerNode = vnode;
      while (innerNode.componentInstance) {
        innerNode = innerNode.componentInstance._vnode;
        if (isDef(i2 = innerNode.data) && isDef(i2 = i2.transition)) {
          for (i2 = 0; i2 < cbs.activate.length; ++i2) {
            cbs.activate[i2](emptyNode, innerNode);
          }
          insertedVnodeQueue.push(innerNode);
          break;
        }
      }
      insert(parentElm, vnode.elm, refElm);
    }
    function insert(parent, elm, ref3) {
      if (isDef(parent)) {
        if (isDef(ref3)) {
          if (nodeOps2.parentNode(ref3) === parent) {
            nodeOps2.insertBefore(parent, elm, ref3);
          }
        } else {
          nodeOps2.appendChild(parent, elm);
        }
      }
    }
    function createChildren(vnode, children, insertedVnodeQueue) {
      if (isArray(children)) {
        {
          checkDuplicateKeys(children);
        }
        for (let i2 = 0; i2 < children.length; ++i2) {
          createElm(children[i2], insertedVnodeQueue, vnode.elm, null, true, children, i2);
        }
      } else if (isPrimitive(vnode.text)) {
        nodeOps2.appendChild(vnode.elm, nodeOps2.createTextNode(String(vnode.text)));
      }
    }
    function isPatchable(vnode) {
      while (vnode.componentInstance) {
        vnode = vnode.componentInstance._vnode;
      }
      return isDef(vnode.tag);
    }
    function invokeCreateHooks(vnode, insertedVnodeQueue) {
      for (let i2 = 0; i2 < cbs.create.length; ++i2) {
        cbs.create[i2](emptyNode, vnode);
      }
      i = vnode.data.hook;
      if (isDef(i)) {
        if (isDef(i.create))
          i.create(emptyNode, vnode);
        if (isDef(i.insert))
          insertedVnodeQueue.push(vnode);
      }
    }
    function setScope(vnode) {
      let i2;
      if (isDef(i2 = vnode.fnScopeId)) {
        nodeOps2.setStyleScope(vnode.elm, i2);
      } else {
        let ancestor = vnode;
        while (ancestor) {
          if (isDef(i2 = ancestor.context) && isDef(i2 = i2.$options._scopeId)) {
            nodeOps2.setStyleScope(vnode.elm, i2);
          }
          ancestor = ancestor.parent;
        }
      }
      if (isDef(i2 = activeInstance) && i2 !== vnode.context && i2 !== vnode.fnContext && isDef(i2 = i2.$options._scopeId)) {
        nodeOps2.setStyleScope(vnode.elm, i2);
      }
    }
    function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) {
        createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
      }
    }
    function invokeDestroyHook(vnode) {
      let i2, j2;
      const data = vnode.data;
      if (isDef(data)) {
        if (isDef(i2 = data.hook) && isDef(i2 = i2.destroy))
          i2(vnode);
        for (i2 = 0; i2 < cbs.destroy.length; ++i2)
          cbs.destroy[i2](vnode);
      }
      if (isDef(i2 = vnode.children)) {
        for (j2 = 0; j2 < vnode.children.length; ++j2) {
          invokeDestroyHook(vnode.children[j2]);
        }
      }
    }
    function removeVnodes(vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx];
        if (isDef(ch)) {
          if (isDef(ch.tag)) {
            removeAndInvokeRemoveHook(ch);
            invokeDestroyHook(ch);
          } else {
            removeNode(ch.elm);
          }
        }
      }
    }
    function removeAndInvokeRemoveHook(vnode, rm) {
      if (isDef(rm) || isDef(vnode.data)) {
        let i2;
        const listeners = cbs.remove.length + 1;
        if (isDef(rm)) {
          rm.listeners += listeners;
        } else {
          rm = createRmCb(vnode.elm, listeners);
        }
        if (isDef(i2 = vnode.componentInstance) && isDef(i2 = i2._vnode) && isDef(i2.data)) {
          removeAndInvokeRemoveHook(i2, rm);
        }
        for (i2 = 0; i2 < cbs.remove.length; ++i2) {
          cbs.remove[i2](vnode, rm);
        }
        if (isDef(i2 = vnode.data.hook) && isDef(i2 = i2.remove)) {
          i2(vnode, rm);
        } else {
          rm();
        }
      } else {
        removeNode(vnode.elm);
      }
    }
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
      let oldStartIdx = 0;
      let newStartIdx = 0;
      let oldEndIdx = oldCh.length - 1;
      let oldStartVnode = oldCh[0];
      let oldEndVnode = oldCh[oldEndIdx];
      let newEndIdx = newCh.length - 1;
      let newStartVnode = newCh[0];
      let newEndVnode = newCh[newEndIdx];
      let oldKeyToIdx, idxInOld, vnodeToMove, refElm;
      const canMove = !removeOnly;
      {
        checkDuplicateKeys(newCh);
      }
      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef(oldStartVnode)) {
          oldStartVnode = oldCh[++oldStartIdx];
        } else if (isUndef(oldEndVnode)) {
          oldEndVnode = oldCh[--oldEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          oldStartVnode = oldCh[++oldStartIdx];
          newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
          patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          oldEndVnode = oldCh[--oldEndIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) {
          patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          canMove && nodeOps2.insertBefore(parentElm, oldStartVnode.elm, nodeOps2.nextSibling(oldEndVnode.elm));
          oldStartVnode = oldCh[++oldStartIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) {
          patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          canMove && nodeOps2.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
          oldEndVnode = oldCh[--oldEndIdx];
          newStartVnode = newCh[++newStartIdx];
        } else {
          if (isUndef(oldKeyToIdx))
            oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
          idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
          if (isUndef(idxInOld)) {
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          } else {
            vnodeToMove = oldCh[idxInOld];
            if (sameVnode(vnodeToMove, newStartVnode)) {
              patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
              oldCh[idxInOld] = void 0;
              canMove && nodeOps2.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
            } else {
              createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            }
          }
          newStartVnode = newCh[++newStartIdx];
        }
      }
      if (oldStartIdx > oldEndIdx) {
        refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else if (newStartIdx > newEndIdx) {
        removeVnodes(oldCh, oldStartIdx, oldEndIdx);
      }
    }
    function checkDuplicateKeys(children) {
      const seenKeys = {};
      for (let i2 = 0; i2 < children.length; i2++) {
        const vnode = children[i2];
        const key = vnode.key;
        if (isDef(key)) {
          if (seenKeys[key]) {
            warn(`Duplicate keys detected: '${key}'. This may cause an update error.`, vnode.context);
          } else {
            seenKeys[key] = true;
          }
        }
      }
    }
    function findIdxInOld(node, oldCh, start, end) {
      for (let i2 = start; i2 < end; i2++) {
        const c = oldCh[i2];
        if (isDef(c) && sameVnode(node, c))
          return i2;
      }
    }
    function patchVnode(oldVnode, vnode, insertedVnodeQueue, ownerArray, index3, removeOnly) {
      if (oldVnode === vnode) {
        return;
      }
      if (isDef(vnode.elm) && isDef(ownerArray)) {
        vnode = ownerArray[index3] = cloneVNode(vnode);
      }
      const elm = vnode.elm = oldVnode.elm;
      if (isTrue(oldVnode.isAsyncPlaceholder)) {
        if (isDef(vnode.asyncFactory.resolved)) {
          hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
        } else {
          vnode.isAsyncPlaceholder = true;
        }
        return;
      }
      if (isTrue(vnode.isStatic) && isTrue(oldVnode.isStatic) && vnode.key === oldVnode.key && (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))) {
        vnode.componentInstance = oldVnode.componentInstance;
        return;
      }
      let i2;
      const data = vnode.data;
      if (isDef(data) && isDef(i2 = data.hook) && isDef(i2 = i2.prepatch)) {
        i2(oldVnode, vnode);
      }
      const oldCh = oldVnode.children;
      const ch = vnode.children;
      if (isDef(data) && isPatchable(vnode)) {
        for (i2 = 0; i2 < cbs.update.length; ++i2)
          cbs.update[i2](oldVnode, vnode);
        if (isDef(i2 = data.hook) && isDef(i2 = i2.update))
          i2(oldVnode, vnode);
      }
      if (isUndef(vnode.text)) {
        if (isDef(oldCh) && isDef(ch)) {
          if (oldCh !== ch)
            updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
        } else if (isDef(ch)) {
          {
            checkDuplicateKeys(ch);
          }
          if (isDef(oldVnode.text))
            nodeOps2.setTextContent(elm, "");
          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        } else if (isDef(oldCh)) {
          removeVnodes(oldCh, 0, oldCh.length - 1);
        } else if (isDef(oldVnode.text)) {
          nodeOps2.setTextContent(elm, "");
        }
      } else if (oldVnode.text !== vnode.text) {
        nodeOps2.setTextContent(elm, vnode.text);
      }
      if (isDef(data)) {
        if (isDef(i2 = data.hook) && isDef(i2 = i2.postpatch))
          i2(oldVnode, vnode);
      }
    }
    function invokeInsertHook(vnode, queue2, initial) {
      if (isTrue(initial) && isDef(vnode.parent)) {
        vnode.parent.data.pendingInsert = queue2;
      } else {
        for (let i2 = 0; i2 < queue2.length; ++i2) {
          queue2[i2].data.hook.insert(queue2[i2]);
        }
      }
    }
    let hydrationBailed = false;
    const isRenderedModule = makeMap("attrs,class,staticClass,staticStyle,key");
    function hydrate(elm, vnode, insertedVnodeQueue, inVPre) {
      let i2;
      const { tag, data, children } = vnode;
      inVPre = inVPre || data && data.pre;
      vnode.elm = elm;
      if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
        vnode.isAsyncPlaceholder = true;
        return true;
      }
      {
        if (!assertNodeMatch(elm, vnode, inVPre)) {
          return false;
        }
      }
      if (isDef(data)) {
        if (isDef(i2 = data.hook) && isDef(i2 = i2.init))
          i2(
            vnode,
            true
            /* hydrating */
          );
        if (isDef(i2 = vnode.componentInstance)) {
          initComponent(vnode, insertedVnodeQueue);
          return true;
        }
      }
      if (isDef(tag)) {
        if (isDef(children)) {
          if (!elm.hasChildNodes()) {
            createChildren(vnode, children, insertedVnodeQueue);
          } else {
            if (isDef(i2 = data) && isDef(i2 = i2.domProps) && isDef(i2 = i2.innerHTML)) {
              if (i2 !== elm.innerHTML) {
                if (typeof console !== "undefined" && !hydrationBailed) {
                  hydrationBailed = true;
                  console.warn("Parent: ", elm);
                  console.warn("server innerHTML: ", i2);
                  console.warn("client innerHTML: ", elm.innerHTML);
                }
                return false;
              }
            } else {
              let childrenMatch = true;
              let childNode = elm.firstChild;
              for (let i3 = 0; i3 < children.length; i3++) {
                if (!childNode || !hydrate(childNode, children[i3], insertedVnodeQueue, inVPre)) {
                  childrenMatch = false;
                  break;
                }
                childNode = childNode.nextSibling;
              }
              if (!childrenMatch || childNode) {
                if (typeof console !== "undefined" && !hydrationBailed) {
                  hydrationBailed = true;
                  console.warn("Parent: ", elm);
                  console.warn("Mismatching childNodes vs. VNodes: ", elm.childNodes, children);
                }
                return false;
              }
            }
          }
        }
        if (isDef(data)) {
          let fullInvoke = false;
          for (const key in data) {
            if (!isRenderedModule(key)) {
              fullInvoke = true;
              invokeCreateHooks(vnode, insertedVnodeQueue);
              break;
            }
          }
          if (!fullInvoke && data["class"]) {
            traverse(data["class"]);
          }
        }
      } else if (elm.data !== vnode.text) {
        elm.data = vnode.text;
      }
      return true;
    }
    function assertNodeMatch(node, vnode, inVPre) {
      if (isDef(vnode.tag)) {
        return vnode.tag.indexOf("vue-component") === 0 || !isUnknownElement2(vnode, inVPre) && vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase());
      } else {
        return node.nodeType === (vnode.isComment ? 8 : 3);
      }
    }
    return function patch3(oldVnode, vnode, hydrating, removeOnly) {
      if (isUndef(vnode)) {
        if (isDef(oldVnode))
          invokeDestroyHook(oldVnode);
        return;
      }
      let isInitialPatch = false;
      const insertedVnodeQueue = [];
      if (isUndef(oldVnode)) {
        isInitialPatch = true;
        createElm(vnode, insertedVnodeQueue);
      } else {
        const isRealElement = isDef(oldVnode.nodeType);
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
          patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
        } else {
          if (isRealElement) {
            if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
              oldVnode.removeAttribute(SSR_ATTR);
              hydrating = true;
            }
            if (isTrue(hydrating)) {
              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                invokeInsertHook(vnode, insertedVnodeQueue, true);
                return oldVnode;
              } else {
                warn("The client-side rendered virtual DOM tree is not matching server-rendered content. This is likely caused by incorrect HTML markup, for example nesting block-level elements inside <p>, or missing <tbody>. Bailing hydration and performing full client-side render.");
              }
            }
            oldVnode = emptyNodeAt(oldVnode);
          }
          const oldElm = oldVnode.elm;
          const parentElm = nodeOps2.parentNode(oldElm);
          createElm(
            vnode,
            insertedVnodeQueue,
            // extremely rare edge case: do not insert if old element is in a
            // leaving transition. Only happens when combining transition +
            // keep-alive + HOCs. (#4590)
            oldElm._leaveCb ? null : parentElm,
            nodeOps2.nextSibling(oldElm)
          );
          if (isDef(vnode.parent)) {
            let ancestor = vnode.parent;
            const patchable = isPatchable(vnode);
            while (ancestor) {
              for (let i2 = 0; i2 < cbs.destroy.length; ++i2) {
                cbs.destroy[i2](ancestor);
              }
              ancestor.elm = vnode.elm;
              if (patchable) {
                for (let i2 = 0; i2 < cbs.create.length; ++i2) {
                  cbs.create[i2](emptyNode, ancestor);
                }
                const insert2 = ancestor.data.hook.insert;
                if (insert2.merged) {
                  const cloned = insert2.fns.slice(1);
                  for (let i2 = 0; i2 < cloned.length; i2++) {
                    cloned[i2]();
                  }
                }
              } else {
                registerRef(ancestor);
              }
              ancestor = ancestor.parent;
            }
          }
          if (isDef(parentElm)) {
            removeVnodes([oldVnode], 0, 0);
          } else if (isDef(oldVnode.tag)) {
            invokeDestroyHook(oldVnode);
          }
        }
      }
      invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
      return vnode.elm;
    };
  }
  var directives = {
    create: updateDirectives,
    update: updateDirectives,
    destroy: function unbindDirectives(vnode) {
      updateDirectives(vnode, emptyNode);
    }
  };
  function updateDirectives(oldVnode, vnode) {
    if (oldVnode.data.directives || vnode.data.directives) {
      _update(oldVnode, vnode);
    }
  }
  function _update(oldVnode, vnode) {
    const isCreate = oldVnode === emptyNode;
    const isDestroy = vnode === emptyNode;
    const oldDirs = normalizeDirectives(oldVnode.data.directives, oldVnode.context);
    const newDirs = normalizeDirectives(vnode.data.directives, vnode.context);
    const dirsWithInsert = [];
    const dirsWithPostpatch = [];
    let key, oldDir, dir;
    for (key in newDirs) {
      oldDir = oldDirs[key];
      dir = newDirs[key];
      if (!oldDir) {
        callHook(dir, "bind", vnode, oldVnode);
        if (dir.def && dir.def.inserted) {
          dirsWithInsert.push(dir);
        }
      } else {
        dir.oldValue = oldDir.value;
        dir.oldArg = oldDir.arg;
        callHook(dir, "update", vnode, oldVnode);
        if (dir.def && dir.def.componentUpdated) {
          dirsWithPostpatch.push(dir);
        }
      }
    }
    if (dirsWithInsert.length) {
      const callInsert = () => {
        for (let i = 0; i < dirsWithInsert.length; i++) {
          callHook(dirsWithInsert[i], "inserted", vnode, oldVnode);
        }
      };
      if (isCreate) {
        mergeVNodeHook(vnode, "insert", callInsert);
      } else {
        callInsert();
      }
    }
    if (dirsWithPostpatch.length) {
      mergeVNodeHook(vnode, "postpatch", () => {
        for (let i = 0; i < dirsWithPostpatch.length; i++) {
          callHook(dirsWithPostpatch[i], "componentUpdated", vnode, oldVnode);
        }
      });
    }
    if (!isCreate) {
      for (key in oldDirs) {
        if (!newDirs[key]) {
          callHook(oldDirs[key], "unbind", oldVnode, oldVnode, isDestroy);
        }
      }
    }
  }
  const emptyModifiers = /* @__PURE__ */ Object.create(null);
  function normalizeDirectives(dirs, vm) {
    const res = /* @__PURE__ */ Object.create(null);
    if (!dirs) {
      return res;
    }
    let i, dir;
    for (i = 0; i < dirs.length; i++) {
      dir = dirs[i];
      if (!dir.modifiers) {
        dir.modifiers = emptyModifiers;
      }
      res[getRawDirName(dir)] = dir;
      if (vm._setupState && vm._setupState.__sfc) {
        const setupDef = dir.def || resolveAsset(vm, "_setupState", "v-" + dir.name);
        if (typeof setupDef === "function") {
          dir.def = {
            bind: setupDef,
            update: setupDef
          };
        } else {
          dir.def = setupDef;
        }
      }
      dir.def = dir.def || resolveAsset(vm.$options, "directives", dir.name, true);
    }
    return res;
  }
  function getRawDirName(dir) {
    return dir.rawName || `${dir.name}.${Object.keys(dir.modifiers || {}).join(".")}`;
  }
  function callHook(dir, hook, vnode, oldVnode, isDestroy) {
    const fn = dir.def && dir.def[hook];
    if (fn) {
      try {
        fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
      } catch (e) {
        handleError(e, vnode.context, `directive ${dir.name} ${hook} hook`);
      }
    }
  }
  var baseModules = [ref2, directives];
  function updateAttrs(oldVnode, vnode) {
    const opts = vnode.componentOptions;
    if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
      return;
    }
    if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
      return;
    }
    let key, cur, old;
    const elm = vnode.elm;
    const oldAttrs = oldVnode.data.attrs || {};
    let attrs2 = vnode.data.attrs || {};
    if (isDef(attrs2.__ob__) || isTrue(attrs2._v_attr_proxy)) {
      attrs2 = vnode.data.attrs = extend({}, attrs2);
    }
    for (key in attrs2) {
      cur = attrs2[key];
      old = oldAttrs[key];
      if (old !== cur) {
        setAttr(elm, key, cur, vnode.data.pre);
      }
    }
    if ((isIE || isEdge) && attrs2.value !== oldAttrs.value) {
      setAttr(elm, "value", attrs2.value);
    }
    for (key in oldAttrs) {
      if (isUndef(attrs2[key])) {
        if (isXlink(key)) {
          elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
        } else if (!isEnumeratedAttr(key)) {
          elm.removeAttribute(key);
        }
      }
    }
  }
  function setAttr(el, key, value, isInPre) {
    if (isInPre || el.tagName.indexOf("-") > -1) {
      baseSetAttr(el, key, value);
    } else if (isBooleanAttr(key)) {
      if (isFalsyAttrValue(value)) {
        el.removeAttribute(key);
      } else {
        value = key === "allowfullscreen" && el.tagName === "EMBED" ? "true" : key;
        el.setAttribute(key, value);
      }
    } else if (isEnumeratedAttr(key)) {
      el.setAttribute(key, convertEnumeratedValue(key, value));
    } else if (isXlink(key)) {
      if (isFalsyAttrValue(value)) {
        el.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      baseSetAttr(el, key, value);
    }
  }
  function baseSetAttr(el, key, value) {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      if (isIE && !isIE9 && el.tagName === "TEXTAREA" && key === "placeholder" && value !== "" && !el.__ieph) {
        const blocker = (e) => {
          e.stopImmediatePropagation();
          el.removeEventListener("input", blocker);
        };
        el.addEventListener("input", blocker);
        el.__ieph = true;
      }
      el.setAttribute(key, value);
    }
  }
  var attrs = {
    create: updateAttrs,
    update: updateAttrs
  };
  function updateClass(oldVnode, vnode) {
    const el = vnode.elm;
    const data = vnode.data;
    const oldData = oldVnode.data;
    if (isUndef(data.staticClass) && isUndef(data.class) && (isUndef(oldData) || isUndef(oldData.staticClass) && isUndef(oldData.class))) {
      return;
    }
    let cls = genClassForVnode(vnode);
    const transitionClass = el._transitionClasses;
    if (isDef(transitionClass)) {
      cls = concat(cls, stringifyClass(transitionClass));
    }
    if (cls !== el._prevClass) {
      el.setAttribute("class", cls);
      el._prevClass = cls;
    }
  }
  var klass = {
    create: updateClass,
    update: updateClass
  };
  const RANGE_TOKEN = "__r";
  const CHECKBOX_RADIO_TOKEN = "__c";
  function normalizeEvents(on) {
    if (isDef(on[RANGE_TOKEN])) {
      const event = isIE ? "change" : "input";
      on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
      delete on[RANGE_TOKEN];
    }
    if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
      on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
      delete on[CHECKBOX_RADIO_TOKEN];
    }
  }
  let target2;
  function createOnceHandler(event, handler, capture) {
    const _target = target2;
    return function onceHandler() {
      const res = handler.apply(null, arguments);
      if (res !== null) {
        remove(event, onceHandler, capture, _target);
      }
    };
  }
  const useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);
  function add(name, handler, capture, passive) {
    if (useMicrotaskFix) {
      const attachedTimestamp = currentFlushTimestamp;
      const original = handler;
      handler = original._wrapper = function(e) {
        if (
          // no bubbling, should always fire.
          // this is just a safety net in case event.timeStamp is unreliable in
          // certain weird environments...
          e.target === e.currentTarget || // event is fired after handler attachment
          e.timeStamp >= attachedTimestamp || // bail for environments that have buggy event.timeStamp implementations
          // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
          // #9681 QtWebEngine event.timeStamp is negative value
          e.timeStamp <= 0 || // #9448 bail if event is fired in another document in a multi-page
          // electron/nw.js app, since event.timeStamp will be using a different
          // starting reference
          e.target.ownerDocument !== document
        ) {
          return original.apply(this, arguments);
        }
      };
    }
    target2.addEventListener(name, handler, supportsPassive ? { capture, passive } : capture);
  }
  function remove(name, handler, capture, _target) {
    (_target || target2).removeEventListener(
      name,
      //@ts-expect-error
      handler._wrapper || handler,
      capture
    );
  }
  function updateDOMListeners(oldVnode, vnode) {
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
      return;
    }
    const on = vnode.data.on || {};
    const oldOn = oldVnode.data.on || {};
    target2 = vnode.elm || oldVnode.elm;
    normalizeEvents(on);
    updateListeners(on, oldOn, add, remove, createOnceHandler, vnode.context);
    target2 = void 0;
  }
  var events = {
    create: updateDOMListeners,
    update: updateDOMListeners,
    // @ts-expect-error emptyNode has actually data
    destroy: (vnode) => updateDOMListeners(vnode, emptyNode)
  };
  let svgContainer;
  function updateDOMProps(oldVnode, vnode) {
    if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
      return;
    }
    let key, cur;
    const elm = vnode.elm;
    const oldProps = oldVnode.data.domProps || {};
    let props2 = vnode.data.domProps || {};
    if (isDef(props2.__ob__) || isTrue(props2._v_attr_proxy)) {
      props2 = vnode.data.domProps = extend({}, props2);
    }
    for (key in oldProps) {
      if (!(key in props2)) {
        elm[key] = "";
      }
    }
    for (key in props2) {
      cur = props2[key];
      if (key === "textContent" || key === "innerHTML") {
        if (vnode.children)
          vnode.children.length = 0;
        if (cur === oldProps[key])
          continue;
        if (elm.childNodes.length === 1) {
          elm.removeChild(elm.childNodes[0]);
        }
      }
      if (key === "value" && elm.tagName !== "PROGRESS") {
        elm._value = cur;
        const strCur = isUndef(cur) ? "" : String(cur);
        if (shouldUpdateValue(elm, strCur)) {
          elm.value = strCur;
        }
      } else if (key === "innerHTML" && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
        svgContainer = svgContainer || document.createElement("div");
        svgContainer.innerHTML = `<svg>${cur}</svg>`;
        const svg = svgContainer.firstChild;
        while (elm.firstChild) {
          elm.removeChild(elm.firstChild);
        }
        while (svg.firstChild) {
          elm.appendChild(svg.firstChild);
        }
      } else if (
        // skip the update if old and new VDOM state is the same.
        // `value` is handled separately because the DOM value may be temporarily
        // out of sync with VDOM state due to focus, composition and modifiers.
        // This  #4521 by skipping the unnecessary `checked` update.
        cur !== oldProps[key]
      ) {
        try {
          elm[key] = cur;
        } catch (e) {
        }
      }
    }
  }
  function shouldUpdateValue(elm, checkVal) {
    return (
      //@ts-expect-error
      !elm.composing && (elm.tagName === "OPTION" || isNotInFocusAndDirty(elm, checkVal) || isDirtyWithModifiers(elm, checkVal))
    );
  }
  function isNotInFocusAndDirty(elm, checkVal) {
    let notInFocus = true;
    try {
      notInFocus = document.activeElement !== elm;
    } catch (e) {
    }
    return notInFocus && elm.value !== checkVal;
  }
  function isDirtyWithModifiers(elm, newVal) {
    const value = elm.value;
    const modifiers = elm._vModifiers;
    if (isDef(modifiers)) {
      if (modifiers.number) {
        return toNumber(value) !== toNumber(newVal);
      }
      if (modifiers.trim) {
        return value.trim() !== newVal.trim();
      }
    }
    return value !== newVal;
  }
  var domProps = {
    create: updateDOMProps,
    update: updateDOMProps
  };
  const parseStyleText = cached(function(cssText) {
    const res = {};
    const listDelimiter = /;(?![^(]*\))/g;
    const propertyDelimiter = /:(.+)/;
    cssText.split(listDelimiter).forEach(function(item) {
      if (item) {
        const tmp = item.split(propertyDelimiter);
        tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return res;
  });
  function normalizeStyleData(data) {
    const style2 = normalizeStyleBinding(data.style);
    return data.staticStyle ? extend(data.staticStyle, style2) : style2;
  }
  function normalizeStyleBinding(bindingStyle) {
    if (Array.isArray(bindingStyle)) {
      return toObject(bindingStyle);
    }
    if (typeof bindingStyle === "string") {
      return parseStyleText(bindingStyle);
    }
    return bindingStyle;
  }
  function getStyle(vnode, checkChild) {
    const res = {};
    let styleData;
    {
      let childNode = vnode;
      while (childNode.componentInstance) {
        childNode = childNode.componentInstance._vnode;
        if (childNode && childNode.data && (styleData = normalizeStyleData(childNode.data))) {
          extend(res, styleData);
        }
      }
    }
    if (styleData = normalizeStyleData(vnode.data)) {
      extend(res, styleData);
    }
    let parentNode2 = vnode;
    while (parentNode2 = parentNode2.parent) {
      if (parentNode2.data && (styleData = normalizeStyleData(parentNode2.data))) {
        extend(res, styleData);
      }
    }
    return res;
  }
  const cssVarRE = /^--/;
  const importantRE = /\s*!important$/;
  const setProp = (el, name, val) => {
    if (cssVarRE.test(name)) {
      el.style.setProperty(name, val);
    } else if (importantRE.test(val)) {
      el.style.setProperty(hyphenate(name), val.replace(importantRE, ""), "important");
    } else {
      const normalizedName = normalize(name);
      if (Array.isArray(val)) {
        for (let i = 0, len = val.length; i < len; i++) {
          el.style[normalizedName] = val[i];
        }
      } else {
        el.style[normalizedName] = val;
      }
    }
  };
  const vendorNames = ["Webkit", "Moz", "ms"];
  let emptyStyle;
  const normalize = cached(function(prop) {
    emptyStyle = emptyStyle || document.createElement("div").style;
    prop = camelize(prop);
    if (prop !== "filter" && prop in emptyStyle) {
      return prop;
    }
    const capName = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (let i = 0; i < vendorNames.length; i++) {
      const name = vendorNames[i] + capName;
      if (name in emptyStyle) {
        return name;
      }
    }
  });
  function updateStyle(oldVnode, vnode) {
    const data = vnode.data;
    const oldData = oldVnode.data;
    if (isUndef(data.staticStyle) && isUndef(data.style) && isUndef(oldData.staticStyle) && isUndef(oldData.style)) {
      return;
    }
    let cur, name;
    const el = vnode.elm;
    const oldStaticStyle = oldData.staticStyle;
    const oldStyleBinding = oldData.normalizedStyle || oldData.style || {};
    const oldStyle = oldStaticStyle || oldStyleBinding;
    const style2 = normalizeStyleBinding(vnode.data.style) || {};
    vnode.data.normalizedStyle = isDef(style2.__ob__) ? extend({}, style2) : style2;
    const newStyle = getStyle(vnode);
    for (name in oldStyle) {
      if (isUndef(newStyle[name])) {
        setProp(el, name, "");
      }
    }
    for (name in newStyle) {
      cur = newStyle[name];
      setProp(el, name, cur == null ? "" : cur);
    }
  }
  var style = {
    create: updateStyle,
    update: updateStyle
  };
  const whitespaceRE = /\s+/;
  function addClass(el, cls) {
    if (!cls || !(cls = cls.trim())) {
      return;
    }
    if (el.classList) {
      if (cls.indexOf(" ") > -1) {
        cls.split(whitespaceRE).forEach((c) => el.classList.add(c));
      } else {
        el.classList.add(cls);
      }
    } else {
      const cur = ` ${el.getAttribute("class") || ""} `;
      if (cur.indexOf(" " + cls + " ") < 0) {
        el.setAttribute("class", (cur + cls).trim());
      }
    }
  }
  function removeClass(el, cls) {
    if (!cls || !(cls = cls.trim())) {
      return;
    }
    if (el.classList) {
      if (cls.indexOf(" ") > -1) {
        cls.split(whitespaceRE).forEach((c) => el.classList.remove(c));
      } else {
        el.classList.remove(cls);
      }
      if (!el.classList.length) {
        el.removeAttribute("class");
      }
    } else {
      let cur = ` ${el.getAttribute("class") || ""} `;
      const tar = " " + cls + " ";
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, " ");
      }
      cur = cur.trim();
      if (cur) {
        el.setAttribute("class", cur);
      } else {
        el.removeAttribute("class");
      }
    }
  }
  function resolveTransition(def2) {
    if (!def2) {
      return;
    }
    if (typeof def2 === "object") {
      const res = {};
      if (def2.css !== false) {
        extend(res, autoCssTransition(def2.name || "v"));
      }
      extend(res, def2);
      return res;
    } else if (typeof def2 === "string") {
      return autoCssTransition(def2);
    }
  }
  const autoCssTransition = cached((name) => {
    return {
      enterClass: `${name}-enter`,
      enterToClass: `${name}-enter-to`,
      enterActiveClass: `${name}-enter-active`,
      leaveClass: `${name}-leave`,
      leaveToClass: `${name}-leave-to`,
      leaveActiveClass: `${name}-leave-active`
    };
  });
  const hasTransition = inBrowser && !isIE9;
  const TRANSITION = "transition";
  const ANIMATION = "animation";
  let transitionProp = "transition";
  let transitionEndEvent = "transitionend";
  let animationProp = "animation";
  let animationEndEvent = "animationend";
  if (hasTransition) {
    if (window.ontransitionend === void 0 && window.onwebkittransitionend !== void 0) {
      transitionProp = "WebkitTransition";
      transitionEndEvent = "webkitTransitionEnd";
    }
    if (window.onanimationend === void 0 && window.onwebkitanimationend !== void 0) {
      animationProp = "WebkitAnimation";
      animationEndEvent = "webkitAnimationEnd";
    }
  }
  const raf = inBrowser ? window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout : (
    /* istanbul ignore next */
    /* istanbul ignore next */
    (fn) => fn()
  );
  function nextFrame(fn) {
    raf(() => {
      raf(fn);
    });
  }
  function addTransitionClass(el, cls) {
    const transitionClasses = el._transitionClasses || (el._transitionClasses = []);
    if (transitionClasses.indexOf(cls) < 0) {
      transitionClasses.push(cls);
      addClass(el, cls);
    }
  }
  function removeTransitionClass(el, cls) {
    if (el._transitionClasses) {
      remove$2(el._transitionClasses, cls);
    }
    removeClass(el, cls);
  }
  function whenTransitionEnds(el, expectedType, cb) {
    const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
    if (!type)
      return cb();
    const event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
    let ended = 0;
    const end = () => {
      el.removeEventListener(event, onEnd);
      cb();
    };
    const onEnd = (e) => {
      if (e.target === el) {
        if (++ended >= propCount) {
          end();
        }
      }
    };
    setTimeout(() => {
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(event, onEnd);
  }
  const transformRE = /\b(transform|all)(,|$)/;
  function getTransitionInfo(el, expectedType) {
    const styles = window.getComputedStyle(el);
    const transitionDelays = (styles[transitionProp + "Delay"] || "").split(", ");
    const transitionDurations = (styles[transitionProp + "Duration"] || "").split(", ");
    const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    const animationDelays = (styles[animationProp + "Delay"] || "").split(", ");
    const animationDurations = (styles[animationProp + "Duration"] || "").split(", ");
    const animationTimeout = getTimeout(animationDelays, animationDurations);
    let type;
    let timeout = 0;
    let propCount = 0;
    if (expectedType === TRANSITION) {
      if (transitionTimeout > 0) {
        type = TRANSITION;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION) {
      if (animationTimeout > 0) {
        type = ANIMATION;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else {
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
      propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
    }
    const hasTransform = type === TRANSITION && transformRE.test(styles[transitionProp + "Property"]);
    return {
      type,
      timeout,
      propCount,
      hasTransform
    };
  }
  function getTimeout(delays, durations) {
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }
    return Math.max.apply(null, durations.map((d, i) => {
      return toMs(d) + toMs(delays[i]);
    }));
  }
  function toMs(s) {
    return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
  }
  function enter(vnode, toggleDisplay) {
    const el = vnode.elm;
    if (isDef(el._leaveCb)) {
      el._leaveCb.cancelled = true;
      el._leaveCb();
    }
    const data = resolveTransition(vnode.data.transition);
    if (isUndef(data)) {
      return;
    }
    if (isDef(el._enterCb) || el.nodeType !== 1) {
      return;
    }
    const { css, type, enterClass, enterToClass, enterActiveClass, appearClass, appearToClass, appearActiveClass, beforeEnter, enter: enter2, afterEnter, enterCancelled, beforeAppear, appear, afterAppear, appearCancelled, duration } = data;
    let context = activeInstance;
    let transitionNode = activeInstance.$vnode;
    while (transitionNode && transitionNode.parent) {
      context = transitionNode.context;
      transitionNode = transitionNode.parent;
    }
    const isAppear = !context._isMounted || !vnode.isRootInsert;
    if (isAppear && !appear && appear !== "") {
      return;
    }
    const startClass = isAppear && appearClass ? appearClass : enterClass;
    const activeClass = isAppear && appearActiveClass ? appearActiveClass : enterActiveClass;
    const toClass = isAppear && appearToClass ? appearToClass : enterToClass;
    const beforeEnterHook = isAppear ? beforeAppear || beforeEnter : beforeEnter;
    const enterHook = isAppear ? isFunction(appear) ? appear : enter2 : enter2;
    const afterEnterHook = isAppear ? afterAppear || afterEnter : afterEnter;
    const enterCancelledHook = isAppear ? appearCancelled || enterCancelled : enterCancelled;
    const explicitEnterDuration = toNumber(isObject2(duration) ? duration.enter : duration);
    if (explicitEnterDuration != null) {
      checkDuration(explicitEnterDuration, "enter", vnode);
    }
    const expectsCSS = css !== false && !isIE9;
    const userWantsControl = getHookArgumentsLength(enterHook);
    const cb = el._enterCb = once(() => {
      if (expectsCSS) {
        removeTransitionClass(el, toClass);
        removeTransitionClass(el, activeClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, startClass);
        }
        enterCancelledHook && enterCancelledHook(el);
      } else {
        afterEnterHook && afterEnterHook(el);
      }
      el._enterCb = null;
    });
    if (!vnode.data.show) {
      mergeVNodeHook(vnode, "insert", () => {
        const parent = el.parentNode;
        const pendingNode = parent && parent._pending && parent._pending[vnode.key];
        if (pendingNode && pendingNode.tag === vnode.tag && pendingNode.elm._leaveCb) {
          pendingNode.elm._leaveCb();
        }
        enterHook && enterHook(el, cb);
      });
    }
    beforeEnterHook && beforeEnterHook(el);
    if (expectsCSS) {
      addTransitionClass(el, startClass);
      addTransitionClass(el, activeClass);
      nextFrame(() => {
        removeTransitionClass(el, startClass);
        if (!cb.cancelled) {
          addTransitionClass(el, toClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitEnterDuration)) {
              setTimeout(cb, explicitEnterDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }
    if (vnode.data.show) {
      toggleDisplay && toggleDisplay();
      enterHook && enterHook(el, cb);
    }
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
  function leave(vnode, rm) {
    const el = vnode.elm;
    if (isDef(el._enterCb)) {
      el._enterCb.cancelled = true;
      el._enterCb();
    }
    const data = resolveTransition(vnode.data.transition);
    if (isUndef(data) || el.nodeType !== 1) {
      return rm();
    }
    if (isDef(el._leaveCb)) {
      return;
    }
    const { css, type, leaveClass, leaveToClass, leaveActiveClass, beforeLeave, leave: leave2, afterLeave, leaveCancelled, delayLeave, duration } = data;
    const expectsCSS = css !== false && !isIE9;
    const userWantsControl = getHookArgumentsLength(leave2);
    const explicitLeaveDuration = toNumber(isObject2(duration) ? duration.leave : duration);
    if (isDef(explicitLeaveDuration)) {
      checkDuration(explicitLeaveDuration, "leave", vnode);
    }
    const cb = el._leaveCb = once(() => {
      if (el.parentNode && el.parentNode._pending) {
        el.parentNode._pending[vnode.key] = null;
      }
      if (expectsCSS) {
        removeTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveActiveClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, leaveClass);
        }
        leaveCancelled && leaveCancelled(el);
      } else {
        rm();
        afterLeave && afterLeave(el);
      }
      el._leaveCb = null;
    });
    if (delayLeave) {
      delayLeave(performLeave);
    } else {
      performLeave();
    }
    function performLeave() {
      if (cb.cancelled) {
        return;
      }
      if (!vnode.data.show && el.parentNode) {
        (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode;
      }
      beforeLeave && beforeLeave(el);
      if (expectsCSS) {
        addTransitionClass(el, leaveClass);
        addTransitionClass(el, leaveActiveClass);
        nextFrame(() => {
          removeTransitionClass(el, leaveClass);
          if (!cb.cancelled) {
            addTransitionClass(el, leaveToClass);
            if (!userWantsControl) {
              if (isValidDuration(explicitLeaveDuration)) {
                setTimeout(cb, explicitLeaveDuration);
              } else {
                whenTransitionEnds(el, type, cb);
              }
            }
          }
        });
      }
      leave2 && leave2(el, cb);
      if (!expectsCSS && !userWantsControl) {
        cb();
      }
    }
  }
  function checkDuration(val, name, vnode) {
    if (typeof val !== "number") {
      warn(`<transition> explicit ${name} duration is not a valid number - got ${JSON.stringify(val)}.`, vnode.context);
    } else if (isNaN(val)) {
      warn(`<transition> explicit ${name} duration is NaN - the duration expression might be incorrect.`, vnode.context);
    }
  }
  function isValidDuration(val) {
    return typeof val === "number" && !isNaN(val);
  }
  function getHookArgumentsLength(fn) {
    if (isUndef(fn)) {
      return false;
    }
    const invokerFns = fn.fns;
    if (isDef(invokerFns)) {
      return getHookArgumentsLength(Array.isArray(invokerFns) ? invokerFns[0] : invokerFns);
    } else {
      return (fn._length || fn.length) > 1;
    }
  }
  function _enter(_, vnode) {
    if (vnode.data.show !== true) {
      enter(vnode);
    }
  }
  var transition = inBrowser ? {
    create: _enter,
    activate: _enter,
    remove(vnode, rm) {
      if (vnode.data.show !== true) {
        leave(vnode, rm);
      } else {
        rm();
      }
    }
  } : {};
  var platformModules = [attrs, klass, events, domProps, style, transition];
  const modules2 = platformModules.concat(baseModules);
  const patch2 = createPatchFunction({ nodeOps, modules: modules2 });
  if (isIE9) {
    document.addEventListener("selectionchange", () => {
      const el = document.activeElement;
      if (el && el.vmodel) {
        trigger(el, "input");
      }
    });
  }
  const directive = {
    inserted(el, binding, vnode, oldVnode) {
      if (vnode.tag === "select") {
        if (oldVnode.elm && !oldVnode.elm._vOptions) {
          mergeVNodeHook(vnode, "postpatch", () => {
            directive.componentUpdated(el, binding, vnode);
          });
        } else {
          setSelected(el, binding, vnode.context);
        }
        el._vOptions = [].map.call(el.options, getValue2);
      } else if (vnode.tag === "textarea" || isTextInputType(el.type)) {
        el._vModifiers = binding.modifiers;
        if (!binding.modifiers.lazy) {
          el.addEventListener("compositionstart", onCompositionStart);
          el.addEventListener("compositionend", onCompositionEnd);
          el.addEventListener("change", onCompositionEnd);
          if (isIE9) {
            el.vmodel = true;
          }
        }
      }
    },
    componentUpdated(el, binding, vnode) {
      if (vnode.tag === "select") {
        setSelected(el, binding, vnode.context);
        const prevOptions = el._vOptions;
        const curOptions = el._vOptions = [].map.call(el.options, getValue2);
        if (curOptions.some((o2, i) => !looseEqual(o2, prevOptions[i]))) {
          const needReset = el.multiple ? binding.value.some((v) => hasNoMatchingOption(v, curOptions)) : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
          if (needReset) {
            trigger(el, "change");
          }
        }
      }
    }
  };
  function setSelected(el, binding, vm) {
    actuallySetSelected(el, binding, vm);
    if (isIE || isEdge) {
      setTimeout(() => {
        actuallySetSelected(el, binding, vm);
      }, 0);
    }
  }
  function actuallySetSelected(el, binding, vm) {
    const value = binding.value;
    const isMultiple = el.multiple;
    if (isMultiple && !Array.isArray(value)) {
      warn(`<select multiple v-model="${binding.expression}"> expects an Array value for its binding, but got ${Object.prototype.toString.call(value).slice(8, -1)}`, vm);
      return;
    }
    let selected, option;
    for (let i = 0, l = el.options.length; i < l; i++) {
      option = el.options[i];
      if (isMultiple) {
        selected = looseIndexOf(value, getValue2(option)) > -1;
        if (option.selected !== selected) {
          option.selected = selected;
        }
      } else {
        if (looseEqual(getValue2(option), value)) {
          if (el.selectedIndex !== i) {
            el.selectedIndex = i;
          }
          return;
        }
      }
    }
    if (!isMultiple) {
      el.selectedIndex = -1;
    }
  }
  function hasNoMatchingOption(value, options2) {
    return options2.every((o2) => !looseEqual(o2, value));
  }
  function getValue2(option) {
    return "_value" in option ? option._value : option.value;
  }
  function onCompositionStart(e) {
    e.target.composing = true;
  }
  function onCompositionEnd(e) {
    if (!e.target.composing)
      return;
    e.target.composing = false;
    trigger(e.target, "input");
  }
  function trigger(el, type) {
    const e = document.createEvent("HTMLEvents");
    e.initEvent(type, true, true);
    el.dispatchEvent(e);
  }
  function locateNode(vnode) {
    return vnode.componentInstance && (!vnode.data || !vnode.data.transition) ? locateNode(vnode.componentInstance._vnode) : vnode;
  }
  var show = {
    bind(el, { value }, vnode) {
      vnode = locateNode(vnode);
      const transition2 = vnode.data && vnode.data.transition;
      const originalDisplay = el.__vOriginalDisplay = el.style.display === "none" ? "" : el.style.display;
      if (value && transition2) {
        vnode.data.show = true;
        enter(vnode, () => {
          el.style.display = originalDisplay;
        });
      } else {
        el.style.display = value ? originalDisplay : "none";
      }
    },
    update(el, { value, oldValue }, vnode) {
      if (!value === !oldValue)
        return;
      vnode = locateNode(vnode);
      const transition2 = vnode.data && vnode.data.transition;
      if (transition2) {
        vnode.data.show = true;
        if (value) {
          enter(vnode, () => {
            el.style.display = el.__vOriginalDisplay;
          });
        } else {
          leave(vnode, () => {
            el.style.display = "none";
          });
        }
      } else {
        el.style.display = value ? el.__vOriginalDisplay : "none";
      }
    },
    unbind(el, binding, vnode, oldVnode, isDestroy) {
      if (!isDestroy) {
        el.style.display = el.__vOriginalDisplay;
      }
    }
  };
  var platformDirectives = {
    model: directive,
    show
  };
  const transitionProps = {
    name: String,
    appear: Boolean,
    css: Boolean,
    mode: String,
    type: String,
    enterClass: String,
    leaveClass: String,
    enterToClass: String,
    leaveToClass: String,
    enterActiveClass: String,
    leaveActiveClass: String,
    appearClass: String,
    appearActiveClass: String,
    appearToClass: String,
    duration: [Number, String, Object]
  };
  function getRealChild(vnode) {
    const compOptions = vnode && vnode.componentOptions;
    if (compOptions && compOptions.Ctor.options.abstract) {
      return getRealChild(getFirstComponentChild(compOptions.children));
    } else {
      return vnode;
    }
  }
  function extractTransitionData(comp) {
    const data = {};
    const options2 = comp.$options;
    for (const key in options2.propsData) {
      data[key] = comp[key];
    }
    const listeners = options2._parentListeners;
    for (const key in listeners) {
      data[camelize(key)] = listeners[key];
    }
    return data;
  }
  function placeholder(h3, rawChild) {
    if (/\d-keep-alive$/.test(rawChild.tag)) {
      return h3("keep-alive", {
        props: rawChild.componentOptions.propsData
      });
    }
  }
  function hasParentTransition(vnode) {
    while (vnode = vnode.parent) {
      if (vnode.data.transition) {
        return true;
      }
    }
  }
  function isSameChild(child, oldChild) {
    return oldChild.key === child.key && oldChild.tag === child.tag;
  }
  const isNotTextNode = (c) => c.tag || isAsyncPlaceholder(c);
  const isVShowDirective = (d) => d.name === "show";
  var Transition = {
    name: "transition",
    props: transitionProps,
    abstract: true,
    render(h3) {
      let children = this.$slots.default;
      if (!children) {
        return;
      }
      children = children.filter(isNotTextNode);
      if (!children.length) {
        return;
      }
      if (children.length > 1) {
        warn("<transition> can only be used on a single element. Use <transition-group> for lists.", this.$parent);
      }
      const mode = this.mode;
      if (mode && mode !== "in-out" && mode !== "out-in") {
        warn("invalid <transition> mode: " + mode, this.$parent);
      }
      const rawChild = children[0];
      if (hasParentTransition(this.$vnode)) {
        return rawChild;
      }
      const child = getRealChild(rawChild);
      if (!child) {
        return rawChild;
      }
      if (this._leaving) {
        return placeholder(h3, rawChild);
      }
      const id = `__transition-${this._uid}-`;
      child.key = child.key == null ? child.isComment ? id + "comment" : id + child.tag : isPrimitive(child.key) ? String(child.key).indexOf(id) === 0 ? child.key : id + child.key : child.key;
      const data = (child.data || (child.data = {})).transition = extractTransitionData(this);
      const oldRawChild = this._vnode;
      const oldChild = getRealChild(oldRawChild);
      if (child.data.directives && child.data.directives.some(isVShowDirective)) {
        child.data.show = true;
      }
      if (oldChild && oldChild.data && !isSameChild(child, oldChild) && !isAsyncPlaceholder(oldChild) && // #6687 component root is a comment node
      !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)) {
        const oldData = oldChild.data.transition = extend({}, data);
        if (mode === "out-in") {
          this._leaving = true;
          mergeVNodeHook(oldData, "afterLeave", () => {
            this._leaving = false;
            this.$forceUpdate();
          });
          return placeholder(h3, rawChild);
        } else if (mode === "in-out") {
          if (isAsyncPlaceholder(child)) {
            return oldRawChild;
          }
          let delayedLeave;
          const performLeave = () => {
            delayedLeave();
          };
          mergeVNodeHook(data, "afterEnter", performLeave);
          mergeVNodeHook(data, "enterCancelled", performLeave);
          mergeVNodeHook(oldData, "delayLeave", (leave2) => {
            delayedLeave = leave2;
          });
        }
      }
      return rawChild;
    }
  };
  const props = extend({
    tag: String,
    moveClass: String
  }, transitionProps);
  delete props.mode;
  var TransitionGroup = {
    props,
    beforeMount() {
      const update3 = this._update;
      this._update = (vnode, hydrating) => {
        const restoreActiveInstance = setActiveInstance(this);
        this.__patch__(
          this._vnode,
          this.kept,
          false,
          // hydrating
          true
          // removeOnly (!important, avoids unnecessary moves)
        );
        this._vnode = this.kept;
        restoreActiveInstance();
        update3.call(this, vnode, hydrating);
      };
    },
    render(h3) {
      const tag = this.tag || this.$vnode.data.tag || "span";
      const map = /* @__PURE__ */ Object.create(null);
      const prevChildren = this.prevChildren = this.children;
      const rawChildren = this.$slots.default || [];
      const children = this.children = [];
      const transitionData = extractTransitionData(this);
      for (let i = 0; i < rawChildren.length; i++) {
        const c = rawChildren[i];
        if (c.tag) {
          if (c.key != null && String(c.key).indexOf("__vlist") !== 0) {
            children.push(c);
            map[c.key] = c;
            (c.data || (c.data = {})).transition = transitionData;
          } else {
            const opts = c.componentOptions;
            const name = opts ? getComponentName(opts.Ctor.options) || opts.tag || "" : c.tag;
            warn(`<transition-group> children must be keyed: <${name}>`);
          }
        }
      }
      if (prevChildren) {
        const kept = [];
        const removed = [];
        for (let i = 0; i < prevChildren.length; i++) {
          const c = prevChildren[i];
          c.data.transition = transitionData;
          c.data.pos = c.elm.getBoundingClientRect();
          if (map[c.key]) {
            kept.push(c);
          } else {
            removed.push(c);
          }
        }
        this.kept = h3(tag, null, kept);
        this.removed = removed;
      }
      return h3(tag, null, children);
    },
    updated() {
      const children = this.prevChildren;
      const moveClass = this.moveClass || (this.name || "v") + "-move";
      if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
        return;
      }
      children.forEach(callPendingCbs);
      children.forEach(recordPosition);
      children.forEach(applyTranslation);
      this._reflow = document.body.offsetHeight;
      children.forEach((c) => {
        if (c.data.moved) {
          const el = c.elm;
          const s = el.style;
          addTransitionClass(el, moveClass);
          s.transform = s.WebkitTransform = s.transitionDuration = "";
          el.addEventListener(transitionEndEvent, el._moveCb = function cb(e) {
            if (e && e.target !== el) {
              return;
            }
            if (!e || /transform$/.test(e.propertyName)) {
              el.removeEventListener(transitionEndEvent, cb);
              el._moveCb = null;
              removeTransitionClass(el, moveClass);
            }
          });
        }
      });
    },
    methods: {
      hasMove(el, moveClass) {
        if (!hasTransition) {
          return false;
        }
        if (this._hasMove) {
          return this._hasMove;
        }
        const clone2 = el.cloneNode();
        if (el._transitionClasses) {
          el._transitionClasses.forEach((cls) => {
            removeClass(clone2, cls);
          });
        }
        addClass(clone2, moveClass);
        clone2.style.display = "none";
        this.$el.appendChild(clone2);
        const info = getTransitionInfo(clone2);
        this.$el.removeChild(clone2);
        return this._hasMove = info.hasTransform;
      }
    }
  };
  function callPendingCbs(c) {
    if (c.elm._moveCb) {
      c.elm._moveCb();
    }
    if (c.elm._enterCb) {
      c.elm._enterCb();
    }
  }
  function recordPosition(c) {
    c.data.newPos = c.elm.getBoundingClientRect();
  }
  function applyTranslation(c) {
    const oldPos = c.data.pos;
    const newPos = c.data.newPos;
    const dx = oldPos.left - newPos.left;
    const dy = oldPos.top - newPos.top;
    if (dx || dy) {
      c.data.moved = true;
      const s = c.elm.style;
      s.transform = s.WebkitTransform = `translate(${dx}px,${dy}px)`;
      s.transitionDuration = "0s";
    }
  }
  var platformComponents = {
    Transition,
    TransitionGroup
  };
  Vue2.config.mustUseProp = mustUseProp;
  Vue2.config.isReservedTag = isReservedTag;
  Vue2.config.isReservedAttr = isReservedAttr;
  Vue2.config.getTagNamespace = getTagNamespace;
  Vue2.config.isUnknownElement = isUnknownElement;
  extend(Vue2.options.directives, platformDirectives);
  extend(Vue2.options.components, platformComponents);
  Vue2.prototype.__patch__ = inBrowser ? patch2 : noop2;
  Vue2.prototype.$mount = function(el, hydrating) {
    el = el && inBrowser ? query(el) : void 0;
    return mountComponent(this, el, hydrating);
  };
  if (inBrowser) {
    setTimeout(() => {
      if (config.devtools) {
        if (devtools) {
          devtools.emit("init", Vue2);
        } else {
          console[console.info ? "info" : "log"]("Download the Vue Devtools extension for a better development experience:\nhttps://github.com/vuejs/vue-devtools");
        }
      }
      if (config.productionTip !== false && typeof console !== "undefined") {
        console[console.info ? "info" : "log"](`You are running Vue in development mode.
Make sure to turn on production mode when deploying for production.
See more tips at https://vuejs.org/guide/deployment.html`);
      }
    }, 0);
  }
  extend(Vue2, vca);
  vue_runtime_common_dev = Vue2;
  return vue_runtime_common_dev;
}
if (process.env.NODE_ENV === "production") {
  vue_runtime_common.exports = requireVue_runtime_common_prod();
} else {
  vue_runtime_common.exports = requireVue_runtime_common_dev();
}
var vue_runtime_commonExports = vue_runtime_common.exports;
const Vue$1 = /* @__PURE__ */ getDefaultExportFromCjs(vue_runtime_commonExports);
const {
  version,
  // refs
  ref,
  shallowRef,
  isRef,
  toRef,
  toRefs,
  unref,
  proxyRefs,
  customRef,
  triggerRef,
  computed,
  // reactive
  reactive,
  isReactive,
  isReadonly,
  isShallow,
  isProxy,
  shallowReactive,
  markRaw,
  toRaw,
  readonly,
  shallowReadonly,
  // watch
  watch,
  watchEffect,
  watchPostEffect,
  watchSyncEffect,
  // effectScope
  effectScope,
  onScopeDispose,
  getCurrentScope,
  // provide / inject
  provide,
  inject,
  // lifecycle
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onActivated,
  onDeactivated,
  onServerPrefetch,
  onRenderTracked,
  onRenderTriggered,
  // v2 only
  set,
  del,
  // v3 compat
  h,
  getCurrentInstance,
  useSlots,
  useAttrs,
  mergeDefaults,
  nextTick,
  useCssModule,
  useCssVars,
  defineComponent,
  defineAsyncComponent
} = Vue$1;
function isPlainObject(value) {
  return isObject$1(value) && !Array.isArray(value);
}
function isObject$1(value) {
  return !!value && typeof value === "object";
}
function isNumeric(value) {
  return typeof value === "number" || /^\d+$/.test(value);
}
function hasKey(obj, key) {
  return isObject$1(obj) && key in obj;
}
function getKeys(value) {
  return !value ? [] : Array.isArray(value) ? value.map(function(key) {
    return String(key);
  }) : typeof value === "object" ? Object.keys(value) : typeof value === "string" ? value.match(/[-$\w]+/g) || [] : [];
}
function getValue(obj, path2) {
  var value = obj;
  var keys = getKeys(path2);
  keys.every(function(key) {
    var valid = isObject$1(value) && value.hasOwnProperty(key);
    value = valid ? value[key] : void 0;
    return valid;
  });
  return value;
}
function setValue(obj, path2, value, create) {
  if (create === void 0) create = false;
  var keys = getKeys(path2);
  return keys.reduce(function(obj2, key, index2) {
    if (!obj2) {
      return false;
    }
    if (Array.isArray(obj2) && isNumeric(key)) {
      key = parseInt(key);
    }
    if (index2 === keys.length - 1) {
      obj2[key] = value;
      return true;
    } else if (!isObject$1(obj2[key]) || !(key in obj2)) {
      if (create) {
        obj2[key] = isNumeric(keys[index2 + 1]) ? [] : {};
      } else {
        return false;
      }
    }
    return obj2[key];
  }, obj);
}
function hasValue(obj, path2) {
  var keys = getKeys(path2);
  if (isObject$1(obj)) {
    while (keys.length) {
      var key = keys.shift();
      if (hasKey(obj, key)) {
        obj = obj[key];
      } else {
        return false;
      }
    }
    return true;
  }
  return false;
}
function clone$2(obj) {
  return JSON.parse(JSON.stringify(obj));
}
var options = {
  mapping: "standard",
  // cache generated functions for faster re-use
  deep: 1
  // allow sub-property access, but not creation
};
var formatters = {
  camel: function() {
    var args = [], len = arguments.length;
    while (len--) args[len] = arguments[len];
    return args.shift() + args.map(function(text) {
      return text.replace(/\w/, function(c) {
        return c.toUpperCase();
      });
    }).join("");
  },
  snake: function() {
    var ref2;
    var args = [], len = arguments.length;
    while (len--) args[len] = arguments[len];
    return (ref2 = this).camel.apply(ref2, args).replace(/([a-z])([A-Z])/g, function(match, a, b) {
      return a + "_" + b;
    }).toLowerCase();
  },
  const: function() {
    var ref2;
    var args = [], len = arguments.length;
    while (len--) args[len] = arguments[len];
    return (ref2 = this).snake.apply(ref2, args).toUpperCase();
  }
};
var members = {
  state: "state",
  getters: "getters",
  actions: "_actions",
  mutations: "_mutations"
};
var resolvers = {
  /**
   * Standard name mapping function
   *
   * Adheres to seemingly the most common Vuex naming pattern
   *
   * @param   {string}  type          The member type, i.e state, getters, mutations, or actions
   * @param   {string}  name          The name of the property being targeted, i.e. value
   * @param   {object}  formatters    A formatters object with common format functions, camel, snake, const
   * @returns {string}
   */
  standard: function standard(type, name, formatters$$1) {
    switch (type) {
      case "mutations":
        return formatters$$1.const("set", name);
      case "actions":
        return formatters$$1.camel("set", name);
    }
    return name;
  },
  /**
   * Simple name mapping function
   */
  simple: function simple(type, name, formatters$$1) {
    if (type === "actions") {
      return formatters$$1.camel("set", name);
    }
    return name;
  }
};
var resolver;
function resolveName(type, name) {
  if (name.match(/!$/)) {
    return name.substr(0, name.length - 1);
  }
  var fn = resolver;
  if (!fn) {
    if (typeof options.mapping === "function") {
      fn = options.mapping;
    } else {
      fn = resolvers[options.mapping];
      if (!fn) {
        throw new Error("[Vuex Pathify] Unknown mapping '" + options.mapping + "' in options\n    - Choose one of '" + Object.keys(resolvers).join("', '") + "'\n    - Or, supply a custom function\n");
      }
    }
    resolver = fn;
  }
  return resolver(type, name, formatters);
}
function resolve(store2, path2) {
  var absPath = path2.replace(/[/@!]+/g, ".");
  var ref2 = path2.split("@");
  var statePath = ref2[0];
  var objPath = ref2[1];
  var modPath, trgName;
  if (statePath.indexOf("/") > -1) {
    var keys = statePath.split("/");
    trgName = keys.pop();
    modPath = keys.join("/");
  } else {
    trgName = statePath;
  }
  if (modPath && !store2._modulesNamespaceMap[modPath + "/"]) {
    throw new Error("[Vuex Pathify] Unknown module '" + modPath + "' via path '" + path2 + "'");
  }
  return {
    absPath,
    module: modPath,
    target: statePath,
    name: trgName.replace("!", ""),
    isDynamic: path2.indexOf(":") > -1,
    /**
     * Returns properties about the targeted member
     *
     * @param   {string}  type  The member type, i.e state, getters, mutations, or actions
     * @returns {{exists: boolean, member: object, type: string, path: string}}
     */
    get: function(type) {
      var member = store2[members[type]];
      var resName = resolveName(type, trgName);
      var trgPath = modPath ? modPath + "/" + resName : resName;
      return {
        exists: type === "state" ? hasValue(member, trgPath) : trgPath in member,
        member,
        trgPath,
        trgName: resName,
        objPath
      };
    }
  };
}
function getError(path2, resolver2, aName, a, bName, b) {
  var error = "[Vuex Pathify] Unable to map path '" + path2 + "':";
  if (path2.indexOf("!") > -1) {
    error += "\n    - Did not find " + aName + " or " + bName + " named '" + resolver2.name + "' on " + (resolver2.module ? "module '" + resolver2.module + "'" : "root store");
  } else {
    var aText = a ? aName + " '" + a.trgName + "' or " : "";
    var bText = bName + " '" + b.trgName + "'";
    error += "\n    - Did not find " + aText + bText + " on " + (resolver2.module ? "module '" + resolver2.module + "'" : "store") + "\n    - Use direct syntax '" + resolver2.target.replace(/(@|$)/, "!$1") + "' (if member exists) to target directly";
  }
  return error;
}
var Payload = function Payload2(expr, path2, value) {
  this.expr = expr;
  this.path = path2;
  this.value = value;
};
Payload.prototype.update = function update(target2) {
  if (!options.deep) {
    console.error("[Vuex Pathify] Unable to access sub-property for path '" + this.expr + "':\n    - Set option 'deep' to 1 to allow it");
    return target2;
  }
  var success = setValue(target2, this.path, this.value, options.deep > 1);
  if (!success && process.env.NODE_ENV !== "production") {
    console.error("[Vuex Pathify] Unable to create sub-property for path '" + this.expr + "':\n    - Set option 'deep' to 2 to allow it");
    return target2;
  }
  return Array.isArray(target2) ? [].concat(target2) : Object.assign({}, target2);
};
Payload.isSerialized = function(value) {
  return isPlainObject(value) && "expr" in value && "path" in value && "value" in value;
};
function makeSetter(store2, path2) {
  var resolver2 = resolve(store2, path2);
  var action = resolver2.get("actions");
  if (action.exists) {
    return function(value) {
      var payload = action.objPath ? new Payload(path2, action.objPath, value) : value;
      return store2.dispatch(action.trgPath, payload);
    };
  }
  var mutation = resolver2.get("mutations");
  if (mutation.exists || resolver2.isDynamic) {
    return function(value) {
      if (resolver2.isDynamic) {
        var interpolated = interpolate(path2, this);
        mutation = resolve(store2, interpolated).get("mutations");
      }
      var payload = mutation.objPath ? new Payload(path2, mutation.objPath, value) : value;
      return store2.commit(mutation.trgPath, payload);
    };
  }
  if (process.env.NODE_ENV !== "production") {
    console.error(getError(path2, resolver2, "action", action, "mutation", mutation));
  }
  return function(value) {
  };
}
function makeGetter(store2, path2, stateOnly) {
  var resolver2 = resolve(store2, path2);
  var getter;
  {
    getter = resolver2.get("getters");
    if (getter.exists) {
      return function() {
        var value = getter.member[getter.trgPath];
        return getter.objPath ? getValueIfEnabled(path2, value, getter.objPath) : value;
      };
    }
  }
  var state2 = resolver2.get("state");
  if (state2.exists || resolver2.isDynamic) {
    return function() {
      var absPath = resolver2.isDynamic ? interpolate(resolver2.absPath, this) : resolver2.absPath;
      return getValueIfEnabled(path2, store2.state, absPath);
    };
  }
  if (process.env.NODE_ENV !== "production") {
    console.error(getError(path2, resolver2, "getter", getter, "state", state2));
  }
  return function() {
  };
}
function getValueIfEnabled(expr, source, path2) {
  if (!options.deep && expr.indexOf("@") > -1) {
    console.error("[Vuex Pathify] Unable to access sub-property for path '" + expr + "':\n    - Set option 'deep' to 1 to allow it");
    return;
  }
  return getValue(source, path2);
}
function interpolate(path2, scope) {
  return path2.replace(/:(\w+)/g, function replace(all, token) {
    if (!(token in scope)) {
      console.error('Error resolving dynamic store path: The property "' + token + '" does not exist on the scope', scope);
    }
    return scope[token];
  });
}
function accessorize(store2) {
  store2.set = function(path2, value) {
    var setter = makeSetter(store2, path2);
    if (typeof setter !== "undefined") {
      return setter(value);
    }
  };
  store2.get = function(path2) {
    var args = [], len = arguments.length - 1;
    while (len-- > 0) args[len] = arguments[len + 1];
    var getter = makeGetter(store2, path2);
    if (typeof getter !== "undefined") {
      var value = getter();
      return typeof value === "function" ? value.apply(void 0, args) : value;
    }
  };
  store2.copy = function(path2) {
    var args = [], len = arguments.length - 1;
    while (len-- > 0) args[len] = arguments[len + 1];
    var value = store2.get.apply(store2, [path2].concat(args));
    return isObject$1(value) ? clone$2(value) : value;
  };
}
function plugin(store2) {
  accessorize(store2);
}
var pathify = {
  options,
  plugin
};
function getStateKeys(state2) {
  return getKeys(typeof state2 === "function" ? state2() : state2);
}
function makeGetters(state2) {
  return getStateKeys(state2).reduce(function(obj, key) {
    var getter = resolveName("getters", key);
    obj[getter] = function(state22) {
      return state22[key];
    };
    return obj;
  }, {});
}
function makeMutations(state2) {
  return getStateKeys(state2).reduce(function(obj, key) {
    var mutation = resolveName("mutations", key);
    obj[mutation] = function(state22, value) {
      if (value instanceof Payload) {
        value = value.update(state22[key]);
      } else if (Payload.isSerialized(value)) {
        value = Payload.prototype.update.call(value, state22[key]);
      }
      state22[key] = value;
    };
    return obj;
  }, {});
}
function makeActions(state2) {
  return getStateKeys(state2).reduce(function(obj, key) {
    var action = resolveName("actions", key);
    var mutation = resolveName("mutations", key);
    obj[action] = function(ref2, value) {
      var commit3 = ref2.commit;
      commit3(mutation, value);
    };
    return obj;
  }, {});
}
var store$1 = {
  getters: makeGetters,
  mutations: makeMutations,
  actions: makeActions
};
const state$4 = {
  time: 0,
  started: 0,
  serial: null,
  config: {
    lang: "en",
    style: "light",
    titleBar: "default",
    useHB: false,
    useHBMode: "refactored",
    useHBRoot: "http://api.pkg-zone.com/",
    showConfigObject: false,
    enableExternalLinks: false,
    enableSystemNotifications: false
  },
  server: {
    ip: "",
    port: "8337",
    app: "express",
    base_path: "",
    auto_scan_on_startup: true,
    scan_subdir: false,
    prependFullPath: false,
    enableQueueScanner: false,
    skipInstalledQueueItems: true,
    readSFOHeader: false
  },
  ps4: {
    ip: "",
    app: "rpi",
    name: "",
    port: 12800,
    port_rpi: 12800,
    port_rpiOOP: 12800,
    port_ftp: 2121,
    port_etaHEN: 9090,
    port_singleDPI: 9090,
    port_goldhen: 9090,
    singleDPI_queue_mode: "delay",
    singleDPI_queue_delay_seconds: 2,
    timeout: 2500,
    update: 2200
  }
};
const mutations$4 = {
  ...store$1.mutations(state$4),
  addTime(state2) {
    state2.time++;
  },
  addStarted(state2) {
    state2.started++;
  },
  resetServer(state2) {
    state2.server = {
      ip: "",
      port: "8337",
      app: "express",
      base_path: "",
      auto_scan_on_startup: true,
      scan_subdir: false,
      prependFullPath: false,
      enableQueueScanner: false,
      skipInstalledQueueItems: true,
      readSFOHeader: false
    };
    state2.ps4 = {
      ip: "",
      app: "rpi",
      name: "",
      port: 12800,
      port_rpi: 12800,
      port_rpiOOP: 12800,
      port_ftp: 2121,
      port_etaHEN: 9090,
      port_singleDPI: 9090,
      port_goldhen: 9090,
      singleDPI_queue_mode: "delay",
      singleDPI_queue_delay_seconds: 2,
      timeout: 2500,
      update: 2200
    };
  },
  resetConfig(state2) {
    state2.config = {
      lang: "en",
      style: "light",
      useHB: false,
      useHBMode: "refactored",
      useHBRoot: "http://api.pkg-zone.com/",
      useHBCustomRoot: "",
      showConfigObject: false,
      enableExternalLinks: false,
      enableSystemNotifications: false
    };
  },
  saveServer(state2) {
    state2.server = state2.server;
  },
  toggleQueueScanner(state2) {
    state2.server.enableQueueScanner = !state2.server.enableQueueScanner;
  }
};
const actions$4 = {
  ...store$1.actions(state$4),
  addTime({ state: state2, commit: commit2 }) {
    commit2("addTime");
  },
  started({ commit: commit2 }) {
    commit2("addStarted");
  },
  reset({ commit: commit2 }) {
    commit2("resetServer");
  },
  save({ commit: commit2 }) {
    commit2("saveServer");
  },
  resetConfig({ commit: commit2 }) {
    commit2("resetConfig");
  },
  toggleQueueScanner({ commit: commit2 }) {
    commit2("toggleQueueScanner");
  }
  // addFiles({ commit, dispatch, state}, payload){
  //     commit('addFiles', payload)
  // }
};
const getters$4 = {
  // make all getters (optional)
  ...store$1.getters(state$4),
  isPS5(state2) {
    return ["etaHEN", "singleDPI"].includes(state2.ps4.app);
  },
  isSingleDPI(state2) {
    return state2.ps4.app == "singleDPI";
  },
  getPS4TargetApp(state2) {
    return state2.ps4.app;
  },
  getPS4IP(state2) {
    return state2.ps4.ip + ":" + state2.ps4.port;
  },
  getPS4Timeout(state2) {
    return state2.ps4.timeout;
  },
  getServerIP(state2) {
    return state2.server.ip + ":" + state2.server.port;
  },
  getPrefixFullPath(state2) {
    return state2.server.prependFullPath;
  },
  getReadSFOHeader(state2) {
    return state2.server.readSFOHeader;
  },
  getStyle(state2) {
    return state2.config.style;
  }
  // overwrite default `items` getter
  // allFiles: state => {
  //     return state.images
  // },
};
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  actions: actions$4,
  getters: getters$4,
  mutations: mutations$4,
  state: state$4
}, Symbol.toStringTag, { value: "Module" }));
const LOGOUT = "LOGOUT";
const SAVE_TOKEN = "SAVE_TOKEN";
const FETCH_USER_SUCCESS = "FETCH_USER_SUCCESS";
const FETCH_USER_FAILURE = "FETCH_USER_FAILURE";
const UPDATE_USER = "UPDATE_USER";
const SET_LOCALE = "SET_LOCALE";
const state$3 = {
  user: null,
  token: null
};
const getters$3 = {
  user: (state2) => state2.user,
  token: (state2) => state2.token,
  check: (state2) => state2.user !== null
};
const mutations$3 = {
  [SAVE_TOKEN](state2, { token, remember }) {
    state2.token = token;
  },
  [FETCH_USER_SUCCESS](state2, { user }) {
    state2.user = user;
  },
  [FETCH_USER_FAILURE](state2) {
    state2.token = null;
  },
  [LOGOUT](state2) {
    state2.user = null;
    state2.token = null;
  },
  [UPDATE_USER](state2, { user }) {
    state2.user = user;
  }
};
const actions$3 = {
  saveToken({ commit: commit2, dispatch: dispatch2 }, payload) {
    commit2(SAVE_TOKEN, payload);
  },
  async fetchUser({ commit: commit2 }) {
    try {
      const { data } = await axios.get("/api/auth/user");
      commit2(FETCH_USER_SUCCESS, { user: data });
    } catch (e) {
      commit2(FETCH_USER_FAILURE);
    }
  },
  updateUser({ commit: commit2 }, payload) {
    commit2(UPDATE_USER, payload);
  },
  async logout({ commit: commit2 }) {
    try {
      await axios.post("/api/auth/logout");
    } catch (e) {
    }
    commit2(LOGOUT);
  },
  async fetchOauthUrl(ctx, { provider }) {
    const { data } = await axios.post(`/api/auth/oauth/${provider}`);
    return data.url;
  }
};
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  actions: actions$3,
  getters: getters$3,
  mutations: mutations$3,
  state: state$3
}, Symbol.toStringTag, { value: "Module" }));
const { locale, locales } = { locale: "en", locales: ["de", "en", "zh-CN"] };
const state$2 = {
  locale,
  locales
};
const getters$2 = {
  locale: (state2) => state2.locale,
  locales: (state2) => state2.locales
};
const mutations$2 = {
  [SET_LOCALE](state2, { locale: locale2 }) {
    state2.locale = locale2;
  }
};
const actions$2 = {
  setLocale({ commit: commit2 }, { locale: locale2 }) {
    commit2(SET_LOCALE, { locale: locale2 });
  }
};
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  actions: actions$2,
  getters: getters$2,
  mutations: mutations$2,
  state: state$2
}, Symbol.toStringTag, { value: "Module" }));
const state$1 = {
  queue: [],
  tasks: [],
  installed: [],
  logs: []
};
const mutations$1 = {
  ...store$1.mutations(state$1),
  resetAll(state2) {
    state2.queue = [];
    state2.tasks = [];
    state2.installed = [];
    state2.logs = [];
  },
  toQueue(state2, file) {
    state2.queue.push(file);
  },
  removeQueue(state2, file) {
    state2.queue = state2.queue.filter((x) => x.name != file.name);
  },
  toInstalled(state2, file) {
    state2.installed.push(file);
  },
  status(state2, { file, status }) {
    let i = state2.queue.findIndex((x) => x.name == file.name);
    state2.queue[i].status = status;
  },
  task(state2, { file, id }) {
    let i = state2.queue.findIndex((x) => x.name == file.name);
    state2.queue[i].task = id;
  },
  addLog(state2, log) {
    state2.logs.unshift(log);
  },
  addTask(state2, task) {
    state2.tasks.push(task);
  }
};
const actions$1 = {
  ...store$1.actions(state$1),
  resetAll({ commit: commit2 }) {
    commit2("resetAll");
  },
  addToQueue({ commit: commit2 }, file) {
    commit2("toQueue", file);
  },
  removeFromQueue({ commit: commit2 }, file) {
    commit2("removeQueue", file);
  },
  installed({ commit: commit2, state: state2 }, file) {
    let i = state2.installed.findIndex((x) => x.name == file.name);
    console.log(file.name + " installed. lets check file at pos " + i);
    if (i == -1) {
      commit2("toInstalled", file);
    } else {
      console.log(file.name + " is already installed");
      state2.installed[i].status = "installedSkipped";
    }
  },
  status({ commit: commit2 }, data) {
    commit2("status", data);
  },
  task({ commit: commit2 }, data) {
    commit2("task", data);
  },
  addLog({ commit: commit2 }, log) {
    commit2("addLog", log);
  },
  addTask({ commit: commit2 }, task) {
    commit2("addTask", task);
  }
  // addFiles({ commit, dispatch, state}, payload){
  //     commit('addFiles', payload)
  // }
};
const getters$1 = {
  // make all getters (optional)
  ...store$1.getters(state$1),
  isInQueue: (state2) => (file) => {
    return state2.queue.find((x) => x.path == file.path);
  },
  isInQueueUnique: (state2) => (file) => {
    return state2.queue.find((x) => x.path == file.path);
  },
  isInstalled: (state2) => (file) => {
    return state2.installed.find((x) => x.path == file.path);
  }
  // overwrite default `items` getter
  // allFiles: state => {
  //     return state.images
  // },
};
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  actions: actions$1,
  getters: getters$1,
  mutations: mutations$1,
  state: state$1
}, Symbol.toStringTag, { value: "Module" }));
const getFiles = (folder, deep = false) => {
  const files = [];
  try {
    const fileObjects = fs$4.readdirSync(folder, { withFileTypes: true });
    for (const fileObject of fileObjects) {
      const file = fileObject.name;
      const forbidden = ["$RECYCLE.BIN", "desktop.ini", ".Spotlight", ".Spotlight-V100", ".Trashes", ".Trash", "Thumbs.db", ".DS_Store"].includes(file);
      if (forbidden) {
        continue;
      }
      const fullPath = path$6.join(folder, file);
      if (fileObject.isDirectory() && deep) {
        const nestedFiles = getFiles(fullPath, deep);
        files.push(...nestedFiles);
      } else {
        files.push(fullPath);
      }
    }
  } catch (e) {
    console.log("Error reading folder", folder);
    console.log(e);
  }
  console.log("Found " + files.length + " Files");
  return files;
};
let o = {
  async getFilesFromBasePath(folder = "", scan_subdir = false) {
    if (!folder) {
      console.log("::fs | No base_path given for the server.");
      return;
    }
    console.log("Loading Files from Subdirectory", scan_subdir);
    console.log("Loading Directory files in ", folder);
    let files = (await getFiles(folder, scan_subdir)).filter((file) => this.isPKG(file)).map((item) => this.createItem(item, folder));
    files = await Promise.all(files);
    console.log("Found files " + files.length);
    return files;
  },
  getFiles,
  getFileName(p = null) {
    if (!p) return "n/a";
    return path$6.basename(p);
  },
  getFileSize(p = null, d = 2, returnBytes = false) {
    if (!p) return "n/a";
    let stats = fs$4.statSync(p);
    if (stats && stats.size)
      return returnBytes ? stats.size : this.formatBytes(stats.size, d);
    return "n/a";
  },
  walk(folder) {
    console.log("Walking Directory", folder);
    const files = fs$4.readdirSync(folder);
    files.forEach((file) => {
      let filePath = path$6.join(folder, file);
      let fullPath = path$6.resolve(folder, file);
      let isDir = fs$4.promises.lstatSync(filepath).isDirectory();
      console.log(fullPath, filePath);
      if (isDir) {
        console.log("Found directory", fullPath);
        this.walk(fullPath);
      } else {
        if (this.isPKG(file))
          this.createItem(file, fullPath);
      }
    });
    return files;
  },
  isFile(item) {
    return !!path$6.extname(item);
  },
  isPKG(item) {
    return path$6.extname(item).includes("pkg");
  },
  async createItem(item, folder = "") {
    const shouldPrefix = store.getters["app/getPrefixFullPath"];
    const readSFOHeader = store.getters["app/getReadSFOHeader"];
    let isFile = this.isFile(item);
    if (!isFile) return false;
    let fileName = path$6.basename(item);
    let fullPath = path$6.resolve(folder, item);
    let patchedFilename;
    if (shouldPrefix) {
      patchedFilename = fullPath.charAt(0) == "/" ? fullPath.substr(1).replace(/[^a-zA-Z0-9-_./]/g, "") : fullPath.replace(/[^a-zA-Z0-9-_./]/g, "");
    } else {
      patchedFilename = fileName.replace(/[^a-zA-Z0-9-_.]/g, "");
    }
    let stats = fs$4.lstatSync(fullPath);
    let size = this.formatBytes(stats.size, 2);
    let searchCUSA = fileName.match(/(CUSA\d{5})/i);
    let cusa = searchCUSA ? searchCUSA[0].toUpperCase() : "";
    let sfo = { readSFOHeader };
    if (readSFOHeader) {
      sfo = await this.getItemSFO(item);
      cusa = sfo.TITLE_ID;
    }
    let finalItem = {
      name: fileName,
      status: "n/a",
      percentage: 0,
      rest: 0,
      task: "",
      ext: path$6.extname(item),
      path: fullPath,
      url: null,
      type: "local",
      cusa,
      isFile,
      patchedFilename,
      sizeInBytes: stats.size,
      size,
      logs: [],
      sfo,
      image: null
      // stats,
    };
    return finalItem;
  },
  createItemFromHBLegacy(item, root = "") {
    let fullPath = root + "dl.php?tid=" + item.id;
    let patchedFilename = item.name.replace(/[^a-zA-Z0-9-_.]/g, "");
    item.name + " (version " + item.version + ")";
    let size = item.Size ? item.Size.replace("s", "") : "n/a";
    return {
      name: item.name,
      status: "remote",
      percentage: 0,
      rest: 0,
      task: "",
      ext: "remote",
      // path.extname(item),
      path: fullPath,
      url: fullPath,
      type: "remote",
      cusa: item.id,
      isFile: true,
      patchedFilename,
      sizeInBytes: size,
      // stats.size,
      size,
      logs: [],
      // stats,
      data: item
    };
  },
  createItemFromHBRefactored(item, root = "") {
    let patchedFilename = item.name.replace(/[^a-zA-Z0-9-_.]/g, "");
    let size = item.size ? this.formatBytes(item.size) : "n/a";
    let filePath = item.file ? item.file.replace("https", "http") : item.file;
    if (!item.file && item.file_ps5) {
      filePath = item.file_ps5 ? item.file_ps5.replace("https", "http") : item.file_ps5;
    }
    if (store.getters["app/isPS5"] && item.file_ps5) {
      filePath = item.file_ps5 ? item.file_ps5.replace("https", "http") : item.file_ps5;
    }
    return {
      name: item.name,
      status: "remote",
      percentage: 0,
      rest: 0,
      task: "",
      ext: "pkg",
      // path.extname(item),
      path: filePath,
      url: filePath,
      type: item.type,
      cusa: item.cusa,
      isFile: true,
      patchedFilename,
      sizeInBytes: size,
      // stats.size,
      size,
      logs: [],
      // stats,
      data: item
    };
  },
  createItemFromURL(item) {
    let patchedFilename = item.name.replace(/[^a-zA-Z0-9-_.]/g, "");
    let fullPath = item.url;
    let size = "n/a";
    return {
      name: item.name,
      status: "url",
      percentage: 0,
      rest: 0,
      task: "",
      ext: "remote",
      // path.extname(item),
      path: fullPath,
      url: fullPath,
      type: "remote",
      cusa: item.cusa,
      isFile: true,
      patchedFilename,
      sizeInBytes: size,
      // stats.size,
      size,
      logs: []
      // stats,
    };
  },
  async createItemFromDraggedFile(draggedFilePath) {
    const readSFOHeader = store.getters["app/getReadSFOHeader"];
    let name = path$6.basename(draggedFilePath);
    let patchedFilename = name.replace(/[^a-zA-Z0-9-_.]/g, "");
    let size = this.getFileSize(draggedFilePath, 2, true);
    let searchCUSA = name.match(/(CUSA\d{5})/i);
    let cusa = searchCUSA ? searchCUSA[0].toUpperCase() : "";
    let sfo = { readSFOHeader };
    if (readSFOHeader) {
      sfo = await this.getItemSFO(draggedFilePath);
      cusa = sfo.TITLE_ID;
    }
    return {
      name,
      status: "Dragged",
      percentage: 0,
      rest: 0,
      task: "",
      ext: path$6.extname(draggedFilePath),
      path: draggedFilePath,
      url: null,
      type: "dragged",
      cusa,
      isFile: true,
      patchedFilename,
      sizeInBytes: size,
      size: this.formatBytes(size, 2),
      logs: [],
      sfo,
      image: null
      // stats,
    };
  },
  async getItemSFO(item, keys = []) {
    let sfoKeys = ["APP_TYPE", "APP_VER", "ATTRIBUTE", "ATTRIBUTE2", "CATEGORY", "CONTENT_ID", "PUBTOOLINFO", "PUBTOOLMINVER", "PUBTOOLVER", "SYSTEM_VER", "TITLE", "TITLE_ID", "VERSION"];
    let sfo = { readSFOHeader: true };
    try {
      let s = await ps4PkgInfo.getPs4PkgInfo(item, { generateBase64Icon: false }).catch((e) => {
        console.error("Error in PKG Extraction: " + e);
      });
      if (s) {
        sfoKeys.forEach((x) => sfo[x] = s.paramSfo[x]);
      } else {
        console.log("Hops, no s object for sfo information");
      }
    } catch (e) {
      console.error(e);
      return sfo;
    }
    return sfo;
  },
  formatBytes(bytes = null, decimals = 2, k = 1e3) {
    if (!bytes) return "n/a";
    if (bytes === 0) return "0 Bytes";
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
};
Vue$1.prototype.$fs = o;
const state = {
  files: [],
  draggedFiles: [],
  draggedServingFiles: [],
  serverFiles: [],
  servingFiles: [],
  routes: [],
  logs: [],
  status: "stopped",
  loading: false,
  app: null
};
const mutations = {
  ...store$1.mutations(state),
  addLog(state2, payload) {
    state2.logs.unshift(payload);
  },
  resetLogs(state2) {
    state2.logs = [];
  }
};
const actions = {
  ...store$1.actions(state),
  async loadFiles({ commit: commit2, state: state2, rootState, rootGetters }, path2) {
    if (!path2) {
      console.log("::store | no path given for base_path");
      return;
    }
    console.log("::store | Read files at base path ", path2);
    let scan_subdir = rootGetters["app/server"].scan_subdir;
    let files = await o.getFilesFromBasePath(path2, scan_subdir);
    console.log("::store | patched files", files.length);
    commit2("serverFiles", files);
  },
  addLog({ commit: commit2, state: state2 }, message) {
    commit2("addLog", {
      time: Date.now(),
      message
    });
  },
  resetLogs({ commit: commit2 }) {
    commit2("resetLogs");
  },
  startLoading({ commit: commit2 }) {
    commit2("loading", true);
  },
  stopLoading({ commit: commit2 }) {
    commit2("loading", false);
  }
  // prepare to handle the actions through vuex
  // startServer({ commit }, msg){
  //     ipcRenderer.send('server', 'start')
  // },
  // stopServer({ commit }, msg){
  //     ipcRenderer.send('server', 'stop')
  // },
  // toggleServer({ commit }, msg){
  //     ipcRenderer.send('server', 'toggle')
  // },
  // refreshServer({ commit }, msg){
  //     ipcRenderer.send('server', 'refresh')
  // },
  // addFiles({ commit, dispatch, state}, payload){
  //     commit('addFiles', payload)
  // }
};
const getters = {
  // make all getters (optional)
  ...store$1.getters(state),
  findFile: (state2) => (file) => {
    if (file.type == "dragged")
      return state2.draggedServingFiles.find((x) => x.path == file.path);
    return state2.servingFiles.find((x) => x.path == file.path);
  }
  // overwrite default `items` getter
  // allFiles: state => {
  //     return state.images
  // },
};
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  actions,
  getters,
  mutations,
  state
}, Symbol.toStringTag, { value: "Module" }));
/*!
 * vuex v3.6.2
 * (c) 2021 Evan You
 * @license MIT
 */
function applyMixin(Vue2) {
  var version2 = Number(Vue2.version.split(".")[0]);
  if (version2 >= 2) {
    Vue2.mixin({ beforeCreate: vuexInit });
  } else {
    var _init = Vue2.prototype._init;
    Vue2.prototype._init = function(options2) {
      if (options2 === void 0) options2 = {};
      options2.init = options2.init ? [vuexInit].concat(options2.init) : vuexInit;
      _init.call(this, options2);
    };
  }
  function vuexInit() {
    var options2 = this.$options;
    if (options2.store) {
      this.$store = typeof options2.store === "function" ? options2.store() : options2.store;
    } else if (options2.parent && options2.parent.$store) {
      this.$store = options2.parent.$store;
    }
  }
}
var target = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
var devtoolHook = target.__VUE_DEVTOOLS_GLOBAL_HOOK__;
function devtoolPlugin(store2) {
  if (!devtoolHook) {
    return;
  }
  store2._devtoolHook = devtoolHook;
  devtoolHook.emit("vuex:init", store2);
  devtoolHook.on("vuex:travel-to-state", function(targetState) {
    store2.replaceState(targetState);
  });
  store2.subscribe(function(mutation, state2) {
    devtoolHook.emit("vuex:mutation", mutation, state2);
  }, { prepend: true });
  store2.subscribeAction(function(action, state2) {
    devtoolHook.emit("vuex:action", action, state2);
  }, { prepend: true });
}
function find(list, f) {
  return list.filter(f)[0];
}
function deepCopy(obj, cache) {
  if (cache === void 0) cache = [];
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  var hit = find(cache, function(c) {
    return c.original === obj;
  });
  if (hit) {
    return hit.copy;
  }
  var copy = Array.isArray(obj) ? [] : {};
  cache.push({
    original: obj,
    copy
  });
  Object.keys(obj).forEach(function(key) {
    copy[key] = deepCopy(obj[key], cache);
  });
  return copy;
}
function forEachValue(obj, fn) {
  Object.keys(obj).forEach(function(key) {
    return fn(obj[key], key);
  });
}
function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
function isPromise(val) {
  return val && typeof val.then === "function";
}
function assert$1(condition, msg) {
  if (!condition) {
    throw new Error("[vuex] " + msg);
  }
}
function partial(fn, arg) {
  return function() {
    return fn(arg);
  };
}
var Module = function Module2(rawModule, runtime) {
  this.runtime = runtime;
  this._children = /* @__PURE__ */ Object.create(null);
  this._rawModule = rawModule;
  var rawState = rawModule.state;
  this.state = (typeof rawState === "function" ? rawState() : rawState) || {};
};
var prototypeAccessors = { namespaced: { configurable: true } };
prototypeAccessors.namespaced.get = function() {
  return !!this._rawModule.namespaced;
};
Module.prototype.addChild = function addChild(key, module2) {
  this._children[key] = module2;
};
Module.prototype.removeChild = function removeChild(key) {
  delete this._children[key];
};
Module.prototype.getChild = function getChild(key) {
  return this._children[key];
};
Module.prototype.hasChild = function hasChild(key) {
  return key in this._children;
};
Module.prototype.update = function update2(rawModule) {
  this._rawModule.namespaced = rawModule.namespaced;
  if (rawModule.actions) {
    this._rawModule.actions = rawModule.actions;
  }
  if (rawModule.mutations) {
    this._rawModule.mutations = rawModule.mutations;
  }
  if (rawModule.getters) {
    this._rawModule.getters = rawModule.getters;
  }
};
Module.prototype.forEachChild = function forEachChild(fn) {
  forEachValue(this._children, fn);
};
Module.prototype.forEachGetter = function forEachGetter(fn) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn);
  }
};
Module.prototype.forEachAction = function forEachAction(fn) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn);
  }
};
Module.prototype.forEachMutation = function forEachMutation(fn) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn);
  }
};
Object.defineProperties(Module.prototype, prototypeAccessors);
var ModuleCollection = function ModuleCollection2(rawRootModule) {
  this.register([], rawRootModule, false);
};
ModuleCollection.prototype.get = function get(path2) {
  return path2.reduce(function(module2, key) {
    return module2.getChild(key);
  }, this.root);
};
ModuleCollection.prototype.getNamespace = function getNamespace(path2) {
  var module2 = this.root;
  return path2.reduce(function(namespace, key) {
    module2 = module2.getChild(key);
    return namespace + (module2.namespaced ? key + "/" : "");
  }, "");
};
ModuleCollection.prototype.update = function update$1(rawRootModule) {
  update22([], this.root, rawRootModule);
};
ModuleCollection.prototype.register = function register(path2, rawModule, runtime) {
  var this$1$1 = this;
  if (runtime === void 0) runtime = true;
  if (process.env.NODE_ENV !== "production") {
    assertRawModule(path2, rawModule);
  }
  var newModule = new Module(rawModule, runtime);
  if (path2.length === 0) {
    this.root = newModule;
  } else {
    var parent = this.get(path2.slice(0, -1));
    parent.addChild(path2[path2.length - 1], newModule);
  }
  if (rawModule.modules) {
    forEachValue(rawModule.modules, function(rawChildModule, key) {
      this$1$1.register(path2.concat(key), rawChildModule, runtime);
    });
  }
};
ModuleCollection.prototype.unregister = function unregister(path2) {
  var parent = this.get(path2.slice(0, -1));
  var key = path2[path2.length - 1];
  var child = parent.getChild(key);
  if (!child) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[vuex] trying to unregister module '" + key + "', which is not registered"
      );
    }
    return;
  }
  if (!child.runtime) {
    return;
  }
  parent.removeChild(key);
};
ModuleCollection.prototype.isRegistered = function isRegistered(path2) {
  var parent = this.get(path2.slice(0, -1));
  var key = path2[path2.length - 1];
  if (parent) {
    return parent.hasChild(key);
  }
  return false;
};
function update22(path2, targetModule, newModule) {
  if (process.env.NODE_ENV !== "production") {
    assertRawModule(path2, newModule);
  }
  targetModule.update(newModule);
  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[vuex] trying to add a new module '" + key + "' on hot reloading, manual reload is needed"
          );
        }
        return;
      }
      update22(
        path2.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      );
    }
  }
}
var functionAssert = {
  assert: function(value) {
    return typeof value === "function";
  },
  expected: "function"
};
var objectAssert = {
  assert: function(value) {
    return typeof value === "function" || typeof value === "object" && typeof value.handler === "function";
  },
  expected: 'function or object with "handler" function'
};
var assertTypes = {
  getters: functionAssert,
  mutations: functionAssert,
  actions: objectAssert
};
function assertRawModule(path2, rawModule) {
  Object.keys(assertTypes).forEach(function(key) {
    if (!rawModule[key]) {
      return;
    }
    var assertOptions = assertTypes[key];
    forEachValue(rawModule[key], function(value, type) {
      assert$1(
        assertOptions.assert(value),
        makeAssertionMessage(path2, key, type, value, assertOptions.expected)
      );
    });
  });
}
function makeAssertionMessage(path2, key, type, value, expected) {
  var buf = key + " should be " + expected + ' but "' + key + "." + type + '"';
  if (path2.length > 0) {
    buf += ' in module "' + path2.join(".") + '"';
  }
  buf += " is " + JSON.stringify(value) + ".";
  return buf;
}
var Vue;
var Store = function Store2(options2) {
  var this$1$1 = this;
  if (options2 === void 0) options2 = {};
  if (!Vue && typeof window !== "undefined" && window.Vue) {
    install(window.Vue);
  }
  if (process.env.NODE_ENV !== "production") {
    assert$1(Vue, "must call Vue.use(Vuex) before creating a store instance.");
    assert$1(typeof Promise !== "undefined", "vuex requires a Promise polyfill in this browser.");
    assert$1(this instanceof Store2, "store must be called with the new operator.");
  }
  var plugins = options2.plugins;
  if (plugins === void 0) plugins = [];
  var strict = options2.strict;
  if (strict === void 0) strict = false;
  this._committing = false;
  this._actions = /* @__PURE__ */ Object.create(null);
  this._actionSubscribers = [];
  this._mutations = /* @__PURE__ */ Object.create(null);
  this._wrappedGetters = /* @__PURE__ */ Object.create(null);
  this._modules = new ModuleCollection(options2);
  this._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
  this._subscribers = [];
  this._watcherVM = new Vue();
  this._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
  var store2 = this;
  var ref2 = this;
  var dispatch2 = ref2.dispatch;
  var commit2 = ref2.commit;
  this.dispatch = function boundDispatch(type, payload) {
    return dispatch2.call(store2, type, payload);
  };
  this.commit = function boundCommit(type, payload, options22) {
    return commit2.call(store2, type, payload, options22);
  };
  this.strict = strict;
  var state2 = this._modules.root.state;
  installModule(this, state2, [], this._modules.root);
  resetStoreVM(this, state2);
  plugins.forEach(function(plugin2) {
    return plugin2(this$1$1);
  });
  var useDevtools = options2.devtools !== void 0 ? options2.devtools : Vue.config.devtools;
  if (useDevtools) {
    devtoolPlugin(this);
  }
};
var prototypeAccessors$1 = { state: { configurable: true } };
prototypeAccessors$1.state.get = function() {
  return this._vm._data.$$state;
};
prototypeAccessors$1.state.set = function(v) {
  if (process.env.NODE_ENV !== "production") {
    assert$1(false, "use store.replaceState() to explicit replace store state.");
  }
};
Store.prototype.commit = function commit(_type, _payload, _options) {
  var this$1$1 = this;
  var ref2 = unifyObjectStyle(_type, _payload, _options);
  var type = ref2.type;
  var payload = ref2.payload;
  var options2 = ref2.options;
  var mutation = { type, payload };
  var entry = this._mutations[type];
  if (!entry) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[vuex] unknown mutation type: " + type);
    }
    return;
  }
  this._withCommit(function() {
    entry.forEach(function commitIterator(handler) {
      handler(payload);
    });
  });
  this._subscribers.slice().forEach(function(sub) {
    return sub(mutation, this$1$1.state);
  });
  if (process.env.NODE_ENV !== "production" && options2 && options2.silent) {
    console.warn(
      "[vuex] mutation type: " + type + ". Silent option has been removed. Use the filter functionality in the vue-devtools"
    );
  }
};
Store.prototype.dispatch = function dispatch(_type, _payload) {
  var this$1$1 = this;
  var ref2 = unifyObjectStyle(_type, _payload);
  var type = ref2.type;
  var payload = ref2.payload;
  var action = { type, payload };
  var entry = this._actions[type];
  if (!entry) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[vuex] unknown action type: " + type);
    }
    return;
  }
  try {
    this._actionSubscribers.slice().filter(function(sub) {
      return sub.before;
    }).forEach(function(sub) {
      return sub.before(action, this$1$1.state);
    });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[vuex] error in before action subscribers: ");
      console.error(e);
    }
  }
  var result = entry.length > 1 ? Promise.all(entry.map(function(handler) {
    return handler(payload);
  })) : entry[0](payload);
  return new Promise(function(resolve2, reject) {
    result.then(function(res) {
      try {
        this$1$1._actionSubscribers.filter(function(sub) {
          return sub.after;
        }).forEach(function(sub) {
          return sub.after(action, this$1$1.state);
        });
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[vuex] error in after action subscribers: ");
          console.error(e);
        }
      }
      resolve2(res);
    }, function(error) {
      try {
        this$1$1._actionSubscribers.filter(function(sub) {
          return sub.error;
        }).forEach(function(sub) {
          return sub.error(action, this$1$1.state, error);
        });
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[vuex] error in error action subscribers: ");
          console.error(e);
        }
      }
      reject(error);
    });
  });
};
Store.prototype.subscribe = function subscribe(fn, options2) {
  return genericSubscribe(fn, this._subscribers, options2);
};
Store.prototype.subscribeAction = function subscribeAction(fn, options2) {
  var subs = typeof fn === "function" ? { before: fn } : fn;
  return genericSubscribe(subs, this._actionSubscribers, options2);
};
Store.prototype.watch = function watch2(getter, cb, options2) {
  var this$1$1 = this;
  if (process.env.NODE_ENV !== "production") {
    assert$1(typeof getter === "function", "store.watch only accepts a function.");
  }
  return this._watcherVM.$watch(function() {
    return getter(this$1$1.state, this$1$1.getters);
  }, cb, options2);
};
Store.prototype.replaceState = function replaceState(state2) {
  var this$1$1 = this;
  this._withCommit(function() {
    this$1$1._vm._data.$$state = state2;
  });
};
Store.prototype.registerModule = function registerModule(path2, rawModule, options2) {
  if (options2 === void 0) options2 = {};
  if (typeof path2 === "string") {
    path2 = [path2];
  }
  if (process.env.NODE_ENV !== "production") {
    assert$1(Array.isArray(path2), "module path must be a string or an Array.");
    assert$1(path2.length > 0, "cannot register the root module by using registerModule.");
  }
  this._modules.register(path2, rawModule);
  installModule(this, this.state, path2, this._modules.get(path2), options2.preserveState);
  resetStoreVM(this, this.state);
};
Store.prototype.unregisterModule = function unregisterModule(path2) {
  var this$1$1 = this;
  if (typeof path2 === "string") {
    path2 = [path2];
  }
  if (process.env.NODE_ENV !== "production") {
    assert$1(Array.isArray(path2), "module path must be a string or an Array.");
  }
  this._modules.unregister(path2);
  this._withCommit(function() {
    var parentState = getNestedState(this$1$1.state, path2.slice(0, -1));
    Vue.delete(parentState, path2[path2.length - 1]);
  });
  resetStore(this);
};
Store.prototype.hasModule = function hasModule(path2) {
  if (typeof path2 === "string") {
    path2 = [path2];
  }
  if (process.env.NODE_ENV !== "production") {
    assert$1(Array.isArray(path2), "module path must be a string or an Array.");
  }
  return this._modules.isRegistered(path2);
};
Store.prototype.hotUpdate = function hotUpdate(newOptions) {
  this._modules.update(newOptions);
  resetStore(this, true);
};
Store.prototype._withCommit = function _withCommit(fn) {
  var committing = this._committing;
  this._committing = true;
  fn();
  this._committing = committing;
};
Object.defineProperties(Store.prototype, prototypeAccessors$1);
function genericSubscribe(fn, subs, options2) {
  if (subs.indexOf(fn) < 0) {
    options2 && options2.prepend ? subs.unshift(fn) : subs.push(fn);
  }
  return function() {
    var i = subs.indexOf(fn);
    if (i > -1) {
      subs.splice(i, 1);
    }
  };
}
function resetStore(store2, hot) {
  store2._actions = /* @__PURE__ */ Object.create(null);
  store2._mutations = /* @__PURE__ */ Object.create(null);
  store2._wrappedGetters = /* @__PURE__ */ Object.create(null);
  store2._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
  var state2 = store2.state;
  installModule(store2, state2, [], store2._modules.root, true);
  resetStoreVM(store2, state2, hot);
}
function resetStoreVM(store2, state2, hot) {
  var oldVm = store2._vm;
  store2.getters = {};
  store2._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
  var wrappedGetters = store2._wrappedGetters;
  var computed2 = {};
  forEachValue(wrappedGetters, function(fn, key) {
    computed2[key] = partial(fn, store2);
    Object.defineProperty(store2.getters, key, {
      get: function() {
        return store2._vm[key];
      },
      enumerable: true
      // for local getters
    });
  });
  var silent = Vue.config.silent;
  Vue.config.silent = true;
  store2._vm = new Vue({
    data: {
      $$state: state2
    },
    computed: computed2
  });
  Vue.config.silent = silent;
  if (store2.strict) {
    enableStrictMode(store2);
  }
  if (oldVm) {
    if (hot) {
      store2._withCommit(function() {
        oldVm._data.$$state = null;
      });
    }
    Vue.nextTick(function() {
      return oldVm.$destroy();
    });
  }
}
function installModule(store2, rootState, path2, module2, hot) {
  var isRoot = !path2.length;
  var namespace = store2._modules.getNamespace(path2);
  if (module2.namespaced) {
    if (store2._modulesNamespaceMap[namespace] && process.env.NODE_ENV !== "production") {
      console.error("[vuex] duplicate namespace " + namespace + " for the namespaced module " + path2.join("/"));
    }
    store2._modulesNamespaceMap[namespace] = module2;
  }
  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path2.slice(0, -1));
    var moduleName = path2[path2.length - 1];
    store2._withCommit(function() {
      if (process.env.NODE_ENV !== "production") {
        if (moduleName in parentState) {
          console.warn(
            '[vuex] state field "' + moduleName + '" was overridden by a module with the same name at "' + path2.join(".") + '"'
          );
        }
      }
      Vue.set(parentState, moduleName, module2.state);
    });
  }
  var local = module2.context = makeLocalContext(store2, namespace, path2);
  module2.forEachMutation(function(mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store2, namespacedType, mutation, local);
  });
  module2.forEachAction(function(action, key) {
    var type = action.root ? key : namespace + key;
    var handler = action.handler || action;
    registerAction(store2, type, handler, local);
  });
  module2.forEachGetter(function(getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store2, namespacedType, getter, local);
  });
  module2.forEachChild(function(child, key) {
    installModule(store2, rootState, path2.concat(key), child, hot);
  });
}
function makeLocalContext(store2, namespace, path2) {
  var noNamespace = namespace === "";
  var local = {
    dispatch: noNamespace ? store2.dispatch : function(_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options2 = args.options;
      var type = args.type;
      if (!options2 || !options2.root) {
        type = namespace + type;
        if (process.env.NODE_ENV !== "production" && !store2._actions[type]) {
          console.error("[vuex] unknown local action type: " + args.type + ", global type: " + type);
          return;
        }
      }
      return store2.dispatch(type, payload);
    },
    commit: noNamespace ? store2.commit : function(_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options2 = args.options;
      var type = args.type;
      if (!options2 || !options2.root) {
        type = namespace + type;
        if (process.env.NODE_ENV !== "production" && !store2._mutations[type]) {
          console.error("[vuex] unknown local mutation type: " + args.type + ", global type: " + type);
          return;
        }
      }
      store2.commit(type, payload, options2);
    }
  };
  Object.defineProperties(local, {
    getters: {
      get: noNamespace ? function() {
        return store2.getters;
      } : function() {
        return makeLocalGetters(store2, namespace);
      }
    },
    state: {
      get: function() {
        return getNestedState(store2.state, path2);
      }
    }
  });
  return local;
}
function makeLocalGetters(store2, namespace) {
  if (!store2._makeLocalGettersCache[namespace]) {
    var gettersProxy = {};
    var splitPos = namespace.length;
    Object.keys(store2.getters).forEach(function(type) {
      if (type.slice(0, splitPos) !== namespace) {
        return;
      }
      var localType = type.slice(splitPos);
      Object.defineProperty(gettersProxy, localType, {
        get: function() {
          return store2.getters[type];
        },
        enumerable: true
      });
    });
    store2._makeLocalGettersCache[namespace] = gettersProxy;
  }
  return store2._makeLocalGettersCache[namespace];
}
function registerMutation(store2, type, handler, local) {
  var entry = store2._mutations[type] || (store2._mutations[type] = []);
  entry.push(function wrappedMutationHandler(payload) {
    handler.call(store2, local.state, payload);
  });
}
function registerAction(store2, type, handler, local) {
  var entry = store2._actions[type] || (store2._actions[type] = []);
  entry.push(function wrappedActionHandler(payload) {
    var res = handler.call(store2, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store2.getters,
      rootState: store2.state
    }, payload);
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    if (store2._devtoolHook) {
      return res.catch(function(err) {
        store2._devtoolHook.emit("vuex:error", err);
        throw err;
      });
    } else {
      return res;
    }
  });
}
function registerGetter(store2, type, rawGetter, local) {
  if (store2._wrappedGetters[type]) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[vuex] duplicate getter key: " + type);
    }
    return;
  }
  store2._wrappedGetters[type] = function wrappedGetter(store22) {
    return rawGetter(
      local.state,
      // local state
      local.getters,
      // local getters
      store22.state,
      // root state
      store22.getters
      // root getters
    );
  };
}
function enableStrictMode(store2) {
  store2._vm.$watch(function() {
    return this._data.$$state;
  }, function() {
    if (process.env.NODE_ENV !== "production") {
      assert$1(store2._committing, "do not mutate vuex store state outside mutation handlers.");
    }
  }, { deep: true, sync: true });
}
function getNestedState(state2, path2) {
  return path2.reduce(function(state22, key) {
    return state22[key];
  }, state2);
}
function unifyObjectStyle(type, payload, options2) {
  if (isObject(type) && type.type) {
    options2 = payload;
    payload = type;
    type = type.type;
  }
  if (process.env.NODE_ENV !== "production") {
    assert$1(typeof type === "string", "expects string as the type, but found " + typeof type + ".");
  }
  return { type, payload, options: options2 };
}
function install(_Vue) {
  if (Vue && _Vue === Vue) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "[vuex] already installed. Vue.use(Vuex) should be called only once."
      );
    }
    return;
  }
  Vue = _Vue;
  applyMixin(Vue);
}
var mapState = normalizeNamespace(function(namespace, states) {
  var res = {};
  if (process.env.NODE_ENV !== "production" && !isValidMap(states)) {
    console.error("[vuex] mapState: mapper parameter must be either an Array or an Object");
  }
  normalizeMap(states).forEach(function(ref2) {
    var key = ref2.key;
    var val = ref2.val;
    res[key] = function mappedState() {
      var state2 = this.$store.state;
      var getters2 = this.$store.getters;
      if (namespace) {
        var module2 = getModuleByNamespace(this.$store, "mapState", namespace);
        if (!module2) {
          return;
        }
        state2 = module2.context.state;
        getters2 = module2.context.getters;
      }
      return typeof val === "function" ? val.call(this, state2, getters2) : state2[val];
    };
    res[key].vuex = true;
  });
  return res;
});
var mapMutations = normalizeNamespace(function(namespace, mutations2) {
  var res = {};
  if (process.env.NODE_ENV !== "production" && !isValidMap(mutations2)) {
    console.error("[vuex] mapMutations: mapper parameter must be either an Array or an Object");
  }
  normalizeMap(mutations2).forEach(function(ref2) {
    var key = ref2.key;
    var val = ref2.val;
    res[key] = function mappedMutation() {
      var args = [], len = arguments.length;
      while (len--) args[len] = arguments[len];
      var commit2 = this.$store.commit;
      if (namespace) {
        var module2 = getModuleByNamespace(this.$store, "mapMutations", namespace);
        if (!module2) {
          return;
        }
        commit2 = module2.context.commit;
      }
      return typeof val === "function" ? val.apply(this, [commit2].concat(args)) : commit2.apply(this.$store, [val].concat(args));
    };
  });
  return res;
});
var mapGetters = normalizeNamespace(function(namespace, getters2) {
  var res = {};
  if (process.env.NODE_ENV !== "production" && !isValidMap(getters2)) {
    console.error("[vuex] mapGetters: mapper parameter must be either an Array or an Object");
  }
  normalizeMap(getters2).forEach(function(ref2) {
    var key = ref2.key;
    var val = ref2.val;
    val = namespace + val;
    res[key] = function mappedGetter() {
      if (namespace && !getModuleByNamespace(this.$store, "mapGetters", namespace)) {
        return;
      }
      if (process.env.NODE_ENV !== "production" && !(val in this.$store.getters)) {
        console.error("[vuex] unknown getter: " + val);
        return;
      }
      return this.$store.getters[val];
    };
    res[key].vuex = true;
  });
  return res;
});
var mapActions = normalizeNamespace(function(namespace, actions2) {
  var res = {};
  if (process.env.NODE_ENV !== "production" && !isValidMap(actions2)) {
    console.error("[vuex] mapActions: mapper parameter must be either an Array or an Object");
  }
  normalizeMap(actions2).forEach(function(ref2) {
    var key = ref2.key;
    var val = ref2.val;
    res[key] = function mappedAction() {
      var args = [], len = arguments.length;
      while (len--) args[len] = arguments[len];
      var dispatch2 = this.$store.dispatch;
      if (namespace) {
        var module2 = getModuleByNamespace(this.$store, "mapActions", namespace);
        if (!module2) {
          return;
        }
        dispatch2 = module2.context.dispatch;
      }
      return typeof val === "function" ? val.apply(this, [dispatch2].concat(args)) : dispatch2.apply(this.$store, [val].concat(args));
    };
  });
  return res;
});
var createNamespacedHelpers = function(namespace) {
  return {
    mapState: mapState.bind(null, namespace),
    mapGetters: mapGetters.bind(null, namespace),
    mapMutations: mapMutations.bind(null, namespace),
    mapActions: mapActions.bind(null, namespace)
  };
};
function normalizeMap(map) {
  if (!isValidMap(map)) {
    return [];
  }
  return Array.isArray(map) ? map.map(function(key) {
    return { key, val: key };
  }) : Object.keys(map).map(function(key) {
    return { key, val: map[key] };
  });
}
function isValidMap(map) {
  return Array.isArray(map) || isObject(map);
}
function normalizeNamespace(fn) {
  return function(namespace, map) {
    if (typeof namespace !== "string") {
      map = namespace;
      namespace = "";
    } else if (namespace.charAt(namespace.length - 1) !== "/") {
      namespace += "/";
    }
    return fn(namespace, map);
  };
}
function getModuleByNamespace(store2, helper2, namespace) {
  var module2 = store2._modulesNamespaceMap[namespace];
  if (process.env.NODE_ENV !== "production" && !module2) {
    console.error("[vuex] module namespace not found in " + helper2 + "(): " + namespace);
  }
  return module2;
}
function createLogger(ref2) {
  if (ref2 === void 0) ref2 = {};
  var collapsed = ref2.collapsed;
  if (collapsed === void 0) collapsed = true;
  var filter = ref2.filter;
  if (filter === void 0) filter = function(mutation, stateBefore, stateAfter) {
    return true;
  };
  var transformer = ref2.transformer;
  if (transformer === void 0) transformer = function(state2) {
    return state2;
  };
  var mutationTransformer = ref2.mutationTransformer;
  if (mutationTransformer === void 0) mutationTransformer = function(mut) {
    return mut;
  };
  var actionFilter = ref2.actionFilter;
  if (actionFilter === void 0) actionFilter = function(action, state2) {
    return true;
  };
  var actionTransformer = ref2.actionTransformer;
  if (actionTransformer === void 0) actionTransformer = function(act) {
    return act;
  };
  var logMutations = ref2.logMutations;
  if (logMutations === void 0) logMutations = true;
  var logActions = ref2.logActions;
  if (logActions === void 0) logActions = true;
  var logger = ref2.logger;
  if (logger === void 0) logger = console;
  return function(store2) {
    var prevState = deepCopy(store2.state);
    if (typeof logger === "undefined") {
      return;
    }
    if (logMutations) {
      store2.subscribe(function(mutation, state2) {
        var nextState = deepCopy(state2);
        if (filter(mutation, prevState, nextState)) {
          var formattedTime = getFormattedTime();
          var formattedMutation = mutationTransformer(mutation);
          var message = "mutation " + mutation.type + formattedTime;
          startMessage(logger, message, collapsed);
          logger.log("%c prev state", "color: #9E9E9E; font-weight: bold", transformer(prevState));
          logger.log("%c mutation", "color: #03A9F4; font-weight: bold", formattedMutation);
          logger.log("%c next state", "color: #4CAF50; font-weight: bold", transformer(nextState));
          endMessage(logger);
        }
        prevState = nextState;
      });
    }
    if (logActions) {
      store2.subscribeAction(function(action, state2) {
        if (actionFilter(action, state2)) {
          var formattedTime = getFormattedTime();
          var formattedAction = actionTransformer(action);
          var message = "action " + action.type + formattedTime;
          startMessage(logger, message, collapsed);
          logger.log("%c action", "color: #03A9F4; font-weight: bold", formattedAction);
          endMessage(logger);
        }
      });
    }
  };
}
function startMessage(logger, message, collapsed) {
  var startMessage2 = collapsed ? logger.groupCollapsed : logger.group;
  try {
    startMessage2.call(logger, message);
  } catch (e) {
    logger.log(message);
  }
}
function endMessage(logger) {
  try {
    logger.groupEnd();
  } catch (e) {
    logger.log("—— log end ——");
  }
}
function getFormattedTime() {
  var time = /* @__PURE__ */ new Date();
  return " @ " + pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
}
function repeat(str, times) {
  return new Array(times + 1).join(str);
}
function pad(num, maxLength) {
  return repeat("0", maxLength - num.toString().length) + num;
}
var index = {
  Store,
  install,
  version: "3.6.2",
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers,
  createLogger
};
pathify.options.mapping = "simple";
pathify.options.deep = 1;
var dist = {};
var persistedState = { exports: {} };
var isMergeableObject = function isMergeableObject2(value) {
  return isNonNullObject(value) && !isSpecial(value);
};
function isNonNullObject(value) {
  return !!value && typeof value === "object";
}
function isSpecial(value) {
  var stringValue = Object.prototype.toString.call(value);
  return stringValue === "[object RegExp]" || stringValue === "[object Date]" || isReactElement(value);
}
var canUseSymbol = typeof Symbol === "function" && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for("react.element") : 60103;
function isReactElement(value) {
  return value.$$typeof === REACT_ELEMENT_TYPE;
}
function emptyTarget(val) {
  return Array.isArray(val) ? [] : {};
}
function cloneUnlessOtherwiseSpecified(value, options2) {
  return options2.clone !== false && options2.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options2) : value;
}
function defaultArrayMerge(target2, source, options2) {
  return target2.concat(source).map(function(element) {
    return cloneUnlessOtherwiseSpecified(element, options2);
  });
}
function mergeObject(target2, source, options2) {
  var destination = {};
  if (options2.isMergeableObject(target2)) {
    Object.keys(target2).forEach(function(key) {
      destination[key] = cloneUnlessOtherwiseSpecified(target2[key], options2);
    });
  }
  Object.keys(source).forEach(function(key) {
    if (!options2.isMergeableObject(source[key]) || !target2[key]) {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], options2);
    } else {
      destination[key] = deepmerge(target2[key], source[key], options2);
    }
  });
  return destination;
}
function deepmerge(target2, source, options2) {
  options2 = options2 || {};
  options2.arrayMerge = options2.arrayMerge || defaultArrayMerge;
  options2.isMergeableObject = options2.isMergeableObject || isMergeableObject;
  var sourceIsArray = Array.isArray(source);
  var targetIsArray = Array.isArray(target2);
  var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, options2);
  } else if (sourceIsArray) {
    return options2.arrayMerge(target2, source, options2);
  } else {
    return mergeObject(target2, source, options2);
  }
}
deepmerge.all = function deepmergeAll(array, options2) {
  if (!Array.isArray(array)) {
    throw new Error("first argument should be an array");
  }
  return array.reduce(function(prev, next) {
    return deepmerge(prev, next, options2);
  }, {});
};
var deepmerge_1 = deepmerge;
const es = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: deepmerge_1
}, Symbol.toStringTag, { value: "Module" }));
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(es);
var conf = { exports: {} };
var isObj$1 = function(x) {
  var type = typeof x;
  return x !== null && (type === "object" || type === "function");
};
const isObj = isObj$1;
const disallowedKeys = [
  "__proto__",
  "prototype",
  "constructor"
];
const isValidPath = (pathSegments) => !pathSegments.some((segment) => disallowedKeys.includes(segment));
function getPathSegments(path2) {
  const pathArr = path2.split(".");
  const parts = [];
  for (let i = 0; i < pathArr.length; i++) {
    let p = pathArr[i];
    while (p[p.length - 1] === "\\" && pathArr[i + 1] !== void 0) {
      p = p.slice(0, -1) + ".";
      p += pathArr[++i];
    }
    parts.push(p);
  }
  if (!isValidPath(parts)) {
    return [];
  }
  return parts;
}
var dotProp = {
  get(obj, path2, value) {
    if (!isObj(obj) || typeof path2 !== "string") {
      return value === void 0 ? obj : value;
    }
    const pathArr = getPathSegments(path2);
    if (pathArr.length === 0) {
      return;
    }
    for (let i = 0; i < pathArr.length; i++) {
      if (!Object.prototype.propertyIsEnumerable.call(obj, pathArr[i])) {
        return value;
      }
      obj = obj[pathArr[i]];
      if (obj === void 0 || obj === null) {
        if (i !== pathArr.length - 1) {
          return value;
        }
        break;
      }
    }
    return obj;
  },
  set(obj, path2, value) {
    if (!isObj(obj) || typeof path2 !== "string") {
      return obj;
    }
    const root = obj;
    const pathArr = getPathSegments(path2);
    if (pathArr.length === 0) {
      return;
    }
    for (let i = 0; i < pathArr.length; i++) {
      const p = pathArr[i];
      if (!isObj(obj[p])) {
        obj[p] = {};
      }
      if (i === pathArr.length - 1) {
        obj[p] = value;
      }
      obj = obj[p];
    }
    return root;
  },
  delete(obj, path2) {
    if (!isObj(obj) || typeof path2 !== "string") {
      return;
    }
    const pathArr = getPathSegments(path2);
    for (let i = 0; i < pathArr.length; i++) {
      const p = pathArr[i];
      if (i === pathArr.length - 1) {
        delete obj[p];
        return;
      }
      obj = obj[p];
      if (!isObj(obj)) {
        return;
      }
    }
  },
  has(obj, path2) {
    if (!isObj(obj) || typeof path2 !== "string") {
      return false;
    }
    const pathArr = getPathSegments(path2);
    for (let i = 0; i < pathArr.length; i++) {
      if (isObj(obj)) {
        if (!(pathArr[i] in obj)) {
          return false;
        }
        obj = obj[pathArr[i]];
      } else {
        return false;
      }
    }
    return true;
  }
};
var makeDir = { exports: {} };
const processFn = (fn, opts) => function() {
  const P = opts.promiseModule;
  const args = new Array(arguments.length);
  for (let i = 0; i < arguments.length; i++) {
    args[i] = arguments[i];
  }
  return new P((resolve2, reject) => {
    if (opts.errorFirst) {
      args.push(function(err, result) {
        if (opts.multiArgs) {
          const results = new Array(arguments.length - 1);
          for (let i = 1; i < arguments.length; i++) {
            results[i - 1] = arguments[i];
          }
          if (err) {
            results.unshift(err);
            reject(results);
          } else {
            resolve2(results);
          }
        } else if (err) {
          reject(err);
        } else {
          resolve2(result);
        }
      });
    } else {
      args.push(function(result) {
        if (opts.multiArgs) {
          const results = new Array(arguments.length - 1);
          for (let i = 0; i < arguments.length; i++) {
            results[i] = arguments[i];
          }
          resolve2(results);
        } else {
          resolve2(result);
        }
      });
    }
    fn.apply(this, args);
  });
};
var pify$1 = (obj, opts) => {
  opts = Object.assign({
    exclude: [/.+(Sync|Stream)$/],
    errorFirst: true,
    promiseModule: Promise
  }, opts);
  const filter = (key) => {
    const match = (pattern) => typeof pattern === "string" ? key === pattern : pattern.test(key);
    return opts.include ? opts.include.some(match) : !opts.exclude.some(match);
  };
  let ret;
  if (typeof obj === "function") {
    ret = function() {
      if (opts.excludeMain) {
        return obj.apply(this, arguments);
      }
      return processFn(obj, opts).apply(this, arguments);
    };
  } else {
    ret = Object.create(Object.getPrototypeOf(obj));
  }
  for (const key in obj) {
    const x = obj[key];
    ret[key] = typeof x === "function" && filter(key) ? processFn(x, opts) : x;
  }
  return ret;
};
const fs$3 = fs$4;
const path$5 = path$6;
const pify = pify$1;
const defaults = {
  mode: 511 & ~process.umask(),
  fs: fs$3
};
const checkPath = (pth) => {
  if (process.platform === "win32") {
    const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path$5.parse(pth).root, ""));
    if (pathHasInvalidWinCharacters) {
      const err = new Error(`Path contains invalid characters: ${pth}`);
      err.code = "EINVAL";
      throw err;
    }
  }
};
makeDir.exports = (input, opts) => Promise.resolve().then(() => {
  checkPath(input);
  opts = Object.assign({}, defaults, opts);
  const mkdir = pify(opts.fs.mkdir);
  const stat = pify(opts.fs.stat);
  const make = (pth) => {
    return mkdir(pth, opts.mode).then(() => pth).catch((err) => {
      if (err.code === "ENOENT") {
        if (err.message.includes("null bytes") || path$5.dirname(pth) === pth) {
          throw err;
        }
        return make(path$5.dirname(pth)).then(() => make(pth));
      }
      return stat(pth).then((stats) => stats.isDirectory() ? pth : Promise.reject()).catch(() => {
        throw err;
      });
    });
  };
  return make(path$5.resolve(input));
});
makeDir.exports.sync = (input, opts) => {
  checkPath(input);
  opts = Object.assign({}, defaults, opts);
  const make = (pth) => {
    try {
      opts.fs.mkdirSync(pth, opts.mode);
    } catch (err) {
      if (err.code === "ENOENT") {
        if (err.message.includes("null bytes") || path$5.dirname(pth) === pth) {
          throw err;
        }
        make(path$5.dirname(pth));
        return make(pth);
      }
      try {
        if (!opts.fs.statSync(pth).isDirectory()) {
          throw new Error("The path is not a directory");
        }
      } catch (_) {
        throw err;
      }
    }
    return pth;
  };
  return make(path$5.resolve(input));
};
var makeDirExports = makeDir.exports;
var pkgUp = { exports: {} };
var findUp$1 = { exports: {} };
var locatePath$1 = { exports: {} };
var pathExists$1 = { exports: {} };
const fs$2 = fs$4;
pathExists$1.exports = (fp) => new Promise((resolve2) => {
  fs$2.access(fp, (err) => {
    resolve2(!err);
  });
});
pathExists$1.exports.sync = (fp) => {
  try {
    fs$2.accessSync(fp);
    return true;
  } catch (err) {
    return false;
  }
};
var pathExistsExports = pathExists$1.exports;
var pTry$1 = (cb) => new Promise((resolve2) => {
  resolve2(cb());
});
const pTry = pTry$1;
var pLimit$1 = (concurrency) => {
  if (concurrency < 1) {
    throw new TypeError("Expected `concurrency` to be a number from 1 and up");
  }
  const queue = [];
  let activeCount = 0;
  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      queue.shift()();
    }
  };
  return (fn) => new Promise((resolve2, reject) => {
    const run = () => {
      activeCount++;
      pTry(fn).then(
        (val) => {
          resolve2(val);
          next();
        },
        (err) => {
          reject(err);
          next();
        }
      );
    };
    if (activeCount < concurrency) {
      run();
    } else {
      queue.push(run);
    }
  });
};
const pLimit = pLimit$1;
class EndError extends Error {
  constructor(value) {
    super();
    this.value = value;
  }
}
const finder = (el) => Promise.all(el).then((val) => val[1] === true && Promise.reject(new EndError(val[0])));
var pLocate$1 = (iterable, tester, opts) => {
  opts = Object.assign({
    concurrency: Infinity,
    preserveOrder: true
  }, opts);
  const limit = pLimit(opts.concurrency);
  const items = Array.from(iterable).map((el) => [el, limit(() => Promise.resolve(el).then(tester))]);
  const checkLimit = pLimit(opts.preserveOrder ? 1 : Infinity);
  return Promise.all(items.map((el) => checkLimit(() => finder(el)))).then(() => {
  }).catch((err) => err instanceof EndError ? err.value : Promise.reject(err));
};
const path$4 = path$6;
const pathExists = pathExistsExports;
const pLocate = pLocate$1;
locatePath$1.exports = (iterable, opts) => {
  opts = Object.assign({
    cwd: process.cwd()
  }, opts);
  return pLocate(iterable, (el) => pathExists(path$4.resolve(opts.cwd, el)), opts);
};
locatePath$1.exports.sync = (iterable, opts) => {
  opts = Object.assign({
    cwd: process.cwd()
  }, opts);
  for (const el of iterable) {
    if (pathExists.sync(path$4.resolve(opts.cwd, el))) {
      return el;
    }
  }
};
var locatePathExports = locatePath$1.exports;
const path$3 = path$6;
const locatePath = locatePathExports;
findUp$1.exports = (filename, opts) => {
  opts = opts || {};
  const startDir = path$3.resolve(opts.cwd || "");
  const root = path$3.parse(startDir).root;
  const filenames = [].concat(filename);
  return new Promise((resolve2) => {
    (function find2(dir) {
      locatePath(filenames, { cwd: dir }).then((file) => {
        if (file) {
          resolve2(path$3.join(dir, file));
        } else if (dir === root) {
          resolve2(null);
        } else {
          find2(path$3.dirname(dir));
        }
      });
    })(startDir);
  });
};
findUp$1.exports.sync = (filename, opts) => {
  opts = opts || {};
  let dir = path$3.resolve(opts.cwd || "");
  const root = path$3.parse(dir).root;
  const filenames = [].concat(filename);
  while (true) {
    const file = locatePath.sync(filenames, { cwd: dir });
    if (file) {
      return path$3.join(dir, file);
    } else if (dir === root) {
      return null;
    }
    dir = path$3.dirname(dir);
  }
};
var findUpExports = findUp$1.exports;
const findUp = findUpExports;
pkgUp.exports = (cwd2) => findUp("package.json", { cwd: cwd2 });
pkgUp.exports.sync = (cwd2) => findUp.sync("package.json", { cwd: cwd2 });
var pkgUpExports = pkgUp.exports;
const path$2 = path$6;
const os = require$$1$1;
const homedir = os.homedir();
const tmpdir = os.tmpdir();
const env = process.env;
const macos = (name) => {
  const library = path$2.join(homedir, "Library");
  return {
    data: path$2.join(library, "Application Support", name),
    config: path$2.join(library, "Preferences", name),
    cache: path$2.join(library, "Caches", name),
    log: path$2.join(library, "Logs", name),
    temp: path$2.join(tmpdir, name)
  };
};
const windows$1 = (name) => {
  const appData = env.LOCALAPPDATA || path$2.join(homedir, "AppData", "Local");
  return {
    // data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: path$2.join(appData, name, "Data"),
    config: path$2.join(appData, name, "Config"),
    cache: path$2.join(appData, name, "Cache"),
    log: path$2.join(appData, name, "Log"),
    temp: path$2.join(tmpdir, name)
  };
};
const linux = (name) => {
  const username = path$2.basename(homedir);
  return {
    data: path$2.join(env.XDG_DATA_HOME || path$2.join(homedir, ".local", "share"), name),
    config: path$2.join(env.XDG_CONFIG_HOME || path$2.join(homedir, ".config"), name),
    cache: path$2.join(env.XDG_CACHE_HOME || path$2.join(homedir, ".cache"), name),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: path$2.join(env.XDG_STATE_HOME || path$2.join(homedir, ".local", "state"), name),
    temp: path$2.join(tmpdir, username, name)
  };
};
var envPaths = (name, opts) => {
  if (typeof name !== "string") {
    throw new TypeError(`Expected string, got ${typeof name}`);
  }
  opts = Object.assign({ suffix: "nodejs" }, opts);
  if (opts.suffix) {
    name += `-${opts.suffix}`;
  }
  if (process.platform === "darwin") {
    return macos(name);
  }
  if (process.platform === "win32") {
    return windows$1(name);
  }
  return linux(name);
};
var writeFileAtomic = { exports: {} };
var constants = require$$0$1;
var origCwd = process.cwd;
var cwd = null;
var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process);
  return cwd;
};
try {
  process.cwd();
} catch (er) {
}
if (typeof process.chdir === "function") {
  var chdir = process.chdir;
  process.chdir = function(d) {
    cwd = null;
    chdir.call(process, d);
  };
  if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
}
var polyfills$1 = patch$1;
function patch$1(fs2) {
  if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs2);
  }
  if (!fs2.lutimes) {
    patchLutimes(fs2);
  }
  fs2.chown = chownFix(fs2.chown);
  fs2.fchown = chownFix(fs2.fchown);
  fs2.lchown = chownFix(fs2.lchown);
  fs2.chmod = chmodFix(fs2.chmod);
  fs2.fchmod = chmodFix(fs2.fchmod);
  fs2.lchmod = chmodFix(fs2.lchmod);
  fs2.chownSync = chownFixSync(fs2.chownSync);
  fs2.fchownSync = chownFixSync(fs2.fchownSync);
  fs2.lchownSync = chownFixSync(fs2.lchownSync);
  fs2.chmodSync = chmodFixSync(fs2.chmodSync);
  fs2.fchmodSync = chmodFixSync(fs2.fchmodSync);
  fs2.lchmodSync = chmodFixSync(fs2.lchmodSync);
  fs2.stat = statFix(fs2.stat);
  fs2.fstat = statFix(fs2.fstat);
  fs2.lstat = statFix(fs2.lstat);
  fs2.statSync = statFixSync(fs2.statSync);
  fs2.fstatSync = statFixSync(fs2.fstatSync);
  fs2.lstatSync = statFixSync(fs2.lstatSync);
  if (fs2.chmod && !fs2.lchmod) {
    fs2.lchmod = function(path2, mode, cb) {
      if (cb) process.nextTick(cb);
    };
    fs2.lchmodSync = function() {
    };
  }
  if (fs2.chown && !fs2.lchown) {
    fs2.lchown = function(path2, uid, gid, cb) {
      if (cb) process.nextTick(cb);
    };
    fs2.lchownSync = function() {
    };
  }
  if (platform === "win32") {
    fs2.rename = typeof fs2.rename !== "function" ? fs2.rename : function(fs$rename) {
      function rename(from, to, cb) {
        var start = Date.now();
        var backoff = 0;
        fs$rename(from, to, function CB(er) {
          if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
            setTimeout(function() {
              fs2.stat(to, function(stater, st) {
                if (stater && stater.code === "ENOENT")
                  fs$rename(from, to, CB);
                else
                  cb(er);
              });
            }, backoff);
            if (backoff < 100)
              backoff += 10;
            return;
          }
          if (cb) cb(er);
        });
      }
      if (Object.setPrototypeOf) Object.setPrototypeOf(rename, fs$rename);
      return rename;
    }(fs2.rename);
  }
  fs2.read = typeof fs2.read !== "function" ? fs2.read : function(fs$read) {
    function read(fd, buffer, offset, length, position, callback_) {
      var callback;
      if (callback_ && typeof callback_ === "function") {
        var eagCounter = 0;
        callback = function(er, _, __) {
          if (er && er.code === "EAGAIN" && eagCounter < 10) {
            eagCounter++;
            return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
          }
          callback_.apply(this, arguments);
        };
      }
      return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
    }
    if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
    return read;
  }(fs2.read);
  fs2.readSync = typeof fs2.readSync !== "function" ? fs2.readSync : /* @__PURE__ */ function(fs$readSync) {
    return function(fd, buffer, offset, length, position) {
      var eagCounter = 0;
      while (true) {
        try {
          return fs$readSync.call(fs2, fd, buffer, offset, length, position);
        } catch (er) {
          if (er.code === "EAGAIN" && eagCounter < 10) {
            eagCounter++;
            continue;
          }
          throw er;
        }
      }
    };
  }(fs2.readSync);
  function patchLchmod(fs22) {
    fs22.lchmod = function(path2, mode, callback) {
      fs22.open(
        path2,
        constants.O_WRONLY | constants.O_SYMLINK,
        mode,
        function(err, fd) {
          if (err) {
            if (callback) callback(err);
            return;
          }
          fs22.fchmod(fd, mode, function(err2) {
            fs22.close(fd, function(err22) {
              if (callback) callback(err2 || err22);
            });
          });
        }
      );
    };
    fs22.lchmodSync = function(path2, mode) {
      var fd = fs22.openSync(path2, constants.O_WRONLY | constants.O_SYMLINK, mode);
      var threw = true;
      var ret;
      try {
        ret = fs22.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs22.closeSync(fd);
          } catch (er) {
          }
        } else {
          fs22.closeSync(fd);
        }
      }
      return ret;
    };
  }
  function patchLutimes(fs22) {
    if (constants.hasOwnProperty("O_SYMLINK") && fs22.futimes) {
      fs22.lutimes = function(path2, at, mt, cb) {
        fs22.open(path2, constants.O_SYMLINK, function(er, fd) {
          if (er) {
            if (cb) cb(er);
            return;
          }
          fs22.futimes(fd, at, mt, function(er2) {
            fs22.close(fd, function(er22) {
              if (cb) cb(er2 || er22);
            });
          });
        });
      };
      fs22.lutimesSync = function(path2, at, mt) {
        var fd = fs22.openSync(path2, constants.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs22.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs22.closeSync(fd);
            } catch (er) {
            }
          } else {
            fs22.closeSync(fd);
          }
        }
        return ret;
      };
    } else if (fs22.futimes) {
      fs22.lutimes = function(_a, _b, _c, cb) {
        if (cb) process.nextTick(cb);
      };
      fs22.lutimesSync = function() {
      };
    }
  }
  function chmodFix(orig) {
    if (!orig) return orig;
    return function(target2, mode, cb) {
      return orig.call(fs2, target2, mode, function(er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      });
    };
  }
  function chmodFixSync(orig) {
    if (!orig) return orig;
    return function(target2, mode) {
      try {
        return orig.call(fs2, target2, mode);
      } catch (er) {
        if (!chownErOk(er)) throw er;
      }
    };
  }
  function chownFix(orig) {
    if (!orig) return orig;
    return function(target2, uid, gid, cb) {
      return orig.call(fs2, target2, uid, gid, function(er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      });
    };
  }
  function chownFixSync(orig) {
    if (!orig) return orig;
    return function(target2, uid, gid) {
      try {
        return orig.call(fs2, target2, uid, gid);
      } catch (er) {
        if (!chownErOk(er)) throw er;
      }
    };
  }
  function statFix(orig) {
    if (!orig) return orig;
    return function(target2, options2, cb) {
      if (typeof options2 === "function") {
        cb = options2;
        options2 = null;
      }
      function callback(er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 4294967296;
          if (stats.gid < 0) stats.gid += 4294967296;
        }
        if (cb) cb.apply(this, arguments);
      }
      return options2 ? orig.call(fs2, target2, options2, callback) : orig.call(fs2, target2, callback);
    };
  }
  function statFixSync(orig) {
    if (!orig) return orig;
    return function(target2, options2) {
      var stats = options2 ? orig.call(fs2, target2, options2) : orig.call(fs2, target2);
      if (stats) {
        if (stats.uid < 0) stats.uid += 4294967296;
        if (stats.gid < 0) stats.gid += 4294967296;
      }
      return stats;
    };
  }
  function chownErOk(er) {
    if (!er)
      return true;
    if (er.code === "ENOSYS")
      return true;
    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true;
    }
    return false;
  }
}
var Stream = require$$0$2.Stream;
var legacyStreams = legacy$1;
function legacy$1(fs2) {
  return {
    ReadStream,
    WriteStream
  };
  function ReadStream(path2, options2) {
    if (!(this instanceof ReadStream)) return new ReadStream(path2, options2);
    Stream.call(this);
    var self2 = this;
    this.path = path2;
    this.fd = null;
    this.readable = true;
    this.paused = false;
    this.flags = "r";
    this.mode = 438;
    this.bufferSize = 64 * 1024;
    options2 = options2 || {};
    var keys = Object.keys(options2);
    for (var index2 = 0, length = keys.length; index2 < length; index2++) {
      var key = keys[index2];
      this[key] = options2[key];
    }
    if (this.encoding) this.setEncoding(this.encoding);
    if (this.start !== void 0) {
      if ("number" !== typeof this.start) {
        throw TypeError("start must be a Number");
      }
      if (this.end === void 0) {
        this.end = Infinity;
      } else if ("number" !== typeof this.end) {
        throw TypeError("end must be a Number");
      }
      if (this.start > this.end) {
        throw new Error("start must be <= end");
      }
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        self2._read();
      });
      return;
    }
    fs2.open(this.path, this.flags, this.mode, function(err, fd) {
      if (err) {
        self2.emit("error", err);
        self2.readable = false;
        return;
      }
      self2.fd = fd;
      self2.emit("open", fd);
      self2._read();
    });
  }
  function WriteStream(path2, options2) {
    if (!(this instanceof WriteStream)) return new WriteStream(path2, options2);
    Stream.call(this);
    this.path = path2;
    this.fd = null;
    this.writable = true;
    this.flags = "w";
    this.encoding = "binary";
    this.mode = 438;
    this.bytesWritten = 0;
    options2 = options2 || {};
    var keys = Object.keys(options2);
    for (var index2 = 0, length = keys.length; index2 < length; index2++) {
      var key = keys[index2];
      this[key] = options2[key];
    }
    if (this.start !== void 0) {
      if ("number" !== typeof this.start) {
        throw TypeError("start must be a Number");
      }
      if (this.start < 0) {
        throw new Error("start must be >= zero");
      }
      this.pos = this.start;
    }
    this.busy = false;
    this._queue = [];
    if (this.fd === null) {
      this._open = fs2.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
      this.flush();
    }
  }
}
var clone_1 = clone$1;
var getPrototypeOf = Object.getPrototypeOf || function(obj) {
  return obj.__proto__;
};
function clone$1(obj) {
  if (obj === null || typeof obj !== "object")
    return obj;
  if (obj instanceof Object)
    var copy = { __proto__: getPrototypeOf(obj) };
  else
    var copy = /* @__PURE__ */ Object.create(null);
  Object.getOwnPropertyNames(obj).forEach(function(key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
  });
  return copy;
}
var fs$1 = fs$4;
var polyfills = polyfills$1;
var legacy = legacyStreams;
var clone = clone_1;
var util = require$$4;
var gracefulQueue;
var previousSymbol;
if (typeof Symbol === "function" && typeof Symbol.for === "function") {
  gracefulQueue = Symbol.for("graceful-fs.queue");
  previousSymbol = Symbol.for("graceful-fs.previous");
} else {
  gracefulQueue = "___graceful-fs.queue";
  previousSymbol = "___graceful-fs.previous";
}
function noop() {
}
function publishQueue(context, queue2) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue2;
    }
  });
}
var debug = noop;
if (util.debuglog)
  debug = util.debuglog("gfs4");
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
  debug = function() {
    var m = util.format.apply(util, arguments);
    m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
    console.error(m);
  };
if (!fs$1[gracefulQueue]) {
  var queue = commonjsGlobal[gracefulQueue] || [];
  publishQueue(fs$1, queue);
  fs$1.close = function(fs$close) {
    function close(fd, cb) {
      return fs$close.call(fs$1, fd, function(err) {
        if (!err) {
          resetQueue();
        }
        if (typeof cb === "function")
          cb.apply(this, arguments);
      });
    }
    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close;
  }(fs$1.close);
  fs$1.closeSync = function(fs$closeSync) {
    function closeSync(fd) {
      fs$closeSync.apply(fs$1, arguments);
      resetQueue();
    }
    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
    return closeSync;
  }(fs$1.closeSync);
  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
    process.on("exit", function() {
      debug(fs$1[gracefulQueue]);
      require$$5.equal(fs$1[gracefulQueue].length, 0);
    });
  }
}
if (!commonjsGlobal[gracefulQueue]) {
  publishQueue(commonjsGlobal, fs$1[gracefulQueue]);
}
var gracefulFs = patch(clone(fs$1));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$1.__patched) {
  gracefulFs = patch(fs$1);
  fs$1.__patched = true;
}
function patch(fs2) {
  polyfills(fs2);
  fs2.gracefulify = patch;
  fs2.createReadStream = createReadStream;
  fs2.createWriteStream = createWriteStream;
  var fs$readFile = fs2.readFile;
  fs2.readFile = readFile;
  function readFile(path2, options2, cb) {
    if (typeof options2 === "function")
      cb = options2, options2 = null;
    return go$readFile(path2, options2, cb);
    function go$readFile(path22, options22, cb2, startTime) {
      return fs$readFile(path22, options22, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$readFile, [path22, options22, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$writeFile = fs2.writeFile;
  fs2.writeFile = writeFile2;
  function writeFile2(path2, data, options2, cb) {
    if (typeof options2 === "function")
      cb = options2, options2 = null;
    return go$writeFile(path2, data, options2, cb);
    function go$writeFile(path22, data2, options22, cb2, startTime) {
      return fs$writeFile(path22, data2, options22, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$writeFile, [path22, data2, options22, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$appendFile = fs2.appendFile;
  if (fs$appendFile)
    fs2.appendFile = appendFile;
  function appendFile(path2, data, options2, cb) {
    if (typeof options2 === "function")
      cb = options2, options2 = null;
    return go$appendFile(path2, data, options2, cb);
    function go$appendFile(path22, data2, options22, cb2, startTime) {
      return fs$appendFile(path22, data2, options22, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$appendFile, [path22, data2, options22, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$copyFile = fs2.copyFile;
  if (fs$copyFile)
    fs2.copyFile = copyFile;
  function copyFile(src, dest, flags, cb) {
    if (typeof flags === "function") {
      cb = flags;
      flags = 0;
    }
    return go$copyFile(src, dest, flags, cb);
    function go$copyFile(src2, dest2, flags2, cb2, startTime) {
      return fs$copyFile(src2, dest2, flags2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$readdir = fs2.readdir;
  fs2.readdir = readdir;
  var noReaddirOptionVersions = /^v[0-5]\./;
  function readdir(path2, options2, cb) {
    if (typeof options2 === "function")
      cb = options2, options2 = null;
    var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path22, options22, cb2, startTime) {
      return fs$readdir(path22, fs$readdirCallback(
        path22,
        options22,
        cb2,
        startTime
      ));
    } : function go$readdir2(path22, options22, cb2, startTime) {
      return fs$readdir(path22, options22, fs$readdirCallback(
        path22,
        options22,
        cb2,
        startTime
      ));
    };
    return go$readdir(path2, options2, cb);
    function fs$readdirCallback(path22, options22, cb2, startTime) {
      return function(err, files) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([
            go$readdir,
            [path22, options22, cb2],
            err,
            startTime || Date.now(),
            Date.now()
          ]);
        else {
          if (files && files.sort)
            files.sort();
          if (typeof cb2 === "function")
            cb2.call(this, err, files);
        }
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var legStreams = legacy(fs2);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }
  var fs$ReadStream = fs2.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }
  var fs$WriteStream = fs2.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }
  Object.defineProperty(fs2, "ReadStream", {
    get: function() {
      return ReadStream;
    },
    set: function(val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(fs2, "WriteStream", {
    get: function() {
      return WriteStream;
    },
    set: function(val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileReadStream = ReadStream;
  Object.defineProperty(fs2, "FileReadStream", {
    get: function() {
      return FileReadStream;
    },
    set: function(val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileWriteStream = WriteStream;
  Object.defineProperty(fs2, "FileWriteStream", {
    get: function() {
      return FileWriteStream;
    },
    set: function(val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });
  function ReadStream(path2, options2) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this;
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
  }
  function ReadStream$open() {
    var that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();
        that.emit("error", err);
      } else {
        that.fd = fd;
        that.emit("open", fd);
        that.read();
      }
    });
  }
  function WriteStream(path2, options2) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this;
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
  }
  function WriteStream$open() {
    var that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
      if (err) {
        that.destroy();
        that.emit("error", err);
      } else {
        that.fd = fd;
        that.emit("open", fd);
      }
    });
  }
  function createReadStream(path2, options2) {
    return new fs2.ReadStream(path2, options2);
  }
  function createWriteStream(path2, options2) {
    return new fs2.WriteStream(path2, options2);
  }
  var fs$open = fs2.open;
  fs2.open = open;
  function open(path2, flags, mode, cb) {
    if (typeof mode === "function")
      cb = mode, mode = null;
    return go$open(path2, flags, mode, cb);
    function go$open(path22, flags2, mode2, cb2, startTime) {
      return fs$open(path22, flags2, mode2, function(err, fd) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$open, [path22, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  return fs2;
}
function enqueue(elem) {
  debug("ENQUEUE", elem[0].name, elem[1]);
  fs$1[gracefulQueue].push(elem);
  retry();
}
var retryTimer;
function resetQueue() {
  var now = Date.now();
  for (var i = 0; i < fs$1[gracefulQueue].length; ++i) {
    if (fs$1[gracefulQueue][i].length > 2) {
      fs$1[gracefulQueue][i][3] = now;
      fs$1[gracefulQueue][i][4] = now;
    }
  }
  retry();
}
function retry() {
  clearTimeout(retryTimer);
  retryTimer = void 0;
  if (fs$1[gracefulQueue].length === 0)
    return;
  var elem = fs$1[gracefulQueue].shift();
  var fn = elem[0];
  var args = elem[1];
  var err = elem[2];
  var startTime = elem[3];
  var lastTime = elem[4];
  if (startTime === void 0) {
    debug("RETRY", fn.name, args);
    fn.apply(null, args);
  } else if (Date.now() - startTime >= 6e4) {
    debug("TIMEOUT", fn.name, args);
    var cb = args.pop();
    if (typeof cb === "function")
      cb.call(null, err);
  } else {
    var sinceAttempt = Date.now() - lastTime;
    var sinceStart = Math.max(lastTime - startTime, 1);
    var desiredDelay = Math.min(sinceStart * 1.2, 100);
    if (sinceAttempt >= desiredDelay) {
      debug("RETRY", fn.name, args);
      fn.apply(null, args.concat([startTime]));
    } else {
      fs$1[gracefulQueue].push(elem);
    }
  }
  if (retryTimer === void 0) {
    retryTimer = setTimeout(retry, 0);
  }
}
var imurmurhash = { exports: {} };
/**
 * @preserve
 * JS Implementation of incremental MurmurHash3 (r150) (as of May 10, 2013)
 *
 * @author <a href="mailto:jensyt@gmail.com">Jens Taylor</a>
 * @see http://github.com/homebrewing/brauhaus-diff
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 */
(function(module2) {
  (function() {
    var cache;
    function MurmurHash32(key, seed) {
      var m = this instanceof MurmurHash32 ? this : cache;
      m.reset(seed);
      if (typeof key === "string" && key.length > 0) {
        m.hash(key);
      }
      if (m !== this) {
        return m;
      }
    }
    MurmurHash32.prototype.hash = function(key) {
      var h1, k1, i, top, len;
      len = key.length;
      this.len += len;
      k1 = this.k1;
      i = 0;
      switch (this.rem) {
        case 0:
          k1 ^= len > i ? key.charCodeAt(i++) & 65535 : 0;
        case 1:
          k1 ^= len > i ? (key.charCodeAt(i++) & 65535) << 8 : 0;
        case 2:
          k1 ^= len > i ? (key.charCodeAt(i++) & 65535) << 16 : 0;
        case 3:
          k1 ^= len > i ? (key.charCodeAt(i) & 255) << 24 : 0;
          k1 ^= len > i ? (key.charCodeAt(i++) & 65280) >> 8 : 0;
      }
      this.rem = len + this.rem & 3;
      len -= this.rem;
      if (len > 0) {
        h1 = this.h1;
        while (1) {
          k1 = k1 * 11601 + (k1 & 65535) * 3432906752 & 4294967295;
          k1 = k1 << 15 | k1 >>> 17;
          k1 = k1 * 13715 + (k1 & 65535) * 461832192 & 4294967295;
          h1 ^= k1;
          h1 = h1 << 13 | h1 >>> 19;
          h1 = h1 * 5 + 3864292196 & 4294967295;
          if (i >= len) {
            break;
          }
          k1 = key.charCodeAt(i++) & 65535 ^ (key.charCodeAt(i++) & 65535) << 8 ^ (key.charCodeAt(i++) & 65535) << 16;
          top = key.charCodeAt(i++);
          k1 ^= (top & 255) << 24 ^ (top & 65280) >> 8;
        }
        k1 = 0;
        switch (this.rem) {
          case 3:
            k1 ^= (key.charCodeAt(i + 2) & 65535) << 16;
          case 2:
            k1 ^= (key.charCodeAt(i + 1) & 65535) << 8;
          case 1:
            k1 ^= key.charCodeAt(i) & 65535;
        }
        this.h1 = h1;
      }
      this.k1 = k1;
      return this;
    };
    MurmurHash32.prototype.result = function() {
      var k1, h1;
      k1 = this.k1;
      h1 = this.h1;
      if (k1 > 0) {
        k1 = k1 * 11601 + (k1 & 65535) * 3432906752 & 4294967295;
        k1 = k1 << 15 | k1 >>> 17;
        k1 = k1 * 13715 + (k1 & 65535) * 461832192 & 4294967295;
        h1 ^= k1;
      }
      h1 ^= this.len;
      h1 ^= h1 >>> 16;
      h1 = h1 * 51819 + (h1 & 65535) * 2246770688 & 4294967295;
      h1 ^= h1 >>> 13;
      h1 = h1 * 44597 + (h1 & 65535) * 3266445312 & 4294967295;
      h1 ^= h1 >>> 16;
      return h1 >>> 0;
    };
    MurmurHash32.prototype.reset = function(seed) {
      this.h1 = typeof seed === "number" ? seed : 0;
      this.rem = this.k1 = this.len = 0;
      return this;
    };
    cache = new MurmurHash32();
    {
      module2.exports = MurmurHash32;
    }
  })();
})(imurmurhash);
var imurmurhashExports = imurmurhash.exports;
var signalExit = { exports: {} };
var signals$1 = { exports: {} };
var hasRequiredSignals;
function requireSignals() {
  if (hasRequiredSignals) return signals$1.exports;
  hasRequiredSignals = 1;
  (function(module2) {
    module2.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module2.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module2.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  })(signals$1);
  return signals$1.exports;
}
var process$1 = commonjsGlobal.process;
const processOk = function(process2) {
  return process2 && typeof process2 === "object" && typeof process2.removeListener === "function" && typeof process2.emit === "function" && typeof process2.reallyExit === "function" && typeof process2.listeners === "function" && typeof process2.kill === "function" && typeof process2.pid === "number" && typeof process2.on === "function";
};
if (!processOk(process$1)) {
  signalExit.exports = function() {
    return function() {
    };
  };
} else {
  var assert = require$$5;
  var signals = requireSignals();
  var isWin = /^win/i.test(process$1.platform);
  var EE = require$$2;
  if (typeof EE !== "function") {
    EE = EE.EventEmitter;
  }
  var emitter;
  if (process$1.__signal_exit_emitter__) {
    emitter = process$1.__signal_exit_emitter__;
  } else {
    emitter = process$1.__signal_exit_emitter__ = new EE();
    emitter.count = 0;
    emitter.emitted = {};
  }
  if (!emitter.infinite) {
    emitter.setMaxListeners(Infinity);
    emitter.infinite = true;
  }
  signalExit.exports = function(cb, opts) {
    if (!processOk(commonjsGlobal.process)) {
      return function() {
      };
    }
    assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
    if (loaded === false) {
      load();
    }
    var ev = "exit";
    if (opts && opts.alwaysLast) {
      ev = "afterexit";
    }
    var remove = function() {
      emitter.removeListener(ev, cb);
      if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
        unload();
      }
    };
    emitter.on(ev, cb);
    return remove;
  };
  var unload = function unload2() {
    if (!loaded || !processOk(commonjsGlobal.process)) {
      return;
    }
    loaded = false;
    signals.forEach(function(sig) {
      try {
        process$1.removeListener(sig, sigListeners[sig]);
      } catch (er) {
      }
    });
    process$1.emit = originalProcessEmit;
    process$1.reallyExit = originalProcessReallyExit;
    emitter.count -= 1;
  };
  signalExit.exports.unload = unload;
  var emit = function emit2(event, code, signal) {
    if (emitter.emitted[event]) {
      return;
    }
    emitter.emitted[event] = true;
    emitter.emit(event, code, signal);
  };
  var sigListeners = {};
  signals.forEach(function(sig) {
    sigListeners[sig] = function listener() {
      if (!processOk(commonjsGlobal.process)) {
        return;
      }
      var listeners = process$1.listeners(sig);
      if (listeners.length === emitter.count) {
        unload();
        emit("exit", null, sig);
        emit("afterexit", null, sig);
        if (isWin && sig === "SIGHUP") {
          sig = "SIGINT";
        }
        process$1.kill(process$1.pid, sig);
      }
    };
  });
  signalExit.exports.signals = function() {
    return signals;
  };
  var loaded = false;
  var load = function load2() {
    if (loaded || !processOk(commonjsGlobal.process)) {
      return;
    }
    loaded = true;
    emitter.count += 1;
    signals = signals.filter(function(sig) {
      try {
        process$1.on(sig, sigListeners[sig]);
        return true;
      } catch (er) {
        return false;
      }
    });
    process$1.emit = processEmit;
    process$1.reallyExit = processReallyExit;
  };
  signalExit.exports.load = load;
  var originalProcessReallyExit = process$1.reallyExit;
  var processReallyExit = function processReallyExit2(code) {
    if (!processOk(commonjsGlobal.process)) {
      return;
    }
    process$1.exitCode = code || /* istanbul ignore next */
    0;
    emit("exit", process$1.exitCode, null);
    emit("afterexit", process$1.exitCode, null);
    originalProcessReallyExit.call(process$1, process$1.exitCode);
  };
  var originalProcessEmit = process$1.emit;
  var processEmit = function processEmit2(ev, arg) {
    if (ev === "exit" && processOk(commonjsGlobal.process)) {
      if (arg !== void 0) {
        process$1.exitCode = arg;
      }
      var ret = originalProcessEmit.apply(this, arguments);
      emit("exit", process$1.exitCode, null);
      emit("afterexit", process$1.exitCode, null);
      return ret;
    } else {
      return originalProcessEmit.apply(this, arguments);
    }
  };
}
var signalExitExports = signalExit.exports;
writeFileAtomic.exports = writeFile;
writeFileAtomic.exports.sync = writeFileSync;
writeFileAtomic.exports._getTmpname = getTmpname;
writeFileAtomic.exports._cleanupOnExit = cleanupOnExit;
var fs = gracefulFs;
var MurmurHash3 = imurmurhashExports;
var onExit = signalExitExports;
var path$1 = path$6;
var activeFiles = {};
var threadId = function getId() {
  try {
    var workerThreads = require("worker_threads");
    return workerThreads.threadId;
  } catch (e) {
    return 0;
  }
}();
var invocations = 0;
function getTmpname(filename) {
  return filename + "." + MurmurHash3(__filename).hash(String(process.pid)).hash(String(threadId)).hash(String(++invocations)).result();
}
function cleanupOnExit(tmpfile) {
  return function() {
    try {
      fs.unlinkSync(typeof tmpfile === "function" ? tmpfile() : tmpfile);
    } catch (_) {
    }
  };
}
function writeFile(filename, data, options2, callback) {
  if (options2) {
    if (options2 instanceof Function) {
      callback = options2;
      options2 = {};
    } else if (typeof options2 === "string") {
      options2 = { encoding: options2 };
    }
  } else {
    options2 = {};
  }
  var Promise2 = options2.Promise || commonjsGlobal.Promise;
  var truename;
  var fd;
  var tmpfile;
  var removeOnExitHandler = onExit(cleanupOnExit(() => tmpfile));
  var absoluteName = path$1.resolve(filename);
  new Promise2(function serializeSameFile(resolve2) {
    if (!activeFiles[absoluteName]) activeFiles[absoluteName] = [];
    activeFiles[absoluteName].push(resolve2);
    if (activeFiles[absoluteName].length === 1) resolve2();
  }).then(function getRealPath() {
    return new Promise2(function(resolve2) {
      fs.realpath(filename, function(_, realname) {
        truename = realname || filename;
        tmpfile = getTmpname(truename);
        resolve2();
      });
    });
  }).then(function stat() {
    return new Promise2(function stat2(resolve2) {
      if (options2.mode && options2.chown) resolve2();
      else {
        fs.stat(truename, function(err, stats) {
          if (err || !stats) resolve2();
          else {
            options2 = Object.assign({}, options2);
            if (options2.mode == null) {
              options2.mode = stats.mode;
            }
            if (options2.chown == null && process.getuid) {
              options2.chown = { uid: stats.uid, gid: stats.gid };
            }
            resolve2();
          }
        });
      }
    });
  }).then(function thenWriteFile() {
    return new Promise2(function(resolve2, reject) {
      fs.open(tmpfile, "w", options2.mode, function(err, _fd) {
        fd = _fd;
        if (err) reject(err);
        else resolve2();
      });
    });
  }).then(function write() {
    return new Promise2(function(resolve2, reject) {
      if (Buffer.isBuffer(data)) {
        fs.write(fd, data, 0, data.length, 0, function(err) {
          if (err) reject(err);
          else resolve2();
        });
      } else if (data != null) {
        fs.write(fd, String(data), 0, String(options2.encoding || "utf8"), function(err) {
          if (err) reject(err);
          else resolve2();
        });
      } else resolve2();
    });
  }).then(function syncAndClose() {
    return new Promise2(function(resolve2, reject) {
      if (options2.fsync !== false) {
        fs.fsync(fd, function(err) {
          if (err) fs.close(fd, () => reject(err));
          else fs.close(fd, resolve2);
        });
      } else {
        fs.close(fd, resolve2);
      }
    });
  }).then(function chown() {
    fd = null;
    if (options2.chown) {
      return new Promise2(function(resolve2, reject) {
        fs.chown(tmpfile, options2.chown.uid, options2.chown.gid, function(err) {
          if (err) reject(err);
          else resolve2();
        });
      });
    }
  }).then(function chmod() {
    if (options2.mode) {
      return new Promise2(function(resolve2, reject) {
        fs.chmod(tmpfile, options2.mode, function(err) {
          if (err) reject(err);
          else resolve2();
        });
      });
    }
  }).then(function rename() {
    return new Promise2(function(resolve2, reject) {
      fs.rename(tmpfile, truename, function(err) {
        if (err) reject(err);
        else resolve2();
      });
    });
  }).then(function success() {
    removeOnExitHandler();
    callback();
  }, function fail(err) {
    return new Promise2((resolve2) => {
      return fd ? fs.close(fd, resolve2) : resolve2();
    }).then(() => {
      removeOnExitHandler();
      fs.unlink(tmpfile, function() {
        callback(err);
      });
    });
  }).then(function checkQueue() {
    activeFiles[absoluteName].shift();
    if (activeFiles[absoluteName].length > 0) {
      activeFiles[absoluteName][0]();
    } else delete activeFiles[absoluteName];
  });
}
function writeFileSync(filename, data, options2) {
  if (typeof options2 === "string") options2 = { encoding: options2 };
  else if (!options2) options2 = {};
  try {
    filename = fs.realpathSync(filename);
  } catch (ex) {
  }
  var tmpfile = getTmpname(filename);
  if (!options2.mode || !options2.chown) {
    try {
      var stats = fs.statSync(filename);
      options2 = Object.assign({}, options2);
      if (!options2.mode) {
        options2.mode = stats.mode;
      }
      if (!options2.chown && process.getuid) {
        options2.chown = { uid: stats.uid, gid: stats.gid };
      }
    } catch (ex) {
    }
  }
  var fd;
  var cleanup = cleanupOnExit(tmpfile);
  var removeOnExitHandler = onExit(cleanup);
  try {
    fd = fs.openSync(tmpfile, "w", options2.mode);
    if (Buffer.isBuffer(data)) {
      fs.writeSync(fd, data, 0, data.length, 0);
    } else if (data != null) {
      fs.writeSync(fd, String(data), 0, String(options2.encoding || "utf8"));
    }
    if (options2.fsync !== false) {
      fs.fsyncSync(fd);
    }
    fs.closeSync(fd);
    if (options2.chown) fs.chownSync(tmpfile, options2.chown.uid, options2.chown.gid);
    if (options2.mode) fs.chmodSync(tmpfile, options2.mode);
    fs.renameSync(tmpfile, filename);
    removeOnExitHandler();
  } catch (err) {
    if (fd) {
      try {
        fs.closeSync(fd);
      } catch (ex) {
      }
    }
    removeOnExitHandler();
    cleanup();
    throw err;
  }
}
var writeFileAtomicExports = writeFileAtomic.exports;
(function(module2) {
  const fs2 = fs$4;
  const path2 = path$6;
  const crypto = require$$2$1;
  const assert = require$$5;
  const EventEmitter = require$$2;
  const dotProp$1 = dotProp;
  const makeDir2 = makeDirExports;
  const pkgUp2 = pkgUpExports;
  const envPaths$1 = envPaths;
  const writeFileAtomic2 = writeFileAtomicExports;
  const plainObject = () => /* @__PURE__ */ Object.create(null);
  delete require.cache[__filename];
  const parentDir = path2.dirname(module2.parent && module2.parent.filename || ".");
  class Conf2 {
    constructor(options2) {
      const pkgPath = pkgUp2.sync(parentDir);
      options2 = Object.assign({
        // Can't use `require` because of Webpack being annoying:
        // https://github.com/webpack/webpack/issues/196
        projectName: pkgPath && JSON.parse(fs2.readFileSync(pkgPath, "utf8")).name
      }, options2);
      if (!options2.projectName && !options2.cwd) {
        throw new Error("Project name could not be inferred. Please specify the `projectName` option.");
      }
      options2 = Object.assign({
        configName: "config",
        fileExtension: "json",
        projectSuffix: "nodejs"
      }, options2);
      if (!options2.cwd) {
        options2.cwd = envPaths$1(options2.projectName, { suffix: options2.projectSuffix }).config;
      }
      this.events = new EventEmitter();
      this.encryptionKey = options2.encryptionKey;
      const fileExtension = options2.fileExtension ? `.${options2.fileExtension}` : "";
      this.path = path2.resolve(options2.cwd, `${options2.configName}${fileExtension}`);
      const fileStore = this.store;
      const store2 = Object.assign(plainObject(), options2.defaults, fileStore);
      try {
        assert.deepEqual(fileStore, store2);
      } catch (_) {
        this.store = store2;
      }
    }
    get(key, defaultValue) {
      return dotProp$1.get(this.store, key, defaultValue);
    }
    set(key, value) {
      if (typeof key !== "string" && typeof key !== "object") {
        throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof key}`);
      }
      if (typeof key !== "object" && value === void 0) {
        throw new TypeError("Use `delete()` to clear values");
      }
      const { store: store2 } = this;
      if (typeof key === "object") {
        for (const k of Object.keys(key)) {
          dotProp$1.set(store2, k, key[k]);
        }
      } else {
        dotProp$1.set(store2, key, value);
      }
      this.store = store2;
    }
    has(key) {
      return dotProp$1.has(this.store, key);
    }
    delete(key) {
      const { store: store2 } = this;
      dotProp$1.delete(store2, key);
      this.store = store2;
    }
    clear() {
      this.store = plainObject();
    }
    onDidChange(key, callback) {
      if (typeof key !== "string") {
        throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof key}`);
      }
      if (typeof callback !== "function") {
        throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof callback}`);
      }
      let currentValue = this.get(key);
      const onChange = () => {
        const oldValue = currentValue;
        const newValue = this.get(key);
        try {
          assert.deepEqual(newValue, oldValue);
        } catch (_) {
          currentValue = newValue;
          callback.call(this, newValue, oldValue);
        }
      };
      this.events.on("change", onChange);
      return () => this.events.removeListener("change", onChange);
    }
    get size() {
      return Object.keys(this.store).length;
    }
    get store() {
      try {
        let data = fs2.readFileSync(this.path, this.encryptionKey ? null : "utf8");
        if (this.encryptionKey) {
          try {
            const decipher = crypto.createDecipher("aes-256-cbc", this.encryptionKey);
            data = Buffer.concat([decipher.update(data), decipher.final()]);
          } catch (_) {
          }
        }
        return Object.assign(plainObject(), JSON.parse(data));
      } catch (error) {
        if (error.code === "ENOENT") {
          makeDir2.sync(path2.dirname(this.path));
          return plainObject();
        }
        if (error.name === "SyntaxError") {
          return plainObject();
        }
        throw error;
      }
    }
    set store(value) {
      makeDir2.sync(path2.dirname(this.path));
      let data = JSON.stringify(value, null, "	");
      if (this.encryptionKey) {
        const cipher = crypto.createCipher("aes-256-cbc", this.encryptionKey);
        data = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()]);
      }
      writeFileAtomic2.sync(this.path, data);
      this.events.emit("change");
    }
    // TODO: Use `Object.entries()` when targeting Node.js 8
    *[Symbol.iterator]() {
      const { store: store2 } = this;
      for (const key of Object.keys(store2)) {
        yield [key, store2[key]];
      }
    }
  }
  module2.exports = Conf2;
})(conf);
var confExports = conf.exports;
const path = path$6;
const electron = require$$1;
const Conf = confExports;
class ElectronStore extends Conf {
  constructor(opts) {
    const defaultCwd = (electron.app || electron.remote.app).getPath("userData");
    opts = Object.assign({ name: "config" }, opts);
    if (opts.cwd) {
      opts.cwd = path.isAbsolute(opts.cwd) ? opts.cwd : path.join(defaultCwd, opts.cwd);
    } else {
      opts.cwd = defaultCwd;
    }
    opts.configName = opts.name;
    delete opts.name;
    super(opts);
  }
  openInEditor() {
    electron.shell.openItem(this.path);
  }
}
var electronStore = ElectronStore;
(function(module2, exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true }), exports2.default = void 0;
  var _deepmerge = _interopRequireDefault(require$$0), _electronStore = _interopRequireDefault(electronStore);
  function _interopRequireDefault(a) {
    return a && a.__esModule ? a : { default: a };
  }
  function _classCallCheck(a, b) {
    if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(a, b) {
    for (var c, d = 0; d < b.length; d++) c = b[d], c.enumerable = c.enumerable || false, c.configurable = true, "value" in c && (c.writable = true), Object.defineProperty(a, c.key, c);
  }
  function _createClass(a, b, c) {
    return b && _defineProperties(a.prototype, b), a;
  }
  var STORAGE_NAME = "vuex", STORAGE_KEY = "state", STORAGE_TEST_KEY = "test", PersistedState = function() {
    function a(b, c) {
      _classCallCheck(this, a), this.options = b, this.store = c;
    }
    return _createClass(a, [{ key: "loadOptions", value: function a2() {
      this.options.storage || (this.options.storage = this.createStorage()), this.options.storageKey || (this.options.storageKey = STORAGE_KEY), this.whitelist = this.loadFilter(this.options.whitelist, "whitelist"), this.blacklist = this.loadFilter(this.options.blacklist, "blacklist");
    } }, { key: "createStorage", value: function a2() {
      return new _electronStore.default({ name: this.options.storageName || STORAGE_NAME });
    } }, { key: "getState", value: function a2() {
      return this.options.storage.get(this.options.storageKey);
    } }, { key: "setState", value: function b(a2) {
      this.options.storage.set(this.options.storageKey, a2);
    } }, { key: "loadFilter", value: function c(a2, b) {
      if (!a2) return null;
      if (a2 instanceof Array) return this.filterInArray(a2);
      if ("function" == typeof a2) return a2;
      throw new Error('[Vuex Electron] Filter "'.concat(b, '" should be Array or Function. Please, read the docs.'));
    } }, { key: "filterInArray", value: function b(a2) {
      return function(b2) {
        return a2.includes(b2.type);
      };
    } }, { key: "checkStorage", value: function a2() {
      try {
        this.options.storage.set(STORAGE_TEST_KEY, STORAGE_TEST_KEY), this.options.storage.get(STORAGE_TEST_KEY), this.options.storage.delete(STORAGE_TEST_KEY);
      } catch (a3) {
        throw new Error("[Vuex Electron] Storage is not valid. Please, read the docs.");
      }
    } }, { key: "combineMerge", value: function e(a2, b, c) {
      var d = function(a3) {
        return Array.isArray(a3) ? [] : {};
      }, f = function(a3, b2) {
        return (0, _deepmerge.default)(d(a3), a3, b2);
      }, g = a2.slice();
      return b.forEach(function(b2, d2) {
        if ("undefined" == typeof g[d2]) {
          var e2 = false !== c.clone, h2 = e2 && c.isMergeableObject(b2);
          g[d2] = h2 ? f(b2, c) : b2;
        } else c.isMergeableObject(b2) ? g[d2] = (0, _deepmerge.default)(a2[d2], b2, c) : -1 === a2.indexOf(b2) && g.push(b2);
      }), g;
    } }, { key: "loadInitialState", value: function b() {
      var a2 = this.getState(this.options.storage, this.options.storageKey);
      if (a2) {
        var c = (0, _deepmerge.default)(this.store.state, a2, { arrayMerge: this.combineMerge });
        this.store.replaceState(c);
      }
    } }, { key: "subscribeOnChanges", value: function b() {
      var a2 = this;
      this.store.subscribe(function(b2, c) {
        a2.blacklist && a2.blacklist(b2) || a2.whitelist && !a2.whitelist(b2) || a2.setState(c);
      });
    } }]), a;
  }(), _default = function() {
    var a = 0 < arguments.length && arguments[0] !== void 0 ? arguments[0] : {};
    return function(b) {
      var c = new PersistedState(a, b);
      c.loadOptions(), c.checkStorage(), c.loadInitialState(), c.subscribeOnChanges();
    };
  };
  exports2.default = _default, module2.exports = exports2["default"];
})(persistedState, persistedState.exports);
var persistedStateExports = persistedState.exports;
var sharedMutations = { exports: {} };
(function(module2, exports2) {
  var _electron = require$$1;
  Object.defineProperty(exports2, "__esModule", { value: true }), exports2.default = void 0;
  function _classCallCheck(a, b) {
    if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(a, b) {
    for (var c, d = 0; d < b.length; d++) c = b[d], c.enumerable = c.enumerable || false, c.configurable = true, "value" in c && (c.writable = true), Object.defineProperty(a, c.key, c);
  }
  function _createClass(a, b, c) {
    return b && _defineProperties(a.prototype, b), a;
  }
  var IPC_EVENT_CONNECT = "vuex-mutations-connect", IPC_EVENT_NOTIFY_MAIN = "vuex-mutations-notify-main", IPC_EVENT_NOTIFY_RENDERERS = "vuex-mutations-notify-renderers", SharedMutations = function() {
    function a(b, c) {
      _classCallCheck(this, a), this.options = b, this.store = c;
    }
    return _createClass(a, [{ key: "loadOptions", value: function a2() {
      this.options.type || (this.options.type = "renderer" === process.type ? "renderer" : "main"), this.options.ipcMain || (this.options.ipcMain = _electron.ipcMain), this.options.ipcRenderer || (this.options.ipcRenderer = _electron.ipcRenderer);
    } }, { key: "connect", value: function b(a2) {
      this.options.ipcRenderer.send(IPC_EVENT_CONNECT, a2);
    } }, { key: "onConnect", value: function b(a2) {
      this.options.ipcMain.on(IPC_EVENT_CONNECT, a2);
    } }, { key: "notifyMain", value: function b(a2) {
      this.options.ipcRenderer.send(IPC_EVENT_NOTIFY_MAIN, a2);
    } }, { key: "onNotifyMain", value: function b(a2) {
      this.options.ipcMain.on(IPC_EVENT_NOTIFY_MAIN, a2);
    } }, { key: "notifyRenderers", value: function c(a2, b) {
      Object.keys(a2).forEach(function(c2) {
        a2[c2].send(IPC_EVENT_NOTIFY_RENDERERS, b);
      });
    } }, { key: "onNotifyRenderers", value: function b(a2) {
      this.options.ipcRenderer.on(IPC_EVENT_NOTIFY_RENDERERS, a2);
    } }, { key: "rendererProcessLogic", value: function b() {
      var a2 = this;
      this.connect(), this.store.originalCommit = this.store.commit, this.store.originalDispatch = this.store.dispatch, this.store.commit = function() {
        throw new Error("[Vuex Electron] Please, don't use direct commit's, use dispatch instead of this.");
      }, this.store.dispatch = function(b2, c) {
        a2.notifyMain({ type: b2, payload: c });
      }, this.onNotifyRenderers(function(b2, c) {
        var d = c.type, e = c.payload;
        a2.store.originalCommit(d, e);
      });
    } }, { key: "mainProcessLogic", value: function c() {
      var a2 = this, b = {};
      this.onConnect(function(a3) {
        var c2 = a3.sender, d = c2.id;
        b[d] = c2, c2.on("destroyed", function() {
          delete b[d];
        });
      }), this.onNotifyMain(function(b2, c2) {
        var d = c2.type, e = c2.payload;
        a2.store.dispatch(d, e);
      }), this.store.subscribe(function(c2) {
        var d = c2.type, e = c2.payload;
        a2.notifyRenderers(b, { type: d, payload: e });
      });
    } }, { key: "activatePlugin", value: function a2() {
      switch (this.options.type) {
        case "renderer":
          this.rendererProcessLogic();
          break;
        case "main":
          this.mainProcessLogic();
          break;
        default:
          throw new Error('[Vuex Electron] Type should be "renderer" or "main".');
      }
    } }]), a;
  }(), _default = function() {
    var a = 0 < arguments.length && arguments[0] !== void 0 ? arguments[0] : {};
    return function(b) {
      var c = new SharedMutations(a, b);
      c.loadOptions(), c.activatePlugin();
    };
  };
  exports2.default = _default, module2.exports = exports2["default"];
})(sharedMutations, sharedMutations.exports);
var sharedMutationsExports = sharedMutations.exports;
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true }), Object.defineProperty(exports2, "createPersistedState", { enumerable: true, get: function a() {
    return _persistedState.default;
  } }), Object.defineProperty(exports2, "createSharedMutations", { enumerable: true, get: function a() {
    return _sharedMutations.default;
  } });
  var _persistedState = _interopRequireDefault(persistedStateExports), _sharedMutations = _interopRequireDefault(sharedMutationsExports);
  function _interopRequireDefault(a) {
    return a && a.__esModule ? a : { default: a };
  }
})(dist);
Vue$1.use(index);
const modulesList = /* @__PURE__ */ Object.assign({ "./modules/app.js": __vite_glob_0_0, "./modules/auth.js": __vite_glob_0_1, "./modules/lang.js": __vite_glob_0_2, "./modules/queue.js": __vite_glob_0_3, "./modules/server.js": __vite_glob_0_4 });
const modules = Object.keys(modulesList).map((file) => [file.replace(/^\.\/modules\//, "").replace(/\.js$/, ""), modulesList[file]]).reduce((modules2, [name, module2]) => {
  let mod = module2.default || module2;
  mod = { ...mod };
  if (mod.namespaced === void 0) {
    mod.namespaced = true;
  }
  return { ...modules2, [name]: mod };
}, {});
function createStore() {
  return new index.Store({
    plugins: [
      pathify.plugin,
      dist.createPersistedState({
        throttle: 1e3,
        blacklist: [
          "server/addLog",
          "server/routes",
          "server/setStatus",
          "server/setRoutes",
          "server/setServingFiles",
          "server/setDraggedServingFiles"
        ]
        // whitelist: (mutation) => {
        //     // console.log(mutation.type, mutation.payload )
        //     let block = ['server/addLog', 'server/routes']
        //     if( block.includes(mutation.type) ){
        //         console.info("Store::Blocking | " + mutation.type)
        //         return false 
        //     }
        //     console.log("Store::Pass | " + mutation.type)
        //     return true
        // },
      }),
      dist.createSharedMutations()
    ],
    modules
  });
}
let store;
while (store === void 0) {
  try {
    store = createStore();
    break;
  } catch (e) {
    continue;
  }
}
console.log("Plattform Check " + process.platform);
if (process.platform === "linux") {
  console.log("Apply --no-sandbox to commandline to fix Linux (debian) graphical issues");
  console.log("More Info: https://github.com/Gkiokan/ps4-remote-pkg-sender/issues/76#issuecomment-2127757683");
  require$$1.app.commandLine.appendSwitch("no-sandbox");
}
const isDevelopment = process.env.NODE_ENV !== "production";
const showServerWindowOnStartUp = false;
const showServerDevtools = false;
const showPS4DevTools = false;
const showMainDevTools = isDevelopment;
let windows = {
  info: null,
  main: null,
  server: null,
  ps4: null
};
function createMainWindow() {
  const window2 = helper.createWindowInstance("/", {
    width: 1300,
    height: 800,
    frame: false
  }, showMainDevTools);
  window2.on("close", (event) => {
    event.preventDefault();
    window2.hide();
  });
  window2.on("closed", () => {
    windows.main = null;
  });
  helper.autocloseAfterDownload(window2);
  windows.main = window2;
}
function createServerWindow() {
  const window2 = helper.createWindowInstance("/app/Server", {
    width: 800,
    height: 500,
    title: "Server",
    show: showServerWindowOnStartUp
  }, showServerDevtools);
  window2.on("close", (event) => {
    event.preventDefault();
    window2.hide();
  });
  window2.on("closed", (event) => {
    windows.server = null;
  });
  windows.server = window2;
}
function createInfoWindow() {
  const window2 = helper.createWindowInstance("/info", {
    width: 500,
    height: 600,
    title: "Info",
    show: false
  }, false);
  window2.on("close", (event) => {
    event.preventDefault();
    window2.hide();
  });
  window2.on("closed", (event) => {
    windows.info = null;
  });
  windows.info = window2;
}
function createPS4Window() {
  const window2 = helper.createWindowInstance("/ps4", {
    width: 800,
    height: 800,
    title: "PS4",
    show: false
  }, showPS4DevTools);
  window2.on("close", (event) => {
    event.preventDefault();
    window2.hide();
  });
  window2.on("closed", (event) => {
    windows.ps4 = null;
  });
  windows.ps4 = window2;
}
function registerChannel() {
  require$$1.ipcMain.on("server", (event, data) => windows.server.webContents.send("server", data));
  require$$1.ipcMain.on("server-show", () => windows.server.show());
  require$$1.ipcMain.on("show", (event, data) => showWindow(data));
  require$$1.ipcMain.on("main", (event, data) => windows.main.webContents.send("main", data));
  require$$1.ipcMain.on("main-error", (event, data) => windows.main.webContents.send("main-error", data));
  require$$1.ipcMain.on("main-route", (event, data) => windows.main.webContents.send("main-route", data));
  require$$1.ipcMain.on("ps4", (event, data) => windows.ps4.webContents.send("ps4", data));
  require$$1.ipcMain.on("error", (event, data) => windows.main.webContents.send("error", data));
  require$$1.ipcMain.on("notify", (event, data) => notify(data));
  require$$1.ipcMain.on("quit", () => require$$1.app.quit());
}
function notify(data) {
  new require$$1.Notification(data).show();
}
function showWindow(data) {
  if (data == "ps4")
    windows.ps4.show();
  if (data == "server")
    windows.server.show();
  if (data == "info")
    windows.info.show();
}
require$$1.app.on("window-all-closed", () => {
  console.log("All windows are closed. Kill all processes.");
  require$$1.app.quit();
});
require$$1.app.on("before-quit", (event) => {
  console.log("Closing applications");
  console.log("Closing Server");
  windows.server.webContents.send("server", "stop");
  setTimeout(() => {
    Object.values(windows).map((win) => {
      if (!win) {
        return console.log("No win object");
      }
      win.removeAllListeners("close");
      win.close();
    });
  }, 500);
  console.log("Application closed.");
});
require$$1.app.on("activate", () => {
  windows.main.show();
});
require$$1.app.on("ready", () => {
  createMainWindow();
  createServerWindow();
  createInfoWindow();
  createPS4Window();
  menu.createMenu();
  tray$1.createTray();
  new require$$1.Notification({ title: "PS4 Remote PKG Sender", body: "Welcome to PS4 Remote PKG Installer. \nStart your Remote Package Installer App on your PS4 and add your PKG files here. \nHave fun." }).show();
  registerChannel();
});
module.exports = windows;
