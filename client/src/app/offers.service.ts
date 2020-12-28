import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class OffersService {

  private apiUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient) { }

  getOffers (type: any, page?: any) {
    const params = new HttpParams()
      .set('type', type ? type.value : 'all')
      .set('page', page ? page : 0);
    return this.http.get<any>(`${this.apiUrl}/offers`, { params });
  }

  addOffer (offerData: any) {
    return this.http.post<any>(`${this.apiUrl}/add-offer`, offerData);
  }

  getFullOffer (offerId: string) {
    const params = new HttpParams()
      .set('id', offerId);
    return this.http.get<any>(`${this.apiUrl}/offer`, { params });
  }

  removeFromWatching (offerId: string) {
    return this.http.put<any>(`${this.apiUrl}/remvoe-watching`, { id: offerId });
  }

  getWatchingCount (offerId: string) {
    const params = new HttpParams()
      .set('id', offerId);
    return this.http.get<any>(`${this.apiUrl}/watching`, { params });
  }

  deleteOffer (offerId: string) {
    const params = new HttpParams()
      .set('id', offerId);
    return this.http.delete<any>(`${this.apiUrl}/delete-offer`, { params });
  }

  verifyOffersList (type: any, page: any, offersIds: String[]) {
    return this.http.put<any>(`${this.apiUrl}/verify-offers`, { type, page, offersIds });
  }
}
