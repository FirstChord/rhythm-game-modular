// Patterns Module - Handles rhythm pattern data and logic

// SVG definitions for rest symbols
export const EIGHTH_REST_SVG = `
<svg viewBox="0 0 24 32" width="16" height="24" class="rest-svg eighth-rest-svg">
  <ellipse cx="7" cy="7" rx="7" ry="7" fill="black"/>
  <rect x="10" y="8" width="4" height="22" fill="black" transform="rotate(20 10 8)"/>
</svg>
`;

export const QUARTER_REST_SVG = `
<svg viewBox="0 0 20 32" width="14" height="24" class="rest-svg quarter-rest-svg">
  <path d="M10,2 L16,12 Q10,18 16,24 Q10,30 10,30" stroke="black" stroke-width="4" fill="none"/>
</svg>
`;

export const SIXTEENTH_REST_SVG = `
<svg viewBox="0 0 14 24" width="14" height="24" xmlns="http://www.w3.org/2000/svg">
  <path d="M8,6 C10,5 10,3 8.5,3 C7,3 6,5 8,6 Z" fill="black"/>
  <path d="M8,14 C10,13 10,11 8.5,11 C7,11 6,13 8,14 Z" fill="black"/>
  <path d="M8,6 L8,22" stroke="black" stroke-width="1.5"/>
</svg>`;

