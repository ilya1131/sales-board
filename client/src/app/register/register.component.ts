import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  // registerData = {}
  constructor(private auth: AuthService) { }

  ngOnInit(): void {
  }

  submit(registerData: any): void {
    console.log(registerData);
    this.auth.registerUser(registerData).subscribe(res => {
      console.log(res);
      localStorage.setItem('token', res.token);
    }, err => {
      console.log(err);
    });
  }

}
