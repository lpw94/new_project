// admin user,group,menus,permission settings
define(function (require, exports) {
    var base = require('app.base');//公共函数
    require('jquery/jquery.jrumble.1.3.min');
    // 删除
    exports.delNotice = function () {
        base.del('/admin/api/adminNotice/del', '', function (res, data) {
            if (res.result == 1) {
                updateCount();
            }
        });
    };

    exports.readNotice = function () {
        $('.listData').on('click', '.item.unread .notice-act', function (e) {
            var id = $(this).attr('data-id');
            var data = [id];

            // api request
            base.requestApi('/admin/api/adminNotice/read', {data: data}, function (res) {
                if (res.result == 1) {
                    for (var i = 0; i < data.length; i++) {
                        $('.listData .item[data-id="' + data[i] + '"]').removeClass('unread').addClass('read').find('.read-status').html('<small>已读</small>');
                    }
                }
                // 重新跑
                updateCount();
            }, true);
            e.stopImmediatePropagation();
        });

        $('.readAllBtn').on('click', function (e) {
            var data = [];
            $(".list .listData input.chk").each(function () {
                if ($(this).attr('checked') == true || $(this).attr('checked') == 'checked') {
                    data.push($(this).attr('data-id'));
                }
            });

            //  has no selected
            if (data.length == 0) {
                base.showTip('err', '请选择需要操作的项', 3000);
                return;
            }

            // api request
            base.requestApi('/admin/api/adminNotice/read', {data: data}, function (res) {
                if (res.result == 1) {
                    for (var i = 0; i < data.length; i++) {
                        $('.listData .item[data-id="' + data[i] + '"]').removeClass('unread').addClass('read').find('.read-status').html('<small>已读</small>');
                    }
                }
                // 重新跑
                updateCount();
            }, true);
            e.stopImmediatePropagation();
        });
    };

    function updateCount() {
        // api request
        base.requestApi('/admin/api/adminNotice/count', {}, function (res) {
            if (res.result == 1) {
                var notice = $('.msg-wrap .notice .msg-head');
                var warn = $('.msg-wrap .warn  .msg-head');
                var jrumble_opt = {
                    x: 0.1,
                    y: 0.1,
                    rotation: 2,
                    speed: 30,
                    delay: 500
                };
                notice.jrumble(jrumble_opt);
                warn.jrumble(jrumble_opt);

                notice.find('.count').html(res.data.notice_count);
                warn.find('.count').html(res.data.warn_count);

                if (res.data.notice_count > 0) {
                    notice.trigger('startRumble');
                } else {
                    notice.trigger('stopRumble');
                }
                if (res.data.warn_count > 0) {
                    warn.trigger('startRumble');
                } else {
                    warn.trigger('stopRumble');
                }
            }
        }, true);
    }

    /**
     * flush notice count
     *
     */
    exports.flushCount = function () {
        updateCount();
        setInterval(function () {
            updateCount();
        }, 60000);
    };
});