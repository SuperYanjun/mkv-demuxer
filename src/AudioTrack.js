const {
  AUDIO_TRACK_ELEMENT_INFO,
  AUDIO_TRACK_ELEMENT_NAME,
} = require("./constants/Tracks");
const Element = require("./Element");
class AudioTrack extends Element {
  constructor(element, dataInterface) {
    super(element, dataInterface);
    this.samplingFrequency = null;
    this.outputSamplingFrequency = null;
    this.channels = null;
    this.channelPositions = null;
    this.bitDepth = null;
    this.emphasis = null;
  }

  async load() {
    await super.load(AUDIO_TRACK_ELEMENT_INFO);
  }

  getData() {
    return {
      samplingFrequency: this.samplingFrequency,
      outputSamplingFrequency: this.outputSamplingFrequency,
      channels: this.channels,
      channelPositions: this.channelPositions,
      bitDepth: this.bitDepth,
      emphasis: this.emphasis,
    };
  }
}

module.exports = AudioTrack;
