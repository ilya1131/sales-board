import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  constructor(private auth: AuthService, private router: Router) { }

  submit(registerData: any): void {
    this.auth.registerUser(registerData).subscribe(() => {
      this.router.navigate(['/login']);
    }, err => {
      console.error(err);
    });
  }

}
