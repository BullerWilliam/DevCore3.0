---
title: sprite format
---

### sprites folder
example contains the default enviroment when making a new project
```
 V sprites
 |  V sprite1
 |  |  V costumes
 |  |  |  costume1.svg
 |  |  V sounds
 |  |  sprite.json
 |  V stage
 |  |  V costumes
 |  |  |  backdrop1.svg
 |  |  V sounds
 |  |  sprite.json
```
note that the stage isnt necessary and can be omitted from the save

### sprite.json
| key | type |
| ----------- | ----------- |
| `name` | `string` |
| `volume` | `percentage: number` |
| `visible` | `boolean` |
| `x` | `number` |
| `y` | `number` |
| `size` | `percentage: number` |
| `direction` | `direction: number` |
| `draggable` | `boolean` |
| `rotation-style` | `"all around" \| "look at" \| "left-right" \| "up-down" \| "don't rotate"` |
| `current-costume` | `number` |
| `variables` | `{ [variableName: string]: any; }` |
| `lists` | `{ [listName: string]: Array<any>; }` |
| `scripts` | [`Array<ScriptObj>`](http://localhost:3000/save-format/sprites#scriptobj) |
| `custom-blocks` | [`Array<CutomBlockScriptObj>`](http://localhost:3000/save-format/sprites#cutomblockscriptobj) |
| `costumes` | `{ [fileName: string]: spriteName; }` |
| `sounds` | `{ [fileName: string]: spriteName; }` |

### ScriptObj
scripts are built from arrays  
the main script array is simply `[x, y, code]`  
the blocks them selves are `[blockID, ...inputs, mutation (optional)]`  
the inputs are the values of the blocks from the scratch interface, rather then the structure from blockly  
statement inputs are just arrays of more blocks, if there is a block inside an input it will also be an array (shaped the exact same as every other block)  
empty inputs are set with `null`  
custom blocks are noted with a block id of `customblock_{text}` where `{text}` is the block message on the custom block (all text on the block in order without the inputs)

#### example of a script:
```json
[-33, 169, [
    ["event_whenflagclicked"],
    ["motion_pointtowards", "_random_"],
    ["control_forever", [
        ["motion_movesteps", 10],
        ["control_if", ["sensing_touchingobject", "_edge_"], [
            ["sound_play", "Low Boing"]
        ]],
        ["motion_ifonedgebounce"]
    ]]
]]
```
the above code will result in
<img src="/img/docimages/example_save_script.png" alt="Example of the resulting blocks from the above example"></img>

### CutomBlockScriptObj
extends [ScriptObj](http://localhost:3000/save-format/sprites#scriptobj) adding a scratchblocks syntaxed string to the end of the script to define the custom blocks shape  
this syntax does not auto-fill the block with the shape and color of existing blocks in the toolbox  
see [here](https://en.scratch-wiki.info/wiki/Block_Plugin/Syntax) for the stratch blocks syntax  
the syntax also does not support further blocks being defined inside or around the defined block, although it does support setting the default values of these inputs  
an adition to this syntax, for defining menu's, is that ontop of the ` v` at the end of the input to signify a menu you can add a `|` inbetween each item in the list, allowing you to define any number of items for any menu in any input  
alternatively you may pass an extension block object here directly instead of relying on the project parser to decode the scratchblocks syntax into an extension block