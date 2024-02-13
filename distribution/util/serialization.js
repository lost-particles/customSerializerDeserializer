function serialize(object) {
  if (object===undefined) {
    object=undefined;
  } else if (object instanceof Error) {
    const errorHandler = {
      get(target, prop) {
        if (prop === 'serialize') {
          const errorObj = {objType: 'Error'};
          Reflect.ownKeys(target).forEach((key) => {
            errorObj[key] = Reflect.get(target, key);
          });
          return JSON.stringify(errorObj);
        }
        return Reflect.get(target, prop);
      },
    };
    const errorProxy = new Proxy(object, errorHandler);
    // console.log('error serialized : '+errorProxy.serialize);
    return errorProxy.serialize;
  } else if (object instanceof Date) {
    const dateHandler = {
      get(target, prop) {
        if (prop === 'serialize') {
          const dateObj = {objType: 'Date'};
          Reflect.ownKeys(target).forEach((key) => {
            dateObj[key] = Reflect.get(target, key);
          });
          return JSON.stringify(dateObj);
        }
        return Reflect.get(target, prop);
      },
    };
    const dateProxy = new Proxy(object, dateHandler);
    // console.log('error serialized : '+errorProxy.serialize);
    return dateProxy.serialize;
  } else if (typeof object === 'function') {
    if (object.toString().indexOf('[native code]') !== -1) {
      object = '#$nativeFunc$#:'+Reflect.get(object, 'name');
    } else {
      object = '#$funcDef$#:'+object.toString();
    }
  } else {
    // handle for maps
    // handle the functions and other cases inside all the replacer
  }
  try {
    const visited = new Map();
    function replacer(key, value) {
      if (typeof value === 'object' && value !== null) {
        if (visited.has(value)) {
          return {'#_#Cycle': visited.get(value)};
        }
        if (value instanceof Error || value instanceof Date ||
                              value ===undefined) {
          nestedVal = serialize(value);
          visited.set(value, visited.size);
          return nestedVal;
        }
        visited.set(value, visited.size);
      }

      if (typeof value === 'function') {
        if (value.toString().indexOf('[native code]') !== -1) {
          return '#$nativeFunc$#:'+Reflect.get(value, 'name');
        } else {
          return '#$funcDef$#:'+value.toString();
        }
      }

      return value;
    }

    objStr = JSON.stringify(object, replacer);
    return objStr;
  } catch (e) {
    console.log('error found is : '+ e.toString());
    return e.toString();
  }
}

function deserialize(string) {
  // const genericObj = {};
  if (string===undefined) {
    return undefined;
  }
  if (string==='null') {
    return null;
  }
  let obj;
  const visited = [];
  // visited.set(obj, 0);
  function reviver(key, value) {
    if (typeof value === 'object') {
      if (value!==null && '#_#Cycle' in value) {
        if (value['#_#Cycle']===0) {
          return this;
        }
        return visited[value['#_#Cycle']-1];
      }
      visited.push(value);
    }
    if (typeof value==='string' && value.startsWith('#$funcDef$#:')) {
      return eval(value.split('#$funcDef$#:')[1]);
    } else if (typeof value==='string' && value.startsWith('#$nativeFunc$#:')) {
      return findNativeFunc(global, value.split('#$nativeFunc$#:')[1]);
    }
    return value;
  }
  obj = JSON.parse(string, reviver);
  if (typeof obj === 'object' && obj!=null && Reflect.has(obj, 'objType')) {
    if (obj.objType === 'Error') {
      const errorObj = new Error();
      Reflect.ownKeys(obj).filter((x) => x!=='objType').forEach((key) => {
        Reflect.set(errorObj, key, obj[key]);
      });
      return errorObj;
    } else if (obj.objType === 'Date') {
      const dateObj = new Date();
      Reflect.ownKeys(obj).filter((x) => x!=='objType').forEach((key) => {
        Reflect.set(dateObj, key, obj[key]);
      });
      return dateObj;
    }
  }

  for (key in obj) {
    if (key!==null && key!==undefined && obj[key]!==null &&
                                      obj[key]!==undefined) {
      if (obj[key]===undefined || obj[key]==='null' ||
            typeof obj[key] === 'string' && obj[key].indexOf('objType')!==-1) {
        nestedObj=deserialize(obj[key]);
        obj[key]=nestedObj;
      }
    }
  }
  /* else if (obj!==undefined && obj!==null) {
    if (obj.toString().indexOf('#$funcDef$#:')!==-1) {
      return eval(obj.toString().split('#$funcDef$#:')[1]);
    }
  }*/
  return obj;
}

function findNativeFunc(obj, functionName, visited= new Set()) {
  if (obj!==null && obj!==undefined) {
    if (visited.has(obj)) {
      return undefined;
    }
    visited.add(obj);
    if (typeof obj === 'object' && obj.hasOwnProperty &&
                                  obj.hasOwnProperty(functionName) &&
                                  typeof obj[functionName] === 'function') {
      return obj[functionName];
    }
    if (typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty && obj.hasOwnProperty(key) &&
                                  typeof obj[key] === 'object') {
          const result = findNativeFunc(obj[key], functionName, visited);
          if (result !== undefined) {
            return result;
          }
        }
      }
    }
  }
  return undefined;
}

module.exports = {
  serialize: serialize,
  deserialize: deserialize,
};

