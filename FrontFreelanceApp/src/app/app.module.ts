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
import { ProjectDetailsComponent } from './Interfaces_Client/project-details/project-details.component';
import { ClientDashboardComponent } from './Interfaces_Client/client-dashboard/client-dashboard.component';
import { ProjectProposalsComponent } from './Interfaces_Client/project-proposals/project-proposals.component';
import { AllProjectsComponent } from './Interfaces_Client/all-projects/all-projects.component';
import { ClientProfileComponent } from './Interfaces_Client/client-profile/client-profile.component';
import { CommonModule } from '@angular/common';
import { VirtualContractComponent } from './Interfaces_Client/virtual-contract/virtual-contract.component';
import { FreelancerFeedComponent } from './Interfaces_Freelancers/freelancer-feed/freelancer-feed.component';
import { FreelancerJobsComponent } from './Interfaces_Freelancers/freelancer-jobs/freelancer-jobs.component';

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
        
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
