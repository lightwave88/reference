
;
(function (global) {
    let _;
    if (typeof Window !== "undefined" && global instanceof Window) {
        if (typeof global._ === "object" || typeof global._ === "function") {
            _ = global._;
        }
    } else if (typeof module === "object") {
        // node.js
        try {
            _ = require("../lodash");
        } catch (e) {
        }
        //----------------------------
        if (typeof _ === "undefined") {
            try {
                _ = require("../underscore");
            } catch (e) {
            }
        }
        //----------------------------
        if (typeof _ === "undefined") {
            throw new Error("need require underscore or lodash");
        }
    }
    //==========================================================================
    _.mixin({
        serialize: serialize,
        unserialize: unserialize
    });
    //==========================================================================
    function serialize(data) {
        let res = '';

        for (let i = 0, method; method = serialize.methods[i]; i++) {
            let temp;
            try {
                temp = method(data);
                res = temp;
                break;
            } catch (error) {
                if (error instanceof TypeError) {
                    continue;
                } else {
                    throw error;
                }
            }
        }
        return res;
    }
//==============================================================================
    (function (self) {

        self.methods = [
            function (data) {
                // string
                if (typeof data !== 'string') {
                    throw new TypeError();
                }
                let res = 'String:' + String(data.length) + ':"' + data + '"';
                return res;
            },
            function (data) {
                // number
                if (typeof data !== 'number') {
                    throw new TypeError();
                }
                let res = 'Number:' + data;
                return res;
            },
            function (data) {
                // undefined
                if (typeof data !== 'undefined') {
                    throw new TypeError();
                }
                let res = 'undefined';
                return res;
            },
            function (data) {
                // null
                if (data !== null) {
                    throw new TypeError();
                }
                let res = 'null';
                return res;
            },
            function (data) {
                // array
                if (!Array.isArray(data)) {
                    throw new TypeError();
                }
                //----------------------------
                let res = 'Array:' + data.length + ':{';

                for (let i = 0; i < data.length; i++) {
                    res += 'Number:' + i + ';';

                    // 進入遞迴
                    let _res = serialize(data[i]);

                    res += _res + ';'
                }
                res += '}';

                return res;
            },
            //============================
            function (data) {
                // {}

                if (typeof data !== 'object' && data == null) {
                    throw new TypeError();
                }
                let type = Object.prototype.toString.call(data);

                if (!/\[object Object\]/.test(data)) {
                    throw new TypeError();
                }
                //----------------------------
                let length = Object.keys(data).length;
                let res = 'Object:' + length + ':{';

                for (let k in data) {
                    if (data.hasOwnProperty(k)) {
                        // 進入遞迴
                        let _k = serialize(k);
                        let _res = serialize(data[k]);

                        res += _k + ';' + _res + ';';
                    }
                }
                res += '}';

                return res;
            },
            //============================
            function (data) {
                // Map
                if (!(data instanceof Map)) {
                    throw new TypeError();
                }

                let length = data.size;
                let res = 'Map:' + length + ':{';

                data.forEach(function (v, k) {
                    // 進入遞迴
                    k = serialize(k);
                    v = serialize(v);

                    res += (k + ';' + v + ';');
                });

                res += '}';

                return res;
            },
            function (data) {
                // 從函式實例化的物件
            }
        ];
    })(serialize);
    ////////////////////////////////////////////////////////////////////////////
    function unserialize(data) {

        if (unserialize.count === 0) {
            // 去除文字影響
            data = unserialize.prevProccessingString(data);
        }

        ++unserialize.count;
        //----------------------------
        let res;

        let objectType;

        data.replace(/^([^\:]+)/g, function (m, g) {
            objectType = g;
        });

        if (objectType in unserialize.methos) {
            res = unserialize.methos[objectType](data);
        } else {
            throw new Error(JSON.stringify(data) + ' no this method');
        }
        //----------------------------
        if (--unserialize.count === 0) {
            unserialize.jobs.length = 0;
        }

        return res;
    }

    (function (self) {
        self.UID = Math.floor(Math.random() * 0x10000000000).toString(16);

        self.count = 0;

        self.jobs = [];
        //==========================================================================
        // 從變數陣列中區分出 key, value
        // 最重要的核心
        self.getKeyValue = function (child_str) {

            // 避開 string 的影響
            // 清除所有 string 內部的內容，避免干擾發生
            // child_str = self.prevProccessingString(child_str);
            // console.log(child_str);
            //----------------------------
            // 找尋屬於他的變數
            let str_variables = [];

            // 從左往右解
            while (child_str.length > 0) {
                let judge = 0;

                for (let i = 0; i < child_str.length; i++) {
                    let char = child_str.charAt(i);

                    if (char === '{') {
                        ++judge;
                    }

                    if (char === '}') {
                        --judge;
                    }

                    if ((char === ';' || i === (child_str.length - 1)) && judge === 0) {
                        // 取出一個區段
                        let target = child_str.slice(0, i + 1);
                        str_variables.push(target);
                        child_str = child_str.slice(i + 1);
                        break;
                    }
                }
            }
            let res = {
                key: [],
                value: []
            };

            str_variables.forEach(function (v, i) {
                if (i % 2 === 0) {
                    res.key.push(v);
                } else {
                    res.value.push(v);
                }
            });

            return res;
        };
        //==========================================================================
        self.checkString = function (str) {

            let reg = new RegExp('@_' + unserialize.UID + '_(\\d+)_@');

            while (reg.test(str)) {
                res = reg.exec(str);
                let i = Number(res[1]);

                if (typeof unserialize.jobs[i] !== 'undefined') {
                    let s = unserialize.jobs[i];
                    str = str.replace(reg, s);

                } else {
                    throw new Error('no find match string recorder');
                }
            }
            return str;
        };
        //==========================================================================
        self.prevProccessingString = function (str) {
            let reg_1 = /String:(\d+):"[^"]*"/;
            let reg_2 = /String:(\d+):"/;

            let positionList = [];
            let _str = str.slice(0);

            // 找各文字的區段
            while (true) {

                if (!reg_1.test(_str)) {
                    break;
                }

                // 匹配的位置
                let index;
                // 匹配的字數
                let wordLength;
                // 文字的長度資訊
                let length;

                let res = reg_2.exec(_str);

                index = res.index;
                wordLength = res[0].length;
                length = Number(res[1]);

                let reg_3 = new RegExp('String:\\d+:[\\s\\S]{' + (length + 2) + '}');

                // console.log(reg_3.toString());

                // 去除已處理過的 string
                // 可以更快
                // 以後吧
                _str = _str.replace(reg_3, function (m) {
                    let r = '';
                    for (let i = 0; i < m.length; i++) {
                        r += '*';
                    }
                    return r;
                });



                if (typeof length !== 'number' || isNaN(length)) {
                    throw new Error('String error (' + str + ')');
                } else if (length === 0) {
                    // 沒有內容就不需處理               
                    continue;
                }

                let s = index + wordLength;
                let e = index + wordLength + length - 1;

                let data = {
                    s: s,
                    e: e
                };

                data.target = str.slice(data.s, data.e + 1);

                positionList.unshift(data);
            }

            // 裁字
            positionList.forEach(function (d) {
                let start = d.s;
                let end = d.e;

                let index = unserialize.jobs.length;
                let replace = '@_' + unserialize.UID + '_' + index + '_@';


                let head = str.slice(0, start);
                let foot = str.slice(end + 1);
                let middle = str.slice(start, end + 1);

                unserialize.jobs[index] = middle;

                str = head + replace + foot;
            });

            return str;
        };
        // 這邊要加強
        // 對 unicode......等的加強
        self.prevProccessingString_1 = function (str) {

            let res, reg = /String:(\d+):"/g;
            let positionList = [];

            while (res = reg.exec(str)) {
                // 匹配的字數
                let i = res[0].length;

                // 匹配的位置
                let index = res.index;

                // 文字的長度
                let length = parseInt(res[1], 10);

                if (length === 0) {
                    // 沒有內容就不需處理
                    continue;
                }

                let data = {
                    s: (index + i),
                    e: (index + i + length - 1)
                };

                data.target = str.slice(data.s, data.e + 1);

                positionList.unshift(data);
                // console.log(res);
            }

            positionList.forEach(function (d) {
                let start = d.s;
                let end = d.e;

                let index = unserialize.jobs.length;
                let replace = '@_' + unserialize.UID + '_' + index + '_@';


                let head = str.slice(0, start);
                let foot = str.slice(end + 1);
                let middle = str.slice(start, end + 1);

                unserialize.jobs[index] = middle;

                str = head + replace + foot;
            });

            return str;
        };
        //==========================================================================
        self.methos = {
            String: function (data) {
                data = unserialize.checkString(data);
                let res = /"(.*)"/.exec(data);
                return res[1];
            },
            //======================================
            Number: function (data) {
                let judge = /Number:(\d+|\d+\.{1}\d+)/.exec(data);
                let res = NaN;

                if (Array.isArray(judge) && typeof (judge[1]) !== 'undefined') {
                    res = Number(judge[1]);
                }
                return res;
            },
            //======================================
            Object: function (data) {
                let res = {};

                // 物件本身的描述
                let self_str = '';
                // 孩子的描述
                let child_str;
                let keyLength = 0;

                data.replace(/^([^\{\}]+?)\{(.*)\}/g, function (m, g1, g2) {
                    self_str = g1;
                    child_str = (g2 == null ? '' : g2);
                    return '';
                });
                //----------------------------

                self_str.replace(/^[^:\d]+:(\d+):/g, function (m, g1) {
                    keyLength = Number(g1);
                });
                //----------------------------
                let d = self.getKeyValue(child_str);

                let keyList = d.key;
                let valueList = d.value;

                // 變數長度檢查
                if (keyLength !== keyList.length || keyList.length !== valueList.length) {
                    throw new Error(data + ' variable length have trouble');
                }
                //----------------------------
                keyList.forEach(function (k, i) {
                    console.dir(data);

                    let v = valueList[i];
                    k = unserialize.checkString(k);

                    // 遞迴
                    k = unserialize(k);
                    v = unserialize(v);

                    res[k] = v;
                });

                //----------------------------
                if (keyLength !== Object.keys(res).length) {
                    throw new Error("analyze error(" + data + ")");
                }
                return res;
            },
            //======================================
            Map: function (data) {
                let res = new Map();

                // 物件本身的描述
                let self_str = '';
                // 孩子的描述
                let child_str;
                let keyLength = 0;

                data.replace(/^([^\{\}]+?)\{(.*)\}/g, function (m, g1, g2) {
                    self_str = g1;
                    child_str = (g2 == null ? '' : g2);
                    return '';
                });
                //----------------------------

                self_str.replace(/^[^:\d]+:(\d+):/g, function (m, g1) {
                    keyLength = Number(g1);
                });
                //----------------------------
                let d = self.getKeyValue(child_str);

                // console.dir(d);

                let keyList = d.key;
                let valueList = d.value;

                // 變數長度檢查
                if (keyLength !== keyList.length || keyList.length !== valueList.length) {
                    throw new Error(data + ' variable length have trouble');
                }

                keyList.forEach(function (k, i) {
                    let v = valueList[i];

                    k = unserialize.checkString(k);

                    // 遞迴
                    k = unserialize(k);
                    v = unserialize(v);

                    res.set(k, v);
                });
                //----------------------------
                return res;
            },
            Array: function (data) {
                let res = [];

                // 物件本身的描述
                let self_str = '';
                // 孩子的描述
                let child_str;
                let keyLength = 0;

                data.replace(/^([^\{\}]+?)\{(.*)\}/g, function (m, g1, g2) {
                    self_str = g1;
                    child_str = (g2 == null ? '' : g2);
                    return '';
                });
                //----------------------------

                self_str.replace(/^[^:\d]+:(\d+):/g, function (m, g1) {
                    keyLength = Number(g1);
                });
                //----------------------------
                let d = self.getKeyValue(child_str);

                // console.dir(d);

                let keyList = d.key;
                let valueList = d.value;

                // 變數長度檢查
                if (keyLength !== keyList.length || keyList.length !== valueList.length) {
                    throw new Error(data + ' variable length have trouble');
                }

                keyList.forEach(function (k, i) {
                    let v = valueList[i];

                    // 遞迴
                    k = unserialize(k);
                    v = unserialize(v);

                    res[k] = v;
                });
                //----------------------------
                return res;
            },
            O: function (data) {
                // 非預設物件
                // 從函式實例化的物件
            },
        }
    })(unserialize);
})();
