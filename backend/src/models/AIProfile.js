class AIProfile {
  constructor(id, userId, interests, abilities, personality, motivation, recommendedProfessions, interpretation) {
    this.id = id;
    this.userId = userId;
    this.interests = interests; // Map aiTag: score
    this.abilities = abilities;
    this.personality = personality;
    this.motivation = motivation;
    this.recommendedProfessions = recommendedProfessions; // Array of professionIds
    this.interpretation = interpretation;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new AIProfile(doc.id, data.userId, data.interests, data.abilities, data.personality, data.motivation, data.recommendedProfessions, data.interpretation);
  }

  toFirestore() {
    return {
      userId: this.userId,
      interests: this.interests,
      abilities: this.abilities,
      personality: this.personality,
      motivation: this.motivation,
      recommendedProfessions: this.recommendedProfessions,
      interpretation: this.interpretation,
    };
  }
}

export default AIProfile;