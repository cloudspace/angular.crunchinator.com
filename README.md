# angular.crunchinator.com

Cloudspace Crunchinator Angular Demo


## Quick Start if developing from Mac

Install Node.js and then:

```sh
$ git clone git://github.com/cloudspace/angular.crunchinator.com
$ cd angular.crunchinator.com
$ sudo npm -g install grunt-cli karma bower protractor
$ npm install
$ bower install
$ npm install grunt --save-dev
$ grunt watch
```

Finally, open `file:///path/to/angular.crunchinator.com/build/index.html` in your browser.


## Quick Start if developing using virtualbox and vagrant

```sh
$ git clone git://github.com/cloudspace/angular.crunchinator.com
$ cd angular.crunchinator.com/vagrant
$ vagrant up
$ vagrant ssh

#TODO: could add this to an application recipe later
$ sudo npm -g install grunt-cli karma bower
$ npm install
$ bower install
$ npm install grunt --save-dev
$ sudo apt-get install chromium-browser
$ vim /srv/angular.crunchinator.com/vendor/angular-ui-utils/test/karma.conf.js
  Change the browser to be chromium-browser
$ sudo apt-get install vnc4server
$ vnc4server
  Enter your own password twice
$ vnc4server -kill :1
$ Display=:1  CHROME_BIN=/usr/bin/chromium-browser grunt connect watch
```
Set your hosts file to point dev.angular.crunchinator.com to 33.33.33.115
Run `node dev-server.js`

Finally, open `dev.angular.crunchinator.com:8080` in your browser.


---

### Thanks

_Cribbed with love from [ng-boilerplate](https://github.com/ngbp/ng-boilerplate)_
