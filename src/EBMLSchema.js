const {
  fetchFileFromUrl,
  fileToText,
  XMLToObject,
  setPathValue,
  getPathValue,
  typeConvert,
} = require("./utils/tools");

class EBMLSchema {
  constructor({ EBMLSchemaUrl = "", demuxer = null }) {
    this.EBMLSchemaUrl = EBMLSchemaUrl;
    this.demuxer = demuxer;
    this.EBML = {};
    this.Segment = {};
    this.SeekHead = {};
    this.Info = {};
    this.Cluster = {};
    this.Tracks = {};
    this.Cues = {};
  }
  async init() {
    if (!this.EBMLSchemaUrl) {
    } else {
      const file = await fetchFileFromUrl(this.EBMLSchemaUrl, "EBMLSchema.xml");
      const XMLText = await fileToText(file);
      const EBMLSchemaObj = XMLToObject(XMLText);
      const elements = EBMLSchemaObj?.EBMLSchema?.element || [];
      console.log(elements)
      elements.forEach((element) => {
        this.saveElementSchema(this.formatElementSchema(element));
      });
    }
    console.log(this)
  }

  formatElementSchema(element) {
    const value = {};
    if (Number(element.minOccurs) === 1) {
      value.mandatory = true;
    }
    if (Number(element.maxOccurs) !== 1) {
      value.multiple = true;
    }
    if (element.default) {
      value.default = typeConvert(element.type, element.default);
    }
    value.id = Number(element.id);
    value.name = element.name;
    value.type = element.type;
    value.path = element.path;
    value.pathArr = element.path?.split("\\")?.slice(1) || [];
    if (value.name === 'Cluster') {
      value.multiple = true;
      
    }
    return value;
  }

  saveElementSchema(element) {
    if (element.path.startsWith("\\EBML")) {
      this.EBML[element.id] = element;
    }
    if (element.path.startsWith("\\Segment")) {
      this.Segment[element.id] = element;
    }
    if (element.path.startsWith("\\Segment\\SeekHead")) {
      this.SeekHead[element.id] = element;
    }
    if (element.path.startsWith("\\Segment\\Info")) {
      this.Info[element.id] = element;
    }
    if (element.path.startsWith("\\Segment\\Cluster")) {
      this.Cluster[element.id] = element;
    }
    if (element.path.startsWith("\\Segment\\Tracks")) {
      this.Tracks[element.id] = element;
    }
    if (element.path.startsWith("\\Segment\\Cues")) {
      this.Cues[element.id] = element;
    }
  }
  saveElementInfo(element, value) {
    if (!getPathValue(data, element.pathArr)) {
      if (element.type === "master") {
        if (!getPathValue(data, element.pathArr)) {
          setPathValue(data, element.pathArr, {});
        }
      } else {
        setPathValue(data, element.pathArr, null);
      }
    }
  }
}

module.exports = EBMLSchema;
