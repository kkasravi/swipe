module swipe {
  module log from 'log';
  module monads from 'monads';
  export class Swipe {
    constructor(properties={element:null,options:{}}) {
      private callback, container, delay, deltaX, element, index, interval, isScrolling, length, options, slider, slides, speed, start, width;
      @setup = @setup.bind(this);
      @onstart = @onstart.bind(this);
      @onmove = @onmove.bind(this);
      @onend = @onend.bind(this);
      @ontransitionend = @ontransitionend.bind(this);
      @options = properties.options || {};
      @index = @options.startSlide || 0;
      @interval = 0;
      @length = 0;
      @width = 0;
      @speed = @options.speed || 300;
      @callback = @options.callback || function() {};
      @delay = @options.auto || 0;
      @container = properties.element;
      @element = @container.children[0]; // the slide pane
      @container.style.overflow = 'hidden';
      @element.style.listStyle = 'none';
      @setup();
      @begin();
      @element.addEventListener('touchstart', @onstart, false);
      @element.addEventListener('touchmove', @onmove, false);
      @element.addEventListener('touchend', @onend, false);
      @element.addEventListener('webkitTransitionEnd', @ontransitionend, false);
      @element.addEventListener('transitionend', @ontransitionend, false);
      window.addEventListener('resize', @setup, false);
    }
    setup() {
//      monads.DOMable({tagName:'nav'}).on('load').insert(document.body);
      @slides = @element.children;
      @length = @slides.length;
      if (@length < 2) {
        return null;
      }
      @width = ("getBoundingClientRect" in @container) ? 
        @container.getBoundingClientRect().width : @container.offsetWidth;
      if (!@width) {
        return null;
      }
      @container.style.visibility = 'hidden';
      // dynamic css
      @element.style.width = (@slides.length * @width) + 'px';
      var index = @slides.length;
      while (index--) {
        var el = @slides[index];
        el.style.width = @width + 'px';
        el.style.display = 'table-cell';
        el.style.verticalAlign = 'top';
      }
      @slide(@index, 0); 
      @container.style.visibility = 'visible';
    }
    slide(index, duration) {
      var style = @element.style;
      if (duration == undefined) {
          duration = @speed;
      }
      style.webkitTransitionDuration = style.transitionDuration = duration + 'ms';
      // translate to given index position
      style.webkitTransform = 'translate3d(' + -(index * @width) + 'px,0,0)';
      @index = index;
    }
    getPos() {
      return @index;
    }
    prev(delay) {
      @delay = delay || 0;
      clearTimeout(@interval);
      // if not at first slide
      if (@index) {
        @slide(@index-1, @speed);
      }
    }
    next(delay) {
      // cancel next scheduled automatic transition, if any
      @delay = delay || 0;
      clearTimeout(@interval);
      if (@index < @length - 1) {
        @slide(@index+1, @speed); // if not last slide
      } else {
        @slide(0, @speed); //if last slide return to start
      }
    }
    begin() {
      @interval = (@delay) ? setTimeout(function() { 
          @next(@delay);
      }, @delay) : 0;
    }
    stop() {
      @delay = 0;
      clearTimeout(@interval);
    }
    resume() {
      @delay = @options.auto || 0;
      @begin();
    }
    ontransitionend(e) {
      if (@delay) {
        @begin();
      }
      @callback(e, @index, @slides[@index]);
    }
    onstart(e) {
      @start = {
        pageX: e.touches[0].pageX,
        pageY: e.touches[0].pageY,
        // set initial timestamp of touch sequence
        time: Number( new Date() )
      };
      @isScrolling = undefined;
      // reset deltaX
      @deltaX = 0;
      // set transition time to 0 for 1-to-1 touch movement
      @element.style.webkitTransitionDuration = 0;
      e.stopPropagation();
    }
    onmove(e) {
      // ensure swiping with one touch and not pinching
      if(e.touches.length > 1 || e.scale && e.scale !== 1) return;
      @deltaX = e.touches[0].pageX - @start.pageX;
      // determine if scrolling test has run - one time test
      if ( typeof @isScrolling === 'undefined') {
        @isScrolling = !!( @isScrolling || Math.abs(@deltaX) < Math.abs(e.touches[0].pageY - @start.pageY) );
      }
      // if user is not trying to scroll vertically
      if (!@isScrolling) {
        // prevent native scrolling 
        e.preventDefault();
        // cancel slideshow
        clearTimeout(@interval);
        // increase resistance if first or last slide
        @deltaX = 
          @deltaX / 
            ( (!@index && @deltaX > 0               // if first slide and sliding left
              || @index == @length - 1              // or if last slide and sliding right
              && @deltaX < 0                        // and if sliding at all
            ) ?                      
            ( Math.abs(@deltaX) / @width + 1 )      // determine resistance level
            : 1 );                                          // no resistance if false
        // translate immediately 1-to-1
        @element.style.webkitTransform = 'translate3d(' + (@deltaX - @index * @width) + 'px,0,0)';
        e.stopPropagation();
      }
    }
    onend(e) {
      // determine if slide attempt triggers next/prev slide
      var isValidSlide = Number(new Date()) - @start.time < 250 && Math.abs(@deltaX) > 20 || 
        Math.abs(@deltaX) > @width/2,
        isPastBounds = !@index && @deltaX > 0 || @index == @length - 1 && @deltaX < 0;
      if (!@isScrolling) {
        @slide( @index + ( isValidSlide && !isPastBounds ? (@deltaX < 0 ? 1 : -1) : 0 ), @speed );
      }
    }
    static init = (function() {
        var styles = [
          {selector:'.swipe',style:"padding-bottom:20px;"},
          {selector:'.swipe li div, .swipe div div div',style:"margin:0 10px; padding:50px 10px; background:#1db1ff; font-weight:bold; color:#fff; font-size:20px; text-align:center;"},
          {selector:'#position',style:"text-align: center; font-size: 27px; line-height: 1.3; color: #697279; display: block; position: absolute; top: 0; left: 50%; margin-left: -75px; width: 150px;"},
          {selector:'#gallery nav',style:"border-top: 1px #3A4146 solid; background-image: -webkit-gradient(linear, left top, left bottom, from(#292F34), to(#23282C)); height: 35px; position: relative;"},
          {selector:'#gallery',style:"background:#23282C"},
          {selector:'.dot',style:"display: inline-block; width:12px;height:12px; border-radius:6px; background-color:#8999A6;"},
          {selector:'.active',style:"background-color:#ffffff;"}
        ];
        monads.Styleable(styles).on("load").onstyle();
    })()
  }
}



