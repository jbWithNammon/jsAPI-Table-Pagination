'use strict';
//document.write('<scr' + 'ipt type="text/javascript" src="constants.js" ></scr' + 'ipt>');

var KbtTable = function (_el, _options) {
    this.rootEl = _el;
    this.rootOptions = _options;
    //if (_options == undefined) {
    //    this.rootOptions = {
    //        header: [],
    //        body: [],
    //        data: [{ "PageIndex": "1" }, { "PageSize": "10" }],
    //        checkbox: false,
    //        idKey: '',
    //        fnGetData:''
    //    }
    //}

};
//KbtTable.DEFAULTS._options = {
//    header: ["เลขที่ใบขน", "Invoice No.", "Invoice Date", "สถานะบัญชี", "เลขที่บัญชี", "ผู้ใช้งาน"],
//    body: ["ImportEntryNo", "InvoiceNo", "InvoiceDate", "DocumentStatus", "DocumentNo", "CreateBy"],
//    orderBy: ["CreateDate", false],
//    data: res,
//    checkbox: false,
//    rowLink: false,
//    iconEdit: true,
//    idKey: ["InvoiceNo", "DocumentNo"],
//    fnGetData: 'getKbtTable',
//    fnRowClick: 'editClick',
//    fnCellClick: 'editClick',
//    fnChange:'chkChanged',
//    inputCell:["InvoiceDate"],
//    iconDel:true
//}

