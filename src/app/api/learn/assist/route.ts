import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic_id, action, custom_query } = body;

    const db = getDb();
    const topicNode = db.prepare(`
      SELECT n.*, s.name as subject_name
      FROM syllabus_nodes n
      JOIN subjects s ON s.id = n.subject_id
      WHERE n.id = ?
    `).get(topic_id) as any;

    const topicTitle = topicNode?.title || 'This Topic';

    // Topic-specific pedagogical intelligence repository
    if (topic_id === 'topic-cgl-percentages') {
      if (action === 'simplify_explanation') {
        return NextResponse.json({
          success: true,
          title: 'Intuitive Concept Simplification',
          content: `Think of percentages as **money multipliers**.
- A 25% discount doesn't mean subtracting numbers manually; it means you only pay **75% (or 3/4)** of the original price.
- If a shopkeeper marks an item up by 25% (multiplier = 5/4) and later offers a 20% discount (multiplier = 4/5), multiply them together: \`(5/4) × (4/5) = 1.0\`.
- This proves in 2 seconds that your net profit is exactly 0%! Always multiply reciprocal fractions rather than calculating percentages on scratch paper.`
        });
      }

      if (action === 'alternate_example') {
        return NextResponse.json({
          success: true,
          title: 'Alternate Worked Example: Fuel & Expenditure Trap',
          content: `**Problem**: The price of diesel surges by 33.33% (1/3). By what fraction must a logistics fleet reduce consumption so total expenditure remains constant?

**Cognitive Shortcut**:
1. Price multiplier is \`1 + 1/3 = 4/3\`.
2. Since \`Price × Consumption = Constant\`, the consumption multiplier must be the exact inverse: \`3/4\`.
3. To drop from 1 to 3/4, consumption must reduce by \`1 - 3/4 = 1/4 = 25%\`.
4. **General Law**: An increase of \`+1/n\` requires a decrease of \`-1/(n+1)\` to maintain equilibrium.`
        });
      }

      if (action === 'examiner_trap') {
        return NextResponse.json({
          success: true,
          title: "Examiner's Cognitive Trap: Base Shift Confusion",
          content: `**The Classic CAT Trap**:
"A's income is 40% higher than B. By what percentage is B's income lower than A?"

**The 5-second mistake**: Aspirants reflexively answer 40%.
**The Reality**:
- B = 100 => A = 140.
- Difference = 40.
- But the base is now **A (140)**!
- \`Percentage = (40 / 140) × 100 = 2/7 = 28.57%\`.
- **Golden Rule**: Look at the word following 'THAN'. That entity is ALWAYS your denominator.`
        });
      }

      if (action === 'quick_practice') {
        return NextResponse.json({
          success: true,
          title: '1-Minute Retrieval Check',
          content: `**Question**: A trader gives a discount of 10% on Marked Price and earns 26% profit. What is the ratio of Marked Price to Cost Price?

**Quick Mental Clue**:
\`MP/CP = (100 + 26) / (100 - 10) = 126 / 90\`
Divide both by 18:
\`126 / 90 = 7 / 5\`.
**Result**: Ratio is **7 : 5**.`
        });
      }
    }

    if (topic_id === 'topic-cgl-geometry') {
      if (action === 'simplify_explanation') {
        return NextResponse.json({
          success: true,
          title: 'Intuitive Circle Geometry',
          content: `Circles are fundamentally about **power of a point**:
Whenever lines pass through a point $P$ and cut a circle, the product of segments from $P$ to the circle is always constant!
- If chords cross inside: \`AP × PB = CP × PD\`.
- If secants meet outside: \`PA × PB = PC × PD\`.
- If one line is a tangent touching at $T$: \`PT² = PA × PB\`.
You only need this single unified relationship to solve 80% of CAT and XAT circle questions.`
        });
      }

      if (action === 'examiner_trap') {
        return NextResponse.json({
          success: true,
          title: "Examiner's Tangent-Secant Trap",
          content: `In the theorem \`PT² = PA × PB\`:
- \`PA\` is the segment outside the circle.
- \`PB\` is the **WHOLE secant from P to the far point B**!
- Aspirants constantly make the mistake of plugging in chord \`AB\` instead of \`PB\`.
- Remember: \`PB = PA + AB\`.`
        });
      }
    }

    // Default pedagogical assistance response for other topics
    const genericAnswers: Record<string, { title: string; content: string }> = {
      simplify_explanation: {
        title: `Core Intuition: ${topicTitle}`,
        content: `Break **${topicTitle}** into its primary building blocks:
1. Identify the core variable or relationship being tested.
2. Translate the textual problem into an equation or structural diagram.
3. Use dimensional estimation to eliminate 2 out of 4 multiple-choice options before calculating.`
      },
      alternate_example: {
        title: `Step-by-Step Demonstration: ${topicTitle}`,
        content: `**Pedagogical Model**:
- **Step 1 (Inspection)**: Identify given parameters and constraints.
- **Step 2 (Elimination)**: Notice impossible bounds based on physical/logical constraints.
- **Step 3 (Target Calculation)**: Apply standard formula with minimal scratch work.`
      },
      examiner_trap: {
        title: `Examiner Traps to Avoid: ${topicTitle}`,
        content: `In **${topicTitle}**, IIM convening panels and premier MBA examiners frequently include:
1. **Misdirection by Irrelevant Numbers**: Extra statistics given to distract from core formula.
2. **Unit Mismatches**: e.g., mixing km/h with meters, or years with months.
3. **Double Negation**: Questions asking 'Which of the following is NOT true?'`
      },
      quick_practice: {
        title: `Active Recall Drill: ${topicTitle}`,
        content: `Recall check for **${topicTitle}**:
Review your formula notes, test yourself without looking at the reference sheet, and take the Topic Mastery Assessment at the bottom of this page.`
      }
    };

    const selected = genericAnswers[action] || {
      title: `Guidance on ${topicTitle}`,
      content: `Focus on mastering the worked examples and common mistakes listed on this page. Once confident, validate your understanding with the Topic Assessment.`
    };

    return NextResponse.json({
      success: true,
      title: selected.title,
      content: selected.content,
    });
  } catch (error: any) {
    console.error('API /api/learn/assist error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
