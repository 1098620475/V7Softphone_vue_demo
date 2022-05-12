<!--
 * @Author: Wangtao
 * @Date: 2021-02-24 10:01:14
 * @LastEditors: Wangtao
 * @LastEditTime: 2021-03-01 19:14:25
-->
```bash
# clone the project
git clone git@github.com:1098620475/V7Softphone_vue_demo.git

# enter the project directory
cd V7Softphone_vue_demo

# install dependency
npm install

# develop
npm run dev
```
### install error
```
# install error

npm ERR! Error while executing:
npm ERR! /usr/local/bin/git ls-remote -h -t git://github.com/adobe-webplatform/eve.git
npm ERR!
npm ERR! fatal: 远程错误：
npm ERR!   The unauthenticated git protocol on port 9418 is no longer supported.
npm ERR! Please see https://github.blog/2021-09-01-improving-git-protocol-security-github/ for more information.

##
```
- fix
```
git config --global url."https://".insteadOf git://
```