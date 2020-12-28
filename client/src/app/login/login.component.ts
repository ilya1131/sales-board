import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    localStorage.removeItem('token');
  }
  
  submit (loginData: any): void {
    this.auth.loginUser(loginData).subscribe(res => {
      localStorage.setItem('token', res.token);
      this.router.navigate(['/offers'])
    }, err => {
      console.error(err);
    })
  }
}
