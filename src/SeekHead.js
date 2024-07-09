const {
  SEEK_HEAD_ElEMENT_NAME,
  SEEK_HEAD_ElEMENT_INFO,
} = require("./constants/SeekHead");
const Seek = require("./Seek");
class SeekHead {
  constructor(seekHeadHeader, dataInterface) {
    this.dataInterface = dataInterface;
    this.size = seekHeadHeader.size;
    this.offset = seekHeadHeader.offset;
    this.end = seekHeadHeader.end;
    this.loaded = false;

    this.seekEntries = [];
  }

  async load() {
    let currentElement = null;
    while (this.dataInterface.offset < this.end) {
      if (!currentElement) {
        currentElement = await this.dataInterface.peekElement();
        if (currentElement === null) return;
      }
      const elementInfo = SEEK_HEAD_ElEMENT_INFO[currentElement.id];
      if (elementInfo) {
        const isMaster = elementInfo.type === "MASTER";
        if (isMaster) {
          await this.loadMasterElement(elementInfo.name, currentElement);
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
      case SEEK_HEAD_ElEMENT_NAME.SEEK:
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
