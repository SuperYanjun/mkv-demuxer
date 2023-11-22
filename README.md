# Mkv Demuxer
基于[jswebm](https://github.com/jscodec/jswebm)进行了魔改，优化了内存问题，可单独获取视频元信息及视频数据，结合webcodecs可进行视频帧的解析

还在测试中，但基本功能已经能够满足

Modified based on [jswebm](https://github.com/jscodec/jswebm), the memory problem is optimized, video meta information and video data can be obtained separately, and video frames can be parsed in combination with webcodecs.

Still in testing, but basic functions are sufficient

# Example
```javascript
import { MkvDemuxer } from 'mkv-demuxer'
const demuxer = new MkvDemuxer()
await demuxer.initFile(file, fileSize)
const meta = await demuxer.getMeta()
const data = await demuxer.getData()
const frame = await demuxer.seekFrame(0)
```