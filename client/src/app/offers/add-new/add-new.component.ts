import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OffersService } from 'src/app/offers.service';

@Component({
  selector: 'app-add-new',
  templateUrl: './add-new.component.html',
  styleUrls: ['./add-new.component.scss']
})
export class AddNewComponent implements OnInit {

  constructor(private router: Router, private offersService: OffersService) { }

  ngOnInit(): void {
  }
  back() {
    this.router.navigate(['/offers']);
  }

  submit(offer: any) {
    console.log(offer);
    this.offersService.addOffer(offer).subscribe(res => {
      console.log(res);

    }, err => {
      console.log(err);
    })
  }
}
