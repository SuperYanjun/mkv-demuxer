const {
  TRACKS_ELEMENT_INFO,
  TRACKS_ELEMENT_NAME,
} = require("./constants/Tracks");
const Track = require("./Track");
const Element = require("./Element");
class Tracks extends Element {
  constructor(element, dataInterface) {
    super(element, dataInterface);
    this.trackEntries = [];
  }

  async load() {
    await super.load(TRACKS_ELEMENT_INFO);
  }

  async loadMasterElement(name, currentElement) {
    switch (name) {
      case TRACKS_ELEMENT_NAME.TRACK:
        const track = new Track(currentElement, this.dataInterface);
        await track.load();
        if (!track.loaded) {
          return;
        }
        this.trackEntries.push(track.getData());
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
    return this.trackEntries;
  }
}

module.exports = Tracks;