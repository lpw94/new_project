// admin user,group,menus,permission settings
define(function (require, exports) {

    var base = require('app.base');//公共函数
    var store = require('app.storage');//公共函数
    var editor = require('app.editor');//公共函数

    exports.setPageTip = function () {
        // update event
        $('.upBtn').click(function (e) {
            var id = $(this).attr('data-id');
            // api request
            base.requestApi('/admin/api/site/getKeyVal', {'id': id, 'tpl': 'site/pop/page_tip'}, function (res) {
                if (res.result == 1) {
                    base.showTip('ok', '获取数据成功！', 1000);
                    base.showPop('#catPopup');

                    $('#catPopup').find('.field-area').html(res.data);
                }
            });

            e.stopImmediatePropagation();
        });

        $('#catPopup .saveBtn').click(function (e) {
            var data = $('#catPopup .form').serializeObject();
            var id = $('#catPopup #data_id').val();

            // api request
            base.requestApi('/admin/api/site/saveKeyVal', {'data': data, id: id}, function (res) {
                if (res.result == 1) {
                    base.showTip('ok', '数据保存成功！', 3000);
                    setTimeout(function () {
                        base.hidePop();
                        window.location.reload();
                    }, 1000);
                }
            });

            e.stopImmediatePropagation();
        });
    };

    exports.setSmsTpl = function () {
        // update event
        $('.upBtn').click(function (e) {
            var id = $(this).attr('data-id');
            var type = $(this).attr('data-type');
            var tpl = 'site/pop/' + type + '_tpl';
            // api request
            base.requestApi('/admin/api/site/getKeyVal', {'id': id, 'tpl': tpl}, function (res) {
                if (res.result == 1) {
                    base.showTip('ok', '获取数据成功！', 1000);
                    base.showPop('#catPopup');
                    // mail
                    if (type == 'mail') {
                        editor.init('#catPopup .mailContent');
                    }

                    $('#catPopup').find('.field-area').html(res.data);
                }
            });

            e.stopImmediatePropagation();
        });


        $('#catPopup .saveBtn').click(function (e) {
            var data = $('#catPopup .form').serializeObject();
            var id = $('#catPopup #data_id').val();
            var type = $('#catPopup #data_id').attr('data-type');
            if (!data.val) {
                $('#catPopup .tplContent').focus();
                tip.showTip('err', '请填写模板内容', 3000);
                return;
            }
            if (type == 'mail' && !data.param) {
                $('#catPopup .param').focus();
                tip.showTip('err', '请填写邮件主题', 3000);
                return;
            }

            if (data.val.indexOf('${code}') === -1) {
                $('#catPopup .tplContent').focus();
                tip.showTip('err', '不能缺少验证码变量${code}', 3000);
                return;
            }

            // api request
            base.requestApi('/admin/api/site/saveKeyVal', {'data': data, id: id}, function (res) {
                if (res.result == 1) {
                    base.showTip('ok', '数据保存成功！', 3000);
                    setTimeout(function () {
                        base.hidePop();
                        window.location.reload();
                    }, 1000);
                }
            });

            e.stopImmediatePropagation();
        });
    };
});