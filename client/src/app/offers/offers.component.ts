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
  
  
  currentPage = 0;
  readonly offerTypes = [
    {name: 'all', value: 'all'},
    {name: 'type1', value: 'type1'},
    {name: 'type2', value: 'type2'},
    {name: 'type3', value: 'type3'}
  ];
  selectedType = this.offerTypes[0];
  private totalCount: Number = 0;
  private countUpdateInterval: any;
  private offersIntegrityVerificationInvterval: any;
  private readonly userTypes = {
    regular: 'regular',
    paying: 'paying',
    admin: 'admin'
  };
  private userType = this.userTypes.regular;
  

  constructor(private offersService: OffersService, private router: Router) { }
  
  async ngOnInit(): Promise<void> {
    await this.getOffers();
    this.verifyOffersIntegrity();
  }

  ngOnDestroy(): void {
    if (this.countUpdateInterval) {
      clearInterval(this.countUpdateInterval);
    }
    if (this.offersIntegrityVerificationInvterval) {
      clearInterval(this.offersIntegrityVerificationInvterval);
    }
    
  }

  addNew(): void {
    this.router.navigate(['/add-new']);
  }

  viewOffer(offer: any): void {
    this.viewingOffer = true;
    this.offersService.getFullOffer(offer._id).subscribe(res => {
      this.currentOffer = res;
      this.currentOffer.viewCount = this.currentOffer.viewing.length;
      this.countUpdateInterval = setInterval(() =>{
        this.updateViewingCount();
      }, 1000*15)
    }, err => {
      console.error(err);
      this.router.navigate(['/login']);
    })
  }

  back (): void {
    clearInterval(this.countUpdateInterval);
    this.offersService.removeFromWatching(this.currentOffer._id).subscribe(() => {
      this.viewingOffer = false;
    }, err =>{
      console.error(err);
      this.router.navigate(['/login']);
    })
  }
  
  isViewingOffer(): boolean {
    return this.viewingOffer;
  }

  updateViewingCount () {
    this.offersService.getWatchingCount(this.currentOffer._id).subscribe(res =>{
      this.currentOffer.viewCount = res.count;
    }, err =>{
      console.error(err);
    })
  }

  filterByType () {
    this.getOffers(this.selectedType)
  }

  async next() {
    clearInterval(this.offersIntegrityVerificationInvterval);
    this.currentPage++;
    await this.getOffers(this.selectedType, this.currentPage);
    this.verifyOffersIntegrity();
  }

  async prev() {
    clearInterval(this.offersIntegrityVerificationInvterval);
    this.currentPage--;
    await this.getOffers(this.selectedType, this.currentPage);
    this.verifyOffersIntegrity();
  }

  isNextDisabled(): Boolean {
    if (this.userType === this.userTypes.regular) {
      return this.offers.length + 3 * this.currentPage >= this.totalCount
    } else {
      return this.offers.length + 20 * this.currentPage >= this.totalCount
    }
  }

  isShowDelete() : Boolean {
    return this.userType === this.userTypes.admin 
    && this.currentOffer 
    && this.currentOffer.viewCount === 1;
  }

  delete(): void {
    if(this.userType !== this.userTypes.admin){
        this.router.navigate(['/login']);
    }
    this.offersService.deleteOffer(this.currentOffer._id).subscribe(() =>{
      clearInterval(this.countUpdateInterval);
      this.viewingOffer = false;
      this.getOffers();
      alert("offer deleted");
    }, err =>{
      console.error(err);
      if (err.status === 403) {
        this.currentOffer.viewCount++;
        alert(err.statusText);
      }
    })
  }

  private async getOffers (type? : any, page?: Number) {
    return this.offersService.getOffers(type, page).subscribe(res => {
      this.offers = res.offers;
      this.totalCount = res.count;
      this.userType = res.userType;
      return
     }, err => {
      console.error(err);
      this.router.navigate(['/login']);
     })
  }

  private verifyOffersIntegrity (){
    this.offersIntegrityVerificationInvterval = setInterval(()=>{
      if (this.offers.length > 0) {
        const type = this.selectedType;
        const page = this.currentPage;
        const offersIds = this.offers.map(offer => offer = offer._id);
        this.offersService.verifyOffersList(type, page, offersIds).subscribe(res => {
          if (!res.verified) {
            this.getOffers();
          }
        }, err => {
          console.error(err);
          this.router.navigate(['/login']);
        })
      }
    
    }, 1000*2);
  }
}
