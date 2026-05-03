
> email-admin-frontend@1.0.0 test
> react-scripts test

node.exe : FAIL 
src/App.test.js
At line:1 char:1
+ & "C:\Program 
Files\nodejs/node.exe" 
"C:\Program 
Files\nodejs/node_mo 
...
+ ~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~
~~
    + CategoryInfo     
         : NotSpecifi  
  ed: (FAIL src/App.   
 test.js:String) []    
, RemoteException
    + FullyQualifiedEr 
   rorId : NativeComm  
  andError
 
  ΓùÅ Test suite 
failed to run

    Cannot find module 
'@testing-library/dom' 
from 'node_modules/@tes
ting-library/react/dist
/pure.js'

    Require stack:
      node_modules/@tes
ting-library/react/dist
/pure.js
      node_modules/@tes
ting-library/react/dist
/index.js
      src/App.test.js

    [0m[31m[1m>[22m
[39m[90m 1 |[39m 
[36mimport[39m { 
render[33m,[39m 
screen } 
[36mfrom[39m [32m'@t
esting-library/react'[
39m[33m;[39m
     [90m   |[39m 
[31m[1m^[22m[39m
     [90m 2 |[39m 
[36mimport[39m 
[33mApp[39m 
[36mfrom[39m [32m'./
App'[39m[33m;[39m
     [90m 3 |[39m
     [90m 4 |[39m 
test([32m'renders App 
component without crash
ing'[39m[33m,[39m 
() [33m=>[39m {[0m

      at 
Resolver.resolveModule 
(node_modules/jest-reso
lve/build/resolver.js:3
24:11)
      at 
Object.<anonymous> (nod
e_modules/@testing-libr
ary/react/dist/pure.js:
46:12)
      at 
Object.<anonymous> (nod
e_modules/@testing-libr
ary/react/dist/index.js
:7:13)
      at 
Object.<anonymous> 
(src/App.test.js:1:1)
      at TestScheduler.
scheduleTests (node_mod
ules/@jest/core/build/T
estScheduler.js:333:13)
      at runJest (node_
modules/@jest/core/buil
d/runJest.js:404:19)
      at _run10000 (nod
e_modules/@jest/core/bu
ild/cli/index.js:320:7)
      at runCLI (node_m
odules/@jest/core/build
/cli/index.js:173:3)

Test Suites: 1 failed, 
1 total
Tests:       0 total
Snapshots:   0 total
Time:        2.164 s
Ran all test suites.
(node:8596) [DEP0040] 
DeprecationWarning: 
The `punycode` module 
is deprecated. Please 
use a userland 
alternative instead.
(Use `node 
--trace-deprecation 
...` to show where the 
warning was created)
