export default class Point {
  x: number;
  y: number;
  size: number;
  isSelected: boolean;
  constructor(_x: number, _y: number) {
    this.x = _x;
    this.y = _y;
    this.size = 10;
    this.isSelected = false;
  }
  draw(ctx: CanvasRenderingContext2D, height: number) {
    const y = height - this.y;
    if (this.isSelected) {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = "black";
    }
    ctx.fillRect(
      this.x - this.size / 2,
      y - this.size / 2,
      this.size,
      this.size
    );
  }
  select() {
    this.isSelected = true;
  }
  unselect() {
    this.isSelected = false;
  }
  move(_x: number, _y: number) {
    this.x = _x;
    this.y = _y;
  }
}
