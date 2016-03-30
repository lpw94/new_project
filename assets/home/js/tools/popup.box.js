/**
 * 表单验证插件
 *
 * @author qnong
 * 使用方法
 * ----------------------------------------------------------------------
 *  提示的位置，在验证的input,checkbox等的同级位置，父级位置，父父级位置任何一处添加标签  如：<span class="tips"></span>
 *  var popupbox = require('tools/check/check.form'); //引入文件
 *  popupbox.open({
            'id'       : 'popup-box', // 窗口id
            'title'    : '提示', // 标题
            'html'     : '内容', // 内容
            'htmlId'   : 'box-html', // 一般用默认
            'type'	    : '', // 类型，ajax, 还是iframe，如果设置type的值，则前面的html的值无效
            'url'		: '', // 上一个选择type的ajax或iframe要加载的url地址
            'width'    : 400, // 宽度
            'height'   : '', // 高度
            'closeId'  : 'box-close', // 关闭按钮id
            'mask'     : true, // 是否显示遮罩层
            'maskId'   : 'box-mask', // 遮罩层id, 一般用默认
            'okId'      : 'box-ok-btn', // 确定按钮id, 一般用默认
            'ok'        : '确定', // 确定按钮文字，要隐藏此按钮，设为(ok:false)即可
            'okFn'      : '', // 点击确定按钮回调函数
            'cancelId'  : 'box-cancel-btn', // 取消按钮id, 一般用默认
            'cancel'    : '取消', // 取消按钮文字，要隐藏此按钮，设为(cancel:false)即可
            'cancelFn'  : '', // 点击取消按钮的回调函数
 *       ]
 * -----------------------------------------------------------------------
 */
