import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeAppComponent } from './home-app/home-app.component';
import { AuthComponent } from './Interfaces_Authentification/auth/auth.component';
import { LoginClientComponent } from './Interfaces_Authentification/login-client/login-client.component';
import { LoginFreelancerComponent } from './Interfaces_Authentification/login-freelancer/login-freelancer.component';
import { RegisterClientComponent } from './Interfaces_Authentification/register-client/register-client.component';
import { RegisterFreelancerComponent } from './Interfaces_Authentification/register-freelancer/register-freelancer.component';
import { ClientFeedComponent } from './Interfaces_Client/client-feed/client-feed.component';
import { ProjectDetailsComponent } from './Interfaces_Freelancers/project-details/project-details.component';
import { ClientDashboardComponent } from './Interfaces_Client/client-dashboard/client-dashboard.component';
import { ProjectProposalsComponent } from './Interfaces_Client/project-proposals/project-proposals.component';
import { AllProjectsComponent } from './Interfaces_Client/all-projects/all-projects.component';
import { ClientProfileComponent } from './Interfaces_Client/client-profile/client-profile.component';
import { VirtualContractComponent } from './Interfaces_Client/virtual-contract/virtual-contract.component';
import { FreelancerFeedComponent } from './Interfaces_Freelancers/freelancer-feed/freelancer-feed.component';
import { FreelancerJobsComponent } from './Interfaces_Freelancers/freelancer-jobs/freelancer-jobs.component';
import { FreelancerProfilComponent } from './Interfaces_Freelancers/freelancer-profil/freelancer-profil.component';
import { DetailclientprojectComponent } from './Interfaces_Client/detailclientproject/detailclientproject.component';
import { ProfileManagerComponent } from './Interfaces_Freelancers/profile-manager/profile-manager.component';
import { LeaderboardFreelancerComponent } from './Interfaces_Freelancers/leaderboard-freelancer/leaderboard-freelancer.component';
import { ClientWalletComponent } from './Interfaces_Client/client-wallet/client-wallet.component';
import { ClientProfilManagerComponent } from './Interfaces_Client/client-profil-manager/client-profil-manager.component';
import { DashboardFreelancerComponent } from './Interfaces_Freelancers/dashboard-freelancer/dashboard-freelancer.component';
import { FreelancerWalletComponent } from './Interfaces_Freelancers/freelancer-wallet/freelancer-wallet.component';
import { TechnicalSupportComponent } from './interface_communication/technical-support/technical-support.component';
import { MessengerComponent } from './interface_communication/messenger/messenger.component';
import { DashboardAdminComponent } from './Interfaces_Admin/dashboard-admin/dashboard-admin.component';
import { UserAdminComponent } from './Interfaces_Admin/user-admin/user-admin.component';
import { JobsAdminComponent } from './Interfaces_Admin/jobs-admin/jobs-admin.component';
import { DetailJobsAdminComponent } from './Interfaces_Admin/detail-jobs-admin/detail-jobs-admin.component';
import { DisputesAdminComponent } from './Interfaces_Admin/disputes-admin/disputes-admin.component';
import { FinanceAdminComponent } from './Interfaces_Admin/finance-admin/finance-admin.component';
import { CompetenceAdminComponent } from './Interfaces_Admin/competence-admin/competence-admin.component';
import { ContractCreationComponent } from './Interfaces_Client/contract-creation/contract-creation.component';
import { ClientContractComponent } from './Interfaces_Client/client-contract/client-contract.component';
import { ClientContractDetailsComponent } from './Interfaces_Client/client-contract-details/client-contract-details.component';
import { FreelancerContractsComponent } from './Interfaces_Freelancers/freelancer-contracts/freelancer-contracts.component';
import { FreelancerContractReviewComponent } from './Interfaces_Freelancers/freelancer-contract-review/freelancer-contract-review.component';
import { FreelancerContractDetailsComponent } from './Interfaces_Freelancers/freelancer-contract-details/freelancer-contract-details.component';
import { authGuard } from './Interfaces_Authentification/Guards/auth.guard';

