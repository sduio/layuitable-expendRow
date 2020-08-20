// 1.1.0 添加支持layuitable有fixed，hide属性
// 仅用在layui中
// 具体操作demo查看促销列表(smarty方式，smarty方式相对复杂)，创客会员列表(接口方式)
// 需要添加的class[layui-expend-row]，用于提供点击事件以及图标，在table.render方法中调用expendRow方法

layui.define(['jquery', 'form'], function(exports){
	var $ = layui.jquery,
        form = layui.form;
    var ExpendRow = function(){};
    var initFlag = 0; // 记录是否是首次进入
    var setArr = []; // 记录下列设置
    var colFixedWidthLeft = []; // 左固定列的宽度
    var colFixedWidthRight = []; // 右固定列的宽度
    var smartyFlag = false; // 通常情况下只有smarty时候需要传参

    /**
     * @method expendRowShow 展示和隐藏列
     * @param {String} key value值对比
     * @param {Boolean} show 是否展示 
     */
    function expendRowShow (key, show) {
        var domArr = $('.layui-table-view thead th');
        var index = -1;
        var checkboxText = $('.layui-table-view thead th').eq(0).find('span').text();
        var fixedLeft = $('.layui-table-fixed-l thead th').length; // 有多少个固定左列
        for (var i = 0, len = domArr.length; i < len; i++) {
            if (key == domArr.eq(i).data('field')) {
                if (fixedLeft > 0) {
                    index = i - fixedLeft;
                } else {
                    index = !checkboxText ? i - 1 : i;
                }
                setArr[index].checked = show;
                show ? domArr.eq(i).removeClass('layui-hide') : domArr.eq(i).addClass('layui-hide');
                break;
            } 
        }
        if (fixedLeft > 0) {
            index = index + fixedLeft;
        } else {
            index = !checkboxText ? index + 1 : index;
        }
        var bodyArr = $('.layui-table-view .layui-table-main tr');
        for (var j = 0, lenj = bodyArr.length; j < lenj; j++) {
            show ? bodyArr.eq(j).find('td').eq(index).removeClass('layui-hide') : bodyArr.eq(j).find('td').eq(index).addClass('layui-hide');
        }
        // 主要是针对于smarty的操作
        if (smartyFlag) {
            var reg = new RegExp('"', 'g');
            var url = window.location.href;
            var newUrl=  changeURLArg(url, "setArr", JSON.stringify(setArr).replace(reg, '\'')); 
            var hashes = newUrl.slice(newUrl.indexOf('?') + 1);
            $('#param_uri').val(hashes)
            window.history.pushState({}, "", newUrl);
        }
    }

    /**
     * @method expendRowVerify 当只有一个项的时候不能再隐藏，即至少有一个项
     * @param {*} key 
     * @param {*} show 
     */
    function expendRowVerify () {
        var checkedArr = $('.com-expend-nav .layui-form-checked');
        if (checkedArr.length == 1) {
            checkedArr.eq(0).siblings('input').attr('disabled', true);
            checkedArr.eq(0).addClass('layui-checkbox-disbaled layui-disabled');
        } else {
            checkedArr.siblings('input').attr('disabled', false);
            checkedArr.removeClass('layui-checkbox-disbaled layui-disabled');
        }
    }

    /**
     * @method expendRowFixedExist 将固定列从setArr中剔除
     * @param {Array} fixedTable 剩余比较的fixedtable
     * @param {String} title 对比的列表头
     */
    function expendRowFixedExist (fixedTable, title) {
        for (var i = 0, len = fixedTable.length; i < len; i++) {
            if (fixedTable.eq(i).data('field') == title) {
                fixedTable.splice(i, 1);
                return false;
            }
        }
        return true;
    }
    
    /**
     * @method expendRowInit 初次加载
     */
    function expendRowInit () {
        initFlag++;
        var domArr = $('.layui-table-view .layui-table-box>.layui-table-header thead th');
        var str = '<ul class="com-expend-nav"><li>自定义列</li>';
        var fixedTable = $('.layui-table-fixed th');
        for (var i = 0, len = domArr.length; i < len; i++) {
            if (domArr.eq(i).find('span').text() && domArr.eq(i).find('.layui-expend-row').length == 0 && expendRowFixedExist(fixedTable, domArr.eq(i).data('field'))) {
                str += '<li class="' + (domArr.eq(i).hasClass('layui-hide')?'layui-hide':'') + '">\
                            <input type="checkbox" class="layui-input" lay-filter="expendRowFilter" lay-skin="primary" \
                            title="' + domArr.eq(i).find('span').text() + '" \
                            value="' + domArr.eq(i).data('field') + '" \
                            ' + (domArr.eq(i).hasClass('layui-hide')?'':'checked') + ' /></li>';
                setArr.push({
                    title: domArr.eq(i).data('field'),
                    name: domArr.eq(i).find('span').text(),
                    checked: domArr.eq(i).hasClass('layui-hide') ? false : true,
                    hide: domArr.eq(i).hasClass('layui-hide') // 是不是列表自行隐藏的，即layuitable中的hide属性是否为true
                });
            }
        }
        str += '</ul>';
        $('.layui-table-view').append(str);
        expendRowBind();
    }

    /**
     * @method expendRowBind 对相关操作的绑定
     */
    function expendRowBind () {
        form.on('checkbox(expendRowFilter)', function (res) {
            expendRowVerify();
            if ($(res.othis[0]).hasClass('layui-form-checked')) {
                expendRowShow(res.value, true);
            } else {
                expendRowShow(res.value, false);
            }
            expendRowFixed();
        });
        $('body').on('click', '.layui-expend-row', function (e) {
            if($('.layui-table-view .com-expend-nav').is(':hidden')){
                $('.layui-table-view .com-expend-nav').animate({ opacity: 1, top: '52px' }, 500).show();
            }else{
                $('.layui-table-view .com-expend-nav').animate({ opacity: 0, top: '40px' }, 500, function(){
                    $(this).hide()
                });
            }
            form.render();
        })
        $(document).bind('click', function (e) {
            if ($(e.target).parents('.com-expend-nav').length == 0 && !$(e.target).hasClass('layui-expend-row')) {
                $('.layui-table-view .com-expend-nav').animate({ opacity: 0, top: '40px' }, 500, function(){
                    $(this).hide()
                });
            }
            return false;
        })
    }

    /**
     * @method expendRowReduce 还原设置（翻页，搜索依然保持设置）
     */
    function expendRowReduce () {
        expendRowFixed();
        var domArr = $('.layui-table-view thead th');
        var str = '<ul class="com-expend-nav"><li>自定义列</li>';
        var showIndex = -1; // 记录唯一的剩余展示项
        var showFlag = 0; // 记录剩余展示的项有多少
        for (var i = 0, len = setArr.length; i < len; i++) {
            str += '<li class="' + (setArr[i].hide ? 'layui-hide' : '') + '">\
                        <input type="checkbox" class="layui-input" lay-filter="expendRowFilter" lay-skin="primary" \
                        title="' + setArr[i].name + '" \
                        value="' + setArr[i].title + '" ' +
                        (setArr[i].checked ? 'checked' : '') + ' /></li>';
            if (setArr[i].checked == true && !setArr[i].hide) {
                showIndex = i;
                showFlag++;
            }
        }
        str += '</ul>';
        $('.layui-table-view').find('.com-expend-nav').remove();
        $('.layui-table-view').append(str);
        if (showFlag == 1) {
            $('.com-expend-nav li').eq(showIndex+1).find('input').attr('disabled', true);
            $('.com-expend-nav li').eq(showIndex+1).find('.layui-form-checkbox').addClass('layui-checkbox-disbaled layui-disabled');
        }
        var domArr = $('.layui-table-view thead th');
        var bodyArr = $('.layui-table-view .layui-table-main tr');
        var checkboxText = $('.layui-table-view thead th').eq(0).find('span').text();
        var domIndex = -1
        var fixedLeft = $('.layui-table-fixed-l thead th').length; // 有多少个固定左列
        for (var i = 0, len = setArr.length; i < len; i++) {
            if (setArr[i].checked == false && !setArr[i].hide) {
                if (fixedLeft > 0) {
                    domIndex = i + fixedLeft;
                } else {
                    domIndex = !checkboxText ? i + 1 : i;
                }
                domArr.eq(domIndex).addClass('layui-hide');
                for (var j = 0, lenj = bodyArr.length; j < lenj; j++) {
                    bodyArr.eq(j).find('td').eq(domIndex).addClass('layui-hide');
                }
            }
        }
    }

    /**
     * @method expendRowFixed 对表格有固定左右列的判断（针对宽度的判断）
     */
    function expendRowFixed () {
        var time = setTimeout(function () {
            // 左固定列
            var fixedArrLeft = $('.layui-table-fixed-l th');
            var fixedBodyArrLeft = $('.layui-table-fixed-l .layui-table-body tr');
            if (fixedArrLeft.length > 0) {
                expendRowFixedWidth(fixedArrLeft, fixedBodyArrLeft, colFixedWidthLeft);
            }
            // 右固定列
            var fixedArrRight = $('.layui-table-fixed-r th');
            var fixedBodyArrRight = $('.layui-table-fixed-r .layui-table-body tr');
            if (fixedArrRight.length > 0) {
                expendRowFixedWidth(fixedArrRight, fixedBodyArrRight, colFixedWidthRight);
            }
            clearTimeout(time);
        }, 0)
    }
    /**
     * @method expendRowFixedWidth 固定列的宽度监视
     * @param {Array} fixedArr // 固定列列表header
     * @param {Array} fixedBodyArr // 固定列列表body
     * @param {Array} colFixedWidth 左右的标志，左传'l', 右传'r'
     */
    function expendRowFixedWidth (fixedArr, fixedBodyArr, colFixedWidth) {
        var tableArr = $('.layui-table-view .layui-table-header th');
        var colFixedWidthTemp = [] // 预存的固定列宽度
        for (var i = 0, len = fixedArr.length; i < len; i++) {
            if (colFixedWidth.length == 0) {
                colFixedWidthTemp.push(fixedArr.eq(i).width());
            }
            for (var j = 0, lenj = tableArr.length; j < lenj; j++) {
                if (fixedArr.eq(i).data('field') == tableArr.eq(j).data('field')) {
                    var width = colFixedWidth.length > 0 ? colFixedWidth[i] + 1 : fixedArr.eq(i).width() + 1; // 对比使用的宽度
                    if (width < tableArr.eq(j).width()) {
                        fixedArr.eq(i).addClass('layui-hide');
                        for (var k = 0, lenk = fixedBodyArr.length; k < lenk; k++) {
                            fixedBodyArr.eq(k).find('td').eq(i).addClass('layui-hide');
                        }
                    } else {
                        fixedArr.eq(i).removeClass('layui-hide');
                        for (var k = 0, lenk = fixedBodyArr.length; k < lenk; k++) {
                            fixedBodyArr.eq(k).find('td').eq(i).removeClass('layui-hide');
                        }
                        $('.layui-table-fixed').removeClass('layui-hide');
                    }
                    break;
                }
            }
        }
        if (colFixedWidth.length == 0) {
            for (var i = 0, len = colFixedWidthTemp.length; i < len; i++) {
                colFixedWidth.push(colFixedWidthTemp[i]);
            }
        }
    }

    /**
     * @method paramVertify 对传入的参数进行校验，错误则抛出
     * @param {Array} titleList 
     */
    function paramVertify (titleList) {
        for (var i = 0, len = titleList.length; i < len; i++) {
            if (!titleList[i].hasOwnProperty('title') || !titleList[i].hasOwnProperty('name') || !titleList[i].hasOwnProperty('checked')) {
                throw new Error('params is error');
                return false;
            }
        }
        return true
    }

    /**
     * @method changeURLArg 替换url上的参数
     * @param {String} url 目标url
     * @param {String} arg 需要替换的参数名称
     * @param {String} arg_val 替换后的参数的值
     * @return {String} 参数替换后的url
     */
    function changeURLArg(url, arg, arg_val) {
        var pattern = arg + '=([^&]*)';
        var replaceText = arg + '=' + arg_val;
        if (url.match(pattern)) {
            var tmp = '/(' + arg + '=)([^&]*)/gi';
            tmp = url.replace(eval(tmp), replaceText);
            return tmp;
        } else {
            if (url.match('[\?]')) {
                return url + '&' + replaceText;
            } else {
                return url + '?' + replaceText;
            }
        }
        return url + '\n' + arg + '\n' + arg_val;
    }

    // titleList的格式需为数组，且项为对象，其中包含title，name，checked，否则有出错，hide为非必填，但如果一开始就隐藏了列，就需要填写该属性
    // isSmarty 是否是smarty页面，或者是自主传参
    ExpendRow.prototype.expendRow = function (titleList, isSmarty) {
        // 每次加载该方法都要隐藏掉设置列
        $('.layui-table-view .com-expend-nav').animate({ opacity: 0, top: '40px' }, 0, function(){
            $(this).hide()
        });
        if (isSmarty) {
            smartyFlag = true;
        }
        if (titleList && titleList.length > 0) {
            smartyFlag = true;
            if (!paramVertify(titleList)) {
                return false;
            }
            // 主要使用在smarty页面，或者是要自主控制操作列，就需要传入titleList
            for (var i = 0, len = titleList.length; i < len; i++) {
                setArr.push(titleList[i]);
            }
            initFlag++;
            expendRowBind();
        }
        if (initFlag == 0) {
            expendRowInit();
        } else {
            expendRowReduce();
        }
    }

    var expendRowObj = new ExpendRow();

    exports('expendrow', function(option){
        expendRowObj.setArr = setArr;
        expendRowObj.initFlag = initFlag;
        return expendRowObj;
    });
});