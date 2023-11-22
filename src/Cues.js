const CueTrackPositions = require("./CueTrackPositions");

class Cues {
  constructor(cuesHeader, dataInterface, demuxer) {
    this.dataInterface = dataInterface;
    this.offset = cuesHeader.offset;
    this.size = cuesHeader.size;
    this.end = cuesHeader.end;
    this.entries = [];
    this.loaded = false;
    this.tempEntry = null;
    this.demuxer = demuxer;
    this.currentElement = null;
  }

  async load() {
    const end = this.end;
    while (this.dataInterface.offset < end) {
      if (!this.currentElement) {
        this.currentElement = await this.dataInterface.peekElement();
        if (this.currentElement === null) return;
      }
      switch (this.currentElement.id) {
        case 0xbb: // CuePoint
          if (!this.tempEntry)
            this.tempEntry = new CuePoint(
              this.currentElement,
              this.dataInterface
            );
          await this.tempEntry.load();
          if (!this.tempEntry.loaded) return;
          else this.entries.push(this.tempEntry);
          break;
        case 0xbf: //CRC-32
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
      this.tempEntry = null;
      this.currentElement = null;
    }
    this.loaded = true;
  }
}

class CuePoint {
  constructor(cuesPointHeader, dataInterface) {
    this.dataInterface = dataInterface;
    this.offset = cuesPointHeader.offset;
    this.size = cuesPointHeader.size;
    this.end = cuesPointHeader.end;
    this.loaded = false;
    this.currentElement = null;
    this.cueTime = null;
    this.cueTrackPositions = null;
  }

  async load() {
    const end = this.end;
    while (this.dataInterface.offset < end) {
      if (!this.currentElement) {
        this.currentElement = await this.dataInterface.peekElement();
        if (this.currentElement === null) return;
      }
      switch (this.currentElement.id) {
        case 0xb7: // Cue Track Positions
          if (!this.cueTrackPositions)
            this.cueTrackPositions = new CueTrackPositions(
              this.currentElement,
              this.dataInterface
            );
          await this.cueTrackPositions.load();
          if (!this.cueTrackPositions.loaded) return;
          break;
        case 0xb3: // Cue Time
          var cueTime = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (cueTime !== null) this.cueTime = cueTime;
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

module.exports = Cues;
