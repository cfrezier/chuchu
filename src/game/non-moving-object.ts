import {Wall} from "../wall";
import {Arrow} from "./arrow";
import {MovingObject} from "./moving-object";

export class NonMovingObject extends MovingObject {

  override move(walls: Wall[], map: Arrow[][], speed: number) {

  }
}