import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function VersionDiff({ diff, onClose }) {
  if (!diff) return null;

  const { commitA, commitB, diffs, ingredientDiffs } = diff;

  // 재료 수량 숫자만 추출
  const extractNum = (str) => parseFloat(str?.replace(/[^0-9.]/g, '') || '0') || 0;

  const chartData = ingredientDiffs.length > 0 ? {
    labels: ingredientDiffs.map((d, i) => d.nameA !== '-' ? d.nameA : d.nameB),
    datasets: [
      {
        label: `v이전 (${commitA.message})`,
        data: ingredientDiffs.map(d => extractNum(d.amountA)),
        backgroundColor: 'rgba(100,100,100,0.5)',
      },
      {
        label: `v이후 (${commitB.message})`,
        data: ingredientDiffs.map(d => extractNum(d.amountB)),
        backgroundColor: 'rgba(30,30,30,0.85)',
      },
    ],
  } : null;

  return (
    <div style={{ background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 10, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>버전 비교</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>

      {/* 버전 정보 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={versionBox}>
          <p style={vLabel}>이전 버전</p>
          <p style={vMsg}>{commitA.message}</p>
          <p style={vDate}>{new Date(commitA.createdAt).toLocaleString('ko-KR')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 20 }}>→</div>
        <div style={{ ...versionBox, borderColor: '#111' }}>
          <p style={vLabel}>이후 버전</p>
          <p style={vMsg}>{commitB.message}</p>
          <p style={vDate}>{new Date(commitB.createdAt).toLocaleString('ko-KR')}</p>
        </div>
      </div>

      {/* 필드 변경 */}
      {diffs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>변경된 항목</h4>
          {diffs.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 12px', background: '#fff', borderRadius: 6, marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 600, width: 100, color: '#555' }}>{d.field}</span>
              <span style={{ color: '#aaa', textDecoration: 'line-through' }}>{d.before || '-'}</span>
              <span>→</span>
              <span style={{ fontWeight: 600 }}>{d.after || '-'}</span>
            </div>
          ))}
        </div>
      )}

      {/* 재료 변화 그래프 */}
      {chartData && (
        <div>
          <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>재료 배합 비율 변화</h4>
          <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
            <Bar data={chartData} options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
              scales: { y: { beginAtZero: true } },
            }} />
          </div>
        </div>
      )}

      {diffs.length === 0 && ingredientDiffs.length === 0 && (
        <p style={{ color: '#888', fontSize: 13 }}>두 버전 간 차이가 없습니다.</p>
      )}
    </div>
  );
}

const versionBox = { flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 8, background: '#fff' };
const vLabel = { margin: 0, fontSize: 11, color: '#aaa', fontWeight: 600 };
const vMsg = { margin: '4px 0 2px', fontWeight: 600, fontSize: 14 };
const vDate = { margin: 0, fontSize: 11, color: '#aaa' };
