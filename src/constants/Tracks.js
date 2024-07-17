const { DATA_TYPE } = require("./common");

const TRACKS_ELEMENT_NAME = {
  TRACK: "track",
};

const TRACKS_ELEMENT_INFO = {
  0xae: { name: TRACKS_ELEMENT_NAME.TRACK, type: DATA_TYPE.MASTER },
};
const TRACK_ELEMENT_NAME = {
  VIDEO_TRACK: "videoTrack",
  AUDIO_TRACK: "audioTrack",
  TRACK_NUMBER: "trackNumber",
  TRACK_UID: "trackUid",
  TRACK_TYPE: "trackType",
  FLAG_ENABLED: "flagEnabled",
  FLAG_LACING: "flagLacing",
  FLAG_FORCED: "flagForced",
  DEFAULT_DURATION: "defaultDuration",
  NAME: "name",
  LANGUAGE: "language",
  CODEC_ID: "codecId",
  CODEC_PRIVATE: "codecPrivate",
  CODEC_NAME: "codecName",
  CODEC_DELAY: "codecDelay",
  SEEK_PRE_ROLL: "seekPreRoll",
  MIN_CACHE: "minCache",
  MAX_CACHE: "maxCache",
};

const TRACK_ELEMENT_INFO = {
  0xe0: { name: TRACK_ELEMENT_NAME.VIDEO_TRACK, type: DATA_TYPE.MASTER },
  0xe1: { name: TRACK_ELEMENT_NAME.AUDIO_TRACK, type: DATA_TYPE.MASTER },
  0xd7: { name: TRACK_ELEMENT_NAME.TRACK_NUMBER, type: DATA_TYPE.UNSIGNED_INT },
  0x73c5: {
    name: TRACK_ELEMENT_NAME.TRACK_UID,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x83: { name: TRACK_ELEMENT_NAME.TRACK_TYPE, type: DATA_TYPE.UNSIGNED_INT },
  0xb9: { name: TRACK_ELEMENT_NAME.FLAG_ENABLED, type: DATA_TYPE.UNSIGNED_INT },
  0x9c: { name: TRACK_ELEMENT_NAME.FLAG_LACING, type: DATA_TYPE.UNSIGNED_INT },
  0x55aa: {
    name: TRACK_ELEMENT_NAME.FLAG_FORCED,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x23e383: {
    name: TRACK_ELEMENT_NAME.DEFAULT_DURATION,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x536e: { name: TRACK_ELEMENT_NAME.NAME, type: DATA_TYPE.UTF8 },
  0x22b59c: { name: TRACK_ELEMENT_NAME.LANGUAGE, type: DATA_TYPE.STRING },
  0x86: { name: TRACK_ELEMENT_NAME.CODEC_ID, type: DATA_TYPE.STRING },
  0x63a2: { name: TRACK_ELEMENT_NAME.CODEC_PRIVATE, type: DATA_TYPE.BINARY },
  0x258688: { name: TRACK_ELEMENT_NAME.CODEC_NAME, type: DATA_TYPE.UTF8 },
  0x56aa: {
    name: TRACK_ELEMENT_NAME.CODEC_DELAY,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x56bb: {
    name: TRACK_ELEMENT_NAME.SEEK_PRE_ROLL,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x6de7: { name: TRACK_ELEMENT_NAME.MIN_CACHE, type: DATA_TYPE.UNSIGNED_INT },
  0x6df8: { name: TRACK_ELEMENT_NAME.MAX_CACHE, type: DATA_TYPE.UNSIGNED_INT },
};

const VIDEO_TRACK_ELEMENT_NAME = {
  FLAG_INTERLACED: "flagInterlaced",
  FIELD_ORDER: "fieldOrder",
  STEREO_MODE: "stereoMode",
  ALPHA_MODE: "alphaMode",
  OLD_STEREO_MODE: "oldStereoMode",
  PIXEL_WIDTH: "pixelWidth",
  PIXEL_HEIGHT: "pixelHeight",
  PIXEL_CROP_BOTTOM: "pixelCropBottom",
  PIXEL_CROP_TOP: "pixelCropTop",
  PIXEL_CROP_LEFT: "pixelCropLeft",
  PIXEL_CROP_RIGHT: "pixelCropRight",
  DISPLAY_WIDTH: "displayWidth",
  DISPLAY_HEIGHT: "displayHeight",
  DISPLAY_UNIT: "displayUnit",
  ASPECT_RATIO_TYPE: "aspectRatioType",
  UNCOMPRESSED_FOUR_CC: "uncompressedFourCC",
  GAMMA_VALUE: "gammaValue",
  FRAME_RATE: "frameRate",
  COLOUR: "colour",
  PROJECTION: "projection",
};

const VIDEO_TRACK_ELEMENT_INFO = {
  0x9a: {
    name: VIDEO_TRACK_ELEMENT_NAME.FLAG_INTERLACED,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x9d: {
    name: VIDEO_TRACK_ELEMENT_NAME.FIELD_ORDER,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x53b8: {
    name: VIDEO_TRACK_ELEMENT_NAME.STEREO_MODE,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x53c0: {
    name: VIDEO_TRACK_ELEMENT_NAME.ALPHA_MODE,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x53b9: {
    name: VIDEO_TRACK_ELEMENT_NAME.OLD_STEREO_MODE,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0xb0: {
    name: VIDEO_TRACK_ELEMENT_NAME.PIXEL_WIDTH,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0xba: {
    name: VIDEO_TRACK_ELEMENT_NAME.PIXEL_HEIGHT,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x54aa: {
    name: VIDEO_TRACK_ELEMENT_NAME.PIXEL_CROP_BOTTOM,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x54bb: {
    name: VIDEO_TRACK_ELEMENT_NAME.PIXEL_CROP_TOP,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x54cc: {
    name: VIDEO_TRACK_ELEMENT_NAME.PIXEL_CROP_LEFT,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x54dd: {
    name: VIDEO_TRACK_ELEMENT_NAME.PIXEL_CROP_RIGHT,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x54b0: {
    name: VIDEO_TRACK_ELEMENT_NAME.DISPLAY_WIDTH,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x54ba: {
    name: VIDEO_TRACK_ELEMENT_NAME.DISPLAY_HEIGHT,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x54b2: {
    name: VIDEO_TRACK_ELEMENT_NAME.DISPLAY_UNIT,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x54b3: {
    name: VIDEO_TRACK_ELEMENT_NAME.ASPECT_RATIO_TYPE,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x2eb524: {
    name: VIDEO_TRACK_ELEMENT_NAME.UNCOMPRESSED_FOUR_CC,
    type: DATA_TYPE.BINARY,
  },
  0x2fb523: {
    name: VIDEO_TRACK_ELEMENT_NAME.GAMMA_VALUE,
    type: DATA_TYPE.FLOAT,
  },
  0x2383e3: {
    name: VIDEO_TRACK_ELEMENT_NAME.FRAME_RATE,
    type: DATA_TYPE.FLOAT,
  },
  0x55b0: { name: VIDEO_TRACK_ELEMENT_NAME.COLOUR, type: DATA_TYPE.MASTER },
  0x55d0: { name: VIDEO_TRACK_ELEMENT_NAME.PROJECTION, type: DATA_TYPE.MASTER },
};

const AUDIO_TRACK_ELEMENT_NAME = {
  SAMPLING_FREQUENCY: "samplingFrequency",
  OUTPUT_SAMPLING_FREQUENCY: "outputSamplingFrequency",
  CHANNELS: "channels",
  CHANNEL_POSITIONS: "channelPositions",
  BIT_DEPTH: "bitDepth",
  EMPHASIS: "emphasis",
};

const AUDIO_TRACK_ELEMENT_INFO = {
  0xb5: {
    name: AUDIO_TRACK_ELEMENT_NAME.SAMPLING_FREQUENCY,
    type: DATA_TYPE.FLOAT,
  },
  0x78b5: {
    name: AUDIO_TRACK_ELEMENT_NAME.OUTPUT_SAMPLING_FREQUENCY,
    type: DATA_TYPE.FLOAT,
  },
  0x9f: {
    name: AUDIO_TRACK_ELEMENT_NAME.CHANNELS,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x7d7b: {
    name: AUDIO_TRACK_ELEMENT_NAME.CHANNEL_POSITIONS,
    type: DATA_TYPE.BINARY,
  },
  0x6264: {
    name: AUDIO_TRACK_ELEMENT_NAME.BIT_DEPTH,
    type: DATA_TYPE.UNSIGNED_INT,
  },
  0x52f1: {
    name: AUDIO_TRACK_ELEMENT_NAME.EMPHASIS,
    type: DATA_TYPE.UNSIGNED_INT,
  },
};

// Audio  0xE1    master
// SamplingFrequency  0xB5    float
// OutputSamplingFrequency  0x78B5    float
// Channels  0x9F    uinteger
// ChannelPositions  0x7D7B    binary
// BitDepth  0x6264    uinteger
// Emphasis  0x52F1    uinteger

// TrackOperation  0xE2    master
// TrackCombinePlanes  0xE3    master
// TrackPlane  0xE4    master
// TrackPlaneUID  0xE5    uinteger
// TrackPlaneType  0xE6    uinteger
// TrackJoinBlocks  0xE9    master
// TrackJoinUID  0xED    uinteger
// TrickTrackUID  0xC0    uinteger
// TrickTrackSegmentUID  0xC1    binary
// TrickTrackFlag  0xC6    uinteger
// TrickMasterTrackUID  0xC7    uinteger
// TrickMasterTrackSegmentUID  0xC4    binary
// ContentEncodings  0x6D80    master
// ContentEncoding  0x6240    master
// ContentEncodingOrder  0x5031    uinteger
// ContentEncodingScope  0x5032    uinteger
// ContentEncodingType  0x5033    uinteger
// ContentCompression  0x5034    master
// ContentCompAlgo  0x4254    uinteger
// ContentCompSettings  0x4255    binary
// ContentEncryption  0x5035    master
// ContentEncAlgo  0x47E1    uinteger
// ContentEncKeyID  0x47E2    binary
// ContentEncAESSettings  0x47E7    master
// AESSettingsCipherMode  0x47E8    uinteger
// ContentSignature  0x47E3    binary
// ContentSigKeyID  0x47E4    binary
// ContentSigAlgo  0x47E5    uinteger
// ContentSigHashAlgo  0x47E6    uinteger

// Tracks  0x1654AE6B    master
// TrackEntry  0xAE    master
// TrackNumber  0xD7    uinteger
// TrackUID  0x73C5    uinteger
// TrackType  0x83    uinteger
// FlagEnabled  0xB9    uinteger
// FlagDefault  0x88    uinteger
// FlagForced  0x55AA    uinteger
// FlagHearingImpaired  0x55AB    uinteger
// FlagVisualImpaired  0x55AC    uinteger
// FlagTextDescriptions  0x55AD    uinteger
// FlagOriginal  0x55AE    uinteger
// FlagCommentary  0x55AF    uinteger
// FlagLacing  0x9C    uinteger
// MinCache  0x6DE7    uinteger
// MaxCache  0x6DF8    uinteger
// DefaultDuration  0x23E383    uinteger
// DefaultDecodedFieldDuration  0x234E7A    uinteger
// TrackTimestampScale  0x23314F    float
// TrackOffset  0x537F    integer
// MaxBlockAdditionID  0x55EE    uinteger
// BlockAdditionMapping  0x41E4    master
// BlockAddIDValue  0x41F0    uinteger
// BlockAddIDName  0x41A4    string
// BlockAddIDType  0x41E7    uinteger
// BlockAddIDExtraData  0x41ED    binary
// Name  0x536E    utf
// Language  0x22B59C    string
// LanguageBCP47  0x22B59D    string
// CodecID  0x86    string
// CodecPrivate  0x63A2    binary
// CodecName  0x258688    utf
// AttachmentLink  0x7446    uinteger
// CodecSettings  0x3A9697    utf
// CodecInfoURL  0x3B4040    string
// CodecDownloadURL  0x26B240    string
// CodecDecodeAll  0xAA    uinteger
// TrackOverlay  0x6FAB    uinteger
// CodecDelay  0x56AA    uinteger
// SeekPreRoll  0x56BB    uinteger
// TrackTranslate  0x6624    master
// TrackTranslateTrackID  0x66A5    binary
// TrackTranslateCodec  0x66BF    uinteger
// TrackTranslateEditionUID  0x66FC    uinteger

module.exports = {
  TRACKS_ELEMENT_NAME,
  TRACKS_ELEMENT_INFO,
  TRACK_ELEMENT_NAME,
  TRACK_ELEMENT_INFO,
  VIDEO_TRACK_ELEMENT_NAME,
  VIDEO_TRACK_ELEMENT_INFO,
  AUDIO_TRACK_ELEMENT_NAME,
  AUDIO_TRACK_ELEMENT_INFO,
};

// Video  0xE0    master
// FlagInterlaced  0x9A    uinteger
// FieldOrder  0x9D    uinteger
// StereoMode  0x53B8    uinteger
// AlphaMode  0x53C0    uinteger
// OldStereoMode  0x53B9    uinteger
// PixelWidth  0xB0    uinteger
// PixelHeight  0xBA    uinteger
// PixelCropBottom  0x54AA    uinteger
// PixelCropTop  0x54BB    uinteger
// PixelCropLeft  0x54CC    uinteger
// PixelCropRight  0x54DD    uinteger
// DisplayWidth  0x54B0    uinteger
// DisplayHeight  0x54BA    uinteger
// DisplayUnit  0x54B2    uinteger
// AspectRatioType  0x54B3    uinteger
// UncompressedFourCC  0x2EB524    binary
// GammaValue  0x2FB523    float
// FrameRate  0x2383E3    float
// Colour  0x55B0    master
// MatrixCoefficients  0x55B1    uinteger
// BitsPerChannel  0x55B2    uinteger
// ChromaSubsamplingHorz  0x55B3    uinteger
// ChromaSubsamplingVert  0x55B4    uinteger
// CbSubsamplingHorz  0x55B5    uinteger
// CbSubsamplingVert  0x55B6    uinteger
// ChromaSitingHorz  0x55B7    uinteger
// ChromaSitingVert  0x55B8    uinteger
// Range  0x55B9    uinteger
// TransferCharacteristics  0x55BA    uinteger
// Primaries  0x55BB    uinteger
// MaxCLL  0x55BC    uinteger
// MaxFALL  0x55BD    uinteger
// MasteringMetadata  0x55D0    master
// PrimaryRChromaticityX  0x55D1    float
// PrimaryRChromaticityY  0x55D2    float
// PrimaryGChromaticityX  0x55D3    float
// PrimaryGChromaticityY  0x55D4    float
// PrimaryBChromaticityX  0x55D5    float
// PrimaryBChromaticityY  0x55D6    float
// WhitePointChromaticityX  0x55D7    float
// WhitePointChromaticityY  0x55D8    float
// LuminanceMax  0x55D9    float
// LuminanceMin  0x55DA    float
// Projection  0x7670    master
// ProjectionType  0x7671    uinteger
// ProjectionPrivate  0x7672    binary
// ProjectionPoseYaw  0x7673    float
// ProjectionPosePitch  0x7674    float
// ProjectionPoseRoll  0x7675    float

// MATRIX_COEFFICIENTS: "matrixCoefficients",
// BITS_PER_CHANNEL: "bitsPerChannel",
// CHROMA_SUBSAMPLING_HORZ: "chromaSubsamplingHorz",
// CHROMA_SUBSAMPLING_VERT: "chromaSubsamplingVert",
// CB_SUBSAMPLING_HORZ: "cbSubsamplingHorz",
// CB_SUBSAMPLING_VERT: "cbSubsamplingVert",
// CHROMA_SITING_HORZ: "chromaSitingHorz",
// CHROMA_SITING_VERT: "chromaSitingVert",
// RANGE: "range",
// TRANSFER_CHARACTERISTICS: "transferCharacteristics",
// PRIMARIES: "primaries",
// MAX_CLL: "maxCLL",
// MAX_FALL: "maxFALL",
// MASTERING_METADATA: "masteringMetadata",
