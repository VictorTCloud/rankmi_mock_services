export const SOURCES = {
  estructura: 'DATOS_ESTRUCTURA_ATS.xlsx',
  contrato: 'GB_DATOS_DE_CONTRATO_ATS_2026_10_05.txt',
} as const;

export type RecordKind = keyof typeof SOURCES;

export interface MockRecord {
  key: string;
  source: string;
  fields: Record<string, unknown>;
}

export interface IndexedRecord {
  kind: RecordKind;
  record: MockRecord;
}
