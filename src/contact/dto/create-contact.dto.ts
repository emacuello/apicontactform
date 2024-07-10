import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsString({ message: 'El email debe ser una cadena de texto' })
  @IsEmail({}, { message: 'El email no es valido' })
  email: string;
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  message: string;
  @IsOptional()
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  subject: string;
}
