# Directory
- [fn.js](#fnjs)
- [Activity.js](#activityjs)

---

##[fn.js](./fn.js)

*给function添加一些常用方法*

- func.addSelf()  
*返回一个函数，该函数在调用func时并将this作为第一个参数传入*  
  ```js
    var t = {};
    t.test = function(self) {console.log(this, this === self);}.addSelf();
    t.test();
    // -> true

    t.test.call([]);
    // -> true

  ```

- func.returnSelf(ctx)  
*返回一个函数，该函数以(ctx || this)为上下文调用func并返回this*  
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
*返回一个函数，该函数会将所接收到的参数整合成一个数组，接着将该数组作为最后一个参数调用func*  
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

- func.delay(args, ctx)  
*返回一个函数fn，该函数执行时将以(ctx || this)作为上下文， args作为参数调用func  
调用方式为apply，因而要求args类型为Array  
若args为null，则传入func的参数即为fn执行时接收的参数(`args = args || arguments`)*  
  ```js
    var t = function() {
      console.log("context:", this);
      for (var i = 0, len = arguments.length; i < len; i++) {
        console.log(i + ":", arguments[i]);
      }
    }
    t.delay(null, null)("hello");
    /*
      -> context: Window...
      -> 0: hello
    */
    t.delay(null, [])();
    /*
      -> context: []
    */
    t.delay([1, 2, 3], null)("hello");
    /*
      -> context: Window...
      -> 0: 1
      -> 1: 2
      -> 2: 3
    */
    t.delay([1, 2, 3], [])();
    /*
      -> context: []
      -> 0: 1
      -> 1: 2
      -> 2: 3
    */
  ```  
  *应用场景*  
  ```js
    setTimeout(func.delay(args, ctx));
    jQuery.Deferred().then(func.delay(args, ctx))
    // 当你想以某些参数和上下文调用函数却又不想其立即调用时就可使用 func.delay
  ```

- func.debounce(delay, immediately, tail)  
*返回一个函数，该函数将根据参数决定如何对func进行节流*  
  ![debounce](./debounce.png)

- func.throttle(delay, immediately, tail)  
*返回一个函数，该函数将根据参数决定如何对func进行频率控制*  
  ![throttle](./throttle.png)

---

##[Activity.js](./Activity.js)  

- 依赖库  
  ***require jQuery, fn.js***
  
- 说明  
  ```js
    /*
      一个活动，可划分成
      准备 -> 执行 -> 收尾
      在任何阶段，我们都可以为其添加活动
      活动是有优先级的，相同优先级的活动将顺序执行。
    */
  ```
- 创建一个Activity  
  ```js
    var activity = new Activity();
  ```
  
- 为某个activity添加操作  
  ```js
    activity.add(func | Activity, priority) // 默认调用activity.todo.add
    activity.before.add(func | Activity, priority);
    activity.todo.add(func | Activity, priority);
    activity.after.add(func | Activity, priority);
  ```
  
- 执行activity  
  ```js
    activity.exec()
  ```

- 高级功能  

  + 若我们想接管activity，只需返回一个Promise  
    ([jQuery.Deferred 相关教程](http://api.jquery.com/category/deferred-object/))  
    
    ```js
      var deferred = jQuery.Deferred(), activity = new Activity();
      activity.todo.add(function() {
        return deferred.promise();
      }).add(function() {
        console.log("在deferred.resolve之前该函数不会执行");
      })
      activity.exec();
      setTimeout(deferred.resolve.bind(deferred), 3000);
      
      /*
        3秒后
        -> "在deferred.resolve之前该函数不会执行"
      */
      
    ```
  + 若我们想在Activity间传递数据，可参考下面代码  
  
    ```js
      var ac1 = new Activity(), ac2 = new Activity();
      ac1.todo.add(function(data) {
        data.message = "hello ac2";
      }).add(ac2);
      ac2.todo.add(function(data) {
        console.log(data);
      });
      ac1.exec();
      
      /*
        -> { message: "hello ac2" }
      */
      
    ```
  + 优先级详解  
  
    ```js
      var activity = new Activity();
      activity.todo.add(function() {
        console.log("低优先级")
      }).add(function() {
        console.log("高优先级");
      }, 1);
      /*优先级默认为0*/
      activity.exec();

      /*
        -> "高优先级"
        -> "低优先级"
      */

    ```
