# Directory
- [fn.js](#fnjs)

---

##[fn.js](./fn.js)

给function添加一些常用方法

- func.addSelf()
返回一个函数，该函数在调用func时并将this作为第一个参数传入
```js
  var t = {};
  t.test = function(self) {console.log(this, this === self);}.addSelf();
  t.test();
  // -> true
  
  t.test.call([]);
  // -> true
  
```

- func.returnSelf(ctx)
返回一个函数，该函数以(ctx || this)为上下文调用func并返回this
```js
  var t = function() {
    console.log("in function, this:", this);
    return "this string will not be returned";
  }.returnSelf();
  console.log("return", t());
  // -> in function, this: Window...
  // -> return Window...
  console.log("return", t.call({}));
  // -> in function, this: {}
  // -> return {}
  console.log("return", t.call([]));
  // -> in function, this: []
  // -> return []
  
  var t2 = function() {
    console.log("in function, this:", this);
    return "this string will not be returned";
  }.returnSelf(["this will be used for context"]);
  console.log("return", t2());
  // -> in function, this: ["this will be used for context"]
  // -> return Window...
  console.log("return", t2.call({}));
  // -> in function, this: ["this will be used for context"]
  // -> return {}
  console.log("return", t2.call([]));
  // -> in function, this: ["this will be used for context"]
  // -> return []
```

- func.withArrayLikeArguments([extras])
返回一个函数，该函数会将所接收到的参数整合成一个数组，接着将该数组作为最后一个参数调用func
```js
  var t = function()  {
    for (var i = 0, len = arguments.length; i < len; i++) {
      console.log(i + ":", arguments[i]);
    }
  };
  t.withArrayLikeArguments()(1, 2, 3);
  /*
    -> 0: [1, 2, 3]
  */
  t.withArrayLikeArguments([])(1, 2, 3);
  /*
    -> 0: [],
    -> 1: [1, 2, 3]
  */
  t.withArrayLikeArguments([], 4, "hello")(1, 2, 3);
  /*
    -> 0: [],
    -> 1: 4
    -> 2: hello
    -> 3: [1, 2, 3]
  */
```
