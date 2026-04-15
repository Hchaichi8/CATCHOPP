import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeAppComponent } from './home-app/home-app.component';
import { AuthComponent } from './Interfaces_Authentification/auth/auth.component';
import { LoginClientComponent } from './Interfaces_Authentification/login-client/login-client.component';
import { LoginFreelancerComponent } from './Interfaces_Authentification/login-freelancer/login-freelancer.component';
import { RegisterClientComponent } from './Interfaces_Authentification/register-client/register-client.component';
import { RegisterFreelancerComponent } from './Interfaces_Authentification/register-freelancer/register-freelancer.component';
import { ClientFeedComponent } from './Interfaces_Client/client-feed/client-feed.component';
import { ProjectDetailsComponent } from './Interfaces_Client/project-details/project-details.component';
import { ClientDashboardComponent } from './Interfaces_Client/client-dashboard/client-dashboard.component';
import { ProjectProposalsComponent } from './Interfaces_Client/project-proposals/project-proposals.component';
import { AllProjectsComponent } from './Interfaces_Client/all-projects/all-projects.component';
import { ClientProfileComponent } from './Interfaces_Client/client-profile/client-profile.component';
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
import { SkillTestsListComponent } from './Interfaces_SkillTests/skill-tests-list/skill-tests-list.component';
import { LeagueProfileComponent } from './Interfaces_SkillTests/league-profile/league-profile.component';
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
import { NotificationsPageComponent } from './shared/notifications-page/notifications-page.component';
import { AiInterviewSimulatorComponent } from './Interfaces_SkillTests/ai-interview-simulator/ai-interview-simulator.component';
import { AiChatComponent } from './Interfaces_SkillTests/ai-chat/ai-chat.component';
import { AiVideoCallComponent } from './Interfaces_SkillTests/ai-video-call/ai-video-call.component';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [



  {path:'',component: HomeAppComponent, },

//Authentification routes
  {path:'Auth',component: AuthComponent, },
  {path:'LoginClient',component: LoginClientComponent, },
  {path:'LoginFreelancer',component: LoginFreelancerComponent, },
  {path:'RegisterClient',component: RegisterClientComponent, },
  {path:'RegisterFreelancer',component: RegisterFreelancerComponent, },
//client routes
 {path:'ClientFeed',component: ClientFeedComponent, },
 {path:'ProjectDetails',component:ProjectDetailsComponent, },
 {path:'ClientDashboard',component:ClientDashboardComponent, },
 {path:'ProjectProposals/:id',component:ProjectProposalsComponent, },
 {path:'AllProjects',component:AllProjectsComponent, },
 {path:'ClientProfil',component:ClientProfileComponent, },
 {path:'VirtualContract',component:VirtualContractComponent, },

 //Freelancer routes
{path:'FreelancerFeed',component:FreelancerFeedComponent, },
{path:'FreelancerJobs',component:FreelancerJobsComponent, },

//Subscription routes (Module 3 - Freelancer)
{path:'SubscriptionPlans',component:SubscriptionPlansComponent, },
{path:'SubscriptionDetail/:id',component:SubscriptionDetailComponent, },
{path:'SubscriptionCheckout/:id',component:SubscriptionCheckoutComponent, },
{path:'SubscriptionDashboard',component:SubscriptionDashboardComponent, },
{path:'PlanComparator',component:PlanComparatorComponent, },

// Admin back-office (Protected by AdminGuard)
{path:'AdminSubscriptions',component:AdminSubscriptionsComponent, canActivate: [AdminGuard] },
{path:'AdminCertifications',component:AdminCertificationsComponent, canActivate: [AdminGuard] },
{path:'AdminSkillTests',component:AdminSkillTestsComponent, canActivate: [AdminGuard] },
{path:'AdminStatistics',component:AdminStatisticsComponent, canActivate: [AdminGuard] },
{path:'AdminPromoCodes',component:AdminPromoCodesComponent, canActivate: [AdminGuard] },
{path:'AdminPlans',component:AdminPlansComponent, canActivate: [AdminGuard] },
{path:'AdminUsers',component:AdminUsersComponent, canActivate: [AdminGuard] },

// Skill Tests & Certifications
{path:'SkillTests',component:SkillTestsListComponent, },
{path:'LeagueProfile/:userId',component:LeagueProfileComponent, },
{path:'SkillTestTake/:id',component:SkillTestTakeComponent, },
{path:'SkillTestResult/:id',component:SkillTestResultComponent, },
{path:'MyCertifications',component:MyCertificationsComponent, },
{path:'AIInterviewSimulator',component:AiInterviewSimulatorComponent, },
{path:'AiCoach',component:AiChatComponent, },
{path:'AiVideoCall',component:AiVideoCallComponent, },

// Referral & Affiliate Program
{path:'ReferralDashboard',component:ReferralDashboardComponent, },

// Time Zone & Availability (Freelancer + Client)
{path:'MyAvailability',component:MyAvailabilityComponent, },
{path:'WorldClock',component:WorldClockViewComponent, },
{path:'worldclock',redirectTo:'WorldClock', pathMatch:'full' },

// AI CV Generator (Premium/Enterprise only)
{path:'AICVGenerator',component:AiCvGeneratorComponent, },

// Rewards & Promo Codes
{path:'rewards',component:RewardsDashboardComponent, },
{path:'rewards/spin-wheel',component:SpinWheelComponent, },

// In-app notification inbox (Angular UI — not the API on :8081)
{ path: 'notifications', redirectTo: 'Notifications', pathMatch: 'full' },
{ path: 'Notifications', component: NotificationsPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
