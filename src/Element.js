const {
  setPathValue,
  getPathValue,
  getValue,
  setValue,
} = require("./utils/tools");
const { DATA_TYPE } = require("./constants/common");
// const test = {
//   a: [{ b: { c: 1 } }, { b: { c: [{ d: [] }, { d: [] }] } }],
// };
// const test2 = {
//   a: [{ b: [] }, { b: [{ c: 1 }, { c: [] }] }],
// };
// // setValue(test, ["a","b","c","d","e"], 3)
// setValue(test, ["a", "b", "c", "d", "e", "f"], 3);
// setValue(test2, ["a", "b", "c", "d"], 3);
// console.log(getValue(test, ["a","b","c"]))
// console.log(test, test2);
class Element {
  constructor(element, dataInterface, demuxer = null) {
    this.dataInterface = dataInterface;
    this.id = element.id;
    this.size = element.size;
    this.offset = element.offset;
    this.end = element.end;
    this.demuxer = demuxer;
    this.data = null;
    this.loaded = false;
  }

  async load(ELEMENT_INFO_MAP) {
    let currentElement = null;
    while (this.dataInterface.offset < this.end) {
      if (!currentElement) {
        currentElement = await this.dataInterface.peekElement();
        if (currentElement === null) return;
      }
      const elementInfo = ELEMENT_INFO_MAP[currentElement.id];
      if (elementInfo) {
        const isMaster = elementInfo.type === DATA_TYPE.MASTER;
        if (isMaster) {
          await this.loadMasterElement(elementInfo.name, currentElement);
        } else {
          const data = await this.dataInterface.readAs(
            elementInfo.type,
            currentElement.size
          );
          this[elementInfo.name] = data || null;
        }
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
  async load2(Schema) {
    let currentElement = null;
    while (this.dataInterface.offset < this.end) {
      if (!currentElement) {
        currentElement = await this.dataInterface.peekElement();
        if (currentElement === null) return;
      }
      const elementInfo = Schema[currentElement.id];
      console.log('ourer',elementInfo?.name, elementInfo?.id, currentElement.id,currentElement.id.toString(16))
      if (elementInfo) {
        const isMaster = elementInfo.type === DATA_TYPE.MASTER;
        const isMulti = !!elementInfo.multiple;
        console.log(
          elementInfo.name,
          isMulti,
          getValue(this.demuxer.data, elementInfo.pathArr.slice(0, -1))
        );

        if (isMulti) {
          if (!getValue(this.demuxer.data, elementInfo.pathArr)) {
            setValue(this.demuxer.data, elementInfo.pathArr, []);

            // value[elementInfo.pathArr[elementInfo.pathArr.length - 1]] = []
          } else {
            const value = getValue(
              this.demuxer.data,
              elementInfo.pathArr.slice(0, -1)
            )[elementInfo.name];
            // const arr = getValue(this.demuxer.data, elementInfo.pathArr)
            setValue(this.demuxer.data, elementInfo.pathArr.slice(0, -1), {
              [elementInfo.name]: [...value, {}],
            });
          }
        } else if (isMaster) {
          if (!getValue(this.demuxer.data, elementInfo.pathArr)) {
            setValue(this.demuxer.data, elementInfo.pathArr, {});
          }
        } else {
          if (!getValue(this.demuxer.data, elementInfo.pathArr)) {
            setValue(this.demuxer.data, elementInfo.pathArr, null);
          }
        }

        if (isMaster) {
          const element = new Element(
            currentElement,
            this.dataInterface,
            this.demuxer
          );
          await element.load2(Schema);
          if (!element.loaded) {
            return;
          }
          this.data = element.getData();
        } else {
          this.data = await this.dataInterface.readAs(
            elementInfo.type,
            currentElement.size
          );
          setValue(this.demuxer.data, elementInfo.pathArr, this.data);
        }
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

  getELementInfo() {
    return {
      id: this.id,
      size: this.size,
      offset: this.offset,
      end: this.end,
    };
  }
  getData() {
    return this.data;
  }
}

module.exports = Element;
