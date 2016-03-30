define(function (require, exports) {
    window.inAjaxProcess = false;
    exports.requestApi = function (uri, data, func, endProcess) {
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
    exports.showPop = function (popElem) {
        var pop = new popup(popElem);
        pop.show();
    };


    // popup basic show hide
    exports.hidePop = function (popElem) {
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

    // all select status
    exports.selectCheckbox = function () {
        // tr click
        $('.selectable.list .listData').on('click', '.item .chk', function (e) {
            var chk_id = $(this).attr('data-id');

            if ($(this).prop('checked') == true || $(this).prop('checked') == 'checked') {
                $(this).parents('.item[data-id=' + chk_id + ']').addClass('selected');
            } else {
                $(this).parents('.item[data-id=' + chk_id + ']').removeClass('selected');
            }

            e.stopImmediatePropagation();
        });

        // checkbox click
        $('.selectable.list .listData').on('click', '.item', function (e) {
            if ($(this).find('.chk').prop('checked') == true || $(this).find('.chk').prop('checked') == 'checked') {
                $(this).removeClass('selected');
                $(this).find('.chk').prop('checked', false);
            } else {
                $(this).addClass('selected');
                $(this).find('.chk').prop('checked', true);
            }
            e.stopImmediatePropagation();
        });

        // 全选
        $(document).on('click', ".selectAll", function (e) {
            $(this).addClass('current');
            $(this).siblings('.btn-light').removeClass('current');
            $(".list .listData .item:visible input.chk").prop("checked", true);
            $('.list .listData .item:visible').addClass('selected');
            e.stopImmediatePropagation();
        });
        // 全不选
        $(document).on('click', ".selectNone", function (e) {
            $(this).siblings('.btn-light').removeClass('current');
            $(".list .listData .item:visible input.chk").prop("checked", false);
            $('.list .listData .item:visible').removeClass('selected');
            e.stopImmediatePropagation();
        });
        // 反选
        $(document).on('click', ".selectInvert", function (e) {
            $(this).addClass('current');
            $(this).siblings('.btn-light').removeClass('current');
            $(".list .listData .item:visible input.chk").each(function () {
                $(this).prop("checked", !this.checked);//反选
                var chk_id = $(this).attr('data-id')
                if ($(this).prop('checked') == true || $(this).prop('checked') == 'checked') {
                    $(this).parents('.item[data-id=' + chk_id + ']').addClass('selected');
                } else {
                    $(this).parents('.item[data-id=' + chk_id + ']').removeClass('selected');
                }
            });
            e.stopImmediatePropagation();
        });
    };
    exports.selectCheckbox();

    // 列表删除功能
    exports.del = function (api, tip, func) {
        $('.list').on('click', '.delBtn', function (e) {
            // params
            var id = $(this).attr('data-id');

            // confirm
            var cm = window.confirm(tip || "您确认需要删除选中的数据吗？");
            if (!cm) {
                return;
            }

            del([id]);

            e.stopImmediatePropagation();
        }).on('click', '.delAllSelected', function (e) {
            var data = [];
            $(".list .listData input.chk").each(function () {
                if ($(this).attr('checked') == true || $(this).attr('checked') == 'checked') {
                    data.push($(this).attr('data-id'));
                }
            });

            //  has no selected
            if (data.length == 0) {
                exports.showTip('err', '请选择需要删除的项', 3000);
                return;
            }

            // confirm
            var cm = window.confirm(tip || "您确认需要删除选中的数据吗？");
            if (!cm) {
                return;
            }

            del(data);

            e.stopImmediatePropagation();
        });

        function del(data) {
            // api request
            exports.requestApi(api, {data: data}, function (res) {
                if (res.result == 1) {
                    for (var i = 0; i < data.length; i++) {
                        $('.listData .item[data-id="' + data[i] + '"]').fadeOut();
                    }

                    setTimeout(function () {
                        for (var i = 0; i < data.length; i++) {
                            $('.listData .item[data-id="' + data[i] + '"]').remove();
                        }
                        // 没有数据情况
                        if ($('.listData .item').length == 0) {
                            window.location.reload();
                        }
                    }, 500);

                    if (typeof func == 'function') {
                        func(res, data);
                    }

                    exports.showTip('ok', '恭喜您,删除成功！', 2000);
                }
            });
        }
    };

    // api publish
    exports.publish = function (api, cancelTip, doTip) {
        $(".list .listData").on('click', '.pubBtn', function (e) {
            // params
            var id = $(this).attr('data-id');
            var is_publish = $(this).attr('data-status');
            var data = {
                'id': id,
                'published': is_publish
            };

            // disable the button
            $(this).attr('disabled', true);
            // api request
            exports.requestApi(api, data, function (res) {
                if (res.result == 1) {
                    var btn = $('.pubBtn[data-id="' + id + '"]');
                    if (is_publish == 1) {
                        btn.attr('data-status', 0).text(cancelTip ? cancelTip : "取消发布").css('color', '');
                    } else {
                        btn.attr('data-status', 1).text(doTip ? doTip : "发布").css('color', '#f00');
                    }
                    exports.showTip('ok', '操作成功！', 1000);
                }
            });
            e.stopImmediatePropagation();
        });
    };

    exports.setPic = function () {
        var store = require('app.storage');//公共函数
        require('jquery/jquery.dragsort.min.js');

        // 主图
        store.getImg('#uploadMainPic', function (res) {
            $('#thumb').val(res.url);
            $('#thumbPreview').attr('src', res.url);
        });
        // 多图
        store.getImg('#uploadMorePictures', function (res) {
            $('#picturesPreview .clearfix').remove();
            $('#picturesPreview .clear').remove();

            $(res.url).each(function (index, node) {
                var isAdded = $('#picturesPreview').find('img[src="' + node + '"]');
                if (isAdded && isAdded.length > 0) {
                    return false;
                }
                var str = '<p class="pic"><a href="javascript:;" class="setMainPic">设为主图</a><img src="' + node + '"><a href="javascript:;" class="rmBtn">删除</a></p>';
                $('#picturesPreview').append(str);
            });

            $('#picturesPreview').append("<div class='clearfix'></div>");

            reVal();

            $('#picturesPreview').dragsort({
                dragEnd: function () {
                    reVal();
                }
            });

        }, true);

        $('#picturesPreview').dragsort({
            dragEnd: function () {
                reVal();
            }
        });

        // 移除图片
        $("#picturesPreview").on('click', '.rmBtn', function (e) {
            $(this).parent().remove();
            reVal();
            e.stopImmediatePropagation();
        });

        // 设置主图
        $("#picturesPreview").on('click', '.setMainPic', function (e) {
            var src = $(this).parent().find('img').attr('src');
            $('#thumbPreview').attr('src', src);
            $('#thumb').val(src);
            e.stopImmediatePropagation();
        });

        function reVal() {
            var picVal = "";
            $('#picturesPreview .pic img').each(function () {
                picVal += $(this).attr("src") + ';';
            });
            $('#productImages').val(picVal);
        }
    };


    // popup basic show hide
    exports.switchTab = function (elem) {
        $(elem).switchTab();
    };

});
