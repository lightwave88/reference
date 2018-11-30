// 比 JSON.parse(JSON.stringify(data)) 還略慢

module.exports = deepCopy;

let jobList = [];

// for test
// 與 JSON.stringify() 對比速度用
function deepCopy(value) {
    // debugger;

    let dataSet = new DataSet(value);
    jobList.push(dataSet);

    let index = 0;

    while ((dataSet = jobList[index++]) != null) {
        // debugger;

        let _value = dataSet.originalValue;

        if (Array.isArray(_value)) {
            for (let i = 0; i < _value.length; i++) {
                let v = _value[i];
                let ds = new DataSet(v, dataSet, i);
                jobList.push(ds);
            }

        } else if (typeof (_value) == "object") {
            for (let k in _value) {
                let v = _value[k];
                let ds = new DataSet(v, dataSet, k);
                jobList.push(ds);
            }
        } else {
            continue;
        }
    }
    //-----------------------
    let res;
    let d;

    while ((d = jobList.pop()) != null) {
        res = d;
        d.solve();
    }

    return res.value;
}
//======================================

function DataSet(v, p, k) {

    this.parent; // DataSet
    this.parentKey;
    this.value;
    this.originalValue;

    this.__construct(v, p, k);
}

(function () {
    this.__construct = function (v, p, k) {

        this.originalValue = v;

        if (p) {
            this.parent = p;
            this.parentKey = k;
        }

        this._makeValue();
    };
    //--------------------------------------
    this._makeValue = function () {
        if (Array.isArray(this.originalValue)) {
            this.value = [];
        } else if (typeof (this.originalValue) == "object") {
            this.value = {};
        } else {
            this.value = this.originalValue;
        }
    };
    //--------------------------------------
    this.solve = function () {

        if (this.parent == null) {
            return;
        }

        let data = this.parent.value;
        data[this.parentKey] = this.value;

        this._destory();
    };
    //--------------------------------------
    this._destory = function () {
        this.parent = undefined;
        this.parentKey = undefined;
        this.value = undefined;
        this.originalValue = undefined;
    };
}).call(DataSet.prototype);