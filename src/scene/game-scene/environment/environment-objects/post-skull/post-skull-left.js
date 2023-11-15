import { ENVIRONMENT_OBJECTS_TYPE } from '../data/environment-objects-type';
import PostSkullAbstract from './post-skull-abstract';

export default class PostSkullLeft extends PostSkullAbstract {
  constructor() {
    super();

    this._type = ENVIRONMENT_OBJECTS_TYPE.PostSkullLeft;
    
    this._init();
    this._startIdleAnimationTimer();
  }
}
