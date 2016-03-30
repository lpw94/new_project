define(function(require,exports){
	require('../../js/jquery.nav.js');
	//require('../../js/jquery.waypoints.js');// 过度渐现插件引入
	//require('../../js/odometer.min.js');     //数字滚动效果引入
	
	exports.run = function(){
//		$('.fadeInUp').waypoint({
//			  	handler:function(){
//			  		$(this.element).addClass('show')  // 注意 $(this.element)
//			  	},
//			  	offset: "80%"
//			  });
        
        //页面导航引用
         $(".sticky-nav").smartFloat();
         $('#nav_bar').onePageNav();
        
        /*
        setTimeout(function() {
					$('.odometer').html(3600);
				}, 200);
				var _startNum = 3600;
				var _odometer = window.setInterval(function() {
				_startNum++;
				if (_startNum > 10000) {
					_startNum = 3600;
				}
				
				$('.odometer').html(_startNum);
				}, 2500);
				*/
	};
});
   
   
  
