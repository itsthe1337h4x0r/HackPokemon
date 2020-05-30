

what a dword is:

```
var b0 = memoryjs.readMemory(processObject.handle, 0x030C4250, memoryjs.BYTE);
var b1 = memoryjs.readMemory(processObject.handle, 0x030C4251, memoryjs.BYTE);
var b2 = memoryjs.readMemory(processObject.handle, 0x030C4252, memoryjs.BYTE);
var b3 = memoryjs.readMemory(processObject.handle, 0x030C4253, memoryjs.BYTE);
var byte4 = b3.toString(16) + b2.toString(16) + b1.toString(16) + b0.toString(16);
console.log(parseInt(byte4, 16));
```