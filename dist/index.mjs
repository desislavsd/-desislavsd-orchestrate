// src/index.ts
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
export {
  deferred,
  orchestrate,
  proxyfy
};
