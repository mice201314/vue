class Chart {
  constructor(config) {
    this.option = config;
    this.data = config.data;
    this.values = [];
    this.date = ["06/27", "06/28", "06/29", "06/30", "07/01", "07/02", "今日"];
    this.points = [];
    this.width = "";
    this.height = "";
    this.padding = 17;
    this.marginLeft = 30;
    this.marginRight = 10;
    this.marginTop = 30;
    this.marginBottom = 20;
    this.rectChart = {};
    this.cbList = {};
    this.ctx = null;
    this.el = document.querySelector(config.el);
    this.dpi = window.devicePixelRatio;
    this.init();
  }
  init() {
    this.initWidget(); //初始化canvas对象
    this.initData(); ///初始化绘图数据
    this.initRect(); //初始化绘图区域坐标
    this.draw(); //绘图
    this.addEvent(); //绑定touch事件
  }
  initWidget() {
    const { width, height } = this.el.parentNode.getBoundingClientRect();
    let canvas = this.el;
    this.width = width;
    this.height = height;
    canvas.width = width * this.dpi;
    canvas.height = height * this.dpi;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    this.ctx = canvas.getContext("2d");
    this.bindRoundRect();
  }
  initData() {
    let data = this.data.data;
    let extraData = this.data.extra;
    const offset =
      (this.width - this.marginLeft - this.marginRight - this.padding * 2) /
      (data.length - 1);
    let compArr = [];
    for (let i = 0; i < data.length; i++) {
      data[i].value && compArr.push(data[i].value);
    }
    const maxValue = Math.max(...compArr);
    const minValue = Math.min(...compArr);
    this.values = [];
    this.points = [];
    this.values.push(maxValue);
    this.values.push(minValue);
    const average = (this.values[0] + this.values[1]) / 2;
    this.values.splice(1, 0, average.toFixed(1));
    for (let i = 0; i < data.length; i++) {
      const axiosX = data[i].value
        ? this.marginLeft + this.padding + offset * i
        : "";
      const axiosY =
        ((maxValue - data[i].value) / (maxValue - minValue)) *
          (this.height - this.marginTop - this.marginBottom) +
        this.marginTop;
      this.points[i] = {
        x: axiosX,
        y: axiosY,
        value: data[i].value,
        date: data[i].date
      };
    }
    if (!this.points[0].value) {
      let extraPoint = {
        x: this.marginLeft,
        y: 100,
        value: "extra",
        date: "06/01"
      };
      this.points.unshift(extraPoint);
    }
  }
  initRect() {
    const len = this.data.data.length - 1;
    this.rectChart = {
      x: this.marginLeft,
      y: this.marginTop,
      width: this.width - this.marginLeft - this.marginRight,
      height: this.height - this.marginTop - this.marginBottom
    };
    this.rectDate = {
      x: this.marginLeft,
      y: this.height - this.marginBottom / 4,
      offset:
        (this.width - this.marginLeft - this.marginRight - this.padding * 2) /
        len
    };
    this.rectValues = {
      x: this.marginLeft / 2,
      y: this.marginTop,
      offset: this.rectChart.height / 2
    };
  }
  draw() {
    this.drawChart(); //绘制坐标轴
    this.drawDate(); //绘制X轴图例
    this.drawValue(); //绘制Y轴图例
    this.drawLine(); //绘制几何标记
  }
  drawChart() {
    let context = this.ctx;
    context.clearRect(0, 0, this.width * this.dpi, this.height * this.dpi);
    context.save();
    context.scale(this.dpi, this.dpi);
    context.strokeStyle = "#ccc";
    context.beginPath();
    context.save();
    context.setLineDash([4, 5]);
    context.moveTo(this.rectChart.x, this.rectChart.y);
    context.lineTo(this.rectChart.x + this.rectChart.width, this.rectChart.y);
    context.moveTo(
      this.rectChart.x,
      this.rectChart.y + this.rectChart.height / 2
    );
    context.lineTo(
      this.rectChart.x + this.rectChart.width,
      this.rectChart.y + this.rectChart.height / 2
    );
    context.stroke();
    context.restore();

    context.beginPath();
    context.moveTo(this.rectChart.x, this.rectChart.y + this.rectChart.height);
    context.lineTo(
      this.rectChart.x + this.rectChart.width,
      this.rectChart.y + this.rectChart.height
    );
    context.stroke();
  }
  drawDate() {
    let context = this.ctx;
    context.beginPath();
    context.font = "12px sans-serif,arial";
    context.textAlign = "center";
    context.fillStyle = "#ccc";
    const gap = this.points[0].value == "extra" ? 1 : 0;
    for (let i = 0; i < this.points.length; i++) {
      if (gap && i == 0) continue;
      context.fillText(
        this.points[i].date,
        this.rectDate.x + this.padding + this.rectDate.offset * (i - gap),
        this.rectDate.y
      );
    }
  }
  drawValue() {
    let context = this.ctx;
    context.textBaseline = "middle";
    for (let i = 0; i < this.values.length; i++) {
      context.fillText(
        this.values[i],
        this.rectValues.x,
        this.rectValues.y + this.rectValues.offset * i
      );
    }
  }
  drawLine() {
    var context = this.ctx;
    context.strokeStyle = "#4BB134";
    //画折线
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 0; i < this.points.length - 1; i++) {
      if (this.points[i + 1].x) {
        context.lineTo(this.points[i + 1].x, this.points[i + 1].y);
      }
    }
    context.stroke();

    //填充阴影
    context.globalAlpha = 0.2;
    let linear = context.createLinearGradient(0, 0, 0, this.height);
    linear.addColorStop(0, "green");
    linear.addColorStop(1, "#fff");

    context.fillStyle = linear;

    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for (var i = 0; i < this.points.length - 1; i++) {
      if (this.points[i + 1].x) {
        context.lineTo(this.points[i + 1].x, this.points[i + 1].y);
      }
    }
    context.lineTo(this.points[i].x, this.marginTop + this.rectChart.height);
    context.lineTo(this.marginLeft, this.marginTop + this.rectChart.height);
    context.closePath();
    context.fill();

    //画标签和值
    context.globalAlpha = 1;
    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].x && this.points[i].value != "extra") {
        context.fillStyle = "#4BB134";
        context.beginPath();
        context.roundRect(
          this.points[i].x - 15,
          this.points[i].y - 27,
          31,
          17,
          3,
          true,
          false
        );
        context.fillStyle = "#fff";
        context.beginPath();
        context.font = "12px sans-serif,arial";
        context.textAlign = "left";
        context.fillText(
          this.points[i].value,
          this.points[i].x - 12,
          this.points[i].y - 19
        );
      }
    }

    //画圆点
    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].x && this.points[i].value != "extra") {
        context.fillStyle = "#fff";
        context.beginPath();
        context.arc(
          this.points[i].x,
          this.points[i].y,
          5,
          0,
          2 * Math.PI,
          false
        );
        context.stroke();
        context.fill();

        context.fillStyle = "#4BB134";
        context.beginPath();
        context.arc(
          this.points[i].x,
          this.points[i].y,
          3,
          0,
          2 * Math.PI,
          false
        );
        context.fill();
      }
    }

    context.restore();
  }
  refresh(param) {
    this.initData(); ///初始化绘图数据
    this.initRect(); //初始化绘图区域坐标
    this.draw(); //绘图
    // this.drawChart();
  }
  addEvent() {
    const el = this.el;
    let isMoving = false;
    let startX = 0;

    const moveFn = e => {
      if (isMoving) {
        let currentX = e.touches[0].pageX;
        const offsetX = currentX - startX;
        if (Math.abs(offsetX) > 60) {
          const direction = offsetX > 0 ? 1 : -1;
          this.$emit("touch", direction);
          startX = currentX;
        }
      }
    };

    const upFn = e => {
      console.log("up");
      document.removeEventListener("touchmove", moveFn);
      document.removeEventListener("touchend", upFn);
      isMoving = false;
      startX = 0;
    };

    el.addEventListener("touchstart", function(e) {
      startX = e.touches[0].pageX;
      document.addEventListener("touchmove", moveFn);
      document.addEventListener("touchend", upFn);
      isMoving = true;
    });
  }
  $emit(type, param) {
    this.cbList[type].call(this, param);
  }
  $on(type, fn) {
    this.cbList[type] = fn;
  }
  bindRoundRect() {
    /**
     * Add a round rect draw in the 2D context
     * @param x number, begin of x-axis
     * @param y number, begin of y-axis
     * @param width number,
     * @param height number
     * @param radius number, radius of quad curve
     * @param fill bool, fill
     * @param stroke bool, stroke
     */
    CanvasRenderingContext2D.prototype.roundRect = function(
      x,
      y,
      width,
      height,
      radius,
      fill,
      stroke
    ) {
      stroke = typeof stroke == "undefined" ? true : stroke;
      stroke = typeof stroke == "undefined" ? true : stroke;
      radius = typeof radius == "undefined" ? 5 : radius;

      this.beginPath();
      this.moveTo(x + radius, y);
      this.lineTo(x + width - radius, y);
      this.quadraticCurveTo(x + width, y, x + width, y + radius);
      this.lineTo(x + width, y + height - radius);
      this.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
      );
      this.lineTo(x + (width * 3) / 5, y + height);
      this.lineTo(x + (width * 2.5) / 5, y + height + 3);
      this.lineTo(x + (width * 2) / 5, y + height);
      this.lineTo(x + radius, y + height);
      this.quadraticCurveTo(x, y + height, x, y + height - radius);
      this.lineTo(x, y + radius);
      this.quadraticCurveTo(x, y, x + radius, y);
      this.closePath();

      if (stroke) {
        this.stroke();
      }

      if (fill) {
        this.fill();
      }
    };
  }
}
export default Chart;
