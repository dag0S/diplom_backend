import { IsString } from "class-validator";

export class CreateConsultationDto {
  @IsString({ message: "ID доктора должно быть строкой" })
  doctorId: string;

  @IsString({ message: "ID пациента должно быть строкой" })
  patientId: string;
}
