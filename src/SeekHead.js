const Seek = require("./Seek");

class SeekHead {
  constructor(seekHeadHeader, dataInterface) {
    this.dataInterface = dataInterface;
    this.offset = seekHeadHeader.offset;
    this.size = seekHeadHeader.size;
    this.end = seekHeadHeader.end;
    this.entries = [];
    this.loaded = false;
    this.tempEntry = null;
    this.currentElement = null;
  }

  async load() {
    while (this.dataInterface.offset < this.end) {
      if (!this.currentElement) {
        this.currentElement = await this.dataInterface.peekElement();
        if (this.currentElement === null) return;
      }
      switch (this.currentElement.id) {
        case 0x4dbb: // Seek
          if (!this.tempEntry)
            this.tempEntry = new Seek(this.currentElement, this.dataInterface);
          await this.tempEntry.load();
          if (!this.tempEntry.loaded) return;
          else this.entries.push(this.tempEntry);
          break;
        case 0xbf: // CRC-32
          const crc = await this.dataInterface.getBinary(
            this.currentElement.size
          );
          if (crc !== null) crc;
          else return;
          break;
        // TODO, ADD VOID
        default:
          const skipped = await this.dataInterface.skipBytes(
            this.currentElement.size
          );
          if (skipped === false) {
            return;
          }
          break;
      }
      this.tempEntry = null;
      this.currentElement = null;
    }
    this.loaded = true;
  }
}

module.exports = SeekHead;
