import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';

describe('managed-company spreadsheet compatibility after security upgrade', () => {
  it('round-trips XLSX company data without losing leading-zero identifiers', () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ['Company Name', 'Company Number', 'Status'],
      ['Audit Company', '00123456', 'available'],
    ]), 'Companies');
    const bytes = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const imported = XLSX.read(bytes, { type: 'array', cellDates: true });
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(imported.Sheets[imported.SheetNames[0]], { defval: null, raw: false });
    expect(rows).toEqual([{ 'Company Name': 'Audit Company', 'Company Number': '00123456', Status: 'available' }]);
    expect(XLSX.SSF.parse_date_code(45292)?.y).toBe(2024);
  });
});
