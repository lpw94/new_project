/**
 <<<<<<< HEAD
 * Created by hh on 2015/10/21. 下拉选择js
 =======
 * Created by hh on 2015/10/21. ����ѡ��js
 >>>>>>> lpw
 */

define(function (require, exports) {
    exports.select = function () {



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
        });

        //弹框下拉筛选

        $(".select-single > .select-area").on('click', function () {
            if ($(this).hasClass("on")) {
                $(this).next('ul').stop(true, false).hide();
                $(this).removeClass("on")
            } else {
                $(this).next('ul').stop(true, false).slideDown();
                $(this).addClass("on")
            }

        });
        $(".select-single > ul").find("li").on('click', function () {
            var txt = $(this).text();
            //console.log(txt)
            $(this).parents().siblings(".select-area").html(txt).removeClass("on");
            $(this).parent("ul").hide();
        });
        //分类筛选(多选)
        $(document).ready(function (e) {
            //分类筛选
            $('.multi-more > .choiceCon').on('click', function () {
                $(this).next('ul').stop(true, false).slideToggle();
                var _input = $(this).next('ul').find('input[type=checkbox]');
                var _html = '';
                var data_ids = '0';
                _input.each(function () {
                    if ($(this).prop('checked')) {
                        if (_html)_html += '、';
                        _html = _html + $(this).next('label').html();
                        data_ids += ',' + $(this).val();
                    }
                });
                if (!_html)_html = '请点击选择';
                $(this).html(_html);
                $(this).attr('data-id', data_ids != '0' ? data_ids.substr(2) : 0);
            });
        });

        //单选  11-06
        $("#pick_city .options select").on("change",function(){
            var tval = this.value;
            var oPtion = $("#pick_city .options select").children("option");
            var odiv = $("#pick_box .mfilters");
            //alert(oPtion.length);
            for(var i=0; i<oPtion.length;i++ ){
                // alert(opt.length);
                odiv[i].style.display = "none";
            };
            odiv[tval].style.display = "block";
        });
    }
});

