'use strict';

class DrawArc {
  constructor() {
    this.of = null; // outer Arc focus
    this.if = null; // inner Arc focus
    this.cx = null;
    this.cy = null;
    this.ir = null;
    this.or = null;
    this.a = null;
  }

  setProps(centerX, centerY, innerR, outerR, angle) {
    this.cx = centerX;
    this.cy = centerY;
    this.ir = innerR;
    this.or = outerR;
    this.a = angle;

    this.setFocus();
    this.angleToRadians();
  }

  setFocus() {
    if (this.a < 180) {
      this.of = '0 0 0';
      this.if = '0 0 1';
    } else if (this.a >= 180 && this.a < 360) {
      this.of = '0 1 0';
      this.if = '0 1 1';
    }

    return;
  }

  angleToRadians() {
    this.a = 2 * (this.a / 360) * Math.PI;
    return;
  }

  interpolateArc(centerX, centerY, innerR, outerR, angle) {
    this.setProps(centerX, centerY, innerR, outerR, angle);
    let d = 'M ' + (this.cx + this.or) + ' ' + this.cy;
    d = d + ' A ' + this.or + ' ' + this.or;
    d = d + ' ' + this.of;
    d = d + ' ' + (this.or * Math.cos(this.a) + this.cx) + ' ' + (-1 * this.or * Math.sin(this.a) + this.cy);
    d = d + ' L ' + (this.ir * Math.cos(this.a) + this.cx) + ' ' + (-1 * this.ir * Math.sin(this.a) + this.cy);
    d = d + ' A ' + this.ir + ' ' + this.ir;
    d = d + ' ' + this.if;
    d = d + ' ' + (this.cx + this.ir) + ' ' + this.cy + ' Z';
    return d;
  }}


class Animator {

  constructor(props) {

    this.animReq = null;
    this.idx = null;
    this.playing = false;

    this.tstart = null;
    this.time = null;
    this.tfinal = null;

    this.props = props;

    this.el = null;

    this.currentVal = null;
    /*
                             *
                             * TERMS OF USE - EASING EQUATIONS
                             * 
                             * Open source under the BSD License. 
                             * 
                             * Copyright Â© 2001 Robert Penner
                             * All rights reserved.
                             */
    this.easings = {
      linear: function (x, t, b, c, d) {
        return (c - b) * x;
      },
      easeInQuad: function (x, t, b, c, d) {
        return c * (t /= d) * t + b;
      },
      easeOutQuad: function (x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
      },
      easeInOutQuad: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * (--t * (t - 2) - 1) + b;
      },
      easeInCubic: function (x, t, b, c, d) {
        return c * (t /= d) * t * t + b;
      },
      easeOutCubic: function (x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
      },
      easeInOutCubic: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
      },
      easeInQuart: function (x, t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
      },
      easeOutQuart: function (x, t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
      },
      easeInOutQuart: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
      },
      easeInQuint: function (x, t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
      },
      easeOutQuint: function (x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
      },
      easeInOutQuint: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
      },
      easeInSine: function (x, t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
      },
      easeOutSine: function (x, t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
      },
      easeInOutSine: function (x, t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
      },
      easeInExpo: function (x, t, b, c, d) {
        return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
      },
      easeOutExpo: function (x, t, b, c, d) {
        return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
      },
      easeInOutExpo: function (x, t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
      },
      easeInCirc: function (x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
      },
      easeOutCirc: function (x, t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
      },
      easeInOutCirc: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
      },
      easeInElastic: function (x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
          a = c;
          var s = p / 4;
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
      },
      easeOutElastic: function (x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
          a = c;
          var s = p / 4;
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
      },
      easeInOutElastic: function (x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d / 2) == 2) return b + c;
        if (!p) p = d * (.3 * 1.5);
        if (a < Math.abs(c)) {
          a = c;
          var s = p / 4;
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
      },
      easeInBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
      },
      easeOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
      },
      easeInOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
      },
      easeInBounce: function (x, t, b, c, d) {
        return c - jQuery.easing.easeOutBounce(x, d - t, 0, c, d) + b;
      },
      easeOutBounce: function (x, t, b, c, d) {
        if ((t /= d) < 1 / 2.75) {
          return c * (7.5625 * t * t) + b;
        } else if (t < 2 / 2.75) {
          return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
        } else if (t < 2.5 / 2.75) {
          return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
        } else {
          return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
        }
      },
      easeInOutBounce: function (x, t, b, c, d) {
        if (t < d / 2) return jQuery.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
        return jQuery.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
      } };

  }

  setValue(attr) {
    let val = null;
    switch (attr.state) {
      case 'init':
        val = attr.vt0;
        break;
      case 'update':
        let easing = this.easings[attr.timingFn](attr.x, attr.t, 0, Math.abs(attr.vts - attr.vtf), this.props[this.idx].duration);
        if (attr.vts < attr.vtf) {
          val = attr.vts + easing;
        } else {
          val = attr.vts - easing;
        }

        break;
      case 'stop':
        val = attr.vtf;
        break;}


    if (attr.fn && typeof attr.fn === 'object') {
      let args = attr.fn.args.concat(parseFloat(val.toFixed(2)));
      val = attr.fn.var.apply(attr.fn.context, args);
    }

    return val;
  }

  setElemAttr(el, attr) {

    let val = this.setValue(attr);
    let prop = attr.name;

    if (attr.name.includes('transform')) {
      prop = prop.split(':');
      let name = prop[1];
      let opt = prop[2] ? prop[2] : null;
      prop = prop[0];
      switch (name) {
        case 'scale':
          val = `${name}( ${val} ${val} )`;
          break;
        case 'rotate':
          if (opt && opt === 'anti') {
            val = `${name}( ${360 - val} )`;
          } else {
            val = `${name}( ${val} )`;
          }
          break;
        default:
          val = `${name}( ${val})`;
          break;}

    }

    el.setAttribute(prop, val);
    return;

  }

  init() {
    this.props.forEach(prop => {
      let elem = document.querySelectorAll(prop.el);
      for (let i = 0; i < elem.length; i++) {
        prop.attrs.forEach(attr => {
          attr.state = 'init';
          this.setElemAttr(elem[i], attr);
        });
      }
    });
    this.idx = 0;
    return;
  }

  start(idx) {

    this.el = document.querySelectorAll(this.props[idx].el);
    this.tfinal = this.tstart + this.props[idx].duration + (this.el.length - 1) * this.props[idx].delay;
    /*for (let i = 0; i < this.el.length; i++) {
                                                                                                             this.props[idx].attrs.forEach((attr) => {
                                                                                                                 attr.state = 'start';
                                                                                                                 this.setElemAttr(this.el[i], attr);
                                                                                                             });
                                                                                                         }*/
    this.update(idx);
  }

  update(idx) {

    let date = new Date();
    this.time = date.getTime();

    if (this.time < this.tfinal) {
      this.animReq = requestAnimationFrame(this.update.bind(this, idx));
      for (let i = 0; i < this.el.length; i++) {

        let t = this.time + i * this.props[idx].delay - this.tstart;
        let x = t / this.props[idx].duration;

        if (x >= 0 && x <= 1) {
          for (let attr of this.props[idx].attrs) {
            attr.state = 'update';
            attr.x = x;
            attr.t = t;
            this.setElemAttr(this.el[i], attr);
          }
        }
      }
      return;
    } else {
      this.stop(idx);
      return;
    }
  }

  stop(idx) {
    for (let i = 0; i < this.el.length; i++) {
      this.props[idx].attrs.forEach(attr => {
        attr.state = 'stop';
        this.setElemAttr(this.el[i], attr);
      });
    }
    if (this.idx < this.props.length - 1) {
      this.idx++;
      this.tstart = this.tfinal;
      this.start(this.idx);
    } else {
      console.log('done');
      this.playing = false;
      document.body.dispatchEvent(new CustomEvent('animation-complete'))
    }
  }

  play() {
    if (!this.playing) {
      this.init();
      this.playing = true;
      let date = new Date();
      this.time = this.tstart = date.getTime();
      this.start(this.idx);
    }
  }}



