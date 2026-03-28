import React, { useMemo, useRef } from 'react';
import { Stack, TextField } from '@mui/material';

type OtpCodeInputProps = {
  value: string;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange: (value: string) => void;
};

const OtpCodeInput = ({
  value,
  length = 6,
  disabled = false,
  autoFocus = false,
  onChange,
}: OtpCodeInputProps) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = useMemo(() => {
    const normalizedValue = value.replace(/\D/g, '').slice(0, length);

    return Array.from({ length }, (_, index) => normalizedValue[index] ?? '');
  }, [length, value]);

  const focusInput = (index: number) => {
    const input = inputRefs.current[index];
    input?.focus();
    input?.select();
  };

  const setDigitAt = (index: number, digit: string) => {
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChange(nextDigits.join(''));
  };

  const handleSingleDigitChange = (index: number, rawValue: string) => {
    const filteredValue = rawValue.replace(/\D/g, '');

    if (!filteredValue) {
      setDigitAt(index, '');
      return;
    }

    const nextDigit = filteredValue[filteredValue.length - 1];
    setDigitAt(index, nextDigit);

    if (index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (
    event: React.ClipboardEvent,
    index: number,
  ) => {
    event.preventDefault();

    const pastedText = event.clipboardData.getData('text');
    const pastedDigits = pastedText.replace(/\D/g, '').slice(0, length);

    if (!pastedDigits) {
      return;
    }

    const nextDigits = [...digits];

    pastedDigits.split('').forEach((digit, offset) => {
      const targetIndex = index + offset;

      if (targetIndex < length) {
        nextDigits[targetIndex] = digit;
      }
    });

    onChange(nextDigits.join(''));

    const nextFocusIndex = Math.min(index + pastedDigits.length, length) - 1;
    focusInput(nextFocusIndex);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    index: number,
  ) => {
    if (e.key === 'Backspace') {
      e.preventDefault();

      if (digits[index]) {
        setDigitAt(index, '');
        return;
      }

      if (index > 0) {
        setDigitAt(index - 1, '');
        focusInput(index - 1);
      }

      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();

      if (index > 0) {
        focusInput(index - 1);
      }

      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();

      if (index < length - 1) {
        focusInput(index + 1);
      }
    }
  };

  return (
    <Stack direction="row" spacing={1.25}>
      {digits.map((digit, index) => (
        <TextField
          key={index}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(e) => handleSingleDigitChange(index, e.target.value)}
          onPaste={(e) => handlePaste(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          inputRef={(element) => {
            inputRefs.current[index] = element;
          }}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 1,
            'aria-label': `OTP digit ${index + 1}`,
            style: {
              textAlign: 'center',
              fontSize: '1.25rem',
              fontWeight: 700,
              padding: '10px 0',
            },
          }}
          sx={{
            flex: 1,
            maxWidth: 56,
            '& .MuiOutlinedInput-root': {
              borderRadius: .5,
              height: 56,
            },
          }}
        />
      ))}
    </Stack>
  );
};

export default OtpCodeInput;