#[js](js/)  
* [fn.js](js/fn.js)
  * function.debounce(delay, immediately, tail)
    * ![debounce](js/debounce.png)
  * function.throttle(delay, immediately, tail)  
    * ![throttle](js/throttle.png)
  * funtion.loop(whenToStop, option)
    - whenToStop:  
      **number: times to loop**  
      **function: return true if the operation should be stopped**
    - option: {  
      **sync: true/false, _default true_ **  
      **delay: number, _default: 0_ **  
      **args: array, _default: []_ **  
      **ctx: context _default: sync ? this : the loop's interval_ **  
    }
    - ***You can use like this: ***
            fn.loop(number, { sync: true } | { delay: 10, args: ["hello"], ctx: {} })
            fn.loop(func, { sync: true } | { delay: 10, args: ["hello"], ctx: {} })
