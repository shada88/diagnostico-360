import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { AuthGuard } from '@nestjs/passport';
import { StartSurveyDto } from './dto/start-survey.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    return user ?? null;
  }
}

@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  /** GET /responses — returns all attempts for the authenticated user */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAllByUser(@Request() req) {
    return this.responsesService.findAllByUser(req.user.userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  startSurvey(@Request() req, @Body() dto: StartSurveyDto) {
    const userId = req.user?.userId ?? null;
    return this.responsesService.start(userId, dto.surveyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.responsesService.findOne(id);
  }

  @Post(':id/answers')
  submitAnswer(@Param('id') id: string, @Body() dto: SaveAnswerDto) {
    return this.responsesService.saveAnswer(id, dto);
  }

  @Post(':id/finalize')
  finalizeAttempt(@Param('id') id: string) {
    return this.responsesService.finalize(id);
  }

  /** DELETE /responses/:id — soft-deletes an attempt owned by the authenticated user */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async softDelete(@Param('id') id: string, @Request() req) {
    const attempt = await this.responsesService.findOne(id);
    if (!attempt || attempt.userId !== req.user.userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este diagnóstico.');
    }
    return this.responsesService.softDelete(id);
  }
}
