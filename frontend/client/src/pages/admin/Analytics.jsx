import React, { useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

function LineChart({ data = [] }) {
  const d = useMemo(() => {
    if (!data.length) return '';
    const w = 480, h = 160;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const norm = (v) => max === min ? h/2 : h - ((v - min) / (max - min)) * h;
    return data.map((v, i) => `${(i/(data.length-1))*w},${norm(v)}`).join(' ');
  }, [data]);
  return (
    <svg width={480} height={160} style={{ width: '100%', height: 160, display: 'block' }} viewBox="0 0 480 160" preserveAspectRatio="none">
      <polyline fill="none" stroke="#06d6a0" strokeWidth="2" points={d} />
    </svg>
  );
}

export default function Analytics() {
  const visits = [120, 180, 160, 220, 260, 300, 280, 320, 360, 400, 380, 420];
  const conv = [2.1, 2.3, 2.7, 2.4, 2.9, 3.1, 3.0];

  return (
    <AdminLayout title="Analytics">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
        <div style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
          <div style={{ fontSize:12, opacity:0.8 }}>Monthly Visits</div>
          <LineChart data={visits} />
        </div>
        <div style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
          <div style={{ fontSize:12, opacity:0.8 }}>Conversion Rate (%)</div>
          <LineChart data={conv} />
        </div>
        <div style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
          <div style={{ fontSize:12, opacity:0.8 }}>Top Channels</div>
          <ul style={{ margin:0, paddingLeft:18, lineHeight:1.8 }}>
            <li>Organic Search</li>
            <li>Direct</li>
            <li>Social</li>
            <li>Email</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
