import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OffersService } from '../offers.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {
  offers: any[] = [];
  viewingOffer = false;
  currentOffer: any;
  countUpdateInterval: any;
  constructor(private offersService: OffersService, private router: Router) { }
  
  ngOnInit(): void {
   this.offersService.getOffers().subscribe(res => {
    this.offers = res;
   }, err => {
    console.log(err);
    this.router.navigate(['/login']);
   })
  }

  ngOnDestroy(): void {
    if (this.countUpdateInterval) {
      clearInterval(this.countUpdateInterval);
    }
    
  }

  addNew(): void {
    this.router.navigate(['/add-new']);
  }

  viewOffer(offer: any): void {
    this.viewingOffer = true;
    console.log(offer);
    this.offersService.getFullOffer(offer._id).subscribe(res => {
      this.currentOffer = res;
      this.currentOffer.viewCount = this.currentOffer.viewing.length;
      this.countUpdateInterval = setInterval(() =>{
        this.updateViewingCount();
      }, 1000*15)
    }, err => {
      console.log(err);
    })
  }

  back (): void {
    clearInterval(this.countUpdateInterval);
    this.offersService.removeFromWatching(this.currentOffer._id).subscribe(() => {
      this.viewingOffer = false;
    }, err =>{
      console.log(err);
      this.router.navigate(['/login']);
    })
  }
  
  isViewingOffer(): boolean {
    return this.viewingOffer;
  }

  updateViewingCount () {
    this.offersService.getWatchingCount(this.currentOffer._id).subscribe(res =>{
      console.log(res);
      this.currentOffer.viewCount = res.count;
    }, err =>{
      console.log(err);
    })
  }
}
