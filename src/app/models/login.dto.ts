import { UserDto } from "./user.dto";

export interface LoginDto {
    userDto: UserDto;
    token?: string;
  }