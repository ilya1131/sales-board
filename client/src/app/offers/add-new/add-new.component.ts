import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OffersService } from 'src/app/offers.service';

@Component({
  selector: 'app-add-new',
  templateUrl: './add-new.component.html',
  styleUrls: ['./add-new.component.scss']
})
export class AddNewComponent implements OnInit {
  readonly offerTypes = [
    {name: 'type1', value: 'type1'},
    {name: 'type2', value: 'type2'},
    {name: 'type3', value: 'type3'}
  ];
  constructor(private router: Router, private offersService: OffersService) { }

  ngOnInit(): void {
  }
  back() {
    this.router.navigate(['/offers']);
  }

  submit(offer: any) {
    this.offersService.addOffer(offer).subscribe(res => {
      this.router.navigate(['/offers']);
    }, err => {
      console.error(err);
      this.router.navigate(['/login']);
    })
  }
}