// All rhythm patterns organized by difficulty level
export const patterns = [
  // BEGINNER PATTERNS - Simple, clear patterns that work well with VexFlow
  
  // Pattern 1: Four quarter notes - the most basic pattern
  {
    level: "beginner",
    bars: [
      [
        [{ type: "quarter", rest: false }],  // Beat 1
        [{ type: "quarter", rest: false }],  // Beat 2
        [{ type: "quarter", rest: false }],  // Beat 3
        [{ type: "quarter", rest: false }]   // Beat 4
      ]
    ]
  },
  
  // Pattern 2: Quarter note, quarter rest, quarter note, quarter note
  {
    level: "beginner",
    bars: [
      [
        [{ type: "quarter", rest: false }],  // Beat 1
        [{ type: "quarter", rest: true }],   // Beat 2 (rest)
        [{ type: "quarter", rest: false }],  // Beat 3
        [{ type: "quarter", rest: false }]   // Beat 4
      ]
    ]
  },
  
  // Pattern 3: Two quarter notes, one half note
  {
    level: "beginner",
    bars: [
      [
        { type: "quarter", rest: false },   // Beat 1
        { type: "quarter", rest: false },   // Beat 2
        { type: "half", rest: false }       // Beat 3-4 (half note)
      ]
    ]
  },
  
  // Pattern 4: Quarter, quarter, quarter, quarter rest
  {
    level: "beginner",
    bars: [
      [
        [{ type: "quarter", rest: false }],  // Beat 1
        [{ type: "quarter", rest: false }],  // Beat 2
        [{ type: "quarter", rest: false }],  // Beat 3
        [{ type: "quarter", rest: true }]    // Beat 4 (rest)
      ]
    ]
  },
  
  // Pattern 5: Half note, two quarter notes
  {
    level: "beginner",
    bars: [
      [
        { type: "half", rest: false },      // Beat 1-2 (half note)
        { type: "quarter", rest: false },   // Beat 3
        { type: "quarter", rest: false }    // Beat 4
      ]
    ]
  },
  
  // Pattern 6: Quarter, quarter rest, quarter, quarter rest
  {
    level: "beginner",
    bars: [
      [
        [{ type: "quarter", rest: false }],  // Beat 1
        [{ type: "quarter", rest: true }],   // Beat 2 (rest)
        [{ type: "quarter", rest: false }],  // Beat 3
        [{ type: "quarter", rest: true }]    // Beat 4 (rest)
      ]
    ]
  },
  
  // Pattern 7: Two eighth notes, quarter, quarter, quarter
  {
    level: "beginner",
    bars: [
      [
        [{ type: "eighth", rest: false }],   // Beat 1a
        [{ type: "eighth", rest: false }],   // Beat 1b
        [{ type: "quarter", rest: false }],  // Beat 2
        [{ type: "quarter", rest: false }],  // Beat 3
        [{ type: "quarter", rest: false }]   // Beat 4
      ]
    ]
  },
  
  // Pattern 8: Quarter, two eighth notes, quarter, quarter
  {
    level: "beginner",
    bars: [
      [
        [{ type: "quarter", rest: false }],  // Beat 1
        [{ type: "eighth", rest: false }],   // Beat 2a
        [{ type: "eighth", rest: false }],   // Beat 2b
        [{ type: "quarter", rest: false }],  // Beat 3
        [{ type: "quarter", rest: false }]   // Beat 4
      ]
    ]
  },
  
  // Pattern 9: Quarter, quarter, two eighth notes, quarter
  {
    level: "beginner",
    bars: [
      [
        [{ type: "quarter", rest: false }],  // Beat 1
        [{ type: "quarter", rest: false }],  // Beat 2
        [{ type: "eighth", rest: false }],   // Beat 3a
        [{ type: "eighth", rest: false }],   // Beat 3b
        [{ type: "quarter", rest: false }]   // Beat 4
      ]
    ]
  },
  
  // Pattern 10: Quarter, quarter, quarter, two eighth notes
  {
    level: "beginner",
    bars: [
      [
        [{ type: "quarter", rest: false }],  // Beat 1
        [{ type: "quarter", rest: false }],  // Beat 2
        [{ type: "quarter", rest: false }],  // Beat 3
        [{ type: "eighth", rest: false }],   // Beat 4a
        [{ type: "eighth", rest: false }]    // Beat 4b
      ]
    ]
  },
  
  // Pattern 11: Eighth note, eighth rest, quarter, quarter, quarter
  {
    level: "beginner",
    bars: [
      [
        [{ type: "eighth", rest: false }],   // Beat 1a
        [{ type: "eighth", rest: true }],    // Beat 1b (rest)
        [{ type: "quarter", rest: false }],  // Beat 2
        [{ type: "quarter", rest: false }],  // Beat 3
        [{ type: "quarter", rest: false }]   // Beat 4
      ]
    ]
  },
  
  // Pattern 12: Quarter, eighth note, eighth rest, quarter, quarter
  {
    level: "beginner",
    bars: [
      [
        [{ type: "quarter", rest: false }],  // Beat 1
        [{ type: "eighth", rest: false }],   // Beat 2a
        [{ type: "eighth", rest: true }],    // Beat 2b (rest)
        [{ type: "quarter", rest: false }],  // Beat 3
        [{ type: "quarter", rest: false }]   // Beat 4
      ]
    ]
  },
  
  // Pattern 13: Four eighth notes (two per beat)
  {
    level: "beginner",
    bars: [
      [
        [{ type: "eighth", rest: false }],   // Beat 1a
        [{ type: "eighth", rest: false }],   // Beat 1b
        [{ type: "eighth", rest: false }],   // Beat 2a
        [{ type: "eighth", rest: false }],   // Beat 2b
        [{ type: "quarter", rest: false }],  // Beat 3
        [{ type: "quarter", rest: false }]   // Beat 4
      ]
    ]
  },
  
  // Pattern 14: Whole note (one note for entire bar)
  {
    level: "beginner",
    bars: [
      [
        [{ type: "whole", rest: false }]     // Beat 1-4 (whole note)
      ]
    ]
  },
  
  // Pattern 15: Quarter note, half note, quarter note
  {
    level: "beginner",
    bars: [
      [
        [{ type: "quarter", rest: false }],  // Beat 1
        [{ type: "half", rest: false }],     // Beat 2-3 (half note)
        [{ type: "quarter", rest: false }]   // Beat 4
      ]
    ]
  },

  // INTERMEDIATE PATTERNS
  {
    level: "intermediate",
    bars: [
      [
        [                                            // Beat 1
          { type: "eighth", rest: false },
          { type: "eighth", rest: false }
        ],
        [                                            // Beat 2
          { type: "eighth", rest: true },
          { type: "eighth", rest: false }
        ],
        [                                            // Beat 3
          { type: "eighth", rest: false },
          { type: "eighth", rest: false }
        ],
        [                                            // Beat 4
          { type: "eighth", rest: true },
          { type: "eighth", rest: false }
        ]
      ]
    ]
  },
  {
    level: "intermediate",
    bars: [
      [
        [{ type: "quarter", rest: false }],          // Beat 1
        [{ type: "quarter", rest: true }],           // Beat 2
        [                                            // Beat 3
          { type: "eighth", rest: false },
          { type: "eighth", rest: false }
        ],
        [{ type: "quarter", rest: false }]           // Beat 4
      ]
    ]
  },
  {
    level: "intermediate",
    bars: [
      [
        [                                            // Beat 1
          { type: "sixteenth", rest: false },
          { type: "sixteenth", rest: false },
          { type: "eighth", rest: false }
        ],
        [                                            // Beat 2
          { type: "eighth", rest: false },
          { type: "eighth", rest: true }
        ],
        [                                            // Beat 3
          { type: "quarter", rest: false }
        ],
        [                                            // Beat 4
          { type: "eighth", rest: false },
          { type: "eighth", rest: false }
        ]
      ]
    ]
  },
  {
    level: "intermediate",
    bars: [
      [
        [{ type: "quarter", rest: false }],          // Beat 1
        [                                            // Beat 2
          { type: "eighth", rest: false },
          { type: "eighth", rest: true }
        ],
        [                                            // Beat 3
          { type: "sixteenth", rest: false },
          { type: "sixteenth", rest: false },
          { type: "eighth", rest: false }
        ],
        [{ type: "quarter", rest: false }]           // Beat 4
      ]
    ]
  },
  {
    level: "intermediate",
    bars: [
      [
        [                                            // Beat 1
          { type: "eighth", rest: false },
          { type: "eighth", rest: true }
        ],
        [{ type: "sixteenth", rest: false },         // Beat 2
         { type: "sixteenth", rest: true },
         { type: "eighth", rest: false }],
        [{ type: "quarter", rest: false }],          // Beat 3
        [{ type: "quarter", rest: true }]            // Beat 4
      ]
    ]
  },
   {
    level: "intermediate",
    bars: [
      [
        [{ type: "quarter", rest: false }],          // Beat 1
        [{ type: "quarter", rest: true }],           // Beat 2
        [                                            // Beat 3
          { type: "eighth", rest: false },
          { type: "eighth", rest: false }
        ],
        [{ type: "quarter", rest: false }]           // Beat 4
      ]
    ]
  },
  {
    level: "intermediate",
    bars: [
      [
        [                                            // Beat 1
          { type: "sixteenth", rest: false },
          { type: "sixteenth", rest: false },
          { type: "eighth", rest: false }
        ],
        [                                            // Beat 2
          { type: "eighth", rest: false },
          { type: "eighth", rest: true }
        ],
        [                                            // Beat 3
          { type: "quarter", rest: false }
        ],
        [                                            // Beat 4
          { type: "eighth", rest: false },
          { type: "eighth", rest: false }
        ]
      ]
    ]
  },
  {
    level: "intermediate",
    bars: [
      [
        [{ type: "quarter", rest: false }],          // Beat 1
        [                                            // Beat 2
          { type: "eighth", rest: false },
          { type: "eighth", rest: true }
        ],
        [                                            // Beat 3
          { type: "sixteenth", rest: false },
          { type: "sixteenth", rest: false },
          { type: "eighth", rest: false }
        ],
        [{ type: "quarter", rest: false }]           // Beat 4
      ]
    ]
  },

 // ADVANCED PATTERNS
{
  level: "advanced",
  bars: [
    [
      [                                            // Beat 1
        { type: "eighth", rest: false },
        { type: "sixteenth", rest: false },
        { type: "sixteenth", rest: false }
      ],
      [                                            // Beat 2
        { type: "sixteenth", rest: false },
        { type: "sixteenth", rest: false },
        { type: "eighth", rest: false }
      ],
      [{ type: "quarter", rest: false }],          // Beat 3
      [                                            // Beat 4
        { type: "eighth", rest: false },
        { type: "eighth", rest: false }
      ]
    ]
  ]
},
{
  level: "advanced",
  bars: [
    [
      // Bar 1: Quarter notes
      [{ type: "quarter", rest: false }],          // Beat 1
      [{ type: "quarter", rest: false }],          // Beat 2
      [{ type: "quarter", rest: false }],          // Beat 3
      [{ type: "quarter", rest: false }]           // Beat 4
    ],
    [
  [{ type: "eighth", rest: false, dotted: true }], // Beat 1 (1.5 beats)
  [
    { type: "sixteenth", rest: false },            // Beat 1 (0.25 beats)
    { type: "quarter", rest: false }                // Beat 3 continuation (0.5 beats)
  ],
  [{ type: "quarter", rest: false }]                // Beat 4 (0.5 beats)
]
  ]
},
  {
  
    level: "advanced",
    bars: [
      [
        [                                            // Beat 1
          { type: "sixteenth", rest: false },
          { type: "sixteenth", rest: false },
          { type: "eighth", rest: false }
        ],
        [                                            // Beat 2
          { type: "eighth", rest: false },
          { type: "eighth", rest: false }
        ],
        [                                            // Beat 3
          { type: "eighth", rest: false },
          { type: "eighth", rest: true }
        ],
        [                                            // Beat 4
          { type: "quarter", rest: false }
        ]
      ]
    ]
  },
  {
    level: "advanced",
    bars: [
      [
        [{ type: "quarter", rest: false }],          // Beat 1 of bar 2
        [                                            // Beat 2 of bar 2
          { type: "eighth", rest: false },
          { type: "eighth", rest: false }
        ],
        [                                            // Beat 3 of bar 2
          { type: "sixteenth", rest: false },
          { type: "sixteenth", rest: false },
          { type: "eighth", rest: false }
        ],
        [                                            // Beat 4 of bar 2
          { type: "eighth", rest: false },
          { type: "eighth", rest: false }
        ]
      ]
    ]
  },
 {
  level: "advanced",
  bars: [
    [
      [                                            // Beat 1
        { type: "sixteenth", rest: false },
        { type: "sixteenth", rest: false },
        { type: "sixteenth", rest: false },
        { type: "sixteenth", rest: false }          // Total: 4/4 of a beat
      ],
      [                                            // Beat 2
        { type: "eighth", rest: false },
        { type: "eighth", rest: false }            // Total: 4/4 of a beat
      ],
      [{ type: "quarter", rest: false }],          // Beat 3 (1 full beat)
      [{ type: "quarter", rest: true }]            // Beat 4 (1 full beat, rest)
    ]
  ]
},
{
  level: "advanced",
  bars: [
    [
      [                                            // Beat 1
        { type: "sixteenth", rest: false },
        { type: "sixteenth", rest: false },
        { type: "eighth", rest: false }            // Total: 4/4 of a beat
      ],
      [                                            // Beat 2
        { type: "eighth", rest: false },
        { type: "eighth", rest: false }
        
                    // Total: 4/4 of a beat
      ],
      [{ type: "quarter", rest: false }],          // Beat 3 (1 full beat)
      [{ type: "quarter", rest: false }]           // Beat 4 (1 full beat)
    ]
  ]

  },
  {
    level: "advanced",
    bars: [
      [
        [{ type: "eighth", rest: false },            // Beat 1
         { type: "eighth", rest: false }],
        [                                            // Beat 2
          { type: "sixteenth", rest: false },
          { type: "sixteenth", rest: false },
          { type: "eighth", rest: false }
        ],
        [{ type: "quarter", rest: false }],          // Beat 3
        [{ type: "quarter", rest: true }]            // Beat 4
      ]
    ]
  }
];

