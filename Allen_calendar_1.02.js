// 2017/02/04

////////////////////////////////////////////////////////////////////////////////
/**
 * 使用方式
 *
 * $Allen_Calendar.create(dom, day)
 *
 * dom: inputDom
 * day: inputValue
 */
////////////////////////////////////////////////////////////////////////////////
/**
 * 月曆是綁在(body)用(position:absolute)
 */
////////////////////////////////////////////////////////////////////////////////
/**
 * 根據輸入的 year month 產生一個月曆
 */


function $Allen_Calendar() {
    'use strict';
    // debugger;
    /* -------------------------------------------- */
    var self = this;
    this.fn = this.constructor; // 月曆所屬類別函式
    /* -------------------------------------------- */
    // (input)輸入值
    this.inputValue;
    /* -------------------------------------------- */
    // dom
    this.domList = {
        'parent': undefined,
        'container': undefined, // 月曆本身最上層的容器
        'table': undefined, // 月曆本身的 table
        'body': undefined, // body_tag
        'table_head': undefined,
        'table_body': undefined
    };

    this.button_domList = {
        'close': undefined,
        'prevMonth': undefined,
        'nextMonth': undefined
    };
    /* -------------------------------------------- */
    // 呼叫月曆物件的座標
    this.parentPosition = {
        'top': 0,
        'bottom': 0,
        'left': 0
    };

    /* -------------------------------------------- */
    // 日曆位置資訊
    this.position = {
        'top': 0,
        'left': 0
    };

    /* -------------------------------------------- */
    // 今日的資訊，每次新增修改都要設定
    this.todyDate = null;

    /**
     * 今日的資訊，每次新增修改都要設定
     * 防止遇到 AM0:000
     */
    this.today = {
        year: null,
        month: null,
        day: null,
        week: null,
        time: null,
        dayNumber: null
    };
    /* -------------------------------------------- */
    // 主要外部設定值
    this.target_year;
    this.target_month;
    /* -------------------------------------------- */
    // 要被計算的值
    this.days; // 這月有幾天
    this.firstDayWeek; // 這月第一天是星期幾
    /* -------------------------------------------- */

    this.totalCells = 42; // 共有幾格
    /* -------------------------------------------- */
    // 限制資訊
    this.limitMinDayNumber = this.fn.limitMinDayNumber || null; // 最小限制日期
    this.limitMaxDayNumber = this.fn.limitMaxDayNumber || null; // 最大限制日期
    /**
     * 沒作用的日子 => [20160417, 20171231]
     */
    this.noActiveDay_array = this.fn.noActiveDay_array || [];

    /* -------------------------------------------- */
    this.dayData_array = []; // 主要放資料的地方
    /* -------------------------------------------- */
    // 設定日期的輸出格式

    // 日期格式
    this.outPutFormat = this.fn.outPutFormat || null;

    // 星期文字
    this.weekTitle = this.fn.weekTitle || null;
    /* ====================================================================== */

};
////////////////////////////////////////////////////////////////////////////////
/**
 * API
 */
(function() {

    this.__API = function() {};

    /* ====================================================================== */
    /**
     * 創建月曆的過程
     *
     */
    this.create = function(parentDom, year, month) {
        // debugger;

        this.domList.parent = parentDom;
        this.domList.body = document.querySelector('body');

        this.target_year = year ? Number(year) : undefined;
        this.target_month = month ? Number(month) : undefined;
        /* ---------------------------------- */

        // 檢查一些參數
        this.checkInput();

        // (model)處理數據(相對應數據日期計算)
        this.model();

        // (view)
        this.creatView();

        // 顯示日曆
        this.showCalendar();
    };
    /* ====================================================================== */
    /**
     * 修改月曆的過程()
     */
    this.edit = function(year, month) {
        // debugger;

        this.target_year = year ? Number(year) : undefined;
        this.target_month = month ? Number(month) : undefined;

        /* ---------------------------------- */

        this.checkInput();

        // (model)處理數據
        this.model();

        // console.dir(this.dayData_array);

        // (view)
        this.editView();

        // 顯示日曆
        this.showCalendar();
    };
    /* ====================================================================== */
    /**
     * 移除月曆個過程
     */
    this.remove = function() {

        // document.onclick = null;
        try {
            this.fn.calendarObj = undefined;
            this.domList.body.removeChild(this.domList.container);
            $(document).unbind('click.calendar');
        } catch (error) {

        }
    };

}).call($Allen_Calendar.prototype);
/* ========================================================================== */
/**
 * model
 */
