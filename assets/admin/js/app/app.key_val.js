// admin user,group,menus,permission settings
define(function (require, exports) {
    var base = require('app.base');//公共函数
    // 初始化编辑器
    var editor = require('app/app.editor');
    exports.edit = function () {
        editor.init('#htmlContent');
        $(".param").on('change', function () {
            var selected_type = $(this).val();
            if (selected_type == "text") {
                $("#textContent").val(($("#textContent").val()).replace(/<[^>]+>/g, ""));
                $(".textContentWrap").show();//去掉所有的html标记)
                $(".htmlContentWrap").hide();
            } else {
                $(".textContentWrap").hide();
                $(".htmlContentWrap").show();
            }
        });
        $(".submitBtn").on('click', function (e) {
            // params
            var data = $("#keyValForm").serializeObject();
            /*   if (checkField('#keyValForm #param', '请填写联系人姓名') == false) {
             return false;
             }*/
            if (data.param == 'html' && data.htmlContent == '') {
                tip.showTip("err", "请输入消息模板内容", 1000);
                $("#htmlContent").focus();
                return;
            } else if (data.param == 'text' && data.textContent == '') {
                tip.showTip("err", "请输入消息模板内容", 1000);
                $("#textContent").focus();
                return;
            }
            /*  console.log(data);
             return false;*/

            // api request
            base.requestApi('/admin/api/site/saveImTemplate', {data: data, id: $(this).attr("data-id")}, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', "操作成功", 2000);
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000);
                }
            });
            e.stopImmediatePropagation();
        });

    }


});