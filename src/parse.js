const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

async function getFile(url, fileName) {
  function getFileFromUrl(url, fileName) {
    return new Promise((resolve, reject) => {
      let blob = null;
      let xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.onload = () => {
        blob = xhr.response;
        let file = new File([blob], fileName, { type: blob.type });
        resolve(file);
      };
      xhr.onerror = (e) => {
        reject(e);
      };
      xhr.send();
    });
  }
  const file = await getFileFromUrl(url, fileName);
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = () => {
    const res = reader.result;
    const XMLdata = res;
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: "_",
      allowBooleanAttributes: true,
    };

    const parser = new XMLParser(options);
    let jObj = parser.parse(XMLdata);

    console.log(jObj);
    const elements = jObj.EBMLSchema.element;
    const newObj = {};
    const map = {};
    const createObject = (path, value) => {
      let keyPath = [];
      if (Array.isArray(path)) keyPath = [...path];
      if (keyPath.length) {
        const key = keyPath.shift();
        if (typeof key === "number") {
          const object = new Array(key + 1);
          object[key] = createObject(keyPath, value);
          return object;
        } else return { [key]: createObject(keyPath, value) };
      } else return value;
    };
    const setPathValue = (object, path, value) => {
      let keyPath = [];
      if (Array.isArray(path)) keyPath = [...path];
      if (keyPath.length) {
        const key = keyPath.shift();
        if (object && object[key])
          object[key] = setPathValue(object[key], keyPath, value);
        else object[key] = createObject(keyPath, value);
      } else object = value;
      return object;
    };

    const getPathValue = (object, path) => {
      let keyPath = [];
      if (Array.isArray(path)) keyPath = [...path];
      else if (typeof path === "string" || typeof path === "number")
        keyPath = [path];
      if (keyPath.length) {
        const key = keyPath.shift();
        if (object && !typeof object[key] === "undefined")
          return getPathValue(object[key], keyPath);
        else return undefined;
      } else return object;
    };

    const format = (element) => {
      const pathArr = element._path.split("\\").slice(1);
      if (!getPathValue(newObj, pathArr)) {
        const value = {};
        // if (element._minOccurs === '1') {
        //   value.mandatory = true
        // }
        // if (Number(element._maxOccurs) > 1) {
        //   value.multiple = true
        // }
        // if (element._default) {
        //   value.default = element._default
        // }
        // value.id = element._id
        // value.type = element._type

        setPathValue(newObj, pathArr, value);
      }
    };
    const EBML = {};
    const Segment = {};
    const SeekHead = {};
    const Info = {};
    const Cluster = {};
    const Tracks = {};
    const Cues = {};
    elements.forEach((each) => {
      const value = {};

      if (each._minOccurs === "1") {
        value.mandatory = true;
      }
      if (Number(each._maxOccurs) > 1) {
        value.multiple = true;
      }
      if (each._default) {
        value.default = each._default;
      }
      value.id = each._id;
      value.type = each._type;
      value.path = each._path;
      if (each._path.startsWith("\\EBML")) {
        EBML[each._id] = value;
      }
      if (each._path.startsWith("\\Segment")) {
        Segment[each._id] = value;
      }

      if (each._path.startsWith("\\Segment\\SeekHead")) {
        SeekHead[each._id] = value;
      }

      if (each._path.startsWith("\\Segment\\Info")) {
        Info[each._id] = value;
      }
      if (each._path.startsWith("\\Segment\\Cluster")) {
        Cluster[each._id] = value;
      }

      if (each._path.startsWith("\\Segment\\Tracks")) {
        Tracks[each._id] = value;
      }

      if (each._path.startsWith("\\Segment\\Cues")) {
        Cues[each._id] = value;
      }
      format(each);
    });
    // map[each._id] = value;

    console.log(newObj, EBML, Segment, SeekHead, Info, Cluster, Tracks, Cues);

    // }
    // }
  };
}
let url1 =
  "https://raw.githubusercontent.com/ietf-wg-cellar/matroska-specification/master/ebml_matroska.xml";
const fileName = "文件名称";
getFile(url1, fileName);
