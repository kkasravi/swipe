module swipe {
  module log from 'log';
  module monads from 'monads';
  export class Swipe {
    constructor(properties={element:null,options:{}}) {
      private callback, delay, deltaX, index, interval, isScrolling, length, options, slider, slides, speed, start, ul, width;
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
      @slider = properties.element;
      @ul = @slider.children[0];
      @slider.style.overflow = 'hidden';
      @ul.style.listStyle = 'none';
      @setup();
      @begin();
      @ul.addEventListener('touchstart', @onstart, false);
      @ul.addEventListener('touchmove', @onmove, false);
      @ul.addEventListener('touchend', @onend, false);
      @ul.addEventListener('webkitTransitionEnd', @ontransitionend, false);
      @ul.addEventListener('transitionend', @ontransitionend, false);
      window.addEventListener('resize', @setup, false);
    }
    setup() {
      monads.DOMable({tagName:'nav'}).on('load').insert(@slider.parentNode).add(
        monads.DOMable({tagName:'span'}).on('load').attributes({id:'position'}).add(
          monads.DOMable({tagName:'span'}).on('load').attributes({'class':'dot active'})
        ).add(
          monads.DOMable({tagName:'span'}).on('load').attributes({'class':'dot'})
        ).add(
          monads.DOMable({tagName:'span'}).on('load').attributes({'class':'dot'})
        ).add(
          monads.DOMable({tagName:'span'}).on('load').attributes({'class':'dot'})
        )
      );
      @slides = @ul.children;
      @length = @slides.length;
      if (@length < 2) {
        return null;
      }
      @width = ("getBoundingClientRect" in @slider) ? 
        @slider.getBoundingClientRect().width : @slider.offsetWidth;
      if (!@width) {
        return null;
      }
      @slider.style.visibility = 'hidden';
      // dynamic css
      @ul.style.width = (@slides.length * @width) + 'px';
      var index = @slides.length;
      while (index--) {
        var el = @slides[index];
        el.style.width = @width + 'px';
        el.style.display = 'table-cell';
        el.style.verticalAlign = 'top';
      }
      @slide(@index, 0); 
      @slider.style.visibility = 'visible';
    }
    slide(index, duration) {
      var style = @ul.style;
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
      @ul.style.webkitTransitionDuration = 0;
      e.stopPropagation();
    }
    onmove(e) {
      if(e.touches.length > 1 || e.scale && e.scale !== 1) return;
      @deltaX = e.touches[0].pageX - @start.pageX;
      if ( typeof @isScrolling === 'undefined') {
        @isScrolling = !!( @isScrolling || Math.abs(@deltaX) < Math.abs(e.touches[0].pageY - @start.pageY) );
      }
      if (!@isScrolling) {
        e.preventDefault();
        clearTimeout(@interval);
        @deltaX = 
          @deltaX / 
            ( (!@index && @deltaX > 0               // if first slide and sliding left
              || @index == @length - 1              // or if last slide and sliding right
              && @deltaX < 0                        // and if sliding at all
            ) ?                      
            ( Math.abs(@deltaX) / @width + 1 )      // determine resistance level
            : 1 );                                          // no resistance if false
        // translate immediately 1-to-1
        @ul.style.webkitTransform = 'translate3d(' + (@deltaX - @index * @width) + 'px,0,0)';
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
          {selector:'#position',style:"text-align: center; font-size: 27px; line-height: 1.3; color: #697279;display:block; position: absolute; top: 0; left: 50%; margin-left: -75px; width: 150px;"},
          {selector:'#gallery nav',style:"border-top: 1px #3A4146 solid; background-image: -webkit-gradient(linear, left top, left bottom, from(#292F34), to(#23282C)); height: 35px; position: relative;"},
          {selector:'#gallery',style:"background:#23282C"},
          {selector:'.dot',style:"display: inline-block;margin:10px 3px;width:12px;height:12px;border-radius:6px;background-color:#8999A6;"},
          {selector:'.active',style:"background-color:#ffffff;"}
        ];
        monads.Styleable(styles).on("load").onstyle();
    })()
  }
}



