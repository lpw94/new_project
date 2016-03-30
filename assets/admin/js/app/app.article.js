// admin user,group,menus,permission settings
define(function (require, exports) {

    var base = require('app.base');//公共函数
    var store = require('app.storage');//公共函数

    /**
     * publish post or not
     *
     */
    exports.pubPost = function () {
        base.publish('/admin/api/article/publish');
    };

    /**
     * del post
     */
    exports.delPost = function () {
        base.del('/admin/api/article/del');
    };

    /**
     * add post
     */
    exports.savePost = function () {
        // 初始化编辑器
        var editor = require('app.editor');
        editor.init('#postForm #txtContent');
        // 初始化上传
        // 初始化上传
        store.getImg('#upCoverIcon', function (res) {
            $('#cover').val(res.url);
            $('.imgPreview').attr('src', res.url).show();
        });

        $(".submitBtn").on('click', function (e) {
            // params
            var data = $("#postForm").serializeObject();
            // if update
            var id = $(this).attr('data-id');

            if (checkNull(data.title, '#postForm #txtTitle') == false) {
                tip.showTip('err', "请填写标题", 3000);
                $('#postForm #txtTitle').focus();
                return false;
            }

            if (isNaN(data.cid) || data.cid == '' || data.cid == null) {
                base.showTip('err', '请选择文章分类！', 3000);
                return false;
            }

            if (data.created) {
                if (false == IsDateTime(data.created)) {
                    base.showTip('err', '时间格式不正确！', 3000);
                    return false;
                }
            }

            // tags
            var tags = [];
            $('.tag-list .tag').each(function () {
                var tagName = $(this).attr('data-tag').trim();
                if (tagName) {
                    tags.push(tagName);
                }
            });
            tags = $.unique(tags);

            data.tags = tags;

            if (id) {
                // update params
                data = $.extend({}, data, {'id': id});
            }

            // api request
            base.requestApi('/admin/api/article/save', {data: data, id: id}, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', "文章保存成功", 2000);
                    setTimeout(function () {
                        window.location.href = res.data;
                    }, 1000);
                }
            });
            e.stopImmediatePropagation();
        });
    };

    exports.setCat = function () {
        store.getImg('.getCoverBtn', function func(res) {
            $('#catPopup #cover_img').val(res.url);
            $('.preview_img').attr('src', res.url);
        }, false);

        // update event
        $('.upBtn').click(function (e) {
            var id = $(this).attr('data-id');
            // api request
            base.requestApi('/admin/api/article/getCat', {'id': id}, function (res) {
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
            // set icon
            var icon = data.icon;
            $('.icon-preview').removeClass().addClass('icon-preview ' + icon);
            $('#catPopup').find('#icon').val(data.icon);
            // 二级分类
            $('#catPopup').find('#parent_id option').show();
            $('#catPopup').find('#parent_id option[value="' + data.id + '"]').hide();
            if (data.parent_id > 0) {
                $('#catPopup').find('#parent_id option[value="' + data.parent_id + '"]').prop('selected', true);
            }

            $('#catPopup').find('#cover_img').val(data.cover);
            $('#catPopup').find('.preview_img').attr('src', data.cover);

            $('#catPopup').find('#name').val(data.name);
            $('#catPopup').find('#detail').val(data.detail);
            $('#catPopup').find('#sort').val(data.sort);
            $('#catPopup').find('#page').val(data.page);


            var allow_login = parseInt(data.allow_login);
            $('#catPopup').find("input[name='allow_login']:eq(" + allow_login + ")").attr('checked', 'checked');
            if (allow_login == 1) {
                $('#catPopup').find('#pagec').css('display', 'block');
            }
            $('#catPopup').find('.saveBtn').attr('data-id', data.id);

        }

        function resetModal() {
            $('#catPopup').find('#color').val('color117');

            // set icon
            $('.icon-preview').removeClass().addClass('icon-preview icon-sun');
            $('#catPopup').find('#icon').val('icon-sun');

            $('#catPopup').find('#name').val('');
            $('#catPopup').find('#detail').val('');
            $('#catPopup').find('#sort').val(0);
            $('#catPopup').find('.saveBtn').removeAttr('data-id');
        }

        function save() {
            $('#catPopup .saveBtn').click(function (e) {
                var name = $('#catPopup').find('#name').val();
                var detail = $('#catPopup').find('#detail').val();
                var icon = $('#catPopup').find('#icon').val();
                var color = $('#catPopup').find('#color').val();
                var cover_img = $('#catPopup').find('#cover_img').val();
                var sort = $('#catPopup').find('#sort').val();
                var parent_id = $('#catPopup').find('#parent_id option:selected').val();
                var allow_login = $('#catPopup').find("input[name='allow_login']:checked").val();
                var page = $('#catPopup').find("#page").val();


                var id = $(this).attr('data-id');

                if (!checkNull('#catPopup #name', '分类名称不能为空')) {
                    return false;
                }

                if (!checkNull('#catPopup #icon', '请选择图标')) {
                    return false;
                }

                var data = {
                    name: name,
                    detail: detail,
                    icon: icon,
                    color: color,
                    cover: cover_img,
                    sort: sort,
                    parent_id: parent_id,
                    allow_login: allow_login,
                    page: page
                };

                // api request
                base.requestApi('/admin/api/article/saveCat', {'data': data, id: id}, function (res) {
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

    /**
     * del post
     * @param btn
     */
    exports.delCat = function () {
        base.del('/admin/api/article/delCat', "严重警告！\r\n　　删除栏目后该栏目及子栏目原有的所有文章会将不能指定栏目，前台页面可能会出错哦！\r\n　　您确定需要进行此操作吗？");
    };

    /**
     * mv cat and their children to new parent
     * @param btn
     */
    exports.mvCat = function (btn) {
        $(btn).on('click', function (e) {
            // params
            var cid = $(this).attr('data-cid');
            var toCid = $(this).parents('.item[data-id=' + cid + ']').find('select.mvCat').val();

            if (isNaN(toCid) || toCid == '') {
                base.showTip('err', '请选择栏目！', 3000);
                return false;
            }
            // confirm
            var cm = window.confirm("严重警告！\r\n　　移动栏目后该栏目及子栏目会移动到新栏目,如果栏目降级则栏目及子栏目所有文章会将移动到新栏目，前台页面可能会出错哦！\r\n　　您确定需要进行此操作吗？");
            if (!cm) {
                return;
            }
            var data = {
                'cid': cid,
                'toCid': toCid
            };
            // disable the button
            $(btn).attr('disabled', true);
            // api request
            base.requestApi('/admin/api/post/mvCat', data, function (res) {
                if (res.result == 1) {
                    window.location.reload();
                    base.showTip('ok', '移动栏目成功！');
                }
            });
            e.stopImmediatePropagation();
        });
    };

    /**
     * mv cat and their children to new parent
     * @param btn
     */
    exports.mvPost = function () {
        $('.list').on('click', '.mvPostBtn', function (e) {
            // params
            var toCid = $('select.mvPostCat').val();

            if (isNaN(toCid) || toCid == '') {
                base.showTip('err', '请选择栏目！', 3000);
                return false;
            }
            var data = [];
            $(".list .listData input.chk").each(function () {
                if ($(this).attr('checked') == true || $(this).attr('checked') == 'checked') {
                    data.push($(this).attr('data-id'));
                }
            });

            //  has no selected
            if (data.length == 0) {
                base.showTip('err', '请选择需要移动的项', 3000);
                return;
            }

            // confirm
            var cm = window.confirm('你确定需要移动选中的文章到新分类吗？');
            if (!cm) {
                return;
            }

            // api request
            base.requestApi('/admin/api/article/mvPost', {'data': data, 'cid': toCid}, function (res) {
                if (res.result == 1) {

                    base.showTip('ok', '操作成功！', 2000);
                    setTimeout(function(){
                        window.location.reload();

                    },2000)
                }
            });

            e.stopImmediatePropagation();
        });
    };


    exports.setTags = function () {
        // add
        $('.addTag').on('click', function (e) {
            var val = $('.tagVal').val();
            var tags = val.split(',');
            var tmp = [];
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];
                var tp = tag.split(' ');
                for (var j = 0; j < tp.length; j++) {
                    if (tp[j] && tp[j]) {
                        tmp.push(tp[j]);
                    }
                }
            }
            // old data
            $('.tag-list .tag').each(function () {
                var tagname = $(this).attr('data-tag');
                if (tagname) {
                    tmp.push(tagname)
                }
            });
            tmp = $.unique(tmp);
            var str = '';
            for (var k in tmp) {
                str += '<span class="tag" data-tag="' + tmp[k] + '"><i class="icon icon-remove rm-tag">x</i> ' + tmp[k] + '</span>';
            }
            $('.tag-list').html(str);
            $('.tagVal').val('');
            e.stopImmediatePropagation();
        });

        // remove
        $('.tag-list .tag  .rm-tag').on('click', function (e) {
            var _this = this;
            $(_this).parent().fadeOut();
            setTimeout(function () {
                $(_this).parent().remove();
            }, 500);
            e.stopImmediatePropagation();
        });

        // add from exists
        $('.all-tags .tag').on('click', function (e) {
            var tag = $(this).attr('data-tag');
            var tmp = [tag];
            // old data
            $('.tag-list .tag').each(function () {
                var tagname = $(this).attr('data-tag');
                if (tagname) {
                    tmp.push(tagname)
                }
            });
            tmp = $.unique(tmp);

            var str = '';
            for (var k in tmp) {
                str += '<span class="tag" data-tag="' + tmp[k] + '"><i class="icon icon-remove rm-tag">x</i> ' + tmp[k] + '</span>';
            }
            $('.tag-list').html(str);

            e.stopImmediatePropagation();
        });
    }

    function IsDateTime(strDateTime) {
        // 先判断格式上是否正确
        var regDateTime = /^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
        if (!regDateTime.test(strDateTime))
            return false;

        // 将年、月、日、时、分、秒的值取到数组arr中，其中arr[0]为整个字符串，arr[1]-arr[6]为年、月、日、时、分、秒
        var arr = regDateTime.exec(strDateTime);

        // 判断年、月、日的取值范围是否正确
        if (!IsMonthAndDateCorrect(arr[1], arr[2], arr[3]))
            return false;

        // 判断时、分、秒的取值范围是否正确
        if (arr[4] >= 24)
            return false;
        if (arr[5] >= 60)
            return false;
        if (arr[6] >= 60)
            return false;

        function IsMonthAndDateCorrect(nYear, nMonth, nDay) {
            // 月份是否在1-12的范围内，注意如果该字符串不是C#语言的，而是JavaScript的，月份范围为0-11
            if (nMonth > 12 || nMonth <= 0)
                return false;

            // 日是否在1-31的范围内，不是则取值不正确
            if (nDay > 31 || nMonth <= 0)
                return false;

            // 根据月份判断每月最多日数
            var bTrue = false;
            switch (nMonth) {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12:
                    bTrue = true;    // 大月，由于已判断过nDay的范围在1-31内，因此直接返回true
                    break;
                case 4:
                case 6:
                case 9:
                case 11:
                    bTrue = (nDay <= 30);    // 小月，如果小于等于30日返回true
                    break;
            }

            if (!bTrue)
                return true;

            // 2月的情况
            // 如果小于等于28天一定正确
            if (nDay <= 28)
                return true;
            // 闰年小于等于29天正确
            if (IsLeapYear(nYear))
                return (nDay <= 29);
            // 不是闰年，又不小于等于28，返回false
            return false;
        }

        // 正确的返回
        return true;
    }

    function checkNull(str, field) {
        if (str.length == 0) {
            $(field).focus().parent().find('.status').html('不能为空');
            return false;
        } else {
            $(field).parent().find('.status').html('');
        }
        return true;
    }

});