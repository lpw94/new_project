/**
 * Created by hh on 2015/9/14.
 */
define(function(require,exports){
    require('../../js/jquery/jquery.SuperSlide.2.1.1.js');
    exports.index = function(){

        //场地服务点击切换
        $(".icon-tab").find("li").on('click',function(){
            var _tabDom = $(this).parent('ul');
            var _conDom = $(".ground-detial[data-id="+_tabDom.attr('data-id')+"]");
            _tabDom.find('i').hide();
            $(this).addClass("active").siblings('li').removeClass("active");
            $(this).find("i").show();
            _conDom.find('.ground-item').eq($(this).index()).show().siblings('.ground-item').hide();

            var _slideDom = _conDom.find('.ground-item').eq($(this).index()).find('.slideBox').eq(0);
            _slideDom.slide({mainCell:".bd ul",effect:"left",autoPlay:true,trigger:"click"});
        });
        /*
        $(".icon-tab").find("li").each( function (index) {
            var _tabDom = $(this).parent('ul');
            var _conDom = $(".ground-detial[data-id="+_tabDom.attr('data-id')+"]");
            $(this).click(function(){
                _tabDom.find('i').hide();
                $(this).addClass("active").siblings('li').removeClass("active");
                $(this).find("i").show();
                _conDom.find('.ground-item').eq(index).show().siblings('.ground-item').hide();
                jQuery(".slideBox").eq(index).slide({mainCell:".bd ul",effect:"left",autoPlay:true,trigger:"click"});
            })
        });
        */
        //轮播
        $('.ground-detial').each(function(){
          $(this).find('.ground-item').eq(0).find('.slideBox').eq(0).slide({mainCell:".bd ul",effect:"left",autoPlay:true,trigger:"click"});
        });

        //最新活动悬浮效果
        $(".activity-list .activity-item").hover(function(){
            $(this).find("span").addClass("on");
        },function(){
            $(this).find("span").removeClass("on");
        })
    }
})