(function() {
    this.__model = function() {};
    /* =======================================================================*/
    /**
     * 處理所需的數據
     */
    this.model = function() {
        // debugger;

        // 更新今日資訊
        this.upDateTodayInfo();

        // 建構(table)所需的數據
        this.createTableModel();
    };
    /* =======================================================================*/
    /**
     * 更新今天的資訊，只要新建或修改閱歷都要用到
     *
     */
    this.upDateTodayInfo = function() {
        this.todyDate = new Date();

        this.today.year = this.todyDate.getFullYear();
        this.today.month = this.todyDate.getMonth() + 1;
        this.today.day = this.todyDate.getDate();
        this.today.week = this.todyDate.getDay();
        this.today.time = this.todyDate.getTime();

        this.today.dayNumber = this.today.year * 10000 +
            this.today.month * 100 + this.today.day;


        // 若年沒被初始化，則用今日
        (!this.target_year) && (this.target_year = this.today.year);


        // 若月沒被初始化，則用今日
        (!this.target_month) && (this.target_month = this.today.month);

    };
    /* ====================================================================== */
    /**
     * 處理建構(table)所需的數據
     *
     */
    this.createTableModel = function() {
        // debugger;

        this.dayData_array = [];
        /* -------------------------------------------- */
        // 這個月的第一天是星期幾
        this.firstDayWeek = this.fn.getFirstDayWeek(this.target_year, this.target_month);

        // 這個月共有幾天
        this.days = this.fn.getMonthDays(this.target_year, this.target_month);


        // 檢查最小限制日期
        this.limitMinDayNumber = this.limitMinDayNumber || this.today.dayNumber;

        /* ------------------------------------------------------------------ */
        // 空白的頭
        var i = 0

        for (; i < this.firstDayWeek; i++) {

            this.dayData_array.push('');
        }
        /* ------------------------------------------------------------------ */
        // 月曆數據

        for (j = 1; i < (this.firstDayWeek + this.days); i++, j++) {

            var className = '';
            var active = true;

            var dayNumber = Number(this.target_year) * 10000 +
                Number(this.target_month) * 100 + Number(j);


            if (dayNumber < this.limitMinDayNumber || dayNumber < this.today.dayNumber) {
                // 在最小限制日期之前

                className = "calendar-cell-beforDay";
                active = false;
            } else if (this.limitMaxDayNumber && dayNumber > this.limitMaxDayNumber) {
                // 在最大限制日之後

                className = "calendar-cell-beforDay";
                active = false;
            } else {
                // 沒有過期的日子

                if (this.noActiveDay_array.length > 0) {
                    /**
                     * 若有設置限制日期
                     */
                    var index = this.noActiveDay_array.indexOf(dayNumber);

                    if (index < 0) {
                        // 若沒有在限制陣列中
                        className = "calendar-cell-selectDay";

                    } else {
                        className = "calendar-cell-noSelectDay";
                        active = false;
                    }
                } else {
                    // 沒有設置限制日期
                    className = "calendar-cell-selectDay";
                }
            }
            /* ---------------------------------- */
            var perDayData = {
                'year': this.target_year,
                'month': this.target_month,
                'day': j,
                'dayNumber': dayNumber,
                'active': active,
                'className': className
            };
            this.dayData_array.push(perDayData);
        }

        /* ------------------------------------------------------------------ */
        // 空白的尾
        // debugger;

        for (; i < this.totalCells; i++) {
            this.dayData_array.push('');
        }
    };

}).call($Allen_Calendar.prototype);
/* ========================================================================== */

