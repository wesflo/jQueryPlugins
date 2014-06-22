(function($){
	'use strict';

	var WF_Swipe = function(el, ops, events) {
		var opt, evn, sensArea, itemsArea, skipPrev, skipNext, navWrapper,
			that = this,
			wrap = $(el),
			def = {
				sensArea: '.sens-area',
				itemsArea: 'ul.items',
				items: 'li',
				skipPrev: '.skip.prev',
				skipNext: '.skip.next',
				labelOutput: '.label-type',
				navWrapper: 'ul.nav',
				navPoint: '<li></li>',
				navPointActiveClass: 'active',
				onlyInactiveNavPoint: true,
				shownItems: 4,
				startPosition: 0,
				duration: 800,
				easing: 'easeOutCubic'
			},
			defEvents = {
				onSwipe: function(){}
			},
			index = 0,
			itemCount, itemWidth;

		that.init = function() {
			opt = setup(def, ops);
			evn = setup(defEvents, events);
			sensArea = wrap.find(opt.sensArea);
			itemsArea = wrap.find(opt.itemsArea);
			skipPrev = wrap.find(opt.skipPrev);
			skipNext = wrap.find(opt.skipNext);
			navWrapper = wrap.find(opt.navWrapper);
			index = opt.startPosition;
			itemWidth = itemsArea.children(opt.items+':first-child').width();

			that.setDefaults();

			goToStartPosition();
			setListener();
		};

		var setup = function(def, ops) {
			return $.extend({}, def, ops);
		};

		var setListener = function() {
			skipPrev.bind('click', function(){ that.prev(); });
			skipNext.bind('click', function(){ that.next(); });
			navWrapper.children().bind('click', function(){
				var btn = $(this);
				if(opt.onlyInactiveNavPoint === true && !btn.hasClass(opt.navPointActiveClass)){
					that.goToItem( parseInt(btn.attr('data-count')), true);
				}
			});
		};

		that.getActElement = function(i){
			var a = itemsArea.find('li[index="'+i+'"]');
			return a;
		};

		var goToStartPosition = function() {
			that.goToItem(index, false);
		};

		var getNewCenter = function(i){
			var c = Math.round(itemWidth - (i*itemWidth) - (itemWidth));
			return c;
		};

		var checkButtonState = function(){
			//preview
			if(index === 0) {
				skipPrev.hide();
			} else {
				skipPrev.show();
			}
			//next
			if(index === (itemCount - opt.shownItems)) {
				skipNext.hide();
			} else {
				skipNext.show();
			}
			$.each(navWrapper.children(), function(i, el){
				var $el = $(el);
				if(i >= index && i < (index + opt.shownItems) ) {
					$el.addClass(opt.navPointActiveClass)
				} else {
					$el.removeClass(opt.navPointActiveClass)
				}
			})

		};

		that.setIndex = function(val) {
			index = parseInt(val, 10);
		};

		that.setDefaults = function() {
			var items = itemsArea.find(opt.items),
				max = items.length - 1;
			itemCount = 0;

			items.each(function(i, el){
				$(el).attr('index', itemCount);
				if(typeof(opt.navWrapper) !== 'undefined'){
					var count = itemCount - (opt.shownItems - 1);

					if(itemCount > (max - (opt.shownItems - 1))){
						count = itemCount - (opt.shownItems - 1)
					}
					if(count < 0) {
						count += (opt.shownItems-1);
					}

					var point = $(opt.navPoint).attr('data-count', count);
					navWrapper.append( point )
				}
				itemCount++;
			});
			var swipeNavWidth = navWrapper.width();
			navWrapper.css({
				'width': swipeNavWidth,
				'margin-left': -swipeNavWidth/2
			});
		};

		that.goToItem = function(i, animate){
			if(i < 0 ){
				index = 0;
			} else if(i >= (itemCount - opt.shownItems)) {
				index = itemCount - opt.shownItems
			} else {
				index = i;
			}
			var newX = getNewCenter(index);
			if(animate === true) {
				that.animateTo(newX);
			} else {
				itemsArea.css('left', newX);
			}
			checkButtonState();
		};

		that.animateTo = function(newX){
			itemsArea.stop().animate({
				left: newX
			},{
				duration: opt.duration,
				easing: opt.easing,
			});
		};

		that.next = function(){
			if(index < (itemCount-1)) {
				var i = index+1;
				that.goToItem(i, true);
			}
			evn.onSwipe();
		};

		that.prev = function(){
			if(index > 0) {
				var i = index-1;
				that.goToItem(i, true);
			}
			evn.onSwipe();
		};

		that.init();
	};

	$.fn.wf_swipe = function(options, events) {
		var swipe = this.each(function() {
			var element = $(this);

			if (element.data('wf_swipe')) {
				return;
			}

			var wf_swipe = new WF_Swipe(this, options, events);

			element.data('wf_swipe', wf_swipe);
		});
		return swipe;
	};
})(jQuery);