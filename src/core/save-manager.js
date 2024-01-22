export default class SaveManager {
  constructor() {
    this.storageKey = 'crazy_pumpkin'
    this.saveVersion = 1;

    this.instance = null;

    this.lang = '';
    this.version;
    this.email = '';

    if (SaveManager.instance) {
      return;
    }

    SaveManager.instance = this;

    const storageData = localStorage.getItem(this.storageKey);

    if (storageData === null || storageData === undefined) {
      this.lang = '';
      this.version = this.saveVersion;
      this.email = '';
  
      this.save();
    } else {
      this.restore();
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SaveManager();
    }

    return this.instance;
  }

  clearAll() {
    this.langData = '';
    this.versionData = this.saveVersion;
  }

  get langData() {
    return this.lang;
  }

  set langData(value) {
    this.lang = value;

    this.save();
  }

  get versionData() {
    return this.version;
  }

  set versionData(value) {
    this.version = value;

    this.save();
  }

  get emailData() {
    return this.email;
  }

  set emailData(value) {
    this.email = value;

    this.save();
  }

  save() {
    const data = JSON.stringify({
      lang: this.lang,
      version: this.version,
      email: this.email,
    });

    const hash = this.hash(data);

    localStorage.setItem(this.storageKey, JSON.stringify(data));
    localStorage.setItem(this.storageKey + 'h', JSON.stringify(hash));
  }

  restore() {
    const data = JSON.parse(localStorage.getItem(this.storageKey));
    const hash = JSON.parse(localStorage.getItem(this.storageKey + 'h'));

    if (data === '' || hash !== this.hash(data)) {
      return;
    }

    const save = JSON.parse(data);

    this.langData = save.lang;
    this.versionData = save.version;
    this.emailData = save.email;

    this.save();
  }

  hash(data) {
    let hash = 0;

    if (data.length === 0) {
      return hash.toString();
    }

    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash |= 0;
    }

    return hash.toString();
  }
}

SaveManager.instance = null;