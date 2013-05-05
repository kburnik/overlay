/*
	TopZIndex 1.1 (September 23, 2009) plugin for jQuery
	http://topzindex.googlecode.com/
	Copyright (c) 2009 Todd Northrop
	http://www.speednet.biz/
	Licensed under GPL 3, see  <http://www.gnu.org/licenses/>
*/
(function(a){a.topZIndex=function(b){return Math.max(0,Math.max.apply(null,a.map(a(b||"body *"),function(d){return parseInt(a(d).css("z-index"))||null})))};a.fn.topZIndex=function(b){if(this.length===0){return this}b=a.extend({increment:1,selector:"body *"},b);var d=a.topZIndex(b.selector),c=b.increment;return this.each(function(){a(this).css("z-index",d+=c)})}})(jQuery);

// overlay start:
// Kristijan Burnik (NC) June 2010
//

var OVERLAY = function (parent,options,data) {
		var options = options,data=data;
		var $parent = $(parent);
		
		if ($parent.length == 0) return null;

		
		if (typeof options == "string") {
			return $parent[0].overlayObject.runEvent(options,data);
		}
		
		/////////////////////////////////////////////////////////
		
		
		// setup defaults for overlay 
		var defaults = {
			opacity:0.5,
			surogateOpacity:0.5,
			curtainBackground:'black',
			animDuration:300,
			useCurtain:true,
			hideOnStart:true,
			triggerElement:false,
			triggerEvent:'click',
			trigger:"show",
			closeElement:false,
			closeEvent:'click',
			hideOnEsc:true,
			show:false,
			center:'viewport',
			surogateCenter:'viewport'
		}
		
		// overwrite defaults with chosen options
		if (typeof options == 'object') {
			if (!options) {
				options=defaults;
			} else {
				for (property in defaults) {
					if (options[property]==null) options[property]=defaults[property];
				}
			}
		} else {
			options = defaults;
		}
		// console.log(defaults,options);
		//var options = options;
		//

		// all DOM constructors
		var constructors = {
			curtain:function() {
				var $curtain = $('<div>').addClass("overlay-curtain").html("");
				this.$curtain = $curtain;
				var t  = this;
				$curtain.click(function() {
					t.$container.overlay("hide");
				}).hide();
				return $curtain;
			},
			surogate:function() {
				var $surogate = $('<div>');
				
				this.$surogate = $surogate;
				$surogate.html("");
				$surogate.removeClass().addClass("overlay-surogate").hide();
				$('body').prepend($surogate);
			}
		}
		
		
		// events for each overlay
		var events = {
			show:function(data) {
				 // to do: click out event for closing container
				
				var t = this;
				var ps = getPageSize();
				var w = ps[0];
				var h = ps[1];
		
				this.$curtain.css({
					width:w+'px',
					height:h+'px',
					left:0, // Math.round(w/2)+'px',
					top:0, // Math.round(h/2)+'px',
					opacity:0,
					position:'absolute',
					background:'transparent'				
				}).hide();
				
				
				
				if (this.options.useCurtain) {
					// console.log("curtain!",this.options.curtainBackground,this.options.opacity);
					this.$curtain
							.css({backgroundColor:this.options.curtainBackground,opacity:this.options.opacity}).topZIndex().show()

				}
				
				
				var dim = this.$container.fullDimensions();
				this.$surogate.css({
					width:dim.width,
					height:dim.height,
					position:'absolute',
					zIndex:this.$container.css("zIndex")-1,
					opacity:this.options.surogateOpacity
				}).center(t.options.surogateCenter).hide().fadeIn(this.options.animDuration/2,function() {
					// show container
					t.$container
					.hide()
					.fadeIn(t.options.animDuration/2)
					.removeClass("overlay-hidden");
				}).topZIndex();
				
				this.$container.center(t.options.center).hide().topZIndex();
				
						
				// hide overlay on ESC key
				if (this.options.hideOnEsc) {
					var escPress = function(e) {
						if (e.keyCode==27) {
							t.$container.overlay("hide");
							$(document).unbind("keydown",escPress);
						}
						
					}
					
					$(document).bind("keydown",escPress);
				}
				
				
			},
			hide:function() {	
				var t = this;
				
				this.$curtain.animate({
					opacity:0
				},this.options.animDuration,'',function() {
					$(this).hide();
				});
				
				t.$container.fadeOut(t.options.animDuration/2,function() {
					t.$container.addClass("overlay-hidden");
					t.$surogate.fadeOut(t.options.animDuration/2);
				});
			},
			toggle:function() {
				var t = this;
				if (t.$container.hasClass("overlay-hidden")) {
					t.$container.overlay("show");
				} else {
					t.$container.overlay("hide");
				}
			}
		}
		
		
		// the overlayObject object
		var t = {
			$container:$parent,
			$curtain:{},
			events:events,
			options:options,
			construct:function() {
				for (var x in constructors) {
					$('body').append(this.run(constructors[x]));
				}
				
				$('body').prepend(this.$container);
				
				this.$container.addClass("overlay-container");
				
				if (this.options.hideOnStart) {
					this.$container.hide().addClass("overlay-hidden");
				}
				
				var t = this;
				if (this.options.triggerElement) {
					$(this.options.triggerElement).bind(this.options.triggerEvent,function() {
						t.$container.overlay(t.options.trigger);
					})
				}
				
				if (this.options.closeElement) {
					$(this.options.closeElement).bind(this.options.closeEvent,function() {
						t.$container.overlay("hide");
					})
				}
			},
			run:function(__function,data) {
				this.__function  = __function;
				var  result = this.__function(data);
				delete this.__function;
				return result;
			},
			runEvent:function(options,data) {
				this.run(this.events[options],data);
			}
		}
		$parent[0].overlayObject = t;
		t.construct();
		if (t.options.show) $parent.overlay("show");		
		return t;
}

