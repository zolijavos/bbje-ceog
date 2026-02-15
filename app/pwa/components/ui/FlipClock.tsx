'use client';

import { useEffect, useState, useRef } from 'react';

interface FlipClockProps {
  targetDate: Date;
  onComplete?: () => void;
  showSeconds?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
  };
}

function FlipDigit({
  value,
  prevValue,
}: {
  value: string;
  prevValue: string;
}) {
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => setIsFlipping(false), 600);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  return (
    <div className={`flip-clock-digit ${isFlipping ? 'flip' : ''}`}>
      {value}
    </div>
  );
}

function FlipSegment({
  value,
  label,
  prevValue,
}: {
  value: number;
  label: string;
  prevValue: number;
}) {
  const paddedValue = value.toString().padStart(2, '0');
  const paddedPrevValue = prevValue.toString().padStart(2, '0');

  return (
    <div className="flip-clock-segment">
      <div className="flip-clock-digits">
        <FlipDigit value={paddedValue[0]} prevValue={paddedPrevValue[0]} />
        <FlipDigit value={paddedValue[1]} prevValue={paddedPrevValue[1]} />
      </div>
      <span className="flip-clock-label">{label}</span>
    </div>
  );
}

export default function FlipClock({
  targetDate,
  onComplete,
  showSeconds = false,
}: FlipClockProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetDate)
  );
  const prevTimeRef = useRef<TimeLeft>(timeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      prevTimeRef.current = timeLeft;
      setTimeLeft(newTimeLeft);

      // Check if countdown is complete
      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, timeLeft, onComplete]);

  const prevTime = prevTimeRef.current;

  return (
    <div className="flip-clock">
      <FlipSegment value={timeLeft.days} label="Days" prevValue={prevTime.days} />
      <div className="flex items-center pwa-text-tertiary text-2xl font-bold">:</div>
      <FlipSegment value={timeLeft.hours} label="Hours" prevValue={prevTime.hours} />
      <div className="flex items-center pwa-text-tertiary text-2xl font-bold">:</div>
      <FlipSegment value={timeLeft.minutes} label="Min" prevValue={prevTime.minutes} />
      {showSeconds && (
        <>
          <div className="flex items-center pwa-text-tertiary text-2xl font-bold">:</div>
          <FlipSegment
            value={timeLeft.seconds}
            label="Sec"
            prevValue={prevTime.seconds}
          />
        </>
      )}
    </div>
  );
}

// Simple countdown without flip animation (for when event is far away)
export function SimpleCountdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 60000); // Update every minute for simple countdown

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="text-center">
      <p className="pwa-text-secondary text-sm mb-1">Only</p>
      <p className="text-3xl font-bold pwa-text-primary">{timeLeft.days}</p>
      <p className="pwa-text-secondary text-sm">days until the event</p>
    </div>
  );
}
