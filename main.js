document.addEventListener('DOMContentLoaded', function() {
  const NS = 'http://www.w3.org/2000/svg';

  let shapes = [];
  let svg = document.getElementById('svg');
  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');

  class Shape {
    constructor() {
      this.id = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
    }

    isPointIn(x, y) {
      let bounds = this.getBounds();
      return bounds.x < x && x < bounds.x + bounds.width &&
             bounds.y < y && y < bounds.y + bounds.height;
    }
  }

  class Rect extends Shape {
  	constructor(x, y, width, height, fill) {
      super();
    	this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.fill = fill;
    }

    getBounds() {
    	return this;
    }

    toSVG() {
    	let rect = document.createElementNS(NS, 'rect');
      ['x', 'y', 'width', 'height', 'fill'].forEach(key => rect.setAttribute(key, this[key]));
      rect.setAttribute('id', this.id);
      return rect;
    }
  }

  class Circle extends Shape {
  	constructor(x, y, radius, fill) {
      super();
    	this.x = x;
      this.y = y;
      this.radius = radius;
      this.fill = fill;
    }

    get width() {
      return this.radius * 2;
    }

    get height() {
      return this.radius * 2;
    }

    getBounds() {
    	return new Rect(this.x, this.y, this.width, this.height);
    }

    toSVG() {
    	let circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('cx', this.x + this.radius);
      circle.setAttribute('cy', this.y + this.radius);
      circle.setAttribute('r', this.radius);
      circle.setAttribute('fill', this.fill);
      circle.setAttribute('id', this.id);

      return circle;
    }
  }

  class MouseControls {
    constructor(app) {
      window.addEventListener('mousemove', evt => {
        app.highlighted = app.shapes.filter(shape => shape.isPointIn(evt.x, evt.y));

        if (app.mousedown) {
          app.highlighted.forEach(shape => {
            shape.x = evt.x - shape.width / 2;
            shape.y = evt.y - shape.height / 2;
          });
        }
        app.render();
      });

      window.addEventListener('mousedown', evt => {
        app.mousedown = evt;
      });

      window.addEventListener('mouseup', evt => {
        app.mousedown = false;
      })
    }
  };

  class KeyControls {
    constructor(app) {
      window.addEventListener('keypress', evt => {
        if (evt.charCode === 100 && app.highlighted.length > 0) {
          app.highlighted.forEach(shape => app.remove(shape));
          app.render();
        }
      });
    }
  }

  class App {
    constructor() {
      this.controls = [];
      this.controls.push(new MouseControls(this));
      this.controls.push(new KeyControls(this));

      this.highlighted = [];
      this.selected = [];
      this.mousedown = false;
      this.shapes = [];
    }

    render() {
      ctx.clearRect(0, 0, 400, 400);
      this.highlighted.forEach(shape => {
        let bounds = shape.getBounds();
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'blue';
        ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.stroke();
        ctx.restore();
      });

      this.shapes.forEach(shape => {
        let svgShape = svg.getElementById(shape.id);
        let newSvgShape = shape.toSVG();
        if (svgShape) {
          Array.prototype.forEach.call(svgShape.attributes, function(attr) {
            let name = attr.nodeName;
            let val = svgShape.getAttribute(name);
            let newVal = newSvgShape.getAttribute(name);
            if (val !== newVal) {
              svgShape.setAttribute(name, newVal);
            }
          })
        }
        else {
          svg.appendChild(newSvgShape);
        }
      });
    }

    add(shape) {
      this.shapes.push(shape);
      this.render();
    }

    remove(shape) {
      let element = document.getElementById(shape.id);
      let index = app.shapes.indexOf(shape);

      if (element) {
        element.remove();
      }

      if (index >= 0) {
        this.shapes.splice(index, 1);
      }

      this.render();
    }
  }

  let app = new App();
  let rect = new Rect(200, 50, 100, 100, '#FF0000');
  let circle = new Circle(100, 100, 30, '#00FF00');
  app.add(rect);
  app.add(circle);

  document.getElementById('circle').addEventListener('click', evt => {
    let color = '#'+Math.floor(Math.random()*16777215).toString(16);
    console.log(color)
    app.add(new Circle(0, 0, 30, color));
  });

  document.getElementById('rect').addEventListener('click', evt => {
    let color = '#'+Math.floor(Math.random()*16777215).toString(16);
    console.log(color)
    app.add(new Rect(0, 0, 50, 40, color));
  });
});
