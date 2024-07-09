const { SEEK_ElEMENT_INFO } = require("./constants/SeekHead");
class Seek {
  constructor(seekHeader, dataInterface) {
    this.dataInterface = dataInterface;
    this.size = seekHeader.size;
    this.offset = seekHeader.offset;
    this.end = seekHeader.end;
    this.loaded = false;
    this.seekId = null;
    this.seekPosition = null;
  }

  async load() {
    let currentElement = null;
    while (this.dataInterface.offset < this.end) {
      if (!currentElement) {
        currentElement = await this.dataInterface.peekElement();
        if (currentElement === null) return;
      }
      const elementInfo = SEEK_ElEMENT_INFO[currentElement.id];
      if (elementInfo) {
        const data = await this.dataInterface.readAs(
          elementInfo.type,
          currentElement.size
        );
        this[elementInfo.name] = data || null;
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

  getData() {
    return {
      seekId: this.seekId,
      seekPosition: this.seekPosition,
    };
  }
}

module.exports = Seek;
