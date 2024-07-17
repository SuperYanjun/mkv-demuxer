const { EBML_HEADER_ELEMENT_INFO } = require("./constants/EBMLHeader");
const Element = require("./Element");

class EBMLHeader extends Element {
  constructor(element, dataInterface) {
    super(element, dataInterface);

    this.EBMLVersion = null;
    this.EBMLReadVersion = null;
    this.EBMLMaxIdLength = null;
    this.EBMLMaxSizeLength = null;
    this.docType = null;
    this.docTypeVersion = null;
    this.docTypeReadVersion = null;
  }

  async load() {
    await super.load(EBML_HEADER_ELEMENT_INFO);
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
