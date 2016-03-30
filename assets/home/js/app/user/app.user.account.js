define(function (require, exports) {
    var base = require('app.base');

    function codeTimer(targetId, times) {
        var target = $('#' + targetId);
        if (target) {
            if (times && times > 0) {
                target.addClass('btn-disabled');
                if (times == 60) {
                    target.removeClass('btn-green');
                    target.addClass('btn-gray');
                }
                var newTimes = times - 1;
                target.html('<span style="color: red; font-size: 12px;">' + newTimes + "</span>秒后可重发");
                setTimeout(function () {
                    codeTimer(targetId, times - 1);
                }, 1000);
            }
            else {
                target.removeClass('btn-disabled');
                target.html("重新发送验证码");
            }
        }
    }

    exports.user_forgot = function (type) {
        var obj = $('.forgotForm');
        exports.send_code('forgot', obj);
        exports.send_mail('forgot', obj);

        obj.on('click', '.verifyBtn', function (e) {
            var account = obj.find('.account').val();
            var code = obj.find('.code').val();
            var name = type == "phone" ? '手机号' : '邮箱';
            if (!account) {
                tip.showTip('err', name + '不能为空', '3000');
                obj.find('.account').focus();
                return;
            }

            if (!code) {
                tip.showTip('err', '验证码不能为空', '3000');
                obj.find('.code').focus();
                return;
            }

            base.requestApi('/home/api/account/checkVerifyCode', {
                account: account,
                code: code,
                type: 'forgot'
            }, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '身份验证成功,请重置密码', 3000);
                    $(".reset-area").fadeIn();
                    $(".verify-area").hide();
                } else {
                    obj.find('.code').focus();
                }
            });
            e.stopImmediatePropagation();
        });

        obj.on('click', '.resetBtn', function (e) {
            var account = obj.find('.account').val();
            var code = obj.find('.code').val();
            var state_code = obj.find('.state_code').val();
            var new_password = obj.find('.password').val();

            base.requestApi('/home/api/account/forgot', {
                account: account,
                code: code,
                state_code: state_code,
                type: type,
                new_password: new_password
            }, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '恭喜您,密码重置成功!', 3000);
                    setTimeout(function () {
                        window.location.href = '/account/login';
                    }, 1000);
                    $(".reset-area").fadeIn();
                    $(".verify-area").hide();
                }
            });

            e.stopImmediatePropagation();
        });
    };

    /**
     * Created by yanue on 6/17/14.
     */
    exports.user_login = function (form) {
        var obj = $(form);

        obj.switchTab({
            callback: function (tab) {
                obj.find('.account').removeAttr('name');
                obj.find('#account-' + tab).attr('name', 'account');
                obj.find('.login_type').val(tab);
            }
        });

        //open loginBox
        $(document).on('click', '.openLoginBox', function () {
            base.showPop('#loginPopup');
        });

        //已登录状态下拉框
        $(".user-more").hover(function () {
            $(".logined-drop").show();
        }, function () {
            $(".logined-drop").hide();
        });

        $(".logined-drop").hover(function () {
            $(this).show();
        }, function () {
            $(".logined-drop").hide();
        });

        //login
        obj.on('click', '.loginBtn', function (e) {
            var data = $(form).serializeObject();
            console.log(data);
            if (data.login_type == 'phone') {
                if (!new RegExp(/1[0-9]{10}/).test(data.account)) {
                    tip.showTip('err', "手机格式不正确！", 2000);
                    obj.find('#account-phone').focus();
                    return;
                }
            } else {
                if (!new RegExp(/(\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*)/).test(data.account)) {
                    tip.showTip('err', "邮箱格式不正确！", 2000);
                    obj.find('#account-email').focus();
                    return;
                }
            }


            if (data.password.length < 5 || data.password.length > 16) {
                tip.showTip('err', "密码长度为6-16位", 2000);
                return;
            }

            base.requestApi('/home/api/account/login', data, function (res) {
                if (res.result == 1) {
                    setTimeout(function () {
                        window.location.reload();
                    }, 1500);
                    tip.showTip("ok", '恭喜您，登陆成功！', 2000);
                }
            });

            e.stopImmediatePropagation();
        });

        // 跳转到找回密码
        $(document).on('click', '#goForgotBtn', function (e) {
            var phone = $(this).attr('data-phone');

            if (!phone) {
                tip.showTip('');
            }

            var go = $(this).attr('data-go');

            window.location.href = '/user/forgot?p=' + $.base64.encode(phone) + '&go=' + go;

            e.stopImmediatePropagation();
        });
    };


    exports.user_reg = function (url) {

        exports.send_code('register');

        exports.check_phone_exists(function () {
            $('#sendCodeBtn').removeClass('btn-disabled');
            $('.regForm .regBtn').removeAttr('data-disabled');
            tip.showTip('ok', "恭喜您,该手机可以注册", 4000);
        }, function () {
            tip.showTip('err', "该手机已经注册，您可以直接登录", 4000);
            $('.regForm .regBtn').attr('data-disabled', true);
            $('#sendCodeBtn').addClass('btn-disabled');
        });

        exports.check_email_exists(function () {
            $('.regForm .emailRegBtn').removeAttr('data-disabled');
            tip.showTip('ok', "恭喜您,该邮箱可以注册", 4000);
        }, function () {
            tip.showTip('err', "该邮箱已经注册，您可以直接登录", 4000);
            $('.regForm .emailRegBtn').attr('data-disabled', true);
        });

        // 手机注册
        $('.regForm .regBtn').on('click', function (e) {
            var isDisabled = $(this).attr('data-disabled');
            if (isDisabled && isDisabled == 'true') {
                tip.showTip("err", "该手机已经注册,请直接登录！", 1000);
                $('.regForm .phone').focus();
                return false;
            }

            var data = $('.regForm').serializeObject();

            if (!checkField('.regForm .name', '请输入姓名', /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[A-Za-z]){1}([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[A-Za-z0-9]){1,19}$/)) {
                return false;
            }

            if (!checkField('.regForm .phone', '请输入手机号')) {
                return false;
            }

            if (!checkField('.regForm .password', '请输入密码', /[A-Za-z0-9-_!@#$%^&*.,]{6,16}$/)) {
                return false;
            }

            base.requestApi('/home/api/account/reg', data, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '恭喜您,注册成功!', 5000);
                    setTimeout(function () {
                        window.location.href = "/user/guide";
                    }, 2000);
                }
            });

            e.stopImmediatePropagation();
        });

        // 邮箱注册
        $('.regForm').on('click', '.emailRegBtn', function (e) {
            var isDisabled = $(this).attr('data-disabled');
            if (isDisabled && isDisabled == 'true') {
                tip.showTip("err", "该邮箱已经注册, 请直接登录！", 1000);
                $('.regForm .email').focus();
                return false;
            }

            var data = $('.regForm').serializeObject();

            if (!checkField('.regForm .name', '请输入姓名', /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[A-Za-z]){1}([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[A-Za-z0-9]){1,19}$/)) {
                return false;
            }

            if (!checkField('.regForm .email', '请输入邮箱')) {
                return false;
            }

            if (!checkField('.regForm .password', '请输入密码', /[A-Za-z0-9-_!@#$%^&*.,]{6,16}$/)) {
                return false;
            }

            base.requestApi('/home/api/account/reg', data, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '恭喜您,注册成功!', 5000);
                    setTimeout(function () {
                        window.location.href = "/user/guide";
                    }, 2000);
                }
            });

            e.stopImmediatePropagation();
        });
    };

    exports.send_code = function (type, obj) {
        $('#sendCodeBtn').on('click', function (e) {
            var phone = obj.find(".phone").val();
            if (!/^1[\d]{10}$/.test(phone)) {
                obj.find('.phone').focus();
                tip.showTip('err', '请输入正确的手机号码', 3000);
                return false;
            }

            if ($(this).hasClass('btn-disabled')) {
                tip.showTip('err', ' 一分钟只能发送一次,请等待', 3000);
                return;
            }

            var check_unique = $(this).attr('data-checkUnique');
            var disabled = $(this).attr('disabled');
            if (disabled && disabled == 'true') {
                return false;
            }

            if (!(type && type !== 'null')) {
                type = '';
            }

            base.requestApi('/home/api/account/sendPhoneVerifyCode', {
                phone: phone,
                check_unique: check_unique,
                type: type
            }, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '短信验证码已经发送！', 3000);
                    codeTimer('sendCodeBtn', 60);
                } else {
                    console.log(res);
                }
            }, true);

            e.stopImmediatePropagation();
        });
    };
    exports.send_mail = function (type, obj) {
        $('#sendMailBtn').on('click', function (e) {
            var email = obj.find(".email").val();
            if (!/(\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*)/.test(email)) {
                obj.find('.email').focus();
                tip.showTip('err', '请输入正确的邮箱', 3000);
                return false;
            }

            if ($(this).hasClass('btn-disabled')) {
                tip.showTip('err', ' 一分钟只能发送一次,请等待', 3000);
                return;
            }

            var check_unique = $(this).attr('data-checkUnique');
            var disabled = $(this).attr('disabled');
            if (disabled && disabled == 'true') {
                return false;
            }

            if (!(type && type !== 'null')) {
                type = '';
            }

            base.requestApi('/home/api/account/sendEmailVerifyCode', {
                email: email,
                check_unique: check_unique,
                type: type
            }, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '邮箱验证码已经发送,请注意查收！', 3000);
                    codeTimer('sendCodeBtn', 60);
                } else {
                    console.log(res);
                }
            }, true);

            e.stopImmediatePropagation();
        });
    };

    exports.check_phone_exists = function (okCall, failCall) {
        $('.regForm .phone').on('change', function () {
            var state_code = $(".state-code").val();
            if (!checkField(".regForm .phone", '手机号码格式不正确', /^(1[\d]{10})$/)) {
                return false;
            }
            var phone = $('.phone').val();
            base.requestApi('/home/api/account/checkPhone', {phone: phone, state_code: state_code}, function (res) {
                if (res.result == 1) {
                    if (res.data == 1000) {
                        okCall();
                    } else {
                        failCall();
                    }
                }
            }, true);
        });
    };

    exports.check_email_exists = function (okCall, failCall) {
        $('.regForm').on('change', '.email', function () {
            if (!checkField(".regForm .email", '邮箱格式不正确', /^([a-zA-Z0-9_%+-])+@([a-zA-Z0-9_-])+([.][A-Za-z]{2,4})+$/)) {
                return false;
            }
            var email = $(this).val();
            base.requestApi('/home/api/account/checkEmail', {email: email}, function (res) {
                if (res.result == 1) {
                    if (res.data == 1000) {
                        okCall();
                    } else {
                        failCall();
                    }
                }
            }, true);
        });
    };

});