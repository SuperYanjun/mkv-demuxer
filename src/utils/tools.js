const { XMLParser } = require("fast-xml-parser");
const { DATA_TYPE } = require("../constants/common");

function findClosestNumber(arr, target) {
  let mid;
  let l = 0;
  let r = arr.length - 1;
  while (r - l > 1) {
    mid = Math.floor((l + r) / 2);
    if (target < arr[mid]) {
      r = mid;
    } else {
      l = mid;
    }
  }
  return Math.abs(target - arr[l]) <= Math.abs(target - arr[r]) ? l : r;
}
function findNumber(arr, target) {
  let mid;
  var l = 0;
  var r = arr.length - 1;
  while (l <= r) {
    mid = Math.floor((l + r) / 2);
    if (target === arr[mid]) {
      return mid;
    } else if (target > arr[mid]) {
      l = mid + 1;
    } else {
      r = mid - 1;
    }
  }
  return -1;
}

function fetchFileFromUrl(url, fileName) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = () => {
      const blob = xhr.response;
      const file = new File([blob], fileName, { type: blob.type });
      resolve(file);
    };
    xhr.onerror = (e) => {
      reject(e);
    };
    xhr.send();
  });
}

function fileToText(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const res = fileReader.result;
      resolve(res);
    };
    fileReader.onerror = (e) => {
      reject(e);
    };
    fileReader.readAsText(file);
  });
}

function XMLToObject(XMLdata) {
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "",
    allowBooleanAttributes: true,
    // parseAttributeValue: true,
  };
  const parser = new XMLParser(options);
  return parser.parse(XMLdata);
}

function createObject(path, value) {
  if (!Array.isArray(path)) {
    throw new TypeError("path must be an array");
  }
  const keyPath = [...path];
  if (keyPath.length) {
    const key = keyPath.shift();
    if (typeof key === "number") {
      const object = new Array(key + 1);
      object[key] = createObject(keyPath, value);
      return object;
    } else {
      return { [key]: createObject(keyPath, value) };
    }
  } else {
    return value;
  }
}

function setPathValue(object, path, value) {
  if (!Array.isArray(path)) {
    throw new TypeError("path must be an array");
  }
  const keyPath = [...path];
  if (keyPath.length) {
    const key = keyPath.shift();
    if (object?.[key]) {
      object[key] = setPathValue(object[key], keyPath, value);
    } else {
      object[key] = createObject(keyPath, value);
    }
  } else {
    object = value;
  }
  return object;
}

function getPathValue(object, path) {
  if (!Array.isArray(path)) {
    throw new TypeError("path must be an array");
  }
  const keyPath = [...path];
  if (keyPath.length) {
    const key = keyPath.shift();
    if (object && !typeof object[key] === "undefined") {
      return getPathValue(object[key], keyPath);
    } else {
      return undefined;
    }
  } else {
    return object;
  }
}

function getValue(object, path) {
  if (!Array.isArray(path)) {
    throw new TypeError("path must be an array");
  }
  const keyPath = [...path];
  if (keyPath.length) {
    const key = keyPath.shift();
    if (Array.isArray(object)) {
      const lastIndex = Math.max(object.length - 1 ,0);
      return getValue(object[lastIndex]?.[key], keyPath);
    } else {
      return getValue(object?.[key], keyPath);
    }
  } else {
    if (Array.isArray(object)) {
      const lastIndex = Math.max(object.length - 1 ,0);
      return object?.[lastIndex];
    } else {
      return object;
    }
  }
}

function setValue(object, path, value) {
  if (!Array.isArray(path)) {
    throw new TypeError("path must be an array");
  }
  const keyPath = [...path];
  if (keyPath.length) {
    const key = keyPath.shift();
    if (Array.isArray(object)) {
      const lastIndex = Math.max(object.length - 1 ,0);
      if (!object[lastIndex]) object[lastIndex] = {};
      object[lastIndex][key] = setValue(object[lastIndex][key], keyPath, value);
      // object[lastIndex][key] = setValue(object[lastIndex][key], keyPath, value);
    } else {
      if (!object) object = {};

      object[key] = setValue(object[key], keyPath, value);
      // object[key] = setValue(object[key], keyPath, value);
    }
  } else {
    if (Array.isArray(object)) {
      object.push(value);
    } else {
      object = value;
    }
  }
  return object;
}

function typeConvert(type, value) {
  let res;
  switch (type) {
    case DATA_TYPE.UNSIGNED_INT:
    case DATA_TYPE.SIGNED_INT:
    case DATA_TYPE.FLOAT:
      res = Number(value);
      break;
    case DATA_TYPE.UTF8:
    case DATA_TYPE.STRING:
    case DATA_TYPE.DATE:
    case DATA_TYPE.BINARY:
    default:
      res = value;
      break;
  }
  return res;
}

module.exports = {
  findClosestNumber,
  findNumber,
  fetchFileFromUrl,
  fileToText,
  XMLToObject,
  setPathValue,
  getPathValue,
  typeConvert,
  getValue,
  setValue,
};
