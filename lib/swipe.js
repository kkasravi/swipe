(function() {
  var nm = module.Module('swipe');
  (function(require, exports, moduleId) {
    var log = require('log');
    var monads = require('monads');
    var Swipe = (function() {
      function Swipe() {
        function privateData() {
          this.callback = null;
          this.container = null;
          this.delay = null;
          this.deltaX = null;
          this.element = null;
          this.index = null;
          this.interval = null;
          this.isScrolling = null;
          this.length = null;
          this.options = null;
          this.slider = null;
          this.slides = null;
          this.speed = null;
          this.start = null;
          this.width = null;
        }
        var p_vars = new privateData();
        var callback = p_vars.callback;
        Object.getOwnPropertyDescriptor(this,'callback') || Object.defineProperty(this,'callback', {get: function(){return callback;},set: function(e){callback=e;}});
        var container = p_vars.container;
        Object.getOwnPropertyDescriptor(this,'container') || Object.defineProperty(this,'container', {get: function(){return container;},set: function(e){container=e;}});
        var delay = p_vars.delay;
        Object.getOwnPropertyDescriptor(this,'delay') || Object.defineProperty(this,'delay', {get: function(){return delay;},set: function(e){delay=e;}});
        var deltaX = p_vars.deltaX;
        Object.getOwnPropertyDescriptor(this,'deltaX') || Object.defineProperty(this,'deltaX', {get: function(){return deltaX;},set: function(e){deltaX=e;}});
        var element = p_vars.element;
        Object.getOwnPropertyDescriptor(this,'element') || Object.defineProperty(this,'element', {get: function(){return element;},set: function(e){element=e;}});
        var index = p_vars.index;
        Object.getOwnPropertyDescriptor(this,'index') || Object.defineProperty(this,'index', {get: function(){return index;},set: function(e){index=e;}});
        var interval = p_vars.interval;
        Object.getOwnPropertyDescriptor(this,'interval') || Object.defineProperty(this,'interval', {get: function(){return interval;},set: function(e){interval=e;}});
        var isScrolling = p_vars.isScrolling;
        Object.getOwnPropertyDescriptor(this,'isScrolling') || Object.defineProperty(this,'isScrolling', {get: function(){return isScrolling;},set: function(e){isScrolling=e;}});
        var length = p_vars.length;
        Object.getOwnPropertyDescriptor(this,'length') || Object.defineProperty(this,'length', {get: function(){return length;},set: function(e){length=e;}});
        var options = p_vars.options;
        Object.getOwnPropertyDescriptor(this,'options') || Object.defineProperty(this,'options', {get: function(){return options;},set: function(e){options=e;}});
        var slider = p_vars.slider;
        Object.getOwnPropertyDescriptor(this,'slider') || Object.defineProperty(this,'slider', {get: function(){return slider;},set: function(e){slider=e;}});
        var slides = p_vars.slides;
        Object.getOwnPropertyDescriptor(this,'slides') || Object.defineProperty(this,'slides', {get: function(){return slides;},set: function(e){slides=e;}});
        var speed = p_vars.speed;
        Object.getOwnPropertyDescriptor(this,'speed') || Object.defineProperty(this,'speed', {get: function(){return speed;},set: function(e){speed=e;}});
        var start = p_vars.start;
        Object.getOwnPropertyDescriptor(this,'start') || Object.defineProperty(this,'start', {get: function(){return start;},set: function(e){start=e;}});
        var width = p_vars.width;
        Object.getOwnPropertyDescriptor(this,'width') || Object.defineProperty(this,'width', {get: function(){return width;},set: function(e){width=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {
            element:null,
            options:{}
          };
          this.setup=this.setup.bind(this);
          this.onstart=this.onstart.bind(this);
          this.onmove=this.onmove.bind(this);
          this.onend=this.onend.bind(this);
          this.ontransitionend=this.ontransitionend.bind(this);
          this.options=properties.options || {};
          this.index=this.options.startSlide || 0;
          this.interval=0;
          this.length=0;
          this.width=0;
          this.speed=this.options.speed || 300;
          this.callback=this.options.callback || function () {};
          this.delay=this.options.auto || 0;
          this.container=properties.element;
          this.element=this.container.children[0];
          this.container.style.overflow='hidden';
          this.element.style.listStyle='none';
          this.setup();
          this.begin();
          this.element.addEventListener('touchstart',this.onstart,false);
          this.element.addEventListener('touchmove',this.onmove,false);
          this.element.addEventListener('touchend',this.onend,false);
          this.element.addEventListener('webkitTransitionEnd',this.ontransitionend,false);
          this.element.addEventListener('transitionend',this.ontransitionend,false);
          window.addEventListener('resize',this.setup,false);
        }
        return ctor.apply(this,args) || this;
      }
      Swipe.prototype['setup'] = function() {
        this.slides=this.element.children;
        this.length=this.slides.length;
        if(this.length < 2) {
          return null;
        }
        this.width=("getBoundingClientRect" in this.container)?this.container.getBoundingClientRect().width:this.container.offsetWidth;
        if(!this.width) {
          return null;
        }
        this.container.style.visibility='hidden';
        this.element.style.width=(this.slides.length * this.width) + 'px';
        var index=this.slides.length;
        while(index--) {
          var el=this.slides[index];
          el.style.width=this.width + 'px';
          el.style.display='table-cell';
          el.style.verticalAlign='top';
        }
        this.slide(this.index,0);
        this.container.style.visibility='visible';
      };
      Swipe.prototype['slide'] = function(index,duration) {
        var style=this.element.style;
        if(duration == undefined) {
          duration=this.speed;
        }
        style.webkitTransitionDuration=style.transitionDuration=duration + 'ms';
        style.webkitTransform='translate3d(' + -(index * this.width) + 'px,0,0)';
        this.index=index;
      };
      Swipe.prototype['getPos'] = function() {
        return this.index;
      };
      Swipe.prototype['prev'] = function(delay) {
        this.delay=delay || 0;
        clearTimeout(this.interval);
        if(this.index) {
          this.slide(this.index - 1,this.speed);
        }
      };
      Swipe.prototype['next'] = function(delay) {
        this.delay=delay || 0;
        clearTimeout(this.interval);
        if(this.index < this.length - 1) {
          this.slide(this.index + 1,this.speed);
        } else {
          this.slide(0,this.speed);
        }
      };
      Swipe.prototype['begin'] = function() {
        this.interval=(this.delay)?setTimeout(function () {
          this.next(this.delay);
        },this.delay):0;
      };
      Swipe.prototype['stop'] = function() {
        this.delay=0;
        clearTimeout(this.interval);
      };
      Swipe.prototype['resume'] = function() {
        this.delay=this.options.auto || 0;
        this.begin();
      };
      Swipe.prototype['ontransitionend'] = function(e) {
        if(this.delay) {
          this.begin();
        }
        this.callback(e,this.index,this.slides[this.index]);
      };
      Swipe.prototype['onstart'] = function(e) {
        this.start={
          pageX:e.touches[0].pageX,
          pageY:e.touches[0].pageY,
          time:Number(new Date())
        };
        this.isScrolling=undefined;
        this.deltaX=0;
        this.element.style.webkitTransitionDuration=0;
        e.stopPropagation();
      };
      Swipe.prototype['onmove'] = function(e) {
        if(e.touches.length > 1 || e.scale && e.scale !== 1) {
          return;
        }
        this.deltaX=e.touches[0].pageX - this.start.pageX;
        if(typeof(this.isScrolling) === 'undefined') {
          this.isScrolling=!!(this.isScrolling || Math.abs(this.deltaX) < Math.abs(e.touches[0].pageY - this.start.pageY));
        }
        if(!this.isScrolling) {
          e.preventDefault();
          clearTimeout(this.interval);
          this.deltaX=this.deltaX / ((!this.index && this.deltaX > 0 || this.index == this.length - 1 && this.deltaX < 0)?(Math.abs(this.deltaX) / this.width + 1):1);
          this.element.style.webkitTransform='translate3d(' + (this.deltaX - this.index * this.width) + 'px,0,0)';
          e.stopPropagation();
        }
      };
      Swipe.prototype['onend'] = function(e) {
        var isValidSlide=Number(new Date()) - this.start.time < 250 && Math.abs(this.deltaX) > 20 || Math.abs(this.deltaX) > this.width / 2,isPastBounds=!this.index && this.deltaX > 0 || this.index == this.length - 1 && this.deltaX < 0;
        if(!this.isScrolling) {
          this.slide(this.index + (isValidSlide && !isPastBounds?(this.deltaX < 0?1:-1):0),this.speed);
        }
      };
      Swipe.init = (function () {
        var styles=[{
          selector:'.swipe',
          style:"padding-bottom:20px;"
        },{
          selector:'.swipe li div, .swipe div div div',
          style:"margin:0 10px; padding:50px 10px; background:#1db1ff; font-weight:bold; color:#fff; font-size:20px; text-align:center;"
        },{
          selector:'#position',
          style:"text-align: center; font-size: 27px; line-height: 1.3; color: #697279; display: block; position: absolute; top: 0; left: 50%; margin-left: -75px; width: 150px;"
        },{
          selector:'#gallery nav',
          style:"border-top: 1px #3A4146 solid; background-image: -webkit-gradient(linear, left top, left bottom, from(#292F34), to(#23282C)); height: 35px; position: relative;"
        },{
          selector:'#gallery',
          style:"background:#23282C"
        },{
          selector:'.dot',
          style:"display: inline-block; width:12px;height:12px; border-radius:6px; background-color:#8999A6;"
        },{
          selector:'.active',
          style:"background-color:#ffffff;"
        }];
        monads.Styleable(styles).on("load").onstyle();
      })();
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.init = Swipe.init;
        __.constructor = Swipe;
        return new Swipe(args && args.length && args[0]);
      };
    })();
    exports.Swipe = Swipe;
  })(require, nm.getExports(), nm.getId());
})();

