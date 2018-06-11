var pubApp = pubApp || {};

// Index Manager
// add - m4.idxManager.add({ id: String, len: Number, isNext: Boolean });
// get - m4.idxManager.find(id).getIndex(value);
// set - m4.idxManager.find(id).setIndex(value);
// reset - m4.idxManager.find(id).reset();
// get Length - m4.idxManager.find(id).getLength();
// set Length - m4.idxManager.find(id).setLength(value);
pubApp.idxManager = new function(){
  var _that = this;
  _that.hash = {};
  _that.arrAll = [];

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
    return _that.hash[obj.id] = indexing, _that.arrAll.push(indexing), _that;
  };

  _that.find = function(obj){
    return _that.hash[obj];
  };

  _that.all = function(){
    return _that.arrAll;
  };

  _that.getID = function(){
    return _that.hash;
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

pubApp.timerManager = new function (){
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
            pubApp.timerManager.ins().remove($id);
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


pubApp.Slider = new function(){
  this.init = function(){
    this.$sliderWrap = pubApp.$body.find(".slierWrap");
    this.$sliderInner = this.$sliderWrap.find(".slider");
    this.$sliderLi = this.$sliderInner.find("li");
    this.$pageWrap = this.$sliderWrap.find(".pagingWrap");
    this.$pageBtn = this.$pageWrap.find("button");
    this.$nextBtn = this.$sliderWrap.find(".btnNext");
    this.$prevBtn = this.$sliderWrap.find(".btnPrev");
    this.$stopBtn  = this.$sliderWrap.find(".stop"); 

    this.$pageBtn.on("click",this.pageBtnEvent);
    this.$nextBtn.on("click",this.nextBtnEvent);
    this.$prevBtn.on("click",this.prevBtnEvent);
    this.$stopBtn.on("click",this.stopBtnEvent);
   

    this.$sliderWrap.each(function(idx){
      $(this).attr("data-wrap",idx).find(pubApp.Slider.$pageBtn).each(function(_idx){
        $(this).attr("data-list",_idx);
      });

      pubApp.Slider.$sliderWrap.eq(idx).find(pubApp.Slider.$sliderLi).eq(0).addClass("active"); // 초기화
      pubApp.Slider.$sliderWrap.eq(idx).find(pubApp.Slider.$pageBtn).eq(0).addClass("active"); // 초기화

      // slider length 가져오기
      this.sliderLen = pubApp.Slider.$sliderWrap.eq(idx).find(pubApp.Slider.$sliderLi).length;
      pubApp.idxManager.add({ id:"slider"+idx, len: this.sliderLen, isNext: true});
      pubApp.timerManager.add({ id:"slider"+idx , end:1, success:function(){pubApp.Slider.$sliderWrap.eq(idx).find(pubApp.Slider.$nextBtn).trigger("click");}, removeCount:1 });
    });

    pubApp.timerManager.start();
   
  };

  // stop Btn
  this.stopBtnEvent = function(){
    var wrapIdx = $(this).closest(pubApp.Slider.$sliderWrap).attr("data-wrap");
    pubApp.timerManager.remove("slider"+wrapIdx);
  };

  // paging Btn
  this.pageBtnEvent = function(){
    var wrapIdx = $(this).closest(pubApp.Slider.$sliderWrap).attr("data-wrap");
    var idx = parseInt($(this).attr("data-list"));
    if($(this).hasClass("active") === false){
      pubApp.Slider.moveEvent(wrapIdx,idx,true);
    }
  };

  this.nextBtnEvent = function(){
    var wrapIdx = $(this).closest(pubApp.Slider.$sliderWrap).attr("data-wrap");
    var nextIdx = pubApp.idxManager.find("slider"+wrapIdx).getIndex(+1);
    
    pubApp.Slider.moveEvent(wrapIdx,nextIdx,true);
  };

  this.prevBtnEvent = function(){
    var wrapIdx = $(this).closest(pubApp.Slider.$sliderWrap).attr("data-wrap");
    var prevIdx = pubApp.idxManager.find("slider"+wrapIdx).getIndex(-1);

    pubApp.Slider.moveEvent(wrapIdx,prevIdx,false);
  };


  this.moveEvent = function(wrapIdx,idx,_isNext){
    //이전 idx
    this.beforeIdx = pubApp.Slider.$sliderWrap.eq(wrapIdx).find(pubApp.Slider.$sliderInner).find(".active").index();

    if(this.$sliderWrap.eq(wrapIdx).find(this.$sliderLi).is(":animated") === false && this.$sliderWrap.eq(wrapIdx).find(this.$sliderInner).is(":animated") === false) {

      this.$sliderWrap.eq(wrapIdx).find(this.$pageBtn).removeClass("active");
      this.$sliderWrap.eq(wrapIdx).find(this.$pageBtn).eq(idx).addClass("active");
 
      this.$sliderWrap.eq(wrapIdx).find(this.$sliderLi).removeClass("active");
      this.$sliderWrap.eq(wrapIdx).find(this.$sliderLi).eq(idx).addClass("active");

      var liPosition;
      var sliderWrapPosition;
      var sliderWrapWidth = this.$sliderWrap.eq(wrapIdx).find(this.$sliderInner).width();
      var activeIdx = this.$sliderWrap.eq(wrapIdx).find(this.$sliderLi).eq(idx).index(); // 현재 idx

      //console.log("부모:"+wrapIdx+" / 현재:"+ activeIdx+"/ 이전:"+this.beforeIdx);
      
      if (_isNext === true && activeIdx > this.beforeIdx) { //paging 오른쪽 이동
        liPosition = sliderWrapWidth;
        sliderWrapPosition = -sliderWrapWidth;
      }else if(_isNext === true && activeIdx < this.beforeIdx){ //paging 왼쪽 이동
        liPosition = -sliderWrapWidth;
        sliderWrapPosition = sliderWrapWidth;
      }else if(_isNext === true) { //next 버튼 오른쪽 이동
        liPosition = sliderWrapWidth;
        sliderWrapPosition = -sliderWrapWidth;
      }else{ //prev 버튼 왼쪽 이동
        liPosition = -sliderWrapWidth;
        sliderWrapPosition = sliderWrapWidth;
      }

      this.$sliderWrap.eq(wrapIdx).find(this.$sliderLi).eq(idx).css({
        "left": liPosition,
        "display":"block",
        "z-index":2
      });

      this.$sliderWrap.eq(wrapIdx).find(this.$sliderInner).animate(
        {
        "left":sliderWrapPosition
        },
        200,
        function(){
          $(this).css("left",0);
          pubApp.Slider.$sliderWrap.eq(wrapIdx).find(pubApp.Slider.$sliderLi).eq(idx).css("left",0);
          pubApp.Slider.$sliderWrap.eq(wrapIdx).find(pubApp.Slider.$sliderLi).not(".active").hide();
          pubApp.idxManager.find("slider"+wrapIdx).setIndex(idx);
        }
      );

    } 

  };

};


$(function(){
  pubApp.$body = $("body");
  pubApp.Slider.init();
});