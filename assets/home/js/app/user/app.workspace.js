define(function (require,exports){
	require('../../tools/datepicker.js');
	//require('../../tools/jquery.ui.datepicker-zh-CN.js');
	exports.work = function(){
		$( "#datepicker").datepicker({
			inline: true,
			altField: ".time-msg",
			altFormat: "DD, d MM, yy"
		});
	//左边点击查看
		$(".show").on('click',function(){
			var item =$(this).siblings(".mleft-item");
			if(item.is(":hidden")){
				item.show()
				$(this).text("隐藏")
			}else{
				item.hide()
				$(this).text("查看")
			}
		})

		//右边点击预订
		$(".book-work-btn").on('click',function(){
			$(".workspace-book").show();
			$(".bar").show();
		})
		$(".close").on('click',function(){
			$(".workspace-book").hide();
			$(".bar").hide();
		})
		$(".cancel").on('click',function(){
			$(".workspace-book").hide();
			$(".bar").hide();
		})
		$(".bar").on('click',function(){
			$(".workspace-book").hide();
			$(".bar").hide();
		})

	}
})