define(function (require, exports) {
    var boxObj;


    /**
     * 弹窗
     *
     * @param options
     */
    exports.open = function (options) {
        var btnHtmls = '', maskHtmls = '', W = $(window);
        var defaultOptions = {
            'id': 'popup-box',
            'more': false,
            'title': '温馨提示',
            'html': '请求失败，请稍候再试。',
            'htmlId': 'box-html',
            'type': '',
            'url': '',
            'width': 300,
            'height': '',
            'closeId': 'box-close',
            'mask': true,
            'maskSuffix': '-mask',
            'okId': 'box-ok-btn',
            'ok': '确定',
            'okFn': '',
            'cancelId': 'box-cancel-btn',
            'cancel': '取消',
            'cancelFn': ''
//                'extraId'	: 'box-extra-btn',  // 此功能暂不实现
//                'extraText'	: '下一步',
//                'extraBtn'	: false,
//                'extraFn'	: '',
        };
        boxObj = $.extend(defaultOptions, options);
        var bId = boxObj.id;
        var bMore = boxObj.more;
        if ($('#' + bId).is('#' + bId) && bMore == true) {
            bId += '_' + parseInt(Math.random() * 10000);
        }
        boxObj.id = bId;
        var bTitle = boxObj.title,
            bHtml = boxObj.html,
            bHtmlId = boxObj.htmlId,
            bType = boxObj.type,
            bUrl = boxObj.url,
            bw = boxObj.width,
            bh = boxObj.height,
            bCloseId = bId + boxObj.closeId,
            bMaskId = bId + boxObj.maskSuffix,
            bMask = boxObj.mask,
            okId = bId + boxObj.okId,
            okText = boxObj.ok,
            okFn = boxObj.okFn,
            cancelId = bId + boxObj.cancelId,
            cancelText = boxObj.cancel,
            cancelFn = boxObj.cancelFn;

        if (bType) {
            switch (bType) {
                case 'ajax':
                    $.ajax({
                        'type': 'post',
                        'url': bUrl,
                        'data': '',
                        'async': false,
                        'success': function (msg) {
                            bHtml = msg;
                        }
                    });
                    break;
                case 'iframe':
                    bHtml = bUrl;
                    break;
            }
        }
        if (!(okText === false)) {
            btnHtmls += '<a id="' + okId + '" class="boxbtn box-ok-btn" href="javascript:;"  data-box-id="' + bId + '">' + okText + '</a>';
        }
        if (!(cancelText === false)) {
            btnHtmls += '<a id="' + cancelId + '" class="boxbtn box-cancel-btn" href="javascript:;" data-box-id="' + bId + '">' + cancelText + '</a>';
        }
        if (btnHtmls) {
            btnHtmls = '<div class="box-bottom"><span class="box-btn">' + btnHtmls + '</span></div>';
        }

        var heightStyle = '';
        if (bh) heightStyle = ' height: ' + bh + 'px;';
        var whStyle = 'style="width: ' + bw + 'px;' + heightStyle + '"';
        var htmls = '<div class="popup-box f-pr" id="' + bId + '" ' + whStyle + '>';
        if (bTitle) {
            htmls += '<div class="box-title"><span class="title">' + bTitle + '</span><a id="' + bCloseId + '" class="box-close" href="javascript:;" data-box-id="' + bId + '"><i class="icon icon-tongdaogongxiangcha"></i></a></div>';
        }
        htmls += '<div id="' + bHtmlId + '" class="box-html">' + bHtml + '</div>' + btnHtmls + '</div>';

        if (bMask === true) {
            maskHtmls = '<div id="' + bMaskId + '" class="box-mask"></div>';
            htmls += maskHtmls;
        }

        /**
         * fix for multiple box
         */
        var zIndex = 0;
        var _tZIndex = 0;
        $('.popup-box').each(function () {
            _tZIndex = $(this).css('z-index');
            if (_tZIndex > zIndex) {
                zIndex = _tZIndex;
            }
        });

        if ($('#' + bId).is('#' + bId) && bMore == true) {
            $('body').append(htmls);
        } else if (!$('#' + bId).is('#' + bId)) {
            $('body').append(htmls);
        }

        $(window).live('keydown', function (e) {
            e = (e) ? e : ((window.event) ? window.event : ''); //兼容IE和Firefox获得keyBoardEvent对象
            var kc = e.keyCode ? e.keyCode : e.which; //兼容IE和Firefox获得keyBoardEvent对象的键值
            if (kc == 13) {
                $('#' + okId).click();
            }
        });


        if (zIndex >= 500) {
            $('body #' + bId).css('z-index', parseInt(zIndex) + 100);
            $('body #' + bMaskId).css('z-index', parseInt(zIndex) + 98);
        }

        var ww = W.width();
        var wh = W.height();
        if (!bh) {
            bh = $('body #' + bId).height();
        }

        var pTop = W.scrollTop() + (wh - bh) / 2;
        var pLeft = (ww - bw) / 2;
        if (pTop <= 0) {
            pTop = 0;
        }

        if (pLeft <= 0) {
            pLeft = 0;
        }
        $('body #' + bId).css({'top': pTop, 'left': pLeft});
        $('body #' + bMaskId).css({'height': $(document).height()});
        //绑定点击事件，调用自定义回调函数
        if (typeof okFn == 'function') {
            $('body #' + okId).click(okFn);
        } else {
            $('body #' + okId).click(function () {
                var bId = $(this).attr('data-box-id');
                boxClose(bId);
            });
        }
        if (typeof cancelFn == 'function') {
            $('body #' + cancelId).click(cancelFn);
            $('body #' + bCloseId).click(cancelFn);
        } else {
            $('body #' + cancelId).click(function () {
                var bId = $(this).attr('data-box-id');
                boxClose(bId);
            });
        }

        $('body #' + bCloseId).click(function () {
            var bId = $(this).attr('data-box-id');
            boxClose(bId);
        });

        function boxClose(bId) {
            var bMaskId = bId + boxObj.maskSuffix
            $('body #' + bId).remove();
            $('body #' + bMaskId).remove();
        }
    };

    /**
     * 关闭窗口
     *
     */
    exports.close = function (option) {
        if (typeof options != 'object') {
            options = {};
        }
        var zIndex = 0;
        var _tZIndex = 0;
        var bId = boxObj.id;//"popup-box";
        $('.popup-box').each(function () {
            _tZIndex = $(this).css('z-index');
            if (_tZIndex > zIndex) {
                zIndex = _tZIndex;
                bId = $(this).attr('id');
            }
        });
        $('body #' + bId + ',#box-mask').remove();
        var bMaskId = bId + '-mask';
        $('body #' + bId).remove();
        $('body #' + bMaskId).remove();
    };

    exports.setMessage = function (html, options) {
        if (typeof options != 'object') {
            options = {};
        }
        var opt = $.extend(boxObj.options, options);
        $('body #' + opt.id).find('#box-html').html(html);
    };

    exports.setCallback = function (key, func) {
        var keyObj;
        if (key == 'ok') {
            keyObj = $('body #' + boxObj.okId);
        }
        else if (key == 'cancel') {
            keyObj = $('body #' + boxObj.cancelId);
        }
        $(keyObj).unbind();
        $(keyObj).click(func);
    };
});

