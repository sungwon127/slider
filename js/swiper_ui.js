var m4 = m4 || {};
m4.hasJqueryObject = function($elem){ return $elem.length > 0; };

// Init Check Console
// m4.console.log(String);
// m4.console.error(String);
// m4.console.reset(String);
m4.console = new function(){
	this.log = function(name){ console.log("pubLog : " + name + " is added"); };
	this.error = function(name){ console.log("pubError : " + name + " is not init"); };
	this.reset = function(name){ console.log("Reset : "+ name +" Reset Complete"); };
};

// Mobile Console
// m4.mConsole.log(arguments);
m4.mConsole = new function(){
	this.init = function(){
		var html = [
			'<style>',
			'#bsConsole{position:fixed;z-index:999999;background:#eee;bottom:0;left:0;right:0;height:60px}',
			'#bsConsoleTab{background:#ccc;height:20px}',
			'#bsConsoleTabConsole,#bsConsoleTabElement{font-size:11px;margin:2px 5px;padding:0 5px;float:left;border:1px solid #666}',
			'#bsConsoleView{font-size:10px;overflow-y:scroll;height:180px}',
			'#bsConsoleViewElement{word-break:break-all;word-wrap:break-word}',
			'.bsConsoleItem{font-size:13px;border:1px solid #000;padding:5px;margin:5px;float:left}',
			'</style>',
			'<div id="bsConsole">',
			'<div id="bsConsoleTab">',
			'<div id="bsConsoleTabConsole">Console</div>',
			'</div>',
			'<div id="bsConsoleView">',
			'<div id="bsConsoleViewConsole"></div><div id="bsConsoleViewElement" style="display:none"></div>',
			'</div>',
			'</div>'
		];
		this.temp = document.createElement('div');
		this.count = 0;
		if(document.getElementById('bsConsole')) return;
		this.temp.innerHTML = html.join('');
		document.body.appendChild(this.temp.childNodes[0]);
		document.body.appendChild(this.temp.childNodes[0]);
		$("#bsConsole").on("click",  function(e){
			this.style.opacity = this.style.opacity == '1' ? '.2' : '1';
		});
	};

	this.log = function(){
		this.init();
		var a = arguments, i = 0, j = a.length, item, v;
		item = ['<div style="clear:both">'];
		while(i < j){
			v = a[i++];
			if(v && typeof v == 'object') v = JSON.stringify(v);
			item.push('<div class="bsConsoleItem">' + v + " / " +( this.count++)+'</div>');
		}
		item.push('</div>');
		this.temp.innerHTML = item.join('');
		$("#bsConsoleViewConsole").html(this.temp);
	};
};

// Index Manager
// add - m4.idxManager.add({ id: String, len: Number, isNext: Boolean });
// get - m4.idxManager.find(id).getIndex(value);
// set - m4.idxManager.find(id).setIndex(value);
// reset - m4.idxManager.find(id).reset();
// get Length - m4.idxManager.find(id).getLength();
// set Length - m4.idxManager.find(id).setLength(value);
m4.idxManager = new function(){
	var _that = this;
	_that.hash = {};
	_that.arr = [];

	_that.add = function(obj){
		function Indexing(_id, _len, _isNext){
			var len = _len;
			var count = 0;
			var isNext = _isNext;
			return {
				getIndex: function(value){
					if(value === undefined) return count;
					count += value;
					if(isNext){
						if(count >= len) count = 0;
						else if(count < 0) count = len - 1;
					} else{
						if(count >= len) count = len;
						else if(count < 0) count = 0;
					}
					return count;
				},

				setIndex: function(value){
					count = value;
					return count;
				},

				getLength: function(){
					return len;
				},

				setLength: function(value){
					len = value;
					return len;
				},

				reset: function(){
					count = 0;
				}
			};
		}
		var indexing = new Indexing(obj.id, obj.len, obj.isNext);
		return _that.hash[obj.id] = indexing, _that.arr.push(indexing), _that;
	};

	_that.find = function(obj){
		return _that.hash[obj];
	};

	_that.all = function(){
		return _that.arr;
	};
};

