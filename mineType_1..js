const $fs = require('fs');
const $path = require('path');
const $rootPath = $fs.realpathSync('.');


let datapath = $path.resolve(__dirname, 'data/mineType.txt');
console.log(datapath);

// process.exit(0);

let p = readFileContent_1(datapath);

p.then((d) => {
    let data = JSON.stringify(d, null, 2);
    let path = $path.resolve(__dirname, './data/mineType.json');

    writeFile(path, data);
});



function readFileContent(path) {
    let fs = require('fs');

    fs.readFile(path, 'utf8', function (err, data) {
        // console.dir(data);


    });

}

function readFileContent_1(path) {

    return new Promise(function (resolve, rej) {
        let _fs = require('fs');
        let inputStream = _fs.createReadStream(path);
        let lines = [];


        let readline = require('readline');
        // 將讀取資料流導入 Readline 進行處理 
        var lineReader = readline.createInterface({ input: inputStream });
        //----------------------------
        lineReader.on('line', function (line) {
            lines.push(line);
        });

        lineReader.on('close', function () {
            end();
        });
        //----------------------------
        function end() {
            let _res = {};
            // console.log('line=(%d)', lines.length);
            let reg = /^#?\s{0,}([^\s]+)\s{0,}((?:[^\s].*)|)$/

            lines = lines.slice(15)

            lines = lines.forEach(function (line, i) {
                let res = reg.exec(line);
                let key;
                let value;

                if (res != null) {

                    key = res[1];
                    value = res[2] || null;

                    if (value != null) {
                        // debugger;
                        value = value.trim();
                        value = value.split(/\s+/);
                    }

                    _res[key] = value;
                }

            });
            resolve(_res);
        }
    });
}

function writeFile(path, content) {
    debugger;
    let fs = require('fs');
    fs.open(path, "w", function (e, fd) {
        if (e) throw e;
        fs.write(fd, content, 0, 'utf8', function (e) {
            if (e) throw e;
            fs.closeSync(fd);
        })
    });
}