// Pattern manipulation functions
export function normalizeBar(bar) {
  let out = [];
  let totalBeats = 0;
  let i = 0;
  
  // Add notes up to 4 beats
  while (i < bar.length && totalBeats < 4 - 1e-6) {
    const note = bar[i];
    let noteValue;
    
    // Calculate base note value
    if (note.type === "quarter") noteValue = 1;
    else if (note.type === "eighth") noteValue = 0.5;
    else if (note.type === "sixteenth") noteValue = 0.25;
    else noteValue = 0;
    
    // Apply dot if present
    if (note.dotted) noteValue *= 1.5;
    
    if (totalBeats + noteValue <= 4 + 1e-6) {
      out.push(note);
      totalBeats += noteValue;
    } else {
      // Partially fitting note (rare, for advanced rhythms)
      // For this simple system, we'll skip overflow notes entirely
      break;
    }
    i++;
  }
  
  // Pad bar with rests if it's underfilled
  while (totalBeats < 4 - 1e-6) {
    let remaining = 4 - totalBeats;
    if (remaining >= 1 - 1e-6) {
      out.push({ type: "quarter", rest: true });
      totalBeats += 1;
    } else if (remaining >= 0.5 - 1e-6) {
      out.push({ type: "eighth", rest: true });
      totalBeats += 0.5;
    } else if (remaining >= 0.25 - 1e-6) {
      out.push({ type: "sixteenth", rest: true });
      totalBeats += 0.25;
    } else {
      break;
    }
  }
  
  // Remove any accidental overfill (shouldn't happen)
  while (totalBeats > 4 + 1e-6) {
    const removed = out.pop();
    let noteValue;
    if (removed.type === "quarter") noteValue = 1;
    else if (removed.type === "eighth") noteValue = 0.5;
    else if (removed.type === "sixteenth") noteValue = 0.25;
    if (removed.dotted) noteValue *= 1.5;
    totalBeats -= noteValue;
  }
  
  return out;
}

