import { forwardRef, useId, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`

    return (
      <div className="input-field">
        <label htmlFor={inputId}>{label}</label>
        <input
          ref={ref}
          id={inputId}
          className={`text-input ${error ? 'text-input--error' : ''} ${className}`.trim()}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <span className="input-error" id={errorId}>
            {error}
          </span>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
