/*
 * 页面导航插件
 * jQuery One Page Nav Plugin
 * http://github.com/davist11/jQuery-One-Page-Nav
 *
 * Copyright (c) 2010 Trevor Davis (http://trevordavis.net)
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://jquery.org/license
 *
 * @version 3.0.0
 *
 * Example usage:
 * $('#nav').onePageNav({
 *   currentClass: 'current',
 *   changeHash: false,
 *   scrollSpeed: 750
 * });
 */
$.fn.smartFloat = function() {
	var position = function(element) {
		var top = $("#content").offset().top,
			pos = element.css("position");
//			logo = $(".sticky-nav .logo"),
//			cta = $(".sticky-nav .cta")
		$(window).scroll(function() {
			var scrolls = $(this).scrollTop();
			if (scrolls > top) {
				//如果滚动到页面超出了当前元素element的相对页面顶部的高度
				if (window.XMLHttpRequest) { 
					//如果不是ie6
					element.css({
						position: "fixed",
						top: 0,
                        left:0,
						borderBottom: "1px solid #eee"
					});
					//logo.css({opacity: "1"});cta.css({opacity: "1"});
				} else { 
					//如果是ie6
					element.css({
						top: scrolls
					});
				}
			} else {
				element.css({
					position: pos,
					borderBottom: "none"
				});
				//logo.css({opacity: "0"});cta.css({opacity: "0"});
			}
		});
	};
	return $(this).each(function() {
		position($(this));
	});
};
(function($, window, document, undefined) {
	//插件构造函数
	var OnePageNav = function(elem, options) {
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		this.metadata = this.$elem.data('plugin-options');
		this.$win = $(window);
		this.sections = {};
		this.didScroll = false;
		this.$doc = $(document);
		this.docHeight = this.$doc.height();
	};
	// 插件的原型
	OnePageNav.prototype = {
		defaults: {
			navItems: 'a',
			currentClass: 'current',
			changeHash: false,
			easing: 'swing',
			filter: '',
			scrollSpeed: 750,
			scrollThreshold: 0.5,
			begin: false,
			end: false,
			scrollChange: false
		},
		init: function() {
			// 初始化,可以扩展
			// 在范围内或使用文字对象。
			this.config = $.extend({}, this.defaults, this.options, this.metadata);
			this.$nav = this.$elem.find(this.config.navItems);
			//过滤任何链接的导航
			if (this.config.filter !== '') {
				this.$nav = this.$nav.filter(this.config.filter);
			}
			//处理单击导航
			this.$nav.on('click.onePageNav', $.proxy(this.handleClick, this));
			//获得部分位置
			this.getPositions();
			//处理滚动变化
			this.bindInterval();
			//更新位置调整
			this.$win.on('resize.onePageNav', $.proxy(this.getPositions, this));

			return this;
		},

		adjustNav: function(self, $parent) {
			self.$elem.find('.' + self.config.currentClass).removeClass(self.config.currentClass);
			$parent.addClass(self.config.currentClass);
		},

		bindInterval: function() {
			var self = this;
			var docHeight;

			self.$win.on('scroll.onePageNav', function() {
				self.didScroll = true;
			});

			self.t = setInterval(function() {
				docHeight = self.$doc.height();

				//如果是滚动
				if (self.didScroll) {
					self.didScroll = false;
					self.scrollChange();
				}

				//如果文档高度变化
				if (docHeight !== self.docHeight) {
					self.docHeight = docHeight;
					self.getPositions();
				}
			}, 250);
		},

		getHash: function($link) {
			return $link.attr('href').split('#')[1];
		},

		getPositions: function() {
			var self = this;
			var linkHref;
			var topPos;
			var $target;

			self.$nav.each(function() {
				linkHref = self.getHash($(this));
				$target = $('#' + linkHref);

				if ($target.length) {
					topPos = $target.offset().top;
					self.sections[linkHref] = Math.round(topPos);
				}
			});
		},

		getSection: function(windowPos) {
			var returnValue = null;
			var windowHeight = Math.round(this.$win.height() * this.config.scrollThreshold);

			for (var section in this.sections) {
				if ((this.sections[section] - windowHeight) < windowPos) {
					returnValue = section;
				}
			}

			return returnValue;
		},

		handleClick: function(e) {
			var self = this;
			var $link = $(e.currentTarget);
			var $parent = $link.parent();
			var newLoc = '#' + self.getHash($link);

			if (!$parent.hasClass(self.config.currentClass)) {
				//开始回调
				if (self.config.begin) {
					self.config.begin();
				}

				//改变突出显示的导航项
				self.adjustNav(self, $parent);

				//删除就是滚动
				self.unbindInterval();

				//滚动到当前的位置
				self.scrollTo(newLoc, function() {
					//Do we need to change the hash?
					if (self.config.changeHash) {
						window.location.hash = newLoc;
					}

					//添加滚动回到适合位置
					self.bindInterval();

					//结束回调
					if (self.config.end) {
						self.config.end();
					}
				});
			}

			e.preventDefault();
		},

		scrollChange: function() {
			var windowTop = this.$win.scrollTop();
			var position = this.getSection(windowTop);
			var $parent;

			//判断设置的位置
			if (position !== null) {
				$parent = this.$elem.find('a[href$="#' + position + '"]').parent();

				//如果不是已经当前部分
				if (!$parent.hasClass(this.config.currentClass)) {
					//改变突出显示的导航项
					this.adjustNav(this, $parent);

					//如果有一个scrollChange回调
					if (this.config.scrollChange) {
						this.config.scrollChange($parent);
					}
				}
			}
		},

		scrollTo: function(target, callback) {
			var offset = $(target).offset().top;

			$('html, body').animate({
				scrollTop: offset
			}, this.config.scrollSpeed, this.config.easing, callback);
		},

		unbindInterval: function() {
			clearInterval(this.t);
			this.$win.unbind('scroll.onePageNav');
		}
	};

	OnePageNav.defaults = OnePageNav.prototype.defaults;

	$.fn.onePageNav = function(options) {
		return this.each(function() {
			new OnePageNav(this, options).init();
		});
	};

})(jQuery, window, document);