$.fn.extend({
	overlay:function(options,data) {
		var options = options, data = data;
		if ($(this).length == 0) return OVERLAY(this,options,data);
		$(this).each(function() {
			var x = new OVERLAY ($(this),options,data);
		});
	},
	fullDimensions:function() {
		var p = {
			width:['width','borderLeftWidth','borderRightWidth','paddingLeft','paddingRight'],
			height:['height','borderTopWidth','borderBottomWidth','paddingTop','paddingBottom']
		};
		var width = height = 0;
		for (var x in p.width) {
			width +=  parseFloat($(this).css(p.width[x]));
			height +=  parseFloat($(this).css(p.height[x]));
		}
		return {
			width:width,
			height:height
		}
	},
	center:function(relTo) {
		var relTo = relTo;
		if (typeof relTo != 'object') var $container = $(relTo);
		var scrl = 0;
				
		if (relTo != 'viewport' && (typeof relTo != 'object')) {
			var cfd = (relTo!='body') ? $container.fullDimensions() : getPageSize() ;
		} else {
			var cfd = {width:parseFloat($(window).width()),height:parseFloat($(window).height()) };
			var scrl = parseFloat($(window).scrollTop());
		}
		var ofd = $(this).fullDimensions();
		
		var left = Math.round((cfd.width-ofd.width)/2);
		var top = Math.round((cfd.height-ofd.height)/2);
		
		if (typeof relTo != 'string') {
			// extend with properties: absolute left & right, relative left & right
			var obj = relTo;
			if (typeof obj.absoluteLeft != 'undefined') left = obj.absoluteLeft;
			if (typeof obj.absoluteTop != 'undefined') top = obj.absoluteTop;
			if (typeof obj.relativeLeft != 'undefined') left += obj.relativeLeft;
			if (typeof obj.relativeTop != 'undefined') top += obj.relativeTop;
		}
		
		$(this).css({
			position:'absolute',
			left:left+'px',
			top:top+scrl+'px'
		});
		
		
		
		return this;
	}
});

function getPageSize() {
	   function viewport()
		{
		var e = window, a = 'inner';

		if ( !( 'innerWidth' in window ) ) {
			a = 'client';
			e = document.documentElement || document.body;
		}

		return [e[ a+'Width' ], e[ a+'Height' ]]
		}
		var pageWidth = $(document).width();
		var pageHeight = $(document).height();
		
		var width = (jQuery.browser.msie == true) ? viewport()[0] : pageWidth;
		
		return [width,pageHeight];
		
}