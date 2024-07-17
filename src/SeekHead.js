const {
  SEEK_HEAD_ELEMENT_NAME,
  SEEK_HEAD_ELEMENT_INFO,
} = require("./constants/SeekHead");
const Seek = require("./Seek");
const Element = require("./Element");
class SeekHead extends Element {
  constructor(element, dataInterface) {
    super(element, dataInterface);

    this.seekEntries = [];
  }

  async load() {
    await super.load(SEEK_HEAD_ELEMENT_INFO);
  }

  async loadMasterElement(name, currentElement) {
    switch (name) {
      case SEEK_HEAD_ELEMENT_NAME.SEEK:
        const seek = new Seek(currentElement, this.dataInterface);
        await seek.load();
        if (!seek.loaded) {
          return;
        }
        this.seekEntries.push(seek.getData());
        break;
      default:
        const skipped = await this.dataInterface.skipBytes(currentElement.size);
        if (skipped === false) {
          return;
        }
        break;
    }
  }

  getData() {
    return this.seekEntries;
  }
}

module.exports = SeekHead;