(function() {
    this.__view = function() {};
    /* ====================================================================== */
    this.creatView = function() {
        // 取得父親的座標值
        this.getParentPosition();

        // container
        this.constructContainerView();

        // head
        this.constructHeadView();

        // table, table_head
        this.constructTable_head();

        // table_body
        this.constructTableBodyView();

        // 綁定所有事件
        this.bindEvent();

        // 設定月曆的位置
        this.setPosition();
    };
    /* ====================================================================== */
    /**
     * 編輯用，可省去一些已有的步驟
     */
    this.editView = function() {
        // 取得父親的座標值
        this.getParentPosition();

        // 修改標題的日期
        this.changHeadInfo();

        // table_body
        this.constructTableBodyView();

        this.setPosition();

    };
    /* ====================================================================== */

    /**
     * 建構容器外觀
     */
    this.constructContainerView = function() {
        var container = this.domList.container = document.createElement('div');

        var style = container.style;

        style.setProperty('position', 'absolute');
        style.setProperty('z-index', '100');
        style.setProperty('visibility', 'hidden');

        container.className = 'AllenCalendar';

        this.domList.body.appendChild(container);
    };
    /* ====================================================================== */
    /**
     * 建構表頭的元素
     */
    this.constructHeadView = function() {


        var head = document.createElement('div');
        head.classList.add('calendar-header');

        var title = document.createElement('div');
        title.classList.add('calendar-head-title');


        /* ---------------------------------- */
        // close_button

        var closeDom = this.button_domList.close =
            document.createElement('a');

        closeDom.textContent = '╳';
        closeDom.classList.add('calendar-close')
        closeDom.setAttribute('href', "javascript:;");

        head.appendChild(closeDom);


        /* ---------------------------------- */
        // pre_button
        var prevDom = this.button_domList.prevMonth =
            document.createElement('a');

        prevDom.textContent = '<';
        prevDom.classList.add('calendar-prev');
        prevDom.setAttribute('href', "javascript:;");
        prevDom.setAttribute('title', 'prev');

        title.appendChild(prevDom);
        /* ---------------------------------- */
        // dayInfo
        var dayInfo = document.createElement('div');

        var html = '<span class="calendar-year">' + this.target_year + '</span>';
        html += '<span class="calendar-month">' + this.target_month + '</span>';
        dayInfo.innerHTML = html;


        title.appendChild(dayInfo);
        /* ---------------------------------- */
        // next_button
        var nextDom = this.button_domList.nextMonth =
            document.createElement('a');

        nextDom.textContent = '>';
        nextDom.classList.add('calendar-next');
        nextDom.setAttribute('href', "javascript:;");
        nextDom.setAttribute('title', 'next');

        title.appendChild(nextDom);
        /* ---------------------------------- */

        head.appendChild(title);

        this.domList.container.appendChild(head);
    };


    /* ====================================================================== */
    /**
     * 建構(table本體)與(thead)
     */
    this.constructTable_head = function() {

        var table = this.domList.table = document.createElement('table');
        table.classList.add('calendar-table');

        var thead = this.domList.table_head = document.createElement('thead');
        var tbody = this.domList.table_body = document.createElement('tbody');

        table.appendChild(thead);
        table.appendChild(tbody);

        this.domList.container.appendChild(table);
        /* ------------------------------------------------------------------ */

        // 建構 title
        var row = thead.insertRow(0);
        row.classList.add('calendar-tableTitle');

        for (var i = 0; i < this.weekTitle.length; i++) {
            var cell = row.insertCell(i);
            cell.innerHTML = '<span>' +
                this.weekTitle[i] + '</span>';
        }
    };
    /* ====================================================================== */

    /**
     * 建構table
     */
    this.constructTableBodyView = function() {
        // debugger;

        var tbody = this.domList.table_body;
        tbody.innerHTML = '';

        /* ------------------------------------------------------------------ */
        // 建構月曆內容
        var rowDom;
        console.dir(this.dayData_array);
        for (var i = 0, rowIndex = 0; i < this.dayData_array.length; i++) {

            if (i % 7 == 0) {
                rowDom = document.createElement('tr');
                rowDom.classList.add('calendar-tableDay');

                this.domList.table_body.appendChild(rowDom);
                ++rowIndex;
            }
            /* ---------------------------------- */
            var cellDom = document.createElement('td');;

            var cellData = this.dayData_array[i] || '';

            /* ---------------------------------- */
            // span
            var span = document.createElement('span');

            if (typeof cellData != 'string') {
                // 有日子

                if (cellData.active) {
                    // 日子可選
                    var a = document.createElement('a');
                    a.setAttribute('href', 'javascript:;');
                    a.dataset.dayDate = cellData.year + "-" + cellData.month + '-' + cellData.day;
                    a.textContent = cellData.day

                    span.dataset.active = 1;
                    span.appendChild(a);
                    // a.addEventListener('click', this.event_dayEvent); // 綁定事件
                } else {
                    // 不可選的日子
                    span.dataset.active = 0;
                    span.textContent = cellData.day;
                }

                cellDom.classList.add(cellData.className);
            } else {
                // 空白，非日子
                // span.dataset.active = 0;
                span.textContent = '';
                cellDom.classList.add('calendar-noDay');
            }

            cellDom.appendChild(span);
            rowDom.appendChild(cellDom);
        }
    };
    /* ====================================================================== */
    /**
     * 顯示月曆，月曆建構之初 visible:hidden
     */
    this.showCalendar = function() {
        this.domList.container.style.visibility = 'visible';
    };
    /* ====================================================================== */
    /**
     * 更改標頭的數值
     */
    this.changHeadInfo = function() {
        var container = this.domList.container;

        container.querySelector('.calendar-head-title .calendar-month').innerText = this.target_month;
        container.querySelector('.calendar-head-title .calendar-year').innerText = this.target_year;
    };

    /* ====================================================================== */
    /**
     * 取得所屬父親相關座標
     */
    this.getParentPosition = function() {

        var position = $(this.domList.parent).offset();

        // (top)的絕對位置
        this.parentPosition.top = position.top;

        // (left)的絕對位置
        this.parentPosition.left = position.left;

        // (bottom)的絕對位置
        this.parentPosition.bottom = this.parentPosition.top + this.domList.parent.offsetHeight;

        if (isNaN(this.parentPosition.bottom) ||
            isNaN(this.parentPosition.left) ||
            isNaN(this.parentPosition.top)
        ) {
            throw new TypeError('getParent position have error');
        }
    };
    /* ====================================================================== */
}).call($Allen_Calendar.prototype);

