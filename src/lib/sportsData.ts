// Sports data constants and utility functions

export const AGE_CATEGORIES = [
  "U8", "U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"
];

export const GENDER_OPTIONS = [
  "Male", "Female"
];

// Sports-specific gender options (same as general options)
export const SPORTS_GENDER_OPTIONS = [
  "Male", "Female"
];

export const SPORT_TYPES = [
  "Individual", "Team"
];

// Team Sports Data
export const TEAM_SPORTS = {
  "Football": {
    name: "Football",
    playerCount: "7-a-side",
    gender: "Boys & Girls",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "7-a-side", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Basketball": {
    name: "Basketball", 
    playerCount: "5-a-side",
    gender: "Boys & Girls",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "5-a-side", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Volleyball": {
    name: "Volleyball",
    playerCount: "6-a-side", 
    gender: "Boys & Girls",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    gameFormat: "Best of 3 games (25 points)",
    teamCutoff: "16 teams per age group",
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "6-a-side", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Cricket": {
    name: "Cricket",
    gameFormat: "T6, T15 and T20 format",
    gender: "Boys & Girls", 
    ageGroups: ["U11", "U13", "U15", "U17", "U19"],
    categories: {
      "Formats": {
        name: "Formats",
        subCategories: [
          { name: "T6", ageFrom: "U11", ageTo: "U19" },
          { name: "T15", ageFrom: "U11", ageTo: "U19" },
          { name: "T20", ageFrom: "U11", ageTo: "U19" }
        ]
      }
    }
  },
  "Hockey": {
    name: "Hockey",
    playerCount: "7-a-side",
    gender: "Boys & Girls",
    ageGroups: ["U11", "U13", "U15", "U17", "U19"],
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "7-a-side", ageFrom: "U11", ageTo: "U19" }
        ]
      }
    }
  },
  "Netball": {
    name: "Netball",
    playerCount: "7-a-side with 7 substitutes",
    gender: "Girls only",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    duration: "20 minutes",
    teamCutoff: "16 teams per age group",
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "7-a-side", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Rugby (7s)": {
    name: "Rugby (7s)",
    gender: "Boys & Girls",
    ageGroups: ["U13", "U15", "U17", "U19"],
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "7s", ageFrom: "U13", ageTo: "U19" }
        ]
      }
    }
  },
  "Handball": {
    name: "Handball",
    playerCount: "7-a-side",
    gender: "Boys & Girls", 
    ageGroups: ["U15", "U17", "U19"],
    duration: "20 minutes",
    teamCutoff: "32 teams per age group",
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "7-a-side", ageFrom: "U15", ageTo: "U19" }
        ]
      }
    }
  }
};

