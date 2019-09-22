// Thanks to:
// https://github.com/chenshenhai/deno_note/blob/master/demo/web_router/mod.ts

interface Layer {
  method: string;
  path: string;
  pathRegExp: RegExp;
  middleware: Function;
  getParams: Function;
}

class RouteLayer implements Layer {
  public method: string;  //  GET|POST|PUT|PATCH
  public path: string;  // router path
  public middleware: Function;  // router middleware
  public pathRegExp: RegExp;  // router regpex
  private pathParamKeyList: string[]; // router parse keywords
  constructor(method, path, middleware) {
    this.path = path;
    this.method = method;
    this.middleware = middleware;
    this.pathParamKeyList = [];
    this.pathRegExp = new RegExp(path);
    this.pathParamKeyList = [];
    this.initPathToRegExpConfig(path);
  }

  /**
   * parse the keyword params
   * example: this.path = "page/:pid/user/:uid"
   *     actionPath =  "page/001/user/abc"
   * return:  {pid: "001", uid: "abcs"}
   * @param actionPath {string}
   * @return {object}
   */
  public getParams(actionPath: string) {
    const result = {};
    const pathRegExp = this.pathRegExp;
    const pathParamKeyList = this.pathParamKeyList;
    if (Array.isArray(pathParamKeyList) && pathParamKeyList.length > 0) {
      const execResult = pathRegExp.exec(actionPath);
      pathParamKeyList.forEach(function(key, index){
        const val = execResult[index + 1];
        if (typeof val === "string") {
          result[key] = val;
        }
      });
    }
    return result;
  }

  /**
   * parse router logic to regpex
   * @param path {string}
   * @return {RegExp}
   */
  private initPathToRegExpConfig(path: string) {
    const pathItemRegExp = /\/([^\/]{2,})/ig;
    const paramKeyRegExp = /^\/\:[0-9a-zA-Z\_]/i;
    const pathItems: string[] = path.match(pathItemRegExp);
    const pathParamKeyList = [];
    const pathRegExpItemStrList = [];
    if (Array.isArray(pathItems)) {
      pathItems.forEach(function(item){
        if (typeof item === "string") {
          if (paramKeyRegExp.test(item)) {
            pathRegExpItemStrList.push(`\/([^\/]+?)`);
            const pathParamKey = item.replace(/^\/\:/ig, "");
            pathParamKeyList.push(pathParamKey);
          } else {
            pathRegExpItemStrList.push(item);
          }
        }
      });
    }
    const regExpStr = `^${pathRegExpItemStrList.join("")}[\/]?$`;
    const regExp = new RegExp(regExpStr, "i");
    this.pathParamKeyList = pathParamKeyList;
    this.pathRegExp = regExp;
  }
}

/**
 * @interface Route
 */
export interface Route {
  get: Function;  // register GET method
  post: Function;  // register POST method
  delete: Function;  // register DELETE method
  put: Function;  // register PUT method
  patch: Function;  // register PATCH method
}

/**
 * @class Router
 */
export class Router implements Route {

  private _stack: Layer[];

  constructor() {
    this._stack = [];
  }

  /**
   * register router
   * @param method {string} router method name
   * @param path {string} router path, example: "/page/hello" or "/page/:pid/user/:uid"
   * @param middleware {Function} router exec func function(ctx, next) { //... }
   */
  private register(method, path, middleware) {
    const layer = new RouteLayer(method, path, middleware);
    this._stack.push(layer);
  }

  /**
   * @param path {string}
   * @param middleware {Function}
   */
  public get(path, middleware) {
    this.register("GET", path, middleware);
  }

  /**
   * @param path {string}
   * @param middleware {Function}
   */
  public post(path, middleware) {
    this.register("POST", path, middleware);
  }

  /**
   * @param path {string}
   * @param middleware {Function}
   */
  public delete(path, middleware) {
    this.register("DELETE", path, middleware);
  }

  /**
   * @param path {string}
   * @param middleware {Function}
   */
  public put(path, middleware) {
    this.register("PUT", path, middleware);
  }

  /**
   * @param path {string}
   * @param middleware {Function}
   */
  public patch(path, middleware) {
    this.register("PATCH", path, middleware);
  }

  /**
   * @return {Function} Top level middleware
   */
  public routes() {
    const stack = this._stack;
    return async function(ctx, next) {
      const req = ctx.req;
      const gen = await req.getGeneral();
      const headers = await req.getHeaders();
      const currentPath = gen.pathname || "";
      const method = gen.method;
      let route;
      for (let i = 0; i < stack.length; i++) {
        const item: Layer = stack[i];
        if (item.pathRegExp.test(currentPath) && item.method.indexOf(method) >= 0) {
          route = item.middleware;
          const pathParams = item.getParams(currentPath);
          ctx.setData("router", pathParams);
          break;
        }
      }

      if (typeof route === "function") {
        await route(ctx, next);
        // return;
      }
    };
  }
}