export function validatePattern(pattern) {
  let issues = [];
  let beatTotals = [];
  let currentBeat = 0;
  let currentBeatTotal = 0;
  
  // Track beat positions
  for (let i = 0; i < pattern.length; i++) {
    const note = pattern[i];
    let duration;
    
    if (note.type === "quarter") duration = 1;
    else if (note.type === "eighth") duration = 0.5;
    else if (note.type === "sixteenth") duration = 0.25;
    if (note.dotted) duration *= 1.5;
    
    currentBeatTotal += duration;
    
    // Check if we've completed a beat
    if (currentBeatTotal >= 1) {
      beatTotals.push(currentBeatTotal);
      currentBeat++;
      currentBeatTotal = 0;
    }
    
    // Check for notation issues
    if (!note.rest && note.type === "eighth" && i < pattern.length - 1) {
      const next = pattern[i + 1];
      // Check for eighth + eighth that should be quarter
      if (next && next.type === "eighth" && !next.rest && !note.tieToNext) {
        issues.push(`Notes ${i} and ${i+1} could be combined into a quarter note`);
      }
    }
    
    // Check for notes crossing beat boundaries without ties
    if (!note.rest && currentBeatTotal > 0 && currentBeatTotal < 1 && i < pattern.length - 1) {
      if (!note.tieToNext) {
        issues.push(`Note ${i} crosses beat boundary without a tie`);
      }
    }
  }
  
  return { valid: issues.length === 0, issues };
}

