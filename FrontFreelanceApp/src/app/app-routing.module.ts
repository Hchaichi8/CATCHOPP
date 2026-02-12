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
 {path:'ClientDetailProject',component:DetailclientprojectComponent, },
 {path:'ClientProfileManager',component:ClientProfilManagerComponent, },
 {path:'ClientWallet',component:ClientWalletComponent, },



 //Freelancer routes
{path:'FreelancerDashboard',component:DashboardFreelancerComponent, },
{path:'FreelancerProfileManager',component:ProfileManagerComponent, },
{path:'FreelancerFeed',component:FreelancerFeedComponent, },
{path:'FreelancerJobs',component:FreelancerJobsComponent, },
{path:'FreelancerProfil',component:FreelancerProfilComponent, },
{path:'LeaderboardFreelancer',component:LeaderboardFreelancerComponent, },
{path:'FreelancerWallet',component:FreelancerWalletComponent, },

 //Communication routes
{path:'TechnicalSupport',component:TechnicalSupportComponent, },
{path:'Messenger',component:MessengerComponent, },

//Admin routes
{path:'AdminDashboard',component:DashboardAdminComponent, },
{path:'AdminUsers',component:UserAdminComponent, },
{path:'AdminJobs',component:JobsAdminComponent, },
{path:'DetailJobs',component:DetailJobsAdminComponent, },
{path:'AdminDisputes',component:DisputesAdminComponent, },








   
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
