#[js](js/)  
* [fn.js](js/fn.js)
  + function\.debounce\(delay, immediately, tail\)
    ![debounce](js/debounce.png)
  + function\.throttle\(delay, immediately, tail\)  
    ![throttle](js/throttle.png)
  + funtion\.loop\(whenToStop, option\)
    - ***You can use like this:***  
    ```
        fn.loop(number, { sync: true } | { delay: 10, args: ["hello"], ctx: {} })
        fn.loop(func, { sync: true } | { delay: 10, args: ["hello"], ctx: {} })
    ```
