---
title: project.json File
---

the main meta file containing the sprites list and various global-scope information

### main obj:
| key | value type |
| ----------- | ----------- |
| `sprites` | `Array<fileName: string>` |
| `tempo` | `number` |
| `video-transparency` | `percentage: number` |
| `video-state` | `'on' \| 'off'` |
| `tts-language` | `string \| null` |
| `global-variables` | `{ [variableName: string]: any; }` |
| `global-lists` | `{ [listName: string]: Array<any>; }` |
| `broadcasts` | `Array<broadcastName: string>` |
| `monitors` | `Array<any>` |
| `meta` | [`MetaObject`](/save-format/meta-file#metaobject) |

### MetaObject:
| key | value type | value |
| ----------- | ----------- | ----------- |
| `is-pmp` | `boolean` | `true` |
| `semver` | `string` | `1.0.0` |
| `vm` | `string` | `0.2.0` |