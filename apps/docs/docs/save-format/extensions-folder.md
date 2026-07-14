---
title: extensions folder
---

### index.json
this file is a list of extension id's to either be loaded from a meta file in the custom-extensions folder or from inside the vm itself

### custom-extensions
this folder cuntains the all data pretaining to an extension
each file inside this folder is a .json and optional .js file with each file named with the extensions id  
the .json file contains the extensions meta information and the .js file contains the extension itself, regardless of if it was loaded from url (although the js file is not explicitly required to load from url)

##### example folder tree:
```
 V extensions
 |  index.json
 |  V custom-extensions
 |  |  example.json
 |  |  example.js
```

#### meta object:
| key | type |
| ----------- | ----------- |
| url | string |
| data | any |