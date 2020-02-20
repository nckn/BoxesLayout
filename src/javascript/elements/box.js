import RoundedBoxGeometry from './roundedBox';

export default class Box {
  constructor() {
    this.size = .45;
    this.geom = new RoundedBoxGeometry(this.size, this.size, this.size, .02, .2);
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.positions = []
    // this.positions = [
    //   pos1: {x: 0, y: 0, z: 0},
    //   pos2: {x: 0, y: 0, z: 0}
    // ]
  }
  
  // putPositions (text) {
  //   alert(text)
  // }
  
}
