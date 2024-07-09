const { DATA_TYPE } = require("./common");

const SEEK_HEAD_ElEMENT_NAME = {
  SEEK: "seek",
};

const SEEK_HEAD_ElEMENT_INFO = {
  0x4dbb: { name: SEEK_HEAD_ElEMENT_NAME.SEEK, type: DATA_TYPE.MASTER },
};

const SEEK_ElEMENT_NAME = {
  SEEK_ID: "seekId",
  SEEK_POSITION: "seekPosition",
};

const SEEK_ElEMENT_INFO = {
  0x53ab: { name: SEEK_ElEMENT_NAME.SEEK_ID, type: DATA_TYPE.UNSIGNED_INT },
  0x53ac: {
    name: SEEK_ElEMENT_NAME.SEEK_POSITION,
    type: DATA_TYPE.UNSIGNED_INT,
  },
};

module.exports = {
  SEEK_HEAD_ElEMENT_NAME,
  SEEK_HEAD_ElEMENT_INFO,
  SEEK_ElEMENT_NAME,
  SEEK_ElEMENT_INFO,
};
