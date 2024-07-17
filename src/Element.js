class Element {
  constructor(element, dataInterface, demuxer) {
    this.dataInterface = dataInterface;
    this.size = element.size;
    this.offset = element.offset;
    this.end = element.end;
    this.demuxer = demuxer;
    this.loaded = false;
  }

  async load(ELEMENT_INFO_MAP) {
    let currentElement = null;
    while (this.dataInterface.offset < this.end) {
      if (!currentElement) {
        currentElement = await this.dataInterface.peekElement();
        if (currentElement === null) return;
      }
      const elementInfo = ELEMENT_INFO_MAP[currentElement.id];
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

  async loadMasterElement(name, currentElement) {}

  getData() {}
}

module.exports = Element;
