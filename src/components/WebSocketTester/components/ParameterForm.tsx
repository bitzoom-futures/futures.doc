import React from 'react'
import type { ParameterDefinition } from '../types'
import styles from '../styles/WebSocketTester.module.css'

interface ParameterFormProps {
  params: ParameterDefinition[]
  values: Record<string, string>
  onChange: (name: string, value: string) => void
}

export default function ParameterForm({ params, values, onChange }: ParameterFormProps) {
  return (
    <div className={styles.panel}>
      <h3>Parameters</h3>
      {params.length === 0 ? (
        <p className={styles.helperText}>This channel does not require parameters.</p>
      ) : (
        <div className={styles.grid}>
          {params.map((param) => (
            <div key={param.name}>
              <label className={styles.fieldLabel}>
                {param.label}
                {param.required ? ' *' : ''}
              </label>
              {param.type === 'select' ? (
                <select
                  className={styles.input}
                  value={values[param.name] ?? String(param.defaultValue ?? '')}
                  onChange={(e) => onChange(param.name, e.target.value)}
                >
                  {(param.options ?? []).map((option) => (
                    <option key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={styles.input}
                  type={param.type === 'number' ? 'number' : 'text'}
                  value={values[param.name] ?? String(param.defaultValue ?? '')}
                  onChange={(e) => onChange(param.name, e.target.value)}
                  placeholder={param.placeholder}
                  min={param.type === 'number' ? param.min : undefined}
                  max={param.type === 'number' ? param.max : undefined}
                  step={param.type === 'number' ? param.step ?? 1 : undefined}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
