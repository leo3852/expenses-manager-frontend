import { CurrencyId } from "./currency-id.enum";
import { CurrencyDto } from "./currency.dto";

export interface UserDto {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    currencyId?: CurrencyId;
    currency?: CurrencyDto;
  }