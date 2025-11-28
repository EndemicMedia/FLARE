import { useEffect, useState } from 'react';
import { FiCode, FiCopy, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { compileGraphToFlare } from '../utils/graphToFlare';
import { useFlareWorkflowStore } from '../store/flareWorkflowStore';

export function SyntaxView() {
  const { nodes, edges } = useFlareWorkflowStore();
  const [flareCommand, setFlareCommand] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Compile graph to FLARE command whenever nodes or edges change
    const result = compileGraphToFlare(nodes, edges);

    if (result.success && result.flareCommand) {
      setFlareCommand(result.flareCommand);
      setErrors([]);
    } else {
      setFlareCommand('');
      setErrors(result.errors);
    }

    setWarnings(result.warnings);
  }, [nodes, edges]);

  const handleCopy = () => {
    if (flareCommand) {
      navigator.clipboard.writeText(flareCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderSyntaxHighlighted = (command: string) => {
    // Simple syntax highlighting for FLARE commands
    const parts = command.match(/(\{|\}|flare|model:|temp:|\d+\.?\d*|sum|vote|comb|diff|exp|filter|`[^`]*`)/g);

    if (!parts) return command;

    return parts.map((part, idx) => {
      let className = '';

      if (part === '{' || part === '}') {
        className = 'syntax-bracket';
      } else if (part === 'flare') {
        className = 'syntax-keyword';
      } else if (part.startsWith('model:') || part.startsWith('temp:')) {
        className = 'syntax-parameter';
      } else if (['sum', 'vote', 'comb', 'diff', 'exp', 'filter'].includes(part)) {
        className = 'syntax-operation';
      } else if (part.startsWith('`')) {
        className = 'syntax-prompt';
      } else if (!isNaN(parseFloat(part))) {
        className = 'syntax-number';
      }

      return (
        <span key={idx} className={className}>
          {part}
        </span>
      );
    });
  };

  return (
    <div className="syntax-view-container">
      <div className="syntax-view-header">
        <div className="syntax-view-title">
          <FiCode className="syntax-icon" />
          <span>FLARE Syntax</span>
        </div>

        {flareCommand && (
          <button
            className="syntax-copy-button"
            onClick={handleCopy}
            title="Copy FLARE command"
          >
            {copied ? (
              <>
                <FiCheck size={14} />
                Copied!
              </>
            ) : (
              <>
                <FiCopy size={14} />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      <div className="syntax-view-content">
        {flareCommand ? (
          <div className="syntax-display">
            <code className="flare-syntax">{renderSyntaxHighlighted(flareCommand)}</code>
          </div>
        ) : (
          <div className="syntax-placeholder">
            {nodes.length === 0 ? (
              <p>Add nodes to your workflow to see the FLARE command</p>
            ) : (
              <p>Configure your workflow to generate valid FLARE syntax</p>
            )}
          </div>
        )}

        {errors.length > 0 && (
          <div className="syntax-errors">
            <div className="error-header">
              <FiAlertCircle size={16} />
              <span>Errors</span>
            </div>
            <ul className="error-list">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="syntax-warnings">
            <div className="warning-header">
              <FiAlertCircle size={16} />
              <span>Warnings</span>
            </div>
            <ul className="warning-list">
              {warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style>{`
        .syntax-view-container {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
        }

        .syntax-view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .syntax-view-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          color: #212529;
        }

        .syntax-icon {
          color: #6c757d;
        }

        .syntax-copy-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .syntax-copy-button:hover {
          background: #2ecc71;
          color: white;
          border-color: #2ecc71;
        }

        .syntax-view-content {
          padding: 16px;
        }

        .syntax-display {
          padding: 16px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          overflow-x: auto;
        }

        .flare-syntax {
          display: block;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .syntax-bracket {
          color: #495057;
          font-weight: 700;
        }

        .syntax-keyword {
          color: #d63384;
          font-weight: 700;
        }

        .syntax-parameter {
          color: #0d6efd;
          font-weight: 600;
        }

        .syntax-operation {
          color: #fd7e14;
          font-weight: 600;
        }

        .syntax-prompt {
          color: #198754;
          font-style: italic;
        }

        .syntax-number {
          color: #6f42c1;
        }

        .syntax-placeholder {
          padding: 32px;
          text-align: center;
          color: #6c757d;
          font-style: italic;
        }

        .syntax-errors,
        .syntax-warnings {
          margin-top: 12px;
          padding: 12px;
          border-radius: 6px;
        }

        .syntax-errors {
          background: #fee;
          border: 1px solid #f5c6cb;
        }

        .syntax-warnings {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
        }

        .error-header,
        .warning-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .error-header {
          color: #c33;
        }

        .warning-header {
          color: #856404;
        }

        .error-list,
        .warning-list {
          margin: 0;
          padding-left: 20px;
          font-size: 12px;
        }

        .error-list li {
          color: #c33;
        }

        .warning-list li {
          color: #856404;
        }
      `}</style>
    </div>
  );
}
