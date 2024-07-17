const {
  TRACK_ELEMENT_INFO,
  TRACK_ELEMENT_NAME,
} = require("./constants/Tracks");
const VideoTrack = require("./VideoTrack");
const AudioTrack = require("./AudioTrack");
const Element = require("./Element");
class Track extends Element {
  constructor(element, dataInterface) {
    super(element, dataInterface);
    this.videoTrack = null;
    this.audioTrack = null;
    this.trackNumber = null;
    this.trackUid = null;
    this.trackType = null;
    this.flagEnabled = null;
    this.flagLacing = null;
    this.flagForced = null;
    this.defaultDuration = null;
    this.name = null;
    this.language = null;
    this.codecId = null;
    this.codecPrivate = null;
    this.codecName = null;
    this.codecDelay = null;
    this.seekPreRoll = null;
    this.minCache = null;
    this.maxCache = null;
  }

  async load() {
    await super.load(TRACK_ELEMENT_INFO);
  }

  async loadMasterElement(name, currentElement) {
    switch (name) {
      case TRACK_ELEMENT_NAME.VIDEO_TRACK:
        const videoTrack = new VideoTrack(currentElement, this.dataInterface);
        await videoTrack.load();
        if (!videoTrack.loaded) {
          return;
        }
        this.videoTrack = videoTrack.getData();
        break;
      case TRACK_ELEMENT_NAME.AUDIO_TRACK:
        const audioTrack = new AudioTrack(currentElement, this.dataInterface);
        await audioTrack.load();
        if (!audioTrack.loaded) {
          return;
        }
        this.audioTrack = audioTrack.getData();
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
    return {
      videoTrack: this.videoTrack,
      audioTrack: this.audioTrack,
      trackNumber: this.trackNumber,
      trackUid: this.trackUid,
      trackType: this.trackType,
      flagEnabled: this.flagEnabled,
      flagLacing: this.flagLacing,
      flagForced: this.flagForced,
      defaultDuration: this.defaultDuration,
      name: this.name,
      language: this.language,
      codecId: this.codecId,
      codecPrivate: this.codecPrivate,
      codecName: this.codecName,
      codecDelay: this.codecDelay,
      seekPreRoll: this.seekPreRoll,
      minCache: this.minCache,
      maxCache: this.maxCache,
    };
  }
}

module.exports = Track;
