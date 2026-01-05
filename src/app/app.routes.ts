import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'survey/:id',
    loadComponent: () => import('./features/survey-public/survey-public.component')
      .then(m => m.SurveyPublicComponent)
  },
  {
    path: 'inicio',
    redirectTo: 'test-drive-forms',
    pathMatch: 'full'
  },
  {
    path: 'encuestas',
    loadComponent: () => import('./features/surveys/surveys-admin.component')
      .then(m => m.SurveysAdminComponent)
  },
  {
    path: 'encuestas/respuestas/:id',
    loadComponent: () => import('./features/surveys/survey-response-view.component')
      .then(m => m.SurveyResponseViewComponent)
  },
  {
    path: 'encuestas/version/:versionId/revision',
    loadComponent: () => import('./features/surveys/survey-publish-review.component')
      .then(m => m.SurveyPublishReviewComponent)
  },
  {
    path: 'encuestas/version/:versionId',
    loadComponent: () => import('./features/surveys/survey-version-editor.component')
      .then(m => m.SurveyVersionEditorComponent)
  },
  {
    path: 'encuestas/:surveyId',
    loadComponent: () => import('./features/surveys/survey-admin-detail.component')
      .then(m => m.SurveyAdminDetailComponent)
  },
  {
    path: 'test-drive-forms',
    loadComponent: () => import('./features/drafts/drafts-list.component')
      .then(m => m.DraftsListComponent)
  },
  {
    path: 'vehicle-qr',
    loadComponent: () => import('./features/vehicle-qr/vehicle-qr.component')
      .then(m => m.VehicleQrComponent)
  },
  {
    path: 'test-drive-forms/:id',
    redirectTo: 'test-drive-forms/:id/cliente',
    pathMatch: 'full'
  },
  {
    path: 'test-drive-forms/:id/cliente',
    loadComponent: () => import('./features/drafts/draft-customer-view.component')
      .then(m => m.DraftCustomerViewComponent)
  },
  {
    path: 'test-drive-forms/:id/vehiculo',
    loadComponent: () => import('./features/drafts/draft-vehicle-edit.component')
      .then(m => m.DraftVehicleEditComponent)
  },
  {
    path: 'test-drive-forms/:id/firma',
    loadComponent: () => import('./features/drafts/draft-signature-view.component')
      .then(m => m.DraftSignatureViewComponent)
  },
  {
    path: 'test-drive-forms/:id/evaluacion',
    loadComponent: () => import('./features/drafts/draft-evaluation-edit.component')
      .then(m => m.DraftEvaluationEditComponent)
  },
  {
    path: 'test-drive-forms/:id/devolucion',
    loadComponent: () => import('./features/drafts/draft-return-edit.component')
      .then(m => m.DraftReturnEditComponent)
  },
  {
    path: 'test-drive-forms/:id/confirmacion',
    loadComponent: () => import('./features/drafts/draft-confirmation.component')
      .then(m => m.DraftConfirmationComponent)
  },
  {
    path: 'test-drive-forms/:id/ver',
    loadComponent: () => import('./features/drafts/draft-view.component')
      .then(m => m.DraftViewComponent)
  },
  {
    path: 'borradores',
    redirectTo: 'test-drive-forms',
    pathMatch: 'full'
  },
  {
    path: 'borradores/:id',
    redirectTo: 'test-drive-forms/:id/cliente',
    pathMatch: 'full'
  },
  {
    path: 'borradores/:id/cliente',
    redirectTo: 'test-drive-forms/:id/cliente',
    pathMatch: 'full'
  },
  {
    path: 'borradores/:id/vehiculo',
    redirectTo: 'test-drive-forms/:id/vehiculo',
    pathMatch: 'full'
  },
  {
    path: 'borradores/:id/firma',
    redirectTo: 'test-drive-forms/:id/firma',
    pathMatch: 'full'
  },
  {
    path: 'borradores/:id/evaluacion',
    redirectTo: 'test-drive-forms/:id/evaluacion',
    pathMatch: 'full'
  },
  {
    path: 'borradores/:id/devolucion',
    redirectTo: 'test-drive-forms/:id/devolucion',
    pathMatch: 'full'
  },
  {
    path: 'borradores/:id/confirmacion',
    redirectTo: 'test-drive-forms/:id/confirmacion',
    pathMatch: 'full'
  },
  {
    path: 'borradores/:id/ver',
    redirectTo: 'test-drive-forms/:id/ver',
    pathMatch: 'full'
  },
  {
    path: 'customer',
    loadComponent: () => import('./features/customer/customer.component')
      .then(m => m.CustomerComponent)
  },
  {
    path: 'vehicle',
    loadComponent: () => import('./features/vehicle/vehicle.component')
      .then(m => m.VehicleComponent)
  },
  {
    path: 'signature',
    loadComponent: () => import('./features/signature-summary/signature-summary.component')
      .then(m => m.SignatureSummaryComponent)
  },
  {
    path: 'evaluation',
    loadComponent: () => import('./features/evaluation/evaluation.component')
      .then(m => m.EvaluationComponent)
  },
  {
    path: 'return',
    loadComponent: () => import('./features/vehicle-return/vehicle-return.component')
      .then(m => m.VehicleReturnComponent)
  },
  {
    path: 'confirmation',
    loadComponent: () => import('./features/confirmation/confirmation.component')
      .then(m => m.ConfirmationComponent)
  },
];
