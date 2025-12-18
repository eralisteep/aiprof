class User {
  constructor(id, name, school, grade, createdAt) {
    this.id = id;
    this.name = name;
    this.school = school; // школа
    this.grade = grade; // класс (9-11)
    this.createdAt = createdAt;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new User(doc.id, data.name, data.school, data.grade, data.createdAt.toDate());
  }

  toFirestore() {
    return {
      name: this.name,
      school: this.school,
      grade: this.grade,
      createdAt: this.createdAt,
    };
  }
}

export default User;