let drawArc = new DrawArc();

let animProp = [{
  el: '.gridC',
  attrs: [{
    name: 'transform:scale',
    vt0: 0,
    vts: 0,
    vtf: 1,
    timingFn: 'easeInOutCubic' },
  {
    name: 'opacity',
    vt0: 0,
    vts: 0,
    vtf: 1,
    timingFn: 'easeInOutCubic' }],

  duration: 1000,
  delay: 100 },
{
  el: '.gridR',
  attrs: [{
    name: 'transform:scale',
    vt0: 0,
    vts: 0,
    vtf: 1,
    timingFn: 'easeInOutCubic' },
  {
    name: 'opacity',
    vt0: 0,
    vts: 0,
    vtf: 1,
    timingFn: 'easeInOutCubic' }],

  duration: 600,
  delay: 100 },
{
  el: '#gridRangle',
  attrs: [{
    name: 'transform:rotate:anti',
    vt0: 0,
    vts: 0,
    vtf: 30,
    timingFn: 'easeOutExpo' }],

  duration: 200,
  delay: 0 },
{
  el: '#gArc',
  attrs: [{
    name: 'd',
    vt0: 0,
    vts: 0,
    vtf: 330,
    fn: {
      'var': drawArc.interpolateArc,
      'args': [0, 0, 40, 52],
      'context': drawArc },

    'timingFn': 'easeInOutCubic' }],

  duration: 900,
  delay: 0 },
{
  el: '#gStem',
  attrs: [{
    name: 'width',
    vt0: 0,
    vts: 0,
    vtf: 60,
    timingFn: 'easeOutExpo' }],

  duration: 200,
  delay: 0 },
{
  el: '#sStem',
  attrs: [{
    name: 'width',
    vt0: 0,
    vts: 0,
    vtf: 40,
    timingFn: 'easeOutExpo' }],

  duration: 200,
  delay: 0 },
{
  el: '.sArc',
  attrs: [{
    name: 'd',
    vt0: 0,
    vts: 0,
    vtf: 150,
    fn: {
      'var': drawArc.interpolateArc,
      'args': [0, 0, 80, 68],
      'context': drawArc },

    'timingFn': 'easeOutQuart' }],

  duration: 900,
  delay: 100 },
{
  el: '#sSerifT',
  attrs: [{
    name: 'width',
    vt0: 0,
    vts: 0,
    vtf: 20,
    timingFn: 'easeOutQuart' }],

  duration: 150,
  delay: 0 },
{
  el: '#gSerif',
  attrs: [{
    name: 'width',
    vt0: 0,
    vts: 0,
    vtf: 20,
    timingFn: 'easeOutQuart' }],

  duration: 100,
  delay: 0 },
{
  el: '#sSerifB',
  attrs: [{
    name: 'width',
    vt0: 0,
    vts: 0,
    vtf: 20,
    timingFn: 'easeOutQuart' }],

  duration: 50,
  delay: 0 },
{
  el: '.grid',
  attrs: [{
    name: 'opacity',
    vt0: 0,
    vts: 1,
    vtf: 0,
    timingFn: 'easeInOutQuart' }],

  duration: 1000,
  delay: 0 }];


let anim = new Animator(animProp);
document.addEventListener('DOMContentLoaded', () => {anim.play();});
document.body.addEventListener('animation-complete', () => {
  setTimeout(() => {
    anim.play();
  }, 1500)
})