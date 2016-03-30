define(function (require, exports) {
    var fresh = require("/assets/wap/js/app/app.more.js");
    var base = require("/assets/wap/js/app.base.js");
    exports.more = function (url, params) {
        fresh.more(url, params);
    };

    //举报
    exports.report = function () {
        //点击举报
        $(document).on("click", ".btn_sure", function () {
            //验证用户是否登陆
            // if (window.checkLogin()) {
            //验证已经登陆，获取页面数据，然后提交举报
            //举报原因
            var tag = ($(".radio.iconfont.check.icon-dagou").parents('li:first').html()).substring(47);
            //举报item_id
            // var id = ***;
            //要举报的内容
            //var reason = ***;
            //提交举报
            var id = 71;
            if (tag == '') {
                tip.showTip('err', '请选择举报原因', 2000);
                return false;
            }
            if (id <= 0) {
                return false;
            }
            //调用接口，进行数据的处理
            base.requestApi('/wap/api/social/report', {
                type: 'discuss',
                item_id: id,
                reason: '33',
                tag: tag
            }, function (data) {
                if (data.result == 1) {
                    $(".report-box").hide();
                    $(".report-success").show();
                } else {
                    tip.showTip('err', data.error.msg, 2000);
                }
            });

        });
    }
})