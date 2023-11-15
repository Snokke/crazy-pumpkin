import { ENVIRONMENT_OBJECTS_TYPE } from '../data/environment-objects-type';
import PostSkullAbstract from './post-skull-abstract';

export default class PostSkullRight extends PostSkullAbstract {
  constructor() {
    super();

    this._type = ENVIRONMENT_OBJECTS_TYPE.PostSkullRight;
    
    this._init();
    this._startIdleAnimationTimer();
  }
}
