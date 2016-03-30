define(function (require, exports) {
    var fresh = require("/assets/home/js/app/app.more.js");
    var base = require("/assets/home/js/app.base.js");
    exports.more = function (url) {
        $(".mfilters").on('change', "#province", function () {
            var province_id = $(this).val();
            base.requestApi('/home/api/area/getCities', {province_id: province_id}, function (res) {
                if (res.result == 1) {
                    var html = "<option value='0'>全部</option>";
                    $(".department_filter").hide();
                    $("#department").html(html);
                    var data = res.data;
                    $(data).each(function () {
                        html += "<option value='" + this.id + "'>" + this.short_name + "</option>";
                    });
                    $("#city").html(html);
                }
            }, false)
        });
        $(".mfilters").on('change', "#city", function () {
            var city_id = $(this).val();
            base.requestApi('/home/api/area/getDepartment', {city_id: city_id}, function (res) {
                if (res.result == 1) {
                    var html = "<option value='0'>全部</option>";
                    var data = res.data;
                    $(data).each(function () {
                        html += "<option value='" + this.id + "'>" + this.name + "</option>";
                    });
                    $("#department").html(html);
                    if (data != "") {
                        $(".department_filter").show();
                    } else {
                        $(".department_filter").hide();
                    }
                }
            }, false)
        });
        fresh.more(url);
    };
    exports.select = function (url) {


        //分类筛选(单选)
        $('.mulit-single > .choiceCon').on('click', function () {
            $(this).next('ul').stop(true, false).slideToggle();
        });
        $(".mulit-single > ul").find("li").on('click', function () {
            var text = $(this).text();
            var data_id = $(this).attr('data-id');
            //console.log(text)
            $(this).parents().siblings(".choiceCon").html(text);
            $(this).parents().siblings(".choiceCon").attr('data-id', data_id);
            $(this).parent("ul").hide();
            fresh.reload(url, {model: data_id});
        });


        $(".select-single > ul").find("li").on('click', function () {
            var txt = $(this).text();
            //console.log(txt)
            $(this).parents().siblings(".select-area").attr('data-id', $(this).attr('data-id'));
            $(this).parents().siblings(".select-area").html(txt).removeClass("on");
            $(this).parent("ul").hide();
        });

        $(".select-single > .select-area").on('click', function () {
            if ($(this).hasClass("on")) {
                $(this).next('ul').stop(true, false).hide();
                $(this).removeClass("on")
            } else {
                $(this).next('ul').stop(true, false).slideDown();
                $(this).addClass("on")
            }

        });


    };
    //关注
    exports.attention = function () {
        $(document).on('click', '.attend-btn', function () {
            var __this = $(this);
            if (window.checkLogin()) {
                var id = $(this).attr('data-id');
                var user = $(this).attr('data-user');
                var type = $(this).attr('data-type');
                if (id <= 0 || user <= 0 || type == "") {
                    return false;
                }
                base.requestApi("/home/api/social/attention", {type: type, to_uid: user}, function (data) {
                    if (data.result == 1) {
                        tip.showTip("ok", data.data, 1000);
                        __this.html(data.data == '关注成功' ? "已关注" : "关注");
                        if (__this.hasClass("active")) {
                            __this.removeClass("active")
                        } else {
                            __this.addClass("active")
                        }
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

        });

        //删除图片
        $(document).on('click', ".img-select ul li i", function () {
            $(this).parent("li").remove();
            $(".total_img").html(parseInt($(".total_img").html()) - 1);
            $(".left_img").html(parseInt($(".left_img").html()) + 1);
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