const { SEEK_ELEMENT_INFO } = require("./constants/SeekHead");
const Element = require("./Element");
class Seek extends Element {
  constructor(element, dataInterface) {
    super(element, dataInterface);

    this.seekId = null;
    this.seekPosition = null;
  }

  async load() {
    await super.load(SEEK_ELEMENT_INFO);
  }

  getData() {
    return {
      seekId: this.seekId,
      seekPosition: this.seekPosition,
    };
  }
}

module.exports = Seek;
