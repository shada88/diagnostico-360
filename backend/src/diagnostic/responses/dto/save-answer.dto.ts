import { IsString, IsInt, Min, Max } from 'class-validator';

export class SaveAnswerDto {
  @IsString()
  questionId: string;

  @IsInt()
  @Min(1)
  @Max(10)
  value: number;
}
