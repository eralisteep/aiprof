class AITag {
  constructor(code, name, ru, type, professions) {
    this.code = code;
    this.name = name;
    this.ru = ru;
    this.type = type;
    this.professions = professions; // array
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new AITag(doc.id, data.name, data.ru, data.type, data.professions);
  }

  toFirestore() {
    return {
      name: this.name,
      ru: this.ru,
      type: this.type,
      professions: this.professions,
    };
  }
}

export default AITag;