const { EBML_HEADER_ElEMENT_INFO } = require("./constants/EBMLHeader");

class EBMLHeader {
  constructor(element, dataInterface) {
    this.dataInterface = dataInterface;
    this.size = element.size;
    this.offset = element.offset;
    this.end = element.end;
    this.loaded = false;

    this.EBMLVersion = null;
    this.EBMLReadVersion = null;
    this.EBMLMaxIdLength = null;
    this.EBMLMaxSizeLength = null;
    this.docType = null;
    this.docTypeVersion = null;
    this.docTypeReadVersion = null;
  }

  async load() {
    let currentElement = null;
    while (this.dataInterface.offset < this.end) {
      if (!currentElement) {
        currentElement = await this.dataInterface.peekElement();
        if (currentElement === null) return;
      }
      const elementInfo = EBML_HEADER_ElEMENT_INFO[currentElement.id];
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
      EBMLVersion: this.EBMLVersion,
      EBMLReadVersion: this.EBMLReadVersion,
      EBMLMaxIdLength: this.EBMLMaxIdLength,
      EBMLMaxSizeLength: this.EBMLMaxSizeLength,
      docType: this.docType,
      docTypeVersion: this.docTypeVersion,
      docTypeReadVersion: this.docTypeReadVersion,
    };
  }
}

module.exports = EBMLHeader;
