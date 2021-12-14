export default class Vec2 {
  x: number;
  y: number;
  constructor(_x: number, _y: number) {
    this.x = _x;
    this.y = _y;
  }
  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  in(orign: Vec2, size: Vec2): boolean {
    return (
      ((orign.x < this.x && this.x < size.x) ||
        (size.x < this.x && this.x < orign.x)) &&
      ((orign.y < this.y && this.y < size.y) ||
        (size.y < this.y && this.y < orign.y))
    );
  }
}
