import {
  Controller,
  Get,
  BadRequestException,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { MockRecordsService } from '../mock/mock-records.service';
import { RecordKind, SOURCES } from '../mock/sources';

function singleQuery(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value.length === 1 ? value[0] : undefined;
  }
  return value;
}

@ApiTags('Seguros Bolívar')
@ApiBearerAuth('bearer')
@UseGuards(BearerAuthGuard)
@Controller('api/v1/seguros-bolivar')
export class SegurosBolivarController {
  constructor(private readonly records: MockRecordsService) {}

  @Get('carga-masiva')
  @ApiOperation({ summary: 'Carga masiva paginada' })
  @ApiQuery({ name: 'page', required: true, example: 1 })
  @ApiQuery({ name: 'pageSize', required: true, example: 2 })
  cargaMasiva(
    @Query('page') pageRaw?: string,
    @Query('pageSize') pageSizeRaw?: string,
  ) {
    const page = pageRaw !== undefined ? Number(pageRaw) : NaN;
    const pageSize = pageSizeRaw !== undefined ? Number(pageSizeRaw) : NaN;
    if (
      !Number.isInteger(page) ||
      !Number.isInteger(pageSize) ||
      page < 1 ||
      pageSize < 1
    ) {
      throw new BadRequestException();
    }
    return { mark: 'SEGUROS', data: this.records.page(page, pageSize) };
  }

  @Get('registro')
  @ApiOperation({ summary: 'Consulta por tipo y llave' })
  @ApiQuery({ name: 'type', enum: Object.keys(SOURCES) })
  @ApiQuery({ name: 'key', required: true })
  registro(
    @Query('type') typeRaw?: string | string[],
    @Query('key') keyRaw?: string | string[],
  ) {
    const type = singleQuery(typeRaw);
    const key = singleQuery(keyRaw);
    if (type === undefined || key === undefined || key === '' || !(type in SOURCES)) {
      throw new BadRequestException();
    }
    const record = this.records.lookup(type as RecordKind, key);
    if (!record) {
      throw new NotFoundException();
    }
    return { mark: 'SEGUROS', data: [record] };
  }
}
