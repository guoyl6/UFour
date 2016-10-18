#[js](js/)  
* [fn.js](js/fn.js)  
  * function.debounce(delay, immediately, tail)
        ![debounce](js/debounce.png)
  * function.throttle(delay, immediately, tail)
        ![throttle](js/throttle.png)
    *funtion.loop(whenToStop, option)
        - whenToStop:  
            * number: times to loop  
            * function: return true if the operation should be stopped  
        * option: {  
            * sync: true/false, *default true*  
            * delay: number, *default: 0*  
            * args: array, *default: []*  
            * ctx: context *default: sync ? this : the loop's interval*  
        * }  
        * *You can use like this: *    
            * fn.loop(number, { sync: true } | { delay: 10, args: ["hello"], ctx: {} })  
            * fn.loop(func, { sync: true } | { delay: 10, args: ["hello"], ctx: {} })  
