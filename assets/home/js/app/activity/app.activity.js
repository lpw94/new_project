define(function (require, exports) {
    var base = require("/assets/home/js/app.base.js");
    var upload = require("app.upload.js");
    require('jquery/cxcalendar/jquery.cxCalendar.min.js');

    /**
     * 发布活动
     */
    exports.saveActivity = function () {
        var obj = $('.activityForm');

        upload.upload('.upCoverBtn', {
            'type': 'img',// 必传参数：img,file,media
        }, function (res) {
            setTimeout(function () {
                $('.up_file_list .queue-file').remove();
            }, 500);
            obj.find('.cover_img').attr('src', res.url);
            obj.find('.cover').val(res.url);
        });

        var dateFirst = $('.start_time');
        var dateFirstApi;

        dateFirst.cxCalendar(function (api) {
            dateFirstApi = api;
        });


        /*  dateFirst.bind('change', function () {
         var firstTime = parseInt(dateFirstApi.getDate('TIME'), 10);
         });*/
        obj.on('change', '.select-city', function (e) {
            var city_id = $(this).val();
            base.requestApi('/home/api/area/getDepartment', {city_id: city_id}, function (res) {
                if (res.result == 1) {
                    if (res.data.length == 0) {
                    } else {
                        var str = '<option value="0">请选择中心大厦</option>';
                        for (var i = 0; i < res.data.length; i++) {
                            var item = res.data[i];
                            str += '<option value="' + item.id + '">' + item.name + '</option>';
                        }
                        obj.find('.department_id').html(str);
                        obj.find('.field-department').fadeIn();
                    }
                }
            }, true);
            e.stopImmediatePropagation();
        }).on('click', '.saveBtn', function (e) {
            var data = obj.serializeObject();
            if (!$.trim(data.title)) {
                obj.find('.title').focus();
                tip.showTip('err', '请填写活动标题', 3000);
                return;
            }
            if (!data.cat_id || data.cat_id == 0) {
                obj.find('.cat_id').focus();
                tip.showTip('err', '请选择活动类别', 3000);
                return;
            }

            if (!data.city_id || data.city_id == 0) {
                obj.find('.select-city').focus();
                tip.showTip('err', '请选择活动所属城市', 3000);
                return;
            }

            if (!data.department_id || data.department_id == 0) {
                obj.find('.department_id').focus();
                tip.showTip('err', '请选择中心大厦', 3000);
                return;
            }

            if (!data.address) {
                obj.find('.address').focus();
                tip.showTip('err', '请填写活动详细地址', 3000);
                return;
            }

            if (!data.start_time) {
                obj.find('.start_time').focus();
                tip.showTip('err', '请选择活动开始日期', 3000);
                return;
            }
            if (!data.start_hour) {
                obj.find('.start_hour').focus();
                tip.showTip('err', '请选择活动开始时间', 3000);
                return;
            }
            if (!data.end_hour) {
                obj.find('.end_hour').focus();
                tip.showTip('err', '请选择活动结束时间', 3000);
                return;
            }

            data.end_time = data.start_time + " " + data.end_hour+"";
            data.start_time = data.start_time + " " + data.start_hour;
            if (!data.amount || isNaN(data.amount)) {
                obj.find('.amount').focus();
                tip.showTip('err', '请填写活动最多参与人数', 3000);
                return;
            }
            if (parseInt(data.amount) < 1) {
                obj.find('.amount').focus();
                tip.showTip('err', '活动参与人数不得小余1', 3000);
                return;
            }
            if (!$.trim(data.brief)) {
                obj.find('.txtContent').focus();
                tip.showTip('err', '请填写活动详情', 3000);
                return;
            }
            if (!$.trim(data.link_man)) {
                obj.find('.link_man').focus();
                tip.showTip('err', '请填写联系人', 3000);
                return;
            }
            if (!$.trim(data.mobile)) {
                obj.find('.mobile').focus();
                tip.showTip('err', '请填写联系电话', 3000);
                return;
            }

            data.city_name = obj.find('.select-city option:selected').html();

            base.requestApi('/home/api/activity/save', {data: data}, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '恭喜您,活动发布成功!', 10000);
                    setTimeout(function () {
                        window.location.href = res.data;
                    }, 1500);
                }
            }, true);
            e.stopImmediatePropagation();
        })
    };

    exports.applyActivity = function () {
        $(document).on('click', '.openApplyBtn', function (e) {
            base.showPop('#applyActivityPopup');
            e.stopImmediatePropagation();
        });

        var obj = $('.applyActivityForm');
        obj.on('click', '.applyBtn', function (e) {
            if (!checkLogin()) {
                return;
            }
            var data = obj.serializeObject();

            if (!$.trim(data.link_man)) {
                obj.find('.link_man').focus();
                tip.showTip('err', '请填写联系人', 3000);
                return;
            }
            if (!$.trim(data.mobile)) {
                obj.find('.mobile').focus();
                tip.showTip('err', '请填写联系电话', 3000);
                return;
            }

            if (!confirm('您确认正确并确认报名吗?')) {
                return;
            }

            base.requestApi('/home/api/activity/apply', data, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '恭喜您,活动发布成功!', 10000);
                    setTimeout(function () {
                        window.location.reload();
                    }, 1500);
                }
            }, true);

            e.stopImmediatePropagation();
        })
    }

});