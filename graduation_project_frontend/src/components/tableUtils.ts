export function exportToCSV(filename: string, rows: any[]) {
  if (!rows || !rows.length) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  // Flatten rows: convert object values to JSON strings
  const flattened = rows.map((r) => {
    const out: any = {};
    Object.keys(r).forEach((k) => {
      const v = (r as any)[k];
      if (v && typeof v === 'object') {
        try {
          // prefer simple name fields if exist
          if ('name' in v) out[k] = v.name;
          else if ('title' in v) out[k] = v.title;
          else if ('group_name' in v) out[k] = v.group_name;
          else out[k] = JSON.stringify(v);
        } catch (e) {
          out[k] = String(v);
        }
      } else {
        out[k] = v == null ? '' : v;
      }
    });
    return out;
  });

  const headers = Array.from(new Set(flattened.flatMap(r => Object.keys(r))));

  const csvRows = [headers.join(',')];
  for (const row of flattened) {
    const vals = headers.map(h => {
      const cell = (row as any)[h];
      const escaped = String(cell).replace(/"/g, '""');
      // wrap in quotes if contains comma or newline
      if (escaped.indexOf(',') >= 0 || escaped.indexOf('\n') >= 0) return `"${escaped}"`;
      return escaped;
    });
    csvRows.push(vals.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
