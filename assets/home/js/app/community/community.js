/**
 * Created by hh on 2015/9/25. 社区所有页面js
 */
define(function(require,exports){
    exports.model = function(){

        //公司详情模块、创客详情模块下拉框
        $(".com-right").find(".more").hover(function(i){
            $(this).siblings(".more-down").show();
        },function(){
            $(this).siblings(".more-down").hide();
        });
        $(".com-right").find(".more-down").hover(function(i){
            $(this).show();
            $(this).siblings(".more").addClass("on");
        },function(){
            $(this).hide();
            $(this).siblings(".more").removeClass("on");
        });

        //创客详情点击关注
        $(".company-msg .watch").on('click',function(){
            if($(this).hasClass("active")){
                $(this).removeClass("active")
            }else{
                $(this).addClass("active")
            }
        });
        //公司详情点击收藏
        $(".company-msg .collect").on('click',function(){
            if($(this).hasClass("active")){
                $(this).removeClass("active")
            }else{
                $(this).addClass("active")
            }
        });

        //活动列表弹框、创建圈子弹框
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
        });

        //活动详情点击收藏
        $(".details .date i").on('click',function(){
            if($(this).hasClass("active")){
                $(this).removeClass("active")
            }else{
                $(this).addClass("active")
            }
        });


        //返回顶部
        $(window).scroll(function(){
            //获取窗口已滚动的高度
            var windowScrollTop=$(window).scrollTop();
            var oTools=$("#gotop");
            //如果大约240PX，就渐显出“回到顶部”，否则即隐藏
            if(windowScrollTop>240)
            {
                oTools.fadeIn();
            }else{
                oTools.fadeOut();
            }
        });
        $("#gotop").click(function(){
            //点击“回到顶部”，滚动到顶部，并带动画效果
            $("html,body").animate({scrollTop:0},500);
        });


        //头部固定栏
//        $.fn.smartFloat = function() {
//            var position = function(element) {
//                var top = $(element).offset().top,
//                    pos = element.css("position");
//                $(window).scroll(function() {
//                    var scrolls = $(this).scrollTop();
//                    //alert(top)
//                    if (scrolls > top) {
//                        //如果滚动到页面超出了当前元素element的相对页面顶部的高度
//                        if (window.XMLHttpRequest) {
//                            //如果不是ie6
//                            element.css({
//                                position: "fixed",
//                                top: 0
//                            });
//                        } else {
//                            //如果是ie6
//                            element.css({
//                                top: scrolls
//                            });
//                        }
//                    } else {
//                        element.css({
//                            position: pos,
//                            top: top
//                        });
//                    }
//                });
//            };
//            return $(this).each(function() {
//                position($(this));
//            });
//        };
//        $(".mDirectoryMenu").smartFloat();
    }
})