/**
 * Created by hh on 2015/9/16.
 */
define(function(require,exports){
    var checkValue = require('../app/app.verify').checkValue;
    exports.head = function(){
        //头部点击效果
        $(".head-right").find("li").hover(function(){
            $(this).find("a").addClass("on")
            $(this).find("i").addClass("up")
        },function(){
            $(this).find("a").removeClass("on")
            $(this).find("i").removeClass("up")
        })

        //滚动式头部的变化
        $(window).scroll(function(){
            var _doc=$(document);
            if($('.header').hasClass('fixed'))return false;

            if (_doc.scrollTop() >= 80) {
                $('.city-drop').hide();
/*
                $(".header,.city-drop").css("position","fixed");
*/
            } else {
/*
                $(".header").css("position","relative");
*/
                $('.city-drop').css('position','absolute');
            }
        })

        $(".nav").find(".city").on('click',function(){
            $(".city-drop").fadeToggle(500);
        });
        //已登录状态下拉框
        $(".user-more").hover(function(){
            $(".logined-drop").show();
        },function(){
            $(".logined-drop").hide();
        });
        $(".logined-drop").hover(function(){
            $(this).show();
        },function(){
            $(".logined-drop").hide();
        });


    };
});
