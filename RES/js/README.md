# Directory
- [fn.js](#fnjs)

---

##[fn.js](./fn.js)

给function添加一些常用方法

- addSelf()
返回一个函数，该函数的第一个参数为this
```js
  var t = {};
  t.test = function(self) {console.log(this === self);}.addSelf();
  t.test();
  t.test.call([]);
```
