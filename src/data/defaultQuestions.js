const defaultQuestions = [
  {
    id: 1,
    type: 'qcm',
    title: "Résoudre l'équation :",
    context: '2x + 5 = 13',
    options: [
      { key: 'A', text: 'x = 3' },
      { key: 'B', text: 'x = 4' },
      { key: 'C', text: 'x = 5' },
    ],
    correct: 'B',
    feedbacks: {
      A: "💡 Tu as peut-être oublié de diviser par 2 après avoir isolé x. Essaie : 2x = 13 − 5 = 8, donc x = 8 ÷ 2 = ?",
      B: "👏 Bravo ! Parfait : 2 × 4 + 5 = 13 ✓",
      C: "💡 Vérifie ton calcul après avoir soustrait 5. 2x = 13 − 5 = 8. Maintenant divise par 2.",
    },
  },
  {
    id: 2,
    type: 'system',
    title: "Système d'équations",
    context: "  3x + 4y = 7\n −5x + 2y = −16",
    subQuestions: [
      {
        id: '2a',
        text: 'Le couple (5, −2) est-il solution du système ?',
        correct: 'Non',
        feedbacks: {
          Oui: "💡 Essaie de remplacer x = 5 et y = −2 dans les deux équations. 3(5) + 4(−2) = 15 − 8 = 7 ✓ mais −5(5) + 2(−2) = −25 − 4 = −29 ≠ −16 ✗",
          Non: "👏 Bravo ! En effet, (5, −2) ne vérifie pas la deuxième équation.",
        },
      },
      {
        id: '2b',
        text: 'Le couple (3, −½) est-il solution du système ?',
        correct: 'Oui',
        feedbacks: {
          Oui: "👏 Bravo ! Vérifions : 3(3) + 4(−½) = 9 − 2 = 7 ✓ et −5(3) + 2(−½) = −15 − 1 = −16 ✓",
          Non: "💡 Vérifie en remplaçant les valeurs. 3(3) + 4(−½) = 9 − 2 = 7 ✓ et −5(3) + 2(−½) = −15 − 1 = −16 ✓",
        },
      },
    ],
  },
];

export default defaultQuestions;