// TimerManager
// Object - id, end, success, removeCount
// id : String
// end : Number
// success : function
// removeCount : number
// m4.timerManager.add({ id: , end: , success: , removeCount:  });
// m4.timerManager.start();
window.requestAnimatedFrame = (function (){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback){
		window.setTimeout(callback, 1000 / 60);
	};
})();

m4.timerManager = new function (){
	var _that = this;
	_that.hashMap = {};
	_that.all = [];
	var count = 0;
	var isStop = false;
	var fps = 60;

	_that.add = function(obj){
		function CustomSetTimeOut($id, $ended, $successFunc, $removedCount){
			var _id = $id;
			var elapsed = 0;
			var ended = $ended;
			var isAutoplay = true;
			var removedCount = $removedCount || -1;
			var counter = 0;
			return {
				id: function(){
					return $id;
				}, 
				
				call: function(){
					counter += 1;
					if (counter < $removedCount){
						m4.timerManager.ins().remove($id);
						return;
					}
					if (isAutoplay){
						if (++elapsed >= ended){
							$successFunc(_id, counter - 1);
							elapsed = 0;
						}
					}
				}, 
				
				auto: function(){
					if (arguments.length){
						isAutoplay = arguments[0];
						elapsed = 0;
					} else{
						return isAutoplay;
					}
				}, 
				
				reset: function(){
					elapsed = 0;
				}
			};
		}
		var ticker = new CustomSetTimeOut(obj["id"], obj["end"], obj["success"], obj["removeCount"]);
		_that.hashMap[obj["id"]] = ticker;
		_that.all.push(ticker);
	};

	_that.find = function (id){
		return _that.hashMap[id];
	};

	_that.remove = function (id){
		_that.all.splice(_that.all.indexOf(_that.hashMap[id]), 1);
		_that.hashMap[id] = null;
	};

	_that.start =  function (){
		requestAnimatedFrame(enterFrame);
	};

	function enterFrame(){
		count += 1;
		if (count >= fps){
			var i = -1, length = _that.all.length;
			count = 0;
			while (++i < length){
				_that.all[i].call();
			}
		}
		requestAnimatedFrame(enterFrame);
	}
};

// Module Manager
// add - m4.moduleManager.add("name", func);
// find - m4.moduleManager.find("name");
// all - m4.moduleManager.all();
// reset - m4.moduleManager.reset();
m4.moduleManager = new function(){
	var _that = this;
	_that.hash = {};
	_that.arr = [];
	_that.add = function(name, func){
		var _func = new func();
		m4.console.log(name);
		return _that.hash[name] = _func, _that.arr.push({ name: name, func: _func}), _that;
	};

	_that.find = function(name){
		return _that.hash[name];
	};

	_that.all = function(){
		return _that.arr;
	};

	_that.reset = function(){
		for(var i = 0; i < _that.arr.length; i++){
			if(_that.arr[i].func.isInit){
				if(typeof _that.arr[i].func.reset === "function"){
					_that.arr[i].func.reset();
					m4.console.reset(_that.arr[i].name);
				}
			} else{
				m4.console.error(_that.arr[i].name);
			}
		}
	};
};

// Tab
m4.tab = function(){
	return{
		init: function(){
			this.isInit = true;
			this.reset();
		},

		reset: function(){
			m4.tab.$tab = m4.$body.find(".initTab");
			m4.tab.$tabCtrl = m4.tab.$tab.find(".tabCtrl");
			m4.tab.$tab.each(function(idx){ 
				$(this).data("key", idx).find(">.tabCtrlWrap>.tabCtrl").each(function(_idx){ 
					$(this).data("ctrlKey", _idx);
					if($(this).hasClass("current")){
						var key = $(this).data("ctrlKey");
						m4.tab.$tab.eq(idx).find(">.tabViewWrap>.tabView").eq(key).show();
					}
				});
			});
			this.addEvents();
		},

		addEvents: function(){
			m4.tab.$tabCtrl.off("click.tab").on("click.tab", this.handleClick);
		},

		handleClick: function(){
			var $that = $(this);
			if($that.hasClass("current")) return;
			m4.tab.key = $that.parents(".initTab").data("key");
			m4.tab.ctrlKey = $that.data("ctrlKey");
			m4.tab.currentKey = m4.tab.$tab.eq(m4.tab.key).find(">.tabCtrlWrap>.tabCtrl.current").data("ctrlKey");
			var $tabCtrl = m4.tab.$tab.eq(m4.tab.key).find(">.tabCtrlWrap>.tabCtrl");
			var $tabView = m4.tab.$tab.eq(m4.tab.key).find(">.tabViewWrap>.tabView");
			$tabCtrl.eq(m4.tab.currentKey).removeClass("current");
			$tabView.eq(m4.tab.currentKey).hide();
			$that.addClass("current");
			$tabView.eq(m4.tab.ctrlKey).show();
		}
	};
};

