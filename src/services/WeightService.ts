import axios from 'axios';
import type { WeightEntry } from '../models/weight-entry';

class WeightService {
  //private static readonly BASE_URL = 'https://ps11911.com';
  private static readonly BASE_URL = '';

  public getEntries() {
    return axios.get(`${WeightService.BASE_URL}/weight-tracker/server/get_weight_entries.php`);
  }

  public addEntry(entry: WeightEntry) {
    return axios.post(`${WeightService.BASE_URL}/weight-tracker/server/add_weight_entry.php`, entry);
  }
}

export default new WeightService();