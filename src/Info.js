const { INFO_ELEMENT_INFO,INFO_ELEMENT_NAME, CHAPTER_TRANSLATE_ELEMENT_INFO } = require("./constants/Info");
const Element = require("./Element");
class Info extends Element {
  constructor(element, dataInterface) {
    super(element, dataInterface);

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
    await super.load(INFO_ELEMENT_INFO);
  }

  async loadMasterElement(name, currentElement) {
    switch (name) {
      // case INFO_ELEMENT_NAME.CHAPTER_TRANSLATE:
      //   const chapterTranslate = new Seek(currentElement, this.dataInterface);
      //   await chapterTranslate.load();
      //   if (!chapterTranslate.loaded) {
      //     return;
      //   }
      //   this.chapterTranslate = chapterTranslate.getData();
      //   break;
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
