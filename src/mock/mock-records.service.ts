import { Injectable } from '@nestjs/common';
import generated from './records.generated.json';
import { MockRecord, RecordKind, SOURCES } from './sources';

interface GeneratedRow {
  kind: RecordKind;
  key: string;
  source: string;
  fields: Record<string, unknown>;
}

@Injectable()
export class MockRecordsService {
  private readonly rows: MockRecord[];
  private readonly index = new Map<string, MockRecord>();

  constructor() {
    this.rows = (generated as GeneratedRow[]).map(({ kind: _kind, ...record }) => record);
    for (const row of generated as GeneratedRow[]) {
      this.index.set(`${row.kind}\0${row.key}`, {
        key: row.key,
        source: row.source,
        fields: row.fields,
      });
    }
  }

  page(page: number, pageSize: number): MockRecord[] {
    const start = (page - 1) * pageSize;
    return this.rows.slice(start, start + pageSize);
  }

  lookup(type: RecordKind, key: string): MockRecord | undefined {
    if (!(type in SOURCES)) {
      return undefined;
    }
    return this.index.get(`${type}\0${key}`);
  }
}
