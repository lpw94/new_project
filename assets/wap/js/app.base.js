define(function (require, exports) {
    window.inAjaxProcess = false;
    window.requestApi = exports.requestApi = function (uri, data, func, endProcess) {
        // 手动更改请求，立即结束ajax状态
        if (endProcess) {
            window.inAjaxProcess = false;
        }
        if (!inAjaxProcess) {
            var param = {
                url: uri,
                async: true,
                data: data,
                dataType: 'json',
                type: 'post',
                beforeSend: function () {
                    tip.showTip('wait', '处理请求...');
                    if (window.inAjaxProcess) {
                        tip.showTip('wait', '正在请求...');
                        return false;
                    }
                    // 正在处理状态
                    window.inAjaxProcess = true;
                },
                timeout: function () {
                    tip.showTip('err', '请求超时,请重试！', 2000);
                },
                abort: function () {
                    tip.showTip('err', '网路连接被中断！', 2000);
                },
                parsererror: function () {
                    tip.showTip('err', '运行时发生错误！', 2000);
                },
                error: function () {
                    if (window.inAjaxProcess && ajaxTip.time > 1000) {
                        tip.showTip('err', '运行错误，请重试！', 2000);
                    }
                },
                complete: function () {
                    setTimeout(function () {
                        if ($('#ajaxStatus').css('display') !== 'none') {
                            //tip.showTip('ok', '操作成功！', 2000);
                            tip.hideTip();
                        }

                        // 清除处理状态
                        window.inAjaxProcess = false;
                    }, ajaxTip.time);// 最后一次tip时间
                },
                success: function (res) {
                    if (typeof func == 'function') {
                        func(res);
                    }

                    if (res.result != 1) {
                        tip.showTip('err', res.error.more ? (res.error.msg + "[" + res.error.more + "]") : res.error.msg, 3000);
                    }
                }
            };

            $.ajax(param);
        }
    };
    // status : err, ok, wait, warming
    exports.showTip = function (status, tip, time) {
        var t = new ajaxTip();
        t.showTip(status, tip, time);
    };

    exports.hideTip = function () {
        var t = new ajaxTip();
        t.hideTip();
    };

    /**
     * ajax tip
     *
     * @constructor
     */

    function ajaxTip() {

    }

    ajaxTip.ajaxTimer = null;
    ajaxTip.tip = null;
    ajaxTip.time = 0;
    ajaxTip.status = null;
    ajaxTip.prototype = {
        showTip: function (status, tip, time) {
            ajaxTip.status = status;
            ajaxTip.tip = tip;
            ajaxTip.time = time;

            $('#ajaxStatus').show();
            $('#ajaxStatus #ajaxTip').html(ajaxTip.tip).removeClass().addClass(ajaxTip.status);


            if (ajaxTip.time) {
                if (ajaxTip.ajaxTimer) {
                    clearTimeout(ajaxTip.ajaxTimer);
                }
                ajaxTip.ajaxTimer = setTimeout(function () {
                    $('#ajaxStatus').hide();
                    ajaxTip.inProcess = true;
                }, ajaxTip.time);
            }
        },
        hideTip: function () {
            $('#ajaxStatus').hide();
        },
        setTip: function (tip) {
            $('#ajaxStatus #ajaxTip').html(tip);
        }
    };
    window.tip = new ajaxTip();

    // popup basic show hide
    window.showPop = exports.showPop = function (popElem) {
        var pop = new popup(popElem);
        pop.show();
    };


    // popup basic show hide
    window.hidePop = exports.hidePop = function (popElem) {
        var pop = new popup(popElem);
        pop.hide(popElem);
    };


    // popup
    function popup(popElem) {

        this.widget = popElem ? popElem : '.popup-wrap';

        var _this = this;
        // close click
        $('.popup-widget .popup-close').on('click', function () {
            _this.hide();
        });

        // bg click
        $('.popup-wrap').on('click', function (e) {
            if (e.target !== this) return;
            if ($(this).attr('data-close')) {
                _this.hide();
            }

            e.stopImmediatePropagation();
        });
    }

    popup.prototype = {
        'show': function () {
            $(this.widget).fadeIn();
        },
        'hide': function (elem) {
            if (elem) {
                $('.popup-wrap' + elem).hide();
            } else {
                $('.popup-wrap').hide();
            }
        }
    };

    // tab切换
    $.fn.switchTab = function (opts) {
        var $el = this;
        var options = {
            wrap: '.tabs',
            tab: '.tab',
            pane: '.tab-pane',
            callback: ''
        };
        if (typeof opts == 'object') {
            options = $.extend(options, opts);
        }
        var wrap = options.wrap;
        var tab = options.tab;
        var pane = options.pane;
        var callback = options.callback;
        // tab switch
        $el.find(wrap).on('click', tab, function (e) {
            var data_tab = $(this).attr('data-tab');
            $el.find(tab).removeClass('active');
            $el.find(tab + '[data-tab="' + data_tab + '"]').addClass('active');
            $el.find(pane).hide().removeClass('active');
            $el.find(pane + '[data-tab="' + data_tab + '"]').fadeIn().addClass('active');
            // callback
            if (typeof callback == "function") {
                callback(data_tab, tab);
            }
            e.stopImmediatePropagation();
        });
        return $el;
    };

    // popup basic show hide
    exports.switchTab = function (elem) {
        $(elem).switchTab();
    };

    window.checkField = function (elem, msg, regx) {
        var val = $(elem).val();

        if ($(elem).val() == '') {
            tip.showTip('err', msg, 3000);
            $(elem).focus();
            return false;
        } else {
            if (regx) {
                if (!new RegExp(regx).test(val)) {
                    tip.showTip('err', msg, 3000);
                    $(elem).focus();
                    return false;
                }
            }
        }

        return true;
    };
    window.checkLogin = function () {
        var uid = app._uid;
        if (!(!isNaN(uid) && uid > 0)) {
            window.showPop("#loginPopup");
            return false;
        }
        return true;
    };


});