// Toggle
m4.toggle = function(){
	return{
		init: function(){
			this.isInit = true;
			this.reset();
			this.addEvents();
		},
		
		reset: function(){
			m4.toggle.$toggle = m4.$body.find(".initToggle");
			m4.toggle.$toggle.each(function(){
				$(this).find(">ul>li>.toggleCtrl").each(function(){ 
					var $siblings = $(this).siblings(".toggleView");
					if($(this).hasClass("current")) $siblings.show();
					else $siblings.hide();
				 });
			});
		},

		addEvents: function(){
			m4.$body.on("click.toggle", ".toggleCtrl", this.handleClick);
		},

		handleClick: function(){
			var $that = $(this);
			var $toggleCtrl = $that.parents(".initToggle").find(">ul>li>.toggleCtrl");
			var $toggleView = $that.parents(".initToggle").find(">ul>li>.toggleView");
			var $siblings = $that.siblings(".toggleView");
			if(!$that.hasClass("current")){
				$toggleCtrl.not($that).removeClass("current");
				$toggleView.not($siblings).hide();
				$that.addClass("current");
				$siblings.show();
			} else{
				$that.removeClass("current");
				$siblings.hide();
			}
		}
	};
};

// Layer Popup
// Open - m4.UI.find("m4.layerPopup").handleOpen(this);
// Close - m4.UI.find("m4.layerPopup").handleClose();
m4.layerPopup = function(){
	return{
		init: function(){
			this.isInit = true;
			this.addEvents();
		},

		addEvents: function(){
			m4.$body.on("click.popOpen", ".pubLayerCtrl", this.handleOpen);
			m4.$body.on("click.popClose", ".layerPopup .btnLayerClose", this.handleClose);
		},

		handleOpen: function(e){
			var $layerPopup = m4.$body.find(".layerPopup");
			var $pubLayerPopup = m4.$body.find(".pubLayerPopup");
			if($(e.target).next($pubLayerPopup).length > 0){
				m4.layerPopup.$target = $(e.target);
				m4.layerPopup.$layerPopup = $(e.target).next($pubLayerPopup);
			} else{
				m4.layerPopup.$target = $(e)[0];
				m4.layerPopup.$layerPopup = $layerPopup.not($pubLayerPopup);
			}
			m4.layerPopup.$layerPopup.attr("tabindex", 0).show().focus();
			m4.layerPopup.$layerPopup.show();
			m4.$dim.show();
			m4.UI.find("m4.layerPopup").handleAlign( m4.layerPopup.$layerPopup );
			m4.$window.off("resize.align").on("resize.align", function(){ m4.UI.find("m4.layerPopup").handleAlign(m4.layerPopup.$layerPopup); });
			m4.layerPopup.$layerPopup.off("keydown.focus").on("keydown.focus", m4.UI.find("m4.layerPopup").handleFocus);
		},

		handleClose: function(){
			m4.layerPopup.$layerPopup.removeAttr("tabindex").hide();
			m4.$dim.hide();
			m4.layerPopup.$target.focus();
		},

		handleFocus:  function(e){
			if(e.keyCode === 9){
				if(!e.shiftKey){
					if(m4.layerPopup.$layerPopup.find("a,button,input").last().is(":focus")){
						m4.layerPopup.$layerPopup.focus();
					}
				} else{
					if(m4.layerPopup.$layerPopup.is(":focus")){
						setTimeout(function(){
							m4.layerPopup.$layerPopup.find("a,button,input").last().focus();
						}, 1);
					}
				}
			}
		},

		handleAlign: function($el){
			m4.align($el);
		}
	};
};

