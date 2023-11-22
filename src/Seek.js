class Seek {
  constructor(seekHeader, dataInterface) {
    this.size = seekHeader.size;
    this.offset = seekHeader.offset;
    this.end = seekHeader.end;
    this.dataInterface = dataInterface;
    this.loaded = false;
    this.currentElement = null;
    this.seekId = -1;
    this.seekPosition = -1;
  }

  async load() {
    while (this.dataInterface.offset < this.end) {
      if (!this.currentElement) {
        this.currentElement = await this.dataInterface.peekElement();
        if (this.currentElement === null) return;
      }
      switch (this.currentElement.id) {
        case 0x53ab: {
          // SeekId
          const seekId = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (seekId !== null) {
            this.seekId = seekId;
          } else {
            return;
          }
          break;
        }
        case 0x53ac: {
          // SeekPosition
          const seekPosition = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (seekPosition !== null) {
            this.seekPosition = seekPosition;
          } else {
            return;
          }
          break;
        }
        case 0xbf: // CRC-32
          var crc = await this.dataInterface.getBinary(
            this.currentElement.size
          );
          if (crc !== null) crc;
          else return;
          break;
        default:
          const skipped = await this.dataInterface.skipBytes(
            this.currentElement.size
          );
          if (skipped === false) {
            return;
          }
          break;
      }
      this.currentElement = null;
    }
    this.loaded = true;
  }
}

module.exports = Seek;
