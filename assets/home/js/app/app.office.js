/**
 * Created by hh on 2015/9/15.
 */
define(function(require,exports){
    require('../../js/jquery/jquery.SuperSlide.2.1.1.js');//轮播
    exports.office = function(){
        jQuery(".slideBox").eq(0).slide({mainCell:".bd ul",effect:"left",autoPlay:true,trigger:"click"});

 /*       //滚动式头部的变化
        $(window).scroll(function(){
            var _doc=$(document);

            if (_doc.scrollTop() >= 500) {
                $(".header").css("position","fixed");
            } else {
                $(".header").css("position","relative");
            }
        })
*/
    }
})