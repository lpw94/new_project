/**
 * Created by hh on 2015/10/27.
 */
define(function(require,exports) {
    exports.help = function () {

        $(".help-guide ul li").on('click',function(){
            $(this).addClass("active").siblings().removeClass("active");
            var i=$(".help-guide ul li").index(this);
            $(".help-detail > .help-content").eq(i).stop(false,true).show().siblings().stop(false,true).hide();
        })

    }
})