const AudioTrack = require("./AudioTrack");
const VideoTrack = require("./VideoTrack");
const Track = require("./Track");

class Tracks {
  constructor(seekHeadHeader, dataInterface, demuxer) {
    this.demuxer = demuxer;
    this.dataInterface = dataInterface;
    this.offset = seekHeadHeader.offset;
    this.size = seekHeadHeader.size;
    this.end = seekHeadHeader.end;
    this.trackEntries = [];
    this.loaded = false;
    this.currentElement = null;
    this.trackLoader = null;
  }

  async load() {
    while (this.dataInterface.offset < this.end) {
      if (!this.currentElement) {
        this.currentElement = await this.dataInterface.peekElement();
        if (this.currentElement === null) return;
      }
      switch (this.currentElement.id) {
        case 0xae: //Track Entry
          if (!this.trackLoader)
            this.trackLoader = new TrackLoader(
              this.currentElement,
              this.dataInterface
            );
          await this.trackLoader.load();
          if (!this.trackLoader.loaded) {
            return;
          } else {
            const trackEntry = this.trackLoader.getTrackEntry();
            this.trackLoader = null;
            this.trackEntries.push(trackEntry);
          }
          break;
        case 0xbf: //CRC-32
          const crc = await this.dataInterface.getBinary(
            this.currentElement.size
          );
          if (crc !== null) crc;
          //this.docTypeReadVersion = docTypeReadVersion;
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

/**
 * @classdesc The TrackLoader class is a helper class to load the Track subelement types. Since the layout
 * of the Track entries is a little odd, it needs to parse the current
 * level data plus the track container which can be either audio video, content encodings, and maybe subtitles.
 */
class TrackLoader {
  constructor(trackheader, dataInterface) {
    this.dataInterface = dataInterface;
    this.offset = trackheader.offset;
    this.size = trackheader.size;
    this.end = trackheader.end;
    this.loaded = false;
    this.trackData = {
      trackNumber: null,
      trackType: null,
      name: null,
      codecName: null,
      defaultDuration: null,
      codecID: null,
      lacing: null,
      codecPrivate: null,
      codecDelay: null,
      seekPreRoll: null,
      trackUID: null,
    };
    this.tempTrack = null;
    this.minCache = null;
  }

  async load() {
    const end = this.end;
    while (this.dataInterface.offset < end) {
      if (!this.currentElement) {
        this.currentElement = await this.dataInterface.peekElement();
        if (this.currentElement === null) return;
      }
      switch (this.currentElement.id) {
        // TODO support content encodings
        case 0xe0: // Video Track
          if (!this.tempTrack)
            this.tempTrack = new VideoTrack(
              this.currentElement,
              this.dataInterface
            );
          await this.tempTrack.load();
          if (!this.tempTrack.loaded) return;
          break;
        case 0xe1: // Audio Number
          if (!this.tempTrack)
            this.tempTrack = new AudioTrack(
              this.currentElement,
              this.dataInterface
            );
          await this.tempTrack.load();
          if (!this.tempTrack.loaded) return;
          break;
        case 0xd7: {
          // Track Number
          const trackNumber = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (trackNumber !== null) {
            this.trackData.trackNumber = trackNumber;
          } else {
            return;
          }
          break;
        }
        case 0x83: {
          // TrackType
          const trackType = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (trackType !== null) {
            this.trackData.trackType = trackType;
          } else {
            return;
          }
          break;
        }
        case 0x536e: {
          // Name
          const name = await this.dataInterface.readString(
            this.currentElement.size
          );
          if (name !== null) {
            this.trackData.name = name;
          } else {
            return;
          }
          break;
        }
        case 0x258688: {
          // CodecName
          const codecName = await this.dataInterface.readString(
            this.currentElement.size
          );
          if (codecName !== null) {
            this.trackData.codecName = codecName;
          } else {
            return;
          }
          break;
        }
        case 0x22b59c: // Language
          const language = await this.dataInterface.readString(
            this.currentElement.size
          );
          if (language !== null) this.trackData.language = language;
          else return;
          break;
        case 0x23e383: // DefaultDuration
          const defaultDuration = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (defaultDuration !== null)
            this.trackData.defaultDuration = defaultDuration;
          else return;
          break;
        case 0x86: // CodecId
          const codecID = await this.dataInterface.readString(
            this.currentElement.size
          );
          if (codecID !== null) this.trackData.codecID = codecID;
          else return;
          break;
        case 0x9c: // FlagLacing
          const lacing = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (lacing !== null) this.trackData.lacing = lacing;
          else return;
          break;
        case 0xb9: // FlagEnabled
          const flagEnabled = await this.dataInterface.getBinary(
            this.currentElement.size
          );
          if (flagEnabled !== null) {
            this.trackData.flagEnabled = flagEnabled;
          } else {
            return;
          }
          break;
        case 0x55aa: // FlagForced
          const flagForced = await this.dataInterface.getBinary(
            this.currentElement.size
          );
          if (flagForced !== null) {
            this.trackData.flagForced = flagForced;
          } else {
            return;
          }
          break;
        case 0x63a2: // Codec Private
          const codecPrivate = await this.dataInterface.getBinary(
            this.currentElement.size
          );
          if (codecPrivate !== null) {
            this.trackData.codecPrivate = codecPrivate;
          } else {
            return;
          }
          break;
        case 0x56aa: // Codec Delay
          const codecDelay = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (codecDelay !== null) this.trackData.codecDelay = codecDelay;
          else return;
          break;
        case 0x56bb: //Pre Seek Roll
          const seekPreRoll = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (seekPreRoll !== null) this.trackData.seekPreRoll = seekPreRoll;
          else return;
          break;
        case 0x73c5: // Track UID
          const trackUID = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (trackUID !== null) this.trackData.trackUID = trackUID;
          else return;
          break;
        case 0x6de7: // MinCache
          const minCache = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (minCache !== null) this.trackData.minCache = minCache;
          else return;
          break;
        case 0xbf: // CRC-32
          const crc = await this.dataInterface.getBinary(
            this.currentElement.size
          );
          if (crc !== null) crc;
          else return;
          break;
        case 0x88: // CRC-32
          const flagDefault = await this.dataInterface.readUnsignedInt(
            this.currentElement.size
          );
          if (flagDefault !== null) this.flagDefault = flagDefault;
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

  getTrackEntry() {
    this.tempTrack = this.tempTrack || new Track();
    this.tempTrack.loadMeta(this.trackData);
    const tempTrack = this.tempTrack;
    this.tempTrack = null;
    return tempTrack;
  }
}

module.exports = Tracks;
