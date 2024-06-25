## punchTimeAuth
 On registration, the user will need to enter a password multiple times to generate a “digital signature.” This signature consists of confidence intervals for time differences between keystrokes that will be used on login to authenticate the user, a human free factor authetication.

 An outlier­based based approach was used, because it yielded the best results during our “product testing.”
The method is as follows: observations from registration are used to create boundaries outside which the particular time difference is called an outlier. Then, if over 10% of these time differences are called outliers, login is refused. These boundaries are (Q1­4*IQR, Q3+4*IQR), where Q1 and Q3 are the first and third quartiles of the particular time difference, and IQR is the average interquartile range over all time differences. The quartiles were calculated using the seventh quantile method described in [Hyndman and Fan](https://www.amherst.edu/media/view/129116/original/Sample%2BQuantiles.pdf). This is the default used by R and S.


### Install
Make sure you have [MongoDB](https://www.mongodb.org/downloads#production) installed and running on the default port, otherwise edit config.js.

```
npm install
npm start
```

```
#login
http://localhost:3000/

#registration
http://localhost:3000/registration
```


### License

The MIT License (MIT)

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
