class TestResult {
  constructor(id, userId, answers, timestamp) {
    this.id = id;
    this.userId = userId;
    this.answers = answers; // Map questionId: answer
    this.timestamp = timestamp;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new TestResult(doc.id, data.userId, data.answers, data.timestamp.toDate());
  }

  toFirestore() {
    return {
      userId: this.userId,
      answers: this.answers,
      timestamp: this.timestamp,
    };
  }
}

module.exports = TestResult;