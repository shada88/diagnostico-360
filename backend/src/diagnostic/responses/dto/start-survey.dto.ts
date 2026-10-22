import { IsString } from 'class-validator';

export class StartSurveyDto {
  @IsString()
  surveyId: string;
}
