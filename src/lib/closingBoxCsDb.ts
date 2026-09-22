import type { RowDataPacket } from 'mysql2/promise';
import { NextResponse } from 'next/server';
import { calculateClosingBoxCsMetrics, ClosingBoxCsValidationError, type ClosingBoxCsInput, type ClosingBoxCsRecord, type ClosingBoxCsMetrics } from './closingBoxCs';

// Format dates in SQL so a server timezone cannot shift the recorded date.
export const CS_SELECT = `SELECT id, product_id AS productId, DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal,
  platform, adv, lead_wa AS leadWa, lead_form AS leadForm, nc_closing AS ncClosing,
  nc_box AS ncBox, fu_closing AS fuClosing, fu_box AS fuBox, dibuat_oleh AS dibuatOleh
  FROM closing_box_cs`;

export interface ClosingBoxCsDbRow extends RowDataPacket, Omit<ClosingBoxCsRecord, keyof ClosingBoxCsMetrics> {}

export function withClosingMetrics(row: ClosingBoxCsDbRow): ClosingBoxCsRecord {
  return { ...row, ...calculateClosingBoxCsMetrics(row) };
}

export function csValues(data: ClosingBoxCsInput) {
  return [data.tanggal, data.platform, data.adv, data.leadWa, data.leadForm,
    data.ncClosing, data.ncBox, data.fuClosing, data.fuBox];
}

export function csErrorResponse(error: unknown) {
  if (error instanceof ClosingBoxCsValidationError || error instanceof SyntaxError) {
    return NextResponse.json({ success: false, error: error instanceof SyntaxError ? 'Format data tidak valid.' : error.message }, { status: 400 });
  }
  if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_NO_REFERENCED_ROW_2') {
    return NextResponse.json({ success: false, error: 'Produk tidak ditemukan.' }, { status: 404 });
  }
  console.error('[Closing Box CS]', error);
  return NextResponse.json({ success: false, error: 'Gagal memproses data Closing Box CS. Silakan coba lagi.' }, { status: 500 });
}
