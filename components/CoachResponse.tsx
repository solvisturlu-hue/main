'use client';

interface CoachResponseProps {
  content: string;
  loading: boolean;
}

function renderContent(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let keyCounter = 0;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      elements.push(
        <h3
          key={keyCounter++}
          style={{
            color: '#FC4C02',
            fontSize: '17px',
            fontWeight: '700',
            marginTop: '24px',
            marginBottom: '8px',
            paddingBottom: '4px',
            borderBottom: '1px solid #2a2a4a',
          }}
        >
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2
          key={keyCounter++}
          style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: '700',
            marginTop: '16px',
            marginBottom: '8px',
          }}
        >
          {line.slice(2)}
        </h2>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li
          key={keyCounter++}
          style={{
            color: '#d0d0e0',
            marginLeft: '20px',
            marginBottom: '4px',
            lineHeight: '1.6',
          }}
        >
          {line.slice(2)}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<br key={keyCounter++} />);
    } else {
      elements.push(
        <p
          key={keyCounter++}
          style={{
            color: '#d0d0e0',
            lineHeight: '1.7',
            marginBottom: '8px',
          }}
        >
          {line}
        </p>
      );
    }
  }

  return elements;
}

export default function CoachResponse({ content, loading }: CoachResponseProps) {
  if (!loading && !content) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: '#1a1a2e',
        border: '1px solid #2a2a4a',
        borderRadius: '12px',
        padding: '28px',
        marginTop: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#FC4C02',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          🏃
        </div>
        <h2
          style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            margin: 0,
          }}
        >
          Your AI Running Coach
        </h2>
        {loading && (
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              backgroundColor: '#FC4C02',
              borderRadius: '50%',
              animation: 'pulse 1s infinite',
              marginLeft: '4px',
            }}
          />
        )}
      </div>

      {loading && !content && (
        <div style={{ color: '#a0a0b0', fontStyle: 'italic' }}>
          Analyzing your training data...
        </div>
      )}

      {content && (
        <div style={{ fontFamily: 'inherit' }}>
          {renderContent(content)}
          {loading && (
            <span
              style={{
                display: 'inline-block',
                width: '2px',
                height: '18px',
                backgroundColor: '#FC4C02',
                animation: 'blink 1s infinite',
                verticalAlign: 'middle',
                marginLeft: '2px',
              }}
            />
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