/* ========================================================================== */
/**
 * set, get, check
 */

(function() {
    this.__set_CheckOption = function() {};

    /* ====================================================================== */
    /**
     * 輸入的檢查
     */
    this.checkInput = function() {
        var error_array = [];

        // dom
        if (!this.domList.parent &&
            typeof this.domList.parent == 'undefined') {
            error_array.push('no setting parentDom');
        }

        // 設定日期的輸出格式
        if (!this.outPutFormat) {
            error_array.push('no setting dayFormat');
        }

        // 星期文字
        if (!this.weekTitle) {
            error_array.push('no setting 星期格式');
        }

        // noActiveDay_array(日曆沒作用日)
        if (!Array.isArray(this.noActiveDay_array)) {
            error_array.push('noActiveDay must be array');
        }
        // target_year
        if (this.target_year && isNaN(this.target_year)) {
            error_array.push('input year must be number')
        }
        // target_month
        if (this.target_month && isNaN(this.target_month)) {
            error_array.push('input month must be number')
        }

        if (error_array.length > 0) {
            throw new Error(error_array.join(' | '));
        }
    };
    /* ====================================================================== */
    /**
     * 設定月曆的位置
     */
    this.setPosition = function() {
        // debugger;

        var containerHeight = this.domList.container.offsetHeight;

        var screen_positon = {
            'top': undefined,
            'bottom': undefined
        };

        screen_positon.top = screen.getScrollTop() || 0;
        screen_positon.bottom = screen.getCurrentScreenBottom() || 0;
        /* ---------------------------------- */
        // 橋位子
        var vertical, horizontal = this.parentPosition.left;

        if (
            ((this.parentPosition.bottom + containerHeight) > screen_positon.bottom) &&
            ((this.parentPosition.top - containerHeight) > screen_positon.top)
        ) {
            // 若月曆會超過畫面底部，但(input)上面有空間
            vertical = this.parentPosition.top - containerHeight;
        } else {
            // (input)下面有空間
            vertical = this.parentPosition.bottom;
        }
        /* ---------------------------------- */

        $(this.domList.container).css({
            'top': vertical + 'px',
            'left': horizontal + 'px'
        });
    };
    /* ====================================================================== */
    /**
     * 從父親那邊更新資料
     */
    this.upDateDataFromParent = function() {

        this.limitMinDayNumber = this.fn.limitMinDayNumber || null; // 最小限制日期
        this.limitMaxDayNumber = this.fn.limitMaxDayNumber || null; // 最大限制日期

        this.noActiveDay_array = this.fn.noActiveDay_array || [];

        // 日期格式
        this.outPutFormat = this.fn.outPutFormat || null;

        // 星期文字
        this.weekTitle = this.fn.weekTitle || null;
    };

}).call($Allen_Calendar.prototype);


