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
import { GroupListComponent } from './interfaces_events/group-list/group-list.component';
import { GroupPageComponent } from './interfaces_events/group-page/group-page.component';
import { AdminDashboardComponent } from './interfaces_events/admin-dashboard/admin-dashboard.component';
import { EventsListComponent } from './interfaces_events/events-list/events-list.component';
import { EventDetailsComponent } from './interfaces_events/event-details/event-details.component';
import { ClubComponent } from './interfaces_events/club/club.component';
import { ClubDashboardComponent } from './interfaces_events/club-dashboard/club-dashboard.component';
import { ClubsListComponent } from './interfaces_events/clubs-list/clubs-list.component';

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


 
// Events & Communities routes
{ path: 'Groups', redirectTo: 'groups', pathMatch: 'full' }, // Redirect uppercase to lowercase
{ path: 'groups', component: GroupListComponent },
{ path: 'groups/:id', component: GroupPageComponent },
{ path: 'events', component: EventsListComponent },
{ path: 'events/:id', component: EventDetailsComponent },
{ path: 'clubs', component: ClubsListComponent },
{ path: 'clubs/:id', component: ClubComponent },
{ path: 'ClubDashboard', component: ClubDashboardComponent },
{ path: 'admin/dashboard', component: AdminDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
