const SCENE_CONFIG = {
  backgroundColor: 0xbbbbbb,
  antialias: true,
  fxaaPass: false,
  maxPixelRatio: 2,
  isMobile: false,
  fov: {
    desktop: 50,
    mobile: {
      portrait: 60,
      landscape: 38,
    },
  },
  fog: {
    enabled: false,
    color: 0xffffff,
    desktop: { near: 16, far: 20 },
    mobile: { 
      portrait: { near: 21, far: 25.5 },
      landscape: { near: 16, far: 20 },
    },
  }
};

export default SCENE_CONFIG;
