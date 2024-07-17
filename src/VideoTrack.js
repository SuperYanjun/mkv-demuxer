const {
  VIDEO_TRACK_ELEMENT_INFO,
  VIDEO_TRACK_ELEMENT_NAME,
} = require("./constants/Tracks");
const Element = require("./Element");

class VideoTrack extends Element {
  constructor(element, dataInterface) {
    super(element, dataInterface);
    this.flagInterlaced = null;
    this.fieldOrder = null;
    this.stereoMode = null;
    this.alphaMode = null;
    this.oldStereoMode = null;
    this.pixelWidth = null;
    this.pixelHeight = null;
    this.pixelCropBottom = null;
    this.pixelCropTop = null;
    this.pixelCropLeft = null;
    this.pixelCropRight = null;
    this.displayWidth = null;
    this.displayHeight = null;
    this.displayUnit = null;
    this.aspectRatioType = null;
    this.uncompressedFourCC = null;
    this.gammaValue = null;
    this.frameRate = null;
    this.colour = null;
    this.projection = null;
  }

  async load() {
    await super.load(VIDEO_TRACK_ELEMENT_INFO);
  }

  getData() {
    return {
      flagInterlaced: this.flagInterlaced,
      fieldOrder: this.fieldOrder,
      stereoMode: this.stereoMode,
      alphaMode: this.alphaMode,
      oldStereoMode: this.oldStereoMode,
      pixelWidth: this.pixelWidth,
      pixelHeight: this.pixelHeight,
      pixelCropBottom: this.pixelCropBottom,
      pixelCropTop: this.pixelCropTop,
      pixelCropLeft: this.pixelCropLeft,
      pixelCropRight: this.pixelCropRight,
      displayWidth: this.displayWidth,
      displayHeight: this.displayHeight,
      displayUnit: this.displayUnit,
      aspectRatioType: this.aspectRatioType,
      uncompressedFourCC: this.uncompressedFourCC,
      gammaValue: this.gammaValue,
      frameRate: this.frameRate,
      colour: this.colour,
      projection: this.projection,
    };
  }
}

module.exports = VideoTrack;
