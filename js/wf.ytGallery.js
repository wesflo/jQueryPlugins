(function ($) {
	'use strict';

	var WF_YtGallery = function (el, ops) {
		var opt,
			that = this,
			def = {
				user: '',
				wrapper: 'ul',
				wrapperClass: 'row ytTeasers',
				teaser: '<li class="col-sm-12 col-md-6"><a href="$$url$$&showinfo=1&color=white" class="statementsTeaser"><figure>$$image$$<figcaption><h2>$$title$$</h2><p>$$description$$</p><span>$$date$$</span></figcaption></figure></a></li>',
				masonry: true,
				fancybox: true,
				month: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
			},
			wrap,
			vids = [];

		that.init = function () {
			opt = setup(def, ops);
			getYTData();
			wrap = document.createElement(opt.wrapper);
			wrap.className = opt.wrapperClass;
			wrap.innerHTML = '';
			el.appendChild(wrap);
		};

		var setup = function (def, ops) {
			return $.extend({}, def, ops);
		};

		var getYTData = function () {
			var url = 'http://gdata.youtube.com/feeds/api/users/' + opt.user + '/uploads?alt=json-in-script&orderby=published&format=5&callback=?';
			wf.getJSONP(url, function (data) {
				var entry = data.feed.entry,
					l = entry.length;
				for (var i = 0; i < l; i++) {
					var info = entry[i],
						vid = {
							id: info.id.$t.match('[^/]*$')[0],
							title: info.title.$t,
							date: new Date(info.published.$t),
							description: info.media$group.media$description.$t,
							thumb: info.media$group.media$thumbnail[0].url
						};

					vids.push(vid);
				}
				buildTeaser(info);
			});
		};

		var buildTeaser = function(){
			var l = vids.length;
			for (var i = 0; i < l; i++) {
				var vid = vids[i],
					teaser = opt.teaser,
					image = '<img src="' + vid.thumb + '" alt="' + vid.title + '" />',
					url = 'https://www.youtube.com/watch?v=' + vid.id;

				teaser = teaser.replace('$$title$$', vid.title)
					.replace('$$description$$', vid.description)
					.replace('$$date$$', vid.date.getDate() +' '+ opt.month[vid.date.getMonth()] +' '+ vid.date.getFullYear())
					.replace('$$url$$', url)
					.replace('$$image$$', image);
				wrap.innerHTML += teaser;

				if(opt.fancybox)
					wrap.childNodes[i].firstChild.className += ' fancybox-media';
			}

			if(opt.masonry)
				initMasonry();

			if(opt.fancybox){
				$('.fancybox-media').fancybox({
					openEffect  : 'none',
					closeEffect : 'none',
					helpers : {
						media : {}
					}
				});
			}

		};

		var initMasonry = function(){
			that.masonry = new Masonry(wrap, {
				itemSelector: 'li'
			});
		};

		that.init();
	};

	$.fn.wf_ytGallery = function (options) {
		return this.each(function () {
			var element = $(this);
			if (element.data('wf_ytGallery'))
				return;
			var wf_ytGallery = new WF_YtGallery(this, options);
			element.data('wf_yt', wf_ytGallery);
		});
	};
})(jQuery);
