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

    // Subtopics for Percentages (topic-cgl-percentages)
    insertSubtopic.run(
      'subtopic-cgl-perc-1',
      'subj-cgl-quant',
      'topic-cgl-percentages',
      'Reciprocal Fractions & Multiplication Factors',
      'MATH-102.1',
      1,
      3.0,
      2.5,
      'Direct fraction-to-percentage mental conversions (1/1 to 1/20) and multiplier representations.',
      'easy',
      now
    );
    insertSubtopic.run(
      'subtopic-cgl-perc-2',
      'subj-cgl-quant',
      'topic-cgl-percentages',
      'Successive Percentage Shifts & Compound Pricing',
      'MATH-102.2',
      2,
      4.0,
      3.0,
      'Two-stage and three-stage successive net change formula, area change on geometry, and salary increments.',
      'medium',
      now
    );
    insertSubtopic.run(
      'subtopic-cgl-perc-3',
      'subj-cgl-quant',
      'topic-cgl-percentages',
      'Marked Price, Discount & The Golden Ratio (MP/CP)',
      'MATH-102.3',
      3,
      5.0,
      3.5,
      'Master formula MP/CP = (100 + P%)/(100 - D%) and multi-tiered discount schemes (Buy X Get Y Free).',
      'hard',
      now
    );
    insertSubtopic.run(
      'subtopic-cgl-perc-4',
      'subj-cgl-quant',
      'topic-cgl-percentages',
      'Dishonest Merchants & Faulty Weighing Scales',
      'MATH-102.4',
      4,
      4.0,
      2.5,
      'Effective profit percentage under false gram weights, false meter rods, and cost price markups.',
      'hard',
      now
    );

    // Subtopics for Number Systems (topic-cgl-number-systems)
    insertSubtopic.run(
      'subtopic-cgl-num-1',
      'subj-cgl-quant',
      'topic-cgl-number-systems',
      'Composite Divisibility Rules (72, 88, 99)',
      'MATH-101.1',
      1,
      3.5,
      2.0,
      'Testing coprime factors (8 and 9, 8 and 11, 9 and 11) for 8-digit and 10-digit number puzzles.',
      'easy',
      now
    );
    insertSubtopic.run(
      'subtopic-cgl-num-2',
      'subj-cgl-quant',
      'topic-cgl-number-systems',
      'Power Cyclicity, Unit Digits & Trailing Zeros',
      'MATH-101.2',
      2,
      3.5,
      2.0,
      'Cycle of 4 for powers (2, 3, 7, 8), cycle of 2 for (4, 9), and Legendre formula for number of trailing zeros.',
      'medium',
      now
    );
    insertSubtopic.run(
      'subtopic-cgl-num-3',
      'subj-cgl-quant',
      'topic-cgl-number-systems',
      'Euler Totient, Fermat & Binomial Remainders',
      'MATH-101.3',
      3,
      5.0,
      2.0,
      'Solving complex remainder questions using Wilson theorem, Fermat little theorem, and negative remainders.',
      'hard',
      now
    );

    // Subtopics for Geometry (topic-cgl-geometry)
    insertSubtopic.run(
      'subtopic-cgl-geom-1',
      'subj-cgl-quant',
      'topic-cgl-geometry',
      'Internal & External Intersecting Chords',
      'MATH-105.1',
      1,
      6.0,
      3.5,
      'AP × PB = CP × PD for internal and external chord intersections, and common chord length theorems.',
      'medium',
      now
    );
    insertSubtopic.run(
      'subtopic-cgl-geom-2',
      'subj-cgl-quant',
      'topic-cgl-geometry',
      'Tangent-Secant Theorem & Power of Point',
      'MATH-105.2',
      2,
      6.0,
      3.5,
      'PT² = PA × PB, direct common tangents (DCT) and transverse common tangents (TCT) distance formulas.',
      'hard',
      now
    );
    insertSubtopic.run(
      'subtopic-cgl-geom-3',
      'subj-cgl-quant',
      'topic-cgl-geometry',
      'Cyclic Quadrilaterals & Ptolemy Theorem',
      'MATH-105.3',
      3,
      6.0,
      3.0,
      'Opposite angles supplementary, exterior angle equal to interior opposite, and AC × BD = AB × CD + BC × AD.',
      'hard',
      now
    );

    // Subtopics for Error Spotting (topic-cgl-grammar-errors)
    insertSubtopic.run(
      'subtopic-cgl-eng-1',
      'subj-cgl-english',
      'topic-cgl-grammar-errors',
      'Subject-Verb Concord & Proximity Principles',
      'ENG-101.1',
      1,
      5.0,
      3.0,
      'Rules for collective nouns, expressions of quantity, accompanied by, together with, as well as.',
      'medium',
      now
    );
    insertSubtopic.run(
      'subtopic-cgl-eng-2',
      'subj-cgl-english',
      'topic-cgl-grammar-errors',
      'Correlative Conjunctions & Parallelism',
      'ENG-101.2',
      2,
      5.0,
      2.5,
      'Neither...nor, Either...or, Not only...but also, and grammatical parallel balance rules.',
      'medium',
      now
    );

    // Subtopics for Indian Polity (topic-cgl-polity)
    insertSubtopic.run(
      'subtopic-cgl-pol-1',
      'subj-cgl-ga',
      'topic-cgl-polity',
      'Fundamental Rights (Articles 12-35)',
      'GA-101.1',
      1,
      7.0,
      3.5,
      'Right to Equality (14-18), Freedom (19-22), Exploitation (23-24), Religion (25-28), and Constitutional Remedies (32).',
      'medium',
      now
    );
    insertSubtopic.run(
      'subtopic-cgl-pol-2',
      'subj-cgl-ga',
      'topic-cgl-polity',
      'Constitutional Prerogative Writs (Article 32 & 226)',
      'GA-101.2',
      2,
      5.0,
      2.5,
      'Habeas Corpus, Mandamus, Prohibition, Certiorari, and Quo-Warranto scopes and applicability.',
      'hard',
      now
    );

    // 2. Set Difficulty Levels on Main Topics
    const updateDifficulty = db.prepare('UPDATE syllabus_nodes SET difficulty = ? WHERE id = ?');
    updateDifficulty.run('easy', 'topic-cgl-number-systems');
    updateDifficulty.run('medium', 'topic-cgl-percentages');
    updateDifficulty.run('medium', 'topic-cgl-ratio-proportions');
    updateDifficulty.run('hard', 'topic-cgl-algebra');
    updateDifficulty.run('hard', 'topic-cgl-geometry');
    updateDifficulty.run('easy', 'topic-cgl-analogies');
    updateDifficulty.run('medium', 'topic-cgl-syllogisms');
    updateDifficulty.run('easy', 'topic-cgl-coding');
    updateDifficulty.run('medium', 'topic-cgl-grammar-errors');
    updateDifficulty.run('medium', 'topic-cgl-comprehension');
    updateDifficulty.run('hard', 'topic-cgl-vocab');
    updateDifficulty.run('medium', 'topic-cgl-polity');
    updateDifficulty.run('medium', 'topic-cgl-history');
    updateDifficulty.run('easy', 'topic-cgl-science');

    // 3. Spaced Repetition Scheduling on Demo Student Progress
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
    const twoDaysAhead = new Date(Date.now() + 172800000).toISOString();
    const fourDaysAhead = new Date(Date.now() + 345600000).toISOString();
    const today = new Date().toISOString();

    const updateSpacedRepetition = db.prepare(`
      UPDATE user_topic_progress
      SET next_revision_date = ?, repetition_interval_days = ?, repetition_count = ?, is_bookmarked = ?
      WHERE user_id = ? AND topic_id = ?
    `);

    // Polity has revision overdue!
    updateSpacedRepetition.run(oneDayAgo, 3, 2, 1, student.id, 'topic-cgl-polity');
    // Geometry has revision due today!
    updateSpacedRepetition.run(today, 2, 1, 1, student.id, 'topic-cgl-geometry');
    // Percentages has revision scheduled in 2 days
    updateSpacedRepetition.run(twoDaysAhead, 3, 3, 0, student.id, 'topic-cgl-percentages');
    // Number systems has revision scheduled in 4 days (up to date)
    updateSpacedRepetition.run(fourDaysAhead, 7, 4, 0, student.id, 'topic-cgl-number-systems');

    // 4. Seed Authentic Topic Contents in topic_contents
    const insertTopicContent = db.prepare(`
      INSERT OR REPLACE INTO topic_contents (topic_id, content_json, updated_at)
      VALUES (?, ?, ?)
    `);

    // Topic Content: Percentages, Profit, Loss & Discount
    const percentagesContent: TopicContent = {
      topic_id: 'topic-cgl-percentages',
      topic_title: 'Percentages, Profit, Loss & Discount',
      subject_name: 'Quantitative Aptitude',
      estimated_read_minutes: 35,
      learning_objectives: [
        'Master the 20 fundamental reciprocal fraction multipliers for lightning-fast mental math.',
        'Compute multi-tier successive percentage shifts using the compound variation formula: x + y + (xy/100).',
        'Directly solve marked price and profit problems using the golden proportionality equation: MP/CP = (100 + P%)/(100 - D%).',
        'Deconstruct dishonest trader manipulation traps involving false gram weights and marked up retail prices.'
      ],
      prerequisites: [
        { id: 'topic-cgl-number-systems', title: 'Number Systems & Divisibility', is_completed: true }
      ],
      overview: 'Percentages represent the operational foundation of SSC CGL Quantitative Aptitude. In Tier-I and Tier-II, over 12-15% of all arithmetic questions directly or indirectly utilize percentage multipliers, successive shifts, and cost-marked-price ratios. Developing intuition for fractional multipliers eliminates paper calculations, reducing solving time from 90 seconds to under 25 seconds per question.',
      key_concepts: [
        {
          id: 'c1',
          title: 'Reciprocal Fractional Multipliers',
          definition: 'Every percentage increase or decrease can be expressed as a single fraction multiplier (1 ± x/100). If a quantity increases by 1/n, to return to the original value it must decrease by 1/(n + 1).',
          formula: 'Original Value × (1 ± r/100) = Final Value; Shift: +1/n ↔ -1/(n + 1)',
          importance: 'core'
        },
        {
          id: 'c2',
          title: 'Successive Percentage Shift Formula',
          definition: 'When a value is altered by a% and the resulting value is further altered by b%, the combined effective percentage change is given by the algebraic sum accounting for signs.',
          formula: 'Net Change % = a + b + (a × b) / 100',
          importance: 'high_yield'
        },
        {
          id: 'c3',
          title: 'Golden Equation of Marked Price and Cost Price',
          definition: 'When an article is marked up and sold with a discount d% yielding a profit p%, Cost Price (CP) and Marked Price (MP) exist in a fixed structural ratio independent of the selling price.',
          formula: 'MP / CP = (100 + Profit %) / (100 - Discount %)',
          importance: 'core'
        },
        {
          id: 'c4',
          title: 'Dishonest Merchant Faulty Weight Formula',
          definition: 'When a merchant claims to sell at cost price but uses a weight of g grams instead of the promised 1000 grams, the true profit percentage is governed solely by the actual goods dispensed.',
          formula: 'Profit % = [(True Weight - False Weight) / False Weight] × 100%',
          importance: 'high_yield'
        }
      ],
      tables: [
        {
          title: 'Essential Reciprocal Fraction to Percentage Matrix',
          headers: ['Fraction', 'Percentage Value', 'Fraction', 'Percentage Value'],
          rows: [
            ['1/2', '50.00%', '1/7', '14.28% (14 2/7%)'],
            ['1/3', '33.33% (33 1/3%)', '1/8', '12.50% (12 1/2%)'],
            ['1/4', '25.00%', '1/9', '11.11% (11 1/9%)'],
            ['1/5', '20.00%', '1/11', '9.09% (9 1/11%)'],
            ['1/6', '16.66% (16 2/3%)', '1/12', '8.33% (8 1/3%)'],
            ['1/13', '7.69%', '1/16', '6.25% (6 1/4%)']
          ],
          caption: 'Memorize these values cold: TCS tests frequently use 14 2/7% or 11 1/9% to slow down candidates relying on decimal arithmetic.'
        }
      ],
      worked_examples: [
        {
          id: 'ex1',
          title: 'Successive Percentage Increase & Decrease on Area',
          problem_statement: 'The length of a rectangle is increased by 25% while its breadth is decreased by 20%. What is the net percentage change in its area?',
          examiner_angle: 'Candidates often attempt to assume values like l = 100, b = 100, which takes 40+ seconds. The expert method uses successive shifts or direct fraction multiplication.',
          steps: [
            {
              step_number: 1,
              explanation: 'Express each dimension as a fractional multiplier:',
              equation: 'Length Multiplier = 1 + 1/4 = 5/4; Breadth Multiplier = 1 - 1/5 = 4/5'
            },
            {
              step_number: 2,
              explanation: 'Multiply the factors to obtain the Area factor:',
              equation: 'New Area = (5/4) × (4/5) × Original Area = 1 × Original Area'
            },
            {
              step_number: 3,
              explanation: 'Alternatively apply formula: Net % = 25 - 20 + (25 × (-20))/100 = 5 - 5 = 0%.'
            }
          ],
          final_answer: 'Net change in area is 0% (Area remains unchanged).',
          pro_tip: 'Whenever a% increase is followed by b% decrease such that b = a / (100 + a) * 100, the net change is always 0.'
        },
        {
          id: 'ex2',
          title: 'Marked Price Ratio Application (SSC CGL 2023 Tier-I)',
          problem_statement: 'A shopkeeper allows a discount of 15% on the marked price of a wrist watch and still makes a profit of 19%. If the cost price is Rs. 1,700, determine the marked price.',
          examiner_angle: 'Standard textbook approaches calculate SP first, then backtrack to MP. Using the Golden Ratio skips 2 arithmetic operations.',
          steps: [
            {
              step_number: 1,
              explanation: 'Set up the Golden Ratio between MP and CP:',
              equation: 'MP / CP = (100 + P%) / (100 - D%) = (100 + 19) / (100 - 15) = 119 / 85'
            },
            {
              step_number: 2,
              explanation: 'Simplify the fraction by dividing numerator and denominator by 17:',
              equation: '119 / 85 = 7 / 5'
            },
            {
              step_number: 3,
              explanation: 'Given CP corresponds to 5 units = Rs. 1,700, compute 1 unit and 7 units:',
              equation: '1 unit = 1700 / 5 = 340 => MP = 7 × 340 = Rs. 2,380'
            }
          ],
          final_answer: 'Marked Price is Rs. 2,380.',
          pro_tip: 'Always look for common multiples of 17, 19, or 23 in SSC question papers. Here 119 and 85 immediately signal cancellation by 17.'
        },
        {
          id: 'ex3',
          title: 'Compound Dishonest Merchant Problem',
          problem_statement: 'A cloth merchant marks his goods 20% above the cost price and allows a discount of 10%. Furthermore, he uses a false meter scale that measures only 90 cm instead of 100 cm. What is his total percentage profit?',
          examiner_angle: 'This question tests multi-layer compounding: pricing multiplier combined with measurement deception multiplier.',
          steps: [
            {
              step_number: 1,
              explanation: 'Calculate the pricing multiplier after markup and discount:',
              equation: 'Pricing Multiplier = (1 + 0.20) × (1 - 0.10) = 1.20 × 0.90 = 1.08'
            },
            {
              step_number: 2,
              explanation: 'Calculate the measurement scale multiplier (customer pays for 100 cm, gets 90 cm):',
              equation: 'Scale Multiplier = 100 / 90 = 10 / 9'
            },
            {
              step_number: 3,
              explanation: 'Multiply both factors to determine total effective revenue factor:',
              equation: 'Net Factor = 1.08 × (10 / 9) = (108 / 100) × (10 / 9) = 12 / 10 = 1.20'
            }
          ],
          final_answer: 'Total effective profit is 20%.',
          pro_tip: 'Multiply all independent transaction ratios: Net Multiplier = (SP/CP) × (True Measure / Dispensed Measure).'
        }
      ],
      common_mistakes: [
        {
          id: 'm1',
          mistake_title: 'The Reversible Percentage Fallacy',
          error_trap: 'Assuming that if salary A is 25% greater than B, salary B must be 25% less than A.',
          correct_approach: 'The base changes from B to A! If A is 25% (1/4) greater than B, then B is 1/(4 + 1) = 1/5 = 20% less than A.',
          prevention_rule: 'Always identify the denominator base: "Percentage comparison is always calculated with respect to the word following THAN or OF".'
        },
        {
          id: 'm2',
          mistake_title: 'Discount Applied to Cost Price',
          error_trap: 'Subtracting the discount percentage directly from the cost price or adding profit to marked price.',
          correct_approach: 'Discount is ALWAYS applied to the Marked Price (MP). Profit or Loss is ALWAYS computed on Cost Price (CP).',
          prevention_rule: 'Never calculate discount on CP unless the problem explicitly states so.'
        },
        {
          id: 'm3',
          mistake_title: 'Additive Successive Discounts',
          error_trap: 'Thinking two successive discounts of 20% and 10% equal a 30% single discount.',
          correct_approach: 'Net discount = 20 + 10 - (20 × 10)/100 = 30 - 2 = 28%.',
          prevention_rule: 'Two successive discounts are always strictly LESS than their arithmetic sum.'
        }
      ],
      pyq_references: [
        {
          id: 'pyq1',
          exam: 'SSC CGL',
          year: 2023,
          tier_or_stage: 'Tier-I (Shift 2)',
          frequency_rating: 'very_high',
          question_summary: 'Successive discount of 15%, 20%, and 25% on an article marked at Rs. 4,800. Net selling price computation.'
        },
        {
          id: 'pyq2',
          exam: 'SSC CGL',
          year: 2022,
          tier_or_stage: 'Tier-II Mains',
          frequency_rating: 'high',
          question_summary: 'Dishonest milkman mixing water to 20% volume and selling at 10% premium over cost price.'
        },
        {
          id: 'pyq3',
          exam: 'SSC CGL',
          year: 2021,
          tier_or_stage: 'Tier-I',
          frequency_rating: 'very_high',
          question_summary: 'Golden ratio MP/CP question with 28% profit and 16% discount.'
        }
      ],
      active_recall_checks: [
        {
          id: 'ar1',
          question: 'An item is marked 50% above its cost price. What maximum percentage discount can be offered such that the retailer makes neither a profit nor a loss?',
          options: ['50%', '33.33%', '25%', '40%'],
          correct_answer: '33.33%',
          explanation: 'CP = 100, MP = 150. To sell at break-even (SP = 100), discount needed = 50. Discount % = (50 / 150) × 100 = 1/3 = 33.33%.',
          recall_hint: 'Recall the +1/n to -1/(n+1) rule: a 50% markup (+1/2) requires a 1/3 discount to return to base.'
        },
        {
          id: 'ar2',
          question: 'If the radius of a sphere is increased by 10%, by what percentage does its surface area increase?',
          options: ['10%', '20%', '21%', '33.1%'],
          correct_answer: '21%',
          explanation: 'Surface Area of sphere = 4πr². Since Area depends on r², apply successive formula with a = 10, b = 10: 10 + 10 + (10 × 10)/100 = 21%.',
          recall_hint: 'For two-dimensional area scaling, compound the linear percentage shift twice.'
        }
      ],
      recap_points: [
        'Master fractions 1/2 through 1/20 to eliminate decimal calculations.',
        'Successive changes: Net % = a + b + ab/100 (maintain algebraic signs).',
        'Golden formula for Marked Price: MP/CP = (100 + P%)/(100 - D%).',
        'Dishonest seller profit: Profit % = (Error / Disbursed Weight) × 100%.',
        'Take the Topic Assessment below to calibrate your mastery score.'
      ],
      recommended_sectional_test: {
        id: 'test-ssc-cgl-tier1-mock1',
        title: 'SSC CGL Quantitative Aptitude Tier-I Diagnostic Mock',
        duration_minutes: 60
      }
    };

    // Topic Content: Circles, Chords & Geometry
    const geometryContent: TopicContent = {
      topic_id: 'topic-cgl-geometry',
      topic_title: 'Triangles, Circles & Coordinate Geometry',
      subject_name: 'Quantitative Aptitude',
      estimated_read_minutes: 40,
      learning_objectives: [
        'Apply the Intersecting Chords Theorem for internal and external intersections with zero algebraic ambiguity.',
        'Compute lengths of Direct Common Tangents (DCT) and Transverse Common Tangents (TCT).',
        'Master the Tangent-Secant Theorem (PT² = PA × PB) for rapid circle segment solutions.',
        'Leverage cyclic quadrilateral properties and opposite supplementary angles in Tier-II multi-step problems.'
      ],
      prerequisites: [
        { id: 'topic-cgl-algebra', title: 'Elementary Algebra & Identities', is_completed: true }
      ],
      overview: 'Geometry is the highest-weightage advanced mathematics component of SSC CGL, carrying 16-20 marks in Tier-I and Tier-II combined. Circle theorems form the core of geometry questions. The key to cracking circle questions under 45 seconds is identifying power-of-a-point configurations immediately without drawing redundant auxiliary lines.',
      key_concepts: [
        {
          id: 'g1',
          title: 'Intersecting Chords Theorem (Internal & External)',
          definition: 'If two chords AB and CD intersect at a point P (either inside or outside the circle), the products of their segments are always identical.',
          formula: 'AP × PB = CP × PD',
          importance: 'core'
        },
        {
          id: 'g2',
          title: 'Tangent-Secant Theorem (Power of a Point)',
          definition: 'If a tangent PT from external point P touches circle at T, and a secant from P intersects circle at A and B, then PT squared equals product of secant segments.',
          formula: 'PT² = PA × PB',
          importance: 'core'
        },
        {
          id: 'g3',
          title: 'Direct and Transverse Common Tangent Formulas',
          definition: 'For two circles with radii R and r separated by center distance d, the lengths of external (direct) and internal (transverse) tangents follow the Pythagorean differences.',
          formula: 'DCT = √(d² - (R - r)²); TCT = √(d² - (R + r)²)',
          importance: 'high_yield'
        },
        {
          id: 'g4',
          title: 'Angle in an Alternate Segment Theorem',
          definition: 'The angle between a tangent and a chord through the point of contact equals the angle inscribed by that chord in the alternate circular segment.',
          formula: '∠BAT = ∠BCA (where AT is tangent at A and C is in alternate segment)',
          importance: 'high_yield'
        }
      ],
      worked_examples: [
        {
          id: 'gex1',
          title: 'Internal Intersecting Chords (SSC CGL 2022 Tier-II)',
          problem_statement: 'Two chords AB and CD of a circle intersect internally at P. If AP = 12 cm, AB = 16 cm, and CP = 8 cm, calculate the length of CD.',
          examiner_angle: 'The trap here is confusing PB with AB. The theorem requires the segment PB, not the full chord length AB.',
          steps: [
            {
              step_number: 1,
              explanation: 'Calculate segment PB from chord AB:',
              equation: 'PB = AB - AP = 16 - 12 = 4 cm'
            },
            {
              step_number: 2,
              explanation: 'Apply the intersecting chords theorem:',
              equation: 'AP × PB = CP × PD => 12 × 4 = 8 × PD => 48 = 8 × PD => PD = 6 cm'
            },
            {
              step_number: 3,
              explanation: 'Calculate full chord CD = CP + PD:',
              equation: 'CD = 8 + 6 = 14 cm'
            }
          ],
          final_answer: 'Length of chord CD is 14 cm.',
          pro_tip: 'Always double check whether the question asks for the segment PD or the full chord length CD.'
        }
      ],
      common_mistakes: [
        {
          id: 'gm1',
          mistake_title: 'Full Secant vs External Segment Slip',
          error_trap: 'In PT² = PA × PB, using the interior chord segment AB instead of the full secant PB.',
          correct_approach: 'PA is the external segment; PB is the entire secant length from external point P to the far circle boundary.',
          prevention_rule: 'Write: PT² = External Segment × Total Secant Length.'
        }
      ],
      pyq_references: [
        {
          id: 'gpyq1',
          exam: 'SSC CGL',
          year: 2023,
          tier_or_stage: 'Tier-I',
          frequency_rating: 'very_high',
          question_summary: 'Length of direct common tangent given radii 8 cm and 3 cm with centers 13 cm apart.'
        }
      ],
      active_recall_checks: [
        {
          id: 'gar1',
          question: 'From an exterior point P, a tangent PT of length 12 cm is drawn to a circle. A secant PAB passes through the center. If PA = 8 cm, what is the length of chord AB?',
          options: ['10 cm', '12 cm', '18 cm', '8 cm'],
          correct_answer: '10 cm',
          explanation: 'PT² = PA × PB => 144 = 8 × PB => PB = 18 cm. Chord AB = PB - PA = 18 - 8 = 10 cm.',
          recall_hint: 'PT² = PA × PB gives the full secant PB. Subtract PA to find chord AB.'
        }
      ],
      recap_points: [
        'Internal & External Chords: AP × PB = CP × PD.',
        'Tangent-Secant: PT² = PA × PB.',
        'DCT uses (R - r)²; TCT uses (R + r)²',
        'Opposite angles in cyclic quadrilateral sum to 180°.'
      ],
      recommended_sectional_test: {
        id: 'test-ssc-cgl-tier1-mock1',
        title: 'SSC CGL Quantitative Aptitude Tier-I Diagnostic Mock',
        duration_minutes: 60
      }
    };

    insertTopicContent.run('topic-cgl-percentages', JSON.stringify(percentagesContent), now);
    insertTopicContent.run('topic-cgl-geometry', JSON.stringify(geometryContent), now);

    // 5. Seed Dedicated Topic Tests and Questions
    const insertTest = db.prepare(`
      INSERT OR REPLACE INTO tests (
        id, user_id, title, description, subject, section_id, duration_seconds,
        marking_scheme_type, default_correct_marks, default_negative_marks, default_unanswered_marks,
        shuffle_questions, shuffle_options, allow_navigation, show_palette, allow_review_marking, show_immediate_results,
        test_type, exam_id, subject_id, topic_id, visibility, is_paid, price_inr, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Topic Test 1: Percentages (5 Questions)
    const testPercId = 'test-topic-cgl-percentages';
    insertTest.run(
      testPercId,
      instituteAdmin.id,
      'Topic Mastery Assessment: Percentages, Profit, Loss & Discount',
      'High-yield 5-question TCS-pattern topic test assessing successive percentage shifts, marked price formulas, and false weight traps.',
      'Quantitative Aptitude',
      'sec-ssc',
      600, // 10 minutes
      'standard',
      2.0,
      0.5,
      0.0,
      0,
      0,
      1,
      1,
      1,
      1,
      'topic_test',
      'exam-ssc-cgl-2026',
      'subj-cgl-quant',
      'topic-cgl-percentages',
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
      ) VALUES (?, ?, ?, ?, 'single', ?, ?, 2.0, 0.5, 0.0, ?, 1.0, ?, ?)
    `);

    for (const q of percQuestions) {
      insertQ.run(q.id, testPercId, q.num, q.text, JSON.stringify(q.options), q.correct, q.explanation, now, now);
    }

    // Topic Test 2: Geometry (5 Questions)
    const testGeomId = 'test-topic-cgl-geometry';
    insertTest.run(
      testGeomId,
      instituteAdmin.id,
      'Topic Mastery Assessment: Circles & Geometry Theorems',
      'Assesses intersecting chords, tangent-secant properties, direct common tangents, and cyclic quadrilateral theorems.',
      'Quantitative Aptitude',
      'sec-ssc',
      600,
      'standard',
      2.0,
      0.5,
      0.0,
      0,
      0,
      1,
      1,
      1,
      1,
      'topic_test',
      'exam-ssc-cgl-2026',
      'subj-cgl-quant',
      'topic-cgl-geometry',
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

  } catch (err) {
    console.warn('[Seed Learning System Error]:', err);
  }
}
