# Directory
- [fn.js](#fnjs)
- [Activity.js](#activityjs)
- [s.js](#sjs)

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

- func.forAllArguments  
  *返回一个函数fn, 该函数会对每个参数都会调用func*
  
  ```js
  
    var t = function(a) {console.log(a);}.forAllArguments();
    t(1, 2, 3)
    /*
      -> 1
      -> 2
      -> 3
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
  
    activity.add(func | Activity | object({exec: function}),
                 priority);
    activity.before.add(func | Activity | object({exec: function}),
                 priority);
    activity.todo.add(func | Activity | object({exec: function}),
                 priority);
    activity.after.add(func | Activity | object({exec: function}),
                 priority);
    /*
      activity.add 与 activity.todo.add 效果相同，不同之处在于：
        activity.add(...) === activity // true
        activity.todo.add(...) === activity // false
        activity.todo.add(...) === activity.todo // true
    */
                 
  ```

- 执行activity  

  ```js
  
    activity.exec();
    
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

---

##[s.js](./s.js)  

- 依赖库  
  ***require fn.js***
  
- 说明  

  ```js
  
    /*
      一个系统往往有很多种状态，而有时候，当且仅当在某些状态下才能进行相应的操作
    */
    
  ```

- 创建一个状态集  

  ```js
  
    // 创建一个空状态集
    var states = new s();
    // 创建一个状态集, 该状态集基于已有状态集
    var states = new s({
      allowClick: false,
      allowMove: false,
      loading: false
    });
    
  ```

- 检查状态集是否是良好态  

  ```js
  
    // 检查全部状态
    states.isGood();
    // 检查部分状态
    states.isGood("allowClick", "allowMove");
    
  ```

- 增加某个状态  

  ```js
  
    states.set(stateName, value)
    /*
      这里当value是function时，我们在获得其情况时将会进行如下操作：
        return value.apply(self, [stateName])
    */
     states.add 等同于 states.set
     
  ```

- 获得某个状态的情况  

  ```js
  
    states.get("allowClick");
    /*
      s.prototype.get = function (self, stateName) {
        var value = self.state[stateName];
        if (typeof value === "function") {
          return value.apply(self, [stateName]);
        } else {
          return value;
        }
      }.addSelf();
    */
      
  ```

- 清除某个状态  
  `state.clear` *用法同state.isGood*
  
- 子集  
  当我们只想检查部分状态时，可以用`states.child` 或者 `states.antiChild`  

  + states.child  
    返回一个s对象，该对象只提供isGood方法，相应对象全为真时返回真  
    
    ```js
    
      // 检查全部状态
      states.child()
      // 检查部分状态
      states.child("loading", "allowClick");
      
    ```

  + states.antiChild  
    返回一个s对象，该对象只提供isGood方法，相应对象不全为真时返回真  
    
     ```js
     
      // 检查全部状态
      states.antiChild()
      // 检查部分状态
      states.antiChild("loading", "allowClick");
      
    ```

  + 基于多个子集的情况 's.when'，静态方法  
    返回一个s对象，该对象只提供isGood方法，所传子集全为真时返回真  
    
    ```js
    
      var child1 = states.child("loading"), child2 = states.antiChild("allowClick");
      var child3 = s.when(child1, child2);
      /*
        当child1为真、child2也为真，即"loading"态为真、"allowClick"态为假时，
        child3.isGood() 为真。
      */
      
    ```

- bs  
  一个简单的执行器  
  
  ```js
  
    var t = new bs(fn1 | bs, fn2 | bs...);
    /*
      var bs = function (self, fns) {
        self.calls = [];
        self.cares = [];
        self.addExec.apply(self, fns);
      }.addSelf().withArrayLikeArguments();
    */
    t.care(child3, child4...);
    t.addExec(fn3, fn4...);
    t.exec(data1, data2...);
    /*
      若t关心的状态全为真，则顺序执行其绑定的函数
    */
    
  ```
  
