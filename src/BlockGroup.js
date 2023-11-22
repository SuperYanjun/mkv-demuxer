class BlockGroup {
  constructor(blockGroupHeader, dataInterface) {
    this.dataInterface = dataInterface;
    this.offset = blockGroupHeader.offset;
    this.size = blockGroupHeader.size;
    this.end = blockGroupHeader.end;
    this.loaded = false;
    this.tempElement = null;
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
        case 0xa1: //Block
          const block = await this.dataInterface.getBinary(
            this.currentElement.size
          );
          if (block !== null) block;
          else return;
          break;
        case 0x9b: //BlockDuration
          const blockDuration = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (blockDuration !== null) this.blockDuration = blockDuration;
          else return;
          break;
        case 0xfb: //ReferenceBlock
          const referenceBlock = await this.dataInterface.readSignedInt(
            this.currentElement.size
          );
          if (referenceBlock !== null) this.referenceBlock = referenceBlock;
          else return;
          break;
        case 0x75a2: //DiscardPadding
          const discardPadding = await this.dataInterface.readSignedInt(
            this.currentElement.size
          );
          if (discardPadding !== null) this.discardPadding = discardPadding;
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

module.exports = BlockGroup;