// Individual Sports Data with Categories and Sub-Categories
export const INDIVIDUAL_SPORTS = {
  "Athletics": {
    name: "Athletics",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    cutoff: "5 players per discipline per school",
    categories: {
      "Track": {
        name: "Track",
        subCategories: [
          { name: "50m", ageFrom: "U9", ageTo: "U11" },
          { name: "100m", ageFrom: "U9", ageTo: "U19" },
          { name: "200m", ageFrom: "U9", ageTo: "U19" },
          { name: "400m", ageFrom: "U9", ageTo: "U19" },
          { name: "800m", ageFrom: "U9", ageTo: "U19" },
          { name: "1000m", ageFrom: "U9", ageTo: "U19" },
          { name: "1500m", ageFrom: "U9", ageTo: "U19" },
          { name: "3000m", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Hurdles": {
        name: "Hurdles",
        subCategories: [
          { name: "110m", ageFrom: "U9", ageTo: "U19" },
          { name: "200m", ageFrom: "U9", ageTo: "U19" },
          { name: "400m", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Relays": {
        name: "Relays",
        subCategories: [
          { name: "400m", ageFrom: "U9", ageTo: "U19" },
          { name: "800m", ageFrom: "U9", ageTo: "U19" },
          { name: "1600m", ageFrom: "U9", ageTo: "U19" },
          { name: "Mixed Relay", ageFrom: "U9", ageTo: "U19", gender: "Mixed" }
        ]
      },
      "Field": {
        name: "Field",
        subCategories: [
          { name: "High Jump", ageFrom: "U9", ageTo: "U19" },
          { name: "Long Jump", ageFrom: "U9", ageTo: "U19" },
          { name: "Triple Jump", ageFrom: "U9", ageTo: "U19" },
          { name: "Javelin Throw", ageFrom: "U9", ageTo: "U19" },
          { name: "Discus Throw", ageFrom: "U9", ageTo: "U19" },
          { name: "Shot Put", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Swimming": {
    name: "Swimming",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    cutoff: "5 players per discipline per school",
    categories: {
      "Distances": {
        name: "Distances",
        subCategories: [
          { name: "25m", ageFrom: "U9", ageTo: "U19" },
          { name: "50m", ageFrom: "U9", ageTo: "U19" },
          { name: "100m", ageFrom: "U9", ageTo: "U19" },
          { name: "200m", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Strokes": {
        name: "Strokes",
        subCategories: [
          { name: "Freestyle", ageFrom: "U9", ageTo: "U19" },
          { name: "Butterfly", ageFrom: "U9", ageTo: "U19" },
          { name: "Backstroke", ageFrom: "U9", ageTo: "U19" },
          { name: "Breaststroke", ageFrom: "U9", ageTo: "U19" },
          { name: "All Strokes", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Relays": {
        name: "Relays",
        subCategories: [
          { name: "100m", ageFrom: "U9", ageTo: "U19" },
          { name: "200m", ageFrom: "U9", ageTo: "U19" },
          { name: "400m", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Tennis": {
    name: "Tennis",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    rules: "Best of 3 games",
    categories: {
      "Singles": {
        name: "Singles",
        subCategories: [
          { name: "Singles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Doubles": {
        name: "Doubles", 
        subCategories: [
          { name: "Doubles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Mixed Doubles": {
        name: "Mixed Doubles",
        subCategories: [
          { name: "Mixed Doubles", ageFrom: "U9", ageTo: "U19", gender: "Mixed" }
        ]
      },
      "Team": {
        name: "Team",
        subCategories: [
          { name: "Team", ageFrom: "U9", ageTo: "U19", composition: "4 players: 2 boys, 2 girls", gender: "Mixed" }
        ]
      }
    }
  },
  "Badminton": {
    name: "Badminton",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    rules: "Best of 3 games",
    categories: {
      "Singles": {
        name: "Singles",
        subCategories: [
          { name: "Singles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Doubles": {
        name: "Doubles",
        subCategories: [
          { name: "Doubles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Mixed Doubles": {
        name: "Mixed Doubles",
        subCategories: [
          { name: "Mixed Doubles", ageFrom: "U9", ageTo: "U19", gender: "Mixed" }
        ]
      },
      "Team": {
        name: "Team",
        subCategories: [
          { name: "Team", ageFrom: "U9", ageTo: "U19", composition: "4 players: 2 boys, 2 girls", gender: "Mixed" }
        ]
      }
    }
  },
  "Squash": {
    name: "Squash",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    rules: "Best of 3 games",
    categories: {
      "Singles": {
        name: "Singles",
        subCategories: [
          { name: "Singles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Team": {
        name: "Team",
        subCategories: [
          { name: "Team", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Padel": {
    name: "Padel",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    rules: "Best of 3 games",
    categories: {
      "Doubles": {
        name: "Doubles",
        subCategories: [
          { name: "Doubles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Mixed Doubles": {
        name: "Mixed Doubles",
        subCategories: [
          { name: "Mixed Doubles", ageFrom: "U9", ageTo: "U19", gender: "Mixed" }
        ]
      },
      "Team": {
        name: "Team",
        subCategories: [
          { name: "Team", ageFrom: "U9", ageTo: "U19", composition: "4 players: 2 boys, 2 girls", gender: "Mixed" }
        ]
      }
    }
  },
  "Table Tennis": {
    name: "Table Tennis",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    rules: "Best of 3 games",
    categories: {
      "Singles": {
        name: "Singles",
        subCategories: [
          { name: "Singles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Doubles": {
        name: "Doubles",
        subCategories: [
          { name: "Doubles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Mixed Doubles": {
        name: "Mixed Doubles",
        subCategories: [
          { name: "Mixed Doubles", ageFrom: "U9", ageTo: "U19", gender: "Mixed" }
        ]
      },
      "Team": {
        name: "Team",
        subCategories: [
          { name: "Team", ageFrom: "U9", ageTo: "U19", composition: "4 players: 2 boys, 2 girls", gender: "Mixed" }
        ]
      }
    }
  },
  "Karate": {
    name: "Karate",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    categories: {
      "Kata": {
        name: "Kata",
        subCategories: [
          { name: "Kata", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Kumite": {
        name: "Kumite",
        subCategories: [
          { name: "Kumite", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Taekwondo": {
    name: "Taekwondo",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    categories: {
      "Kata": {
        name: "Kata",
        subCategories: [
          { name: "Kata", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Kumite": {
        name: "Kumite",
        subCategories: [
          { name: "Kumite", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Chess": {
    name: "Chess",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    categories: {
      "Individual": {
        name: "Individual",
        subCategories: [
          { name: "Individual", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Judo": {
    name: "Judo",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    categories: {
      "Kata": {
        name: "Kata",
        subCategories: [
          { name: "Kata", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Kumite": {
        name: "Kumite",
        subCategories: [
          { name: "Kumite", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  }
};

// Helper functions
export const getSportsByType = (sportType: string) => {
  if (sportType === "Team") {
    return Object.keys(TEAM_SPORTS);
  } else if (sportType === "Individual") {
    return Object.keys(INDIVIDUAL_SPORTS);
  }
  return [];
};

export const getCategoriesForSport = (sportName: string) => {
  // Check individual sports first
  const individualSport = INDIVIDUAL_SPORTS[sportName as keyof typeof INDIVIDUAL_SPORTS];
  if (individualSport && individualSport.categories) {
    return Object.keys(individualSport.categories);
  }
  
  // Check team sports
  const teamSport = TEAM_SPORTS[sportName as keyof typeof TEAM_SPORTS];
  if (teamSport && teamSport.categories) {
    return Object.keys(teamSport.categories);
  }
  
  return [];
};

export const getSubCategoriesForSportAndCategory = (sportName: string, categoryName: string) => {
  // Check individual sports first
  const individualSport = INDIVIDUAL_SPORTS[sportName as keyof typeof INDIVIDUAL_SPORTS];
  if (individualSport && individualSport.categories && individualSport.categories[categoryName as keyof typeof individualSport.categories]) {
    return individualSport.categories[categoryName as keyof typeof individualSport.categories].subCategories;
  }
  
  // Check team sports
  const teamSport = TEAM_SPORTS[sportName as keyof typeof TEAM_SPORTS];
  if (teamSport && teamSport.categories && teamSport.categories[categoryName as keyof typeof teamSport.categories]) {
    return teamSport.categories[categoryName as keyof typeof teamSport.categories].subCategories;
  }
  
  return [];
};

export const getAgeGroupsForSport = (sportName: string, sportType: string) => {
  if (sportType === "Team") {
    const sport = TEAM_SPORTS[sportName as keyof typeof TEAM_SPORTS];
    return sport ? sport.ageGroups : AGE_CATEGORIES;
  } else if (sportType === "Individual") {
    const sport = INDIVIDUAL_SPORTS[sportName as keyof typeof INDIVIDUAL_SPORTS];
    return sport ? sport.ageGroups : AGE_CATEGORIES;
  }
  return AGE_CATEGORIES;
};