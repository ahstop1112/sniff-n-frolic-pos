import { useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react"
import styles from "./OtpCodeInput.module.scss"

interface OtpCodeInputProps {
  value: string
  onChange: (next: string) => void
  onComplete?: (value: string) => void
  length?: number
  disabled?: boolean
  autoFocus?: boolean
  ariaLabel?: string
}

const DIGIT_REGEX = /^[0-9]$/

// 6 (configurable) single-digit boxes wired as a single controlled `value`.
// Typing advances focus; backspace on an empty box hops back; pasting a
// full code distributes it across boxes and can trigger onComplete.
const OtpCodeInput = ({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  autoFocus = false,
  ariaLabel = "One-time code",
}: OtpCodeInputProps) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? "")

  const focus = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index))
    inputsRef.current[clamped]?.focus()
    inputsRef.current[clamped]?.select()
  }

  const emit = (nextDigits: string[]) => {
    const nextValue = nextDigits.join("").slice(0, length)
    onChange(nextValue)
    if (nextValue.length === length && !nextDigits.includes("")) {
      onComplete?.(nextValue)
    }
  }

  const handleChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    // Grab the last valid digit typed (handles cases where a box already had
    // a value and the user overwrote it).
    const raw = e.target.value
    const digit = raw.slice(-1)
    if (digit && !DIGIT_REGEX.test(digit)) return

    const next = [...digits]
    next[index] = digit
    emit(next)
    if (digit && index < length - 1) focus(index + 1)
  }

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ""
        emit(next)
      } else if (index > 0) {
        e.preventDefault()
        const next = [...digits]
        next[index - 1] = ""
        emit(next)
        focus(index - 1)
      }
      return
    }
    if (e.key === "ArrowLeft") { e.preventDefault(); focus(index - 1); return }
    if (e.key === "ArrowRight") { e.preventDefault(); focus(index + 1); return }
  }

  const handlePaste = (index: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "")
    if (!pasted) return
    e.preventDefault()

    const next = [...digits]
    for (let i = 0; i < pasted.length && index + i < length; i++) {
      next[index + i] = pasted[i]
    }
    emit(next)
    const nextFocus = Math.min(length - 1, index + pasted.length)
    focus(nextFocus)
  }

  return (
    <div className={styles.wrapper} role="group" aria-label={ariaLabel}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el }}
          className={`${styles.box} ${d ? styles.filled : ""}`}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={d}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1} of ${length}`}
          onChange={handleChange(i)}
          onKeyDown={handleKeyDown(i)}
          onPaste={handlePaste(i)}
          onFocus={(e) => e.currentTarget.select()}
        />
      ))}
    </div>
  )
}

export default OtpCodeInput
