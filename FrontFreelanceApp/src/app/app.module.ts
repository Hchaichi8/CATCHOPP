import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

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
import { FormsModule } from '@angular/forms';
import { VirtualContractComponent } from './Interfaces_Client/virtual-contract/virtual-contract.component';
import { FreelancerFeedComponent } from './Interfaces_Freelancers/freelancer-feed/freelancer-feed.component';
import { FreelancerJobsComponent } from './Interfaces_Freelancers/freelancer-jobs/freelancer-jobs.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { GroupListComponent } from './interfaces_events/group-list/group-list.component';
import { GroupPageComponent } from './interfaces_events/group-page/group-page.component';
import { AdminDashboardComponent } from './interfaces_events/admin-dashboard/admin-dashboard.component';
import { EventsListComponent } from './interfaces_events/events-list/events-list.component';
import { ClubComponent } from './interfaces_events/club/club.component';
import { ClubDashboardComponent } from './interfaces_events/club-dashboard/club-dashboard.component';
import { ClubsListComponent } from './interfaces_events/clubs-list/clubs-list.component';
import { PostReactionsComponent } from './interfaces_events/post-reactions/post-reactions.component';
import { PostCommentsComponent } from './interfaces_events/post-comments/post-comments.component';
import { CommentReactionsComponent } from './interfaces_events/comment-reactions/comment-reactions.component';
import { NotificationBellComponent } from './interfaces_events/notification-bell/notification-bell.component';
import { NotificationToastComponent } from './interfaces_events/notification-toast/notification-toast.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EventDetailsComponent } from './interfaces_events/event-details/event-details.component';

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
        GroupListComponent,
        GroupPageComponent,
        AdminDashboardComponent,
        EventsListComponent,
        ClubComponent,
        ClubDashboardComponent,
        ClubsListComponent,
        PostReactionsComponent,
        PostCommentsComponent,
        CommentReactionsComponent,
        NotificationBellComponent,
        NotificationToastComponent,
        EventDetailsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
