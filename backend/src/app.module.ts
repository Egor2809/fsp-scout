import { Controller, Get, Module } from '@nestjs/common';
import { Database } from './database/database.service.js';
import { Readiness } from './common/readiness.service.js';
import { ProfilePdfController } from './users/profile-pdf.controller.js';
import { AccountDeletionController } from './users/account-deletion.controller.js';
import { UsersController } from './users/users.controller.js';
import { AuthGuard } from './auth/auth.guard.js';
import { ProfileController } from './users/profile.controller.js';
import { TaxonomyController } from './taxonomy/taxonomy.controller.js';
import { SurveysController } from './surveys/surveys.controller.js';
import { CompanyController } from './users/company.controller.js';
import { PrivacyController } from './users/privacy.controller.js';
import { InvitationsController } from './invitations/invitations.controller.js';
import { MatchingService } from './matching/matching.service.js';
import { CandidatesController } from './matching/candidates.controller.js';
import { NeedsController } from './needs/needs.controller.js';
import { SearchesController } from './searches/searches.controller.js';
import { FspController, FspWebhookController } from './fsp/fsp.controller.js';
import { ContractController } from './common/contract.controller.js';
import { EligibilityController } from './assessment/eligibility.controller.js';
import { VacanciesController } from './vacancies/vacancies.controller.js';
import { TasksController } from './tasks/tasks.controller.js';
import { ShowcaseController } from './assessment/showcase.controller.js';
import { AssessmentHistoryController } from './assessment/history.controller.js';
import { AssessmentAnswersController } from './assessment/answers.controller.js';
import { AssessmentLifecycleController } from './assessment/lifecycle.controller.js';
import { EvaluationController } from './evaluation/evaluation.controller.js';
import { ExportController } from './users/export.controller.js';
import { ResumeController } from './users/resume.controller.js';
import { AssessmentFinishController } from './assessment/finish.controller.js';
import { AssessmentRunController } from './assessment/run.controller.js';
import { VerificationController } from './users/verification.controller.js';

@Controller()
class HealthController {
  constructor(private readonly readiness: Readiness) {}
  @Get('health') health() { return { status: 'ok' }; }
  @Get('ready') async ready() { return this.readiness.check(); }
}

@Module({ controllers: [HealthController, ContractController, UsersController, ProfileController, TaxonomyController, SurveysController, CompanyController, PrivacyController, InvitationsController, CandidatesController, NeedsController, SearchesController, FspController, FspWebhookController, EligibilityController, VacanciesController, TasksController, ShowcaseController, AssessmentHistoryController, AssessmentAnswersController, AssessmentLifecycleController, EvaluationController, ExportController, ResumeController, AssessmentFinishController, AssessmentRunController, VerificationController, ProfilePdfController, AccountDeletionController], providers: [Database, AuthGuard, MatchingService, Readiness] })
export class AppModule {}







