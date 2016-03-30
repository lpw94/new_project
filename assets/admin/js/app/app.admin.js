// admin user,group,menus,permission settings
define(function (require, exports) {

    var base = require('app.base');//公共函数
    /**
     * login access
     *
     */
    exports.login = function () {
        $('.loginForm').on('click', '.loginBtn', function (e) {
            var data = $('.loginForm').serializeObject();

            if (!new RegExp(/(\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*)/).test(data.account)) {
                if (!new RegExp(/[0-9a-zA-Z-+]{4,16}/).test(data.account)) {
                    tip.showTip('err', "账号格式不准确，请填写用户名或邮箱！", 2000);
                    $('.forgotForm #account').focus();
                    return;
                }
            }

            if (data.password.length < 5 || data.password.length > 16) {
                tip.showTip('err', "密码长度为6-16位", 2000);
                return;
            }


            base.requestApi('/admin/api/account/login', data, function (res) {
                if (res.result == 1) {
                    setTimeout(function () {
                        window.location.href = res.data;
                    }, 1500);
                    tip.showTip("ok", '恭喜您，登陆成功！', 2000);
                }
            });

            e.stopImmediatePropagation();
        });
    };

    /**
     * update Admin userInfo
     */
    exports.updateAdminInfo = function () {
        $('#btnUpAdmin').on('click', function () {
            var obj = $("#updateAdminForm");
            // params
            var name = obj.find('.name').val();
            var password = obj.find('.password').val();

            if (password) {
                if (!(password.length >= 6 && password.length <= 16)) {
                    obj.find('.password').focus();
                    tip.showTip('err', '密码长度为6-16位,为空则不修改~!', 3000);
                    return false;
                }
            }

            if (!name) {
                obj.find('.name').focus();
                tip.showTip('err', '用户名不能为空!', 3000);
            }

            // api request
            base.requestApi('/admin/api/admin/setMyInfo', {data: {'name': name, password: password}}, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '恭喜您，个人信息修改成功！', 3000);
                    setTimeout(function () {
                        window.location.reload();
                    }, 1500);
                }
            });
        });
    };

    /**
     * mv cat and their children to new parent
     * @param btn
     */
    exports.mvMenus = function (btn) {
        $(document).on('click', btn, function (e) {
            // params
            var toCid = $('select.mvMenusCat').val();

            if (isNaN(toCid) || toCid == '') {
                tip.showTip('err', '请选择二级栏目！', 3000);
                return false;
            }

            var data = [];
            $(".list .listData input.chk").each(function () {
                if ($(this).prop('checked') == true || $(this).prop('checked') == 'checked') {
                    data.push($(this).attr('data-id'));
                }
            });

            //  has no selected
            if (data.length == 0) {
                tip.showTip('err', '请选择需要移动的项', 3000);
                return;
            }

            // confirm
            var cm = window.confirm('你确定需要进行此操作吗？');
            if (!cm) {
                return;
            }

            // api request
            base.requestApi('/admin/api/admin/mvMenu', {'data': data, 'cid': toCid}, function (res) {
                if (res.result == 1) {
                    for (var i = 0; i < data.length; i++) {
                        $('.listData .item[data-id="' + data[i] + '"]').remove();
                    }
                    tip.showTip('ok', '操作成功！', 2000);
                }
            });

            e.stopImmediatePropagation();
        });
    };

    /**
     * set menus
     */
    exports.setMenus = function () {
        // first cat click
        $("#menus").on('click', '.menuCat', function () {
            var catPid = $(this).attr('data-id');
            // change current
            $("#menus .menuCat").removeClass('current');
            $(this).addClass('current');

            // change second cat view
            $("#menus .menuCat2").removeClass('current').hide();
            $("#menus .menuCat2[data-pid=" + catPid + "]").show();
        });

        // second cat click
        $("#menus").on('click', '.menuCat2', function () {
            var catId = $(this).attr('data-id');
            $("#menus .menuCat2").removeClass('current');
            $(this).addClass('current');
            $("#menus .listData .item").removeClass('current').hide();
            $("#menus .listData .item[data-cid=" + catId + "]").show();
            // add cid to attr
            $('#menus .listData .addMenuRow').show().attr('data-cid', catId);
            $('#menus .listData .addMenuBtn').show().attr('data-cid', catId);
            $("#menus .empty").hide();
        });

        // submit
        var btn = '#setMenuBtn';
        $(btn).on('click', function (e) {
            var data = [];
            $('#menus .listData .item').each(function () {
                var id = $(this).attr('data-id');
                var cid = $(this).attr('data-cid');

                // change data
                var sort = $(this).find('.sort').val();
                var title = $(this).find('.menuTitle').val();
                var isHide = $(this).find('.isHide').val();

                //old data
                var old_order = $(this).find('.sort').attr('data-old');
                var old_title = $(this).find('.menuTitle').attr('data-old');
                var old_isHide = $(this).find('.isHide').attr('data-old');

                if (!(sort == old_order && title == old_title && isHide == old_isHide)) {
                    var menu = {
                        id: id,
                        cid: cid,
                        title: title,
                        sort: sort,
                        is_hide: isHide
                    };
                    data.push(menu);
                }
            });

            if (data.length == 0) {
                tip.showTip('err', '您未作任何的修改', 3000);
                return false;
            }

            // console.log(a);
            // disable the button
            $(btn).attr('disabled', true);
            // api request
            base.requestApi('/admin/api/admin/setMenu', {'menus': data}, function (res) {
                // cancel to disable the btn
                $(btn).attr('disabled', false);
                if (res.result == 1) {
                    tip.showTip('ok', '恭喜您，导航更新成功！', 3000);
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000);
                }
            });
            e.stopImmediatePropagation();
        });


    };

    /**
     * menus cats
     */
    exports.setMenusCat = function () {

        // update event
        $('.upBtn').click(function (e) {
            var id = $(this).attr('data-id');
            // api request
            base.requestApi('/admin/api/admin/getMenuCat', {'id': id}, function (res) {
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
            // 二级分类
            $('#catPopup').find('#parent_id option').show();
            $('#catPopup').find('#parent_id option[value="' + data.id + '"]').hide();
            if (data.parent_id > 0) {
                $('#catPopup').find('#parent_id option[value="' + data.parent_id + '"]').prop('selected', true);
            }

            $('#catPopup').find('#name').val(data.title);
            $('#catPopup').find('#url').val(data.url);
            $('#catPopup').find('#icon').val(data.icon);
            $('#catPopup').find('#sort').val(data.sort);
            $('#catPopup').find('.saveBtn').attr('data-id', data.id);
        }

        function resetModal() {
            // set icon
            $('#catPopup').find('#name').val('');
            $('#catPopup').find('#url').val('');
            $('#catPopup').find('#icon').val('');
            $('#catPopup').find('#sort').val(0);
            $('#catPopup').find('.saveBtn').removeAttr('data-id');
        }

        function save() {
            $('#catPopup .saveBtn').click(function (e) {
                var title = $('#catPopup').find('#name').val();
                var url = $('#catPopup').find('#url').val();
                var icon = $('#catPopup').find('#icon').val();
                var sort = $('#catPopup').find('#sort').val();
                var parent_id = $('#catPopup').find('#parent_id option:selected').val();

                var id = $(this).attr('data-id');

                if (!checkField('#catPopup #name', '分组名称不能为空')) {
                    return false;
                }

                var data = {
                    title: title,
                    url: url,
                    sort: sort,
                    icon: icon,
                    parent_id: parent_id
                };

                // api request
                base.requestApi('/admin/api/admin/saveMenuCat', {'data': data, id: id}, function (res) {
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
     * set user permission
     */
    exports.setUserPermission = function () {
        $('#permissionForm ').on('click', '.chk', function (e) {
            var perm = $(this).val();
            if (perm == 1) {
                $(this).val(0);
            } else {
                $(this).val(1);
            }
            e.stopImmediatePropagation();
        });

        // select all
        $('#permissionForm').on('click', ' .selcAll', function () {
            var cid = $(this).attr('data-cid');
            var selc = cid ? '[data-cid=' + cid + ']' : '';
            $('#permissionForm .chk' + selc).each(function () {
                $(this).prop('checked', "checked");
                $(this).val(1);
            });
        });

        // select none
        $('#permissionForm').on('click', '.selcNone', function () {
            var cid = $(this).attr('data-cid');
            var selc = cid ? '[data-cid=' + cid + ']' : '';
            $('#permissionForm .chk' + selc).each(function () {
                $(this).prop('checked', false);
                $(this).val(0);
            });
        });

        //
        // set permission
        $('#permissionForm .setPermissionBtn').on('click', function (e) {
            var data = [];
            var uid = $(this).attr('data-uid');

            $('#permissionForm .chk').each(function () {
                var perm_val = $(this).val();
                var old_perm = $(this).attr('data-old-perm');
                var perm_id = $(this).attr('data-perm-id');
                var mvc_uri = $(this).attr('data-mvc_uri');

                if (!(old_perm == perm_val)) {
                    var info = {'perm_id': perm_id, 'mvc_uri': mvc_uri, 'enable': perm_val};
                    data.push(info);
                }
            });

            if (data.length == 0) {
                tip.showTip('err', '您未作任何的修改', 3000);
                return false;
            }

            // api request
            base.requestApi('/admin/api/admin/setUserPerm', {
                'permissions': JSON.stringify(data),
                'uid': uid
            }, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '恭喜您，管理员权限设置成功！', 3000);
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000);
                }
            });
            e.stopImmediatePropagation();
        })
    };

    /**
     * set user permission
     */
    exports.setGroupPermission = function () {
        $('#permissionForm').on('click', ' .chk', function (e) {
            var perm = $(this).val();
            if (perm == 1) {
                $(this).val(0);
            } else {
                $(this).val(1);
            }
            e.stopImmediatePropagation();
        });

        // select all
        $('#permissionForm').on('click', '.selcAll', function () {
            var cid = $(this).attr('data-cid');
            var selc = cid ? '[data-cid=' + cid + ']' : '';
            $('#permissionForm .chk' + selc).each(function () {
                $(this).val(1);
                $(this).prop('checked', 'checked');
            });
        });

        // select none
        $('#permissionForm').on('click', ' .selcNone', function () {
            var cid = $(this).attr('data-cid');
            var selc = cid ? '[data-cid=' + cid + ']' : '';
            $('#permissionForm .chk' + selc).each(function () {
                $(this).val(0);
                $(this).prop('checked', false);
            });
        });

        //
        var btn = '#permissionForm .setPermissionBtn';
        // set permission
        $(btn).on('click', function (e) {

            var data = [];
            var gid = $(this).attr('data-gid');

            $('#permissionForm .chk').each(function () {
                var perm_val = $(this).val();
                var old_perm = $(this).attr('data-old-perm');
                var perm_id = $(this).attr('data-perm-id');
                var menu_id = $(this).attr('data-menu-id');

                if (!(old_perm == perm_val)) {
                    var info = {'perm_id': perm_id, 'menu_id': menu_id, 'enable': perm_val};
                    data.push(info);
                }
            });
            if (data.length == 0) {
                tip.showTip('err', '您未作任何的修改', 3000);
                return false;
            }

            var data = {'permissions': JSON.stringify(data), 'gid': gid};

            // disable the button
            $(btn).attr('disabled', true);
            // api request
            base.requestApi('/admin/api/admin/setGroupPerm', data, function (res) {

                if (res.result == 1) {
                    tip.showTip('ok', '恭喜您，管理员权限设置成功！即将跳转', 3000);
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000);
                }

                // cancel to disable the btn
                $(btn).attr('disabled', false);
            });
            e.stopImmediatePropagation();
        })
    }

    /**
     */
    exports.delAdmin = function () {
        $(".list .listData").on('click', ".delBtn", function (e) {
            // params
            var id = $(this).attr('data-id');
            var data = id;
            // confirm
            var cm = window.confirm('你确定需要该条数据吗？');
            if (!cm) {
                return;
            }

            // api request
            base.requestApi('/admin/api/admin/del', {data: data}, function (res) {
                if (res.result == 1) {
                    $('.list .listData .item[data-id="' + id + '"]').fadeOut();
                    setTimeout(function () {
                        $('.list .listData .item[data-id="' + id + '"]').remove();
                    }, 1000);
                    tip.showTip('ok', '删除成功！', 3000);
                }
            });

            e.stopImmediatePropagation();
        });
    };

    exports.saveAdmin = function () {
        // add click
        $('.addOptionBtn').click(function (e) {
            base.showPop('#optionPopup');

            e.stopImmediatePropagation();
        });

        // confirm
        $('#optionWidget').on('click', '.res-btn', function () {
            var id = $(this).attr('data-id');
            var obj = $('#optionWidget');
            var name = obj.find('.name').val();
            var password = obj.find('.password').val();
            var account = obj.find('.account').val();
            var active = $('#optionWidget .active:checked').val();
            var level = $('#optionWidget .role').val();

            if (!checkField(obj.find('.account'), '登陆账号未3-16位字母数字下线组成', /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/)) {
                obj.find('.account').focus();
                tip.showTip('err', '登陆账号为3-16位字母数字下线组成', 3000);
                return false;
            }

            if (!id) {
                if (password.length < 6 || password.length > 16) {
                    obj.find('.password').focus();
                    tip.showTip('err', '新建账号时,密码必须填写,长度为6-16位~!', 3000);
                    return false;
                }
            } else {
                if (password) {
                    if (!(password.length >= 6 && password.length <= 16)) {
                        obj.find('.password').focus();
                        tip.showTip('err', '密码长度为6-16位,为空则不修改~!', 3000);
                        return false;
                    }
                }
            }

            var data = {
                account: account,
                name: name,
                password: password,
                active: active
            };

            base.requestApi('/admin/api/admin/save', {data: data, id: id}, function (res) {
                if (res.result == 1) {
                    window.location.reload();
                    base.hidePop('#optionPopup');
                }
            });

        });

        // update
        $('.list .listData .upBtn').click(function (e) {
            var id = $(this).attr('data-id');
            var level = $(this).attr('data-level');
            var name = $(this).attr('data-name');
            var account = $(this).attr('data-account');
            var active = $(this).attr('data-active');

            if (id) {
                base.showPop('#optionPopup');

                $('#optionWidget .res-btn').attr('data-id', id);
                var obj = $('#optionWidget');
                obj.find('.account').val(account);
                obj.find('.name').val(name);
                obj.find('.password').val("");
                obj.find('.role option[value="' + level + '"]').prop('selected', 'selected');
                obj.find('.active[value="' + active + '"]').prop('checked', 'checked');
            }

            e.stopImmediatePropagation();
        });

        // update
        $('.addBtn').click(function (e) {
            var id = $(this).attr('data-id');
            var level = $(this).attr('data-level');
            var name = $(this).attr('data-name');
            var account = $(this).attr('data-account');
            var active = $(this).attr('data-active');

            base.showPop('#optionPopup');

            $('#optionWidget .res-btn').attr('data-id', id);
            var obj = $('#optionWidget');
            obj.find('.account').val("");
            obj.find('.name').val("");
            obj.find('.password').val("");
            obj.find('.role option[value=""]').prop('selected', 'selected');
            obj.find('.active[value="1"]').prop('checked', 'checked');

            e.stopImmediatePropagation();
        });

    };
});