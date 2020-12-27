import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class OffersService {

  private apiUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient) { }

  getOffers () {
    return this.http.get<any>(`${this.apiUrl}/offers`);
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
}