// swiper
m4.swiper = function(){
	return{
		init: function(){
			this.isInit = true;
			m4.swiper.$swiperWrap = m4.$body.find(".swiperWrap");
			this.handleSlider();
		},

		options : function() {
			return[
				{
					wrapperClass:"swiperInner",
					slideClass:"item",
					slidesPerView: "auto"
				},
				{
					wrapperClass:"swiperInner",
					slideClass:"item",
					slidesPerView:1
				}
			]
		},

		handleSlider: function(){
			var that = this;
			m4.swiper.retunOption = m4.UI.find("m4.swiper").options();

			m4.swiper.$swiperWrap.each(function(idx) {
				var _this = $(this);
				var swipe = new Swiper(_this,m4.swiper.retunOption[idx]);
			});
			
		}
	};
};

// PreventDefault
m4.handlePreventDefault = function(e){ if(m4.$dim.length > 0 && m4.$dim.is(":visible")) e.preventDefault(); };
m4.PreventDefault = function(){ m4.$body.on("touchmove", m4.handlePreventDefault); };

// Center Align
// @params
// $el - Selector
m4.align = function($el){
	if($el === undefined) return;
	var winWidth = m4.$window.width();
	var winHeight = m4.$window.height();
	$el.each(function(){
		if($(this).is(":visible")){
			var popWidth = $el.outerWidth(true);
			var popHeight = $el.outerHeight(true);
			$(this).css({"top": (winHeight- popHeight) *.5, "left": (winWidth - popWidth) *.5});
		}
	});
};


// UI
// find = m4.UI.find(String);
// all = m4.UI.all();
// reset = m4.UI.reset();
// init = m4.UI.startup();
m4.UI = new function(){
	this.find = function(name){
		return m4.moduleManager.find(name);
	};

	this.all = function(){
		return m4.moduleManager.all();
	};

	this.reset = function(){
		return m4.moduleManager.reset();
	};

	this.addModule = function(){
		if( m4.hasJqueryObject( m4.$body.find(".initTab") ) && m4.moduleManager.find("m4.tab") === undefined ) m4.moduleManager.add("m4.tab", m4.tab);
		if( m4.hasJqueryObject( m4.$body.find(".initToggle") ) && m4.moduleManager.find("m4.toggle") === undefined ) m4.moduleManager.add("m4.toggle", m4.toggle);
		if( m4.hasJqueryObject( m4.$body.find(".layerPopup") ) && m4.moduleManager.find("m4.layerPopup") === undefined ) m4.moduleManager.add("m4.layerPopup", m4.layerPopup);
		if( m4.hasJqueryObject( m4.$body.find(".swiperWrap") ) && m4.moduleManager.find("m4.swiper") === undefined ) m4.moduleManager.add("m4.swiper", m4.swiper);
	};

	this.init = function(){
		if( m4.hasJqueryObject( m4.$body.find(".initTab") ) && m4.moduleManager.find("m4.tab").isInit === undefined ) m4.moduleManager.find("m4.tab").init();
		if( m4.hasJqueryObject( m4.$body.find(".initToggle") ) && m4.moduleManager.find("m4.toggle").isInit === undefined ) m4.moduleManager.find("m4.toggle").init();
		if( m4.hasJqueryObject( m4.$body.find(".layerPopup") ) && m4.moduleManager.find("m4.layerPopup").isInit === undefined ) m4.moduleManager.find("m4.layerPopup").init();
		if( m4.hasJqueryObject( m4.$body.find(".swiperWrap") ) && m4.moduleManager.find("m4.swiper").isInit === undefined ) m4.moduleManager.find("m4.swiper").init();
	};

	this.startup = function(){
		m4.UI.addModule();
		m4.UI.init();
	};
};

$(function(){
	m4.$window = $(window);
	m4.$body = $("body");
	m4.$dim = m4.$body.find(".dim");
	m4.UI.startup();
});