/* ========================================================================== */

(function() {
    this.__event = function() {};

    /**
     * 綁定事件
     */
    this.bindEvent = function() {
        var self = this;

        // prevMonth_button
        this.button_domList.prevMonth.addEventListener('click', function(e) {
            self.event_changeMonth.call(self, -1, e);
        });
        /* -------------------------------------------- */
        // nextMonth_button
        this.button_domList.nextMonth.addEventListener('click', function(e) {
            self.event_changeMonth.call(self, 1, e);
        });
        /* -------------------------------------------- */
        // close_button
        this.button_domList.close.addEventListener('click', closeCalendar_event);

        $(document).bind('click.calendar', closeCalendar_event);

        function closeCalendar_event(e) {
            e.stopPropagation();
            // alert('close: ' + e.currentTarget);
            self.event_removeCalendar.call(self, e);
        };
        /* -------------------------------------------- */
        // day
        this.domList.table.addEventListener('click', function(e) {
            self.event_changeDay.call(self, e);
        });
    };
    /* ====================================================================== */

    /**
     * 會被上月，下月按鍵的事件呼叫
     *
     * can't call by window
     */
    this.event_changeMonth = function(increaseMonth, e) {
        'use strict';
        // debugger;

        e = e || window.event;
        try {
            e.preventDefault();
        } catch (e) {
            e.returnValue = false;
        }

        try {
            e.stopPropagation();
        } catch (e) {
            e.cancelBubble = true;
        }
        /* ---------------------------------- */

        this.target_month += Number(increaseMonth);

        if (this.target_month > 12) {
            ++this.target_year;
            this.target_month = 1;
        }

        if (this.target_month < 1) {
            --this.target_year;
            this.target_month = 12;
        }
        this.edit(this.target_year, this.target_month);
    };
    /* ====================================================================== */
    /**
     * 移除月曆的事件
     *
     * can't call by window
     */
    this.event_removeCalendar = function(e) {
        'use strict';
        // debugger;

        e = e || window.event;
        var target = e.target || e.srcElement;

        try {
            e.preventDefault();
        } catch (e) {
            e.returnValue = false;
        }

        if (/input/gi.test(target.nodeName)) {
            return;
        }
        /* ---------------------------------- */

        this.remove();
    };
    /* ====================================================================== */

    /**
     * 日期按鍵的事件
     *
     * don't call by window
     */
    this.event_changeDay = function(e) {
        // debugger;

        e = e || window.event;
        var target = e.target || e.srcElement;

        try {
            e.preventDefault();
        } catch (e) {
            e.returnValue = false;
        }

        try {
            e.stopPropagation();
        } catch (e) {
            e.cancelBubble = true;
        }
        /* ------------------------------------------- */

        if (!/a/gi.test(target.nodeName) ||
            typeof target.dataset.dayDate == 'undefined') {
            return;
        }

        // 從自身的標籤屬性上取得日期資訊
        var day = target.dataset.dayDate || '';

        // 把日期輸出在 input
        this.domList.parent.value = day;
        this.inputValue = day;
    };
    /* ====================================================================== */
}).call($Allen_Calendar.prototype);
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * 類別參數
 */

