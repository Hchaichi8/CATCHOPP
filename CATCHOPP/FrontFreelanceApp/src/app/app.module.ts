import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeAppComponent } from './home-app/home-app.component';
import { CreatePubComponent } from './Interfaces_Client/create-pub/create-pub.component';
import { AuthComponent } from './Interfaces_Authentification/auth/auth.component';
import { LoginFreelancerComponent } from './Interfaces_Authentification/login-freelancer/login-freelancer.component';
import { LoginClientComponent } from './Interfaces_Authentification/login-client/login-client.component';
import { RegisterFreelancerComponent } from './Interfaces_Authentification/register-freelancer/register-freelancer.component';
import { RegisterClientComponent } from './Interfaces_Authentification/register-client/register-client.component';
import { ClientFeedComponent } from './Interfaces_Client/client-feed/client-feed.component';
import { ProjectDetailsComponent } from './Interfaces_Client/project-details/project-details.component';
import { ClientDashboardComponent } from './Interfaces_Client/client-dashboard/client-dashboard.component';
import { ProjectProposalsComponent } from './Interfaces_Client/project-proposals/project-proposals.component';
import { AllProjectsComponent } from './Interfaces_Client/all-projects/all-projects.component';
import { ClientProfileComponent } from './Interfaces_Client/client-profile/client-profile.component';
import { CommonModule } from '@angular/common';
import { VirtualContractComponent } from './Interfaces_Client/virtual-contract/virtual-contract.component';
import { FreelancerFeedComponent } from './Interfaces_Freelancers/freelancer-feed/freelancer-feed.component';
import { FreelancerJobsComponent } from './Interfaces_Freelancers/freelancer-jobs/freelancer-jobs.component';
import { SubscriptionPlansComponent } from './Interfaces_Subscription/subscription-plans/subscription-plans.component';
import { SubscriptionDetailComponent } from './Interfaces_Subscription/subscription-detail/subscription-detail.component';
import { SubscriptionCheckoutComponent } from './Interfaces_Subscription/subscription-checkout/subscription-checkout.component';
import { SubscriptionDashboardComponent } from './Interfaces_Subscription/subscription-dashboard/subscription-dashboard.component';
import { AdminSubscriptionsComponent } from './Interfaces_Admin/admin-subscriptions/admin-subscriptions.component';
import { AdminCertificationsComponent } from './Interfaces_Admin/admin-certifications/admin-certifications.component';
import { AdminStatisticsComponent } from './Interfaces_Admin/admin-statistics/admin-statistics.component';
import { AdminPromoCodesComponent } from './Interfaces_Admin/admin-promo-codes/admin-promo-codes.component';
import { PlanComparatorComponent } from './Interfaces_Subscription/plan-comparator/plan-comparator.component';
import { NotificationCenterComponent } from './shared/notification-center/notification-center.component';
import { DarkModeToggleComponent } from './shared/dark-mode-toggle/dark-mode-toggle.component';
import { NgChartsModule } from 'ng2-charts';
import { SkillTestsListComponent } from './Interfaces_SkillTests/skill-tests-list/skill-tests-list.component';
import { SkillTestTakeComponent } from './Interfaces_SkillTests/skill-test-take/skill-test-take.component';
import { SkillTestResultComponent } from './Interfaces_SkillTests/skill-test-result/skill-test-result.component';
import { MyCertificationsComponent } from './Interfaces_SkillTests/my-certifications/my-certifications.component';
import { ReferralDashboardComponent } from './Interfaces_Referral/referral-dashboard/referral-dashboard.component';
import { MyAvailabilityComponent } from './Interfaces_Availability/my-availability/my-availability.component';
import { WorldClockViewComponent } from './Interfaces_Availability/world-clock-view/world-clock-view.component';
import { AdminPlansComponent } from './Interfaces_Admin/admin-plans/admin-plans.component';
import { AdminUsersComponent } from './Interfaces_Admin/admin-users/admin-users.component';
import { AdminSkillTestsComponent } from './Interfaces_Admin/admin-skill-tests/admin-skill-tests.component';
import { AiCvGeneratorComponent } from './Interfaces_AI/ai-cv-generator/ai-cv-generator.component';
import { RewardsDashboardComponent } from './Interfaces_Rewards/rewards-dashboard/rewards-dashboard.component';
import { SpinWheelComponent } from './Interfaces_Rewards/spin-wheel/spin-wheel.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeAppComponent,
    CreatePubComponent,
    AuthComponent,
    LoginFreelancerComponent,
    LoginClientComponent,
    RegisterFreelancerComponent,
    RegisterClientComponent,
    ClientFeedComponent,
    ProjectDetailsComponent,
    ClientDashboardComponent,
    ProjectProposalsComponent,
    AllProjectsComponent,
  
    ClientProfileComponent,
        VirtualContractComponent,
        FreelancerFeedComponent,
        FreelancerJobsComponent,
        SubscriptionPlansComponent,
        SubscriptionDetailComponent,
        SubscriptionCheckoutComponent,
        SubscriptionDashboardComponent,
        AdminSubscriptionsComponent,
        AdminCertificationsComponent,
        AdminStatisticsComponent,
        AdminPromoCodesComponent,
        PlanComparatorComponent,
        NotificationCenterComponent,
        DarkModeToggleComponent,
        SkillTestsListComponent,
        SkillTestTakeComponent,
        SkillTestResultComponent,
        MyCertificationsComponent,
        ReferralDashboardComponent,
        MyAvailabilityComponent,
        WorldClockViewComponent,
        AdminPlansComponent,
        AdminUsersComponent,
        AdminSkillTestsComponent,
        AiCvGeneratorComponent,
        RewardsDashboardComponent,
        SpinWheelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
