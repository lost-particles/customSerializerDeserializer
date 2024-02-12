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
  }
  try {
    objStr = JSON.stringify(object, function(key, value) {
      if (typeof value === 'function') {
        return '#$funcDef$#:'+value.toString();
      }
      return value;
    });
    return objStr;
  } catch (e) {
    console.log('error found is : '+ e.toString());
    if (e.message.indexOf('Converting circular structure to JSON') !== -1) {
      const visited = new Map();

      function replacer(key, value) {
        if (typeof value === 'object' && value !== null) {
          if (visited.has(value)) {
            return {'#_#Cycle': visited.get(value)};
          }
          visited.set(value, visited.size);
        }
        return value;
      }
      return JSON.stringify(object, replacer);
    }
    return '';
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
      if ('#_#Cycle' in value) {
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

