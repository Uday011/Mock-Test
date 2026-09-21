'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronRight,
  RotateCcw,
  Check,
  AlertCircle,
  Lightbulb,
  Eraser,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DailyWarmupModalsProps {
  activeModal: 'read' | 'think' | 'calculate' | null;
  onClose: () => void;
  onCompleteActivity: (activity: 'read' | 'think' | 'calculate') => void;
}

// 9x9 Sudoku: Classic solvable layout
const SUDOKU_GIVEN = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const SUDOKU_SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

export function DailyWarmupModals({
  activeModal,
  onClose,
  onCompleteActivity,
}: DailyWarmupModalsProps) {
  // =========================================================================
  // 1. READ STATE & DATA
  // =========================================================================
  const [readTimer, setReadTimer] = useState(420); // 7 mins
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedInference, setSelectedInference] = useState<number | null>(null);
  const [readFeedback, setReadFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const readOptions = [
    {
      text: 'Human rationality is entirely an illusion with no mathematical foundations.',
      feedback: 'Incorrect. The author does not claim rationality has no mathematical foundation; rather, descriptive framing disrupts normative utility maximization.',
    },
    {
      text: 'The linguistic framing of decisions fundamentally alters human risk tolerance despite identical objective probabilities.',
      feedback: '✓ Correct Inference! The author proves that linguistic framing (gains vs. losses) inverts risk aversion to risk-seeking even when probabilities are identical.',
    },
    {
      text: 'Medical scenarios require strict algorithmic judgment rather than subjective evaluation.',
      feedback: 'Incorrect. The Kahneman & Tversky epidemic dilemma is used as an illustrative cognitive experiment, not a policy prescription for medicine.',
    },
    {
      text: 'Risk-seeking behavior is mathematically superior in crisis conditions.',
      feedback: 'Incorrect. The text demonstrates that both choices in the experiment carry mathematically identical expectations (200 guaranteed vs 1/3 of 600).',
    },
  ];

  // =========================================================================
  // 2. THINK STATE (9x9 SUDOKU)
  // =========================================================================
  const [sudokuGrid, setSudokuGrid] = useState<{ [key: string]: number }>({});
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [sudokuStatus, setSudokuStatus] = useState<{
    checked: boolean;
    isFullyCorrect: boolean;
    correctCount: number;
    incorrectCount: number;
    remainingCount: number;
    errors: Set<string>;
  }>({
    checked: false,
    isFullyCorrect: false,
    correctCount: 0,
    incorrectCount: 0,
    remainingCount: 51,
    errors: new Set(),
  });

  // =========================================================================
  // 3. CALCULATE STATE (Smart Maths Speed Drill)
  // =========================================================================
  const mathQuestions = [
    {
      q: 'What is 37.5% of 640?',
      hint: 'Remember fraction equivalent: 37.5% = 3/8',
      options: ['210', '240', '260', '280'],
      correct: 1,
      explanation: '37.5% = 3/8. Thus (3/8) × 640 = 3 × 80 = 240.',
    },
    {
      q: 'Evaluate: 104 × 96 using algebraic identities',
      hint: '(a + b)(a - b) = a² - b²',
      options: ['9984', '9964', '9976', '9994'],
      correct: 0,
      explanation: '(100 + 4)(100 - 4) = 100² - 4² = 10,000 - 16 = 9,984.',
    },
    {
      q: 'If ratio A : B = 4 : 7 and B - A = 36, what is A + B?',
      hint: 'Difference is 3 units = 36',
      options: ['120', '128', '132', '144'],
      correct: 2,
      explanation: '7 units - 4 units = 3 units = 36, so 1 unit = 12. Sum = 11 units × 12 = 132.',
    },
    {
      q: 'Approximate the value of √7300 to one decimal place',
      hint: '85² = 7225, 86² = 7396',
      options: ['83.8', '85.4', '87.1', '89.2'],
      correct: 1,
      explanation: '85² = 7225. 7300 is slightly above 7225 (75/171 ≈ 0.44). √7300 ≈ 85.4.',
    },
    {
      q: 'Compute: (16.66% of 72) + (83.33% of 48)',
      hint: '16.66% = 1/6, 83.33% = 5/6',
      options: ['48', '50', '52', '56'],
      correct: 2,
      explanation: '(1/6 × 72) + (5/6 × 48) = 12 + 40 = 52.',
    },
  ];
  const [currentMathIdx, setCurrentMathIdx] = useState(0);
  const [mathAnswers, setMathAnswers] = useState<{ [idx: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Timer effect for Read
  useEffect(() => {
    if (activeModal === 'read') {
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
    }
  }, [activeModal]);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && readTimer > 0) {
      interval = setInterval(() => setReadTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, readTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // =========================================================================
  // READ HANDLERS
  // =========================================================================
  const handleSelectInference = (idx: number) => {
    setSelectedInference(idx);
    const isCorrect = idx === 1;
    setReadFeedback({
      isCorrect,
      message: readOptions[idx].feedback,
    });
  };

  // =========================================================================
  // SUDOKU HANDLERS
  // =========================================================================
  const handleCellSelect = (r: number, c: number) => {
    setSelectedCell({ r, c });
  };

  const handleSudokuInput = useCallback((num: number | null) => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    if (SUDOKU_GIVEN[r][c] !== 0) return; // Cannot edit initial given clues

    const key = `${r}-${c}`;
    setSudokuGrid((prev) => {
      const next = { ...prev };
      if (num === null || num === 0) {
        delete next[key];
      } else {
        next[key] = num;
      }
      return next;
    });

    // Reset check state on edit
    setSudokuStatus((prev) => ({
      ...prev,
      checked: false,
    }));
  }, [selectedCell]);

  // Keyboard navigation and entry for Sudoku
  useEffect(() => {
    if (activeModal !== 'think') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const { r, c } = selectedCell;

      if (e.key >= '1' && e.key <= '9') {
        handleSudokuInput(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleSudokuInput(null);
      } else if (e.key === 'ArrowUp' && r > 0) {
        setSelectedCell({ r: r - 1, c });
      } else if (e.key === 'ArrowDown' && r < 8) {
        setSelectedCell({ r: r + 1, c });
      } else if (e.key === 'ArrowLeft' && c > 0) {
        setSelectedCell({ r, c: c - 1 });
      } else if (e.key === 'ArrowRight' && c < 8) {
        setSelectedCell({ r, c: c + 1 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, selectedCell, handleSudokuInput]);

  const verifySudoku = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    const errors = new Set<string>();

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (SUDOKU_GIVEN[r][c] === 0) {
          const key = `${r}-${c}`;
          const val = sudokuGrid[key];
          if (val !== undefined) {
            if (val === SUDOKU_SOLUTION[r][c]) {
              correctCount++;
            } else {
              incorrectCount++;
              errors.add(key);
            }
          }
        }
      }
    }

    const totalEmpty = 51;
    const filledCount = Object.keys(sudokuGrid).length;
    const remainingCount = Math.max(0, totalEmpty - filledCount);
    const isFullyCorrect = correctCount === totalEmpty && incorrectCount === 0;

    setSudokuStatus({
      checked: true,
      isFullyCorrect,
      correctCount,
      incorrectCount,
      remainingCount,
      errors,
    });
  };

  const provideHint = () => {
    // Find an empty cell or an incorrect cell to fill correctly
    const candidates: { r: number; c: number }[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (SUDOKU_GIVEN[r][c] === 0) {
          const key = `${r}-${c}`;
          if (sudokuGrid[key] !== SUDOKU_SOLUTION[r][c]) {
            candidates.push({ r, c });
          }
        }
      }
    }

    if (candidates.length > 0) {
      // Pick the first candidate
      const target = candidates[0];
      const targetKey = `${target.r}-${target.c}`;
      setSudokuGrid((prev) => ({
        ...prev,
        [targetKey]: SUDOKU_SOLUTION[target.r][target.c],
      }));
      setSelectedCell(target);
      setSudokuStatus((prev) => {
        const newErrors = new Set(prev.errors);
        newErrors.delete(targetKey);
        return {
          ...prev,
          checked: false,
          errors: newErrors,
        };
      });
    }
  };

  const autoSolveSudoku = () => {
    const full: { [key: string]: number } = {};
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (SUDOKU_GIVEN[r][c] === 0) {
          full[`${r}-${c}`] = SUDOKU_SOLUTION[r][c];
        }
      }
    }
    setSudokuGrid(full);
    setSudokuStatus({
      checked: true,
      isFullyCorrect: true,
      correctCount: 51,
      incorrectCount: 0,
      remainingCount: 0,
      errors: new Set(),
    });
  };

  const resetSudoku = () => {
    setSudokuGrid({});
    setSelectedCell(null);
    setSudokuStatus({
      checked: false,
      isFullyCorrect: false,
      correctCount: 0,
      incorrectCount: 0,
      remainingCount: 51,
      errors: new Set(),
    });
  };

  // =========================================================================
  // CALCULATE HANDLERS
  // =========================================================================
  const calculateScore = () => {
    let score = 0;
    mathQuestions.forEach((q, idx) => {
      if (mathAnswers[idx] === q.correct) score++;
    });
    return score;
  };

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-surface rounded-hero shadow-2xl border border-line max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* ========================================================= */}
        {/* MODAL 1: READ (AEON Article with verified inference) */}
        {/* ========================================================= */}
        {activeModal === 'read' && (
          <>
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-accent">
                    Read • AEON Long-Form Essay
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-ink">
                    The Framing Trap: Why Logic Yields to Context
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs font-mono text-ink-muted bg-secondary px-2.5 py-1 rounded-btn border border-line">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span>{formatTimer(readTimer)}</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-ink-muted hover:text-ink rounded-btn hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-ink leading-relaxed select-text">
              <div className="flex items-center gap-2 pb-2 text-[11px] text-ink-muted border-b border-line">
                <span className="font-semibold text-ink">Topic:</span> Cognitive Science & Behavioral Economics
                <span>•</span>
                <span className="font-semibold text-ink">CAT Skill:</span> Structural Inference & Author&apos;s Tone
              </div>

              <p>
                In classical decision theory, rationality is presumed to be invariant under descriptive transformation. That is, whether an identical economic choice is articulated in terms of prospective gains or unavoidable losses, a normative agent ought to reach congruent conclusions. Yet empirical psychology has systematically dismantled this axiomatic presumption. Under the crucible of uncertainty, human judgment is inherently perspectival.
              </p>

              <p>
                Consider a classic dilemma formalized by Kahneman and Tversky involving an epidemic expected to claim six hundred lives. When presented with two treatment regimens—one preserving two hundred lives with certainty, and the other carrying a one-third probability of preserving all six hundred—subjects demonstrate pronounced risk aversion. Reframe the identical prospect in terms of four hundred guaranteed fatalities, however, and preferences invert toward risk-seeking speculation. The mathematical calculus remains invariant; the emotional resonance diverges catastrophically.
              </p>

              <p>
                For the analytical thinker, this phenomenon reveals an essential epistemological truth: reasoning is rarely an unmediated encounter with objective facts. Instead, human cognition relies upon interpretive scaffolding. Language does not merely report reality; it curates the perceptual boundaries within which probability is assessed.
              </p>

              <div className="p-4 bg-secondary/50 rounded-card border border-line space-y-3 mt-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <HelpCircle className="w-4 h-4 text-accent" />
                  <span>CAT Inference Check: Which statement best captures the author&apos;s primary thesis?</span>
                </div>
                <div className="space-y-2 pt-1">
                  {readOptions.map((opt, idx) => {
                    const isSelected = selectedInference === idx;
                    const isCorrect = idx === 1;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectInference(idx)}
                        className={`w-full text-left p-3 rounded-btn text-xs border transition-all ${
                          isSelected
                            ? isCorrect
                              ? 'bg-accent/10 border-accent text-accent font-medium'
                              : 'bg-coral/10 border-coral text-coral font-medium'
                            : 'bg-surface border-line hover:border-ink-muted text-ink'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-mono text-xs font-semibold mt-0.5">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <div className="flex-1">
                            <span>{opt.text}</span>
                            {isSelected && (
                              <p className={`mt-1.5 text-[11px] font-normal leading-relaxed ${isCorrect ? 'text-accent' : 'text-coral'}`}>
                                {opt.feedback}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <span className="shrink-0 mt-0.5">
                              {isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-accent" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-coral" />
                              )}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-line flex items-center justify-between bg-surface">
              <div className="text-xs text-ink-muted flex items-center gap-1.5">
                {selectedInference === 1 ? (
                  <span className="text-accent font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Inference verified correctly!
                  </span>
                ) : (
                  <span className="text-ink-muted">
                    Answer the inference question correctly to complete.
                  </span>
                )}
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={selectedInference !== 1}
                onClick={() => {
                  onCompleteActivity('read');
                  onClose();
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Mark Reading Complete
              </Button>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: THINK (Playable 9x9 Sudoku with 3x3 Box Grid) */}
        {/* ========================================================= */}
        {activeModal === 'think' && (
          <>
            <div className="px-5 py-3.5 border-b border-line flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FDF6EC] text-[#B7791F] flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#B7791F]">
                    Think • Daily Logic Activation
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-ink">
                    9×9 Classical Sudoku Warm-Up
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-ink-muted hover:text-ink rounded-btn hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>
                  Fill cells with digits <span className="font-bold text-ink">1 to 9</span>. Every row, column, and 3×3 box must contain each digit once.
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={provideHint}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-accent bg-accent/10 hover:bg-accent/20 rounded-btn transition-colors"
                    title="Fill 1 cell hint"
                  >
                    <Lightbulb className="w-3 h-3" />
                    <span>Hint</span>
                  </button>
                  <button
                    onClick={autoSolveSudoku}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-ink-muted hover:text-ink bg-secondary rounded-btn transition-colors"
                    title="Solve puzzle for quick warm-up"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Solve</span>
                  </button>
                  <button
                    onClick={resetSudoku}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-ink-muted hover:text-ink rounded-btn transition-colors"
                    title="Reset to initial puzzle"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 9x9 Sudoku Grid with 3x3 Box Outlines */}
              <div className="flex justify-center py-1">
                <div className="inline-block border-2 border-ink rounded-lg overflow-hidden bg-surface shadow-xs select-none">
                  {SUDOKU_GIVEN.map((row, r) => (
                    <div key={r} className="flex">
                      {row.map((givenVal, c) => {
                        const isGiven = givenVal !== 0;
                        const cellKey = `${r}-${c}`;
                        const userVal = sudokuGrid[cellKey];
                        const valToDisplay = isGiven ? givenVal : (userVal || '');
                        
                        const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                        const isSameRowOrCol = selectedCell && (selectedCell.r === r || selectedCell.c === c);
                        const isSameBox =
                          selectedCell &&
                          Math.floor(selectedCell.r / 3) === Math.floor(r / 3) &&
                          Math.floor(selectedCell.c / 3) === Math.floor(c / 3);
                        
                        const isSameNumber =
                          selectedCell &&
                          valToDisplay &&
                          (isGiven
                            ? givenVal === (selectedCell ? (SUDOKU_GIVEN[selectedCell.r][selectedCell.c] || sudokuGrid[`${selectedCell.r}-${selectedCell.c}`]) : null)
                            : userVal === (selectedCell ? (SUDOKU_GIVEN[selectedCell.r][selectedCell.c] || sudokuGrid[`${selectedCell.r}-${selectedCell.c}`]) : null));

                        const isError = sudokuStatus.errors.has(cellKey);

                        // 3x3 subgrid borders
                        const isThickRight = c === 2 || c === 5;
                        const isThickBottom = r === 2 || r === 5;

                        return (
                          <div
                            key={cellKey}
                            onClick={() => handleCellSelect(r, c)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-semibold cursor-pointer transition-colors border border-line ${
                              isThickRight ? 'border-r-2 border-r-ink' : ''
                            } ${isThickBottom ? 'border-b-2 border-b-ink' : ''} ${
                              isSelected
                                ? 'bg-accent/20 ring-2 ring-accent z-10'
                                : isError
                                ? 'bg-coral/20 text-coral'
                                : isSameNumber
                                ? 'bg-accent/10'
                                : isSameRowOrCol || isSameBox
                                ? 'bg-secondary/60'
                                : isGiven
                                ? 'bg-secondary/30 text-ink font-bold'
                                : 'bg-surface text-accent'
                            }`}
                          >
                            <span>{valToDisplay}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Numpad Controls (1 - 9 + Erase) */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleSudokuInput(num)}
                      className="h-9 sm:h-10 rounded-btn border border-line bg-surface hover:bg-secondary font-mono text-xs sm:text-sm font-bold text-ink active:scale-95 transition-all shadow-2xs"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => handleSudokuInput(null)}
                    title="Erase cell"
                    className="h-9 sm:h-10 rounded-btn border border-line bg-secondary hover:bg-line text-ink-muted hover:text-ink flex items-center justify-center active:scale-95 transition-all shadow-2xs"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-center text-ink-muted">
                  Tip: Click any cell and press keyboard numbers <span className="font-mono font-semibold">1-9</span>, arrows to move, or Backspace to clear.
                </p>
              </div>

              {/* Verification Feedback Banner */}
              {sudokuStatus.checked && (
                <div
                  className={`p-3 rounded-card border text-xs flex items-center gap-2.5 transition-all ${
                    sudokuStatus.isFullyCorrect
                      ? 'bg-accent/10 border-accent/30 text-accent font-medium'
                      : sudokuStatus.incorrectCount === 0
                      ? 'bg-[#EDF7ED] border-[#C8E6C9] text-[#1B5E20]'
                      : 'bg-coral/10 border-coral/30 text-coral'
                  }`}
                >
                  {sudokuStatus.isFullyCorrect ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-accent" />
                  ) : sudokuStatus.incorrectCount === 0 ? (
                    <Sparkles className="w-5 h-5 shrink-0 text-[#1B5E20]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-coral" />
                  )}
                  <div>
                    {sudokuStatus.isFullyCorrect ? (
                      <div>
                        <span className="font-bold">Perfect!</span> 9×9 Sudoku completely and correctly solved.
                      </div>
                    ) : sudokuStatus.incorrectCount === 0 ? (
                      <div>
                        <span className="font-semibold">All placed digits ({sudokuStatus.correctCount}) are correct!</span> Fill the remaining {sudokuStatus.remainingCount} cells or click &ldquo;Solve&rdquo; to finish.
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold">{sudokuStatus.incorrectCount} incorrect placement(s) flagged in red.</span> Fix the errors to continue!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 border-t border-line flex items-center justify-between bg-surface">
              <button
                onClick={verifySudoku}
                className="px-4 py-2 text-xs font-semibold rounded-btn border border-line hover:bg-secondary text-ink transition-colors shadow-2xs"
              >
                Check Grid
              </button>

              <Button
                variant="primary"
                size="sm"
                disabled={!sudokuStatus.isFullyCorrect && sudokuStatus.correctCount < 20}
                onClick={() => {
                  onCompleteActivity('think');
                  onClose();
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Complete Logic Warm-Up
              </Button>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: CALCULATE (5-Question Mental Agility Drill) */}
        {/* ========================================================= */}
        {activeModal === 'calculate' && (
          <>
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#EDF7ED] text-[#1B5E20] flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#1B5E20]">
                    Calculate • Smart Maths
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-ink">
                    5-Question Mental Agility
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-ink-muted">
                  Question {currentMathIdx + 1} of {mathQuestions.length}
                </span>
                <button
                  onClick={onClose}
                  className="p-1 text-ink-muted hover:text-ink rounded-btn hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {!quizSubmitted ? (
                <>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-ink-muted bg-secondary px-2 py-0.5 rounded-btn border border-line">
                      Speed Tip: {mathQuestions[currentMathIdx].hint}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-ink pt-2">
                      {mathQuestions[currentMathIdx].q}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {mathQuestions[currentMathIdx].options.map((opt, optIdx) => {
                      const isSelected = mathAnswers[currentMathIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() =>
                            setMathAnswers((prev) => ({ ...prev, [currentMathIdx]: optIdx }))
                          }
                          className={`p-3.5 rounded-card border text-left text-xs sm:text-sm font-semibold transition-all min-h-[48px] ${
                            isSelected
                              ? 'border-[#1B5E20] bg-[#EDF7ED] text-[#1B5E20] ring-1 ring-[#1B5E20]'
                              : 'border-line hover:border-ink bg-surface text-ink'
                          }`}
                        >
                          <span className="inline-block w-5 font-mono text-xs text-ink-muted">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {mathAnswers[currentMathIdx] !== undefined && (
                    <div className="p-3 bg-secondary/50 border border-line rounded-card text-xs text-ink-muted">
                      <span className="font-semibold text-ink">Method:</span>{' '}
                      {mathQuestions[currentMathIdx].explanation}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-3 space-y-4">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#EDF7ED] text-[#1B5E20] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-ink">
                      Mental Arithmetic Scored!
                    </h3>
                    <p className="text-xs text-ink-muted max-w-sm mx-auto">
                      You scored <span className="font-bold text-[#1B5E20] font-mono">{calculateScore()} / 5</span> on speed calculations.
                    </p>
                  </div>

                  {/* Question breakdown review */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {mathQuestions.map((q, idx) => {
                      const userAns = mathAnswers[idx];
                      const isCorrect = userAns === q.correct;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-card border text-xs space-y-1 ${
                            isCorrect
                              ? 'border-[#C8E6C9] bg-[#EDF7ED]/50'
                              : 'border-coral/30 bg-coral/5'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-ink">Q{idx + 1}. {q.q}</span>
                            <span className={isCorrect ? 'text-[#1B5E20]' : 'text-coral'}>
                              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>
                          <div className="text-[11px] text-ink-muted">
                            <span>Your answer: <strong className="text-ink">{userAns !== undefined ? q.options[userAns] : 'Skipped'}</strong></span>
                            {!isCorrect && (
                              <span className="ml-3 text-[#1B5E20]">Correct: <strong>{q.options[q.correct]}</strong></span>
                            )}
                          </div>
                          <p className="text-[11px] text-ink-muted italic">
                            {q.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 border-t border-line flex items-center justify-between bg-surface">
              {!quizSubmitted ? (
                <>
                  <div className="flex items-center gap-1.5">
                    {mathQuestions.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentMathIdx(i)}
                        className={`w-7 h-7 rounded-btn text-[11px] font-mono font-medium transition-colors ${
                          currentMathIdx === i
                            ? 'bg-ink text-surface font-bold'
                            : mathAnswers[i] !== undefined
                            ? 'bg-[#EDF7ED] text-[#1B5E20] border border-[#C8E6C9]'
                            : 'bg-secondary text-ink-muted'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  {currentMathIdx < mathQuestions.length - 1 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setCurrentMathIdx((prev) => prev + 1)}
                    >
                      Next Question
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setQuizSubmitted(true)}
                    >
                      Submit & Review
                    </Button>
                  )}
                </>
              ) : (
                <div className="w-full flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setCurrentMathIdx(0);
                    }}
                    className="text-xs text-ink-muted hover:text-ink flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Review Questions</span>
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onCompleteActivity('calculate');
                      onClose();
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Complete Smart Maths
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
