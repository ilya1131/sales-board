import { Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor (private auth: AuthService){}
  
  ngOnChanges () {
    this.checkIsLogedIn();
  }

  checkIsLogedIn (): boolean {
    return this.auth.isLogedIn();
  }

  logout (): void {
    this.auth.logout().subscribe((res) => {
      console.log('logged out');
      
    });
  }
}
