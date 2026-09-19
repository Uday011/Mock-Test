'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DailyWarmupModalsProps {
  activeModal: 'read' | 'think' | 'calculate' | null;
  onClose: () => void;
  onCompleteActivity: (activity: 'read' | 'think' | 'calculate') => void;
}

export function DailyWarmupModals({
  activeModal,
  onClose,
  onCompleteActivity,
}: DailyWarmupModalsProps) {
  // Read state
  const [readTimer, setReadTimer] = useState(420); // 7 mins in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedInference, setSelectedInference] = useState<number | null>(null);

  // Think state (6x6 Sudoku / Logic puzzle)
  const initialPuzzleGrid = [
    [1, null, 3, 4, null, 6],
    [null, 5, 6, 1, 2, null],
    [3, 4, null, null, 6, 1],
    [6, 1, null, null, 3, 4],
    [null, 3, 4, 5, 1, null],
    [5, null, 1, 2, null, 3],
  ];
  const puzzleSolution: { [key: string]: number } = {
    '0-1': 2, '0-4': 5,
    '1-0': 4, '1-5': 3,
    '2-2': 2, '2-3': 5,
    '3-2': 5, '3-3': 2,
    '4-0': 2, '4-5': 6,
    '5-1': 6, '5-4': 4,
  };
  const [gridValues, setGridValues] = useState<{ [key: string]: string }>({});
  const [puzzleChecked, setPuzzleChecked] = useState(false);
  const [puzzleCorrect, setPuzzleCorrect] = useState(false);

  // Calculate state (Smart Maths)
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

  if (!activeModal) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSudokuInput = (r: number, c: number, val: string) => {
    const sanitized = val.replace(/[^1-6]/g, '').slice(-1);
    setGridValues((prev) => ({ ...prev, [`${r}-${c}`]: sanitized }));
    setPuzzleChecked(false);
  };

  const verifyPuzzle = () => {
    let allCorrect = true;
    let filledCount = 0;
    for (const key of Object.keys(puzzleSolution)) {
      const userVal = parseInt(gridValues[key] || '0', 10);
      if (userVal === puzzleSolution[key]) {
        filledCount++;
      } else {
        allCorrect = false;
      }
    }
    setPuzzleChecked(true);
    // Allow completion if mostly or fully correct, or user attempted
    setPuzzleCorrect(allCorrect || filledCount >= 8);
  };

  const calculateScore = () => {
    let score = 0;
    mathQuestions.forEach((q, idx) => {
      if (mathAnswers[idx] === q.correct) score++;
    });
    return score;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E6E6E3] max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* ========================================================= */}
        {/* MODAL 1: READ (AEON Article) */}
        {/* ========================================================= */}
        {activeModal === 'read' && (
          <>
            <div className="px-5 py-4 border-b border-[#E6E6E3] flex items-center justify-between bg-[#FCFBF9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF0FB] text-[#4F46A5] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#4F46A5]">
                    Read • AEON Long-Form Essay
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-[#202124]">
                    The Framing Trap: Why Logic Yields to Context
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs font-mono text-[#787774] bg-white px-2 py-1 rounded border border-[#E6E6E3]">
                  <Clock className="w-3.5 h-3.5 text-[#4F46A5]" />
                  <span>{formatTimer(readTimer)}</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-[#787774] hover:text-[#202124] rounded-lg hover:bg-[#F1F1EF] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#37352F] leading-relaxed select-text">
              <div className="flex items-center gap-2 pb-2 text-[11px] text-[#787774] border-b border-[#F1F1EF]">
                <span className="font-semibold text-[#202124]">Topic:</span> Cognitive Science & Behavioral Economics
                <span>•</span>
                <span className="font-semibold text-[#202124]">CAT Skill:</span> Structural Inference & Author's Tone
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

              <div className="p-4 bg-[#F7F7F5] rounded-xl border border-[#E6E6E3] space-y-2 mt-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#202124]">
                  <HelpCircle className="w-4 h-4 text-[#4F46A5]" />
                  <span>CAT Inference Check: Which statement best captures the author's primary thesis?</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {[
                    'Human rationality is entirely an illusion with no mathematical foundations.',
                    'The linguistic framing of decisions fundamentally alters human risk tolerance despite identical objective probabilities.',
                    'Medical scenarios require strict algorithmic judgment rather than subjective evaluation.',
                    'Risk-seeking behavior is mathematically superior in crisis conditions.',
                  ].map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedInference(idx)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${
                        selectedInference === idx
                          ? idx === 1
                            ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20] font-medium'
                            : 'bg-[#FDF2F2] border-[#C53030] text-[#C53030]'
                          : 'bg-white border-[#E6E6E3] hover:bg-[#F9F9F8] text-[#202124]'
                      }`}
                    >
                      {option}
                      {selectedInference === idx && idx === 1 && (
                        <span className="ml-2 text-[11px] font-semibold text-emerald-700">✓ Correct Inference</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#E6E6E3] flex items-center justify-between bg-white">
              <span className="text-xs text-[#787774]">
                {selectedInference === 1 ? 'Inference verified!' : 'Select the primary thesis to verify comprehension'}
              </span>
              <Button
                variant="primary"
                size="sm"
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
        {/* MODAL 2: THINK (Brain Puzzle - 6x6 Sudoku) */}
        {/* ========================================================= */}
        {activeModal === 'think' && (
          <>
            <div className="px-5 py-4 border-b border-[#E6E6E3] flex items-center justify-between bg-[#FCFBF9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FDF6EC] text-[#B7791F] flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#B7791F]">
                    Think • Daily Logic Activation
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-[#202124]">
                    6×6 Mini Sudoku Warm-Up
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-[#787774] hover:text-[#202124] rounded-lg hover:bg-[#F1F1EF] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="text-xs text-[#787774] leading-relaxed">
                Fill each empty square so that numbers <span className="font-semibold text-[#202124]">1 through 6</span> appear exactly once in every row, column, and 2×3 block.
              </div>

              {/* Sudoku Grid */}
              <div className="flex justify-center py-2">
                <div className="grid grid-cols-6 border-2 border-[#202124] rounded-lg overflow-hidden bg-white shadow-xs">
                  {initialPuzzleGrid.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                      const isGiven = cell !== null;
                      const cellKey = `${rIdx}-${cIdx}`;
                      const isBorderRight = cIdx === 2;
                      const isBorderBottom = rIdx === 1 || rIdx === 3;

                      return (
                        <div
                          key={cellKey}
                          className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-[#E6E6E3] ${
                            isBorderRight ? 'border-r-2 border-r-[#202124]' : ''
                          } ${isBorderBottom ? 'border-b-2 border-b-[#202124]' : ''} ${
                            isGiven ? 'bg-[#F7F7F5] font-bold text-[#202124]' : 'bg-white'
                          }`}
                        >
                          {isGiven ? (
                            <span className="text-sm sm:text-base">{cell}</span>
                          ) : (
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={gridValues[cellKey] || ''}
                              onChange={(e) => handleSudokuInput(rIdx, cIdx, e.target.value)}
                              className="w-full h-full text-center text-sm sm:text-base font-semibold text-[#4F46A5] focus:outline-none focus:bg-[#EEF0FB]"
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {puzzleChecked && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    puzzleCorrect
                      ? 'bg-[#E8F5E9] border-[#C8E6C9] text-[#1B5E20]'
                      : 'bg-[#FFFBEB] border-[#FEF3C7] text-[#B7791F]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {puzzleCorrect
                      ? 'Great job! Logical pattern successfully resolved.'
                      : 'Good effort! Multiple valid placements attempted. Logical activation ready.'}
                  </span>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-[#E6E6E3] flex items-center justify-between bg-white">
              <button
                onClick={verifyPuzzle}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#E6E6E3] hover:bg-[#F7F7F5] text-[#202124] transition-colors"
              >
                Check Grid
              </button>

              <Button
                variant="primary"
                size="sm"
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
        {/* MODAL 3: CALCULATE (Smart Maths Speed Quiz) */}
        {/* ========================================================= */}
        {activeModal === 'calculate' && (
          <>
            <div className="px-5 py-4 border-b border-[#E6E6E3] flex items-center justify-between bg-[#FCFBF9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EDF7ED] text-[#1B5E20] flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#1B5E20]">
                    Calculate • Smart Maths
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-[#202124]">
                    5-Question Mental Agility
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#787774]">
                  Question {currentMathIdx + 1} of {mathQuestions.length}
                </span>
                <button
                  onClick={onClose}
                  className="p-1 text-[#787774] hover:text-[#202124] rounded-lg hover:bg-[#F1F1EF] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {!quizSubmitted ? (
                <>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-[#787774] bg-[#F1F1EF] px-2 py-0.5 rounded">
                      Speed Tip: {mathQuestions[currentMathIdx].hint}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-[#202124] pt-2">
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
                          className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all min-h-[48px] ${
                            isSelected
                              ? 'border-[#1B5E20] bg-[#EDF7ED] text-[#1B5E20] ring-1 ring-[#1B5E20]'
                              : 'border-[#E6E6E3] hover:border-[#202124] bg-white text-[#202124]'
                          }`}
                        >
                          <span className="inline-block w-5 font-mono text-xs text-[#787774]">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {mathAnswers[currentMathIdx] !== undefined && (
                    <div className="p-3 bg-[#FCFBF9] border border-[#E6E6E3] rounded-lg text-xs text-[#787774]">
                      <span className="font-semibold text-[#202124]">Method:</span>{' '}
                      {mathQuestions[currentMathIdx].explanation}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#EDF7ED] text-[#1B5E20] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#202124]">
                    Mental Arithmetic Warmed Up!
                  </h3>
                  <p className="text-xs text-[#787774] max-w-sm mx-auto">
                    You scored <span className="font-bold text-[#1B5E20] font-mono">{calculateScore()} / 5</span> on speed calculations. Your numerical processor is primed for QA & DILR.
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-[#E6E6E3] flex items-center justify-between bg-white">
              {!quizSubmitted ? (
                <>
                  <div className="flex items-center gap-2">
                    {mathQuestions.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentMathIdx(i)}
                        className={`w-6 h-6 rounded-md text-[11px] font-mono font-medium transition-colors ${
                          currentMathIdx === i
                            ? 'bg-[#202124] text-white'
                            : mathAnswers[i] !== undefined
                            ? 'bg-[#EDF7ED] text-[#1B5E20] border border-[#C8E6C9]'
                            : 'bg-[#F1F1EF] text-[#787774]'
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
                      Finish Quiz
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    onCompleteActivity('calculate');
                    onClose();
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Complete Smart Maths
                </Button>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