(function(self) {
    /**
     * dom => 與(calendar)物件的對應
     */
    self.calendarObj; // 記錄已開啟的月曆物件
    self.targetDom; // 隸屬的(input)
    /* ---------------------------------- */
    self.weekTitle = ["日", "一", "二", "三", "四", "五", "六"];
    self.noActiveDay_array; // 不作用的日子
    self.outPutFormat = 'YYYY-MM-DD'; // 日期格式
    self.limitMinDayNumber; // 最小限制日期
    self.limitMaxDayNumber; // 最大限制日期
    /* ====================================================================== */
    self.__class = function() {

    };
})($Allen_Calendar);
/* ========================================================================== */
(function(self) {

    self.__tool = function name(params) {};
    /* ====================================================================== */

    /**
     * @param {string} name 日期，格式為(XXXX-XX-XX)(XXXX/XX/XX)(XXXX XX XX)(XXXX\xx\xx)
     * @return {array} [year, month, day]
     */
    self.getDayFromString = function(dayString) {
        // debugger;
        String(dayString);
        var reg = /(\d{4})[-\s\\/](\d{1,2})[-\s\\/](\d{1,2})/g;

        if (!(x = reg.exec(dayString))) {
            throw new TypeError('日期格式不對');
        }

        var result = {};
        result.y = Number(x[1]) || null;
        result.m = Number(x[2]) || null;
        result.d = Number(x[3]) || null;

        return result;
    };
    /* ====================================================================== */
    /**
     * 檢查輸入的日期
     */
    self.checkDay = function(year, month, day) {

        var date = new Date(year, month - 1, day);

        return {
            'y': date.getFullYear(),
            'm': date.getMonth() + 1,
            'd': date.getDate()
        };
    };
    /* ====================================================================== */
    /**
     * 比較麻煩之處
     *
     * 將輸入的日期化為需要的格式
     */
    self.formatDay = function(year, month, day) {
        // debugger;

        var dayformat = {
            "Y": Number(year), //獲取年
            "M": Number(month), //獲取月
            "D": Number(day)
        };
        var result = false, //判斷是否存在待替換的字元
            reg = null, //正規表示式
            day = ""; //日期
        var output = new String($Allen_Calendar.outPutFormat);

        for (var d in dayformat) { //過濾日期標示符號
            //判斷是否有待格式化的字元
            reg = new RegExp("[" + d + "]{1,}", "gi");
            result = reg.test(output);

            if (result) //驗證是否存在
            {
                day = dayformat[d]; //被替換的日期
                day = day < 10 ? ("0" + day) : day;
                output = output.replace(reg, day);
            }
        }
        return output;
    };
    /* ====================================================================== */
    /**
     * 獲得該月第一天是星期幾
     *
     * @param {type} year
     * @param {type} month
     * @returns {Number}
     */
    self.getFirstDayWeek = function(year, month) {
        var tmpDate = new Date(year, month - 1, 1);
        var firstDayWeek = tmpDate.getDay();

        return firstDayWeek;
    };

    /* ====================================================================== */
    /**
     * 獲得該月有幾天
     *
     * @param {type} year
     * @param {type} month
     * @returns {undefined}
     */
    self.getMonthDays = function(year, month) {
        var date = new Date(year, month, 0);

        // console.dir(date);

        return date.getDate();
    };
    /* ====================================================================== */

})($Allen_Calendar);

