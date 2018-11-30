module.exports = copyData;

/**
 * any problem or bug (torpedo1.tw@gmail.com)
 */

/**
 * start here
 */
function copyData(data) {
    debugger;

    var result;
    var toString = Object.prototype.toString;
    var type = getType(data);

    // 若(data)是基本型數據(不含子孫物件)
    if (data == null || (type != 'array' && type != 'map' && !isPlainObject(data))) {
        result = data;
        return result;
    }
    /* ---------------------------------- */
    // data含有子孫物件
    if (type == 'map') {
        result = new Map();
    } else if (type == 'array') {
        result = [];
    } else {
        result = {};
    }

    copyChild(result, data);
    //////////////////////////////////////////////////
    /**
     * 會進來的(data)一定是有子孫元素
     */
    function copyChild(target, data) {
        debugger;
        var clone;
        var dataType = getType(data);
        var targetType = getType(target);
        /* ---------------------------------- */
        if (targetType != dataType) {
            throw new Error('要拷貝的數據型態不同');
        } else if (dataType == 'map') {
            // 若是(Map)
            data.forEach(function(child, key) {
                var childType = getType(child);

                if (childType != 'array' && childType != 'map' && !isPlainObject(child)) {
                    // 若子物件是單純數據
                    target.set(key, child);
                } else {
                    // 若(child)物件還攜帶有子孫

                    // (clone)必須與(child)同型態
                    clone = getInitClone(childType);
                    /* ------------------------ */
                    // 遞回，把child拷貝到 clone
                    copyChild(clone, child);
                    target.set(key, clone);
                }
            });

        } else if (dataType == 'array') {
            // 若是(array)

            data.forEach(function(child, key) {
                var childType = getType(child);

                if (childType != 'array' && childType != 'map' && !isPlainObject(child)) {
                    // 若子物件是單純數據

                    target[key] = child;

                } else {
                    // 若子物件還攜帶有子孫

                    // (clone)必須與(child)同型態
                    clone = getInitClone(childType);
                    /* ------------------------ */
                    // 遞回，把child拷貝到 clone
                    copyChild(clone, child);
                    target[key] = clone;
                }
            });

        } else if (isPlainObject(data)) {
            // 若(data)是(PlainObject)
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var child = data[key];
                    var childType = getType(child);

                    if (childType != 'array' && childType != 'map' && !isPlainObject(child)) {
                        // 若子物件是單純數據

                        target[key] = child;

                    } else {
                        // 若子物件還攜帶有子孫

                        // (clone)必須與(child)同型態
                        clone = getInitClone(childType);
                        /* ------------------------ */
                        // 遞回，把child拷貝到 clone
                        copyChild(clone, child);
                        target[key] = clone;
                    }
                }
            }
        } else {
            throw new Error('data have no child');
        }
    };
    /* ---------------------------------- */
    return result;
};

function getInitClone(type) {
    var clone;
    switch (type) {
        case 'array':
            clone = [];
            break;
        case 'map':
            clone = new Map();
            break;
        default:
            clone = {};
            break;
    }
    return clone;
};

function isPlainObject(obj) {
    // debugger;

    var toString = Object.prototype.toString;
    var hasOwn = Object.prototype.hasOwnProperty;

    /* ---------------------------------- */
    var type = toString.call(obj);

    type = type.replace(/(^\s?\[object\s?)|(\]\s?$)/gi, '').toLowerCase();
    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if (obj == null || type != "object" || obj.nodeType) {
        return false;
    }

    try {
        // Not own constructor property must be Object
        if (obj.constructor &&
            !hasOwn.call(obj, "constructor") &&
            !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
        }
    } catch (e) {
        // IE8,9 Will throw exceptions on certain host objects #9897
        return false;
    }
    return true;
};

function getType(obj) {
    // debugger;

    var type = toString.call(obj);
    type = type.replace(/(^\s?\[object\s?)|(\]\s?$)/gi, '').toLowerCase();

    return type;
};