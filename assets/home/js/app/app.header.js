define(function(require,exports){
    exports.init = function(){
        //滚动式头部的变化
        $(".nav").find(".city").on('click',function(){
            $(".city-drop").toggle();
            $(".social-drop").hide();
            $(".all_reg").hide();
            $(".all_area").hide();
        })
        $(".nav").find(".social").on('click',function(){
            $(".social-drop").toggle();
            $(".city-drop").hide();
            $(".all_reg").hide();
            $(".all_area").hide();
        })
        
        $(".area").on('click',function(){
            $(".all_area").slideToggle();
            $(".all_reg").hide();
            if($(this).hasClass('bg_act')){
                $(this).removeClass("bg_act");
            }else{
                $(this).addClass("bg_act").siblings(".reg").removeClass("bg_act");
            }
        })
        $(".reg").on('click',function(){
            $(".all_reg").slideToggle();
            $(".all_area").hide();
            if($(this).hasClass('bg_act')){
                $(this).removeClass("bg_act");
            }else{
                $(this).addClass("bg_act").siblings(".area").removeClass("bg_act");
            }
        })                
        $(function(){
        $(".tab_li").click(function(){
		$(this).addClass("current");
		$(this).siblings().removeClass("current");
		var i=$(".tab_li").index(this);
		$(".content > .tab_content").eq(i).stop(false,true).fadeIn(150);
		$(".content > .tab_content").eq(i).siblings().stop(false,true).fadeOut(150);
	     });
        });
        
        $(".info_addr").click(function(){
           $(".map_addr").show();
        })
        $(".close").click(function(){
           $(".map_addr").hide();
        })
       //点赞
        $(".info_control .zan").on('click',function(){
            
           if($(this).hasClass("active")){
               $(this).removeClass("active");   //取消赞
           }
            else{
               $(this).addClass("active");    //点赞
           }
        })
        //举报
        $(".info_control .report").on('click',function(){            
           if($(this).hasClass("read")){
               return;   //已经举报
           }
            else{
            	$(this).text("√已举报");
               $(this).addClass("read");    //举报               
           }
        })
        
    }
})