(function ($) {
	'use strict';

	var WF_YtStage = function (el, ops) {
		var opt,
			that = this,
			$el = $(el),
			def = {
				ytStage: '<div class="ytStage" id="ytStage" />',
				ytNav: '<ul class="ytNav" id="ytNav" />',
				thumWidth: '183px'
			},
			actVid,
			stage, ytPlayer,
			length, count = 1,
			watch = false,
			percent_tmp = 0,
			videoObj = new Object();

		that.init = function () {
			opt = setup(def, ops);
			setVideoObj();
		};

		var setup = function (def, ops) {
			return $.extend({}, def, ops);
		};

		var setVideoObj = function(){
			var vids = $el.find('div');
			length = vids.length;

			$.each(vids, function(k, v){
				var vidID = $(v).attr('data-vid'),
					url = $(v).attr('data-url');
				videoObj[url] = new Object();
				setVideoInformation(vidID, url);
			});
		};

		var initStartVid = function() {
			actVid = window.location.hash.replace('#', '') || getFirstKey();
			buildStage();
			buildNavigation();
		};

		var setVideoInformation = function(vidID, url){
			var jsonUrl = '//gdata.youtube.com/feeds/api/videos/' + vidID+'?v=2&alt=json';

			$.ajax({
				url: jsonUrl,
				cache: false,
				dataType: 'json',
				success: function(data){
					videoObj[url] = {
						vidID: vidID,
						title: data.entry.title.$t,
						image: data.entry.media$group.media$thumbnail[1].url,
						url: url,
						time: 0
					};
					if(length === count){
						debug = videoObj;
						initStartVid();
					}
					count++;
				}
			}).fail(function(xhr, error, status){
				// console.log('error '+ error+': '+ status);
			}).done(function(){
				// console.log('done');
			}).always(function(){
				// console.log('allw');
			});
		};

		var onPlayerStateChange = function(event){
			switch(event.data) {
				case 0:
					pushTracking('ended', false);
					stopWatcher();
					break;
				case 1:
					pushTracking('play', false);
					startWatcher();
					break;
				case 2:
					pushTracking('pause', false);
					stopWatcher();
					break;
			}
		};

		var startWatcher = function(){
			watch = true;
			watcher();
		};
		var stopWatcher = function(){
			watch = false;
		};

		var watcher = function() {
			if(watch){
				var qDuration = Math.round((ytPlayer.getCurrentTime() * 100) / ytPlayer.getDuration()),
					percent = Math.floor(qDuration / 10) * 10;
				if (percent_tmp !== percent && percent !== 0 && isFinite(percent)) {
					pushTracking('watched', percent);
					percent_tmp = percent;
				}
				setTimeout(watcher, 1000);
			}
		};

		var pushTracking = function(state, percent){
			var sufix = (percent) ? ' - ' + percent + '%' : '',
				arr = ['_trackEvent', 'Videos', state, videoObj[actVid].title + sufix];
			_gaq.push(arr);
		};

		var buildNavigation = function(){
			var nav = $(opt.ytNav);
			$.each(videoObj, function(k, v){
				var list = $('<li />'),
					css = (v.url === actVid) ? ' class="active"' : '',
					link = $('<a href="javascript:void(0)" data-vid="' + k + '"' + css + ' />'),
					inner = '' +
						'<img src="' + v.image + '" alt="' + v.title + '" width="' + opt.thumWidth + '" />' +
						'<span class="shadow"></span>' +
						'<span>' + v.title + '</span>';
				link
					.html(inner)
					.bind('click', function(e){
						e.preventDefault()
						changeActVid(link);
					});
				list.html(link);
				nav.append(list);
			});
			$el.append(nav);
		};

		var changeActVid = function(link){
			var t = ytPlayer.getCurrentTime();
			videoObj[actVid].time = t;
			actVid = link.attr('data-vid');
			changeVideo();
		};

		var buildStage = function(){
			stage = $(opt.ytStage);
			$el.append(stage);
			stage.html(getIframe());

				ytPlayer = new YT.Player('ytPlayerFrame', {
					events: {
						onStateChange: onPlayerStateChange
					}
				});
		};

		var changeVideo = function(){
			$el.find('a').removeClass('active');
			$el.find('a[data-vid="' + actVid + '"]').addClass('active');
			ytPlayer.loadVideoById( videoObj[actVid].vidID, videoObj[actVid].time );
		};

		var getFirstKey = function() {
			for(var key in videoObj)	break;
			return key;
		};

		var getIframe = function() {
			return $('<iframe width="580" height="435" src="//www.youtube.com/embed/' + videoObj[actVid].vidID + '?wmode=transparent&autoplay=1&version=3&enablejsapi=1" frameborder="0" allowfullscreen id="ytPlayerFrame"></iframe>');
		};

		that.init();
	};

	$.fn.wf_ytStage = function (options) {
		var ytStage = this.each(function () {
			var element = $(this);
			if (element.data('wf_ytStage')) {
				return;
			}
			var wf_ytStage = new WF_YtStage(this, options);
			element.data('wf_ytStage', wf_ytStage);
		});
		return ytStage;
	};
})(jQuery);


var debug;