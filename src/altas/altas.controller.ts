import {
  Body,
  Controller,
  Post,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { validAlta } from '../mock/alta-validation';
import sampleAlta from '../mock/sample-alta.json';

@ApiTags('Maestro personas')
@ApiBearerAuth('bearer')
@UseGuards(BearerAuthGuard)
@Controller('maestro-personas/api/v1')
export class AltasController {
  @Post('altas')
  @ApiOperation({ summary: 'Alta de persona (mock exitoso)' })
  @ApiBody({
    description: 'Campos según schemas.json → alta',
    schema: { example: sampleAlta },
  })
  alta(@Req() req: Request, @Body() body: unknown) {
    const contentType = req.headers['content-type']?.split(';')[0]?.trim();
    const length = Number(req.headers['content-length'] ?? 0);
    if (contentType !== 'application/json' || length <= 0 || length > 65536) {
      throw new BadRequestException();
    }
    if (!validAlta(body)) {
      throw new BadRequestException();
    }
    const transactionId = randomUUID();
    const record = body as Record<string, unknown>;
    return {
      transaction_id: transactionId,
      magneto_id:
        typeof record.magneto_id === 'string'
          ? record.magneto_id
          : `MAG-MOCK-${transactionId}`,
      user_id: `USER-MOCK-${transactionId}`,
      contract_id: `CONTRACT-MOCK-${transactionId}`,
    };
  }
}
