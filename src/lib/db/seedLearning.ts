import { DatabaseSync } from 'node:sqlite';
import { TopicContent } from '@/lib/types';

export function seedLearningSystem(db: DatabaseSync, student: any, instituteAdmin: any, now: string): void {
  try {
    // 1. Seed Subtopics for Hierarchical Syllabus Tree
    const insertSubtopic = db.prepare(`
      INSERT OR REPLACE INTO syllabus_nodes (
        id, subject_id, parent_id, level, title, code, order_index,
        estimated_study_hours, weightage_percentage, prerequisite_ids_json, description, difficulty, created_at
      ) VALUES (?, ?, ?, 'subtopic', ?, ?, ?, ?, ?, '[]', ?, ?, ?)
    `);

    // --- CAT 2026 SUBTOPICS ---
    // CAT QA Subtopics
    insertSubtopic.run('subtopic-cat-arith-1', 'subj-cat-qa', 'topic-cat-arithmetic', 'Reciprocal Fractions & Multiplication Factors', 'MATH-201.1', 1, 3.0, 3.0, 'Direct fraction-to-percentage mental conversions (1/1 to 1/20) and rapid multiplier representations.', 'easy', now);
    insertSubtopic.run('subtopic-cat-arith-2', 'subj-cat-qa', 'topic-cat-arithmetic', 'Successive Percentage Shifts & Compound Pricing', 'MATH-201.2', 2, 4.0, 3.5, 'Two-stage and three-stage net compounding, successive discounts, and depreciation.', 'medium', now);
    insertSubtopic.run('subtopic-cat-arith-3', 'subj-cat-qa', 'topic-cat-arithmetic', 'Cost-Marked Price Multipliers & Profit Margins', 'MATH-201.3', 3, 5.0, 4.0, 'MP/CP ratio techniques, false balance manipulations, and tiered discounting schemes.', 'hard', now);
    insertSubtopic.run('subtopic-cat-arith-4', 'subj-cat-qa', 'topic-cat-arithmetic', 'Alligation Cross-Methods & Repeated Replacements', 'MATH-201.4', 4, 4.5, 3.5, 'Mixture balances, weighted averages, and replacement volume ratio decay formulas.', 'hard', now);

    insertSubtopic.run('subtopic-cat-alg-1', 'subj-cat-qa', 'topic-cat-algebra', 'Quadratic Roots, Symmetric Functions & Signs', 'MATH-202.1', 1, 4.0, 3.5, 'Sum and product of roots, nature of discriminant, and sign of quadratic expressions.', 'medium', now);
    insertSubtopic.run('subtopic-cat-alg-2', 'subj-cat-qa', 'topic-cat-algebra', 'Maxima-Minima of Polynomials & Functions', 'MATH-202.2', 2, 5.0, 4.0, 'Vertex coordinate optimization, AM-GM inequality bounds, and domain constraints.', 'hard', now);
    insertSubtopic.run('subtopic-cat-alg-3', 'subj-cat-qa', 'topic-cat-algebra', 'Logarithmic Base-Change & Inequalities', 'MATH-202.3', 3, 4.0, 3.0, 'Logarithm rules, base conversion, characteristic/mantissa, and logarithmic inequality ranges.', 'hard', now);

    // CAT DILR Subtopics
    insertSubtopic.run('subtopic-cat-arr-1', 'subj-cat-dilr', 'topic-cat-arrangements', 'Circular & Linear Complex Seating', 'DILR-101.1', 1, 5.0, 4.0, 'Facing inwards/outwards, alternate direction shifts, and conditional seating constraints.', 'medium', now);
    insertSubtopic.run('subtopic-cat-arr-2', 'subj-cat-dilr', 'topic-cat-arrangements', 'Multi-Attribute Matrix Matching Grids', 'DILR-101.2', 2, 6.0, 4.5, 'Cross-tabulation elimination, deduction trees, and contradiction elimination.', 'hard', now);
    insertSubtopic.run('subtopic-cat-ch-1', 'subj-cat-dilr', 'topic-cat-charts', 'Missing Value Tables & Numerical Consistency', 'DILR-102.1', 1, 5.0, 4.0, 'Reconstructing incomplete tables using row/column arithmetic and balance equations.', 'hard', now);
    insertSubtopic.run('subtopic-cat-gm-1', 'subj-cat-dilr', 'topic-cat-games', 'Round-Robin Tournaments & Knockout Brackets', 'DILR-103.1', 1, 5.0, 4.0, 'Goal difference matrices, minimum points needed for advancement, and upset seeding paths.', 'hard', now);

    // CAT VARC Subtopics
    insertSubtopic.run('subtopic-cat-rc-1', 'subj-cat-varc', 'topic-cat-rc', 'Philosophical & Sociological Abstract Passage Analysis', 'VARC-101.1', 1, 6.0, 5.0, 'Dense abstract arguments, tracking epistemic progression, and author perspective.', 'hard', now);
    insertSubtopic.run('subtopic-cat-rc-2', 'subj-cat-varc', 'topic-cat-rc', 'Inference Deduction & Boundary Conditions', 'VARC-101.2', 2, 6.0, 5.0, 'Differentiating between explicit premises and unjustified extrapolations.', 'hard', now);
    insertSubtopic.run('subtopic-cat-rc-3', 'subj-cat-varc', 'topic-cat-rc', 'Author Tone, Stance & Rhetorical Devices', 'VARC-101.3', 3, 4.0, 3.0, 'Identifying irony, critical skepticism, cautious optimism, and academic detachment.', 'medium', now);
    insertSubtopic.run('subtopic-cat-pj-1', 'subj-cat-varc', 'topic-cat-parajumbles', 'Mandatory Pairs & Transition Connectors (TITA)', 'VARC-102.1', 1, 4.0, 3.5, 'Noun-pronoun antecedents, chronological anchors, and contrasting transition markers.', 'medium', now);

    // 2. Set Difficulty Levels on CAT 2026 Topics
    const updateDifficulty = db.prepare('UPDATE syllabus_nodes SET difficulty = ? WHERE id = ?');
    updateDifficulty.run('hard', 'topic-cat-rc');
    updateDifficulty.run('medium', 'topic-cat-parajumbles');
    updateDifficulty.run('medium', 'topic-cat-parasummary');
    updateDifficulty.run('hard', 'topic-cat-arrangements');
    updateDifficulty.run('hard', 'topic-cat-charts');
    updateDifficulty.run('hard', 'topic-cat-games');
    updateDifficulty.run('medium', 'topic-cat-sets');
    updateDifficulty.run('medium', 'topic-cat-arithmetic');
    updateDifficulty.run('hard', 'topic-cat-algebra');
    updateDifficulty.run('hard', 'topic-cat-geometry');
    updateDifficulty.run('medium', 'topic-cat-numbers');
    updateDifficulty.run('hard', 'topic-cat-modern-math');

    // 3. Spaced Repetition Scheduling on Demo Student Progress (CAT Topics)
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
    const twoDaysAhead = new Date(Date.now() + 172800000).toISOString();
    const fourDaysAhead = new Date(Date.now() + 345600000).toISOString();
    const today = new Date().toISOString();

    const updateSpacedRepetition = db.prepare(`
      UPDATE user_topic_progress
      SET next_revision_date = ?, repetition_interval_days = ?, repetition_count = ?, is_bookmarked = ?
      WHERE user_id = ? AND topic_id = ?
    `);

    // VARC Reading Comprehension has revision overdue!
    updateSpacedRepetition.run(oneDayAgo, 3, 2, 1, student.id, 'topic-cat-rc');
    // QA Arithmetic has revision due today!
    updateSpacedRepetition.run(today, 2, 1, 1, student.id, 'topic-cat-arithmetic');
    // DILR Arrangements scheduled in 2 days
    updateSpacedRepetition.run(twoDaysAhead, 3, 3, 0, student.id, 'topic-cat-arrangements');
    // QA Algebra scheduled in 4 days (up to date)
    updateSpacedRepetition.run(fourDaysAhead, 7, 4, 0, student.id, 'topic-cat-algebra');

    // 4. Seed Authentic Topic Contents in topic_contentstents
    const insertTopicContent = db.prepare(`
      INSERT OR REPLACE INTO topic_contents (topic_id, content_json, updated_at)
      VALUES (?, ?, ?)
    `);

    // --- CAT 2026 TOPIC CONTENTS ---
    // Topic Content: CAT Arithmetic & Commercial Mathematics
    const catArithmeticContent: TopicContent = {
      topic_id: 'topic-cat-arithmetic',
      topic_title: 'Arithmetic & Commercial Mathematics',
      subject_name: 'Quantitative Aptitude',
      estimated_read_minutes: 35,
      learning_objectives: [
        'Master fraction multipliers for mental percentage shifts without paper calculations.',
        'Deconstruct successive percentage shifts and compounding in profit, loss, and interest.',
        'Utilize the MP/CP = (100 + P)/(100 - D) golden ratio for complex retail transactions.',
        'Apply alligation and mixture balance rules to solve multi-stage replacement problems.'
      ],
      prerequisites: [],
      overview: 'Arithmetic forms the cornerstone of CAT Quantitative Aptitude, accounting for 35-40% of the section (typically 8-9 questions out of 22). CAT questions in arithmetic rarely test direct formula application; instead, they embed simple multiplicative relationships within real-world business scenarios, interest rate shifts, and multi-stage mixture dilutions. Mastering ratio multipliers allows candidates to solve these in under 90 seconds.',
      key_concepts: [
        {
          id: 'cat-c1',
          title: 'Fractional Multipliers & Net Percentage Shifts',
          definition: 'Every percentage shift of r% can be modeled as multiplying by (1 ± r/100). If a quantity increases by 1/n, it must decrease by 1/(n + 1) to return to its original value.',
          formula: 'Final = Initial × (1 ± r/100); Inverse shift: +1/n ↔ -1/(n + 1)',
          importance: 'core'
        },
        {
          id: 'cat-c2',
          title: 'Successive Variations Formula',
          definition: 'Two successive percentage changes of a% and b% produce a combined net change equal to their algebraic sum plus their product divided by 100.',
          formula: 'Net Shift % = a + b + (a × b) / 100',
          importance: 'high_yield'
        },
        {
          id: 'cat-c3',
          title: 'Marked Price to Cost Price Proportionality',
          definition: 'When goods marked at discount d% yield profit p%, the ratio of Marked Price (MP) to Cost Price (CP) is strictly independent of the transaction currency.',
          formula: 'MP / CP = (100 + P%) / (100 - D%)',
          importance: 'core'
        },
        {
          id: 'cat-c4',
          title: 'Repeated Dilution & Replacement Formula',
          definition: 'If from a vessel of volume V with pure liquid, x units are drawn and replaced with water n times, the remaining pure liquid quantity follows geometric decay.',
          formula: 'Final Quantity = Initial Quantity × [1 - (x / V)]^n',
          importance: 'high_yield'
        }
      ],
      tables: [
        {
          title: 'High-Frequency CAT Percentage to Fraction Multiplier Table',
          headers: ['Fraction', 'Percentage', 'Fraction', 'Percentage'],
          rows: [
            ['1/2', '50.00%', '1/7', '14.28% (14 2/7%)'],
            ['1/3', '33.33% (33 1/3%)', '1/8', '12.50% (12 1/2%)'],
            ['1/4', '25.00%', '1/9', '11.11% (11 1/9%)'],
            ['1/5', '20.00%', '1/11', '9.09% (9 1/11%)'],
            ['1/6', '16.66% (16 2/3%)', '1/12', '8.33% (8 1/3%)'],
            ['1/13', '7.69%', '1/16', '6.25% (6 1/4%)']
          ],
          caption: 'Essential mental arithmetic constants for CAT QA speed.'
        }
      ],
      worked_examples: [
        {
          id: 'cat-ex1',
          title: 'Successive Profit Margin & Discount Optimization',
          problem_statement: 'A merchant marks goods 40% above cost price. She offers a 20% discount on 60% of the stock, and a 30% discount on the remaining 40% of the stock. Determine her overall profit percentage on the entire inventory.',
          examiner_angle: 'Avoid assuming arbitrary stock quantities like 100 items at Rs. 100. Use weighted fractional multipliers directly.',
          steps: [
            {
              step_number: 1,
              explanation: 'Let CP = 100. Then MP = 140.',
              equation: 'MP = 1.40 × CP'
            },
            {
              step_number: 2,
              explanation: 'Calculate the average selling price multiplier:',
              equation: 'SP_1 = 140 × 0.80 = 112 (for 60% stock); SP_2 = 140 × 0.70 = 98 (for 40% stock)'
            },
            {
              step_number: 3,
              explanation: 'Compute weighted average selling price:',
              equation: 'SP_avg = (0.60 × 112) + (0.40 × 98) = 67.2 + 39.2 = 106.4'
            },
            {
              step_number: 4,
              explanation: 'Overall profit percentage:',
              equation: 'Profit % = 106.4 - 100 = 6.4%'
            }
          ],
          final_answer: '6.4% overall profit',
          pro_tip: 'Candidates mistakenly take the simple average of 20% and 30% discounts (25%) instead of weighting by stock proportion.'
        }
      ],
      common_mistakes: [
        {
          id: 'cm-cat-arith-1',
          mistake_title: 'Unweighted Averaging in Multi-part Inventories',
          error_trap: 'Averaging percentage discounts (e.g. (20% + 30%)/2 = 25%) when quantities are unequal.',
          correct_approach: 'Always multiply individual price multipliers by their fractional weights in the total stock.',
          prevention_rule: 'Check if stock weights are equal before computing simple averages.'
        },
        {
          id: 'cm-cat-arith-2',
          mistake_title: 'Confusing CP and MP in Retail Discount Problems',
          error_trap: 'Applying discount directly to Cost Price instead of Marked Price.',
          correct_approach: 'Discount is strictly computed on Marked Price; Profit or Loss is strictly on Cost Price.',
          prevention_rule: 'Use the Golden Ratio MP/CP = (100 + P%)/(100 - D%) directly.'
        }
      ],
      pyq_references: [
        {
          id: 'pyq-cat-arith-1',
          exam: 'CAT',
          year: 2023,
          tier_or_stage: 'Slot 2',
          frequency_rating: 'very_high',
          question_summary: 'Successive price changes with volume dilution in alloy mixture formulation.'
        },
        {
          id: 'pyq-cat-arith-2',
          exam: 'CAT',
          year: 2022,
          tier_or_stage: 'Slot 1',
          frequency_rating: 'high',
          question_summary: 'Profit-sharing and weighted investment ratios across staggered entry periods.'
        }
      ],
      active_recall_checks: [
        {
          id: 'ar-cat-arith-1',
          question: 'What is the MP/CP ratio if a trader marks an item to yield 20% profit after granting a 10% discount?',
          options: ['4/3', '5/4', '7/5', '11/9'],
          correct_answer: '4/3',
          explanation: 'MP/CP = (100 + 20)/(100 - 10) = 120/90 = 4/3. This indicates a 33.33% markup on cost price.',
          recall_hint: 'Golden formula: MP/CP = (100 + P%)/(100 - D%).'
        },
        {
          id: 'ar-cat-arith-2',
          question: 'If a quantity increases by 25%, by what percentage must it decrease to return to its original value?',
          options: ['20%', '25%', '16.66%', '15%'],
          correct_answer: '20%',
          explanation: 'An increase of 1/4 requires an inverse decrease of 1/(4 + 1) = 1/5 = 20%.',
          recall_hint: '+1/n corresponds to -1/(n + 1).'
        }
      ],
      recap_points: [
        'Reciprocal multipliers (1/2 through 1/20) eliminate cumbersome decimal steps.',
        'Compounding variations: Net % = a + b + (ab/100) with sign conventions.',
        'Golden formula for pricing: MP/CP = (100 + P%)/(100 - D%).',
        'Repeated dilution decay formula: Final = Initial × (1 - x/V)^n.'
      ],
      recommended_sectional_test: {
        id: 'test-cat-mock-01',
        title: 'CAT 2026 Quantitative Aptitude Sectional Diagnostic',
        duration_minutes: 40
      }
    };
    insertTopicContent.run('topic-cat-arithmetic', JSON.stringify(catArithmeticContent), now);

    // Topic Content: CAT Reading Comprehension
    const catRcContent: TopicContent = {
      topic_id: 'topic-cat-rc',
      topic_title: 'Reading Comprehension (Philosophy, Economy, Science)',
      subject_name: 'Verbal Ability & Reading Comprehension',
      estimated_read_minutes: 40,
      learning_objectives: [
        'Deconstruct abstract, multi-disciplinary RC passages into thesis, counter-arguments, and synthesis.',
        'Accurately isolate author tone across the spectrum from detached inquiry to acerbic critique.',
        'Distinguish valid critical inferences from deceptive options that extrapolate beyond the text.',
        'Develop skimming and deep-engagement pacing for 4 passages (16 questions) under 40 minutes.'
      ],
      prerequisites: [],
      overview: 'Reading Comprehension is the dominant pillar of CAT VARC, consistently comprising 16 out of 24 questions (67% of the entire section). Passages are sourced from international journals, philosophical treatises, cognitive psychology papers, and economic histories (such as Aeon, The Economist, and MIT Technology Review). The challenge lies not in vocabulary, but in following dense, non-linear reasoning and spotting subtle trap options in inference questions.',
      key_concepts: [
        {
          id: 'cat-rc-c1',
          title: 'Argument Structure & Thesis Tracking',
          definition: 'Every CAT RC passage contains a central thesis, supportive premises, acknowledged concessions, and refutations. High-scoring candidates track the author\'s intent rather than memorizing individual facts.',
          formula: 'Thesis + Evidence + Concessions = Passage Core',
          importance: 'core'
        },
        {
          id: 'cat-rc-c2',
          title: 'The 4 Deadly Option Traps in CAT RC',
          definition: 'Examiners design wrong options using 4 predictable distortions: 1) Out of Scope (unsupported extrapolation), 2) Opposite / Inverted Causation, 3) Too Extreme (always, never, absolute claims), 4) True in reality but absent from passage.',
          formula: 'Eliminate: Extreme + Out-of-Scope + Distorted Scope',
          importance: 'high_yield'
        },
        {
          id: 'cat-rc-c3',
          title: 'Author Tone Spectrum Analysis',
          definition: 'Author attitude is calibrated through qualifier adverbs and descriptive adjectives. Distinguish between neutral reporting, cautious endorsement, analytical skepticism, and outright condemnation.',
          formula: 'Tone = Vocabulary Valence × Argumentative Modifiers',
          importance: 'core'
        }
      ],
      tables: [
        {
          title: 'CAT RC Question Types and Strike Rates',
          headers: ['Question Type', 'Description', 'Solving Strategy'],
          rows: [
            ['Main Idea / Primary Purpose', 'Why did the author write this passage?', 'Synthesize opening and concluding paragraphs; eliminate options focusing on single paragraphs.'],
            ['Inference', 'What must be logically true based on the text?', 'Anchor strictly in explicit statements; eliminate options using strong unproven words.'],
            ['Tone & Attitude', 'What is author\'s demeanor towards the subject?', 'Examine adjectives and qualifiers in concluding evaluation sections.'],
            ['Except / Negative Fact', 'Which of the following is NOT mentioned?', 'Scan passage keywords; look for altered numerical claims or inverted relationships.']
          ],
          caption: 'Standard taxonomy of CAT VARC questions.'
        }
      ],
      worked_examples: [
        {
          id: 'cat-rc-ex1',
          title: 'Inference Traps: Distinguishing Fact vs Extrapolation',
          problem_statement: 'Passage excerpt: "While automated translation algorithms have reached parity with bilingual adults on factual prose, they consistently falter on idioms and subtle sarcasm, suggesting that machine learning models lack genuine semantic models of human social reality." Question: Which of the following can be properly inferred?',
          examiner_angle: 'The author qualifies translation as lacking social models, but does NOT say machines will never achieve this.',
          steps: [
            {
              step_number: 1,
              explanation: 'Option A: "Machine learning algorithms will never be able to comprehend sarcasm." -> Traps with "never" (too extreme).',
              equation: 'Eliminate: Extreme absolute quantifier'
            },
            {
              step_number: 2,
              explanation: 'Option B: "Comprehending sarcasm requires an underlying model of human social conventions." -> Valid inference directly supported by "suggesting models lack social reality".',
              equation: 'Keep: Logically entailed by text'
            },
            {
              step_number: 3,
              explanation: 'Option C: "Human adults understand sarcasm better than factual prose." -> Unsupported comparison.',
              equation: 'Eliminate: Out of scope'
            }
          ],
          final_answer: 'Option B is the valid inference.',
          pro_tip: 'Students gravitate toward Option A because sarcasm is indeed difficult for AI, but "never" is an unsupported absolute claim.'
        }
      ],
      common_mistakes: [
        {
          id: 'cm-cat-rc-1',
          mistake_title: 'Falling for Extreme Absolute Quantifiers',
          error_trap: 'Selecting options with absolute qualifiers like "never", "invariably", or "solely" when the passage uses guarded language.',
          correct_approach: 'Match the valence and strength of the option directly against the author\'s degree of certainty.',
          prevention_rule: 'Eliminate options containing extreme absolutes unless the text explicitly supports an absolute claim.'
        },
        {
          id: 'cm-cat-rc-2',
          mistake_title: 'Real-World Plausibility Trap (Out of Scope)',
          error_trap: 'Choosing an option because it is factually or scientifically true in the real world, even though it cannot be deduced from the passage text.',
          correct_approach: 'Treat the passage as a closed semantic universe. If the author didn\'t mention or entail it, it is wrong.',
          prevention_rule: 'Ask: "Can I point to the explicit sentence that proves this statement?"'
        }
      ],
      pyq_references: [
        {
          id: 'pyq-cat-rc-1',
          exam: 'CAT',
          year: 2023,
          tier_or_stage: 'Slot 1',
          frequency_rating: 'very_high',
          question_summary: 'Philosophical passage on moral skepticism and the evolution of social norms.'
        },
        {
          id: 'pyq-cat-rc-2',
          exam: 'CAT',
          year: 2022,
          tier_or_stage: 'Slot 3',
          frequency_rating: 'high',
          question_summary: 'Economic history passage evaluating colonial trade monopolies in Southeast Asia.'
        }
      ],
      active_recall_checks: [
        {
          id: 'ar-cat-rc-1',
          question: 'What tone is described when an author neutrally details opposing theories without endorsing either?',
          options: ['Dispassionate / Objective', 'Acerbic', 'Patronizing', 'Apologetic'],
          correct_answer: 'Dispassionate / Objective',
          explanation: 'A neutral, balanced evaluation without taking partisan sides represents an objective or dispassionate stance.',
          recall_hint: 'Identify presence or absence of affective/emotive adjectives.'
        },
        {
          id: 'ar-cat-rc-2',
          question: 'In CAT VARC, how many RC passages are typically presented within the 24 questions?',
          options: ['4 passages (16 questions)', '5 passages (20 questions)', '3 passages (12 questions)', '6 passages (18 questions)'],
          correct_answer: '4 passages (16 questions)',
          explanation: 'CAT VARC consistently features 4 passages with 4 questions each, totaling 16 RC questions alongside 8 VA questions.',
          recall_hint: '4 × 4 = 16 out of 24 questions.'
        }
      ],
      recap_points: [
        'Focus on paragraph structure, thesis progression, and argumentative transitions rather than memorizing trivia.',
        'Eliminate the 4 traps: Extreme, Out of Scope, Inverted Causality, and Distortion.',
        'Budget 8-9 minutes per RC passage including question analysis to finish 4 passages within 34 minutes.',
        'Leave 6-8 minutes for Verbal Ability questions (Para-jumbles, Odd Sentence Out, Summary).'
      ],
      recommended_sectional_test: {
        id: 'test-cat-mock-01',
        title: 'CAT 2026 VARC Sectional Diagnostic',
        duration_minutes: 40
      }
    };
    insertTopicContent.run('topic-cat-rc', JSON.stringify(catRcContent), now);

    // 5. Seed Dedicated Topic Tests and Questions
    const insertTest = db.prepare(`
      INSERT OR REPLACE INTO tests (
        id, user_id, title, description, subject, section_id, duration_seconds,
        marking_scheme_type, default_correct_marks, default_negative_marks, default_unanswered_marks,
        shuffle_questions, shuffle_options, allow_navigation, show_palette, allow_review_marking, show_immediate_results,
        test_type, exam_id, subject_id, topic_id, visibility, is_paid, price_inr, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // --- CAT 2026 TOPIC TESTS ---
    // CAT Topic Test 1: Arithmetic (topic-cat-arithmetic)
    const testCatArithId = 'test-topic-cat-arithmetic';
    insertTest.run(
      testCatArithId,
      instituteAdmin.id,
      'CAT Arithmetic Diagnostic Speed Drill',
      'High-yield CAT arithmetic diagnostic evaluating multiplier speed, profit margins, and successive percentage shifts.',
      'Quantitative Aptitude',
      'sec-mba',
      900, // 15 mins
      'standard',
      3.0,
      1.0,
      0.0,
      1,
      1,
      1,
      1,
      1,
      1,
      'topic_test',
      'exam-cat-2026',
      'subj-cat-qa',
      'topic-cat-arithmetic',
      'public',
      0,
      0.0,
      now,
      now
    );

    // CAT Topic Test 2: Reading Comprehension (topic-cat-rc)
    const testCatRcId = 'test-topic-cat-rc';
    insertTest.run(
      testCatRcId,
      instituteAdmin.id,
      'CAT RC Critical Inference Sprint',
      'Standard CAT passage analysis testing thesis extraction, inference deduction, and subtle author tone identification.',
      'Verbal Ability & Reading Comprehension',
      'sec-mba',
      1200, // 20 mins
      'standard',
      3.0,
      1.0,
      0.0,
      1,
      1,
      1,
      1,
      1,
      1,
      'topic_test',
      'exam-cat-2026',
      'subj-cat-varc',
      'topic-cat-rc',
      'public',
      0,
      0.0,
      now,
      now
    );

    // Topic Test 1: Percentages (5 Questions)
    const testPercId = 'test-topic-cat-percentages';
    insertTest.run(
      testPercId,
      instituteAdmin.id,
      'CAT Arithmetic: Percentages, Profit & Loss Topic Test',
      'High-yield 5-question CAT-pattern topic test assessing successive percentage shifts, marked price formulas, and ratio multipliers.',
      'Quantitative Aptitude',
      'sec-mba',
      900, // 15 minutes
      'standard',
      3.0,
      1.0,
      0.0,
      0,
      0,
      1,
      1,
      1,
      1,
      'topic_test',
      'exam-cat-2026',
      'subj-cat-qa',
      'topic-cat-arithmetic',
      'public',
      0,
      0.0,
      now,
      now
    );

    const percQuestions = [
      {
        id: 'q-top-perc-1',
        num: 1,
        text: 'A trader marks his goods 30% above the cost price and gives a discount of 15% on the marked price. What is his net gain percentage?',
        options: [
          { label: 'A', text: '10.5%' },
          { label: 'B', text: '12.0%' },
          { label: 'C', text: '15.0%' },
          { label: 'D', text: '18.5%' }
        ],
        correct: 'A',
        explanation: 'Net Profit % = Markup - Discount - (Markup × Discount)/100 = 30 - 15 - (30 × 15)/100 = 15 - 4.5 = 10.5%.'
      },
      {
        id: 'q-top-perc-2',
        num: 2,
        text: 'If the price of sugar increases by 25%, by what percentage must a household reduce its consumption so that total expenditure remains unchanged?',
        options: [
          { label: 'A', text: '25%' },
          { label: 'B', text: '20%' },
          { label: 'C', text: '16.66%' },
          { label: 'D', text: '15%' }
        ],
        correct: 'B',
        explanation: 'Price increases by 25% = +1/4. To maintain constant expenditure (Price × Consumption = Constant), consumption must decrease by 1/(4 + 1) = 1/5 = 20%.'
      },
      {
        id: 'q-top-perc-3',
        num: 3,
        text: 'A dishonest dealer professes to sell his goods at cost price, but he uses a weight of 950 grams for a 1-kg weight. Find his gain percentage.',
        options: [
          { label: 'A', text: '5%' },
          { label: 'B', text: '5 5/19%' },
          { label: 'C', text: '5 15/19%' },
          { label: 'D', text: '6 1/4%' }
        ],
        correct: 'B',
        explanation: 'Profit % = (Error / True Value Dispensed) × 100% = (50 / 950) × 100% = 100 / 19 % = 5 5/19%.'
      },
      {
        id: 'q-top-perc-4',
        num: 4,
        text: 'Two successive discounts of 20% and 5% are equivalent to a single discount of:',
        options: [
          { label: 'A', text: '25%' },
          { label: 'B', text: '24%' },
          { label: 'C', text: '22%' },
          { label: 'D', text: '23.5%' }
        ],
        correct: 'B',
        explanation: 'Single equivalent discount = d1 + d2 - (d1 × d2)/100 = 20 + 5 - (20 × 5)/100 = 25 - 1 = 24%.'
      },
      {
        id: 'q-top-perc-5',
        num: 5,
        text: 'By selling an article for Rs. 640, a person incurs a loss of 20%. At what price should he sell it to gain 15%?',
        options: [
          { label: 'A', text: 'Rs. 840' },
          { label: 'B', text: 'Rs. 920' },
          { label: 'C', text: 'Rs. 900' },
          { label: 'D', text: 'Rs. 960' }
        ],
        correct: 'B',
        explanation: '80% of CP = 640 => CP = 640 / 0.80 = Rs. 800. For 15% profit: SP = 800 × 1.15 = Rs. 920.'
      }
    ];

    const insertQ = db.prepare(`
      INSERT OR REPLACE INTO questions (
        id, test_id, question_number, question_text, question_type,
        options_json, correct_answer, correct_marks, negative_marks, unanswered_marks,
        explanation, parsing_confidence, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'single', ?, ?, 3.0, 1.0, 0.0, ?, 1.0, ?, ?)
    `);

    for (const q of percQuestions) {
      insertQ.run(q.id, testPercId, q.num, q.text, JSON.stringify(q.options), q.correct, q.explanation, now, now);
    }

    // Topic Test 2: Geometry (5 Questions)
    const testGeomId = 'test-topic-cat-geometry';
    insertTest.run(
      testGeomId,
      instituteAdmin.id,
      'CAT Geometry: Circles & Inscribed Triangles Topic Test',
      'Assesses intersecting chords, tangent-secant properties, direct common tangents, and cyclic quadrilateral theorems.',
      'Quantitative Aptitude',
      'sec-mba',
      900,
      'standard',
      3.0,
      1.0,
      0.0,
      0,
      0,
      1,
      1,
      1,
      1,
      'topic_test',
      'exam-cat-2026',
      'subj-cat-qa',
      'topic-cat-geometry',
      'public',
      0,
      0.0,
      now,
      now
    );

    const geomQuestions = [
      {
        id: 'q-top-geom-1',
        num: 1,
        text: 'In a circle with centre O, chords AB and CD intersect at P inside the circle. If AP = 4 cm, PB = 9 cm, and CP = 3 cm, find the length of PD.',
        options: [
          { label: 'A', text: '10 cm' },
          { label: 'B', text: '12 cm' },
          { label: 'C', text: '14 cm' },
          { label: 'D', text: '8 cm' }
        ],
        correct: 'B',
        explanation: 'By Intersecting Chords Theorem: AP × PB = CP × PD => 4 × 9 = 3 × PD => 36 = 3 × PD => PD = 12 cm.'
      },
      {
        id: 'q-top-geom-2',
        num: 2,
        text: 'From an external point P, a tangent PT is drawn to a circle. A secant PAB intersects the circle at A and B. If PT = 6 cm and PA = 4 cm, find the length of chord AB.',
        options: [
          { label: 'A', text: '5 cm' },
          { label: 'B', text: '6 cm' },
          { label: 'C', text: '7 cm' },
          { label: 'D', text: '9 cm' }
        ],
        correct: 'A',
        explanation: 'PT² = PA × PB => 36 = 4 × PB => PB = 9 cm. Chord AB = PB - PA = 9 - 4 = 5 cm.'
      },
      {
        id: 'q-top-geom-3',
        num: 3,
        text: 'The radii of two circles are 9 cm and 4 cm. The distance between their centres is 13 cm. What is the length of the direct common tangent (DCT)?',
        options: [
          { label: 'A', text: '12 cm' },
          { label: 'B', text: '10 cm' },
          { label: 'C', text: '11 cm' },
          { label: 'D', text: '13 cm' }
        ],
        correct: 'A',
        explanation: 'DCT = √(d² - (R - r)²) = √(13² - (9 - 4)²) = √(169 - 25) = √144 = 12 cm.'
      },
      {
        id: 'q-top-geom-4',
        num: 4,
        text: 'In a cyclic quadrilateral ABCD, if ∠A = (2x + 4)° and ∠C = (3x - 14)°, find the value of x.',
        options: [
          { label: 'A', text: '36°' },
          { label: 'B', text: '38°' },
          { label: 'C', text: '40°' },
          { label: 'D', text: '42°' }
        ],
        correct: 'B',
        explanation: 'In a cyclic quadrilateral, opposite angles are supplementary: ∠A + ∠C = 180°. (2x + 4) + (3x - 14) = 180 => 5x - 10 = 180 => 5x = 190 => x = 38°.'
      },
      {
        id: 'q-top-geom-5',
        num: 5,
        text: 'The angle inscribed by a chord in the alternate segment of a circle is 65°. What is the angle between the chord and the tangent at one of its extremities?',
        options: [
          { label: 'A', text: '25°' },
          { label: 'B', text: '65°' },
          { label: 'C', text: '115°' },
          { label: 'D', text: '130°' }
        ],
        correct: 'B',
        explanation: 'By the Alternate Segment Theorem, the angle between a tangent and chord through the point of contact equals the angle subtended by the chord in the alternate segment. Hence, 65°.'
      }
    ];

    for (const q of geomQuestions) {
      insertQ.run(q.id, testGeomId, q.num, q.text, JSON.stringify(q.options), q.correct, q.explanation, now, now);
    }

    // 6. Seed Diverse Test Types for Testing Engine
    // (A) Previous Year Paper
    const pyqTestId = 'test-cat-pyq-2023-s1';
    insertTest.run(
      pyqTestId,
      instituteAdmin.id,
      'CAT 2023 Official Paper (Slot 1 Diagnostic)',
      'Authentic previous year question paper conducted by IIM Lucknow for CAT 2023, featuring exact questions, sectional timers, and scoring.',
      'Management Entrance (CAT)',
      'sec-mba',
      7200,
      'standard',
      3.0,
      1.0,
      0.0,
      0,
      0,
      1,
      1,
      1,
      1,
      'previous_year_paper',
      'exam-cat-2026',
      null,
      null,
      'public',
      0,
      0.0,
      now,
      now
    );

    const pyqQuestions = [
      {
        id: 'q-pyq-1',
        num: 1,
        text: 'If (x + 1/x) = 5, find the value of (x³ + 1/x³).',
        options: [
          { label: 'A', text: '110' },
          { label: 'B', text: '115' },
          { label: 'C', text: '120' },
          { label: 'D', text: '125' }
        ],
        correct: 'A',
        explanation: 'Identity: x³ + 1/x³ = (x + 1/x)³ - 3(x + 1/x) = 5³ - 3(5) = 125 - 15 = 110.'
      },
      {
        id: 'q-pyq-2',
        num: 2,
        text: 'Select the most appropriate synonym of the given word: "CANDID"',
        options: [
          { label: 'A', text: 'Frank' },
          { label: 'B', text: 'Deceitful' },
          { label: 'C', text: 'Arrogant' },
          { label: 'D', text: 'Timid' }
        ],
        correct: 'A',
        explanation: 'Candid means truthful and straightforward; frank.'
      },
      {
        id: 'q-pyq-3',
        num: 3,
        text: 'Who among the following was the founder of the Brahmo Samaj in 1828?',
        options: [
          { label: 'A', text: 'Swami Vivekananda' },
          { label: 'B', text: 'Raja Ram Mohan Roy' },
          { label: 'C', text: 'Dayanand Saraswati' },
          { label: 'D', text: 'Ishwar Chandra Vidyasagar' }
        ],
        correct: 'B',
        explanation: 'Raja Ram Mohan Roy founded Brahmo Sabha in August 1828, later renamed Brahmo Samaj.'
      },
      {
        id: 'q-pyq-4',
        num: 4,
        text: 'Three of the following four letter-clusters are alike in a certain way and one is different. Pick the odd one: PRT, KMO, BDF, HJL',
        options: [
          { label: 'A', text: 'PRT' },
          { label: 'B', text: 'KMO' },
          { label: 'C', text: 'BDF' },
          { label: 'D', text: 'All follow +2 except none' }
        ],
        correct: 'D',
        explanation: 'All groups have a uniform +2 letter gap (P(+2)R(+2)T, K(+2)M(+2)O, B(+2)D(+2)F, H(+2)J(+2)L).'
      }
    ];

    for (const q of pyqQuestions) {
      insertQ.run(q.id, pyqTestId, q.num, q.text, JSON.stringify(q.options), q.correct, q.explanation, now, now);
    }

    // (B) Sectional Drill: Quantitative Aptitude
    const secQuantId = 'test-cat-sec-qa-drill';
    insertTest.run(
      secQuantId,
      instituteAdmin.id,
      'CAT Quantitative Aptitude (QA) Sectional Sprint',
      'Timed 40-minute sectional assessment testing mental calculation speed, percentages, ratios, algebra, and circle theorems.',
      'Quantitative Aptitude',
      'sec-mba',
      2400, // 40 mins
      'standard',
      3.0,
      1.0,
      0.0,
      0,
      0,
      1,
      1,
      1,
      1,
      'sectional_test',
      'exam-cat-2026',
      'subj-cat-qa',
      null,
      'public',
      0,
      0.0,
      now,
      now
    );

    for (let i = 0; i < percQuestions.length; i++) {
      const q = percQuestions[i];
      insertQ.run(`q-sec-quant-${i + 1}`, secQuantId, i + 1, q.text, JSON.stringify(q.options), q.correct, q.explanation, now, now);
    }

    // (C) Mixed Revision Test
    const mixedTestId = 'test-cat-mixed-rev-w2';
    insertTest.run(
      mixedTestId,
      instituteAdmin.id,
      'CAT Sectional Mixed Recall Sprint (QA + VARC)',
      'Interleaved active recall assessment combining arithmetic profit & loss with critical verbal reasoning.',
      'QA & VARC',
      'sec-mba',
      1800, // 30 mins
      'standard',
      3.0,
      1.0,
      0.0,
      0,
      0,
      1,
      1,
      1,
      1,
      'mixed_revision_test',
      'exam-cat-2026',
      null,
      null,
      'public',
      0,
      0.0,
      now,
      now
    );

    const mixedQs = [percQuestions[0], geomQuestions[0], pyqQuestions[0], pyqQuestions[3]];
    for (let i = 0; i < mixedQs.length; i++) {
      const q = mixedQs[i];
      insertQ.run(`q-mix-${i + 1}`, mixedTestId, i + 1, q.text, JSON.stringify(q.options), q.correct, q.explanation, now, now);
    }

    // (D) Subject Test: English Language / VARC
    const subjEngId = 'test-cat-subj-varc';
    insertTest.run(
      subjEngId,
      instituteAdmin.id,
      'CAT Verbal Ability & Reading Comprehension Diagnostic Paper',
      'Comprehensive sectional evaluating error spotting, correlative conjunctions, sentence improvement, idioms, and cloze passage logic.',
      'Verbal Ability & Reading Comprehension',
      'sec-mba',
      2400, // 40 mins
      'standard',
      3.0,
      1.0,
      0.0,
      0,
      0,
      1,
      1,
      1,
      1,
      'subject_test',
      'exam-cat-2026',
      'subj-cat-varc',
      null,
      'public',
      0,
      0.0,
      now,
      now
    );

    const engQuestions = [
      {
        id: 'q-eng-1',
        num: 1,
        text: 'Select the sentence with the correct usage of correlative conjunctions:',
        options: [
          { label: 'A', text: 'Neither he nor his friends was interested.' },
          { label: 'B', text: 'Neither he nor his friends were interested.' },
          { label: 'C', text: 'Neither he or his friends were interested.' },
          { label: 'D', text: 'Neither he nor his friends are not interested.' }
        ],
        correct: 'B',
        explanation: 'In "neither... nor", the verb agrees with the closer subject ("his friends" = plural => were).'
      },
      {
        id: 'q-eng-2',
        num: 2,
        text: 'Identify the idiom meaning "to face a crisis with fortitude":',
        options: [
          { label: 'A', text: 'Bite the bullet' },
          { label: 'B', text: 'Burn bridges' },
          { label: 'C', text: 'Cry wolf' },
          { label: 'D', text: 'Spill the beans' }
        ],
        correct: 'A',
        explanation: 'To bite the bullet means to endure a painful or difficult situation with courage.'
      }
    ];

    for (const q of engQuestions) {
      insertQ.run(q.id, subjEngId, q.num, q.text, JSON.stringify(q.options), q.correct, q.explanation, now, now);
    }

    // (E) Educator Test
    insertTest.run(
      'test-cat-faculty-marathon',
      instituteAdmin.id,
      'Faculty Special: CAT Advanced Quant & Caselet Marathon',
      'Curated by Senior Faculty: Handpicked advanced CAT questions testing non-obvious shortcut theorems.',
      'Quantitative Aptitude',
      'sec-mba',
      2400,
      'standard',
      3.0,
      1.0,
      0.0,
      0,
      0,
      1,
      1,
      1,
      1,
      'educator_test',
      'exam-cat-2026',
      'subj-cat-qa',
      null,
      'public',
      0,
      0.0,
      now,
      now
    );

    // (F) Community Test
    insertTest.run(
      'test-cat-community-challenge',
      instituteAdmin.id,
      'CAT Aspirants National Peer Challenge Mock',
      'Community crowdsourced full-length mock paper curated and peer-reviewed by 99th percentile CAT aspirants.',
      'Management Entrance (CAT)',
      'sec-mba',
      7200,
      'standard',
      3.0,
      1.0,
      0.0,
      0,
      0,
      1,
      1,
      1,
      1,
      'community_test',
      'exam-cat-2026',
      null,
      null,
      'public',
      0,
      0.0,
      now,
      now
    );

  } catch (err) {
    console.warn('[Seed Learning System Error]:', err);
  }
}
