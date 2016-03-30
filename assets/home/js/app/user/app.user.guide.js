define(function (require, exports) {
    var base = require('app.base');
    require('jquery/cxcalendar/jquery.cxCalendar.min.js');

    /**
     * Created by yanue on 6/17/14.
     */
    exports.user_improve = function () {
        tagHandle();
        tagRandom();

        // 生日选择
        $('.guideForm .birthday').cxCalendar();
        // 城市
        $('.guideForm').on('change', '.select-province', function (e) {
            var id = $(this).val();
            base.requestApi('/home/api/area/getCities', {province_id: id}, function (res) {
                if (res.result == 1) {
                    console.log(res);
                    var str = '<option value="">请选择城市</option>';
                    for (var i = 0; i < res.data.length; i++) {
                        var item = res.data[i];
                        str += '<option value="' + item.id + '">' + item.name + '</option>';
                    }
                    $('.guideForm .select-city').html(str).fadeIn();
                }
            }, true);
            e.stopImmediatePropagation();
        }).on('change', '.select-city', function (e) {
            var city_id = $(this).val();
            base.requestApi('/home/api/area/getDepartment', {city_id: city_id}, function (res) {
                if (res.result == 1) {
                    if (res.data.length == 0) {
                        $('.field-department').fadeOut();
                    } else {
                        var str = '<option value="0">请选择中心</option>';
                        for (var i = 0; i < res.data.length; i++) {
                            var item = res.data[i];
                            str += '<option value="' + item.id + '">' + item.name + '</option>';
                        }
                        $('.guideForm .department_id').html(str);
                        $('.field-department').fadeIn();
                    }
                }
            }, true);
            e.stopImmediatePropagation();
        }).on('click', '.saveBtn', function (e) {
            var data = $('.guideForm').serializeObject();
            var step = $(this).attr('data-step');
            if (step == 1) {
                var city_name = $('.select-city option:selected').html();
                data.base_info.city_name = city_name == "请选择城市" ? "" : city_name;
                var department = $('.department_id option:selected').html();
                data.base_info.department = department == "请选择中心" ? "" : department;
                var province_name = $('.province_id option:selected').html();
                data.base_info.province_name = province_name == "请选择省份" ? "" : province_name;
            }
            if (step == 4) {
                if (data.demand.cid == 0) {
                    tip.showTip('err', '请选择需求分类', 3000);
                    $('.demand_cid').focus();
                    return;
                }
                if (data.demand.content == 0) {
                    tip.showTip('err', '请填写需求详情', 3000);
                    $('.demand_content').focus();
                    return;
                }
            }
            base.requestApi('/home/api/user/saveProfile', {
                base_info: JSON.stringify(data.base_info),
                interest: data.interest,
                service: data.service,
                demand: JSON.stringify(data.demand)
            }, function (res) {
                if (res.result == 1) {
                    tip.showTip('ok', '恭喜您,资料保存成功', 10000);
                    setTimeout(function () {
                        if (step == 4) {
                            window.location.href = '/user';
                        } else {
                            window.location.href = '?step=' + (1 + parseInt(step));
                        }
                    }, 1500);
                }
            });
            e.stopImmediatePropagation();
        });
    };
    /**
     * 处理随机
     */
    function tagRandom() {
        $('.tag-area').on('click', '.randomBtn', function (e) {
            var type = $(this).attr('data-type');
            var tags, str = '', item;
            if (type == 'service') {
                str += '<small>您可能感兴趣:</small>';
                tags = getArrayItems(services, 10);
            } else {
                str += '<small>您可能感兴趣:</small>';
                tags = getArrayItems(interests, 10);
            }
            for (var i = 0; i < tags.length; i++) {
                item = tags[i];
                str += '<span class="badge badge-outline item" data-type="' + type + '" data-name="' + item + '"  maxlength="16">' + item + '</span>';
            }
            str += '<a href="javascript:;" class="btn btn-radius randomBtn  btn-small btn-main"data-type="' + type + '">换一组</a>';
            $('.' + type + 's.tag-area .exists').html(str);
        });


        //从一个给定的数组arr中,随机返回num个不重复项
        function getArrayItems(arr, num) {
            //新建一个数组,将传入的数组复制过来,用于运算,而不要直接操作传入的数组;
            var temp_array = [];
            for (var idx in arr) {
                temp_array.push(arr[idx]);
            }

            //取出的数值项,保存在此数组
            var return_array = [];
            for (var i = 0; i < num; i++) {
                //判断如果数组还有可以取出的元素,以防下标越界
                if (temp_array.length > 0) {
                    //在数组中产生一个随机索引
                    var arrIndex = Math.floor(Math.random() * temp_array.length);
                    //将此随机索引的对应的数组元素值复制出来
                    return_array[i] = temp_array[arrIndex];
                    //然后删掉此索引的数组元素,这时候temp_array变为新的数组
                    temp_array.splice(arrIndex, 1);
                } else {
                    //数组中数据项取完后,退出循环,比如数组本来只有10项,但要求取出20项.
                    break;
                }
            }
            return return_array;
        }
    }

    /**
     * 处理添加删除功能
     */
    function tagHandle() {
        $('.tag-area').on('change', 'input.tag', function (e) {
            var type = $(this).attr('data-type');
            var val = $(this).val();
            addTag(type, val);

            e.stopImmediatePropagation();
        }).on('keydown', 'input.tag', function (e) {
            if (e.which == 13) {
                var type = $(this).attr('data-type');
                var val = $(this).val();
                addTag(type, val);
            }
            e.stopImmediatePropagation();
        }).on('click', '.item', function (e) {
            var done = $(this).hasClass('active');
            var type = $(this).attr('data-type');
            var name = $(this).attr('data-name');
            if (done) {
                $(this).removeClass('active');
                if (type == 'service') {
                    service_tags.splice($.inArray(name, service_tags), 1);
                    $('.services .item[data-name="' + name + '"]').removeClass('active');
                } else {
                    interest_tags.splice($.inArray(name, interest_tags), 1);
                    $('.interests .item[data-name="' + name + '"]').removeClass('active');
                }
            } else {
                if (addTag(type, name))
                    $(this).addClass('active');
            }

            getTags(type);

            e.stopImmediatePropagation();
        });

        function addTag(type, val) {
            if (!val || val.length < 2) return false;
            if (type == 'service') {
                if (service_tags.length == 10) {
                    tip.showTip('err', "最多可以填写10种服务", 2000);
                    return false;
                }
                service_tags.push(val);
            } else {
                if (interest_tags.length == 10) {
                    tip.showTip('err', "最多可以填写10种兴趣", 2000);
                    return false;
                }
                interest_tags.push(val);
            }

            getTags(type);
            return true;
        }

        function getTags(type) {
            var total_tags = [];

            if (type == 'service') {
                total_tags = $.unique(service_tags);
            } else {
                total_tags = $.unique(interest_tags);
            }

            var str = '';
            for (var i = 0; i < total_tags.length; i++) {
                var item = total_tags[i];
                str += '<span class="badge badge-outline active item" data-type="' + type + '" data-name="' + item + '"  maxlength="16">' + item + '</span>';
            }

            str += '<input type="text" class="tag" data-type="' + type + '" maxlength="16"  placeholder="请选择或输入">';

            $('.' + type + 's.tag-area .area').html(str);
            // 生成 input
            $('.' + type + 's.tag-area .' + type + 's_val').val(JSON.stringify(total_tags));
        }
    }

});