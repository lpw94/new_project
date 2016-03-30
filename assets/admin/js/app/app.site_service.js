// admin user,group,menus,permission settings
define(function (require, exports) {

    var base = require('app.base');//公共函数
    var store = require('app.storage');//公共函数

    exports.setService = function () {
        store.getImg('.getCoverBtn', function func(res) {
            $('#catPopup #cover_img').val(res.url);
            $('.preview_img').attr('src', res.url);
        }, false);

        // update event
        $('.upBtn').click(function (e) {
            var id = $(this).attr('data-id');
            // api request
            base.requestApi('/admin/api/site/getService', {'id': id}, function (res) {
                if (res.result == 1) {
                    base.showTip('ok', '获取数据成功！', 1000);
                    base.showPop('#catPopup');

                    setModal(res.data);
                }
            });

            e.stopImmediatePropagation();
        });

        // add event
        $('.addBtn').click(function (e) {
            resetModal();
            base.showPop('#catPopup');
        });

        // save event
        save();

        function setModal(data) {
            // 二级分类
            $('#catPopup').find('#parent_id option').show();
            $('#catPopup').find('#parent_id option[value="' + data.id + '"]').hide();
            if (data.parent_id > 0) {
                $('#catPopup').find('#parent_id option[value="' + data.parent_id + '"]').prop('selected', true);
            }

            $('#catPopup').find('#cover_img').val(data.thumb);
            $('#catPopup').find('.preview_img').attr('src', data.thumb);

            $('#catPopup').find('#name').val(data.name);
            $('#catPopup').find('#sort').val(data.sort);
            $('#catPopup').find('.saveBtn').attr('data-id', data.id);
        }

        function resetModal() {
            // set icon
            $('#catPopup').find('#name').val('');
            $('#catPopup').find('#sort').val(0);
            $('#catPopup').find('.saveBtn').removeAttr('data-id');
        }

        function save() {
            $('#catPopup .saveBtn').click(function (e) {
                var name = $('#catPopup').find('#name').val();
                var cover_img = $('#catPopup').find('#cover_img').val();
                var sort = $('#catPopup').find('#sort').val();
                var parent_id = $('#catPopup').find('#parent_id option:selected').val();

                var id = $(this).attr('data-id');

                if (!checkField('#catPopup #name', '分类名称不能为空')) {
                    return false;
                }

                var data = {
                    name: name,
                    thumb: cover_img,
                    sort: sort,
                    parent_id: parent_id,
                };

                // api request
                base.requestApi('/admin/api/site/saveService', {'data': data, id: id}, function (res) {
                    if (res.result == 1) {

                        window.location.reload();
                        base.showTip('ok', '操作成功！', 1000);
                        base.hidePop();
                    }
                });

                e.stopImmediatePropagation();
            });
        }
    };
});