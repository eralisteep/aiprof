class Question {
  constructor(id, text, type, aiTags, weight, stage, active, options) {
    this.id = id;
    this.text = text;
    this.type = type;
    this.aiTags = aiTags; // array
    this.weight = weight;
    this.stage = stage;
    this.active = active;
    this.options = options;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Question(doc.id, data.text, data.type, data.aiTags, data.weight, data.stage, data.active, data.options);
  }

  toFirestore() {
    return {
      text: this.text,
      type: this.type,
      aiTags: this.aiTags,
      weight: this.weight,
      stage: this.stage,
      active: this.active,
      options: this.options || []
    };
  }
}

export default Question;