const routes: Routes = [



  {path:'',component: HomeAppComponent, },

//Authentification routes
  {path:'Auth',component: AuthComponent, },
  {path:'LoginClient',component: LoginClientComponent, },
  {path:'LoginFreelancer',component: LoginFreelancerComponent, },
  {path:'RegisterClient',component: RegisterClientComponent, },
  {path:'RegisterFreelancer',component: RegisterFreelancerComponent, },

//client routes
 {path:'ClientFeed',component: ClientFeedComponent, canActivate: [authGuard], data: { role: 'CLIENT' } },
 {path:'ClientDashboard',component:ClientDashboardComponent,  canActivate: [authGuard], data: { role: 'CLIENT' } },
 {path:'ProjectProposals/:id',component:ProjectProposalsComponent,  canActivate: [authGuard], data: { role: 'CLIENT' } },
 {path:'AllProjects',component:AllProjectsComponent,  canActivate: [authGuard], data: { role: 'CLIENT' } },
 {path:'ClientProfil',component:ClientProfileComponent,  canActivate: [authGuard], data: { role: 'CLIENT' } },
 {path:'VirtualContract',component:VirtualContractComponent,  canActivate: [authGuard], data: { role: 'CLIENT' } },
 {path:'ClientDetailProject/:id',component:DetailclientprojectComponent,  canActivate: [authGuard], data: { role: 'CLIENT' } },
 {path:'ClientProfileManager',component:ClientProfilManagerComponent,  canActivate: [authGuard], data: { role: 'CLIENT' } },
 {path:'ClientWallet',component:ClientWalletComponent,  canActivate: [authGuard], data: { role: 'CLIENT' } },
 {path:'ClientCreateContract/:proposalId',component:ContractCreationComponent,  canActivate: [authGuard], data: { role: 'CLIENT' } },
 {path:'ClientContracts', component: ClientContractComponent , canActivate: [authGuard], data: { role: 'CLIENT' } },
 {path:'ClientContracts/:id', component: ClientContractDetailsComponent,  canActivate: [authGuard], data: { role: 'CLIENT' } },



 //Freelancer routes
{path:'FreelancerContractDetails/:id',component:FreelancerContractDetailsComponent, canActivate: [authGuard], data: { role: 'FREELANCER' }},
{path:'FreelancerContractReview/:id',component:FreelancerContractReviewComponent, canActivate: [authGuard], data: { role: 'FREELANCER' }},
{path:'FreelancerContracts',component:FreelancerContractsComponent, canActivate: [authGuard], data: { role: 'FREELANCER' }},
{path:'ProjectDetails/:id',component:ProjectDetailsComponent, canActivate: [authGuard], data: { role: 'FREELANCER' }},
{path:'FreelancerDashboard',component:DashboardFreelancerComponent, canActivate: [authGuard], data: { role: 'FREELANCER' }},
{path:'FreelancerProfileManager',component:ProfileManagerComponent, canActivate: [authGuard], data: { role: 'FREELANCER' }},
{path:'FreelancerFeed',component:FreelancerFeedComponent, canActivate: [authGuard], data: { role: 'FREELANCER' }},
{path:'FreelancerJobs',component:FreelancerJobsComponent, canActivate: [authGuard], data: { role: 'FREELANCER' }},
{path:'FreelancerProfil',component:FreelancerProfilComponent, canActivate: [authGuard], data: { role: 'FREELANCER' }},
{path:'LeaderboardFreelancer',component:LeaderboardFreelancerComponent, canActivate: [authGuard], data: { role: 'FREELANCER' }},
{path:'FreelancerWallet',component:FreelancerWalletComponent, canActivate: [authGuard], data: { role: 'FREELANCER' }},

 //Communication routes
{path:'TechnicalSupport',component:TechnicalSupportComponent, },
{path:'Messenger',component:MessengerComponent, },

//Admin routes
{path:'AdminDashboard',component:DashboardAdminComponent, },
{path:'AdminUsers',component:UserAdminComponent, },
{path:'AdminJobs',component:JobsAdminComponent, },
{path:'DetailJobs',component:DetailJobsAdminComponent, },
{path:'AdminDisputes',component:DisputesAdminComponent, },
{path:'AdminFinance',component:FinanceAdminComponent, },
{path:'AdminSkills',component:CompetenceAdminComponent, },









   
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
