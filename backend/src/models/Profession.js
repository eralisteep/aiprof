class Profession {
  constructor(id, name, college, aiProfile) {
    this.id = id;
    this.name = name;
    this.college = college;
    this.aiProfile = aiProfile; // object
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Profession(doc.id, data.name, data.college, data.aiProfile);
  }

  toFirestore() {
    return {
      name: this.name,
      college: this.college,
      aiProfile: this.aiProfile,
    };
  }
}

export default Profession;