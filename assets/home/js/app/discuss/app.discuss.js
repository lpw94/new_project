define(function (require, exports) {
    var fresh = require("/assets/home/js/app/app.more.js");
    var base = require("/assets/home/js/app.base.js");
    exports.more = function (url, params) {
        fresh.more(url, params);
    };

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
    //关注
    exports.attention = function () {
        $(".attend-btn").on('click', function () {
            if (window.checkLogin()) {
                var id = $(this).attr('data-id');
                var user = $(this).attr('data-user');
                var type = $(this).attr('data-type');
                if (id <= 0 || user <= 0 || type == "") {
                    return false;
                }
                base.requestApi("/home/api/social/attention", {type: type, to_uid: user}, function (res) {
                    if (res.result == 1) {
                        tip.showTip("ok", res.data, 2000);
                        $(".attend-btn").html(res.data == '关注成功' ? "取消关注" : "关注");
                    }
                })
            }
        })
    };
    //发布
    exports.publish = function (url) {
        $(".group_box .publish").on('click', function () {
            if (window.checkLogin()) {
                $(".masklayer").show();
                $(".new-activity").show();
            }
        });
        $(".new-activity > i").on('click', function () {
            $(".masklayer").hide();
            $(".new-activity").hide();
        });
        $(".masklayer").on('click', function () {
            $(".masklayer").hide();
            $(".new-activity").hide();
        });
        //上传图片
        $(".send-select").on('click', function () {
            $(".total_img").html(0);
            $(".left_img").html(9);
            $(".img_list").remove();
            $(".img-select").show();

        });
        $(".img-select").find(".off").on('click', function () {
            $(".img-select").hide();
            $("#browse_files_button_undefined").show();

        });

        //删除图片
        $(document).on('click', ".img-select ul li i", function () {
            $(this).parent("li").remove();
            $(".total_img").html(parseInt($(".total_img").html()) - 1);
            $(".left_img").html(parseInt($(".left_img").html()) + 1);
            $("#browse_files_button_undefined").show();
        });
        $(".btn_publish").on('click', function () {
            if (window.checkLogin()) {
                var content = $(".content").val();
                var imgs = "";
                $(".img_list img").each(function () {
                    var src = $(this).attr('src');
                    if (src != "") {
                        imgs += "," + src;
                    }
                });
                imgs = imgs != "" ? imgs.substr(1) : '';
                base.requestApi("/home/api/discuss/publish", {content: content, imgs: imgs}, function (data) {
                    if (data.result == 1) {
                        tip.showTip("ok", '发布成功', 2000);
                        window.inAjaxProcess=false;
                        $(".img-select").find(".off").click();
                        $(".content").val("");
                        fresh.reload(url);
                    }
                },false)

            }
        });
        /*  var title = $.trim($(".title").val());//主题
         var cat = $.trim($(".cat_id").val());//分类
         var city = $.trim($(".city").val());//城市
         */


    };

    exports.model = function () {


        //返回顶部
        $(window).scroll(function () {
            //获取窗口已滚动的高度
            var windowScrollTop = $(window).scrollTop();
            var oTools = $("#gotop");
            //如果大约240PX，就渐显出“回到顶部”，否则即隐藏
            if (windowScrollTop > 240) {
                oTools.fadeIn();
            } else {
                oTools.fadeOut();
            }
        });
        $("#gotop").click(function () {
            //点击“回到顶部”，滚动到顶部，并带动画效果
            $("html,body").animate({scrollTop: 0}, 500);
        });


    }
});