KbtTable.prototype.genTable = function () {
    let options = this.rootOptions;
    let data = options.data;
    let el = this.rootEl;
    let changeH = false;
    let ctrlColRange = 0;
  
    if (options.checkbox) {
        ctrlColRange++;
    }
    if (options.iconEdit) {
        ctrlColRange++;
    }
    if (options.iconDel){
        ctrlColRange++;
    }

    let table, tr, pagination;
    //let pIndex = this.options.data.PageIndex
    //let pSize = this.options.data.PageSize;
    let col, asc;
    if (options.orderBy == undefined) {
        col = '';
        asc = '';
    }
    else {
        col = options.orderBy[0];
        asc = options.orderBy[1];
    }

    /*=== get older thead ===*/
    let thead = $('.kbt-table thead', el).html();
    table = '<div class="col-md-12 div-cov none-padding"><input type="hidden" class="fnGetData" value="' + options.fnGetData + '" />';
    table += '<input type="hidden" class="fnRowClick" value="' + options.fnRowClick + '" />';
    table += '<input type="hidden" class="fnCellClick" value="' + options.fnCellClick + '" />';
    table += '<input type="hidden" class="fnCellDelClick" value="' + options.fnCellDelClick + '" />';
    table += '<input type="hidden" class="fnChange" value="' + options.fnChange + '" />';
    table += '<input type="hidden" class="defOrderBy" value="' + col + '|' + asc + '" />';
    // table += '<input type="hidden" class="eventSort" value="false" />';
    // table += '<input type="hidden" class="eventSize" value="false" />';
    table += '<input type="hidden" class="behaveType" value="None" />';
    table += '<input type="hidden" class="rowLinkId" value="None" />';
    table += '<table class="table table-striped table-hover kbt-table">';

    /*=== thead == undefined is dont builded table yet|| kbtOrderByCol == undefined is event from something which it doesn't wanna build thead (from btn,paging) ===*/
    let sort = $('div input.behaveType', el).val() == undefined ? BehaveType.None : $('div input.behaveType', el).val();
    $(".kbt-table thead tr>th", el).each(function () {
        //add condition for correct process in case none first column
        if ($(this).attr('name') != 'chkbx') {
            if (options.checkbox || options.iconEdit || options.iconDel) {
                if ($(this).attr('name') != options.header[($(this).index() - ctrlColRange)]) {
                    changeH = true;
                }
            }
            else {
                if ($(this).attr('name') != options.header[$(this).index()]) {
                    changeH = true;
                }
            }
        }
    });
    if (thead == undefined || sort != BehaveType.Sort || changeH) {// event from search button
        table += '<thead class="kbt-thead"><tr>';
        for (let i = 0; i < options.header.length; i++) {
            //if (options.checkbox && i == 0) {
            //    table += '<th class="th-edit" name="chkbx"><label><input type="checkbox" class="head-chkbx"/></label></th>';
            //} else if (options.iconEdit && i == 0) {
            //    table += '<th class="th-edit">แก้ไข</th>';
            //}
            //else if (options.iconDel && i == 0) {
            //    table += '<th class="th-edit">ลบ</th>';
            //}

            if (options.checkbox && i == 0) {
                table += '<th class="th-edit" name="chkbx"><label><input type="checkbox" class="head-chkbx"/></label></th>';
            }
            if (options.iconEdit && i == 0) {
                table += '<th class="th-edit">แก้ไข</th>';
            }
            if (options.iconDel && i == 0) {
                table += '<th class="th-edit">ลบ</th>';
            }
            
            table += '<th class="data-text" name="' + options.header[i] + '">' + options.header[i] + '<i></i></th>';
        }
        table += '</tr></thead><tbody>';
    }
    else {
        table += '<thead class="kbt-thead">' + thead + '</thead><tbody>';
        $('div input.behaveType', el).val(BehaveType.None);
    }


    /*=== check have data ===*/
    if (options.data.ListOfResult == null || options.data.ListOfResult == undefined
        || options.data.ListOfResult.length == 0) {
        /*=== dont have data ===*/
        this.genEmptyRow(function (result) {
            tr = result;
        });
    }
    else {
        /*=== have data ===*/
        this.genDataRow(function (result) {
            tr = result;
        });
    }
    table += tr;
    table += '</tbody></table></div>'
    let tmp = '';
    this.genPagination(function (result) {
        tmp = result;
    });
    table += tmp;
    $(el).empty();
    $(el).append(table);

    /*=== event group ===*/
    $("ul.kbt-page-size", el).on("click", "li", function (e) {
        let prev = $('span.kbt-btn-size', el).text();
        let current = this.innerText;
        if (prev != current) {
            $('span.kbt-btn-size', el).text(current);
            $('div input.behaveType', el).val(BehaveType.PageSize);
            let fnc = $('input.fnGetData', el).val();
            window[fnc]();
        }
    });
    $("ul.kbt-page-no", el).on("click", "li", function (e) {
        let prev, current, gyp;
        let active = false;
        $("ul.kbt-page-no > li", el).each(function () {
            if ($(this).hasClass("active")) {
                prev = $(this).val();
            }
        });
        current = $(this).val();
        if (prev != current) {
            $("ul.kbt-page-no > li", el).each(function () {
                if ($(this).hasClass("active")) {
                    $(this).removeClass("active");
                }
                if ($(this).val() == current && !active) {
                    if ($(this).hasClass('navi')) {
                        gyp = this;
                    } else {
                        $(this).addClass("active");
                        active = true;
                    }
                }
            });
            if (!active) {
                $(gyp).addClass("active");
            }
            $('div input.behaveType', el).val(BehaveType.PageIndex);
            let fnc = $('input.fnGetData', el).val();
            window[fnc]();
        }
    });
    $(".kbt-table", el).on("click", ".kbt-thead th", function (e) {
        /*=== if event derive checkbox header then dont effect ===*/
        if ($(this).hasClass('un-sort')) {
            e.preventDefault();
        }
        else if ($(this).hasClass('data-text')) {
            let asc = true;
            let orderBy = '';
            orderBy = $('.kbt-table tbody tr:first td:nth-child(' + ($(this).index() + 1) + ')', el).attr('name');
            let child = $(this).find("i");
            $(".kbt-table th", el).each(function () {
                let tmp = $(this).find("i");
                $(tmp).not(child).removeClass('glyphicon glyphicon-chevron-up');
                $(tmp).not(child).removeClass('glyphicon glyphicon-chevron-down');
            });

            if ($(child).hasClass("glyphicon glyphicon-chevron-up")) {
                $(child).removeClass("glyphicon glyphicon-chevron-up");
                $(child).addClass("glyphicon glyphicon-chevron-down");
                asc = false;
            } else {
                $(child).removeClass("glyphicon glyphicon-chevron-down");
                $(child).addClass("glyphicon glyphicon-chevron-up");
                asc = true;
            }
            $('input.defOrderBy', el).val(orderBy + '|' + asc);
            $('input.behaveType', el).val(BehaveType.Sort);
            let fnc = $('input.fnGetData', el).val();
            window[fnc]();
        }
    });
    $(".head-chkbx", el).on("change", function (e) {
        let index = e.delegateTarget.parentNode.parentNode.cellIndex;
        let table = e.delegateTarget.parentNode.parentNode.parentNode.parentNode.parentNode;
        let ele = this, chkEle, fact = $(ele).prop('checked');
        $('tbody tr', table).each(function () {
            $(this).find('td:nth-child(' + (index + 1) + ') > input.chkbx').not(':disabled').prop("checked", fact);
            if (fact) {
                $(this).find('td:nth-child(' + (index + 1) + ') > input.chkbx').not(':disabled').prev().addClass('choosed');
            }
            else {
                $(this).find('td:nth-child(' + (index + 1) + ') > input.chkbx').not(':disabled').prev().removeClass('choosed');
            }
        });
    });
    $("tr.row-link td", el).on("click", function (e) {
        let td = e.delegateTarget;
        let tr = $(td).closest('tr');
        if ($(td).hasClass('td-edit') || $(td).hasClass('td-del') || $(td).closest("input[type=button]").hasClass("btn"))  {
            //$('input.id-key').removeclass('choosed');
            //$('input.id-key', td).addclass('choosed');
            //let fnc = $('input.fncellclick', e.delegatetarget.parentnode.parentnode.parentnode.parentnode).val();
            //window[fnc]();
        } else {
            $('input.id-key', el).removeClass('choosed');
            $('td:nth-child(1) input.id-key', tr).addClass('choosed');
            let fnc = $('input.fnRowClick', $(tr).parent().parent().parent()).val();
            window[fnc]();
        }

    });
    $("td.td-edit", el).on("click", "", function (e) {
        let td = e.delegateTarget;
        $('input.id-key', el).removeClass('choosed');
        $('input.id-key', td.parentNode).addClass('choosed');
        let fnc = $('input.fnCellClick', el).val();
        window[fnc]();
    });
    $("td.td-del", el).on("click", "", function (e) {
        let td = e.delegateTarget;
        $('input.id-key', el).removeClass('choosed');
        $('input.id-key', td.parentNode).addClass('choosed');
        let fnc = $('input.fnCellDelClick', el).val();
        window[fnc]();
    });
    $("input[type=button].btn", el).on("click", function (e) {
        let c_el = e.delegateTarget;
        let td = e.delegateTarget.parentNode;
        let tr = $(td).closest('tr');
        $('input.id-key', el).removeClass('choosed');
        $('td:nth-child(1) input.id-key', tr).addClass('choosed');
        let fncClick = $(c_el).attr("data-click-function");
        window[fncClick]();
    });
    $(".chkbx", el).on("change", function (e) {
        let td = e.delegateTarget.parentNode;
        let fact = $('input.chkbx', td).prop('checked');
        if (fact) {
            $('input.id-key', td).addClass('choosed');
        } else {
            $('input.id-key', td).removeClass('choosed');
        }
        let fnc = $('input.fnChange', el).val();
        if (!(fnc == undefined || fnc == "undefined" || fnc == "")) {
            window[fnc](e.delegateTarget.parentNode.parentNode, fact);
        }
    });
    //cho add resize column that have button in it
    if (options.columnWidth) {
        //$(".kbt-table", el).css("table-layout", "fixed");
        //$("thead > tr > th", el).each(function (i, obj) {
        //    $(obj).css("width", options.columnWidth[i]);
        //    $(obj).css("word-wrap", "break-word");
        //});
    }
    else {
        $("tbody tr:first td", el).each(function (i, obj) {
            if ($(obj).has("input[type=button]").length > 0) {
                $(obj).parent().parent().prev().find("tr:first th:nth-child(" + (i + 1) + ")").css("width", "1%");
            }
        });
    }
    if (!(options.rowColorSwitch == undefined || options.rowColorSwitch == null || options.rowColorSwitch)) {
        $("tbody tr td", el).each(function (i, obj) {
            $(obj).addClass("td-non-color-switch");
        });
    }
    //cho add change event on textbox for modify id-key according to input value
    $(".kbt-textbox", el).on("change", function (e) {
        let thisInput = e.delegateTarget;
        let td = e.delegateTarget.parentNode;
        let tr = e.delegateTarget.parentNode.parentNode;
        let tbody = e.delegateTarget.parentNode.parentNode.parentNode;
        let tdCellIndex = $(tr).find("td").index(td);
        let tdName = $("tr:first td:nth-child(" + (tdCellIndex + 1) +")", tbody).attr("name");
        var idKeyVal = $("input.id-key", tr).val().replace(/'/g,'"');
        var idKeyValObj = JSON.parse(idKeyVal);
        var newObj = {};
        $.each(idKeyValObj, function (key, value) {
            if (key == tdName) {
                newObj[key] = $(thisInput).val();
            }
            else {
                newObj[key] = idKeyValObj[key];
            }
        });
        $("input.id-key", tr).val(JSON.stringify(newObj));
    });

    

    /*=== end event group ===*/


    //setElement();
    //callback();
}
KbtTable.prototype.genDataRow = function (callback) {
    let options = this.rootOptions;
    let data = options.data;
    let ipCell = false;
    let btCell = false;
    let btInfo = options.buttonCell;

    let dr, tr = '';
    let key = options.idKey;
    //let data = options.data;
    let body = options.body;
    /*=== fix first tr for append column namme to td  ===*/
    let first = true;
    for (let i = 0; i < data.ListOfResult.length; i++) {
        dr = data.ListOfResult[i];
        if (options.rowLink) {
            tr += '<tr class="row-link kbt-pointer">';
        }
        else {
            tr += '<tr>';
        }
        let isKeyTxtGenerated = false;
        let keyTxt = '{';
        $.each(options.idKey, function (index, value) {
            keyTxt += "'" + value + "':'" + dr[value] + "',";
        });
        //for (var item in options.idKey) {
        //    keyTxt += "'" + item + "':'" + dr[item] + "',";
        //}
        keyTxt = keyTxt.slice(0, -1);
        keyTxt += '}';
        //if (options.checkbox) {
        //    tr += '<td name="chkbx"><input type="hidden" class="id-key" value="' + keyTxt + '" /><input type="checkbox" class="chkbx" /></td>';
        //}
        //else if (options.iconEdit) {
        //    tr += '<td name="chkbx" class="kbt-pointer td-edit"><input type="hidden" class="id-key" value="' + keyTxt + '" /><i class="glyphicon glyphicon-edit"></i></td>';
        //}
        //else if (options.iconDel) {
        //    tr += '<td name="chkbx" class="kbt-pointer td-edit"><input type="hidden" class="id-key" value="' + keyTxt + '" /><i class="glyphicon glyphicon-remove"></i></td>';
        //}

        if (options.checkbox) {
            if (!isKeyTxtGenerated) {
                tr += '<td name="chkbx"><input type="hidden" class="id-key" value="' + keyTxt + '" /><input type="checkbox" class="chkbx" /></td>';
                isKeyTxtGenerated = true;
            }
        }
        if (options.iconEdit) {
            if (!isKeyTxtGenerated) {
                tr += '<td name="chkbx" class="kbt-pointer td-edit"><input type="hidden" class="id-key" value="' + keyTxt + '" /><i class="glyphicon glyphicon-edit"></i></td>';
                isKeyTxtGenerated = true;
            }
            else {
                tr += '<td name="chkbx" class="kbt-pointer td-edit"><i class="glyphicon glyphicon-edit"></i></td>';
            }
        }
        if (options.iconDel) {
            if (!isKeyTxtGenerated) {
                tr += '<td name="chkbx" class="kbt-pointer td-del"><input type="hidden" class="id-key" value="' + keyTxt + '" /><i class="glyphicon glyphicon-remove"></i></td>';
                isKeyTxtGenerated = true;
            }
            else {
                tr += '<td name="chkbx" class="kbt-pointer td-del"><i class="glyphicon glyphicon-remove"></i></td>';
            }
        }
        for (let det in body) {
            this.checkInputCell(body[det], function (c) {
                ipCell = c;
            });
            this.checkButtonCell(body[det], function (c) {
                btCell = c;
            });
            let alignCenterStyle = "";
            if (btCell) {
                alignCenterStyle = ' style="text-align:center;" ';
            }
            for (let key in dr) {
                if (body[det] == key) {
                    
                    if (first) {
                        tr += '<td name="' + body[det] + '"' + alignCenterStyle + '>';
                    }
                    else {
                        tr += '<td' + alignCenterStyle + '>';
                    }

                    if (!(options.iconEdit || options.iconDel || options.checkbox)) {
                        if (key == body[0]) {
                            tr += '<input type="hidden" class="id-key" value="' + keyTxt + '" />';
                        }
                    }

                    if (ipCell) {
                        tr += '<input type="text" class="kbt-textbox" value="' + dr[key] + '"/>';
                    }
                    else if(btCell){
                        if (dr[key]) {
                            for (let running = 0 ; running < btInfo[body[det]].value.length ; running++) {
                                tr += '<input type="button" class="btn kbt-btn-info" data-click-function="' + btInfo[body[det]].fnButtonClick[running] + '" value="' + btInfo[body[det]].value[running] + '"/>';
                            }
                        }
                    }
                    else {
                        tr += dr[key];
                    }
                    
                    tr += '</td>';
                }
            }
        }
        first = false;
        tr += '</tr>';
    }
    callback(tr);
}
KbtTable.prototype.genEmptyRow = function (callback) {
    let options = this.rootOptions;
    let len = options.header.length;
    if (options.checkbox) { len++; }
    let tr = '<tr><td align="center" colspan="' + len + '">' + kbtLabel.EmptyRow + '</td></tr>';
    callback(tr);
}
KbtTable.prototype.genPagination = function (callback) {
    let options = this.rootOptions;
    let data = options.data;
    let el = this.rootEl;
    let paging = '', generate = true, size = data.PageSize, eventSize = $('input.behaveType', el).val() === BehaveType.PageSize, behaveSearch = $('input.behaveType', el).val() === BehaveType.Search;
    let page = (parseInt(data.PageIndex) / size) + 1;
    let dislpay = "", pageTotal = Math.ceil(parseInt(data.RowTotal) / size) == 0 ? 1 : Math.ceil(parseInt(data.RowTotal) / size), begin, end;
    //if (data.ListOfResult == null || pageTotal < 2 || data.ListOfResult == undefined) {
    //remove pageTotal condition for display pagination in case have only 1 page
    if (data.ListOfResult == null || data.ListOfResult == undefined) {
        dislpay = 'style="display:none"';
    }
    /*=== if current page belong page panel then dont generate new panel ===*/
    //add el for selector in case have 2 kbt-table in one page
    $("ul.kbt-page-no > li", el).each(function () {
        if (this.innerText == page) {
            generate = false;
        }
    });
    /*=== check event derive page size then set page to initial ===*/
    if (eventSize || behaveSearch) {
        page = 1;
        $("ul.kbt-page-no > li").each(function () {
            if ($(this).hasClass("active")) {
                $(this).val(1);
            }
        });
        $('div input.behaveType', el).val(BehaveType.None);
    }
    if (behaveSearch) {
        eventSize = true;
    }
    /*=== if not derive size change and chosen page belong panel ===*/
    if (!generate && !eventSize) {
        this.setTextPageSize();
        let next = $('.glyphicon-chevron-right').parent();
        let prev = $('.glyphicon-chevron-left').parent();
        $(next).val((parseInt(page) + 1));
        $(prev).val((parseInt(page) - 1));
        //remove double class attribute
        let result = '<div class="col-md-12 kbt-pagination" ' + dislpay + '>' + $('div.kbt-pagination', el).html() + '</div>';
        //result = result.replace('class="active"', 'class=""');
        callback(result);
    } else {
        //modify begin in case ListOfResult length is 0 and correct begin, end value
        begin = ((parseInt(size) * parseInt(page - 1)) + 1);
        if (data.ListOfResult == null || data.ListOfResult == undefined || data.ListOfResult.length == 0) {
            begin = 0;
        }
        end = ((parseInt(size) * parseInt(page - 1)) + parseInt(size));
        if (data.ListOfResult != null && data.ListOfResult != undefined && data.ListOfResult.length < end) {
            end = ((parseInt(size) * parseInt(page - 1)) + 1) + (parseInt(data.ListOfResult.length) - 1);
        }

        //remove double class attribute
        paging += '<div class="col-md-12 kbt-pagination" ' + dislpay + '><div class="col-md-6 none-padding grp-page-size">';
        paging += '<span class="none-padding text-page-size">รายการที่ ' + begin + ' ถึง ' + end + ' จากทั้งหมด ' + data.RowTotal + ' รายการ  </span><span class=" none-padding btn-page-size"><span class="btn-group dropup">';
        paging += '<button type="button" class="btn btn-default  dropdown-toggle kbt-page-size" data-toggle="dropdown"> ';
        paging += '<span class="page-size kbt-btn-size">' + size + '</span>';
        paging += '<span class="caret"></span>';
        paging += '</button>';
        paging += '<ul class="dropdown-menu kbt-page-size" role="menu">';
        paging += '<li>10</li>';
        paging += '<li>25</li>';
        paging += '<li>50</li>';
        paging += '<li>100</li>';
        paging += '<li>200</li></ul></span></span><span class=" none-padding"> รายการต่อหน้า</span>';
        paging += '</div>';
        paging += '<div class="col-md-6 none-padding"><ul class="pagination kbt-page-no">';

        //controler back
        if (page == 2 || page == 3) {
            paging += '<li class="navi" value="' + (parseInt(page) - 1) + '"><i class="glyphicon glyphicon-chevron-left"></i></li>';
        }
        else if (page > 3) {
            paging += '<li class="navi" value="1"><i class="glyphicon glyphicon-fast-backward"></i></li>';
            paging += '<li class="navi" value="' + (parseInt(page) - 1) + '"><i class="glyphicon glyphicon-chevron-left"></i></li>';
        }
        if (pageTotal < 5) {
            //controler page
            for (let i = 0; i < pageTotal; i++) {
                if ((parseInt(page) + i) == page) {
                    paging += '<li class="active" value="' + (parseInt(page) + i) + '">' + (parseInt(page) + i) + '</li>';
                }
                else {
                    // add value attribute that p'boy forget
                    paging += '<li value="' + (parseInt(page) + i) + '">' + (parseInt(page) + i) + '</li>';
                }
            }
        } else {
            //controler page
            if (page < 4) {
                for (let i = 0; i < 5; i++) {
                    if ((parseInt(page) + i) == page) {
                        paging += '<li class="active" value="' + (parseInt(page) + i) + '">' + (parseInt(page) + i) + '</li>';
                    }
                    else {
                        paging += '<li value="' + (parseInt(page) + i) + '">' + (parseInt(page) + i) + '</li>';
                    }
                }
            } else if ((pageTotal - page) < 5) {
                for (let i = 0; i < 5; i++) {
                    if (((parseInt(page) - 4) + i) == page) {
                        paging += '<li class="active" value="' + ((parseInt(page) - 4) + i) + '">' + ((parseInt(page) - 4) + i) + '</li>';
                    }
                    else {
                        paging += '<li value="' + ((parseInt(page) - 4) + i) + '">' + ((parseInt(page) - 4) + i) + '</li>';
                    }
                }
            }
            else {
                for (let i = 0; i < 5; i++) {
                    if (((parseInt(page) - 2) + i) == page) {
                        paging += '<li class="active" value="' + ((parseInt(page) - 2) + i) + '">' + ((parseInt(page) - 2) + i) + '</li>';
                    }
                    else {
                        paging += '<li value="' + ((parseInt(page) - 2) + i) + '">' + ((parseInt(page) - 2) + i) + '</li>';
                    }
                }
            }
            //controler forward
            if (page < pageTotal) {
                paging += '<li class="navi" value="' + (parseInt(page) + 1) + '"><i class="glyphicon glyphicon-chevron-right"></i></li>';
                paging += '<li class="navi" value="' + pageTotal + '"><i class="glyphicon glyphicon-fast-forward"></i></li>';
            }
        }

        paging += '</ul>';
        paging += '</div>';
        paging += '</div>';
        callback(paging);
    }
}
KbtTable.prototype.getOrderBy = function () {
    let el = this.rootEl;
    let order, json;
    if ($('div input.defOrderBy', el).val() == undefined || $('div input.defOrderBy', el).val() == null) {
        order = ["", ""];
    } else {
        order = $('div input.defOrderBy', el).val().split("|");
    }

    if (String(order[0]).length < 1) {
        json = JSON.parse('{ "column": ' + null + ',"asc": ' + null + '  }');
    } else {
        json = JSON.parse('{ "column": "' + order[0] + '","asc": "' + order[1] + '"  }');
    }
    if (order[0] == 'chkbx') {
        console.log(order[0]);
    }
    return json;
}
KbtTable.prototype.getPaging = function () {
	// add el variable for selector
	let el = this.rootEl;
    let index, size;
    size = $('span.kbt-btn-size', el).text();
    $("ul.kbt-page-no > li", el).each(function () {
        if ($(this).hasClass("active")) {
            index = $(this).val();
        }
    });
    index = (parseInt(index) - 1) * parseInt(size);
    return JSON.parse('{ "index": ' + index + ',"size": ' + size + '  }');
}
KbtTable.prototype.getIdKey = function () {
    let el = this.rootEl;
    let result;
    let listOfId = [];
    $(".kbt-table tbody tr").each(function () {
        if ($(':nth-child(1) input.id-key', this).hasClass('choosed')) {
            listOfId.push($(':nth-child(1) input.id-key', this).val());
        }

    });
    this.txtKeyToJson(listOfId, function (data) {
        result = data;
    });
    return result;
}
KbtTable.prototype.setVisibility = function (list, callback) {
    callback(list);
}
KbtTable.prototype.txtKeyToJson = function (list, callback) {
    let txt = '';
    for (let item in list) {
        txt += list[item].replace(/'/g, '"') + ",";
    }
    txt = txt.slice(0, -1);
    callback($.parseJSON('[' + txt + ']'))
}
KbtTable.prototype.setDisableCheckboxByValue = function () {
    let options = this.rootOptions;
    let el = this.rootEl;
    let chkbx, index;
    $(".kbt-table tbody tr:first>td", el).each(function () {
        if ($(this).attr("name") == 'chkbx') {
            chkbx = $(this).index();
        } else if ($(this).attr("name") == options.column) {
            index = $(this).index();
        }
    });
    if (index != undefined || chkbx != undefined) {
        $(".kbt-table tbody tr", el).each(function () {
            for (let txt in options.value) {
                if ($('td:nth-child(' + (index + 1) + ')', this).text() == options.value[txt]) {
                    $('td:nth-child(' + (chkbx + 1) + ')', this).children().prop('disabled', true);
                    var ck = $('td:nth-child(' + (chkbx + 1) + ')', this).children();
                }
            }
        });
    }
}
KbtTable.prototype.setEnableAllCheckbox = function () {
    let el = this.rootEl;
    let chkbx;
    $(".kbt-table tbody tr:first>td", el).each(function () {
        if ($(this).attr("name") == 'chkbx') {
            chkbx = $(this).index();
        }
    });
    $(".kbt-table tbody tr", el).each(function () {
        $('td:nth-child(' + (chkbx + 1) + ')', this).children().prop('disabled', false);
    });
}
KbtTable.prototype.setClearCheckbox = function () {
    $('.chkbx').not(':disabled').prop("checked", false);
}
KbtTable.prototype.setDisableSort = function () {
    let options = this.rootOptions;
    let el = this.rootEl;
    $(".kbt-table thead tr:first th", el).each(function () {
        for (var i = 0; i < options.length; i++) {
            if ($(this).attr('name') == options[i]) {
                $(this).addClass('un-sort');
                //$(this).removeAttr("onclick");
            }
        }
    });
}
KbtTable.prototype.getSourceEvent = function () {
    let el = this.rootEl;
    return $('input.behaveType', el).val();
}
KbtTable.prototype.setInitialPaging = function () {
    let options = this.rootOptions;
    $("ul.kbt-page-no > li").each(function () {
        if ($(this).hasClass("active")) {
            $(this).val('1');
        }
    });
    if (options)
        $('span.kbt-btn-size').text('10');
}
KbtTable.prototype.setSearchEvent = function () {
    let el = this.rootEl;
    $('input.behaveType', el).val(BehaveType.Search);
}
KbtTable.prototype.setInitialOrderBy = function () {
    let el = this.rootEl;
    let options = this.rootOptions;
    $('div input.defOrderBy', el).val(options[0] + "|" + options[1]);
}
KbtTable.prototype.setTextPageSize = function () {
	//cho add el variable for selector with context and modify begin, end variable
	let el = this.rootEl
    let data = this.rootOptions.data;
    let size = data.PageSize;
    let page = (parseInt(data.PageIndex) / size) + 1;
    let pageTotal = Math.ceil(parseInt(data.RowTotal) / size), begin, end;
    begin = ((parseInt(size) * parseInt(page - 1)) + 1);
    end = ((parseInt(size) * parseInt(page - 1)) + parseInt(size));
    if (data.ListOfResult.length < end) {
        end = ((parseInt(size) * parseInt(page - 1)) + 1) + (parseInt(data.ListOfResult.length) - 1);
    }
    $('.text-page-size', el).text('รายการที่ ' + begin + ' ถึง ' + end + ' จากทั้งหมด ' + data.RowTotal + ' รายการ  ');
}
KbtTable.prototype.setDisableRowLinkByValue = function () {
    let options = this.rootOptions;
    let el = this.rootEl;
    let tr, index;
    $(".kbt-table tbody tr:first>td", el).each(function () {
        if ($(this).attr("name") == options.column) {
            index = $(this).index();
        }
    });
    if (index != undefined || tr != undefined) {
        $(".kbt-table tbody tr", el).each(function () {
            for (let txt in options.value) {
                if ($('td:nth-child(' + (index + 1) + ')', this).text() == options.value[txt]) {
                    if ($(this).hasClass('row-link')) {
                        $(this).removeClass('row-link');
                        $(this).removeClass('kbt-pointer');
                        $(this).addClass('row-unlink');
                        $('td', this).not(".td-edit").unbind("click");
                        $('td', this).not(".td-del").unbind("click");
                    }
                }
            }
        });
    }
}
KbtTable.prototype.setRowHighlight = function () {
    let options = this.rootOptions;
    let el = this.rootEl;
    let index;
    $(".kbt-table tbody tr:first>td", el).each(function () {
        if ($(this).attr("name") == options.column) {
            index = $(this).index();
        }
    });
    
    if (index != undefined) {
        $("tbody tr", el).each(function (i, obj) {
            let tdTextValue = $(obj).find("td:nth-child(" + (index + 1) + ")").text();
            for (let running in options.value) {
                if (tdTextValue == options.value[running]) {
                    $(obj).find("td").each(function (i2, obj2) {
                        for (let running2 in options.targetClass) {
                            $(obj2).addClass(options.targetClass[running2]);
                        }
                    });
                }
            }
        });
    }
}
KbtTable.prototype.checkInputCell = function (body, callback) {
    let options = this.rootOptions;
    let result = false;
    if (options.inputCell != undefined) {
        $.each(options.inputCell, function (index, value) {
            if (body == value) {
                result = true;
            }
        });
    }
    callback(result);
}
KbtTable.prototype.checkButtonCell = function (body, callback) {
    let options = this.rootOptions;
    let result = false;
    if (options.buttonCell != undefined) {
        let allKeys = Object.keys(options.buttonCell);
        if ($.inArray(body, allKeys) >= 0) {
            result = true;
        }
        //$.each(options.buttonCell, function (index, value) {

        //    if (body == value.name) {
        //        result = true;
        //    }
        //});
    }
    callback(result);
}
KbtTable.prototype.setReadOnlyInputCellByColumn = function () {
    let column = this.rootOptions;
    let el = this.rootEl;
    let tdInput = [];
    $(".kbt-table tbody tr:first>td", el).each(function () {
        if ($(this).attr("name") == column) {
            tdInput.push(($(this).index() + 1));
        }
    });
    if (tdInput.length > 0) {
        $(".kbt-table tbody tr", el).each(function () {
            for (var i in tdInput) {
                $('td:nth-child(' + (tdInput[i]) + ') input.kbt-textbox', this).prop('readonly', true);
            }
        });
    }
}
//cho add method setClearInputCell for clear input textbox
KbtTable.prototype.setClearInputCell = function () {
    let el = this.rootEl;
    let columnKeyId = this.rootOptions;
    let tbody = $(el).parent();
    let tdIndex;
    $("tr:first td", tbody).each(function (i,obj) {
        if ($(obj).attr("name") == columnKeyId) {
            tdIndex = i;
        }
    });
    var idKeyVal = $("input.id-key", el).val().replace(/'/g, '"');
    var idKeyValObj = JSON.parse(idKeyVal);
    var newObj = {};
    $.each(idKeyValObj, function (key, value) {
        if (key == columnKeyId) {
            newObj[key] = "";
        }
        else {
            newObj[key] = idKeyValObj[key];
        }
    });
    $("input.id-key", el).val(JSON.stringify(newObj));
    $('td:nth-child(' + (tdIndex + 1) + ') input.kbt-textbox', el).val("");
}
KbtTable.prototype.setBuildDatePicker = function () {
    let row = this.rootEl;
    let options = this.rootOptions;
    let indexes = [];

    if (options != undefined && options.length != 0) {
        let el;
        if ($(row).is("tr")) {
            el = $(row).parent().parent().parent().parent();
        }
        else {
            el = row;
        }
        if (options != undefined && options.length != 0) {
            $(".kbt-table thead tr:first th", el).each(function (indexTH) {
                for (var i = 0; i < options.length; i++) {
                    if ($(this).attr('name') == options[i]) {
                        indexes.push(indexTH);
                    }
                }
            });
        }
    }

    if ($(row).is("tr")) {
        $('td', row).each(function (i) {
            if ($(this).has('input.kbt-textbox') && (indexes.length == 0 || $.inArray(i,indexes) > -1)) {
                $(this).find('input.kbt-textbox').datepicker({ isBE: true, autoConversionField: true });
            }
        });
    }
    else {
        $(".kbt-table tbody tr", row).each(function (indexTR,objTR) {
            $("td", objTR).each(function (i) {
                if ($(this).has('input.kbt-textbox') && (indexes.length == 0 || $.inArray(i, indexes) > -1)) {
                    $(this).find('input.kbt-textbox').datepicker({ isBE: true, autoConversionField: true });
                }
            });
        });
    }

}
KbtTable.prototype.setDestroyDatePicker = function () {
    let row = this.rootEl;
    let options = this.rootOptions;
    let indexes = [];

    if (options != undefined && options.length != 0) {
        let el;
        if ($(row).is("tr")) {
            el = $(row).parent().parent().parent().parent();
        }
        else {
            el = row;
        }
        if (options != undefined && options.length != 0) {
            $(".kbt-table thead tr:first th", el).each(function (indexTH) {
                for (var i = 0; i < options.length; i++) {
                    if ($(this).attr('name') == options[i]) {
                        indexes.push(indexTH);
                    }
                }
            });
        }
    }

    if ($(row).is("tr")) {
        $('td', row).each(function () {
            if ($(this).has('input.kbt-textbox').length > 0) {
                //cho edit just remove focus event and datepicker will gone
                $(this).find('input.kbt-textbox').removeClass('hasDatepicker').removeAttr('id').removeAttr('name');
                $(this).find('input.kbt-textbox').unbind('focus');
                //$(this).find('input.kbt-textbox').clone().removeClass('hasDatepicker').removeAttr('id').removeAttr('name').prependTo(this);
                $(this).find('input:gt(0)').remove();
            }
        });
    }
    else {
        $(".kbt-table tbody tr", row).each(function (indexTR, objTR) {
            $("td", objTR).each(function (i) {
                if ($(this).has('input.kbt-textbox').length > 0 && (indexes.length == 0 || $.inArray(i, indexes) > -1)) {
                    $(this).find('input.kbt-textbox').removeClass('hasDatepicker').removeAttr('id').removeAttr('name');
                    $(this).find('input.kbt-textbox').unbind('focus');
                    $(this).find('input:gt(0)').remove();
                }
            });
        });
    }
}
KbtTable.prototype.setDisableinputByValue = function () {
    let options = this.rootOptions;
    let el = this.rootEl;
    let chkbx, index;
    let tdInput = [];
    $(".kbt-table tbody tr:first>td", el).each(function () {
        if ($(this).attr("name") == options.column) {
            tdInput.push(($(this).index() + 1));
        }
    });
    if (tdInput.length > 0) {
        $(".kbt-table tbody tr", el).each(function () {
            for (var i in tdInput) {
                for (let txt in options.value) {
                    if ($('td:nth-child(' + (tdInput[i]) + ')', this).text() == options.value[txt]) {
                        $(this).find('td input.kbt-textbox').prop('disabled', true);
                    }
                }
            }
        });
    }
}
var kbtMethods = ['setVisibility', 'genTable', 'getIdKey', 'getPaging', 'getOrderBy',
    'setDisableCheckboxByValue', 'setEnableAllCheckbox', 'setClearCheckbox', 'setDisableSort', 'getSourceEvent',
    'setInitialPaging', 'setSearchEvent', 'setInitialOrderBy', 'setDisableRowLinkByValue', 'setRowHighlight',
    'checkInputCell', 'setBuildDatePicker', 'setReadOnlyInputCellByColumn', 'setClearInputCell', 'setDestroyDatePicker',
    'setDisableinputByValue'];
$.fn.kbtTable = function (fnc, options) {
    if (typeof fnc === 'string') {
        if ($.inArray(fnc, kbtMethods) < 0) {
            throw new Error("Unknown method: " + fn);
        }
        let scope = new KbtTable(this, options);
        return scope[fnc]();
    }
};

//$.fn.kbtTable.Constructor = KbtTable;
//$.fn.kbtTable.prototype = Object.create(KbtTable.prototype);
//$.fn.kbtTable.methods = methods;
//$.fn.bootstrapTable.defaults = KbtTable.DEFAULTS;