export function flattenPattern(patternArr) {
  let out = [];
  
  // patternArr = array of bars
  for (let i = 0; i < patternArr.length; i++) {
    let bar = patternArr[i];
    
    // Process each beat in the bar
    for (let j = 0; j < bar.length; j++) {
      let beat = bar[j];
      
      // Handle both old nested format and new simplified format
      if (Array.isArray(beat)) {
        // Old format: beat is an array of notes
        for (let k = 0; k < beat.length; k++) {
          out.push(beat[k]);
        }
      } else {
        // New simplified format: beat is a single note
        out.push(beat);
      }
    }
    
    // Add a barline marker after each bar (except the last)
    if (i < patternArr.length - 1) {
      out.push({ isBarline: true });
    }
  }
  
  return out;
}

// Pattern selection functions
let currentPatternIdx = 0;
let selectedLevel = 'beginner';

export function setSelectedLevel(level) {
  selectedLevel = level;
  currentPatternIdx = 0; // Reset to first pattern when level changes
}

export function setCurrentPatternIndex(index) {
  currentPatternIdx = index;
}

export function getCurrentPatternIndex() {
  return currentPatternIdx;
}

export function getSelectedLevel() {
  return selectedLevel;
}

// Returns all patterns for the selected level
export function getPatternsForLevel(level) {
  return patterns.filter(p => p.level === level);
}

// Returns the current pattern (flattened)
export function getCurrentPattern() {
  const patternsForLevel = getPatternsForLevel(selectedLevel);
  // Avoid crash if no patterns for selected level
  if (patternsForLevel.length === 0) return [];
  return flattenPattern(patternsForLevel[currentPatternIdx % patternsForLevel.length].bars);
}

// Move to next pattern in current level
export function nextPattern() {
  const patternsForLevel = getPatternsForLevel(selectedLevel);
  if (patternsForLevel.length === 0) return; // avoid divide by zero
  currentPatternIdx = (currentPatternIdx + 1) % patternsForLevel.length;
  return getCurrentPattern();
}

// Get pattern info for debugging
export function getPatternInfo() {
  const patternsForLevel = getPatternsForLevel(selectedLevel);
  return {
    level: selectedLevel,
    currentIndex: currentPatternIdx,
    totalInLevel: patternsForLevel.length,
    currentPattern: getCurrentPattern()
  };
}