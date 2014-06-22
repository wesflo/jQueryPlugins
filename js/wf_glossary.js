(function ($) {
	'use strict';

	var WF_Glossary = function (element, ops) {
		var opt, terms, json,
			that = this,
			$wrap = $(element),
			$popoverContent = $('<div id="popoverContent" />'),
			def = {
				jsonUrl: '',
				parseClass: 'glossaryterm',
				customClass: 'popover-trigger',
				glossaryURL: '',
				activeLinkClass: 'active',
				dissableClass: 'noHighlight',
				ttTemplate: '<a data-toggle="popover" data-placement="top" />'
			};

		that.init = function () {
			opt = setup(def, ops);
			$('body').append($popoverContent);
			terms = $wrap.find('p:not(.' + opt.dissableClass + ', .introtext)');
			getGlossaryJson();
		};

		var getGlossaryJson = function () {
			$.getJSON(opt.jsonUrl, function (data) {
				json = data;
				buildTooltips();
			});
		};

		var buildTooltips = function () {
			$.each(terms, function (j, el) {
				var $el = $(el),
					txt = $el.html();

				$.each(json[0], function (key, mapping) {
					var $newEl = $(opt.ttTemplate)
							.addClass(opt.parseClass + ' ' + opt.customClass)
							.attr({
								'href': opt.glossaryURL + '#accordion-' + key,
								'data-id': key
							}),
						pattern = mapping.replace(/\(/g, '\\(').replace(/\)/g, '\\)'),
						patternArray = pattern.split('|');
					for (var i = 0; i < patternArray.length; i++) {
						var regEx = new RegExp('\\b' + patternArray[i] + '\\b(?!<\/)', 'g');
						$newEl.text(patternArray[i].replace(/\\/g, ''));
						txt = txt.replace(regEx, String($newEl[0].outerHTML));
					}
				});
				$el.html(txt);
			});
			initTooltips();
		};

		var initTooltips = function () {
			var popOverOpt = {
				trigger: 'manual',
				html: true,
				content: function() {
					return $popoverContent.html();
				}
			};
			$('a.' + opt.parseClass)
				.popover(popOverOpt)
				.on({
					'mouseenter': function () {
						var $link = $(this);
						if (!$link.hasClass(opt.activeLinkClass)) {
							$('a.' + opt.activeLinkClass + '.' + opt.parseClass).popover('hide');
							$popoverContent.html( json[1][$link.attr('data-id')] );
							$link
								.addClass(opt.activeLinkClass)
								.popover('show');
						}
					},
					'shown.bs.popover': function () {
						// Custom Scroll
						$('.popover-content').slimScroll({
							height: 'auto',
							distance: '5px',
							size: '10px',
							wheelStep: 1,
							alwaysVisible: true,
							railVisible: true
						});
					}
				});

			$(document).on('click', function () {
				$('a.' + opt.parseClass)
					.removeClass(opt.activeLinkClass)
					.popover('hide');
			});
		};


		var setup = function (def, ops) {
			return $.extend({}, def, ops);
		};

		that.init();
	};

	$.fn.wf_glossary = function (options) {
		var glossary = this.each(function () {
			var element = $(this);

			if (element.data('wf_glossary')) {
				return;
			}

			var wf_glossary = new WF_Glossary(this, options);

			element.data('wf_glossary', wf_glossary);
		});
		return glossary;
	};
})(jQuery);
