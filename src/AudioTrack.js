const Track = require("./Track");

class AudioTrack extends Track {
  constructor(trackHeader, dataInterface) {
    super();
    this.dataInterface = dataInterface;
    this.offset = trackHeader.offset;
    this.size = trackHeader.size;
    this.end = trackHeader.end;
    this.loaded = false;
    this.rate = null;
    this.channel = null;
    this.bitDepth = null;
  }

  async load() {
    while (this.dataInterface.offset < this.end) {
      if (!this.currentElement) {
        this.currentElement = await this.dataInterface.peekElement();
        if (this.currentElement === null) return;
      }
      switch (this.currentElement.id) {
        //TODO add duration and title
        case 0xb5: // Sample Frequency //TODO: MAKE FLOAT
          const rate = await this.dataInterface.readFloat(
            this.currentElement.size
          );
          if (rate !== null) this.rate = rate;
          else return;
          break;
        case 0x9f: // Channels
          const channels = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (channels !== null) this.channels = channels;
          else return;
          break;
        case 0x6264: // bitDepth
          const bitDepth = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (bitDepth !== null) this.bitDepth = bitDepth;
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

module.exports = AudioTrack;
