define(function (require, exports) {
    var fresh = require("/assets/home/js/app/app.more.js");
    var base = require("/assets/home/js/app.base.js");
    var upload = require("app.upload.js");
    exports.more = function (url) {
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
    exports.create = function () {
        /*  //创建圈子
         $(".group_box .publish").on('click',function(){
         $(".masklayer").show();
         $(".new-activity").show();
         });
         $(".new-activity > i").on('click',function(){
         $(".masklayer").hide();
         $(".new-activity").hide();
         });
         $(".masklayer").on('click',function(){
         $(".masklayer").hide();
         $(".new-activity").hide();
         });*/
        var obj = $('.groupForm');
        upload.upload('.upCoverBtn', {
            'type': 'img'// 必传参数：img,file,media
        }, function (res) {
            setTimeout(function () {
                $('.up_file_list .queue-file').remove();
            }, 500);
            obj.find('.cover_img').attr('src', res.url);
            obj.find('.cover').val(res.url);
        });
        obj.on('click', '.saveBtn', function (e) {
            var data = obj.serializeObject();
            if (!$.trim(data.name)) {
                obj.find('.name').focus();
                tip.showTip('err', '请填写圈子名称', 3000);
                return;
            }
            if (!data.cat_id || data.cat_id == 0) {
                obj.find('.cat_id').focus();
                tip.showTip('err', '请选择圈子类别', 3000);
                return;
            }
            if (!$.trim(data.brief)) {
                obj.find('.txtContent').focus();
                tip.showTip('err', '请填写圈子介绍', 3000);
                return;
            }
            if (!$.trim(data.cover)) {
                tip.showTip('err', '请上传圈子logo', 3000);
                return;
            }
            base.requestApi('/home/api/group/create', {data: data}, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '恭喜您,圈子创建成功!', 10000);
                    setTimeout(function () {
                        window.location.href = res.data;
                    }, 1500);
                }
            }, true);
            e.stopImmediatePropagation();
        })


    };
    exports.group = function () {

        //解散圈子
        $(document).on('click', '.delGroup', function () {
            if (window.checkLogin()) {
                var id = $(this).attr('data-id');
                var type = $(this).attr('data-type');
                var tag = $(this).attr('data-tag');
                base.requestApi('/home/api/group/delGroup', {id: id, type: type}, function (data) {
                    if (data.result == 1) {
                        tip.showTip("ok", data.data, 1000);
                        window.location.href = "/group";
                    } else {
                        tip.showTip("ok", data.error.msg, 1000);
                    }
                })
            }

        });
        //加入圈子
        $(document).on('click', '.joinGroup', function () {
            if (window.checkLogin()) {
                var id = $(this).attr('data-id');
                var type = $(this).attr('data-type');
                var tag = $(this).attr('data-tag');
                var user_id = $(this).attr('data-user-id');
                var user_name = $(this).attr('data-user-name');
                var user_avatar = $(this).attr('data-user-avatar');
                var __this = $(this);
                base.requestApi('/home/api/group/joinGroup', {id: id, type: type}, function (data) {
                    if (data.result == 1) {
                        tip.showTip("ok", data.data, 1000);
                        __this.removeClass("joinGroup").addClass("leftGroup");
                        __this.val("退出" + tag);
                        var html = $(".menber_items:last").clone();
                        html.find(".member_name").html(user_name);
                        html.attr("data-id", user_id);
                        html.find(".member_avatar").attr('src', user_avatar);
                        $(".menber_items:first").before(html);
                        $(".member_count").html(parseInt($(".member_count").html()) + 1);
                    } else {
                        tip.showTip("ok", data.error.msg, 1000);
                    }
                })
            }


        });

        //退出圈子
        $(document).on('click', '.leftGroup', function () {
            if (window.checkLogin()) {
                var id = $(this).attr('data-id');
                var type = $(this).attr('data-type');
                var tag = $(this).attr('data-tag');
                var user_id = $(this).attr('data-user-id');
                var __this = $(this);
                base.requestApi('/home/api/group/leftGroup', {id: id, type: type}, function (data) {
                    if (data.result == 1) {
                        tip.showTip("ok", data.data, 1000);
                        __this.removeClass("leftGroup").addClass("joinGroup");
                        __this.val("加入" + tag);
                        $(".member_items[data-id=" + user_id + "]").remove();
                        $(".member_count").html(parseInt($(".member_count").html()) - 1);
                    } else {
                        tip.showTip("ok", data.error.msg, 1000);
                    }
                })
            }


        });


    }


});