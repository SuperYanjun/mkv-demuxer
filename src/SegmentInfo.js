class SegmentInfo {
  constructor(infoHeader, dataInterface) {
    this.dataInterface = dataInterface;
    this.offset = infoHeader.offset;
    this.size = infoHeader.size;
    this.end = infoHeader.end;
    this.muxingApp = null;
    this.writingApp = null;
    this.title = null;
    this.dataOffset = null;
    this.timecodeScale = 1000000;
    this.duration = -1;
    this.loaded = false;
    this.segmentUID = null;
    this.duration = null;
    this.dateUTC;
  }

  async load() {
    while (this.dataInterface.offset < this.end) {
      if (!this.currentElement) {
        this.currentElement = await this.dataInterface.peekElement();
        if (this.currentElement === null) return;
      }
      switch (this.currentElement.id) {
        //TODO add duration and title
        case 0x2ad7b1:
          // TimeCodeScale
          const timecodeScale = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (timecodeScale !== null) {
            this.timecodeScale = timecodeScale;
          } else {
            return;
          }
          break;
        case 0x4d80: // Muxing App
          const muxingApp = await this.dataInterface.readString(
            this.currentElement.size
          );
          if (muxingApp !== null) this.muxingApp = muxingApp;
          else return;
          break;
        case 0x5741: // writing App
          const writingApp = await this.dataInterface.readString(
            this.currentElement.size
          );
          if (writingApp !== null) this.writingApp = writingApp;
          else return;
          break;
        case 0x7ba9: // title
          const title = await this.dataInterface.readString(
            this.currentElement.size
          );
          if (title !== null) this.title = title;
          else return;
          break;
        case 0x73a4: // segmentUID
          // TODO, LOAD THIS AS A BINARY ARRAY, SHOULD BE 128 BIT UNIQUE ID
          const segmentUID = await this.dataInterface.readString(
            this.currentElement.size
          );
          if (segmentUID !== null) this.segmentUID = segmentUID;
          else return;
          break;
        case 0x4489: // duration
          const duration = await this.dataInterface.readFloat(
            this.currentElement.size
          );
          if (duration !== null) this.duration = duration;
          else return;
          break;

        case 0x4461: // DateUTC
          const dateUTC = await this.dataInterface.readDate(
            this.currentElement.size
          );
          if (dateUTC !== null) this.dateUTC = dateUTC;
          else return;
          break;

        case 0xbf: // CRC-32
          const crc = await this.dataInterface.getBinary(
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

module.exports = SegmentInfo;
