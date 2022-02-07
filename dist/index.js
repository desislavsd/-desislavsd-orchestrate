var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  deferred: () => deferred,
  orchestrate: () => orchestrate,
  proxyfy: () => proxyfy
});
var OrchestratorError = class extends Error {
};
async function orchestrate(hooks = [], opts = {}) {
  const context = opts.context || {};
  const contextReady = deferred();
  Object.assign(context, {
    context,
    onContextReady() {
      contextReady.then(...arguments);
    }
  });
  const proxy = proxyfy(context);
  hooks = Object.entries(hooks);
  let limit = hooks.length;
  while (hooks.length) {
    if (--limit < 0)
      throw new OrchestratorError("Could not resolve dependency tree. Please check for circular references.");
    hooks = (await Promise.all(hooks.map(async ([name, hook]) => {
      try {
        await hook(proxy, opts[name]);
        if (!(name in context))
          context[name] = true;
      } catch (err) {
        if (err instanceof OrchestratorError)
          return [name, hook];
        throw err;
      }
    }))).filter(Boolean);
  }
  contextReady.resolve(context);
  return Promise.resolve(contextReady);
}
function proxyfy(obj) {
  return new Proxy(obj, {
    get(target, prop) {
      if (!(prop in target))
        throw new OrchestratorError("Dependency does not exist yet.");
      return Reflect.get(target, prop);
    }
  });
}
function deferred(resolve, reject) {
  return Object.assign(new Promise((...a) => [resolve, reject] = a), { resolve, reject });
}
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deferred,
  orchestrate,
  proxyfy
});
