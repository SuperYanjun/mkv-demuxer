const { INFO_ElEMENT_NAME, INFO_ElEMENT_INFO } = require("./constants/Info");
class Info {
  constructor(element, dataInterface) {
    this.dataInterface = dataInterface;
    this.size = element.size;
    this.offset = element.offset;
    this.end = element.end;
    this.loaded = false;

    this.segmentUUID = null;
    this.segmentFilename = null;
    this.prevUUID = null;
    this.prevFilename = null;
    this.nextUUID = null;
    this.nextFilename = null;
    this.segmentFamily = null;
    this.chapterTranslate = null;
    this.timestampScale = null;
    this.duration = null;
    this.dateUTC = null;
    this.title = null;
    this.muxingApp = null;
    this.writingApp = null;
  }

  async load() {
    let currentElement = null;
    while (this.dataInterface.offset < this.end) {
      if (!currentElement) {
        currentElement = await this.dataInterface.peekElement();
        if (currentElement === null) return;
      }
      const elementInfo = INFO_ElEMENT_INFO[currentElement.id];
      if (elementInfo) {
        const isMaster = elementInfo.type === "MASTER";
        if (isMaster) {
          this.loadMasterElement(elementInfo.name, currentElement);
        } else {
          const data = await this.dataInterface.readAs(
            elementInfo.type,
            currentElement.size
          );
          this[elementInfo.name] = data || null;
        }
      } else {
        const skipped = await this.dataInterface.skipBytes(currentElement.size);
        if (skipped === false) {
          return;
        }
      }
      currentElement = null;
    }
    this.loaded = true;
  }

  async loadMasterElement(name, currentElement) {
    switch (name) {
      default:
        const skipped = await this.dataInterface.skipBytes(currentElement.size);
        if (skipped === false) {
          return;
        }
        break;
    }
  }

  getData() {
    return {
      segmentUUID: this.segmentUUID,
      segmentFilename: this.segmentFilename,
      prevUUID: this.prevUUID,
      prevFilename: this.prevFilename,
      nextUUID: this.nextUUID,
      nextFilename: this.nextFilename,
      segmentFamily: this.segmentFamily,
      chapterTranslate: this.chapterTranslate,
      timestampScale: this.timestampScale,
      duration: this.duration,
      dateUTC: this.dateUTC,
      title: this.title,
      muxingApp: this.muxingApp,
      writingApp: this.writingApp,
    };
  }
}

module.exports = Info;
