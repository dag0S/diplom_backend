import { Controller } from "@nestjs/common";

import { ConsultationService } from "./consultation.service";

@Controller("consultations")
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}
}
