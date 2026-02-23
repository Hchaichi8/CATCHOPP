import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
import { ProjectDetailsComponent } from './Interfaces_Freelancers/project-details/project-details.component';
import { ClientDashboardComponent } from './Interfaces_Client/client-dashboard/client-dashboard.component';
import { ProjectProposalsComponent } from './Interfaces_Client/project-proposals/project-proposals.component';
import { AllProjectsComponent } from './Interfaces_Client/all-projects/all-projects.component';
import { ClientProfileComponent } from './Interfaces_Client/client-profile/client-profile.component';
import { CommonModule } from '@angular/common';
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
import { MessengerComponent } from './interface_communication/messenger/messenger.component';
import { TechnicalSupportComponent } from './interface_communication/technical-support/technical-support.component';
import { DashboardAdminComponent } from './Interfaces_Admin/dashboard-admin/dashboard-admin.component';
import { UserAdminComponent } from './Interfaces_Admin/user-admin/user-admin.component';
import { JobsAdminComponent } from './Interfaces_Admin/jobs-admin/jobs-admin.component';
import { DetailJobsAdminComponent } from './Interfaces_Admin/detail-jobs-admin/detail-jobs-admin.component';
import { DisputesAdminComponent } from './Interfaces_Admin/disputes-admin/disputes-admin.component';
import { FinanceAdminComponent } from './Interfaces_Admin/finance-admin/finance-admin.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CompetenceAdminComponent } from './Interfaces_Admin/competence-admin/competence-admin.component';
import { ContractCreationComponent } from './Interfaces_Client/contract-creation/contract-creation.component';
import { ClientContractComponent } from './Interfaces_Client/client-contract/client-contract.component';
import { ClientContractDetailsComponent } from './Interfaces_Client/client-contract-details/client-contract-details.component';
import { FreelancerContractsComponent } from './Interfaces_Freelancers/freelancer-contracts/freelancer-contracts.component';
import { FreelancerContractReviewComponent } from './Interfaces_Freelancers/freelancer-contract-review/freelancer-contract-review.component';
import { FreelancerContractDetailsComponent } from './Interfaces_Freelancers/freelancer-contract-details/freelancer-contract-details.component';

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
        FreelancerProfilComponent,
        DetailclientprojectComponent,
        ProfileManagerComponent,
        LeaderboardFreelancerComponent,
        ClientWalletComponent,
        ClientProfilManagerComponent,
        DashboardFreelancerComponent,
        FreelancerWalletComponent,
        MessengerComponent,
        TechnicalSupportComponent,
        DashboardAdminComponent,
        UserAdminComponent,
        JobsAdminComponent,
        DetailJobsAdminComponent,
        DisputesAdminComponent,
        FinanceAdminComponent,
        CompetenceAdminComponent,
        ContractCreationComponent,
        ClientContractComponent,
        ClientContractDetailsComponent,
        FreelancerContractsComponent,
        FreelancerContractReviewComponent,
        FreelancerContractDetailsComponent,
        
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
