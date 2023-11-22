const Track = require("./Track.js");

class VideoTrack extends Track {
  constructor(trackHeader, dataInterface) {
    super();
    this.dataInterface = dataInterface;
    this.offset = trackHeader.offset;
    this.size = trackHeader.size;
    this.end = trackHeader.end;
    this.loaded = false;
    this.width = null;
    this.height = null;
    this.displayWidth = null;
    this.displayHeight = null;
    this.displayUnit = 0;
    this.stereoMode = null;
    this.frameRate = null;
    this.pixelCropBottom = 0;
    this.pixelCropTop = 0;
    this.pixelCropLeft = 0;
    this.pixelCropRight = 0;
  }

  async load() {
    while (this.dataInterface.offset < this.end) {
      if (!this.currentElement) {
        this.currentElement = await this.dataInterface.peekElement();
        if (this.currentElement === null) return;
      }
      switch (this.currentElement.id) {
        // TODO add color
        case 0xb0: {
          // Pixel width
          const width = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (width !== null) {
            this.width = width;
          } else {
            return;
          }
          break;
        }
        case 0xba: {
          // Pixel Height
          const height = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (height !== null) {
            this.height = height;
          } else {
            return;
          }
          break;
        }
        case 0x54b0: {
          // Display width
          const displayWidth = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (displayWidth !== null) {
            this.displayWidth = displayWidth;
          } else {
            return;
          }
          break;
        }
        case 0x54ba: {
          // Display height
          const displayHeight = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (displayHeight !== null) {
            this.displayHeight = displayHeight;
          } else {
            return;
          }
          break;
        }
        case 0x54b2: {
          // Display unit
          const displayUnit = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (displayUnit !== null) {
            this.displayUnit = displayUnit;
          } else {
            return;
          }
          break;
        }
        case 0x53b8: {
          // Stereo mode
          const stereoMode = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (stereoMode !== null) {
            this.stereoMode = stereoMode;
          } else {
            return;
          }
          break;
        }
        case 0x2383e3: {
          // FRAME RATE - NEEDS TO BE FLOAT
          const frameRate = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (frameRate !== null) {
            this.frameRate = frameRate;
          } else {
            return;
          }
          break;
        }
        case 0x9a: {
          // FlagInterlaced
          const flagInterlaced = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (flagInterlaced !== null) {
            this.flagInterlaced = flagInterlaced;
          } else {
            return;
          }
          break;
        }
        case 0x55b0: {
          // Color
          const colours = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          break;
        }
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
    if (!this.displayWidth) {
      this.displayWidth = this.width - this.pixelCropLeft; // - Math.PI;
    }
    if (!this.displayHeight) {
      this.displayHeight = this.height - this.pixelCropTop; // - Math.PI;
    }
    this.loaded = true;
  }
}

module.exports = VideoTrack;
