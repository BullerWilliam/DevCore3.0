const url="https://raw.githubusercontent.com/PenguinMod/FreshPkg/main/pkgs/{pkgname}/{pkgname}.sprite3";fetch(url).then((e=>e.arrayBuffer())).then((e=>{var r=new Uint8Array(e);vm.addSprite(r)}));