/* ========================================================================== */
(function(self) {
    self.__setGet = function() {};
    /* ====================================================================== */
    /**
     * 設置最小的日期限制
     *
     * @param {string} dayString 輸入日期(2014-12-2)(2014/12/2)
     *
     */
    self.setLimitMinDayFromString = function(dayString) {
        var dayData = self.getDayFromString(dayString);
        self.setLimitMinDay(dayData.y, dayData.m, dayData.d);
    };
    /* ====================================================================== */
    /**
     * 設置最大的日期限制
     *
     * @param {string} dayString 輸入日期(2014-12-2)(2014/12/2)
     *
     */
    self.setLimitMaxDayFromString = function(dayString) {

        var dayData = self.getDayFromString(dayString);
        self.setLimitMaxDay(dayData.y, dayData.m, dayData.d);
    };
    /* ====================================================================== */
    self.setLimitMinDay = function(year, month, day) {
        // debugger;

        if (!year || !month || !day) {
            // reset
            self.limitMinDayNumber = undefined;

        } else {
            var dayData = self.checkDay(year, month, day);
            self.limitMinDayNumber = (dayData.y * 10000) +
                (dayData.m * 100) + dayData.d;
        }

        (self.calendarObj) && (self.calendarObj.upDateDataFromParent());
    };
    /* ====================================================================== */
    self.setLimitMaxDay = function(year, month, day) {
        // debugger;
        if (!year || !month || !day) {
            // reset
            self.limitMaxDayNumber = undefined;

        } else {

            var dayData = self.checkDay(year, month, day);
            self.limitMaxDayNumber = (dayData.y * 10000) +
                (dayData.m * 100) + dayData.d;
        }
        (self.calendarObj) && (self.calendarObj.upDateDataFromParent());
    };
    /* ====================================================================== */

    /**
     * 設定無作用日
     */
    self.setNoActiveDay = function(dataArray) {
        if (Array.isArray(dataArray)) {
            self.noActiveDay_array = dataArray;
        } else {
            self.noActiveDay_array = [];
        }
        (self.calendarObj) && (self.calendarObj.upDateDataFromParent());
    };
})($Allen_Calendar);
/* ========================================================================== */
/**
 * (API)
 */
(function(self) {
    self.__API = function() {};
    /* ====================================================================== */
    /**
     * 移除所有的月曆(calendar)
     *
     * @param
     * @returns
     */
    self.removeAll = function() {

        self.calendarObj && (self.calendarObj.remove());
    };
    /* ====================================================================== */
    /*
     * (API)創建，修改月曆
     */
    self.create = function(target, inputValue) {
        // debugger;

        var error, dayData = {},
            calendar = self.calendarObj;
        /* -------------------------------------------- */
        if (typeof target.nodeName == 'undefined') {
            throw new Error('u should select dom');
        }
        inputValue = inputValue.trim();
        /* -------------------------------------------- */
        // 轉化文字為日期

        try {

            // 文字格式不對的話
            if (inputValue.length > 0) {
                dayData = self.getDayFromString(inputValue);
            }
        } catch (e) {
            error = e;
        }
        /* -------------------------------------------- */
        if (target === self.targetDom && calendar) {
            // 若是同個input，且已經開啟了月曆
            console.log('若是同個input，且已經開啟了月曆');

            if (dayData.y == calendar.target_year && dayData.m == calendar.target_month) {
                console.log('日期相同不用修改');
            } else {
                console.log('修改日曆');
                calendar.edit(dayData.y, dayData.m);
            };
        } else {

            /* --------------------------------------------------- */
            console.log('創建日曆');

            // 移除之前別的月曆，若有的話
            (calendar) && (calendar.remove());

            self.targetDom = target;

            self.calendarObj = calendar = new $Allen_Calendar();
            calendar.create(target, dayData.y, dayData.m);
            calendar.inputValue = inputValue;
        }

        if (error) {
            throw new Error(error.toString());
        }
    };


})($Allen_Calendar);

/* ========================================================================== */