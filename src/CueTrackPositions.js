class CueTrackPositions {
  constructor(cuesPointHeader, dataInterface) {
    this.dataInterface = dataInterface;
    this.offset = cuesPointHeader.offset;
    this.size = cuesPointHeader.size;
    this.end = cuesPointHeader.end;
    this.loaded = false;
    this.currentElement = null;
    this.cueTrack = null;
    this.cueClusterPosition = 0;
    this.cueRelativePosition = 0;
  }

  async load() {
    while (this.dataInterface.offset < this.end) {
      if (!this.currentElement) {
        this.currentElement = await this.dataInterface.peekElement();
        if (this.currentElement === null) return;
      }
      switch (this.currentElement.id) {
        case 0xf7: // CueTrack
          const cueTrack = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (cueTrack !== null) this.cueTrack = cueTrack;
          else return;
          break;
        case 0xf1: // Cue ClusterPosition
          var cueClusterPosition = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (cueClusterPosition !== null)
            this.cueClusterPosition = cueClusterPosition;
          else return;
          break;
        case 0xf0: // CueRelativePosition
          var cueRelativePosition = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (cueRelativePosition !== null)
            this.cueRelativePosition = cueRelativePosition;
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

module.exports = CueTrackPositions;
