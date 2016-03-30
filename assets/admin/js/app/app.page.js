// admin user,group,menus,permission settings
define(function (require, exports) {

    var base = require('app.base');//公共函数

    exports.savePage = function () {
        // 初始化编辑器
        var editor = require('app/app.editor');
        editor.init('#postForm #txtContent');
        // 初始化上传
        // 初始化上传

        $(".submitBtn").on('click', function (e) {
            var data = $(".field textarea").val();
            var id = $(this).attr('data-id');

            // api request
            base.requestApi('/admin/api/page/save', {data: data, id: id}, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', "信息保存成功", 2000);
                    setTimeout(function () {
                        window.location.href = res.data;
                    }, 1000);
                }
            });
            e.stopImmediatePropagation();
        });
    };
});