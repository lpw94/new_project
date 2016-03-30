define(function (require, exports) {
    var fresh = require("/assets/home/js/app/app.more.js");
    var base = require("/assets/home/js/app.base.js");
    var upload = require("app.upload.js");

    //举报
    exports.report = function () {
        //举报话题
        $(document).on("click", ".name-msg .more", function () {
            var more = $(this).parent(".name").children("i");
            if (more.hasClass("on")) {
                $(this).parent(".name").siblings(".more-drop").hide();
                $(this).removeClass("on")
            }
            else {
                $(this).parent(".name").siblings(".more-drop").show();
                $(this).addClass("on");
            }
        });
        $(document).on("click", ".more-drop .report", function () {
            if (window.checkLogin()) {
                $(".masklayer").show();
                $(".report-box").show();
                $(".report_user").html($(this).attr('data-user'));
                $(".report_content").html($(this).attr('data-content'));
                $(".report_avatar").attr('src', $(this).attr('data-avatar'));
                $(".report_id").attr('data-id', $(this).attr('data-id'));
            }
        });
        $(document).on("click", ".push i", function () {
            $(".masklayer").hide();
            $(".push").hide();
        });
        $(document).on("click", ".masklayer", function () {
            $(".masklayer").hide();
            $(".push").hide();
            $(".new-activity").hide();
        });
        //提交举报
        $(document).on("click", ".submit-btn", function () {
            var tag = $(".report_reason").attr('data-id');
            var id = $(this).attr('data-id');
            if (tag <= 0) {
                tip.showTip('err', '请选择举报原因', 2000);
                return false;
            }
            if (id <= 0) {
                return false;
            }
            base.requestApi('/home/api/discuss/report', {
                type: 'discuss',
                item_id: id,
                reason: '',
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
        //举报成功
        $(document).on("click", ".report-success-btn", function () {
            $(".masklayer").hide();
            $(".push").hide();
        });

    };

    //发布
    exports.saveDemand = function () {
        var obj = $('.demandForm');

        upload.upload('.upCoverBtn', {
            'type': 'img',// 必传参数：img,file,media
        }, function (res) {
            setTimeout(function () {
                $('.up_file_list .queue-file').remove();
            }, 500);
            obj.find('.cover_img').attr('src', res.url);
            obj.find('.cover').val(res.url);
        });

        obj.on('click', '.saveBtn', function (e) {
            var data = obj.serializeObject();
            data.brief = $.trim(data.brief);

            if (!data.cat_id || data.cat_id == 0) {
                obj.find('.cat_id').focus();
                tip.showTip('err', '请选择需求类别', 3000);
                return;
            }

            if (!data.brief) {
                obj.find('.txtContent').focus();
                tip.showTip('err', '请填写需求详情', 3000);
                return;
            }

            if (data.brief.length < 12 || data.brief.length > 100) {
                obj.find('.txtContent').focus();
                tip.showTip('err', '需求详情内容必须为12-100个字符', 3000);
                return;
            }

            base.requestApi('/home/api/demand/save', {data: data}, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '恭喜您,需求发布成功!', 10000);
                    setTimeout(function () {
                        window.location.href = res.data;
                    }, 1500);
                }
            }, true);
            e.stopImmediatePropagation();
        })
    };

});